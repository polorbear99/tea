import { Injectable } from '@nestjs/common';
import { getSupabaseClient } from '@/storage/database/supabase-client';

@Injectable()
export class OrdersService {
  private get client() {
    return getSupabaseClient();
  }

  async create(body: {
    customer_id: string;
    items: Array<{ product_id: string; sku_id: string; quantity: number }>;
    address_name?: string;
    address_phone?: string;
    address_detail?: string;
    remark?: string;
  }) {
    const { items, customer_id, address_name, address_phone, address_detail, remark } = body;

    // Get SKU details and validate stock
    const skuIds = items.map(i => i.sku_id);
    const { data: skus, error: skuError } = await this.client
      .from('product_skus')
      .select('*, products(name, cover_image, status)')
      .in('id', skuIds);
    if (skuError) throw new Error(`查询SKU失败: ${skuError.message}`);
    if (!skus || skus.length !== items.length) {
      throw new Error('部分商品规格不存在');
    }

    // Validate stock and build order items
    let totalAmount = 0;
    const orderItems = items.map(item => {
      const sku = skus.find(s => s.id === item.sku_id);
      if (!sku) throw new Error(`SKU ${item.sku_id} 不存在`);
      if (sku.stock < item.quantity) {
        throw new Error(`"${(sku.products as any)?.name || '商品'}" ${sku.spec_name} 库存不足（剩余${sku.stock}件）`);
      }
      const price = parseFloat(sku.price);
      const subtotal = price * item.quantity;
      totalAmount += subtotal;
      return {
        product_id: item.product_id,
        sku_id: item.sku_id,
        product_name: (sku.products as any)?.name || '',
        sku_name: sku.spec_name,
        cover_image: (sku.products as any)?.cover_image || '',
        price: price.toFixed(2),
        quantity: item.quantity,
        subtotal: subtotal.toFixed(2),
      };
    });

    // Generate order number
    const now = new Date();
    const orderNo = `T${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;

    // Create order
    const { data: order, error: orderError } = await this.client
      .from('orders')
      .insert({
        order_no: orderNo,
        customer_id,
        total_amount: totalAmount.toFixed(2),
        address_name,
        address_phone,
        address_detail,
        remark,
        status: 'pending',
      })
      .select()
      .single();
    if (orderError) throw new Error(`创建订单失败: ${orderError.message}`);
    if (!order) throw new Error('创建订单失败');

    // Create order items
    const { error: itemsError } = await this.client
      .from('order_items')
      .insert(orderItems.map(i => ({ ...i, order_id: order.id })));
    if (itemsError) throw new Error(`创建订单明细失败: ${itemsError.message}`);

    // Deduct stock
    for (const item of items) {
      const sku = skus.find(s => s.id === item.sku_id);
      if (sku) {
        await this.client
          .from('product_skus')
          .update({ stock: sku.stock - item.quantity })
          .eq('id', item.sku_id);
      }
    }

    // Record business event
    await this.client.from('business_events').insert({
      event_type: 'ORDER_CREATED',
      entity_type: 'order',
      entity_id: order.id,
      payload: { order_no: orderNo, total_amount: totalAmount.toFixed(2), item_count: items.length },
    });

    return order;
  }

  async findByCustomer(customerId: string, status?: string, page = 1, pageSize = 20) {
    let qb = this.client
      .from('orders')
      .select('*', { count: 'exact' })
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (status) {
      qb = qb.eq('status', status);
    }

    const { data, error, count } = await qb;
    if (error) throw new Error(`查询订单失败: ${error.message}`);

    // Get items for each order
    const orders = data || [];
    const orderIds = orders.map(o => o.id);
    if (orderIds.length > 0) {
      const { data: allItems, error: itemsError } = await this.client
        .from('order_items')
        .select('*')
        .in('order_id', orderIds);
      if (itemsError) throw new Error(`查询订单明细失败: ${itemsError.message}`);
      const itemsMap = new Map<string, any[]>();
      (allItems || []).forEach(item => {
        if (!itemsMap.has(item.order_id)) itemsMap.set(item.order_id, []);
        itemsMap.get(item.order_id)!.push(item);
      });
      return {
        items: orders.map(o => ({ ...o, items: itemsMap.get(o.id) || [] })),
        total: count || 0,
        page,
        page_size: pageSize,
      };
    }

    return { items: orders.map(o => ({ ...o, items: [] })), total: count || 0, page, page_size: pageSize };
  }

  async findById(id: string) {
    const { data: order, error } = await this.client
      .from('orders')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw new Error(`查询订单失败: ${error.message}`);
    if (!order) return null;

    const { data: items, error: itemsError } = await this.client
      .from('order_items')
      .select('*')
      .eq('order_id', id);
    if (itemsError) throw new Error(`查询订单明细失败: ${itemsError.message}`);

    return { ...order, items: items || [] };
  }
}

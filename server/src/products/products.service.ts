import { Injectable } from '@nestjs/common';
import { getSupabaseClient } from '@/storage/database/supabase-client';

@Injectable()
export class ProductsService {
  private get client() {
    return getSupabaseClient();
  }

  async findAll(query: {
    category_id?: string;
    tea_type?: string;
    keyword?: string;
    status?: string;
    page?: number;
    page_size?: number;
  }) {
    const { category_id, tea_type, keyword, status = 'published', page = 1, page_size = 20 } = query;
    let qb = this.client
      .from('products')
      .select('*, product_categories(name)', { count: 'exact' })
      .eq('status', status)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
      .range((page - 1) * page_size, page * page_size - 1);

    if (category_id) {
      qb = qb.eq('category_id', category_id);
    }
    if (tea_type) {
      qb = qb.eq('tea_type', tea_type);
    }
    if (keyword) {
      qb = qb.or(`name.ilike.%${keyword}%,variety.ilike.%${keyword}%,origin.ilike.%${keyword}%`);
    }

    const { data, error, count } = await qb;
    if (error) throw new Error(`查询商品列表失败: ${error.message}`);
    return { items: data || [], total: count || 0, page, page_size };
  }

  async findById(id: string) {
    const { data: product, error } = await this.client
      .from('products')
      .select('*, product_categories(name)')
      .eq('id', id)
      .maybeSingle();
    if (error) throw new Error(`查询商品失败: ${error.message}`);
    if (!product) return null;

    const [{ data: skus }, { data: brewing }, { data: media }] = await Promise.all([
      this.client.from('product_skus').select('*').eq('product_id', id).order('created_at'),
      this.client.from('product_brewing').select('*').eq('product_id', id).maybeSingle(),
      this.client.from('product_media').select('*').eq('product_id', id).order('sort_order'),
    ]);
    if (skus === null) throw new Error('查询SKU失败');
    if (media === null) throw new Error('查询商品图片失败');

    return { ...product, skus: skus || [], brewing, media: media || [] };
  }

  async findByBizId(bizId: string) {
    const { data: product, error } = await this.client
      .from('products')
      .select('id')
      .eq('biz_id', bizId)
      .maybeSingle();
    if (error) throw new Error(`查询商品失败: ${error.message}`);
    if (!product) return null;
    return this.findById(product.id);
  }

  async findByQrCode(code: string) {
    const { data: qr, error: qrError } = await this.client
      .from('product_qrcodes')
      .select('product_id')
      .eq('code', code)
      .maybeSingle();
    if (qrError) throw new Error(`查询二维码失败: ${qrError.message}`);
    if (!qr) return null;

    // Increment scan count
    const { data: qrData } = await this.client.from('product_qrcodes').select('scan_count').eq('code', code).single();
    const currentCount = qrData?.scan_count ?? 0;
    await this.client
      .from('product_qrcodes')
      .update({ scan_count: currentCount + 1 })
      .eq('code', code);

    return this.findById(qr.product_id);
  }

  async getRecommendations(limit = 6) {
    const { data, error } = await this.client
      .from('products')
      .select('id, name, tea_type, cover_image, selling_points, product_skus(price)')
      .eq('status', 'published')
      .order('sort_order', { ascending: true })
      .limit(limit);
    if (error) throw new Error(`查询推荐商品失败: ${error.message}`);
    return data || [];
  }
}

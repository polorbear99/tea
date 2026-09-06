import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Network } from '@/network'

interface Order {
  id: string
  order_no: string
  status: string
  total_amount: number
  address_name: string
  address_phone: string
  address_detail: string
  created_at: string
  order_items: Array<{
    product_name: string
    sku_name: string
    price: number
    quantity: number
    cover_image: string
  }>
}

const statusMap: Record<string, { label: string; color: string }> = {
  pending: { label: '待支付', color: 'bg-amber-100 text-amber-700' },
  paid: { label: '待发货', color: 'bg-blue-100 text-blue-700' },
  shipped: { label: '已发货', color: 'bg-teal-100 text-teal-700' },
  completed: { label: '已完成', color: 'bg-green-100 text-green-700' },
  cancelled: { label: '已取消', color: 'bg-gray-100 text-gray-500' },
  refunded: { label: '已退款', color: 'bg-rose-100 text-rose-700' },
}

export default function OrderList() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      const customerId = Taro.getStorageSync('customer_id')
      if (!customerId) {
        setLoading(false)
        return
      }
      const res = await Network.request({ url: `/api/orders?customer_id=${customerId}` })
      console.log('Orders:', res.data)
      setOrders(res.data || [])
    } catch (err) {
      console.error('Failed to load orders:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusInfo = (status: string) => {
    return statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-500' }
  }

  return (
    <View className="flex flex-col h-full bg-amber-50">
      <ScrollView scrollY className="flex-1">
        <View className="px-4 py-4">
          {loading ? (
            <View className="flex justify-center py-12">
              <Text className="text-gray-400">加载中...</Text>
            </View>
          ) : orders.length === 0 ? (
            <View className="flex flex-col items-center py-16">
              <Text className="text-gray-400 text-base mb-2">暂无订单</Text>
              <Text className="text-gray-300 text-sm">去挑选心仪的茶品吧</Text>
            </View>
          ) : (
            <View className="flex flex-col gap-4">
              {orders.map(order => {
                const statusInfo = getStatusInfo(order.status)
                return (
                  <Card key={order.id} className="border-0 shadow-sm">
                    <CardContent className="p-4">
                      {/* Order Header */}
                      <View className="flex items-center justify-between mb-3">
                        <Text className="text-xs text-gray-400">订单号：{order.order_no}</Text>
                        <Badge className={statusInfo.color}>
                          {statusInfo.label}
                        </Badge>
                      </View>

                      {/* Order Items */}
                      {order.order_items?.map((item, idx) => (
                        <View key={idx}>
                          <View className="flex items-center justify-between py-2">
                            <View className="flex-1">
                              <Text className="block text-sm font-medium text-gray-800">{item.product_name}</Text>
                              <Text className="block text-xs text-gray-500">{item.sku_name} x{item.quantity}</Text>
                            </View>
                            <Text className="text-sm font-semibold text-gray-700">￥{item.price}</Text>
                          </View>
                          {idx < order.order_items.length - 1 && <Separator className="my-1" />}
                        </View>
                      ))}

                      <Separator className="my-2" />

                      {/* Order Footer */}
                      <View className="flex items-center justify-between">
                        <Text className="text-xs text-gray-400">
                          {new Date(order.created_at).toLocaleDateString()}
                        </Text>
                        <View>
                          <Text className="text-xs text-gray-500">合计：</Text>
                          <Text className="text-base font-bold text-primary">￥{order.total_amount}</Text>
                        </View>
                      </View>

                      {/* Address */}
                      <View className="mt-2 bg-gray-50 rounded-lg p-2">
                        <Text className="text-xs text-gray-500">
                          {order.address_name} {order.address_phone} | {order.address_detail}
                        </Text>
                      </View>
                    </CardContent>
                  </Card>
                )
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  )
}

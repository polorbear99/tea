import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { User, MapPin, Phone, ChevronRight } from 'lucide-react-taro'
import { Network } from '@/network'

interface CustomerInfo {
  id: string
  nickname: string
  avatar_url: string | null
}

export default function Profile() {
  const [customer, setCustomer] = useState<CustomerInfo | null>(null)

  useEffect(() => {
    // Try to load customer from local storage
    const savedId = Taro.getStorageSync('customer_id')
    if (savedId) {
      loadCustomer(savedId)
    } else {
      // Auto-login for demo
      autoLogin()
    }
  }, [])

  const autoLogin = async () => {
    try {
      const res = await Network.request({
        url: '/api/customers/login',
        method: 'POST',
        data: {
          open_id: `demo-${Date.now()}`,
          nickname: '茶友',
        },
      })
      console.log('Auto login:', res.data)
      if (res.data?.id) {
        Taro.setStorageSync('customer_id', res.data.id)
        setCustomer(res.data)
      }
    } catch (err) {
      console.error('Auto login failed:', err)
    }
  }

  const loadCustomer = async (id: string) => {
    try {
      const res = await Network.request({ url: `/api/customers?id=${id}` })
      console.log('Customer loaded:', res.data)
      if (res.data) setCustomer(res.data)
    } catch (err) {
      console.error('Failed to load customer:', err)
    }
  }

  // const goToOrders = () => {
  //   Taro.navigateTo({ url: '/pages/order-list/index' })
  // } // 暂时屏蔽

  const goToScan = () => {
    Taro.navigateTo({ url: '/pages/scan-tea/index' })
  }

  const menuItems = [
    // { icon: ShoppingBag, label: '我的订单', onClick: goToOrders }, // 暂时屏蔽
    { icon: MapPin, label: '扫码识茶', onClick: goToScan },
    { icon: Phone, label: '联系客服', onClick: () => { Taro.makePhoneCall({ phoneNumber: '4008886666' }).catch(() => {}) } },
    { icon: Phone, label: '关于我们', onClick: () => { Taro.showModal({ title: '茗香茶庄', content: '传承百年制茶工艺，甄选中国名茶核心产区好茶。', showCancel: false }) } },
  ]

  return (
    <View className="flex flex-col h-full bg-amber-50">
      {/* Profile Header */}
      <View className="bg-primary px-5 pt-8 pb-6 rounded-b-3xl">
        <View className="flex items-center gap-4">
          <View className="w-16 h-16 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
            {customer?.avatar_url ? (
              <Image src={customer.avatar_url} className="w-16 h-16 rounded-full" mode="aspectFill" />
            ) : (
              <User size={32} color="#fff" />
            )}
          </View>
          <View>
            <Text className="block text-xl font-bold text-white">{customer?.nickname || '茶友'}</Text>
            <Text className="block text-sm text-green-100 mt-1">欢迎来到茗香茶庄</Text>
          </View>
        </View>
      </View>

      {/* Order Stats - 暂时屏蔽 */}
      {/* <View className="px-4 -mt-4">
        <Card className="border-0 shadow-md" onClick={goToOrders}>
          <CardContent className="p-4 flex items-center justify-between">
            <View className="flex items-center gap-2">
              <ShoppingBag size={20} color="#4a7c59" />
              <Text className="block text-base font-semibold text-gray-800">我的订单</Text>
            </View>
            <ChevronRight size={18} color="#999" />
          </CardContent>
        </Card>
      </View> */}

      {/* Menu */}
      <View className="px-4 mt-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            {menuItems.map((item, index) => (
              <View key={index}>
                <View className="flex items-center gap-3 px-4 py-4" onClick={item.onClick}>
                  <item.icon size={20} color="#666" />
                  <Text className="flex-1 text-sm text-gray-700">{item.label}</Text>
                  <ChevronRight size={16} color="#ccc" />
                </View>
                {index < menuItems.length - 1 && (
                  <View className="px-4">
                    <Separator />
                  </View>
                )}
              </View>
            ))}
          </CardContent>
        </Card>
      </View>

      {/* Version */}
      <View className="flex-1" />
      <View className="pb-8 pt-4">
        <Text className="block text-center text-xs text-gray-400">茗香茶庄 v1.0.0</Text>
      </View>
    </View>
  )
}

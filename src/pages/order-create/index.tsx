import { View, Text } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Network } from '@/network'

interface SkuInfo {
  id: string
  spec_name: string
  price: number
  stock: number
  product_name: string
  cover_image: string
}

export default function OrderCreate() {
  const router = useRouter()
  const productId = router.params.product_id || ''
  const skuId = router.params.sku_id || ''
  const [skuInfo, setSkuInfo] = useState<SkuInfo | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [remark, setRemark] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadSkuInfo()
  }, [skuId])

  const loadSkuInfo = async () => {
    try {
      // Get product detail to find SKU info
      const res = await Network.request({ url: `/api/products/${productId}` })
      const product = res.data
      if (product) {
        const sku = product.product_skus?.find((s: any) => s.id === skuId)
        if (sku) {
          setSkuInfo({
            id: sku.id,
            spec_name: sku.spec_name,
            price: sku.price,
            stock: sku.stock,
            product_name: product.name,
            cover_image: product.cover_image,
          })
        }
      }
    } catch (err) {
      console.error('Failed to load SKU info:', err)
    }
  }

  const submitOrder = async () => {
    if (!name.trim()) { Taro.showToast({ title: '请输入收货人姓名', icon: 'none' }); return }
    if (!phone.trim()) { Taro.showToast({ title: '请输入联系电话', icon: 'none' }); return }
    if (!address.trim()) { Taro.showToast({ title: '请输入收货地址', icon: 'none' }); return }
    if (!skuInfo) { Taro.showToast({ title: '商品信息加载失败', icon: 'none' }); return }

    setSubmitting(true)
    try {
      // Get customer ID
      let customerId = Taro.getStorageSync('customer_id')
      if (!customerId) {
        const loginRes = await Network.request({
          url: '/api/customers/login',
          method: 'POST',
          data: { open_id: `order-${Date.now()}`, nickname: name },
        })
        customerId = loginRes.data?.id
        if (customerId) Taro.setStorageSync('customer_id', customerId)
      }

      const res = await Network.request({
        url: '/api/orders',
        method: 'POST',
        data: {
          customer_id: customerId,
          items: [{ product_id: productId, sku_id: skuId, quantity }],
          address_name: name,
          address_phone: phone,
          address_detail: address,
          remark,
        },
      })
      console.log('Order created:', res.data)

      if (res.data?.id) {
        Taro.showToast({ title: '下单成功', icon: 'success' })
        setTimeout(() => {
          Taro.redirectTo({ url: '/pages/order-list/index' })
        }, 1500)
      }
    } catch (err) {
      console.error('Order creation failed:', err)
      Taro.showToast({ title: '下单失败，请重试', icon: 'none' })
    } finally {
      setSubmitting(false)
    }
  }

  const totalPrice = skuInfo ? (skuInfo.price * quantity).toFixed(2) : '0.00'

  return (
    <View className="flex flex-col h-full bg-amber-50">
      <View className="flex-1 px-4 py-4">
        {/* Product Info */}
        <Card className="border-0 shadow-sm mb-4">
          <CardContent className="p-4 flex gap-3">
            <View className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
              <Text className="text-xs text-gray-400">{skuInfo?.product_name || '商品'}</Text>
            </View>
            <View className="flex-1">
              <Text className="block text-base font-semibold text-gray-800">{skuInfo?.product_name || '加载中...'}</Text>
              <Text className="block text-sm text-gray-500 mt-1">{skuInfo?.spec_name}</Text>
              <Text className="block text-base font-bold text-primary mt-1">￥{skuInfo?.price || 0}</Text>
            </View>
          </CardContent>
        </Card>

        {/* Quantity */}
        <Card className="border-0 shadow-sm mb-4">
          <CardContent className="p-4 flex items-center justify-between">
            <Text className="text-sm text-gray-700">购买数量</Text>
            <View className="flex items-center gap-3">
              <View
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Text className="text-lg text-gray-600">-</Text>
              </View>
              <Text className="text-base font-semibold w-8 text-center">{quantity}</Text>
              <View
                className="w-8 h-8 rounded-full bg-primary flex items-center justify-center"
                onClick={() => setQuantity(Math.min(skuInfo?.stock || 99, quantity + 1))}
              >
                <Text className="text-lg text-white">+</Text>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* Address Info */}
        <Card className="border-0 shadow-sm mb-4">
          <CardContent className="p-4 flex flex-col gap-3">
            <Text className="block text-base font-semibold text-gray-800">收货信息</Text>
            <View className="bg-gray-50 rounded-xl px-4 py-3">
              <Input className="w-full bg-transparent text-sm" placeholder="收货人姓名" value={name} onInput={(e) => setName(e.detail.value)} />
            </View>
            <View className="bg-gray-50 rounded-xl px-4 py-3">
              <Input className="w-full bg-transparent text-sm" placeholder="联系电话" type="number" value={phone} onInput={(e) => setPhone(e.detail.value)} />
            </View>
            <View className="bg-gray-50 rounded-xl px-4 py-3">
              <Textarea className="w-full bg-transparent text-sm" placeholder="详细收货地址" value={address} onInput={(e) => setAddress(e.detail.value)} style={{ minHeight: '60px' }} />
            </View>
            <View className="bg-gray-50 rounded-xl px-4 py-3">
              <Input className="w-full bg-transparent text-sm" placeholder="备注（选填）" value={remark} onInput={(e) => setRemark(e.detail.value)} />
            </View>
          </CardContent>
        </Card>
      </View>

      {/* Bottom Bar */}
      <View className="bg-white border-t border-gray-100 px-4 py-3 flex items-center justify-between" style={{ paddingBottom: 'calc(12px + env(safe-area-inset-bottom))' }}>
        <View>
          <Text className="text-xs text-gray-500">合计：</Text>
          <Text className="text-xl font-bold text-primary">￥{totalPrice}</Text>
        </View>
        <Button
          className="bg-primary text-white px-8"
          onClick={submitOrder}
          disabled={submitting}
        >
          {submitting ? '提交中...' : '提交订单'}
        </Button>
      </View>
    </View>
  )
}

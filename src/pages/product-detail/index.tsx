import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, Coffee } from 'lucide-react-taro'
import { Network } from '@/network'

interface ProductDetail {
  id: string
  name: string
  tea_type: string
  variety: string
  origin: string
  year: string
  craft: string
  aroma: string
  taste: string
  strength: number
  bitterness: number
  aroma_intensity: number
  beginner_friendly: number
  scenes: string
  recommended_for: string
  selling_points: string
  description: string
  cover_image: string
  product_skus: Array<{ id: string; spec_name: string; price: number; stock: number }>
  product_brewing: Array<{ teaware: string; tea_amount: string; water_amount: string; water_temp: string; brew_time: string; recommended_infusions: string; tips: string }>
}

export default function ProductDetail() {
  const router = useRouter()
  const productId = router.params.id || ''
  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [selectedSku, setSelectedSku] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProduct()
  }, [productId])

  const loadProduct = async () => {
    try {
      const res = await Network.request({ url: `/api/products/${productId}` })
      console.log('Product detail:', res.data)
      setProduct(res.data)
      if (res.data?.product_skus?.length > 0) {
        setSelectedSku(res.data.product_skus[0].id)
      }
    } catch (err) {
      console.error('Failed to load product:', err)
      Taro.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  // const goToOrder = () => {
  //   if (!selectedSku) {
  //     Taro.showToast({ title: '请选择规格', icon: 'none' })
  //     return
  //   }
  //   Taro.navigateTo({ url: `/pages/order-create/index?product_id=${productId}&sku_id=${selectedSku}` })
  // } // 暂时屏蔽

  const goToBrewing = () => {
    Taro.navigateTo({ url: `/pages/ai-chat/index?type=brewing&product_id=${productId}` })
  }

  if (loading) {
    return (
      <View className="flex items-center justify-center h-full">
        <Text className="text-gray-400">加载中...</Text>
      </View>
    )
  }

  if (!product) {
    return (
      <View className="flex items-center justify-center h-full">
        <Text className="text-gray-400">商品不存在</Text>
      </View>
    )
  }

  const selectedSkuData = product.product_skus?.find(s => s.id === selectedSku)
  const brewing = product.product_brewing?.[0]

  return (
    <View className="flex flex-col h-full bg-amber-50">
      <ScrollView scrollY className="flex-1">
        {/* Cover Image */}
        <Image src={product.cover_image} className="w-full h-72" mode="aspectFill" />

        {/* Basic Info */}
        <View className="px-4 pt-4 pb-2 bg-white">
          <View className="flex items-start justify-between">
            <View className="flex-1">
              <Text className="block text-xl font-bold text-gray-800">{product.name}</Text>
              <View className="flex gap-2 mt-2">
                <Badge variant="secondary">{product.tea_type}</Badge>
                {product.variety && <Badge variant="outline">{product.variety}</Badge>}
              </View>
            </View>
            <View className="text-right">
              <Text className="block text-2xl font-bold text-primary">
                ￥{selectedSkuData?.price || 0}
              </Text>
            </View>
          </View>
          <Text className="block text-sm text-gray-500 mt-2">{product.selling_points}</Text>
        </View>

        {/* SKU Selection */}
        <View className="px-4 py-3 bg-white mt-2">
          <Text className="block text-base font-semibold text-gray-800 mb-2">选择规格</Text>
          <View className="flex flex-wrap gap-2">
            {product.product_skus?.map(sku => (
              <View
                key={sku.id}
                className={`px-4 py-2 rounded-lg text-sm ${selectedSku === sku.id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'}`}
                onClick={() => setSelectedSku(sku.id)}
              >
                <Text>{sku.spec_name}</Text>
                <Text className="ml-2 text-xs">￥{sku.price}</Text>
              </View>
            ))}
          </View>
          {selectedSkuData && (
            <Text className="block text-xs text-gray-400 mt-2">
              库存：{selectedSkuData.stock}件
            </Text>
          )}
        </View>

        {/* Tea Characteristics */}
        <View className="px-4 py-3 bg-white mt-2">
          <Text className="block text-base font-semibold text-gray-800 mb-3">茶品特征</Text>
          <View className="grid grid-cols-2 gap-3">
            <View className="bg-amber-50 rounded-lg p-3">
              <Text className="block text-xs text-gray-500">产地</Text>
              <Text className="block text-sm font-medium text-gray-800">{product.origin}</Text>
            </View>
            <View className="bg-amber-50 rounded-lg p-3">
              <Text className="block text-xs text-gray-500">年份</Text>
              <Text className="block text-sm font-medium text-gray-800">{product.year}</Text>
            </View>
            <View className="bg-amber-50 rounded-lg p-3">
              <Text className="block text-xs text-gray-500">工艺</Text>
              <Text className="block text-sm font-medium text-gray-800">{product.craft}</Text>
            </View>
            <View className="bg-amber-50 rounded-lg p-3">
              <Text className="block text-xs text-gray-500">香型</Text>
              <Text className="block text-sm font-medium text-gray-800">{product.aroma}</Text>
            </View>
            <View className="bg-amber-50 rounded-lg p-3">
              <Text className="block text-xs text-gray-500">滋味</Text>
              <Text className="block text-sm font-medium text-gray-800">{product.taste}</Text>
            </View>
            <View className="bg-amber-50 rounded-lg p-3">
              <Text className="block text-xs text-gray-500">适合场景</Text>
              <Text className="block text-sm font-medium text-gray-800 truncate">{product.scenes}</Text>
            </View>
          </View>
        </View>

        {/* Brewing Info */}
        {brewing && (
          <View className="px-4 py-3 bg-white mt-2">
            <View className="flex items-center justify-between mb-3">
              <Text className="block text-base font-semibold text-gray-800">冲泡指南</Text>
              <View className="flex items-center" onClick={goToBrewing}>
                <Coffee size={14} color="#4a7c59" />
                <Text className="text-xs text-primary ml-1">AI冲泡指导</Text>
              </View>
            </View>
            <View className="grid grid-cols-2 gap-2">
              <View className="bg-teal-50 rounded-lg p-2">
                <Text className="block text-xs text-gray-500">茶具</Text>
                <Text className="block text-sm text-gray-800">{brewing.teaware}</Text>
              </View>
              <View className="bg-teal-50 rounded-lg p-2">
                <Text className="block text-xs text-gray-500">投茶量</Text>
                <Text className="block text-sm text-gray-800">{brewing.tea_amount}</Text>
              </View>
              <View className="bg-teal-50 rounded-lg p-2">
                <Text className="block text-xs text-gray-500">水温</Text>
                <Text className="block text-sm text-gray-800">{brewing.water_temp}</Text>
              </View>
              <View className="bg-teal-50 rounded-lg p-2">
                <Text className="block text-xs text-gray-500">冲泡时间</Text>
                <Text className="block text-sm text-gray-800">{brewing.brew_time}</Text>
              </View>
            </View>
            {brewing.tips && (
              <Text className="block text-xs text-gray-500 mt-2 bg-teal-50 rounded-lg p-2">
                提示：{brewing.tips}
              </Text>
            )}
          </View>
        )}

        {/* Description */}
        <View className="px-4 py-3 bg-white mt-2 mb-4">
          <Text className="block text-base font-semibold text-gray-800 mb-2">商品详情</Text>
          <Text className="block text-sm text-gray-600 leading-relaxed">{product.description}</Text>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View className="bg-white border-t border-gray-100 px-4 py-3 flex gap-3" style={{ paddingBottom: 'calc(12px + env(safe-area-inset-bottom))' }}>
        <Button
          variant="outline"
          className="flex-1 border-primary text-primary"
          onClick={goToBrewing}
        >
          <Coffee size={16} color="#4a7c59" />
          <Text className="ml-1 text-sm">冲泡指导</Text>
        </Button>
        <Button
          className="flex-1 bg-primary text-white"
          onClick={() => {
            Taro.showToast({ title: '购买功能暂未开放', icon: 'none' })
          }}
        >
          <ShoppingCart size={16} color="#fff" />
          <Text className="ml-1 text-sm">敬请期待</Text>
        </Button>
      </View>
    </View>
  )
}

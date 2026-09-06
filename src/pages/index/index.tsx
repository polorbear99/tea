import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Leaf, MessageCircle, Scan, Coffee, ChevronRight } from 'lucide-react-taro'
import { Network } from '@/network'

interface Product {
  id: string
  name: string
  tea_type: string
  cover_image: string
  selling_points: string
  product_skus: Array<{ price: number }>
}

interface ShopConfig {
  brand_name: string
  shop_intro: string
  ai_advisor_name: string
}

export default function Index() {
  const [products, setProducts] = useState<Product[]>([])
  const [recommendations, setRecommendations] = useState<Product[]>([])
  const [shopConfig, setShopConfig] = useState<ShopConfig>({ brand_name: '茗香茶庄', shop_intro: '', ai_advisor_name: '茶小茗' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [productsRes, recsRes, configRes] = await Promise.all([
        Network.request({ url: '/api/products?limit=6' }),
        Network.request({ url: '/api/products/recommendations' }),
        Network.request({ url: '/api/shop/config' }),
      ])
      console.log('Products:', productsRes.data)
      console.log('Recommendations:', recsRes.data)
      console.log('Config:', configRes.data)
      setProducts(productsRes.data?.items || productsRes.data || [])
      setRecommendations(recsRes.data || [])
      setShopConfig(configRes.data || { brand_name: '茗香茶庄', shop_intro: '', ai_advisor_name: '茶小茗' })
    } catch (err) {
      console.error('Failed to load data:', err)
    } finally {
      setLoading(false)
    }
  }

  const goToProduct = (id: string) => {
    Taro.navigateTo({ url: `/pages/product-detail/index?id=${id}` })
  }

  const goToAiChat = () => {
    Taro.switchTab({ url: '/pages/ai-chat/index' })
  }

  const goToScan = () => {
    Taro.navigateTo({ url: '/pages/scan-tea/index' })
  }

  const goToProducts = () => {
    Taro.switchTab({ url: '/pages/products/index' })
  }

  const getMinPrice = (skus: Array<{ price: number }>) => {
    if (!skus || skus.length === 0) return 0
    return Math.min(...skus.map(s => s.price))
  }

  return (
    <ScrollView scrollY className="h-full bg-amber-50">
      {/* Header Banner */}
      <View className="bg-primary px-5 pt-6 pb-8 rounded-b-3xl">
        <Text className="block text-2xl font-bold text-white mb-1">{shopConfig.brand_name}</Text>
        <Text className="block text-sm text-green-100 mb-4">{shopConfig.shop_intro || '甄选中国名茶核心产区好茶'}</Text>
        <View className="flex gap-3">
          <View className="flex-1 bg-white bg-opacity-20 rounded-xl px-3 py-2">
            <Text className="block text-xs text-green-100">AI茶艺顾问</Text>
            <Text className="block text-sm font-semibold text-white">{shopConfig.ai_advisor_name}</Text>
          </View>
          <View className="flex-1 bg-white bg-opacity-20 rounded-xl px-3 py-2">
            <Text className="block text-xs text-green-100">精选茶品</Text>
            <Text className="block text-sm font-semibold text-white">{products.length}款在售</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View className="px-4 -mt-4">
        <Card className="shadow-md border-0">
          <CardContent className="p-4">
            <View className="flex justify-between">
              <View className="flex flex-col items-center" onClick={goToAiChat}>
                <View className="w-12 h-12 rounded-full bg-primary bg-opacity-10 flex items-center justify-center mb-2">
                  <MessageCircle size={24} color="#4a7c59" />
                </View>
                <Text className="block text-xs text-gray-700">AI问茶</Text>
              </View>
              <View className="flex flex-col items-center" onClick={goToAiChat}>
                <View className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-2">
                  <Coffee size={24} color="#d97706" />
                </View>
                <Text className="block text-xs text-gray-700">AI选茶</Text>
              </View>
              <View className="flex flex-col items-center" onClick={goToScan}>
                <View className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center mb-2">
                  <Scan size={24} color="#0d9488" />
                </View>
                <Text className="block text-xs text-gray-700">扫码识茶</Text>
              </View>
              <View className="flex flex-col items-center" onClick={goToProducts}>
                <View className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center mb-2">
                  <Leaf size={24} color="#e11d48" />
                </View>
                <Text className="block text-xs text-gray-700">全部茶品</Text>
              </View>
            </View>
          </CardContent>
        </Card>
      </View>

      {/* Recommended */}
      <View className="px-4 mt-6">
        <View className="flex items-center justify-between mb-3">
          <View className="flex items-center gap-2">
            <Leaf size={18} color="#4a7c59" />
            <Text className="block text-lg font-bold text-gray-800">推荐茶品</Text>
          </View>
          <View className="flex items-center" onClick={goToProducts}>
            <Text className="text-sm text-gray-500">查看全部</Text>
            <ChevronRight size={16} color="#999" />
          </View>
        </View>
        {loading ? (
          <View className="flex justify-center py-8">
            <Text className="text-gray-400">加载中...</Text>
          </View>
        ) : (
          <View className="flex gap-3 overflow-x-auto">
            {recommendations.slice(0, 4).map(product => (
              <View key={product.id} className="flex-shrink-0 w-36" onClick={() => goToProduct(product.id)}>
                <Card className="border-0 shadow-sm overflow-hidden">
                  <Image
                    src={product.cover_image}
                    className="w-full h-28 object-cover"
                    mode="aspectFill"
                  />
                  <CardContent className="p-2">
                    <Text className="block text-sm font-semibold text-gray-800 truncate">{product.name}</Text>
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {product.tea_type}
                    </Badge>
                    <Text className="block text-sm font-bold text-primary mt-1">
                      ￥{getMinPrice(product.product_skus)}起
                    </Text>
                  </CardContent>
                </Card>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* All Products */}
      <View className="px-4 mt-6 pb-6">
        <View className="flex items-center justify-between mb-3">
          <Text className="block text-lg font-bold text-gray-800">全部茶品</Text>
          <View className="flex items-center" onClick={goToProducts}>
            <Text className="text-sm text-gray-500">更多</Text>
            <ChevronRight size={16} color="#999" />
          </View>
        </View>
        <View className="flex flex-col gap-3">
          {products.slice(0, 4).map(product => (
            <Card key={product.id} className="border-0 shadow-sm" onClick={() => goToProduct(product.id)}>
              <CardContent className="p-3 flex gap-3">
                <Image
                  src={product.cover_image}
                  className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                  mode="aspectFill"
                />
                <View className="flex-1 min-w-0">
                  <Text className="block text-base font-semibold text-gray-800 truncate">{product.name}</Text>
                  <Badge variant="secondary" className="mt-1 text-xs w-fit">
                    {product.tea_type}
                  </Badge>
                  <Text className="block text-xs text-gray-500 mt-1 truncate">{product.selling_points}</Text>
                  <Text className="block text-base font-bold text-primary mt-1">
                    ￥{getMinPrice(product.product_skus)}起
                  </Text>
                </View>
              </CardContent>
            </Card>
          ))}
        </View>
      </View>

      {/* AI Banner */}
      <View className="px-4 pb-8">
        <Card className="border-0 bg-gradient-to-r from-primary to-teal-600 shadow-md" onClick={goToAiChat}>
          <CardContent className="p-4 flex items-center justify-between">
            <View>
              <Text className="block text-base font-bold text-white mb-1">有问题？问问{shopConfig.ai_advisor_name}</Text>
              <Text className="block text-xs text-green-100">AI茶艺顾问，为您解答茶知识、推荐茶品</Text>
            </View>
            <Button variant="secondary" size="sm" className="bg-white text-primary font-semibold">
              立即咨询
            </Button>
          </CardContent>
        </Card>
      </View>
    </ScrollView>
  )
}

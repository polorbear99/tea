import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react-taro'
import { Network } from '@/network'

interface Product {
  id: string
  name: string
  tea_type: string
  cover_image: string
  selling_points: string
  product_skus: Array<{ price: number }>
}

interface Category {
  id: string
  name: string
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('')
  const [searchText, setSearchText] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCategories()
    loadProducts()
  }, [])

  useEffect(() => {
    loadProducts()
  }, [activeCategory, searchText])

  const loadCategories = async () => {
    try {
      const res = await Network.request({ url: '/api/categories' })
      setCategories(res.data || [])
    } catch (err) {
      console.error('Failed to load categories:', err)
    }
  }

  const loadProducts = async () => {
    setLoading(true)
    try {
      let url = '/api/products?limit=20'
      if (activeCategory) url += `&category_id=${activeCategory}`
      if (searchText) url += `&keyword=${searchText}`
      const res = await Network.request({ url })
      console.log('Products loaded:', res.data)
      setProducts(res.data?.items || res.data || [])
    } catch (err) {
      console.error('Failed to load products:', err)
    } finally {
      setLoading(false)
    }
  }

  const goToProduct = (id: string) => {
    Taro.navigateTo({ url: `/pages/product-detail/index?id=${id}` })
  }

  const getMinPrice = (skus: Array<{ price: number }>) => {
    if (!skus || skus.length === 0) return 0
    return Math.min(...skus.map(s => s.price))
  }

  return (
    <View className="flex flex-col h-full bg-amber-50">
      {/* Search */}
      <View className="px-4 pt-3 pb-2 bg-white">
        <View className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
          <Search size={18} color="#999" />
          <Input
            className="flex-1 bg-transparent text-sm"
            placeholder="搜索茶品名称、茶类..."
            value={searchText}
            onInput={(e) => setSearchText(e.detail.value)}
          />
        </View>
      </View>

      {/* Categories */}
      <ScrollView scrollX className="bg-white border-b border-gray-100">
        <View className="flex gap-2 px-4 py-2">
          <View
            className={`px-4 py-2 rounded-full text-sm flex-shrink-0 ${!activeCategory ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}
            onClick={() => setActiveCategory('')}
          >
            <Text>全部</Text>
          </View>
          {categories.map(cat => (
            <View
              key={cat.id}
              className={`px-4 py-2 rounded-full text-sm flex-shrink-0 ${activeCategory === cat.id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              <Text>{cat.name}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Product List */}
      <ScrollView scrollY className="flex-1">
        <View className="px-4 py-3">
          {loading ? (
            <View className="flex justify-center py-12">
              <Text className="text-gray-400">加载中...</Text>
            </View>
          ) : products.length === 0 ? (
            <View className="flex flex-col items-center py-12">
              <Text className="text-gray-400 text-base">暂无茶品</Text>
            </View>
          ) : (
            <View className="flex flex-wrap gap-3">
              {products.map(product => (
                <View key={product.id} className="w-6/12" onClick={() => goToProduct(product.id)}>
                  <Card className="border-0 shadow-sm overflow-hidden">
                    <Image
                      src={product.cover_image}
                      className="w-full h-36 object-cover"
                      mode="aspectFill"
                    />
                    <CardContent className="p-3">
                      <Text className="block text-sm font-semibold text-gray-800 truncate">{product.name}</Text>
                      <Badge variant="secondary" className="mt-1 text-xs">
                        {product.tea_type}
                      </Badge>
                      <Text className="block text-xs text-gray-500 mt-1 truncate">{product.selling_points}</Text>
                      <Text className="block text-base font-bold text-primary mt-2">
                        ￥{getMinPrice(product.product_skus)}起
                      </Text>
                    </CardContent>
                  </Card>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  )
}

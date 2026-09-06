import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Scan } from 'lucide-react-taro'
import { Network } from '@/network'

export default function ScanTea() {
  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const handleScan = async () => {
    const env = Taro.getEnv()
    const isMiniApp = env === Taro.ENV_TYPE.WEAPP || env === Taro.ENV_TYPE.TT
    if (!isMiniApp) {
      Taro.showModal({
        title: '提示',
        content: '扫码功能仅在小程序中可用，请在小程序中打开。',
        showCancel: false,
      })
      return
    }

    try {
      const scanRes = await Taro.scanCode({ onlyFromCamera: false, scanType: ['qrCode', 'barCode'] })
      console.log('Scan result:', scanRes)
      const code = scanRes.result
      if (code) {
        await lookupProduct(code)
      }
    } catch (err) {
      console.error('Scan failed:', err)
    }
  }

  const lookupProduct = async (code: string) => {
    setLoading(true)
    try {
      const res = await Network.request({ url: `/api/products/qr/${encodeURIComponent(code)}` })
      console.log('QR product:', res.data)
      if (res.data) {
        setResult(`识别成功！这是「${res.data.name}」，${res.data.tea_type}，产自${res.data.origin}。${res.data.description}`)
      } else {
        setResult('未找到该二维码对应的茶品，请确认是否为茗香茶庄的商品。')
      }
    } catch {
      setResult('未找到该二维码对应的茶品，请确认是否为茗香茶庄的商品。')
    } finally {
      setLoading(false)
    }
  }

  const handleDemoScan = () => {
    lookupProduct('QR-TEA-LJ-001')
  }

  return (
    <View className="min-h-screen bg-gray-50">
      <View className="bg-primary px-6 py-8 text-white">
        <Text className="block text-2xl font-bold">扫码识茶</Text>
        <Text className="block mt-2 text-white text-opacity-80 text-sm">扫描茶品二维码，了解茶的详细信息</Text>
      </View>

      <View className="px-4 -mt-4">
        <Card>
          <CardContent className="pt-6">
            <View className="flex flex-col items-center py-8">
              <View className="w-24 h-24 rounded-full bg-primary bg-opacity-10 flex items-center justify-center mb-4">
                <Scan size={48} color="#3B6B3A" />
              </View>
              <Text className="block text-lg font-semibold text-gray-800 mb-2">扫描茶品二维码</Text>
              <Text className="block text-sm text-gray-500 text-center mb-6">
                将茶品二维码对准扫描框，即可识别茶品信息
              </Text>
              <Button onClick={handleScan} className="bg-primary w-full mb-3">
                <Text>开始扫码</Text>
              </Button>
              <Button onClick={handleDemoScan} variant="outline" className="w-full border-primary text-primary">
                <Text>演示：识别龙井茶</Text>
              </Button>
            </View>
          </CardContent>
        </Card>
      </View>

      {loading && (
        <View className="px-4 mt-4">
          <Card>
            <CardContent className="pt-6">
              <Text className="block text-center text-gray-500">识别中...</Text>
            </CardContent>
          </Card>
        </View>
      )}

      {result && !loading && (
        <View className="px-4 mt-4">
          <Card>
            <CardContent className="pt-6">
              <Text className="block text-base text-gray-700 leading-relaxed">{result}</Text>
            </CardContent>
          </Card>
        </View>
      )}
    </View>
  )
}

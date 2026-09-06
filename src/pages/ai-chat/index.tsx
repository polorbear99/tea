import { View, Text, ScrollView } from '@tarojs/components'
import { useEffect, useState, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, Sparkles } from 'lucide-react-taro'
import { Network } from '@/network'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export default function AiChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string>('')
  const scrollRef = useRef<any>(null)

  useEffect(() => {
    // Welcome message
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: '您好！我是茶小茗，茗香茶庄的AI茶艺顾问。我可以帮您解答茶知识、推荐适合您的茶品、指导冲泡方法，或者帮您识别茶叶。请问有什么可以帮您的？',
    }])
  }, [])

  const sendMessage = async () => {
    if (!inputText.trim() || loading) return

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputText.trim(),
    }
    setMessages(prev => [...prev, userMsg])
    setInputText('')
    setLoading(true)

    try {
      const res = await Network.request({
        url: '/api/ai/chat',
        method: 'POST',
        data: {
          message: userMsg.content,
          conversation_id: conversationId || undefined,
          type: 'ask_tea',
        },
      })
      console.log('AI response:', res.data)
      const reply = res.data?.reply || '抱歉，我暂时无法回答这个问题。'
      if (res.data?.conversation_id) {
        setConversationId(res.data.conversation_id)
      }
      setMessages(prev => [...prev, {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: reply,
      }])
    } catch (err) {
      console.error('AI chat error:', err)
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: '抱歉，AI服务暂时不可用，请稍后再试。',
      }])
    } finally {
      setLoading(false)
    }
  }

  const quickQuestions = [
    '推荐一款适合新手入门的茶',
    '绿茶和红茶有什么区别？',
    '怎么泡铁观音最好喝？',
    '送礼选什么茶比较好？',
  ]

  return (
    <View className="flex flex-col h-full bg-amber-50">
      {/* Chat Messages */}
      <ScrollView
        scrollY
        scrollIntoView={`msg-${messages.length > 0 ? messages[messages.length - 1].id : ''}`}
        className="flex-1 px-4 py-3"
        ref={scrollRef}
      >
        <View className="flex flex-col gap-3">
          {messages.map(msg => (
            <View key={msg.id} id={`msg-${msg.id}`}>
              {msg.role === 'assistant' ? (
                <View className="flex gap-2">
                  <View className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <Sparkles size={16} color="#fff" />
                  </View>
                  <Card className="flex-1 border-0 shadow-sm bg-white max-w-sm">
                    <CardContent className="p-3">
                      <Text className="block text-sm text-gray-700 leading-relaxed">{msg.content}</Text>
                    </CardContent>
                  </Card>
                </View>
              ) : (
                <View className="flex justify-end">
                  <View className="bg-primary rounded-2xl rounded-tr-sm px-4 py-2 max-w-sm">
                    <Text className="block text-sm text-white">{msg.content}</Text>
                  </View>
                </View>
              )}
            </View>
          ))}
          {loading && (
            <View className="flex gap-2">
              <View className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <Sparkles size={16} color="#fff" />
              </View>
              <Card className="border-0 shadow-sm bg-white">
                <CardContent className="p-3">
                  <Text className="text-sm text-gray-400">正在思考中...</Text>
                </CardContent>
              </Card>
            </View>
          )}
        </View>

        {/* Quick Questions */}
        {messages.length <= 1 && (
          <View className="mt-4">
            <Text className="block text-xs text-gray-500 mb-2">快捷提问：</Text>
            <View className="flex flex-wrap gap-2">
              {quickQuestions.map((q, i) => (
                <View
                  key={i}
                  className="bg-white rounded-full px-3 py-2 shadow-sm"
                  onClick={() => { setInputText(q); }}
                >
                  <Text className="text-xs text-primary">{q}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input Area */}
      <View className="bg-white border-t border-gray-100 px-4 py-3" style={{ paddingBottom: 'calc(12px + env(safe-area-inset-bottom))' }}>
        <View className="flex items-center gap-2">
          <View className="flex-1 bg-gray-50 rounded-xl px-3 py-2">
            <Input
              className="w-full bg-transparent text-sm"
              placeholder="输入您的问题..."
              value={inputText}
              onInput={(e) => setInputText(e.detail.value)}
              onConfirm={sendMessage}
            />
          </View>
          <Button
            size="sm"
            className="bg-primary text-white rounded-xl px-4"
            onClick={sendMessage}
            disabled={loading || !inputText.trim()}
          >
            <Send size={16} color="#fff" />
          </Button>
        </View>
      </View>
    </View>
  )
}

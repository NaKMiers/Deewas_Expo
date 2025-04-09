import Message from '@/components/ai/message'
import { useScrollToBottom } from '@/components/ai/useScrollToBottom'
import Icon from '@/components/Icon'
import Text from '@/components/Text'
import { Input } from '@/components/ui/input'
import { useAppSelector } from '@/hooks/reduxHook'
import { BASE_URL, cn, getToken } from '@/lib/utils'
import { useChat, useCompletion } from '@ai-sdk/react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { fetch as expoFetch } from 'expo/fetch'
import {
  LucideArrowUp,
  LucideChevronDown,
  LucideMic,
  LucideSquare,
  LucideTrash,
} from 'lucide-react-native'
import { ChangeEvent, useCallback, useEffect, useState } from 'react'
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native'

function AIPage() {
  const [token, setToken] = useState<string>('')

  // hooks
  const { messages, setMessages, handleInputChange, input, handleSubmit, status, error } = useChat({
    fetch: expoFetch as unknown as typeof globalThis.fetch,
    api: BASE_URL + '/api/ai',
    onError: error => console.error(error, 'ERROR'),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })
  const { stop } = useCompletion()
  const [containerRef, endRef, handleScroll, isAtBottom] = useScrollToBottom(
    messages,
    status === 'streaming'
  )

  useEffect(() => {
    const isStreaming = status === 'streaming'
    const scrollView = containerRef.current
    if (!scrollView) return
    console.log('isStreaming', isStreaming)
    if (isStreaming) {
      const interval = setInterval(() => {
        scrollView.scrollToEnd({ animated: true })
      }, 50)
      return () => clearInterval(interval)
    }
    console.log('scrollToEnd')
  }, [containerRef, status])

  // stores
  const { refreshing, refreshPoint } = useAppSelector(state => state.load)

  // get token
  useEffect(() => {
    if (token) return
    const fetchToken = async () => {
      const token = await getToken()
      if (!token) throw new Error('No token found')
      setToken(token)
    }

    fetchToken()
  }, [token, setToken, refreshPoint])

  // init messages
  useEffect(() => {
    const getMessages = async () => {
      // get message from async storage
      const message = await AsyncStorage.getItem('messages')
      if (!message) return
      const parsedMessage = JSON.parse(message)
      setMessages(parsedMessage)
    }

    getMessages()
  }, [refreshPoint])

  // sync messages to async storage
  useEffect(() => {
    const setMessagesToStorage = async () => {
      await AsyncStorage.setItem('messages', JSON.stringify(messages))
    }

    setMessagesToStorage()
  }, [messages])

  // error view
  if (error)
    return (
      <SafeAreaView className="flex-1">
        <ScrollView
          contentContainerClassName="flex-1 flex flex-col justify-center items-center p-21"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {}}
            />
          }
        >
          <Text className="text-center text-2xl font-semibold text-muted-foreground">
            ⚠️ An Error Happens. Please refresh app!
          </Text>
        </ScrollView>
      </SafeAreaView>
    )

  // send message
  const handleSendMessage = useCallback(
    (e?: any) => {
      if (input.trim() === '') return
      Keyboard.dismiss()
      handleSubmit(e)
    },
    [handleSubmit, input]
  )

  return (
    <SafeAreaView className="flex-1">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex h-screen flex-1 items-center justify-center"
        keyboardVerticalOffset={100}
      >
        <View className="mx-auto flex w-full max-w-[500px] flex-1 flex-col">
          {/* MARK: Messages */}
          <ScrollView
            className="flex-1"
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {}}
              />
            }
            onScroll={handleScroll as any}
            ref={containerRef}
          >
            <View className="px-21 py-21/2 md:py-21">
              {messages.length > 0 ? (
                messages.map((m, i) => (
                  <Message
                    content={m.content}
                    role={m.role as 'assistant' | 'user'}
                    key={i}
                  />
                ))
              ) : (
                <View className="flex flex-col items-center justify-center gap-2 rounded-lg bg-secondary p-21 shadow-lg">
                  <Text className="text-center text-2xl font-semibold">Deewas</Text>
                  <Text className="text-center text-muted-foreground">
                    Deewas is a personal finance assistant that helps you manage your money wisely.
                  </Text>
                </View>
              )}
            </View>
            <View
              ref={endRef}
              style={{ height: 1 }}
            />
          </ScrollView>

          {/* MARK: Scroll down button */}
          {!isAtBottom && (
            <TouchableOpacity
              className="absolute bottom-[136px] right-21/2 z-10 flex h-11 w-11 flex-row items-center justify-center rounded-full border-primary/5 bg-secondary shadow-lg"
              onPress={() => {
                containerRef.current?.scrollToEnd({ animated: true })
              }}
            >
              <Icon
                render={LucideChevronDown}
                size={25}
                className="opacity-70"
              />
            </TouchableOpacity>
          )}

          {/* MARK: Input */}
          <View className="p-21/2 md:p-21">
            <View className="rounded-3xl border border-primary/5 bg-secondary p-21/2">
              <Input
                className="bg- border-transparent"
                style={{ height: 50 }}
                placeholder={`How can ${process.env.EXPO_PUBLIC_APP_NAME} help?`}
                value={input}
                onChange={e => {
                  handleInputChange({
                    ...e,
                    target: {
                      ...e.target,
                      value: e.nativeEvent.text,
                    },
                  } as unknown as ChangeEvent<HTMLInputElement>)
                }}
                onSubmitEditing={e => {
                  e.preventDefault()
                  handleSendMessage(e)
                }}
              />
              <View className="mt-1.5 flex flex-row items-center justify-between gap-1.5">
                <TouchableOpacity
                  className={cn(
                    'flex h-full flex-row items-center justify-center gap-2 rounded-full bg-primary/10 px-21/2 shadow-lg',
                    status !== 'ready' && 'opacity-50'
                  )}
                  disabled={status !== 'ready'}
                  onPress={() => {
                    setMessages([])
                    stop()
                  }}
                >
                  <Icon
                    render={LucideTrash}
                    size={16}
                  />
                  <Text className="font-semibold">Clear chat</Text>
                </TouchableOpacity>

                <View className="flex flex-row items-center gap-1.5">
                  <TouchableOpacity
                    className={cn(
                      'flex h-9 w-9 flex-row items-center justify-center rounded-full shadow-lg',
                      input.trim() !== '' || (status !== 'ready' && 'opacity-50')
                    )}
                    disabled={input.trim() !== '' || status !== 'ready'}
                  >
                    <Icon
                      render={LucideMic}
                      size={20}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    className={cn(
                      'flex h-9 w-9 flex-row items-center justify-center rounded-full bg-primary shadow-lg',
                      input.trim() === '' && status === 'ready' && 'opacity-50'
                    )}
                    disabled={input.trim() === '' && status === 'ready'}
                    onPress={() =>
                      status === 'submitted' || status === 'streaming' ? stop() : handleSendMessage()
                    }
                  >
                    <Icon
                      render={
                        status === 'submitted' || status === 'streaming' ? LucideSquare : LucideArrowUp
                      }
                      size={20}
                      reverse
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default AIPage

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
import moment from 'moment-timezone'
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

const samples = [
  {
    role: 'assistant',
    content: 'Hello, how can I help you today?',
  },
  {
    role: 'user',
    content: 'What is the best way to save money?',
  },
  {
    role: 'assistant',
    content: 'The best way to save money is to create a budget and stick to it.',
  },
  {
    role: 'user',
    content: 'What is the best way to invest money?',
  },
  {
    role: 'assistant',
    content: 'The best way to invest money is to diversify your portfolio and invest for the long term.',
  },
  {
    role: 'user',
    content: 'What is the best way to manage debt?',
  },
  {
    role: 'assistant',
    content: 'The best way to manage debt is to create a plan and stick to it.',
  },
  {
    role: 'user',
    content: 'What is the best way to save for retirement?',
  },
  {
    role: 'assistant',
    content: 'The best way to save for retirement is to start early and contribute regularly.',
  },
  {
    role: 'user',
    content: 'What is the best way to save for a house?',
  },
  {
    role: 'assistant',
    content: 'The best way to save for a house is to create a savings plan and stick to it.',
  },
  {
    role: 'user',
    content: 'What is the best way to save for a car?',
  },
  {
    role: 'assistant',
    content: 'The best way to save for a car is to create a savings plan and stick to it.',
  },
  {
    role: 'user',
    content: 'What is the best way to save for a vacation?',
  },
  {
    role: 'assistant',
    content: 'The best way to save for a vacation is to create a savings plan and stick to it.',
  },
  {
    role: 'user',
    content: 'What is the best way to save for a wedding?',
  },
  {
    role: 'assistant',
    content: 'The best way to save for a wedding is to create a savings plan and stick to it.',
  },
  {
    role: 'user',
    content: "What is the best way to save for a child's education?",
  },
  {
    role: 'assistant',
    content: "The best way to save for a child's education is to create a savings plan and stick to it.",
  },
  {
    role: 'user',
    content: 'What is the best way to save for a rainy day?',
  },
  {
    role: 'assistant',
    content: 'The best way to save for a rainy day is to create a savings plan and stick to it.',
  },
  {
    role: 'user',
    content: 'What is the best way to save for a new car?',
  },
  {
    role: 'assistant',
    content: 'The best way to save for a new car is to create a savings plan and stick to it.',
  },
]

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
      'x-timezone': moment.tz.guess(),
    },
  })
  const { stop } = useCompletion()
  const [containerRef, handleScroll, isAtBottom] = useScrollToBottom(messages, status === 'streaming')

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
      // setMessages(samples as any[])
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

  // send message
  const handleSendMessage = useCallback(
    (e?: any) => {
      if (input.trim() === '') return
      Keyboard.dismiss()
      handleSubmit(e)
    },
    [handleSubmit, input]
  )

  // error view
  if (error)
    return (
      <SafeAreaView className="flex-1">
        <ScrollView
          contentContainerClassName="flex-1 flex flex-col justify-center items-center p-21"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                AsyncStorage.removeItem('messages')
                setMessages([])
                stop()
              }}
            />
          }
        >
          <Text className="text-center text-2xl font-semibold text-muted-foreground">
            ⚠️ An Error Happens. Please refresh app!
          </Text>
        </ScrollView>
      </SafeAreaView>
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
            <View className="flex flex-col px-21 py-21/2 md:py-21">
              {messages.length > 0 ? (
                messages.map((m, i) => (
                  <Message
                    content={m.content}
                    toolInvocations={m.toolInvocations}
                    role={m.role as 'assistant' | 'user'}
                    key={i}
                  />
                ))
              ) : (
                <View className="-mx-21/2 flex flex-col items-center justify-center gap-2 rounded-lg border border-primary/5 bg-secondary p-21 shadow-md">
                  <Text className="text-center text-2xl font-semibold">Deewas</Text>
                  <Text className="text-center text-muted-foreground">
                    Deewas is a personal finance assistant that helps you manage your money wisely.
                  </Text>
                </View>
              )}
            </View>
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
            <View className="rounded-3xl border border-primary/5 bg-secondary p-21/2 shadow-md">
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

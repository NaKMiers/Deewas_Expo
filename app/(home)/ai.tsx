import Message from '@/components/ai/message'
import { useScrollToBottom } from '@/components/ai/useScrollToBottom'
import ChangePersonalitiesDrawer from '@/components/dialogs/ChangePersonalitiesDrawer'
import Icon from '@/components/Icon'
import Text from '@/components/Text'
import { Input } from '@/components/ui/input'
import { personalities } from '@/constants'
import { languages } from '@/constants/settings'
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { refresh } from '@/lib/reducers/loadReducer'
import { BASE_URL, cn, getToken } from '@/lib/utils'
import { useChat, useCompletion } from '@ai-sdk/react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { router } from 'expo-router'
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
import { useTranslation } from 'react-i18next'
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
  const { t: translate, i18n } = useTranslation()
  const t = (key: string) => translate('aiPage.' + key)
  const locale = i18n.language
  const language = languages.find(l => l.value === locale)?.alternative || 'English'

  // stores
  const { refreshing, refreshPoint } = useAppSelector(state => state.load)
  const { settings } = useAppSelector(state => state.settings)

  // hooks
  const { messages, setMessages, handleInputChange, input, handleSubmit, append, status, error } =
    useChat({
      fetch: expoFetch as unknown as typeof globalThis.fetch,
      api: BASE_URL + '/api/ai',
      onError: error => console.error(error, 'ERROR'),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'x-language': language,
        'x-timezone': moment.tz.guess(),
        'x-personalities': JSON.stringify(settings ? settings?.personalities : [0]),
      },
      maxSteps: 3,
    })
  const { stop } = useCompletion()
  const [containerRef, handleScroll, isAtBottom] = useScrollToBottom(messages, status === 'streaming')
  const dispatch = useAppDispatch()

  // states
  const [openPersonalities, setOpenPersonalities] = useState<boolean>(false)

  // values
  const samples = [t('Hello?'), t('What can you do?'), t('I bought a dumpling'), t('Set a food budget')]

  // get token
  useEffect(() => {
    if (token) return
    const fetchToken = async () => {
      const token = await getToken()
      if (!token) {
        return router.replace('/auth/login')
      }
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

  // send message
  const handleSendMessage = useCallback(
    (e?: any) => {
      if (input.trim() === '') return
      Keyboard.dismiss()
      handleSubmit(e)
    },
    [handleSubmit, input]
  )

  // handle refresh
  const handleRefresh = useCallback(async () => {
    if (error) {
      setMessages([])
      await AsyncStorage.removeItem('messages')
    }

    stop()
    dispatch(refresh())
  }, [])

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
                onRefresh={handleRefresh}
              />
            }
            onScroll={handleScroll as any}
            ref={containerRef}
          >
            <View className="flex flex-col px-21 py-21/2 md:py-21">
              {messages.length > 0 ? (
                <>
                  {messages.map((m, i) => (
                    <Message
                      content={m.content}
                      parts={m.parts}
                      role={m.role as 'assistant' | 'user'}
                      key={i}
                    />
                  ))}
                  {error && (
                    <View className="flex flex-1 items-center gap-21 p-21">
                      <Text className="text-center text-2xl font-semibold text-muted-foreground">
                        ⚠️ {t('An Error Happens')}. {t('Try again')}!
                      </Text>
                    </View>
                  )}
                </>
              ) : (
                <View className="-mx-21/2 flex flex-col items-center justify-center gap-2 rounded-lg border border-primary/5 bg-secondary p-21 shadow-md">
                  <Text className="text-center text-2xl font-semibold">Deewas</Text>
                  <Text className="text-center text-muted-foreground">
                    {t('Deewas is a personal finance assistant that helps you manage your money wisely')}
                    .
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
            {messages.length === 0 && (
              <View className="-mx-1 mb-2 flex-row flex-wrap gap-y-2">
                {samples.map(sample => (
                  <View
                    className="w-1/2 flex-row px-1"
                    key={sample}
                  >
                    <TouchableOpacity
                      className="flex-1 flex-row items-center justify-center rounded-lg border border-primary/5 bg-secondary px-21/2 py-2"
                      onPress={() => {
                        Keyboard.dismiss()
                        append({ content: sample, role: 'user' })
                      }}
                    >
                      <Text className="text-center font-body text-lg tracking-wider">{sample}</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            <View className="rounded-3xl border border-primary/5 bg-secondary p-21/2 shadow-md">
              <Input
                className="bg- border-transparent"
                style={{ height: 50 }}
                placeholder={t('How can Deewas help?')}
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
                    status === 'streaming' || (status === 'submitted' && 'opacity-50')
                  )}
                  disabled={status === 'streaming' || status === 'submitted'}
                  onPress={() => {
                    setMessages([])
                    stop()
                  }}
                >
                  <Icon
                    render={LucideTrash}
                    size={16}
                  />
                  <Text className="font-semibold">{t('Clear')}</Text>
                </TouchableOpacity>

                <View className="flex h-full flex-1 flex-row items-center justify-end gap-1.5">
                  <TouchableOpacity
                    className={cn(
                      'flex h-full flex-1 flex-row items-center justify-center gap-2 rounded-full bg-primary/10 px-21/2 shadow-lg',
                      (status === 'streaming' || status === 'submitted') && 'opacity-50'
                    )}
                    disabled={status === 'streaming' || status === 'submitted'}
                    onPress={() => setOpenPersonalities(true)}
                  >
                    <Text className="line-clamp-1 text-ellipsis font-semibold">
                      {settings?.personalities && settings?.personalities?.length === 1
                        ? t(personalities[settings?.personalities[0]].title)
                        : t('Mixed personalities')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className={cn(
                      'flex h-9 w-9 flex-row items-center justify-center rounded-full shadow-lg',
                      (input.trim() !== '' || status !== 'ready') && 'opacity-50'
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

      <ChangePersonalitiesDrawer
        open={!!openPersonalities}
        onClose={() => setOpenPersonalities(false)}
        update={async () => {
          stop()
          setMessages([])
          await AsyncStorage.removeItem('messages')
        }}
        reach={3}
      />
    </SafeAreaView>
  )
}

export default AIPage

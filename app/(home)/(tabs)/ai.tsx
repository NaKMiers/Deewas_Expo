import { images } from '@/assets/images/images'
import Message from '@/components/ai/Message'
import { useScrollToBottom } from '@/components/ai/useScrollToBottom'
import PremiumLimitModal from '@/components/dialogs/PremiumLimitModal'
import Icon from '@/components/Icon'
import { useAuth } from '@/components/providers/AuthProvider'
import Text from '@/components/Text'
import { Input } from '@/components/ui/input'
import { personalities } from '@/constants'
import { languages } from '@/constants/settings'
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import useSettings from '@/hooks/useSettings'
import { refresh } from '@/lib/reducers/loadReducer'
import { setClearChat } from '@/lib/reducers/screenReducer'
import { BASE_URL, cn, getToken } from '@/lib/utils'
import { useChat, useCompletion } from '@ai-sdk/react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { BlurView } from 'expo-blur'
import { router, useFocusEffect } from 'expo-router'
import { fetch as expoFetch } from 'expo/fetch'
import {
  LucideArrowUp,
  LucideChevronDown,
  LucideMic,
  LucideSquare,
  LucideTrash,
} from 'lucide-react-native'
import moment from 'moment'
import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Alert,
  Animated,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native'

let Voice: any = null

if (Platform.OS === 'ios') {
  // Voice = require('@react-native-voice/voice').default
}

function AIPage() {
  const [token, setToken] = useState<string>('')

  // hooks
  const { isPremium } = useAuth()
  const { refetch: refetchSettings } = useSettings()
  const { t: translate, i18n } = useTranslation()
  const t = useCallback((key: string) => translate('aiPage.' + key), [translate])
  const tError = useCallback((key: string) => translate('error.' + key), [translate])
  const locale = i18n.language
  const language = languages.find(l => l.value === locale)?.alternative || 'English'

  // stores
  const { refreshing, refreshPoint } = useAppSelector(state => state.load)
  const { settings } = useAppSelector(state => state.settings)
  const clearChat = useAppSelector(state => state.screen.clearChat)

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
    })
  const { stop } = useCompletion()
  const [containerRef, handleScroll, isAtBottom] = useScrollToBottom(messages, status === 'streaming')
  const dispatch = useAppDispatch()

  // states
  const [refreshed, setRefreshed] = useState<boolean>(false)
  const [isRecording, setIsRecording] = useState(false)
  const [openPremiumModal, setOpenPremiumModal] = useState<boolean>(false)

  // values
  const samples = [t('Hello?'), t('What can you do?'), t('I bought a dumpling'), t('Set a food budget')]

  // get token
  useEffect(() => {
    if (token) return
    const fetchToken = async () => {
      const token = await getToken()
      if (!token) {
        return router.replace('/auth/sign-in')
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
  }, [setMessages, refreshPoint])

  // sync messages to async storage
  useEffect(() => {
    const setMessagesToStorage = async () => {
      await AsyncStorage.setItem('messages', JSON.stringify(messages))
    }

    setMessagesToStorage()
  }, [messages])

  // refetch settings after receive new message to check user token limit
  useEffect(() => {
    if (isPremium) return

    if (status === 'ready') {
      console.log('refetch settings')
      refetchSettings()
    }
  }, [refetchSettings, status, isPremium])

  // auto clear chat after change personality
  useFocusEffect(
    useCallback(() => {
      if (clearChat) {
        console.log('clear chat')
        setMessages([])
        stop()
        dispatch(setClearChat(false))
      }
    }, [dispatch, setMessages, stop, clearChat])
  )

  // MARK: Check token limit
  const checkTokenLimit = useCallback(() => {
    if (!settings) return false
    if (!isPremium && settings.freeTokensUsed > +process.env.EXPO_PUBLIC_FREE_TOKENS_LIMIT!) {
      setOpenPremiumModal(true)
      return false
    }
    return true
  }, [settings, isPremium])

  // MARK: Send message
  const handleSendMessage = useCallback(
    (e?: any) => {
      if (input.trim() === '') return
      Keyboard.dismiss()
      if (!checkTokenLimit()) return

      handleSubmit(e)
      handleInputChange({ target: { value: '' } } as any)
      setRefreshed(false)
    },
    [handleInputChange, handleSubmit, checkTokenLimit, input]
  )

  // MARK: Record voice
  useEffect(() => {
    if (!isRecording || !Voice || Platform.OS !== 'ios') return

    Voice.onSpeechResults = (e: any) => {
      const value = e.value[0]
      handleInputChange({ target: { value } } as any)
    }
    Voice.onSpeechError = ({ error }: any) => {
      if (error?.code !== 'recognition_fail') {
        Alert.alert(tError('Error'), tError('Speech recognition failed'))
        setIsRecording(false)
      }
    }
    return () => {
      if (!Voice || Platform.OS !== 'ios') return
      Voice.destroy()
      Voice.removeAllListeners()
    }
  }, [handleInputChange, tError, isRecording])

  // speak
  const toggleRecording = useCallback(async () => {
    if (!Voice || Platform.OS !== 'ios') return

    try {
      if (isRecording) {
        setIsRecording(false)
        await Voice.stop()
        Voice.destroy()
        Voice.removeAllListeners()
      } else {
        Keyboard.dismiss()
        setIsRecording(true)
        Voice.removeAllListeners()
        await Voice.start(locale)
      }
    } catch (err: any) {
      Alert.alert(tError('Error'), tError('Failed to start recording'))
      setIsRecording(false)
      console.log(err)
    }
  }, [tError, isRecording, locale])

  // handle refresh
  const handleRefresh = useCallback(async () => {
    if (error) {
      setMessages([])
      await AsyncStorage.removeItem('messages')
    }

    stop()
    dispatch(refresh())
  }, [dispatch, setMessages, stop, error])

  // refresh
  useEffect(() => {
    if (messages.length === 0) return
    const lastMessage: any = messages[messages.length - 1]

    const toolName = lastMessage?.parts?.[1]?.toolInvocation?.toolName

    // some tools need to refresh after called
    const toolNames = [
      'create_wallet',
      'update_wallet',
      'delete_wallet',
      'transfer_fund_from_wallet_to_wallet',
      'create_category',
      'update_category',
      'delete_category',
      'create_budget',
      'get_all_transactions',
      'create_transaction',
      'update_transaction',
      'delete_transaction',
    ]

    console.log('toolName', toolName, 'refreshed', refreshed)

    if (toolNames.includes(toolName)) {
      if (!refreshed) {
        console.log('REFRESHING---------')
        setRefreshed(true)

        // refresh without loading
        setTimeout(() => dispatch(refresh(true)), 1000)
      }
    }
  }, [dispatch, messages, refreshed])

  return (
    <SafeAreaView className="flex-1">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex h-screen flex-1 items-center justify-center"
        keyboardVerticalOffset={100}
      >
        <View className="mx-auto flex w-full max-w-4xl flex-1 flex-col">
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
                <View className="shadow-md">
                  <BlurView
                    intensity={90}
                    tint="systemChromeMaterial"
                    className="-mx-21/2 flex flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border border-primary/5 p-21"
                  >
                    <Text className="text-center text-2xl font-semibold">Deewas</Text>
                    <Text className="text-center text-muted-foreground">
                      {t(
                        'Deewas is a personal finance assistant that helps you manage your money wisely'
                      )}
                      .
                    </Text>
                  </BlurView>
                </View>
              )}
              {status === 'submitted' && (
                <View className="row -mx-2 flex-row items-center py-2">
                  <PulseDot />
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
                      className="flex-1 flex-row rounded-lg border border-primary/10"
                      onPress={() => {
                        Keyboard.dismiss()
                        if (!checkTokenLimit()) return
                        append({ content: sample, role: 'user' })
                      }}
                    >
                      <BlurView
                        tint="systemChromeMaterial"
                        intensity={90}
                        className="flex-1 flex-row items-center justify-center overflow-hidden rounded-lg px-21/2 py-2"
                      >
                        <Text className="text-center font-body text-lg tracking-wider">{sample}</Text>
                      </BlurView>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            <ImageBackground
              source={images.preBg}
              className="overflow-hidden rounded-3xl p-21/2 shadow-lg"
            >
              <View className="shadow-md">
                <Input
                  className="border-transparent bg-transparent text-neutral-800"
                  style={{ height: 50 }}
                  placeholder={
                    isRecording
                      ? `${t('Listening')} (${languages.find(l => l.value === locale)?.label})`
                      : t('How can Deewas help?')
                  }
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
                  {/* MARK: Clear Chat */}
                  <TouchableOpacity
                    className={cn(
                      'flex h-full flex-row items-center justify-center gap-2 rounded-full bg-black/10 px-21/2 shadow-lg',
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
                      color="#262626"
                    />
                    <Text className="font-semibold text-neutral-800">{t('Clear')}</Text>
                  </TouchableOpacity>

                  <View className="flex h-full flex-1 flex-row items-center justify-end gap-1.5">
                    {/* MARK: Personality */}
                    <TouchableOpacity
                      className={cn(
                        'flex h-full flex-1 flex-row items-center justify-center gap-2 rounded-full bg-black/10 px-21/2 shadow-lg',
                        (status === 'streaming' || status === 'submitted') && 'opacity-50'
                      )}
                      disabled={status === 'streaming' || status === 'submitted'}
                      onPress={() => router.push('/change-personality')}
                    >
                      <Text className="line-clamp-1 text-ellipsis font-semibold text-neutral-800">
                        {settings?.personalities && settings?.personalities?.length === 1
                          ? t(personalities[settings?.personalities[0]].title)
                          : t('Mixed personalities')}
                      </Text>
                    </TouchableOpacity>

                    {/* MARK: Micro */}
                    {!isRecording && Platform.OS === 'ios' && (
                      <TouchableOpacity
                        className={cn(
                          'flex h-9 w-9 flex-row items-center justify-center rounded-full shadow-lg',
                          (input.trim() !== '' || status !== 'ready') && 'opacity-50'
                        )}
                        disabled={input.trim() !== '' || status !== 'ready'}
                        onPress={toggleRecording}
                      >
                        <Icon
                          render={LucideMic}
                          size={20}
                          color="#262626"
                        />
                      </TouchableOpacity>
                    )}

                    {/* MARK: Send */}
                    <TouchableOpacity
                      className={cn(
                        'flex h-9 w-9 flex-row items-center justify-center rounded-full bg-primary shadow-lg',
                        input.trim() === '' && status === 'ready' && !isRecording && 'opacity-50'
                      )}
                      disabled={input.trim() === '' && status === 'ready' && !isRecording}
                      onPress={() => {
                        if (isRecording) {
                          toggleRecording()
                        } else {
                          if (status === 'submitted' || status === 'streaming') stop()
                          else handleSendMessage()
                        }
                      }}
                    >
                      <Icon
                        render={
                          status === 'submitted' || status === 'streaming' || isRecording
                            ? LucideSquare
                            : LucideArrowUp
                        }
                        size={20}
                        reverse
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </ImageBackground>
          </View>
        </View>

        {/* Premium Modal */}
        <PremiumLimitModal
          open={openPremiumModal}
          close={() => setOpenPremiumModal(false)}
          label={t('Please upgrade to Premium to continue using the assistant')}
          desc={`${t("You've reached your free token limit for today")} (${process.env.EXPO_PUBLIC_FREE_TOKENS_LIMIT}/${process.env.EXPO_PUBLIC_FREE_TOKENS_LIMIT})`}
          confirmLabel={t('Upgrade Now')}
          cancelLabel={t('Cancel')}
          onConfirm={() => router.push('/premium')}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default AIPage

// MARK PulseDot
export function PulseDot({ className }: { className?: string }) {
  const scale = useRef(new Animated.Value(1)).current

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.3,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start()
  }, [scale])

  return (
    <Animated.View
      className={cn('h-4 w-4 rounded-full bg-primary', className)}
      style={{ transform: [{ scale }] }}
    />
  )
}

import icons from '@/assets/icons/icons'
import { images } from '@/assets/images/images'
import CustomInput from '@/components/CustomInput'
import LanguageSelector from '@/components/LanguageSelector'
import Text from '@/components/Text'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useAppDispatch } from '@/hooks/reduxHook'
import useLanguage from '@/hooks/useLanguage'
import { setUser } from '@/lib/reducers/userReducer'
import { useColorScheme } from '@/lib/useColorScheme'
import { cn } from '@/lib/utils'
import { signInAppleApi, signInCredentialsApi, signInGoogleApi } from '@/requests'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin'
import * as AppleAuthentication from 'expo-apple-authentication'
import { router } from 'expo-router'
import { jwtDecode } from 'jwt-decode'
import { useCallback, useState } from 'react'
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'

function SignInPage() {
  // hooks
  const dispatch = useAppDispatch()
  let { t: translate, i18n } = useTranslation()
  const t = useCallback((key: string) => translate('signInPage.' + key), [translate])
  const tSuccess = useCallback((key: string) => translate('success.' + key), [translate])
  const tError = useCallback((key: string) => translate('error.' + key), [translate])
  const { isDarkColorScheme } = useColorScheme()
  const locale = i18n.language
  const { changeLanguage, language } = useLanguage()

  // states
  const [loading, setLoading] = useState<boolean>(false)

  // form
  const {
    setValue,
    handleSubmit,
    setError,
    clearErrors,
    watch,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      usernameOrEmail: '',
      password: '',
    },
  })
  const form = watch()

  // validate form
  const handleValidate: SubmitHandler<FieldValues> = useCallback(
    data => {
      let isValid = true

      // username or email is required
      if (data.usernameOrEmail.trim() === '') {
        setError('usernameOrEmail', {
          type: 'manual',
          message: t('Username or email is required'),
        })
        isValid = false
      }

      // password is required
      if (data.password.trim() === '') {
        setError('password', {
          type: 'manual',
          message: t('Password is required'),
        })
        isValid = false
      }

      return isValid
    },
    [setError, t]
  )

  // MARK: Sign In Submission
  const handleCredentialSignIn: SubmitHandler<FieldValues> = useCallback(
    async (data: any) => {
      if (!handleValidate(data)) return

      // start loading
      setLoading(true)

      try {
        const { token } = await signInCredentialsApi(data)
        const decodedUser: IFullUser = jwtDecode(token)

        // save token and user
        await AsyncStorage.setItem('token', token)
        dispatch(setUser(decodedUser))

        // show success message
        Toast.show({
          type: 'success',
          text1: tSuccess('Sign In Success'),
          text2: tSuccess('You have successfully logged in'),
        })

        // go home
        router.replace('/home')
      } catch (err: any) {
        console.log(err)
        Toast.show({
          type: 'error',
          text1: tError('Sign In Failed'),
          text2: tError(err.message),
        })
      } finally {
        // stop loading
        setLoading(false)
      }
    },
    [dispatch, handleValidate, tError, tSuccess]
  )

  // MARK: Google Sign In
  const handleGoogleSignIn = useCallback(async () => {
    // start loading
    setLoading(true)

    try {
      await GoogleSignin.hasPlayServices()
      const response = await GoogleSignin.signIn()

      if (isSuccessResponse(response)) {
        const { idToken, user } = response.data

        if (!idToken) {
          Toast.show({
            type: 'error',
            text1: tError('ID token is required'),
          })
          return
        }

        const { token } = await signInGoogleApi(idToken, user.id, locale)
        const decodedUser: IFullUser = jwtDecode(token)

        // save token and user
        await AsyncStorage.setItem('token', token)
        dispatch(setUser(decodedUser))

        // show success message
        Toast.show({
          type: 'success',
          text1: tSuccess('Sign In Success'),
          text2: tSuccess('You have successfully logged in'),
        })

        // go home
        router.replace('/home')
      }
    } catch (err) {
      if (isErrorWithCode(err)) {
        switch (err.code) {
          case statusCodes.IN_PROGRESS:
            Toast.show({
              type: 'info',
              text1: t('Google sign in is in progress'),
            })
            break
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            Toast.show({
              type: 'error',
              text1: tError('Play services are not available'),
            })
            break
          default:
            Toast.show({
              type: 'error',
              text1: tError('Failed to sign in with Google'),
            })
        }
      } else {
        Toast.show({
          type: 'error',
          text1: tError('An error occurred'),
        })
      }
      console.error(err)
    } finally {
      // stop loading
      setLoading(false)
    }
  }, [dispatch, t, tError, tSuccess, locale])

  // MARK: Apple Sign In
  const handleAppleSignIn = useCallback(async () => {
    if (Platform.OS !== 'ios') return

    // start loading
    setLoading(true)

    try {
      const nonce = Math.random().toString(36).substring(2, 15)
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce,
      })

      const { identityToken, user } = credential
      if (!identityToken || !user) {
        Toast.show({
          type: 'error',
          text1: tError('ID token is required'),
        })
        return
      }

      const { token } = await signInAppleApi(identityToken, user, nonce, locale)
      const decodedUser: IFullUser = jwtDecode(token)

      // save token and user
      await AsyncStorage.setItem('token', token)
      dispatch(setUser(decodedUser))

      // show success message
      Toast.show({
        type: 'success',
        text1: tSuccess('Sign In Success'),
        text2: tSuccess('You have successfully logged in'),
      })

      // go home
      router.replace('/home')
    } catch (err: any) {
      if (err.code === 'ERR_REQUEST_CANCELED') {
        // handle that the user canceled the sign-in flow
      } else {
        // handle other errors
        Toast.show({
          type: 'error',
          text1: tError('An error occurred'),
        })
        console.log(err)
      }
    } finally {
      // stop loading
      setLoading(false)
    }
  }, [dispatch, tError, tSuccess, locale])

  return (
    <View className="flex-1 bg-primary-foreground">
      <Image
        source={isDarkColorScheme ? images.block2 : images.block1}
        resizeMode="cover"
        className="h-full w-full"
        style={{ position: 'absolute' }}
      />
      <ScrollView>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="h-screen flex-1 items-center justify-center"
          keyboardVerticalOffset={21}
        >
          <SafeAreaView className="flex-1">
            <LanguageSelector className="py-0" />

            <View className="h-screen w-screen flex-1 items-center justify-center px-21">
              <Text className="mb-21 items-end text-center text-4xl font-bold tracking-wider">
                DEEWAS
                <Text className="text-[40px] font-bold text-green-500">.</Text>
              </Text>

              <View
                className={cn(
                  'w-full max-w-[400px] overflow-hidden rounded-2xl border border-secondary bg-white text-black'
                )}
              >
                <View className="px-10 py-8">
                  {/* MARK: Header */}
                  <Text className="text-center text-lg font-semibold text-black">
                    {t('Sign In to Deewas')}
                  </Text>
                  <Text className="text-center text-muted-foreground">
                    {t('Welcome back, please sign in to continue!')}
                  </Text>

                  <Separator className="my-6 h-0" />

                  {/* MARK: Social Sign In */}
                  <View className="items-center justify-center gap-2">
                    <Button
                      className="h-8 w-full flex-row items-center justify-center gap-2 border border-border bg-white shadow-sm shadow-black/10"
                      onPress={handleGoogleSignIn}
                      disabled={loading}
                    >
                      <Image
                        source={icons.google}
                        alt="Google"
                        className="h-5 w-5"
                        resizeMode="contain"
                      />
                      <Text className="font-semibold text-black">{t('Sign In with Google')}</Text>
                    </Button>
                    {Platform.OS === 'ios' && (
                      <Button
                        className="h-8 w-full flex-row items-center justify-center gap-2 border border-border bg-black shadow-sm shadow-black/10"
                        onPress={handleAppleSignIn}
                        disabled={loading}
                      >
                        <Image
                          source={icons.apple}
                          alt="Google"
                          className="h-5 w-5"
                          resizeMode="contain"
                        />
                        <Text className="font-semibold text-white">{t('Sign In with Apple')}</Text>
                      </Button>
                    )}
                  </View>

                  <View className="my-6 flex-row items-center gap-3">
                    <View className="h-px flex-1 border border-muted-foreground/10" />
                    <Text className="flex-shrink-0 text-muted-foreground">{t('or')}</Text>
                    <View className="h-px flex-1 border border-muted-foreground/10" />
                  </View>

                  <View className="flex-col gap-6">
                    {/* MARK: Username / Email */}
                    <CustomInput
                      id="usernameOrEmail"
                      label={t('Username / Email')}
                      value={form.usernameOrEmail}
                      placeholder="..."
                      onChange={setValue}
                      onFocus={() => clearErrors('usernameOrEmail')}
                      errors={errors}
                      labelClassName="text-black"
                      inputClassName="text-black"
                      containerClassName="bg-white"
                    />

                    {/* MARK: Password */}
                    <CustomInput
                      id="password"
                      label={t('Password')}
                      value={form.password}
                      type="password"
                      placeholder="..."
                      onChange={setValue}
                      onFocus={() => clearErrors('password')}
                      errors={errors}
                      labelClassName="text-black"
                      inputClassName="text-black"
                      containerClassName="bg-white"
                    />
                  </View>

                  <View className="mt-2 flex-row justify-end">
                    <TouchableOpacity
                      onPress={() => router.replace('/auth/forgot-password')}
                      className="mt-2 block text-right underline underline-offset-2"
                    >
                      <Text className="text-base text-muted-foreground underline">
                        {t('Forgot Password?')}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* MARK: Submit Button */}
                  <TouchableOpacity
                    className={cn(
                      'mt-6 h-12 w-full flex-row items-center justify-center rounded-full bg-neutral-900',
                      loading && 'opacity-50'
                    )}
                    onPress={handleSubmit(handleCredentialSignIn)}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator />
                    ) : (
                      <Text className="text-lg font-semibold text-white">{t('Sign In')}</Text>
                    )}
                  </TouchableOpacity>
                </View>

                <Separator className="h-5" />
              </View>
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </ScrollView>
    </View>
  )
}

export default SignInPage

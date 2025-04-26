import icons from '@/assets/icons/icons'
import { images } from '@/assets/images/images'
import CustomInput from '@/components/CustomInput'
import Image from '@/components/Image'
import Text from '@/components/Text'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { commonEmailMistakes } from '@/constants/mistakes'
import { useAppDispatch } from '@/hooks/reduxHook'
import { setToken, setUser } from '@/lib/reducers/userReducer'
import { useColorScheme } from '@/lib/useColorScheme'
import { cn } from '@/lib/utils'
import { registerCredentialsApi, signInAppleApi, signInGoogleApi, updateMySettingsApi } from '@/requests'
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
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native'
import Toast from 'react-native-toast-message'

function SignUpPage() {
  // hooks
  const dispatch = useAppDispatch()
  let { t: translate } = useTranslation()
  const t = useCallback((key: string) => translate('signUpPage.' + key), [translate])
  const tSuccess = useCallback((key: string) => translate('success.' + key), [translate])
  const tError = useCallback((key: string) => translate('error.' + key), [translate])
  const { isDarkColorScheme } = useColorScheme()

  // states
  const [loading, setLoading] = useState<boolean>(false)

  // form
  const {
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
    control,
  } = useForm<FieldValues>({
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
  })

  // validate form
  const handleValidate: SubmitHandler<FieldValues> = useCallback(
    data => {
      let isValid = true

      if (data.username.trim() === '') {
        setError('username', {
          type: 'manual',
          message: t('Username is required'),
        })
        isValid = false
      }
      // username must be at least 5 characters
      else if (data.username.length < 5) {
        setError('username', {
          type: 'manual',
          message: t('Username must be at least 5 characters'),
        })
        isValid = false
      }

      if (data.email.trim() === '') {
        setError('email', {
          type: 'manual',
          message: t('Email is required'),
        })
        isValid = false
      }
      // email must be valid
      // eslint-disable-next-line no-useless-escape
      else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,8}$/.test(data.email)) {
        setError('email', {
          type: 'manual',
          message: t('Invalid email'),
        })
        isValid = false
      } else {
        if (commonEmailMistakes.some(mistake => data.email.toLowerCase().includes(mistake))) {
          setError('email', { message: t('Invalid email') })
          isValid = false
        }
      }

      if (data.password.trim() === '') {
        setError('password', {
          type: 'manual',
          message: t('Password is required'),
        })
        isValid = false
      }
      // password must be at least 6 characters and contain at least 1 lowercase, 1 uppercase, 1 number
      else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(data.password)) {
        setError('password', {
          type: 'manual',
          message: t(
            'Password must be at least 6 characters and contain at least 1 lowercase, 1 uppercase, 1 number'
          ),
        })
        isValid = false
      }

      return isValid
    },
    [setError, t]
  )

  // MARK: Sign Up Submission
  const handleCredentialSignUp: SubmitHandler<FieldValues> = useCallback(
    async (data: any) => {
      if (!handleValidate(data)) return

      // start loading
      setLoading(true)

      try {
        const { token } = await registerCredentialsApi(data)
        const decodedUser: IFullUser = jwtDecode(token)

        // save token and user
        await AsyncStorage.setItem('token', token)
        dispatch(setUser(decodedUser))
        dispatch(setToken(token))

        // currency at onboarding
        const currency = await AsyncStorage.getItem('currency')
        const personalities = await AsyncStorage.getItem('personalities')

        if (currency || personalities) {
          const data = {
            currency: currency ? JSON.parse(currency) : 'USD',
            personalities: personalities ? JSON.parse(personalities) : [0],
          }

          await updateMySettingsApi(data)
        }

        // show success message
        Toast.show({
          type: 'success',
          text1: tSuccess('Sign Up Success'),
          text2: tSuccess('You have successfully registered'),
        })

        // go home
        router.replace('/home')
      } catch (err: any) {
        console.log(err)
        Toast.show({
          type: 'error',
          text1: tError('Sign Up Failed'),
          text2: tError(err.message),
        })
      } finally {
        // stop loading
        setLoading(false)
      }
    },
    [dispatch, handleValidate, tError, tSuccess]
  )

  // MARK: Google Sign Up
  const handleGoogleSignUp = useCallback(async () => {
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

        const { token, isNewUser } = await signInGoogleApi(idToken, user.id)
        const decodedUser: IFullUser = jwtDecode(token)

        // save token and user
        await AsyncStorage.setItem('token', token)
        dispatch(setUser(decodedUser))
        dispatch(setToken(token))

        if (isNewUser) {
          // currency at onboarding
          const currency = await AsyncStorage.getItem('currency')
          const personalities = await AsyncStorage.getItem('personalities')

          if (currency || personalities) {
            const data = {
              currency: currency ? JSON.parse(currency) : 'USD',
              personalities: personalities ? JSON.parse(personalities) : [0],
            }

            await updateMySettingsApi(data)
          }

          // show success message
          Toast.show({
            type: 'success',
            text1: tSuccess('Sign Up Success'),
            text2: tSuccess('You have successfully signed up'),
          })
        } else {
          // show success message
          Toast.show({
            type: 'success',
            text1: tSuccess('Sign In Success'),
            text2: tSuccess('You have successfully signed in'),
          })
        }

        // go home
        router.replace('/home')
      } else {
        Toast.show({
          type: 'error',
          text1: tError('Failed to sign up with Google'),
        })
      }
    } catch (err) {
      if (isErrorWithCode(err)) {
        switch (err.code) {
          case statusCodes.IN_PROGRESS:
            Toast.show({
              type: 'info',
              text1: t('Google sign up is in progress'),
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
              text1: tError('Failed to sign up with Google'),
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
  }, [dispatch, t, tError, tSuccess])

  // MARK: Apple Sign In
  const handleAppleSignIn = useCallback(async () => {
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

      const { token } = await signInAppleApi(identityToken, user, nonce)
      const decodedUser: IFullUser = jwtDecode(token)

      // save token and user
      await AsyncStorage.setItem('token', token)
      dispatch(setUser(decodedUser))
      dispatch(setToken(token))

      // show success message
      Toast.show({
        type: 'success',
        text1: tSuccess('Sign In Success'),
        text2: tSuccess('You have successfully logged in'),
      })

      // go home
      router.replace('/home')
    } catch (e: any) {
      if (e.code === 'ERR_REQUEST_CANCELED') {
        // handle that the user canceled the sign-in flow
      } else {
        // handle other errors
        Toast.show({
          type: 'error',
          text1: tError('An error occurred'),
        })
      }
    } finally {
      // stop loading
      setLoading(false)
    }
  }, [dispatch, tError, tSuccess])

  return (
    <>
      <Image
        source={isDarkColorScheme ? images.block2 : images.block1}
        resizeMode="cover"
        className="h-full w-full"
        style={{ position: 'absolute' }}
      />
      <ScrollView>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex h-screen flex-1 items-center justify-center"
          keyboardVerticalOffset={21}
        >
          <View className="flex h-screen w-screen flex-1 items-center justify-center px-21">
            <Text className="mb-21 flex items-end text-center text-4xl font-bold tracking-wider">
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
                  {t('Sign Up to Deewas')}
                </Text>
                <Text className="text-center text-muted-foreground">
                  {t('Welcome! Please fill in the details to get started')}
                </Text>

                <Separator className="my-6 h-0" />

                {/* MARK: Social Sign In */}
                <View className="items-center justify-center gap-2">
                  <Button
                    className="flex h-8 w-full flex-row items-center justify-center gap-2 border border-border bg-white shadow-sm shadow-black/10"
                    onPress={handleGoogleSignUp}
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
                      className="flex h-8 w-full flex-row items-center justify-center gap-2 border border-border bg-black shadow-sm shadow-black/10"
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

                <View className="my-6 flex flex-row items-center gap-3">
                  <View className="h-px flex-1 border border-muted-foreground/10" />
                  <Text className="flex-shrink-0 text-muted-foreground">{t('or')}</Text>
                  <View className="h-px flex-1 border border-muted-foreground/10" />
                </View>

                <View className="flex flex-col gap-6">
                  {/* MARK: Username */}
                  <CustomInput
                    id="username"
                    label={t('Username')}
                    type="text"
                    control={control}
                    errors={errors}
                    onFocus={() => clearErrors('username')}
                    labelClassName="text-black"
                    className="bg-white text-black"
                    placeholder="..."
                  />

                  {/* MARK: Password */}
                  <CustomInput
                    id="email"
                    label={t('Email')}
                    type="email"
                    control={control}
                    errors={errors}
                    onFocus={() => clearErrors('email')}
                    labelClassName="text-black"
                    className="bg-white text-black"
                    placeholder="..."
                  />

                  {/* MARK: Password */}
                  <CustomInput
                    id="password"
                    label={t('Password')}
                    type="password"
                    control={control}
                    errors={errors}
                    onFocus={() => clearErrors('password')}
                    labelClassName="text-black"
                    className="bg-white text-black"
                    placeholder="..."
                  />
                </View>

                {/* MARK: Submit Button */}
                <TouchableOpacity
                  className={cn(
                    'mt-6 flex h-12 w-full flex-row items-center justify-center rounded-full bg-neutral-900',
                    loading && 'opacity-50'
                  )}
                  onPress={handleSubmit(handleCredentialSignUp)}
                  disabled={loading}
                  style={{ marginTop: 36 }}
                >
                  {loading ? (
                    <ActivityIndicator />
                  ) : (
                    <Text className="font-semibold text-white">{t('Sign Up')}</Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* MARK: Footer */}
              <View className="border-y border-muted-foreground/50 bg-neutral-100">
                <View className="flex flex-row items-center justify-center gap-1.5 px-2 py-5 text-center text-black">
                  <Text className="text-black">{t('Already have an account?')}</Text>
                  <TouchableOpacity onPress={() => router.replace('/auth/sign-in')}>
                    <Text className="font-semibold text-black underline">{t('Sign In')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </>
  )
}

export default SignUpPage

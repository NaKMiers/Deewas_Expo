import icons from '@/assets/icons/icons'
import { images } from '@/assets/images/images'
import CustomInput from '@/components/CustomInput'
import Image from '@/components/Image'
import Text from '@/components/Text'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useAppDispatch } from '@/hooks/reduxHook'
import { setToken, setUser } from '@/lib/reducers/userReducer'
import { useColorScheme } from '@/lib/useColorScheme'
import { cn } from '@/lib/utils'
import { signInCredentialsApi } from '@/requests'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { router } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'
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

WebBrowser.maybeCompleteAuthSession()

function LoginPage() {
  // hooks
  const dispatch = useAppDispatch()
  let { t: translate } = useTranslation()
  const t = (key: string) => translate('loginPage.' + key)
  const tSuccess = (key: string) => translate('success.' + key)
  const tError = (key: string) => translate('error.' + key)
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
      usernameOrEmail: '',
      password: '',
    },
  })

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

  // MARK: Login Submission
  const onSubmit: SubmitHandler<FieldValues> = useCallback(async (data: any) => {
    if (!handleValidate(data)) return

    // start loading
    setLoading(true)

    try {
      const { token } = await signInCredentialsApi(data)
      const decodedUser: IFullUser = jwtDecode(token)

      // save token and user
      await AsyncStorage.setItem('token', token)
      dispatch(setUser(decodedUser))
      dispatch(setToken(token))

      // show success message
      Toast.show({
        type: 'success',
        text1: tSuccess('Login Success'),
        text2: tSuccess('You have successfully logged in'),
      })

      // go home
      router.replace('/home')
    } catch (err: any) {
      console.log(err)
      Toast.show({
        type: 'error',
        text1: tError('Login Failed'),
        text2: tError(err.message),
      })
    } finally {
      // stop loading
      setLoading(false)
    }
  }, [])

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
                  {t('Login to Deewas')}
                </Text>
                <Text className="text-center text-muted-foreground">
                  {t('Welcome back, please login to continue!')}
                </Text>

                <Separator className="my-6 h-0" />

                {/* MARK: Social Login */}
                <View className="items-center justify-center gap-2">
                  <Button className="flex h-8 w-full flex-row items-center justify-center gap-2 border border-border bg-white shadow-sm shadow-black/10">
                    <Image
                      source={icons.google}
                      alt="Google"
                      className="h-5 w-5"
                      resizeMode="contain"
                    />
                    <Text className="font-semibold text-black">{t('Login with Google')}</Text>
                  </Button>
                </View>

                <View className="my-6 flex flex-row items-center gap-3">
                  <View className="h-px flex-1 border border-muted-foreground/10" />
                  <Text className="flex-shrink-0 text-muted-foreground">{t('or')}</Text>
                  <View className="h-px flex-1 border border-muted-foreground/10" />
                </View>

                <View className="flex flex-col gap-6">
                  {/* MARK: Username / Email */}
                  <CustomInput
                    id="usernameOrEmail"
                    label={t('Username / Email')}
                    type="text"
                    control={control}
                    errors={errors}
                    onFocus={() => clearErrors('usernameOrEmail')}
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

                <View className="mt-2 flex flex-row justify-end">
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
                    'mt-6 flex h-12 w-full flex-row items-center justify-center rounded-full bg-neutral-900',
                    loading && 'opacity-50'
                  )}
                  onPress={handleSubmit(onSubmit)}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator />
                  ) : (
                    <Text className="text-lg font-semibold text-white">{t('Login')}</Text>
                  )}
                </TouchableOpacity>
              </View>

              <Separator className="h-5" />
            </View>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </>
  )
}

export default LoginPage

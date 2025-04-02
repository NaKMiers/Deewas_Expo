import icons from '@/assets/icons/icons'
import CustomInput from '@/components/CustomInput'
import Text from '@/components/Text'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useAppDispatch } from '@/hooks/reduxHook'
import { setToken, setUser } from '@/lib/reducers/userReducer'
import { cn } from '@/lib/utils'
import { signInCredentialsApi } from '@/requests'
import { IFullUser } from '@/types/type'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useRouter } from 'expo-router'
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
import Toast from 'react-native-toast-message'

function LoginPage() {
  // hooks
  const dispatch = useAppDispatch()
  const router = useRouter()
  let { t: translate, i18n } = useTranslation()
  const t = (key: string) => translate('loginPage.' + key)
  const tSuccess = (key: string) => translate('success.' + key)
  const tError = (key: string) => translate('error.' + key)

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

      router.replace('/wizard')
    } catch (err: any) {
      console.log('Login error:', err)
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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView contentContainerClassName="flex w-full items-center justify-center p-2">
        <View
          className={cn(
            'w-full max-w-[400px] overflow-hidden rounded-2xl border border-primary bg-white text-black'
          )}
          style={{ marginBottom: 100 }}
        >
          <View className="no-scrollbar overflow-y-auto px-10 py-8">
            {/* MARK: Header */}
            <Text className="text-center text-lg font-semibold text-black">{t('Login to Deewas')}</Text>
            <Text className="text-center text-muted-foreground">
              {t('Welcome back, please login to continue!')}
            </Text>

            <Separator className="my-6 h-0" />

            {/* MARK: Social Login */}
            <View className="grid grid-cols-1 items-center justify-center gap-2 md:grid-cols-3">
              <Button
                className="flex h-8 flex-row items-center justify-center gap-2 bg-white shadow-sm shadow-black/10"
                // onPress={() => signIn('google', { callbackUrl: `/${locale}/wizard` })}
                onPress={() => i18n.changeLanguage('vi')}
              >
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
            <Button
              className="mt-6 w-full bg-neutral-900"
              onPress={handleSubmit(onSubmit)}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator />
              ) : (
                <Text className="font-semibold text-white">{t('Login')}</Text>
              )}
            </Button>
          </View>

          {/* MARK: Footer */}
          <View className="border-y border-muted-foreground/50 bg-neutral-100">
            <View className="flex flex-row items-center justify-center gap-1.5 px-2 py-5 text-center text-black">
              <Text className="text-black">{t("Don't have an account?")}</Text>
              <TouchableOpacity onPress={() => router.replace('/auth/register')}>
                <Text className="font-semibold text-black underline">{t('Register')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default LoginPage

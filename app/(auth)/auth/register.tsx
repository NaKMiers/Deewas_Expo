import icons from '@/assets/icons/icons'
import CustomInput from '@/components/CustomInput'
import Text from '@/components/Text'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { commonEmailMistakes } from '@/constants/mistakes'
import { useAppDispatch } from '@/hooks/reduxHook'
import { setToken, setUser } from '@/lib/reducers/userReducer'
import { cn } from '@/lib/utils'
import { registerCredentialsApi } from '@/requests'
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

function RegisterPage() {
  // hooks
  const dispatch = useAppDispatch()
  const router = useRouter()
  let { t: translate, i18n } = useTranslation()
  const t = (key: string) => translate('registerPage.' + key)
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

  // MARK: Login Submission
  const onSubmit: SubmitHandler<FieldValues> = useCallback(async (data: any) => {
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

      // show success message
      Toast.show({
        type: 'success',
        text1: tSuccess('Register Success'),
        text2: tSuccess('You have successfully registered'),
      })

      router.replace('/wizard')
    } catch (err: any) {
      console.log('Register error:', err)
      Toast.show({
        type: 'error',
        text1: tError('Register Failed'),
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
            <Text className="text-center text-lg font-semibold text-black">
              {t('Register to Deewas')}
            </Text>
            <Text className="text-center text-muted-foreground">
              {t('Welcome! Please fill in the details to get started')}
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

            {/* MARK: Submit Button */}
            <Button
              className="w-full bg-neutral-900"
              onPress={handleSubmit(onSubmit)}
              disabled={loading}
              style={{ marginTop: 36 }}
            >
              {loading ? (
                <ActivityIndicator />
              ) : (
                <Text className="font-semibold text-white">{t('Register')}</Text>
              )}
            </Button>
          </View>

          {/* MARK: Footer */}
          <View className="border-y border-muted-foreground/50 bg-neutral-100">
            <View className="flex flex-row items-center justify-center gap-1.5 px-2 py-5 text-center text-black">
              <Text className="text-black">{t('Already have an account?')}</Text>
              <TouchableOpacity onPress={() => router.replace('/auth/login')}>
                <Text className="font-semibold text-black underline">{t('Login')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default RegisterPage

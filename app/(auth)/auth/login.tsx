'use client'

import icons from '@/assets/icons/icons'
import CustomInput from '@/components/CustomInput'
import Text from '@/components/Text'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useAppDispatch } from '@/hooks/reduxHook'
import { cn } from '@/lib/utils'
import { signInCredentialsApi } from '@/requests'
import { Link, useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form'
// import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { Image, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native'

function LoginPage() {
  // hooks
  const dispatch = useAppDispatch()
  const router = useRouter()
  let { t: translation, i18n } = useTranslation()
  const t = (value: string) => translation('loginPage.' + value)

  // states
  const [loading, setLoading] = useState<boolean>(false)

  // form
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
    watch,
    control,
  } = useForm<FieldValues>({
    defaultValues: {
      usernameOrEmail: '',
      password: '',
    },
  })

  const form = watch()

  // MARK: Login Submission
  const onSubmit: SubmitHandler<FieldValues> = useCallback(
    async data => {
      console.log('data', data)
      console.log(process.env.EXPO_PUBLIC_WEB_SERVER_URL)

      // start loading
      setLoading(true)

      // toast.loading(t('Logging in') + '...', { id: 'login' })

      try {
        const result = await signInCredentialsApi(data)
        console.log('result', result)
      } catch (err: any) {
        // toast.error(err.message, { id: 'login' })
        console.log(err)
      } finally {
        // stop loading state
        setLoading(false)
      }
    },
    [setError, router, t]
  )

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
                onPress={() => i18n.changeLanguage('en')}
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
                label="Username or Email"
                type="text"
                control={control}
                errors={errors}
              />

              {/* MARK: Password */}
              <CustomInput
                id="password"
                label="Password"
                type="password"
                control={control}
                errors={errors}
              />
            </View>

            <View className="mt-2 flex justify-end">
              <Link
                href="/auth/login"
                className="mt-2 block text-right underline underline-offset-2"
              >
                <Text>{t('Forgot Password?')}</Text>
              </Link>
            </View>

            {/* MARK: Submit Button */}
            <Button
              className="mt-6 w-full bg-neutral-900"
              onPress={handleSubmit(onSubmit)}
              disabled={loading}
            >
              <Text className="font-semibold text-white">{t('Login')}</Text>
            </Button>
          </View>

          {/* MARK: Footer */}
          <View className="border-y border-slate-300 bg-neutral-100">
            <Text className="px-2 py-5 text-center text-black">
              {t("Don't have an account?")}{' '}
              <Link
                href="/auth/login"
                className="font-semibold underline-offset-1 hover:underline"
              >
                <Text>Register</Text>
              </Link>
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default LoginPage

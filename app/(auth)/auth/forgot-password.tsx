import { images } from '@/assets/images/images'
import CustomInput from '@/components/CustomInput'
import Text from '@/components/Text'
import { Separator } from '@/components/ui/separator'
import { commonEmailMistakes } from '@/constants/mistakes'
import { useColorScheme } from '@/lib/useColorScheme'
import { cn } from '@/lib/utils'
import { forgotPasswordApi } from '@/requests'
import { router } from 'expo-router'
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

function ForgotPasswordPage() {
  // hooks
  let { t: translate } = useTranslation()
  const t = useCallback((key: string) => translate('forgotPasswordPage.' + key), [translate])
  const tSuccess = useCallback((key: string) => translate('success.' + key), [translate])
  const tError = useCallback((key: string) => translate('error.' + key), [translate])
  const { isDarkColorScheme } = useColorScheme()

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
      email: '',
    },
  })
  const form = watch()

  // validate form
  const handleValidate: SubmitHandler<FieldValues> = useCallback(
    data => {
      let isValid = true

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

      return isValid
    },
    [t, setError]
  )

  // MARK: Forgot Password Submission
  const onSubmit: SubmitHandler<FieldValues> = useCallback(
    async data => {
      if (!handleValidate(data)) return

      setLoading(true)

      try {
        // send request to server
        const { message } = await forgotPasswordApi(data)

        // show success message
        Toast.show({
          type: 'success',
          text1: tSuccess('Reset link sent'),
          text2: tSuccess(message),
        })
      } catch (err: any) {
        // show error message
        console.error(err)
        Toast.show({
          type: 'error',
          text1: tError('Something went wrong'),
          text2: tError(err.message),
        })
      } finally {
        // stop loading
        setLoading(false)
      }
    },
    [handleValidate, tSuccess, tError]
  )

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
                  {t('Reset Your Password')}
                </Text>
                <Text className="text-center text-muted-foreground">
                  {t('Enter your email to receive a password reset link')}
                </Text>

                <Separator className="my-4 h-0" />

                <View className="flex-col gap-6">
                  {/* MARK: Username */}
                  <CustomInput
                    id="email"
                    label={t('Email')}
                    value={form.email}
                    placeholder="..."
                    onChange={setValue}
                    onFocus={() => clearErrors('email')}
                    errors={errors}
                    labelClassName="text-black"
                    inputClassName="text-black"
                    containerClassName="bg-white"
                  />
                </View>

                {/* MARK: Submit Button */}
                <TouchableOpacity
                  className={cn(
                    'mt-6 h-12 w-full flex-row items-center justify-center rounded-full bg-neutral-900',
                    loading && 'opacity-50'
                  )}
                  onPress={handleSubmit(onSubmit)}
                  disabled={loading}
                  style={{ marginTop: 36 }}
                >
                  {loading ? (
                    <ActivityIndicator />
                  ) : (
                    <Text className="font-semibold text-white">{t('Send Reset Link')}</Text>
                  )}
                </TouchableOpacity>
              </View>

              <View className="mb-8 flex-row justify-center text-center">
                <TouchableOpacity onPress={() => router.replace('/auth/sign-in')}>
                  <Text className="text-muted-foreground underline">{t('Back to Sign In')}</Text>
                </TouchableOpacity>
              </View>

              <Separator className="h-5" />
            </View>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </View>
  )
}

export default ForgotPasswordPage

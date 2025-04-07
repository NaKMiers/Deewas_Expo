import CustomInput from '@/components/CustomInput'
import Text from '@/components/Text'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { commonEmailMistakes } from '@/constants/mistakes'
import { useAppDispatch } from '@/hooks/reduxHook'
import { cn } from '@/lib/utils'
import { forgotPasswordApi } from '@/requests'
import { router } from 'expo-router'
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

function ForgotPasswordPage() {
  // hooks
  const dispatch = useAppDispatch()
  let { t: translate, i18n } = useTranslation()
  const t = (key: string) => translate('forgotPasswordPage.' + key)
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
      email: '',
    },
  })

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
    [setError, t]
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
    [setLoading, t]
  )

  return (
    <ScrollView>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex h-screen flex-1 items-center justify-center"
        keyboardVerticalOffset={21}
      >
        <View className="flex h-screen w-screen flex-1 items-center justify-center px-21">
          <View
            className={cn(
              'w-full max-w-[400px] overflow-hidden rounded-2xl border border-primary bg-white text-black'
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

              <View className="flex flex-col gap-6">
                {/* MARK: Username */}
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
                  <Text className="font-semibold text-white">{t('Send Reset Link')}</Text>
                )}
              </Button>
            </View>

            <View className="mb-8 flex flex-row justify-center text-center">
              <TouchableOpacity onPress={() => router.replace('/auth/login')}>
                <Text className="text-muted-foreground underline">{t('Back to Login')}</Text>
              </TouchableOpacity>
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
        </View>
      </KeyboardAvoidingView>
    </ScrollView>
  )
}

export default ForgotPasswordPage

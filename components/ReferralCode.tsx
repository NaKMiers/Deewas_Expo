import useSettings from '@/hooks/useSettings'
import { cn } from '@/lib/utils'
import { applyReferralCodeApi } from '@/requests'
import { LucideHelpCircle, LucideSend } from 'lucide-react-native'
import React, { memo, useCallback, useState } from 'react'
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, View } from 'react-native'
import Toast from 'react-native-toast-message'
import ConfirmDialog from './dialogs/ConfirmDialog'
import Icon from './Icon'
import { useAuth } from './providers/AuthProvider'
import Text from './Text'
import { Button } from './ui/button'
import { Input } from './ui/input'

function ReferralCode() {
  // hooks
  const { refreshToken } = useAuth()
  const { t: translate } = useTranslation()
  const { settings, refetch: refetchSettings } = useSettings()
  const t = useCallback((key: string) => translate('referralCode.' + key), [translate])
  const tSuccess = useCallback((key: string) => translate('success.' + key), [translate])
  const tError = useCallback((key: string) => translate('error.' + key), [translate])
  const tERROR_CODE = useCallback((key: string) => translate('ERROR_CODE.' + key), [translate])

  // states
  const [sending, setSending] = useState<boolean>(false)

  // form
  const {
    setValue,
    handleSubmit,
    setError,
    watch,
    clearErrors,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      referralCode: '',
    },
  })
  const form = watch()

  // handle send referral code
  const handleSendReferralCode: SubmitHandler<FieldValues> = useCallback(
    async (data: any) => {
      if (data.referralCode.trim() === '' || data.referralCode.trim().length < 5) return

      // start loading
      setSending(true)

      try {
        await applyReferralCodeApi(data.referralCode.trim())
        Toast.show({
          type: 'success',
          text1: t('Referral Code'),
          text2: tSuccess('Referral code applied successfully'),
        })
        refetchSettings()
        refreshToken()
      } catch (err: any) {
        console.log(err)
        setError('referralCode', {
          type: 'manual',
          message: err.errorCode ? tERROR_CODE(err.errorCode) : tError('Failed to apply referral code'),
        })
      } finally {
        // stop loading
        setSending(false)
      }
    },
    [refetchSettings, refreshToken, setError, t, tSuccess, tError, tERROR_CODE]
  )

  return (
    <>
      <View className="flex-row items-center gap-2">
        <Text className="pl-1 text-lg font-semibold">{t('Referral Code')}</Text>
        <ConfirmDialog
          label={t('Referral Code')}
          desc={t('Enter your referral code to get 2 days of Premium for free')}
          cancelLabel="OK"
          trigger={
            <Icon
              render={LucideHelpCircle}
              size={18}
              color="#ffffff80"
            />
          }
        />
      </View>
      <View className="mt-1 flex-row items-center gap-1.5">
        <Input
          className={cn(
            'flex-1 bg-secondary px-21/2 uppercase !ring-0 md:text-sm',
            errors.referralCode && 'border border-rose-500'
          )}
          placeholder="..."
          value={settings?.referralCode || form.referralCode}
          onChangeText={value => setValue('referralCode', value)}
          maxLength={10}
          onFocus={() => clearErrors('referralCode')}
          editable={!settings?.referralCode}
        />

        {!settings?.referralCode && (
          <Button
            className={cn('w-12 bg-secondary', errors.referralCode && 'border border-rose-500')}
            disabled={form.referralCode.trim().length < 5 || sending}
            onPress={handleSubmit(handleSendReferralCode)}
          >
            {sending ? (
              <ActivityIndicator />
            ) : (
              <Icon
                render={LucideSend}
                size={20}
              />
            )}
          </Button>
        )}
      </View>
      {errors.referralCode?.message && (
        <Text className="mt ml-1 mt-0.5 text-rose-500 drop-shadow-lg">
          {errors.referralCode?.message?.toString()}
        </Text>
      )}
    </>
  )
}

export default memo(ReferralCode)

import { useAuth } from '@/components/providers/AuthProvider'
import SettingsBox from '@/components/SettingsBox'
import Text from '@/components/Text'
import { Button } from '@/components/ui/button'
import { shortName } from '@/lib/string'
import { updateUserApi } from '@/requests'
import { Redirect, router } from 'expo-router'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { SafeAreaView, View } from 'react-native'

function WizardPage() {
  // hooks
  const { user } = useAuth()
  const { t: translate } = useTranslation()
  const t = (key: string) => translate('wizardPage.' + key)

  if (user?.initiated) {
    return <Redirect href="/" />
  }

  // update user initiated
  const handleUpdateInitiated = useCallback(async () => {
    try {
      await updateUserApi({ initiated: true })
      router.replace('/')
    } catch (err: any) {
      console.log(err)
    }
  }, [])

  return (
    <SafeAreaView className="flex flex-1 flex-row items-center justify-center">
      <View className="flex flex-row items-center justify-center gap-4 px-21/2 md:px-21">
        <View className="flex max-w-2xl flex-col gap-4">
          <View>
            <Text className="text-center text-3xl">
              {t('Welcome')}, <Text className="ml-2 font-bold">{user && shortName(user)}! 👋</Text>
            </Text>
            <Text className="mt-4 text-center text-base text-muted-foreground">
              {t("Let's start with some simple settings")}
            </Text>
            <Text className="mt-2 text-center text-sm text-muted-foreground">
              {t('You can change these settings at any time')}
            </Text>
          </View>

          <View className="h-px w-full border-t border-slate-200/30" />

          <SettingsBox />

          <View className="h-px w-full border-t border-slate-200/30" />

          <Button
            variant="outline"
            className="flex h-10 w-full items-center justify-center rounded-md text-center text-sm font-semibold"
            onPress={handleUpdateInitiated}
          >
            <Text>{t("I'm done! Take me to the dashboard")}</Text>
          </Button>
        </View>
      </View>
    </SafeAreaView>
  )
}

export default WizardPage

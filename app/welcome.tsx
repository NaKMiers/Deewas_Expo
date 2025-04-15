import { images } from '@/assets/images/images'
import Image from '@/components/Image'
import { useAuth } from '@/components/providers/AuthProvider'
import Text from '@/components/Text'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { languages } from '@/constants/settings'
import { useColorScheme } from '@/lib/useColorScheme'
import { BASE_URL } from '@/lib/utils'
import { Redirect, router } from 'expo-router'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function WelcomePage() {
  // hooks
  const { user, onboarding } = useAuth()
  const { isDarkColorScheme } = useColorScheme()
  const { t: translate, i18n } = useTranslation()
  const t = (key: string) => translate('welcomePage.' + key)
  const locale = i18n.language

  // states
  const [selectedLanguage, setSelectedLanguage] = useState<any>(languages.find(l => l.value === locale))

  // handle change language
  const handleChangeLanguage = useCallback(
    (nextLocale: string) => {
      i18n.changeLanguage(nextLocale)
      setSelectedLanguage(
        languages.find(l => l.value === nextLocale) || { locale: 'en', label: 'English' }
      )
    },
    [i18n, languages]
  )

  // go home if user is logged in
  if (user) return <Redirect href="/home" />
  if (onboarding) return <Redirect href="/auth/register" />

  return (
    <>
      <Image
        source={isDarkColorScheme ? images.block2 : images.block1}
        resizeMode="cover"
        className="h-full w-full"
        style={{ position: 'absolute' }}
      />
      <SafeAreaView className="flex-1">
        {/* Language */}
        <View className="flex flex-row items-center justify-end px-21/2 py-21/2 md:px-21">
          <Select
            value={selectedLanguage.value}
            onValueChange={option => {
              if (!option) return
              handleChangeLanguage(option.value)
            }}
          >
            <SelectTrigger
              className="border-transparent bg-transparent"
              style={{ height: 36 }}
            >
              <Text>{selectedLanguage.label}</Text>
            </SelectTrigger>

            <SelectContent className="border-transparent bg-secondary shadow-none">
              {languages.map((item, index) => (
                <SelectItem
                  value={item.value}
                  label={item.label}
                  key={index}
                />
              ))}
            </SelectContent>
          </Select>
        </View>

        <View className="mx-auto max-w-[500px] flex-1">
          <Text className="flex items-end text-center text-4xl font-bold tracking-wider">
            DEEWAS
            <Text className="text-[40px] font-bold text-green-500">.</Text>
          </Text>

          <View className="flex-1 py-2">
            <Image
              source={images.robot}
              height={500}
              width={500}
              resizeMode="contain"
              className="h-full w-full"
            />
          </View>

          <View className="px-21/2 md:px-21">
            <View>
              <Text className="text-center text-3xl font-bold tracking-tighter text-secondary">
                {t("Ever wonder where your money goes - and why it's never enough?")}
              </Text>
              <Text className="mt-2 text-center text-lg font-medium tracking-tighter text-secondary">
                {t('Powered by AI, Deewas helps you track, save smarter, and finally feel in control')}.
              </Text>
            </View>

            <View className="my-21 gap-21/2">
              <TouchableOpacity
                className="flex items-center justify-center rounded-full bg-secondary px-21 py-4"
                onPress={() => router.push('/onboarding')}
              >
                <Text className="text-lg font-semibold">{t('Try Deewas for Free')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex items-center justify-center rounded-full bg-secondary/20 px-21 py-4"
                onPress={() => router.push('/auth/login')}
              >
                <Text className="text-lg font-semibold text-secondary/80">
                  {t('I Already Have an Account')}
                </Text>
              </TouchableOpacity>
            </View>

            <View>
              <Text className="text-center text-sm font-medium text-secondary">
                {t('By trying Deewas, you agree to the')}
              </Text>
              <Text className="text-center text-sm font-medium text-secondary">
                {t('Deewas')}{' '}
                <Text
                  className="font-semibold text-sky-500"
                  onPress={() => Linking.openURL(BASE_URL + '/privacy-policy')}
                >
                  {t('Privacy Policy')}
                </Text>{' '}
                {t('and')}{' '}
                <Text
                  className="font-semibold text-sky-500"
                  onPress={() => Linking.openURL(BASE_URL + '/terms-and-service')}
                >
                  {t('Terms of Service')}
                </Text>{' '}
                {t('of Deewas')}
              </Text>
            </View>
          </View>
        </View>

        <Separator className="my-2.5 h-0" />
      </SafeAreaView>
    </>
  )
}

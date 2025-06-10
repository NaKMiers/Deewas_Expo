import { images } from '@/assets/images/images'
import { useAuth } from '@/components/providers/AuthProvider'
import Text from '@/components/Text'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { languages } from '@/constants/settings'
import useLanguage from '@/hooks/useLanguage'
import { useColorScheme } from '@/lib/useColorScheme'
import { Redirect, router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Image, ScrollView, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

function WelcomePage() {
  // hooks
  const { user, onboarding } = useAuth()
  const { isDarkColorScheme } = useColorScheme()
  const { t: translate } = useTranslation()
  const t = (key: string) => translate('welcomePage.' + key)
  const { changeLanguage, language } = useLanguage()

  // go home if user is logged in
  if (user) return <Redirect href="/home" />
  else if (onboarding) return <Redirect href="/auth/sign-in" />

  return (
    <View className="flex-1 bg-primary-foreground">
      <Image
        source={isDarkColorScheme ? images.block2 : images.block1}
        resizeMode="cover"
        className="h-full w-full"
        style={{ position: 'absolute' }}
      />
      <SafeAreaView className="flex-1">
        {/* Language */}
        <View className="flex-row items-center justify-end px-21/2 py-21/2 md:px-21">
          <Select
            value={language}
            onValueChange={option => {
              if (!option) return
              changeLanguage(option.value)
            }}
          >
            <SelectTrigger
              className="border-transparent bg-transparent"
              style={{ height: 36 }}
            >
              <Text>{language.label}</Text>
            </SelectTrigger>

            <SelectContent className="border-transparent bg-secondary shadow-none">
              <ScrollView>
                {languages.map((item, index) => (
                  <SelectItem
                    value={item.value}
                    label={item.label}
                    key={index}
                  />
                ))}
              </ScrollView>
            </SelectContent>
          </Select>
        </View>

        {/* Main */}
        <View className="mx-auto max-w-[500px] flex-1">
          <Text className="items-end text-center text-4xl font-bold tracking-wider">
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
              <Text
                className="rounded-md bg-primary text-center text-3xl font-bold tracking-tighter text-secondary"
                style={{ paddingTop: 4 }}
              >
                {t("Ever wonder where your money goes - and why it's never enough?")}
              </Text>
              <Text className="mt-2 text-center text-lg font-medium tracking-tighter text-secondary">
                {t('Powered by AI, Deewas helps you track, save smarter, and finally feel in control')}.
              </Text>
            </View>

            <View className="my-21 gap-21/2">
              <TouchableOpacity
                className="items-center justify-center rounded-full bg-secondary px-21 py-4"
                onPress={() => router.push('/onboarding')}
              >
                <Text className="text-lg font-semibold">{t('Try Deewas for Free')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="items-center justify-center rounded-full bg-secondary/20 px-21 py-4"
                onPress={() => router.push('/auth/sign-in')}
              >
                <Text className="text-lg font-semibold text-secondary/80">
                  {t('I Already Have an Account')}
                </Text>
              </TouchableOpacity>
            </View>

            <View>
              <Text className="text-center text-sm font-medium tracking-tight text-secondary">
                {t('By trying Deewas, you agree to the')}
              </Text>
              <Text className="text-center text-sm font-medium tracking-tight text-secondary">
                {t('Deewas')}{' '}
                <Text
                  className="font-semibold tracking-tight text-sky-500"
                  onPress={() => router.push('/privacy-policy')}
                >
                  {t('Privacy Policy')}
                </Text>{' '}
                {t('and')}{' '}
                <Text
                  className="font-semibold tracking-tight text-sky-500"
                  onPress={() => router.push('/terms-and-conditions')}
                >
                  {t('Terms of Conditions')}
                </Text>{' '}
                {t('of Deewas')}
              </Text>
            </View>
          </View>
        </View>

        <Separator className="my-2.5 h-0" />
      </SafeAreaView>
    </View>
  )
}

export default WelcomePage

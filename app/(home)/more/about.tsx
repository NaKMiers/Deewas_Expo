import Icon from '@/components/Icon'
import Text from '@/components/Text'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { router } from 'expo-router'
import { BarChart, LucideBrainCog, LucidePieChart, LucideWallet } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { SafeAreaView, ScrollView, TouchableOpacity, View } from 'react-native'

const features = [
  {
    title: 'Multi-Wallet Support',
    description: 'Manage multiple wallets seamlessly to keep your finances organized',
    icon: LucideWallet,
  },
  {
    title: 'Insightful Charts',
    description: 'Visualize your spending with beautiful, interactive charts',
    icon: BarChart,
  },
  {
    title: 'Budget Planning',
    description: 'Set budgets and stay on top of your financial goals',
    icon: LucidePieChart,
  },
  {
    title: 'Smart AI Assistant',
    description: 'Get help from our AI to manage transactions effortlessly',
    icon: LucideBrainCog,
  },
]

export default function AboutPage() {
  // hooks
  const { t: translate } = useTranslation()
  const t = (key: string) => translate('aboutPage.' + key)

  return (
    <SafeAreaView className="flex-1">
      <ScrollView>
        <View className="p-21/2 md:p-21">
          {/* Header */}
          <View className="py-10">
            <Text className="text-center text-4xl font-bold tracking-tight">{t('About Deewas')}</Text>
            <Text className="mt-2 text-center text-lg text-muted-foreground">
              {t('Your personal expense management companion')}
            </Text>
          </View>

          {/* Main Content */}
          <View className="mx-auto w-full max-w-[1200px] py-12 lg:px-8">
            {/* Introduction */}
            <View className="mb-12 text-center">
              <Text className="text-center text-2xl font-bold">{t('What is Deewas?')}</Text>
              <Text className="mx-auto mt-4 max-w-2xl text-center leading-6 text-muted-foreground">
                {t(
                  'Deewas is a modern, user-friendly app designed to help you track and manage your personal finances effortlessly'
                )}
                .{' '}
                {t(
                  "Whether it's budgeting, tracking transactions, or managing wallets, Deewas has you covered"
                )}
                .
              </Text>
            </View>

            {/* Features */}
            <View className="mb-12">
              <Text className="mb-6 text-center text-2xl font-bold">{t('Key Features')}</Text>
              <View className="flex flex-wrap gap-6">
                {features.map((feature, index) => (
                  <Card
                    className="w-full"
                    key={index}
                  >
                    <CardHeader>
                      <View className="flex-row items-center gap-2">
                        <Icon render={feature.icon} />
                        <Text className="font-body text-xl font-semibold">{t(feature.title)}</Text>
                      </View>
                    </CardHeader>
                    <CardContent>
                      <Text className="text-lg leading-6 text-muted-foreground">
                        {t(feature.description)}.
                      </Text>
                    </CardContent>
                  </Card>
                ))}
              </View>
            </View>

            {/* Separator */}
            <Separator className="my-12" />

            {/* Mission */}
            <View className="mb-12">
              <Text className="text-center text-2xl font-bold text-foreground">{t('Our Mission')}</Text>
              <Text className="mx-auto mt-4 max-w-2xl text-center text-lg leading-6 text-muted-foreground">
                {t(
                  'At Deewas, we aim to empower individuals to take control of their finances with intuitive tools and smart insights, making money management simple and stress-free'
                )}
                .
              </Text>
            </View>

            {/* CTA */}
            <View className="">
              <Text className="mb-4 text-center text-2xl font-bold text-foreground">
                {t('Ready to Get Started?')}
              </Text>
              <Text className="mb-6 text-center text-lg leading-6 text-muted-foreground">
                {t('Join thousands of users who trust Deewas to manage their expenses')}.
              </Text>
              <TouchableOpacity
                activeOpacity={0.7}
                className="flex-row items-center justify-center rounded-lg bg-primary p-4 shadow-md"
                onPress={() => router.push('/home')}
              >
                <Text className="text-xl font-semibold text-secondary">{t('Start Now')}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <View className="py-6">
            <Text className="text-center text-muted-foreground">
              © {new Date().getFullYear()} {t('Deewas')}. {t('All rights reserved')}.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

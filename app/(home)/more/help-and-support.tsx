import BlurView from '@/components/BlurView'
import Icon from '@/components/Icon'
import Text from '@/components/Text'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { router } from 'expo-router'
import { BookOpen, LifeBuoy, Mail, MessageSquare } from 'lucide-react-native'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, SafeAreaView, ScrollView, TouchableOpacity, View } from 'react-native'

function HelpAndSupportPage() {
  // hooks
  const { t: translate } = useTranslation()
  const t = (key: string) => translate('helpAndSupportPage.' + key)

  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index)
  }

  const supportEmail = process.env.EXPO_PUBLIC_SUPPORT_EMAIL || 'deewas.now@gmail.com'

  const faqs = [
    {
      question: t('How do I add a new transaction?'),
      answer: `${t('Go to the Transactions page, click “Add Transaction,” and fill in the details like name, amount, and category')}. ${t('Our AI can also help via chat!')}`,
    },
    {
      question: t('Can I manage multiple wallets?'),
      answer: `${t('Yes! Deewas supports multiple wallets')}. ${t('Add them in the Wallets section and track separately')}.`,
    },
    {
      question: t('How do I set a budget?'),
      answer: `${t('Navigate to Budgets, click “Create Budget,” and specify the category, total amount, and time range')}.`,
    },
    {
      question: t('What if I forget my password?'),
      answer: `${t('Use the “Forgot Password” link on the sign-in screen to reset it via email')}.`,
    },
  ]

  return (
    <SafeAreaView className="flex-1">
      <BlurView
        className="flex-1"
        intensity={90}
      >
        <ScrollView>
          <View className="p-21/2 md:p-21">
            {/* Header */}
            <View className="py-10">
              <Text className="text-center text-4xl font-bold tracking-tight">
                {t('Help & Support')}
              </Text>
              <Text className="mt-2 text-center text-lg text-muted-foreground">
                {t("We're here to assist you with Deewas!")}
              </Text>
            </View>

            {/* Main Content */}
            <View className="mx-auto w-full max-w-[1200px] py-12 lg:px-8">
              {/* Quick Links */}
              <View className="mb-12">
                <Text className="mb-6 text-center text-2xl font-bold">{t('Quick Links')}</Text>
                <View className="flex-wrap gap-6">
                  <Card className="w-full">
                    <CardHeader>
                      <View className="flex-row items-center gap-2">
                        <Icon
                          render={BookOpen}
                          size={20}
                          className="text-primary"
                        />
                        <Text className="font-body text-xl font-semibold">{t('User Guide')}</Text>
                      </View>
                    </CardHeader>
                    <CardContent>
                      <Text className="text-lg text-muted-foreground">
                        {t('Learn how to use Deewas with our detailed guide')}.
                      </Text>
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => router.push('/more/guide')}
                        className="mt-2"
                      >
                        <Text className="text-primary underline">{t('Read Guide')}</Text>
                      </TouchableOpacity>
                    </CardContent>
                  </Card>
                  <Card className="w-full">
                    <CardHeader>
                      <View className="flex-row items-center gap-2">
                        <Icon
                          render={MessageSquare}
                          size={20}
                          className="text-primary"
                        />
                        <Text className="font-body text-xl font-semibold">{t('Contact Support')}</Text>
                      </View>
                    </CardHeader>
                    <CardContent>
                      <Text className="text-lg text-muted-foreground">
                        {t('Reach out to our team for personalized help')}.
                      </Text>
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => Linking.openURL(`mailto:${supportEmail}`)}
                        className="mt-2"
                      >
                        <Text className="text-primary underline">{t('Email Us')}</Text>
                      </TouchableOpacity>
                    </CardContent>
                  </Card>
                  <Card className="w-full">
                    <CardHeader>
                      <View className="flex-row items-center gap-2">
                        <Icon
                          render={LifeBuoy}
                          size={20}
                          className="text-primary"
                        />
                        <Text className="font-body text-xl font-semibold">FAQ</Text>
                      </View>
                    </CardHeader>
                    <CardContent>
                      <Text className="text-lg text-muted-foreground">
                        {t('Find answers to common questions below')}.
                      </Text>
                      <TouchableOpacity
                        activeOpacity={0.7}
                        className="mt-2"
                      >
                        <Text className="text-primary underline">{t('View FAQ')}</Text>
                      </TouchableOpacity>
                    </CardContent>
                  </Card>
                </View>
              </View>

              {/* Separator */}
              <Separator className="my-12" />

              {/* FAQ */}
              <View
                className="mb-12"
                id="faq"
              >
                <Text className="mb-6 text-center text-2xl font-bold">
                  {t('Frequently Asked Questions')}
                </Text>
                <View className="mx-auto w-full max-w-3xl">
                  {faqs.map((faq, index) => (
                    <View
                      key={index}
                      className="mb-4 rounded-lg border border-border"
                    >
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => toggleFAQ(index)}
                        className="flex-row items-center justify-between p-4"
                      >
                        <Text className="text-lg font-semibold">{faq.question}</Text>
                        <Text className="text-lg">{expandedIndex === index ? '−' : '+'}</Text>
                      </TouchableOpacity>
                      {expandedIndex === index && (
                        <View className="flex-row p-4 pt-0">
                          <Text className="text-muted-foreground">{faq.answer}</Text>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              </View>

              {/* Separator */}
              <Separator className="my-12" />

              {/* Contact Us */}
              <View className="text-center">
                <Text className="mb-4 text-center text-2xl font-bold text-foreground">
                  {t('Still Need Help?')}
                </Text>
                <Text className="mx-auto mb-6 max-w-xl text-center leading-6 text-muted-foreground">
                  {t('Our support team is available 24/7 to assist you')}.{' '}
                  {t("Drop us a message, and we'll get back to you as soon as possible")}.
                </Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => Linking.openURL(`mailto:${supportEmail}`)}
                  className="flex-row items-center justify-center gap-21/2 rounded-lg bg-primary p-4 shadow-md"
                >
                  <Icon
                    render={Mail}
                    size={20}
                    reverse
                  />
                  <Text className="text-xl font-semibold text-secondary">{t('Contact Support')}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Footer */}
            <View className="py-6">
              <Text className="text-center text-muted-foreground">
                © 2025 Deewas. All rights reserved.
              </Text>
            </View>
          </View>

          <Separator className="my-4 h-0" />
        </ScrollView>
      </BlurView>
    </SafeAreaView>
  )
}

export default HelpAndSupportPage

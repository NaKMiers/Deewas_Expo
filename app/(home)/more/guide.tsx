import Icon from '@/components/Icon'
import Text from '@/components/Text'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { BarChart, Heart, Mail, PlusCircle, Wallet } from 'lucide-react-native'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, SafeAreaView, ScrollView, TouchableOpacity, View } from 'react-native'

function GuidePage() {
  // hooks
  const { t: translate } = useTranslation()
  const t = (key: string) => translate('guidePage.' + key)

  const [activeTab, setActiveTab] = useState('transactions')
  const supportEmail = process.env.EXPO_PUBLIC_SUPPORT_EMAIL || 'deewas.now@gmail.com'

  const tabs: any[] = [
    { key: 'transactions', title: t('Transactions') },
    { key: 'wallets', title: t('Wallets') },
    { key: 'categories', title: t('Categories') },
    { key: 'budgets', title: t('Budgets') },
  ]

  const guideContent: any = {
    transactions: {
      title: t('Managing Transactions'),
      description: `${t('Track your income and expenses effortlessly')}.`,
      icon: PlusCircle,
      sections: [
        {
          title: `1. ${t('Adding a Transaction')}`,
          content: [
            `- ${t('Navigate to the “Transactions“ screen from the navbar')}.`,
            `- ${t('Click the Add “Transaction“ button')}.`,
            `- ${t('Fill in details: name (e.g., Coffee), amount (e.g., $5), date, wallet, and category')}.`,
            `- ${t('Click “Save“ to record it')}.`,
            `_${t('Tip: Use the AI chat to say Add $5 coffee expense today for a quicker way!')}_`,
          ],
        },
        {
          title: `2. ${t('Editing a Transaction')}`,
          content: [
            `- ${t('Find the transaction in the list')}.`,
            `- ${t('Click the ✏️ icon next to it')}.`,
            `- ${t('Update the details and save')}.`,
          ],
        },
        {
          title: `3. ${t('Deleting a Transaction')}`,
          content: [
            `- ${t('Locate the transaction')}.`,
            `- ${t('Click the 🗑️ icon')}.`,
            `- ${t('Confirm deletion in the dialog')}.`,
          ],
        },
      ],
    },
    wallets: {
      title: t('Managing Wallets'),
      description: `${t('Organize your money across multiple wallets')}.`,
      icon: Wallet,
      sections: [
        {
          title: `1. ${t('Creating a Wallet')}`,
          content: [
            `- ${t('Go to the “Home“ screen')}.`,
            `- ${t('Click “Add Wallet“')}.`,
            `- ${t('Enter a name (e.g., Cash) and choose an icon')}.`,
            `- ${t('Save to create it')}.`,
          ],
        },
        {
          title: `2. ${t('Transferring Funds')}`,
          content: [
            `- ${t('Select a wallet and click “Transfer“')}.`,
            `- ${t('Choose the destination wallet and amount')}.`,
            `- ${t('Confirm the transfer')}.`,
          ],
        },
        {
          title: `3. ${t('Viewing Wallet Details')}`,
          content: [`- ${t('Click a wallet to see its transactions and balance')}.`],
        },
      ],
    },
    categories: {
      title: t('Managing Categories'),
      description: `${t('Classify your transactions with custom categories')}.`,
      icon: BarChart,
      sections: [
        {
          title: `1. ${t('Adding a Category')}`,
          content: [
            `- ${t('Visit the “Categories“ screen')}.`,
            `- ${t('Click “Add Category“')}.`,
            `- ${t('Specify name (e.g., Food), type (e.g., expense), and icon')}.`,
            `- ${t('Save it')}.`,
          ],
        },
        {
          title: `2. ${t('Editing a Category')}`,
          content: [
            `- ${t('Find the category and click ✏️')}.`,
            `- ${t('Update the name or icon, then save')}.`,
          ],
        },
        {
          title: `3. ${t('Deleting a Category')}`,
          content: [
            `- ${t('Click 🗑️ next to the category')}.`,
            `- ${t('Confirm deletion (note: only deletable categories can be removed)')}.`,
          ],
        },
      ],
    },
    budgets: {
      title: t('Managing Budgets'),
      description: `${t('Plan and control your spending with budgets')}.`,
      icon: Heart,
      sections: [
        {
          title: `1. ${t('Setting a Budget')}`,
          content: [
            `- ${t('Go to the “Budgets“ screen')}.`,
            `- ${t('Click “Create Budget“')}.`,
            `- ${t('Choose a category, set a total amount, and define start/end dates')}.`,
            `- ${t('Save to activate it')}.`,
          ],
        },
        {
          title: `2. ${t('Monitoring Your Budget')}`,
          content: [
            `- ${t('View the budget card to see spent vs')}. ${t('total amount')}.`,
            `- ${t('Transactions in the category auto-update the budget')}.`,
          ],
        },
        {
          title: `3. ${t('Adjusting a Budget')}`,
          content: [
            `- ${t('Click ✏️ on the budget')}.`,
            `- ${t('Modify the total or dates, then save')}.`,
          ],
        },
      ],
    },
  }

  return (
    <SafeAreaView className="flex-1">
      <ScrollView>
        <View className="p-21/2 md:p-21">
          {/* Header */}
          <View className="py-10">
            <Text className="text-center text-4xl font-bold tracking-tight">
              {t('Deewas User Guide')}
            </Text>
            <Text className="mt-2 text-center text-lg text-muted-foreground">
              {t('Learn how to master your finances with Deewas')}
            </Text>
          </View>

          {/* Main Content */}
          <View className="mx-auto w-full max-w-[1200px] py-12 lg:px-8">
            {/* Introduction */}
            <View className="mb-12">
              <Text className="text-center text-2xl font-bold">{t('Welcome to Deewas')}</Text>
              <Text className="mx-auto mt-4 max-w-2xl text-center leading-6 text-muted-foreground">
                {t(
                  'This guide will walk you through the core features of Deewas, from managing transactions to setting budgets'
                )}
                . {t("Let's get started!")}
              </Text>
              <TouchableOpacity
                activeOpacity={0.7}
                className="mt-4 rounded-lg border border-border px-4 py-2"
              >
                <Text className="text-center text-primary">{t('Jump to Guide')}</Text>
              </TouchableOpacity>
            </View>

            {/* Separator */}
            <Separator className="my-12" />

            {/* Guide Content with Tabs */}
            <View id="getting-started">
              <Text className="mb-6 text-center text-2xl font-bold">{t('Step-by-Step Guide')}</Text>
              <View className="mb-6 flex flex-row flex-wrap justify-center gap-2">
                {tabs.map(tab => (
                  <TouchableOpacity
                    key={tab.key}
                    activeOpacity={0.7}
                    onPress={() => setActiveTab(tab.key)}
                    className={cn(
                      'rounded-lg px-4 py-2',
                      activeTab === tab.key ? 'bg-primary text-secondary' : 'bg-secondary/20'
                    )}
                  >
                    <Text
                      className={cn(
                        'font-semibold',
                        activeTab === tab.key ? 'text-secondary' : 'text-foreground'
                      )}
                    >
                      {tab.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Card>
                <CardHeader>
                  <View className="flex-row items-center gap-2">
                    <Icon
                      render={guideContent[activeTab].icon}
                      size={20}
                      className="text-primary"
                    />
                    <Text className="font-body text-xl font-semibold">
                      {guideContent[activeTab].title}
                    </Text>
                  </View>
                  <Text className="text-lg text-muted-foreground">
                    {guideContent[activeTab].description}
                  </Text>
                </CardHeader>
                <CardContent>
                  <ScrollView>
                    <View className="gap-2">
                      {guideContent[activeTab].sections.map((section: any, index: number) => (
                        <View key={index}>
                          <Text className="text-lg font-medium">{section.title}</Text>
                          {section.content.map((line: any, idx: number) => (
                            <Text
                              key={idx}
                              className={`mt-2 text-lg text-muted-foreground ${
                                line.startsWith('_') ? 'italic' : ''
                              }`}
                            >
                              {line}
                            </Text>
                          ))}
                        </View>
                      ))}
                    </View>
                  </ScrollView>
                </CardContent>
              </Card>
            </View>

            {/* Separator */}
            <Separator className="my-12" />

            {/* Additional Resources */}
            <View className="text-center">
              <Text className="mb-4 text-center text-2xl font-bold text-foreground">
                {t('Need More Help?')}
              </Text>
              <Text className="mx-auto mb-6 max-w-xl text-center text-lg leading-6 text-muted-foreground">
                {t('Check out our support page or contact us for further assistance')}.
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
                <Text className="text-xl font-semibold text-secondary">{t('Go to Support')}</Text>
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

export default GuidePage

import { images } from '@/assets/images/images'
import { TabsContent } from '@/components/ui/tabs'
import { useAppSelector } from '@/hooks/reduxHook'
import { checkLevel, formatCurrency } from '@/lib/string'
import { cn } from '@/lib/utils'
import { differenceInDays } from 'date-fns'
import { router } from 'expo-router'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { ImageBackground, TouchableOpacity, View } from 'react-native'
import { Bar as ProgressBar } from 'react-native-progress'
import BudgetCard from './BudgetCard'
import Text from './Text'

interface IBudgetTabProps {
  value: string
  begin: Date | string
  end: Date | string
  budgets: IFullBudget[]
  className?: string
}

function BudgetTab({ value, begin, end, budgets, className }: IBudgetTabProps) {
  // hooks
  const { t: translate, i18n } = useTranslation()
  const t = (key: string) => translate('budgetTab.' + key)
  const locale = i18n.language

  // store
  const currency = useAppSelector(state => state.settings.settings?.currency)

  // values
  const total = budgets.reduce((acc: number, budget: IFullBudget) => acc + budget.total, 0)
  const amount = budgets.reduce((acc: number, budget: IFullBudget) => acc + budget.amount, 0)
  const daysLeft = differenceInDays(new Date(end), new Date())
  let dailyLimit = (total - amount) / daysLeft
  dailyLimit = dailyLimit > 10000 ? Math.round(dailyLimit) : dailyLimit

  return (
    <TabsContent
      value={value}
      className={cn(className)}
    >
      {/* Budget Overview */}
      <ImageBackground
        source={images.preBgVFlip}
        className="flex-col items-center justify-center gap-21 overflow-hidden rounded-b-3xl rounded-t-md p-21 px-21/2 py-21 text-center shadow-lg md:px-21"
      >
        <View className="flex-col items-center gap-21/2">
          <Text className="text-center font-semibold text-neutral-800">{t('Amount you can spend')}</Text>
          {currency && (
            <Text className="text-4xl font-semibold text-green-500">
              {formatCurrency(currency, total - amount)}
            </Text>
          )}
          <ProgressBar
            progress={amount / total}
            width={250}
            height={8}
            color={checkLevel((amount / total) * 100).hex}
            unfilledColor="#333"
            borderWidth={0}
            borderRadius={5}
            animated={true}
          />
        </View>

        {currency && (
          <>
            <View className="w-full flex-row items-start justify-center gap-21">
              <View className="flex-1 flex-col items-center gap-1">
                <Text className="font-semibold text-violet-500">{formatCurrency(currency, total)}</Text>
                <Text className="font-semibold tracking-tight text-black">{t('Total budgets')}</Text>
              </View>
              <View className="flex-1 flex-col items-center gap-1">
                <Text className="font-semibold text-violet-500">{formatCurrency(currency, amount)}</Text>
                <Text className="font-semibold tracking-tight text-black">{t('Total spent')}</Text>
              </View>
            </View>
            <View className="w-full flex-row items-start justify-center gap-21">
              <View className="flex-1 flex-col items-center gap-1">
                <Text className="font-semibold text-violet-500">
                  {daysLeft} {t('day')}
                  {daysLeft !== 1 && locale === 'en' && 's'}
                </Text>
                <Text className="font-semibold tracking-tight text-black">{t('End of month')}</Text>
              </View>
              <View className="flex-1 flex-col items-center gap-1">
                <Text className="font-semibold text-violet-500">
                  {total - amount > 0
                    ? formatCurrency(currency, dailyLimit) + '/' + t('day')
                    : formatCurrency(currency, 0)}
                </Text>
                <Text className="font-semibold tracking-tight text-black">{t('Daily limit')}</Text>
              </View>
            </View>
          </>
        )}

        {/* MARK: Create Budget */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push('/create-budget')}
          className="h-12 flex-row items-center justify-center rounded-full bg-primary px-21"
        >
          <Text className="font-semibold text-secondary">{t('Create Budget')}</Text>
        </TouchableOpacity>
      </ImageBackground>

      {/* Budget List */}
      <View className="mt-21/2 flex-col gap-2">
        {budgets.map((budget: IFullBudget) => (
          <BudgetCard
            begin={begin}
            end={end}
            budget={budget}
            key={budget._id}
          />
        ))}
      </View>
    </TabsContent>
  )
}

export default memo(BudgetTab)

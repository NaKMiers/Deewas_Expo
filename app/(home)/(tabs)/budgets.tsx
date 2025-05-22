import BudgetTab from '@/components/BudgetTab'
import Icon from '@/components/Icon'
import { useAuth } from '@/components/providers/AuthProvider'
import Text from '@/components/Text'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs } from '@/components/ui/tabs'
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { refresh } from '@/lib/reducers/loadReducer'
import { setStep } from '@/lib/reducers/tutorialReducer'
import { formatTimeRange } from '@/lib/time'
import { cn } from '@/lib/utils'
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet'
import SegmentedControl from '@react-native-segmented-control/segmented-control'
import { router } from 'expo-router'
import { LucidePlus } from 'lucide-react-native'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { RefreshControl, SafeAreaView, ScrollView, TouchableOpacity, View } from 'react-native'
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads'

const adUnitId = __DEV__ ? TestIds.ADAPTIVE_BANNER : process.env.EXPO_PUBLIC_ADMOD_BANNER_ID!

function BudgetsPage() {
  // hooks
  const { isPremium } = useAuth()
  const dispatch = useAppDispatch()
  const { t: translate } = useTranslation()
  const t = useCallback((key: string) => translate('budgetPage.' + key), [translate])

  // store
  const { budgets, loading } = useAppSelector(state => state.budget)
  const { refreshing } = useAppSelector(state => state.load)
  const { step, inProgress } = useAppSelector(state => state.tutorial)

  // states
  const [groups, setGroups] = useState<any[]>([])
  const [tab, setTab] = useState<string>(groups?.[0]?.[0])
  const [tabLabels, setTabLabels] = useState<string[]>([])

  // ad states
  const [adLoaded, setAdLoaded] = useState<boolean>(false)

  useEffect(() => {
    const groups: {
      [key: string]: {
        begin: string
        end: string
        budgets: IFullBudget[]
      }
    } = {}

    budgets.forEach((budget: IFullBudget) => {
      const key = `${budget.begin}-${budget.end}`

      if (!groups[key]) {
        groups[key] = {
          begin: budget.begin,
          end: budget.end,
          budgets: [],
        }
      }

      groups[key].budgets.push(budget)
    })

    const results = Object.entries(groups)

    setGroups(results)
    setTab(results?.[0]?.[0])

    const tabLabels = results.map(([_key, { begin, end }]) => formatTimeRange(begin, end, t))
    setTabLabels(tabLabels)
  }, [budgets, t])

  return (
    <SafeAreaView className="flex-1">
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => dispatch(refresh())}
          />
        }
      >
        <View className="p-21/2 md:p-21">
          {!loading ? (
            groups.length > 0 ? (
              <Tabs
                value={tab}
                onValueChange={value => setTab(value)}
                className="w-full"
              >
                <View className="mb-2.5 mt-21/2">
                  <SegmentedControl
                    values={tabLabels}
                    style={{
                      width: '100%',
                      height: 40,
                    }}
                    selectedIndex={Math.max(0, groups.map(([key]) => key).indexOf(tab))}
                    onChange={(event: any) => {
                      const index = event.nativeEvent.selectedSegmentIndex
                      setTab(groups[index][0])
                    }}
                  />
                </View>
                {groups.map(([key, { begin, end, budgets }]) => (
                  <BudgetTab
                    value={key}
                    begin={begin}
                    end={end}
                    budgets={budgets}
                    key={key}
                  />
                ))}
              </Tabs>
            ) : (
              <View className="flex-row items-center justify-center rounded-md border border-muted-foreground/50 px-21/2 py-7">
                <Text className="text-center text-lg font-semibold text-muted-foreground/50">
                  {t("You don't have any budgets yet, create one now!")}
                </Text>
              </View>
            )
          ) : (
            <View className="flex-col gap-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-96 w-full" />
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton
                  className="h-24 w-full"
                  key={index}
                />
              ))}
            </View>
          )}
        </View>

        <Separator className="my-24 h-0" />
      </ScrollView>

      {/* MARK: Create Transaction */}
      {inProgress && (step === 7 || step === 9) && <View className="absolute z-10 h-screen w-screen" />}
      <View
        className={cn(
          'absolute right-21/2 z-20',
          inProgress && step === 7 && 'right-0 rounded-lg border-2 border-sky-500 bg-sky-500/10 p-21/2'
        )}
        style={{ bottom: adLoaded && !isPremium ? 78 : 10 }}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            router.push('/create-budget')
            if (inProgress && step === 7) dispatch(setStep(8))
          }}
          className="h-11 flex-row items-center justify-center gap-1 rounded-full bg-primary px-4"
        >
          <Icon
            render={LucidePlus}
            size={20}
            reverse
          />
          <Text className="font-semibold text-secondary">{t('Create Budget')}</Text>
        </TouchableOpacity>
      </View>

      {/* MARK: Banner Ads */}
      {!isPremium && (
        <View
          className="absolute bottom-2.5 left-1/2 z-20 max-h-[60px] -translate-x-1/2 flex-row items-center justify-center gap-1 overflow-hidden rounded-lg bg-primary"
          style={{ width: SCREEN_WIDTH - 21 }}
        >
          <BannerAd
            unitId={adUnitId}
            size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
            onAdLoaded={() => setAdLoaded(true)}
            onAdFailedToLoad={() => setAdLoaded(false)}
            onAdClosed={() => setAdLoaded(false)}
          />
        </View>
      )}
    </SafeAreaView>
  )
}

export default BudgetsPage

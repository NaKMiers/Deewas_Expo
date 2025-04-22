import BudgetTab from '@/components/BudgetTab'
import CreateBudgetDrawer from '@/components/dialogs/CreateBudgetDrawer'
import Icon from '@/components/Icon'
import Text from '@/components/Text'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs } from '@/components/ui/tabs'
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { addBudget, setBudgets } from '@/lib/reducers/budgetReducer'
import { refresh } from '@/lib/reducers/loadReducer'
import { formatTimeRange } from '@/lib/time'
import { getMyBudgetsApi } from '@/requests'
import SegmentedControl from '@react-native-segmented-control/segmented-control'
import { LucidePlus } from 'lucide-react-native'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { RefreshControl, SafeAreaView, ScrollView, View } from 'react-native'

function BudgetsPage() {
  // hooks
  const dispatch = useAppDispatch()
  const { t: translate } = useTranslation()
  const t = (key: string) => translate('budgetPage.' + key)

  // store
  const { budgets } = useAppSelector(state => state.budget)
  const { refreshing, refreshPoint } = useAppSelector(state => state.load)

  // states
  const [loading, setLoading] = useState<boolean>(false)
  const [groups, setGroups] = useState<any[]>([])
  const [tab, setTab] = useState<string>(groups?.[0]?.[0])
  const [tabLabels, setTabLabels] = useState<string[]>([])

  // initial fetch
  useEffect(() => {
    const getBudgets = async () => {
      // start loading
      setLoading(true)

      try {
        const { budgets } = await getMyBudgetsApi()
        dispatch(setBudgets(budgets))
      } catch (err: any) {
        console.log(err)
      } finally {
        // stop loading
        setLoading(false)
      }
    }

    getBudgets()
  }, [dispatch, refreshPoint])

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

    const tabLabels = results.map(([key, { begin, end }]) => formatTimeRange(begin, end))
    setTabLabels(tabLabels)
  }, [budgets])

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
                    style={{ width: '100%', height: 40 }}
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
              <View className="flex flex-row items-center justify-center rounded-md border border-muted-foreground/50 px-21/2 py-7">
                <Text className="text-center text-lg font-semibold text-muted-foreground/50">
                  {t("You don't have any budgets yet, create one now!")}
                </Text>
              </View>
            )
          ) : (
            <View className="flex flex-col gap-2">
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

        <Separator className="my-16 h-0" />
      </ScrollView>

      {/* MARK: Create Transaction */}
      <CreateBudgetDrawer
        update={(budget: IFullBudget) => dispatch(addBudget(budget))}
        trigger={
          <View className="absolute bottom-2.5 right-21/2 z-20 flex h-11 flex-row items-center justify-center gap-1 rounded-full bg-primary px-4">
            <Icon
              render={LucidePlus}
              size={20}
              reverse
            />
            <Text className="font-semibold text-secondary">{t('Create Budget')}</Text>
          </View>
        }
        reach={2}
      />
    </SafeAreaView>
  )
}

export default BudgetsPage

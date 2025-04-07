import BudgetTab from '@/components/BudgetTab'
import CreateBudgetDrawer from '@/components/dialogs/CreateBudgetDrawer'
import Icon from '@/components/Icon'
import Text from '@/components/Text'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { addBudget, setBudgets } from '@/lib/reducers/budgetReducer'
import { refresh } from '@/lib/reducers/loadReducer'
import { formatTimeRange } from '@/lib/time'
import { cn } from '@/lib/utils'
import { getMyBudgetsApi } from '@/requests'
import { IFullBudget } from '@/types/type'
import { LucidePlus } from 'lucide-react-native'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, RefreshControl, SafeAreaView, ScrollView, View } from 'react-native'

function BudgetsPage() {
  // hooks
  const dispatch = useAppDispatch()
  const { t: translate } = useTranslation()
  const t = (key: string) => translate('budgetPage.' + key)
  const tSuccess = (key: string) => translate('success.' + key)
  const tError = (key: string) => translate('error.' + key)

  // store
  const { budgets } = useAppSelector(state => state.budget)
  const { refreshing, refreshPoint } = useAppSelector(state => state.load)

  // states
  const [loading, setLoading] = useState<boolean>(false)
  const [groups, setGroups] = useState<any[]>([])
  const [tab, setTab] = useState<string>(groups?.[0]?.[0])

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
                <TabsList
                  className="flex h-12 flex-row justify-start shadow-md"
                  style={{ marginBottom: 12 }}
                >
                  <FlatList
                    horizontal
                    data={groups}
                    renderItem={({ item: [key, { begin, end, budgets }] }) => (
                      <TabsTrigger
                        value={key}
                        className={cn('line-clamp-1 h-full w-1/3 min-w-max flex-1')}
                        style={{
                          flexShrink: 0,
                          width: groups.length === 1 ? '100%' : groups.length === 2 ? '50%' : '33.33%',
                        }}
                        key={key}
                      >
                        <Text className="capitalize">{formatTimeRange(begin, end)}</Text>
                      </TabsTrigger>
                    )}
                  />
                </TabsList>
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
      />
    </SafeAreaView>
  )
}

export default BudgetsPage

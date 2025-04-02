import CategoryGroup from '@/components/CategoryGroup'
import Text from '@/components/Text'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { setCategories } from '@/lib/reducers/categoryReduce'
import { cn } from '@/lib/utils'
import { getMyCategoriesApi } from '@/requests/categoryRequests'
import { ICategory, TransactionType } from '@/types/type'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, SafeAreaView, ScrollView, View } from 'react-native'
import Toast from 'react-native-toast-message'

function CategoriesPage() {
  // hooks
  const dispatch = useAppDispatch()
  const { t: translate } = useTranslation()
  const t = (key: string) => translate('categoriesPage.' + key)
  const tSuccess = (key: string) => translate('success.' + key)
  const tError = (key: string) => translate('error.' + key)

  // store
  const { categories } = useAppSelector(state => state.category)
  const { refetching: rfc } = useAppSelector(state => state.load)

  // states
  const [loading, setLoading] = useState<boolean>(false)
  const [groups, setGroups] = useState<any[]>([])
  const [tab, setTab] = useState<TransactionType>('expense')

  // get categories
  useEffect(() => {
    const getCategories = async () => {
      // stat loading
      setLoading(true)

      try {
        const { categories } = await getMyCategoriesApi()
        dispatch(setCategories(categories))
      } catch (err: any) {
        Toast.show({
          type: 'error',
          text1: tError('Failed to get categories'),
        })

        console.error(err)
      } finally {
        // stop loading
        setLoading(false)
      }
    }

    getCategories()
  }, [dispatch, rfc])

  // auto group categories by type
  useEffect(() => {
    // group categories by type
    const groups = categories.reduce((acc: any, category: any) => {
      if (!acc[category.type]) {
        acc[category.type] = []
      }

      acc[category.type].push(category)

      return acc
    }, {})

    setGroups(Object.entries(groups))
  }, [categories])

  return (
    <SafeAreaView>
      <ScrollView>
        <View className="container px-21/2 pb-32 pt-21/2 md:px-21 md:pt-21">
          {/* Top */}
          <View className="mb-1 flex-row flex-wrap items-center justify-between gap-2">
            <Text className="text-lg font-bold">Categories</Text>
          </View>

          {/* Categories Groups */}
          {!loading ? (
            groups.length > 0 ? (
              <Tabs
                value={tab}
                onValueChange={value => setTab(value as TransactionType)}
                className="w-full"
              >
                <TabsList
                  className="flex h-12 flex-row justify-start overflow-y-auto"
                  style={{ marginBottom: 12 }}
                >
                  <FlatList
                    horizontal
                    data={groups}
                    renderItem={({ item: [key] }) => (
                      <TabsTrigger
                        value={key}
                        className={cn('line-clamp-1 h-full w-1/3 min-w-max flex-1')}
                        style={{
                          flexShrink: 0,
                          width: groups.length === 1 ? '100%' : groups.length === 2 ? '50%' : '33.33%',
                        }}
                        key={key}
                      >
                        <Text className="capitalize">{key}</Text>
                      </TabsTrigger>
                    )}
                  />
                </TabsList>

                {groups.map(([type, categories]) => (
                  <CategoryGroup
                    type={type as TransactionType}
                    categories={categories.filter((category: ICategory) => category.type === type)}
                    key={type}
                  />
                ))}
              </Tabs>
            ) : (
              <View className="flex flex-row items-center justify-center rounded-md border border-muted-foreground/50 px-21/2 py-7">
                <Text className="text-center text-lg font-semibold text-muted-foreground/50">
                  {t("You don't have any categories yet, create one now!")}
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

          {/* MARK: Create Category */}
          {/* <CreateCategoryDrawer
            update={category => dispatch(addCategory(category))}
            trigger={
              <Button
                variant="default"
                className="fixed bottom-[calc(78px)] right-2 z-20 h-10 rounded-full xl:right-[calc(50%-640px+21px)]"
              >
                <Icon render={LucidePlus} size={24} />
                {t('Create Category')}
              </Button>
            }
          /> */}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default CategoriesPage

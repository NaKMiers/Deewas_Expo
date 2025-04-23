import CategoryGroup from '@/components/CategoryGroup'
import CreateCategoryDrawer from '@/components/dialogs/CreateCategoryDrawer'
import Icon from '@/components/Icon'
import NoItemsFound from '@/components/NoItemsFound'
import Text from '@/components/Text'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs } from '@/components/ui/tabs'
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { addCategory, setCategories } from '@/lib/reducers/categoryReduce'
import { refresh, setRefreshing } from '@/lib/reducers/loadReducer'
import { capitalize } from '@/lib/string'
import { getMyCategoriesApi } from '@/requests/categoryRequests'
import SegmentedControl from '@react-native-segmented-control/segmented-control'
import { LucidePlus } from 'lucide-react-native'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { RefreshControl, SafeAreaView, ScrollView, View } from 'react-native'
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads'
import Toast from 'react-native-toast-message'

const adUnitId = __DEV__ ? TestIds.ADAPTIVE_BANNER : process.env.EXPO_PUBLIC_ADMOD_BANNER_ID!

function CategoriesPage() {
  // hooks
  const dispatch = useAppDispatch()
  const { t: translate } = useTranslation()
  const t = (key: string) => translate('categoriesPage.' + key)
  const tError = (key: string) => translate('error.' + key)

  // store
  const { categories } = useAppSelector(state => state.category)
  const { refreshing, refreshPoint } = useAppSelector(state => state.load)

  // states
  const [loading, setLoading] = useState<boolean>(false)
  const [groups, setGroups] = useState<any[]>([])
  const [tab, setTab] = useState<TransactionType>('expense')
  const [tabLabels, setTabLabels] = useState<TransactionType[]>([])

  // ad states
  const [adLoaded, setAdLoaded] = useState<boolean>(false)

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
        dispatch(setRefreshing(false))
      }
    }

    getCategories()
  }, [dispatch, refreshPoint])

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

    const results = Object.entries(groups)
    setGroups(results)

    const labels = results.map(([key]) => key)
    setTabLabels(labels as TransactionType[])
  }, [categories])

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
          {/* Top */}
          <View className="flex-row flex-wrap items-center justify-between gap-2">
            <Text className="pl-1 text-xl font-bold">Categories</Text>
          </View>

          {/* Categories Groups */}
          {!loading ? (
            groups.length > 0 ? (
              <Tabs
                value={tab}
                onValueChange={value => setTab(value as TransactionType)}
                className="w-full"
              >
                <View className="mb-2.5 mt-21/2">
                  <SegmentedControl
                    values={tabLabels.map(label => capitalize(label))}
                    style={{ width: '100%', height: 40 }}
                    selectedIndex={tabLabels.indexOf(tab)}
                    onChange={(event: any) => {
                      const index = event.nativeEvent.selectedSegmentIndex
                      setTab(groups[index][0])
                    }}
                  />
                </View>

                {groups.map(([type, categories]) => (
                  <CategoryGroup
                    type={type as TransactionType}
                    categories={categories.filter((category: ICategory) => category.type === type)}
                    key={type}
                  />
                ))}
              </Tabs>
            ) : (
              <NoItemsFound
                className="mt-21/2 px-0"
                text={t("You don't have any categories yet, create one now!")}
              />
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

        <Separator className="my-24 h-0" />
      </ScrollView>

      {/* MARK: Create Category */}
      <CreateCategoryDrawer
        update={category => dispatch(addCategory(category))}
        refresh={() => dispatch(refresh())}
        trigger={
          <View
            className="absolute right-21/2 z-20 flex h-11 flex-row items-center justify-center gap-1 rounded-full bg-primary px-4"
            style={{ bottom: adLoaded ? 78 : 10 }}
          >
            <Icon
              render={LucidePlus}
              size={20}
              reverse
            />
            <Text className="font-semibold text-secondary">{t('Create Category')}</Text>
          </View>
        }
      />

      <View className="absolute bottom-2.5 z-20 flex flex-row items-center justify-center gap-1 overflow-hidden rounded-lg bg-primary">
        <BannerAd
          unitId={adUnitId}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          onAdLoaded={() => setAdLoaded(true)}
          onAdFailedToLoad={() => setAdLoaded(false)}
          onAdClosed={() => setAdLoaded(false)}
        />
      </View>
    </SafeAreaView>
  )
}

export default CategoriesPage

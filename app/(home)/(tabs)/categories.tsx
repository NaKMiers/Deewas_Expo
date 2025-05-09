import CategoryGroup from '@/components/CategoryGroup'
import Icon from '@/components/Icon'
import NoItemsFound from '@/components/NoItemsFound'
import { useAuth } from '@/components/providers/AuthProvider'
import Text from '@/components/Text'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs } from '@/components/ui/tabs'
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { refresh } from '@/lib/reducers/loadReducer'
import { capitalize } from '@/lib/string'
import SegmentedControl from '@react-native-segmented-control/segmented-control'
import { router } from 'expo-router'
import { LucideChevronLeft, LucidePlus } from 'lucide-react-native'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { RefreshControl, SafeAreaView, ScrollView, TouchableOpacity, View } from 'react-native'
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads'

const adUnitId = __DEV__ ? TestIds.ADAPTIVE_BANNER : process.env.EXPO_PUBLIC_ADMOD_BANNER_ID!

function CategoriesPage() {
  // hooks
  const { isPremium } = useAuth()
  const dispatch = useAppDispatch()
  const { t: translate } = useTranslation()
  const t = (key: string) => translate('categoriesPage.' + key)

  // store
  const { categories } = useAppSelector(state => state.category)
  const { refreshing } = useAppSelector(state => state.load)
  const [isFirstRender, setIsFirstRender] = useState<boolean>(true)

  // states
  const [groups, setGroups] = useState<any[]>([])
  const [tab, setTab] = useState<TransactionType>('expense')
  const [tabLabels, setTabLabels] = useState<TransactionType[]>([])

  // ad states
  const [adLoaded, setAdLoaded] = useState<boolean>(false)

  useEffect(() => {
    if (categories.length > 0) {
      setIsFirstRender(false)
    }
  }, [categories])

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

    const order = ['expense', 'income', 'invest', 'saving']
    const results = Object.entries(groups)
      .sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0]))
      .map(([key, value]) => [key, value])
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
          <View className="flex-row flex-wrap items-center gap-21/2">
            <TouchableOpacity
              activeOpacity={0.7}
              className="rounded-full bg-secondary p-1.5"
              onPress={() => router.push('/account')}
            >
              <Icon
                render={LucideChevronLeft}
                size={22}
              />
            </TouchableOpacity>
            <Text className="pl-1 text-xl font-bold">{t('Categories')}</Text>
          </View>

          {/* Categories Groups */}
          {isFirstRender ? (
            <View className="mt-21/2 flex-col gap-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton
                  className="h-40 w-full"
                  key={index}
                />
              ))}
            </View>
          ) : groups.length > 0 ? (
            <Tabs
              value={tab}
              onValueChange={value => setTab(value as TransactionType)}
              className="w-full"
            >
              {/* MARK: Segments */}
              <View className="mb-2.5 mt-21/2">
                <SegmentedControl
                  values={tabLabels.map(label => capitalize(t(label)))}
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
              text={t("You don't have any wallets yet, create one now!")}
            />
          )}
        </View>

        <Separator className="my-24 h-0" />
      </ScrollView>

      {/* MARK: Create Category */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => router.push('/create-category')}
        className="absolute right-21/2 z-20 h-11 flex-row items-center justify-center gap-1 rounded-full bg-primary px-4"
        style={{ bottom: adLoaded ? 78 : 10 }}
      >
        <Icon
          render={LucidePlus}
          size={20}
          reverse
        />
        <Text className="font-semibold text-secondary">{t('Create Category')}</Text>
      </TouchableOpacity>

      {/* MARK: Banner Ads */}
      {!isPremium && (
        <View className="absolute bottom-2.5 z-20 max-h-[60px] flex-row items-center justify-center gap-1 overflow-hidden rounded-lg bg-primary">
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

export default CategoriesPage

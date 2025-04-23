import Creations from '@/components/Creations'
import History from '@/components/History'
import Icon from '@/components/Icon'
import LatestTransactions from '@/components/LatestTransactions'
import Overview from '@/components/Overview'
import { Separator } from '@/components/ui/separator'
import Wallets from '@/components/Wallets'
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { refresh } from '@/lib/reducers/loadReducer'
import { LucidePlus } from 'lucide-react-native'
import React, { useEffect } from 'react'
import { RefreshControl, SafeAreaView, ScrollView, View } from 'react-native'
import { AdEventType, AppOpenAd, BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads'

const adBannerId = __DEV__ ? TestIds.ADAPTIVE_BANNER : process.env.EXPO_PUBLIC_ADMOD_BANNER_ID!
const adAppOpenId = __DEV__ ? TestIds.APP_OPEN : process.env.EXPO_PUBLIC_ADMOD_APPOPEN_ID!

const appOpenAd = AppOpenAd.createForAdRequest(adAppOpenId, {
  requestNonPersonalizedAdsOnly: true,
})

function HomePage() {
  const dispatch = useAppDispatch()
  const { refreshing } = useAppSelector(state => state.load)

  useEffect(() => {
    // Load and show AppOpen Ad when page mounts
    const unsubscribeLoaded = appOpenAd.addAdEventListener(AdEventType.LOADED, () => {
      appOpenAd.show()
    })

    // Handle errors
    const unsubscribeError = appOpenAd.addAdEventListener(AdEventType.ERROR, error => {
      console.error('AppOpen Ad failed:', error)
    })

    // Load the ad
    appOpenAd.load()

    // Clean up listeners on unmount
    return () => {
      unsubscribeLoaded()
      unsubscribeError()
    }
  }, [])

  return (
    <SafeAreaView className="flex-1">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => dispatch(refresh())}
          />
        }
      >
        <View className="p-21/2 md:p-21">
          <Overview />

          <Separator className="my-4 h-0" />

          <Wallets />

          <Separator className="my-4 h-0" />

          <History />

          <Separator className="my-4 h-0" />

          <LatestTransactions />
        </View>

        <View className="px-21/2">
          <View className="mt-21 items-center justify-center overflow-hidden rounded-lg border border-border bg-white">
            <BannerAd
              unitId={adBannerId}
              size={BannerAdSize.LARGE_BANNER}
            />
          </View>
        </View>

        <Separator className="my-16 h-0" />
      </ScrollView>

      <Creations
        reach={1}
        trigger={
          <View className="absolute bottom-2.5 right-21/2 z-20 flex h-11 w-11 flex-row items-center justify-center gap-1 rounded-full bg-primary px-4">
            <Icon
              render={LucidePlus}
              size={20}
              reverse
            />
          </View>
        }
      />
    </SafeAreaView>
  )
}

export default HomePage

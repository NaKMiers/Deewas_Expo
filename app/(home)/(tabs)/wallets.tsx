import Icon from '@/components/Icon'
import NoItemsFound from '@/components/NoItemsFound'
import { useAuth } from '@/components/providers/AuthProvider'
import Text from '@/components/Text'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import WalletCard from '@/components/WalletCard'
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { refresh } from '@/lib/reducers/loadReducer'
import { getAdmobId } from '@/lib/utils'
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet'
import { router } from 'expo-router'
import { LucideChevronLeft, LucidePlus } from 'lucide-react-native'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { RefreshControl, SafeAreaView, ScrollView, TouchableOpacity, View } from 'react-native'
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads'

const adUnitId = getAdmobId('BANNER')

function WalletsPage() {
  // hooks
  const { isPremium } = useAuth()
  const dispatch = useAppDispatch()
  const { t: translate } = useTranslation()
  const t = (key: string) => translate('walletsPage.' + key)

  // store
  const { wallets } = useAppSelector(state => state.wallet)
  const { refreshing } = useAppSelector(state => state.load)
  const [isFirstRender, setIsFirstRender] = useState<boolean>(true)

  // ad states
  const [adLoaded, setAdLoaded] = useState<boolean>(false)

  useEffect(() => {
    if (wallets.length > 0) {
      setIsFirstRender(false)
    }
  }, [wallets])

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
            <Text className="pl-1 text-xl font-bold">{t('Wallets')}</Text>
          </View>

          {isFirstRender ? (
            <View className="mt-21/2 flex-col gap-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton
                  className="h-40 w-full"
                  key={index}
                />
              ))}
            </View>
          ) : wallets.length > 0 ? (
            <View className="mt-21/2 gap-21/2">
              {wallets.map(wallet => (
                <WalletCard
                  wallet={wallet}
                  key={wallet._id}
                />
              ))}
            </View>
          ) : (
            <NoItemsFound
              className="mt-21/2 px-0"
              text={t("You don't have any wallets yet, create one now!")}
            />
          )}
        </View>

        <Separator className="my-24 h-0" />
      </ScrollView>

      <View
        className="absolute right-21/2 z-20 items-end"
        style={{ bottom: 10 }}
      >
        {/* MARK: Create Wallet */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push('/create-wallet')}
          className="h-11 flex-row items-center justify-center gap-1 rounded-full bg-primary px-4"
        >
          <Icon
            render={LucidePlus}
            size={20}
            reverse
          />
          <Text className="font-semibold text-secondary">{t('Create Wallet')}</Text>
        </TouchableOpacity>

        {/* MARK: Banner Ads */}
        {!isPremium && (
          <View
            className="mt-4 max-h-[60px] flex-row items-center justify-center gap-1 overflow-hidden rounded-lg bg-primary"
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
      </View>
    </SafeAreaView>
  )
}

export default WalletsPage

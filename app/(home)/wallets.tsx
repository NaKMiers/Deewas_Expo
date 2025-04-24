import CreateWalletDrawer from '@/components/dialogs/CreateWalletDrawer'
import Icon from '@/components/Icon'
import NoItemsFound from '@/components/NoItemsFound'
import Text from '@/components/Text'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import WalletCard from '@/components/WalletCard'
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { refresh } from '@/lib/reducers/loadReducer'
import { addWallet } from '@/lib/reducers/walletReducer'
import { router } from 'expo-router'
import { LucideChevronLeft, LucidePlus } from 'lucide-react-native'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { RefreshControl, SafeAreaView, ScrollView, TouchableOpacity, View } from 'react-native'
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads'

const adUnitId = __DEV__ ? TestIds.ADAPTIVE_BANNER : process.env.EXPO_PUBLIC_ADMOD_BANNER_ID!

function WalletsPage() {
  // hooks
  const dispatch = useAppDispatch()
  const { t: translate } = useTranslation()
  const t = (key: string) => translate('walletsPage.' + key)
  const tError = (key: string) => translate('error.' + key)

  // store
  const { wallets, curWallet, loading } = useAppSelector(state => state.wallet)
  const { refreshing, refreshPoint } = useAppSelector(state => state.load)
  const [isFirstRender, setIsFirstRender] = useState<boolean>(true)

  useEffect(() => {
    if (wallets.length > 0) {
      setIsFirstRender(false)
    }
  }, [wallets])

  // ad states
  const [adLoaded, setAdLoaded] = useState<boolean>(false)

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
            <View className="mt-21/2 flex flex-col gap-2">
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

      {/* MARK: Create Wallet */}
      <CreateWalletDrawer
        update={(wallet: IWallet) => dispatch(addWallet(wallet))}
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
            <Text className="font-semibold text-secondary">{t('Create Wallet')}</Text>
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

export default WalletsPage

import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { setWallets } from '@/lib/reducers/walletReducer'
import { cn } from '@/lib/utils'
import { IWallet } from '@/types/type'
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet'
import { LucidePlusSquare } from 'lucide-react-native'
import { memo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, FlatList, View } from 'react-native'
import CreateWalletDrawer from './dialogs/CreateWalletDrawer'
import Icon from './Icon'
import NoItemsFound from './NoItemsFound'
import Text from './Text'
import { Skeleton } from './ui/skeleton'
import WalletCard from './WalletCard'

interface WalletProps {
  className?: string
}

const IPAD_THRESHOLD = 768

function Wallets({ className }: WalletProps) {
  // hooks
  const dispatch = useAppDispatch()
  const { t: translate } = useTranslation()
  const t = (key: string) => translate('wallets.' + key)

  // store
  const { wallets, loading } = useAppSelector(state => state.wallet)

  // states
  const [creating, setCreating] = useState<boolean>(false)

  // values
  const isIpad = SCREEN_WIDTH > IPAD_THRESHOLD

  return (
    <View className={cn(className)}>
      {/* Top */}
      <View className="mb-21/2 flex flex-row flex-wrap items-center justify-between gap-2">
        <Text className="pl-1 text-xl font-bold">{t('Wallets')}</Text>

        <View className="flex flex-row items-center justify-end gap-2">
          {/* MARK: Create Wallet */}
          <CreateWalletDrawer
            update={wallet => dispatch(setWallets([wallet, ...wallets]))}
            load={setCreating}
            disabled={creating}
            trigger={
              !creating ? (
                <View className="flex h-10 flex-row items-center gap-2 rounded-md border border-primary px-3">
                  <Text className="font-semibold">{t('New Wallet')}</Text>
                  <Icon
                    render={LucidePlusSquare}
                    size={18}
                  />
                </View>
              ) : (
                <ActivityIndicator size={16} />
              )
            }
          />
        </View>
      </View>

      {/* Wallet List */}
      {!loading ? (
        wallets.length > 0 ? (
          <FlatList
            horizontal
            data={wallets}
            keyExtractor={item => item._id}
            showsHorizontalScrollIndicator={false}
            snapToInterval={SCREEN_WIDTH}
            decelerationRate="fast"
            className="-mx-21/2"
            renderItem={({ item: wallet }: { item: IWallet }) => (
              <View
                className="px-21/2"
                style={{
                  width: isIpad ? (SCREEN_WIDTH - 21) / 2 : SCREEN_WIDTH,
                }}
              >
                <WalletCard wallet={wallet} />
              </View>
            )}
          />
        ) : (
          <NoItemsFound
            className="mt-1"
            text={t('No wallets found')}
          />
        )
      ) : (
        <Skeleton className="loading h-[150px] w-full rounded-lg px-2" />
      )}
    </View>
  )
}

export default memo(Wallets)

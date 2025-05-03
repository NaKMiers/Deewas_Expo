import { images } from '@/assets/images/images'
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import {
  setFromWallet,
  setOfWallet,
  setSelectedWallet,
  setWalletToEdit,
} from '@/lib/reducers/screenReducer'
import { deleteWallet, updateWallet } from '@/lib/reducers/walletReducer'
import { checkLevel, checkTranType, formatCurrency } from '@/lib/string'
import { cn } from '@/lib/utils'
import { deleteWalletApi, updateWalletApi } from '@/requests/walletRequests'
import { BlurView } from 'expo-blur'
import { router } from 'expo-router'
import {
  LucideArrowRightLeft,
  LucideChevronDown,
  LucideEllipsis,
  LucidePencil,
  LucidePlus,
  LucideTrash,
} from 'lucide-react-native'
import { memo, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, ImageBackground, Pressable, TouchableOpacity, View } from 'react-native'
import Collapsible from 'react-native-collapsible'
import Toast from 'react-native-toast-message'
import ConfirmDialog from './dialogs/ConfirmDialog'
import Icon from './Icon'
import Text from './Text'
import { Button } from './ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from './ui/dropdown-menu'
import { Switch } from './ui/switch'

interface WalletCardProps {
  wallet: IWallet
  hideMenu?: boolean
  className?: string
}

function WalletCard({ wallet, hideMenu, className }: WalletCardProps) {
  // hooks
  const dispatch = useAppDispatch()
  const { t: translate } = useTranslation()
  const t = (key: string) => translate('walletCard.' + key)

  // store
  const { wallets } = useAppSelector(state => state.wallet)

  // states
  const [collapsed, setCollapsed] = useState<boolean>(false)
  const [deleting, setDeleting] = useState<boolean>(false)
  const [exclude, setExclude] = useState<boolean>(wallet.exclude)

  // value
  const spentRate = wallet.income
    ? Math.round(Math.min((wallet.expense / wallet.income) * 100, 100) * 100) / 100
    : 0

  // delete wallet
  const handleDeleteWallet = useCallback(async () => {
    // start deleting
    setDeleting(true)

    try {
      const { wallet: w, message } = await deleteWalletApi(wallet._id)

      if (wallets.length > 1) {
        dispatch(deleteWallet(w))
      } else {
        dispatch(updateWallet(w))
      }
      Toast.show({
        type: 'success',
        text1: message,
      })
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: err.message,
      })
      console.log(err)
    } finally {
      // stop deleting
      setDeleting(false)
    }
  }, [dispatch, wallet._id, wallets])

  // toggle exclude
  const handleChangeExclude = useCallback(
    async (value: any) => {
      setExclude(value)

      try {
        const { wallet: w } = await updateWalletApi(wallet._id, {
          ...wallet,
          exclude: value,
        })

        setExclude(w.exclude)
        dispatch(updateWallet(w))
      } catch (err: any) {
        console.log(err)
      }
    },
    [dispatch, wallet]
  )

  return (
    <View className="shadow-md">
      <ImageBackground
        source={images.preBgVFlip}
        resizeMode="cover"
        className={cn('overflow-hidden rounded-lg bg-secondary shadow-md', className)}
      >
        <Pressable
          onPress={() => {
            if (wallets.find(w => w._id === wallet._id)) {
              dispatch(setOfWallet(wallet))
              router.push('/transactions')
            }
          }}
          className="overflow-hidden rounded-lg"
        >
          {/* MARK: Top */}
          <View className="px-21 py-2">
            <View className="flex flex-row flex-nowrap items-center justify-between gap-2">
              <View className="flex flex-row items-center gap-2 text-lg">
                {wallet.icon && <Text className="flex-shrink-0 text-xl">{wallet.icon}</Text>}
                <Text className="text-xl font-semibold text-neutral-800">{wallet.name}</Text>
              </View>

              {!hideMenu &&
                (!deleting ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <TouchableOpacity className="rounded-md p-1">
                        <Icon
                          render={LucideEllipsis}
                          color="#262626"
                        />
                      </TouchableOpacity>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="rounded-xl bg-transparent px-0 py-0"
                      onPress={e => e.stopPropagation()}
                    >
                      <BlurView
                        className="px-1 py-2"
                        tint="prominent"
                        intensity={90}
                      >
                        {/* MARK: Exclude Wallet */}
                        <Button
                          variant="ghost"
                          className="flex h-8 w-full flex-row items-center justify-start gap-2 px-1"
                        >
                          <Switch
                            checked={exclude}
                            onCheckedChange={handleChangeExclude}
                            className={cn(exclude ? 'bg-primary' : 'bg-muted-foreground')}
                            style={{ transform: [{ scale: 0.9 }] }}
                          />
                          <Text className="font-semibold">{t('Exclude')}</Text>
                        </Button>

                        {/* MARK: Create Transaction */}
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={() => {
                            dispatch(setSelectedWallet(wallet))
                            router.push('/create-transaction')
                          }}
                          className="flex h-10 w-full flex-row items-center justify-start gap-2 px-5"
                        >
                          <Icon
                            render={LucidePlus}
                            size={16}
                          />
                          <Text className="font-semibold">{t('Add Transaction')}</Text>
                        </TouchableOpacity>

                        {wallets.length > 1 && (
                          <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => {
                              dispatch(setFromWallet(wallet))
                              router.push('/transfer-fund')
                            }}
                            className="flex h-10 w-full flex-row items-center justify-start gap-2 px-5"
                          >
                            <Icon
                              render={LucideArrowRightLeft}
                              size={16}
                              color="#ec4899"
                            />
                            <Text className="font-semibold text-pink-500">{t('Transfer')}</Text>
                          </TouchableOpacity>
                        )}

                        {/* MARK: Update Wallet */}
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={() => {
                            dispatch(setWalletToEdit(wallet))
                            router.push('/update-wallet')
                          }}
                        >
                          <View className="fle h-10 w-full flex-row items-center justify-start gap-2 px-5">
                            <Icon
                              render={LucidePencil}
                              size={16}
                              color="#0ea5e9"
                            />
                            <Text className="font-semibold text-sky-500">{t('Edit')}</Text>
                          </View>
                        </TouchableOpacity>

                        <ConfirmDialog
                          label={t('Delete Wallet')}
                          desc={
                            wallets.length > 1
                              ? t('Are you sure you want to delete this wallet?')
                              : t('deleteOnlyWalletMessage')
                          }
                          confirmLabel={wallets.length > 1 ? 'Delete' : 'Clear'}
                          onConfirm={handleDeleteWallet}
                          trigger={
                            <Button
                              variant="ghost"
                              className="flex h-8 w-full flex-row items-center justify-start gap-2 px-2"
                            >
                              <Icon
                                render={LucideTrash}
                                size={16}
                                color="#f43f5e"
                              />
                              <Text className="font-semibold text-rose-500">{t('Delete')}</Text>
                            </Button>
                          }
                        />
                      </BlurView>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <ActivityIndicator />
                ))}
            </View>
          </View>

          {/* MARK: Content */}
          <View className="flex flex-col gap-2 px-4 pb-2">
            <Item
              title={t('Balance')}
              value={wallet.income + wallet.saving + wallet.invest - wallet.expense}
              type="balance"
            />
            <Collapsible
              collapsed={!collapsed}
              easing="linear"
              duration={50}
            >
              <View className="flex flex-col gap-2">
                <Item
                  title={t('Income')}
                  value={wallet.income}
                  type="income"
                />
                <Item
                  title={t('Expense')}
                  value={wallet.expense}
                  type="expense"
                />
                <Item
                  title={t('Saving')}
                  value={wallet.saving}
                  type="saving"
                />
                <Item
                  title={t('Invest')}
                  value={wallet.invest}
                  type="invest"
                />
              </View>
            </Collapsible>
          </View>

          {/* MARK: Collapse Button */}
          <Button
            className={cn('w-full flex-row items-center justify-center gap-4 rounded-none')}
            style={{ height: 32 }}
            onPress={e => {
              e.stopPropagation()
              setCollapsed(!collapsed)
            }}
          >
            {!!spentRate && (
              <View className="h-2 flex-1 rounded-lg bg-secondary">
                <View
                  className={cn('h-full rounded-full', checkLevel(spentRate).background)}
                  style={{ width: `${spentRate}%` }}
                />
              </View>
            )}

            <Icon
              render={LucideChevronDown}
              size={26}
              reverse
              className={cn('trans-200', collapsed ? 'rotate-180' : 'rotate-0')}
            />
          </Button>
        </Pressable>
      </ImageBackground>
    </View>
  )
}

export default memo(WalletCard)

interface ItemProps {
  title: string
  value: number
  type: TransactionType | 'balance'
  className?: string
}

// MARK: ITEM
function Item({ title, type, value }: ItemProps) {
  // store
  const currency = useAppSelector(state => state.settings.settings?.currency)

  // values
  const { Icon: renderIcon, background, border } = checkTranType(type)

  return (
    <View
      className={cn(
        'flex w-full flex-row items-center gap-21/2 rounded-lg border bg-secondary px-21/2 py-1',
        border
      )}
    >
      <View
        className={cn(
          'flex h-10 w-10 flex-row items-center justify-center rounded-md border-2 text-white',
          background,
          border
        )}
      >
        <Icon
          render={renderIcon}
          color="white"
          size={22}
        />
      </View>
      <View className="flex flex-col">
        <Text className="font-body tracking-wider">{title}</Text>
        <Text className="text-xl font-semibold">{currency && formatCurrency(currency, value)}</Text>
      </View>
    </View>
  )
}

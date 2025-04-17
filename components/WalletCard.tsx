import TransferFundDrawer from '@/components/dialogs/TransferFundDrawer'
import UpdateWalletDrawer from '@/components/dialogs/UpdateWalletDrawer'
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { refresh } from '@/lib/reducers/loadReducer'
import { deleteWallet, setCurWallet, updateWallet } from '@/lib/reducers/walletReducer'
import { checkLevel, checkTranType, formatCurrency } from '@/lib/string'
import { cn } from '@/lib/utils'
import { deleteWalletApi, updateWalletApi } from '@/requests/walletRequests'
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
import { ActivityIndicator, Pressable, View } from 'react-native'
import Collapsible from 'react-native-collapsible'
import Toast from 'react-native-toast-message'
import ConfirmDialog from './dialogs/ConfirmDialog'
import CreateTransactionDrawer from './dialogs/CreateTransactionDrawer'
import Icon from './Icon'
import Text from './Text'
import { Button } from './ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from './ui/dropdown-menu'
import { Switch } from './ui/switch'

interface WalletCardProps {
  wallet: IWallet
  className?: string
}

function WalletCard({ wallet, className }: WalletCardProps) {
  // hooks
  const dispatch = useAppDispatch()
  const { t: translate } = useTranslation()
  const t = (key: string) => translate('walletCard.' + key)

  // store
  const { wallets } = useAppSelector(state => state.wallet)

  // states
  const [collapsed, setCollapsed] = useState<boolean>(false)
  const [updating, setUpdating] = useState<boolean>(false)
  const [deleting, setDeleting] = useState<boolean>(false)
  const [hide, setHide] = useState<boolean>(false)

  // value
  const spentRate = wallet.income ? Math.round((wallet.expense / wallet.income) * 100 * 100) / 100 : 0

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
  }, [dispatch, wallet._id, wallets, , t])

  // toggle hide
  const handleChangeHide = useCallback(
    async (value: any) => {
      setHide(value)

      try {
        const { wallet: w } = await updateWalletApi(wallet._id, {
          ...wallet,
          hide: value,
        })

        setHide(w.hide)
        dispatch(updateWallet(w))
      } catch (err: any) {
        console.log(err)
      }
    },
    [dispatch, wallet]
  )

  return (
    <View className={cn('rounded-lg bg-secondary shadow-md', className)}>
      <Pressable
        onPress={() => {
          dispatch(setCurWallet(wallet))
          router.push('/transactions')
        }}
        className="overflow-hidden rounded-lg"
      >
        <View className="px-21 py-2">
          <View className="flex flex-row flex-nowrap items-center justify-between gap-2">
            <View className="flex flex-row items-center gap-2 text-lg">
              <Text className="flex-shrink-0 text-xl">{wallet.icon}</Text>
              <Text className="text-xl font-semibold">{wallet.name}</Text>
            </View>

            {!deleting && !updating ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                  >
                    <Icon render={LucideEllipsis} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent onPress={e => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    className="flex h-8 w-full flex-row items-center justify-start gap-2 px-1 text-violet-500"
                  >
                    <Switch
                      checked={hide}
                      onCheckedChange={handleChangeHide}
                      className="scale-90 bg-indigo-500"
                      style={{ transform: [{ scale: 0.9 }] }}
                    />
                    <Text className="font-semibold">{t('Hide')}</Text>
                  </Button>

                  {wallets.length > 1 && (
                    <TransferFundDrawer
                      initFromWallet={wallet}
                      refresh={() => dispatch(refresh())}
                      trigger={
                        <View className="flex h-10 w-full flex-row items-center justify-start gap-2 px-5">
                          <Icon
                            render={LucideArrowRightLeft}
                            size={16}
                            color="#6366f1"
                          />
                          <Text className="font-semibold text-indigo-500">{t('Transfer')}</Text>
                        </View>
                      }
                      reach={3}
                    />
                  )}

                  <CreateTransactionDrawer
                    initWallet={wallet}
                    refresh={() => dispatch(refresh())}
                    trigger={
                      <View className="flex h-10 w-full flex-row items-center justify-start gap-2 px-5">
                        <Icon
                          render={LucidePlus}
                          size={16}
                        />
                        <Text className="font-semibold">{t('Add Transaction')}</Text>
                      </View>
                    }
                    reach={3}
                  />

                  <UpdateWalletDrawer
                    update={wallet => dispatch(updateWallet(wallet))}
                    refresh={() => dispatch(refresh())}
                    wallet={wallet}
                    load={setUpdating}
                    trigger={
                      <View className="fle h-10 w-full flex-row items-center justify-start gap-2 px-5">
                        <Icon
                          render={LucidePencil}
                          size={16}
                          color="#0ea5e9"
                        />
                        <Text className="font-semibold text-sky-500">{t('Edit')}</Text>
                      </View>
                    }
                  />

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
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <ActivityIndicator />
            )}
          </View>
        </View>

        {/* Content */}
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

        {/* Collapse Button */}
        <Button
          className={cn('w-full flex-row items-center justify-between rounded-none')}
          style={{ height: 32 }}
          onPress={e => {
            e.stopPropagation()
            setCollapsed(!collapsed)
          }}
        >
          <Text className={cn('font-semibold leading-4 drop-shadow-md', checkLevel(spentRate).text)}>
            {spentRate}% {t('spent')}
          </Text>

          <Icon
            render={LucideChevronDown}
            size={26}
            reverse
            className={cn('trans-200', collapsed ? 'rotate-180' : 'rotate-0')}
          />
        </Button>
      </Pressable>
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

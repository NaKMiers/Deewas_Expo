'use client'

import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { deleteWallet, updateWallet } from '@/lib/reducers/walletReducer'
import { checkTranType, formatCurrency } from '@/lib/string'
import { cn } from '@/lib/utils'
import { deleteWalletApi, updateWalletApi } from '@/requests/walletRequests'
import { IWallet, TransactionType } from '@/types/type'
import { useRouter } from 'expo-router'
import { LucideChevronDown } from 'lucide-react-native'
import { memo, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import Toast from 'react-native-toast-message'
import Icon from './Icon'
import Text from './Text'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

interface WalletCardProps {
  wallet: IWallet
  className?: string
}

function WalletCard({ wallet, className = '' }: WalletCardProps) {
  // hooks
  const router = useRouter()
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
    <Card
      className={cn('cursor-pointer select-none overflow-hidden', className)}
      // onPress={() => {
      //   dispatch(setCurWallet(wallet))
      //   router.push('/transactions', { locale })
      // }}
    >
      <CardHeader className="py-21/2">
        <CardTitle className="flex flex-row items-center justify-between gap-2">
          <View className="flex flex-row items-center gap-2 text-lg">
            <Text className="text-xl">{wallet.icon}</Text>
            <Text className="text-xl font-semibold">{wallet.name}</Text>
          </View>

          {/* {!deleting && !updating ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                >
                  <LucideEllipsis />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent onPress={e => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  className="flex flex-row h-8 w-full items-center justify-start gap-2 px-2 text-violet-500"
                >
                  <Switch
                    checked={hide}
                    onCheckedChange={handleChangeHide}
                    className="bg-gray-300 data-[state=checked]:bg-violet-500"
                  />
                  {t('Hide')}
                </Button>

                {wallets.length > 1 && (
                  <TransferFundDrawer
                    initFromWallet={wallet}
                    trigger={
                      <Button
                        variant="ghost"
                        className="flex flex-row h-8 w-full items-center justify-start gap-2 px-2 text-indigo-500"
                      >
                        <LucideArrowRightLeft size={16} />
                        {t('Transfer')}
                      </Button>
                    }
                  />
                )}

                <CreateTransactionDrawer
                  initWallet={wallet}
                  trigger={
                    <Button
                      variant="ghost"
                      className="flex flex-row h-8 w-full items-center justify-start gap-2 px-2"
                    >
                      <LucidePlus size={16} />
                      {t('Add Transaction')}
                    </Button>
                  }
                />

                <UpdateWalletDrawer
                  update={wallet => dispatch(updateWallet(wallet))}
                  wallet={wallet}
                  load={setUpdating}
                  trigger={
                    <Button
                      variant="ghost"
                      className="flex flex-row h-8 w-full items-center justify-start gap-2 px-2 text-sky-500"
                    >
                      <LucidePencil size={16} />
                      {t('Edit')}
                    </Button>
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
                      className="flex flex-row h-8 w-full items-center justify-start gap-2 px-2 text-rose-500"
                    >
                      <LucideTrash size={16} />
                      {t('Delete')}
                    </Button>
                  }
                />
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              disabled
              variant="ghost"
              size="icon"
            >
              <LucideLoaderCircle className="animate-spin" />
            </Button>
          )} */}
        </CardTitle>
      </CardHeader>

      {/* Content */}
      <CardContent className="flex flex-col gap-2 px-4 pb-2">
        <Item
          title={t('Balance')}
          value={wallet.income + wallet.saving + wallet.invest + wallet.transfer - wallet.expense}
          type="balance"
        />
        <View
          className="trans-300 flex flex-col gap-2 overflow-hidden"
          style={{
            maxHeight: collapsed ? 400 : 0,
          }}
        >
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
          <Item
            title={t('Transfer')}
            value={wallet.transfer}
            type="transfer"
          />
        </View>
      </CardContent>

      {/* Collapse Button */}
      <Button
        className={cn(
          'flex w-full flex-row items-center justify-center rounded-none bg-primary py-1 text-secondary'
        )}
        style={{ height: 28 }}
        onPress={e => {
          e.stopPropagation()
          setCollapsed(!collapsed)
        }}
      >
        <Icon
          render={LucideChevronDown}
          size={26}
          reverse
          className="trans-200"
          style={{
            transform: collapsed ? [{ rotate: '180deg' }] : [{ rotate: '0deg' }],
          }}
        />
      </Button>
    </Card>
  )
}

export default memo(WalletCard)

interface CardProps {
  title: string
  value: number
  type: TransactionType | 'balance'
  className?: string
}
function Item({ title, type, value }: CardProps) {
  // store
  const currency = useAppSelector(state => state.settings.settings?.currency)

  // values
  const { Icon: renderIcon, background, border } = checkTranType(type)

  return (
    <View
      className={`flex w-full flex-row items-center gap-21/2 rounded-lg border bg-secondary px-21/2 py-1`}
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
          size={24}
        />
      </View>
      <View className="flex flex-col">
        <Text className="font-body tracking-wider">{title}</Text>

        <Text className="text-xl font-semibold">{currency && formatCurrency(currency, value)}</Text>
      </View>
    </View>
  )
}

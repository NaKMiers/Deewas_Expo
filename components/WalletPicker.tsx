import CreateWalletDrawer from '@/components/dialogs/CreateWalletDrawer'
import UpdateWalletDrawer from '@/components/dialogs/UpdateWalletDrawer'
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { refresh } from '@/lib/reducers/loadReducer'
import { addWallet, deleteWallet, setCurWallet, updateWallet } from '@/lib/reducers/walletReducer'
import { cn } from '@/lib/utils'
import { deleteWalletApi } from '@/requests/walletRequests'
import {
  LucideChevronsUpDown,
  LucideGalleryVerticalEnd,
  LucidePencil,
  LucidePlusSquare,
  LucideTrash,
} from 'lucide-react-native'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, ScrollView, TouchableOpacity, View } from 'react-native'
import Toast from 'react-native-toast-message'
import ConfirmDialog from './dialogs/ConfirmDialog'
import Icon from './Icon'
import { useDrawer } from './providers/DrawerProvider'
import Text from './Text'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Separator } from './ui/separator'
import { Skeleton } from './ui/skeleton'

interface WalletPickerProps {
  onChange: (wallet: IWallet | null) => void
  isAllowedAll?: boolean
  className?: string
}

function WalletPicker({ isAllowedAll, onChange, className }: WalletPickerProps) {
  // hooks
  const { t: translate } = useTranslation()
  const t = (key: string) => translate('walletPicker.' + key)
  const dispatch = useAppDispatch()

  // store
  const { wallets, loading } = useAppSelector(state => state.wallet)
  const { closeDrawer2: closeDrawer } = useDrawer()
  const [deleting, setDeleting] = useState<string>('')

  const [filterText, setFilterText] = useState<string>('')

  // delete wallet
  const handleDeleteWallet = useCallback(
    async (id: string) => {
      // start deleting
      setDeleting(id)

      try {
        const { wallet: w, message } = await deleteWalletApi(id)

        if (wallets.length > 1) {
          dispatch(deleteWallet(w))
        } else {
          dispatch(updateWallet(w))
        }

        Toast.show({
          type: 'success',
          text1: t('Wallet deleted'),
        })
      } catch (err: any) {
        Toast.show({
          type: 'error',
          text1: t('Failed to delete wallet'),
        })
        console.log(err)
      } finally {
        // stop deleting
        setDeleting('')
      }
    },
    [dispatch, wallets, , t]
  )

  return (
    <View className={cn('w-full p-0', className)}>
      <View className='mx-auto w-full max-w-sm px-21/2'>
        <View>
          <Text className='text-center text-xl font-semibold'>{t('Select Wallet')}</Text>
          <Text className='text-center text-muted-foreground'>
            {t('Wallets are used to group your transactions by source of funds')}
          </Text>
        </View>

        <View className='mt-6 rounded-lg border'>
          <Input
            autoFocus={false}
            className='text-base md:text-sm'
            placeholder={t('Find a wallet') + '...'}
            value={filterText}
            onChangeText={text => setFilterText(text)}
          />

          <CreateWalletDrawer
            update={wallet => dispatch(addWallet(wallet))}
            refresh={() => dispatch(refresh())}
            trigger={
              <View className='mb-0.5 flex h-12 w-full flex-row items-center justify-start gap-2 rounded-none border-b border-secondary px-4'>
                <Icon render={LucidePlusSquare} size={18} />
                <Text className='font-semibold'>{t('Create Wallet')}</Text>
              </View>
            }
          />

          {isAllowedAll && (
            <TouchableOpacity
              className='flex w-full flex-row items-center gap-2 px-4 py-2'
              onPress={() => {
                onChange(null)
                closeDrawer()
              }}
              disabled={false}
            >
              <Icon render={LucideGalleryVerticalEnd} size={20} />
              <Text className='text-base font-semibold'>{t('All wallets')}</Text>
            </TouchableOpacity>
          )}

          <ScrollView style={{ maxHeight: 400 }}>
            {wallets
              .filter(wallet => {
                const key = wallet.name.toLowerCase() + wallet.icon.toLowerCase()
                return key.includes(filterText.toLowerCase())
              })
              .map(wallet => (
                <TouchableOpacity
                  activeOpacity={0.7}
                  className='flex h-10 flex-1 flex-row items-center justify-between gap-2 py-2'
                  onPress={() => {
                    onChange(wallet)
                    isAllowedAll && dispatch(setCurWallet(wallet))
                    closeDrawer()
                  }}
                  disabled={false}
                  key={wallet._id}
                >
                  <View className='flex-1 flex-row items-center gap-2 pl-2'>
                    <Text className='text-base'>{wallet.icon}</Text>
                    <Text className='text-base font-semibold'>{wallet.name}</Text>
                  </View>

                  <View className='flex flex-row items-center justify-end gap-1'>
                    {/* MARK: Update Wallet */}
                    <UpdateWalletDrawer
                      wallet={wallet}
                      update={(wallet: IWallet) => dispatch(updateWallet(wallet))}
                      refresh={() => dispatch(refresh())}
                      trigger={
                        <View>
                          <Icon render={LucidePencil} size={18} color='#0ea5e9' />
                        </View>
                      }
                    />

                    {/* MARK: Delete Wallet */}
                    <ConfirmDialog
                      label={t('Delete wallet')}
                      desc={`${t('Are you sure you want to delete')} ${wallet.name}?`}
                      confirmLabel={t('Delete')}
                      cancelLabel={t('Cancel')}
                      onConfirm={() => handleDeleteWallet(wallet._id)}
                      disabled={deleting === wallet._id}
                      className='!h-auto !w-auto'
                      trigger={
                        <Button
                          disabled={deleting === wallet._id}
                          variant='ghost'
                          className='trans-200 h-full w-8 flex-shrink-0 rounded-md px-21/2 py-1.5 text-start text-sm font-semibold hover:bg-slate-200/30'
                        >
                          {deleting === wallet._id ? (
                            <ActivityIndicator />
                          ) : (
                            <Icon render={LucideTrash} size={18} color='#f43f5e' />
                          )}
                        </Button>
                      }
                    />
                  </View>
                </TouchableOpacity>
              ))}
          </ScrollView>
        </View>

        <Separator className='my-8' />
      </View>
    </View>
  )
}

interface WalletPickerNodeProps {
  wallet?: IWallet
  onChange: (wallet: IWallet | null) => void
  isAllowedAll?: boolean
  className?: string
  [key: string]: any
}

const Node = ({ wallet, isAllowedAll, onChange, className, ...rest }: WalletPickerNodeProps) => {
  // hooks
  const { t: translate } = useTranslation()
  const t = (key: string) => translate('walletPicker.' + key)
  const { openDrawer2: openDrawer } = useDrawer()

  // store
  const { loading } = useAppSelector(state => state.wallet)

  return !loading ? (
    <Button
      variant='outline'
      className='flex h-10 flex-row items-center justify-between gap-2 border border-primary bg-white'
      onPress={() =>
        openDrawer(
          <WalletPicker
            onChange={onChange}
            isAllowedAll={isAllowedAll}
            className={cn('w-full', className)}
            {...rest}
          />,
          1
        )
      }
    >
      {wallet ? (
        <View className='flex flex-row items-center gap-2'>
          <Text className='text-base text-black'>{wallet.icon}</Text>
          <Text className='text-base font-semibold text-black'>{wallet.name}</Text>
        </View>
      ) : isAllowedAll ? (
        <View className='flex flex-row items-center gap-2'>
          <Icon render={LucideGalleryVerticalEnd} size={16} color='black' />
          <Text className='text-base font-semibold text-black'>{t('All wallets')}</Text>
        </View>
      ) : (
        <Text className='text-base font-semibold text-black'>{t('Select Wallet')}</Text>
      )}
      <Icon render={LucideChevronsUpDown} size={18} color='black' />
    </Button>
  ) : (
    <Skeleton className='h-9 w-[80px]' />
  )
}

export default Node

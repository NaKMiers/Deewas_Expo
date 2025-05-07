import CommonFooter from '@/components/dialogs/CommonFooter'
import ConfirmDialog from '@/components/dialogs/ConfirmDialog'
import DrawerWrapper from '@/components/DrawerWrapper'
import Icon from '@/components/Icon'
import Text from '@/components/Text'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import {
  setFromWallet,
  setOfWallet,
  setSelectedWallet,
  setToWallet,
  setWalletToEdit,
} from '@/lib/reducers/screenReducer'
import { deleteWallet, updateWallet } from '@/lib/reducers/walletReducer'
import { deleteWalletApi } from '@/requests/walletRequests'
import { router, useLocalSearchParams } from 'expo-router'
import {
  LucideGalleryVerticalEnd,
  LucidePencil,
  LucidePlusSquare,
  LucideTrash,
} from 'lucide-react-native'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, ScrollView, TouchableOpacity, View } from 'react-native'
import Toast from 'react-native-toast-message'

function WalletPickerPage() {
  // hooks
  const { t: translate } = useTranslation()
  const t = useCallback((key: string) => translate('walletPickerPage.' + key), [translate])
  const dispatch = useAppDispatch()
  const { isFromWallet, isToWallet, showAllOption } = useLocalSearchParams()

  // store
  const { wallets } = useAppSelector(state => state.wallet)

  // states
  const [deleting, setDeleting] = useState<string>('')
  const [filterText, setFilterText] = useState<string>('')

  // delete wallet
  const handleDeleteWallet = useCallback(
    async (id: string) => {
      // start deleting
      setDeleting(id)

      try {
        const { wallet: w } = await deleteWalletApi(id)

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
    [dispatch, wallets, t]
  )

  return (
    <DrawerWrapper>
      <View>
        <Text className="text-center text-xl font-semibold">{t('Select wallet')}</Text>
        <Text className="text-center text-muted-foreground">
          {t('Wallets are used to group your transactions by source of funds')}
        </Text>
      </View>

      <View className="mt-6 rounded-lg border border-primary">
        <Input
          autoFocus={false}
          className="text-base md:text-sm"
          placeholder={t('Find a wallet') + '...'}
          value={filterText}
          onChangeText={text => setFilterText(text)}
        />

        {/* MARK: Create Wallet */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push('/create-wallet')}
          className="mb-0.5 h-12 w-full flex-row items-center justify-start gap-2 rounded-none border-b border-secondary px-4"
        >
          <Icon
            render={LucidePlusSquare}
            size={18}
          />
          <Text className="font-semibold">{t('Create Wallet')}</Text>
        </TouchableOpacity>

        {showAllOption === 'true' && (
          <TouchableOpacity
            className="h-10 w-full flex-row items-center gap-2 px-4 py-2"
            onPress={() => {
              dispatch(setOfWallet(null))
              router.back()
            }}
            disabled={false}
          >
            <Icon
              render={LucideGalleryVerticalEnd}
              size={20}
            />
            <Text className="text-base font-semibold">{t('All wallets')}</Text>
          </TouchableOpacity>
        )}

        <ScrollView
          className="pb-21/2"
          style={{ maxHeight: 400 }}
        >
          {wallets
            .filter(wallet => {
              const key = wallet.name.toLowerCase() + wallet.icon.toLowerCase()
              return key.includes(filterText.toLowerCase())
            })
            .map(wallet => (
              <TouchableOpacity
                activeOpacity={0.7}
                className="h-10 flex-1 flex-row items-center justify-between gap-2 px-2 py-2"
                onPress={() => {
                  if (isFromWallet === 'true') dispatch(setFromWallet(wallet))
                  else if (isToWallet === 'true') dispatch(setToWallet(wallet))
                  else if (showAllOption === 'true') dispatch(setOfWallet(wallet))
                  else dispatch(setSelectedWallet(wallet))
                  router.back()
                }}
                disabled={false}
                key={wallet._id}
              >
                <View className="flex-1 flex-row items-center gap-2 pl-2">
                  <Text className="text-base">{wallet.icon}</Text>
                  <Text className="text-base font-semibold">{wallet.name}</Text>
                </View>

                <View className="flex-row items-center justify-end gap-1">
                  {/* MARK: Update Wallet */}
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => {
                      dispatch(setWalletToEdit(wallet))
                      router.push('/update-wallet')
                    }}
                  >
                    <Icon
                      render={LucidePencil}
                      size={18}
                      color="#0ea5e9"
                    />
                  </TouchableOpacity>

                  {/* MARK: Delete Wallet */}
                  <ConfirmDialog
                    label={t('Delete wallet')}
                    desc={`${t('Are you sure you want to delete')} ${wallet.name}?`}
                    confirmLabel={t('Delete')}
                    cancelLabel={t('Cancel')}
                    onConfirm={() => handleDeleteWallet(wallet._id)}
                    disabled={deleting === wallet._id}
                    className="!h-auto !w-auto"
                    trigger={
                      <Button
                        disabled={deleting === wallet._id}
                        variant="ghost"
                        className="trans-200 h-full w-8 flex-shrink-0 rounded-md px-21/2 py-1.5 text-start text-sm font-semibold hover:bg-slate-200/30"
                      >
                        {deleting === wallet._id ? (
                          <ActivityIndicator />
                        ) : (
                          <Icon
                            render={LucideTrash}
                            size={18}
                            color="#f43f5e"
                          />
                        )}
                      </Button>
                    }
                  />
                </View>
              </TouchableOpacity>
            ))}
        </ScrollView>
      </View>

      <CommonFooter
        className="mb-21 mt-6 px-0"
        cancelLabel={t('Cancel')}
        onCancel={router.back}
      />

      <Separator className="my-8 h-0" />
    </DrawerWrapper>
  )
}

export default WalletPickerPage

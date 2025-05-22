import CommonFooter from '@/components/dialogs/CommonFooter'
import CommonHeader from '@/components/dialogs/CommonHeader'
import DrawerWrapper from '@/components/DrawerWrapper'
import Icon from '@/components/Icon'
import Text from '@/components/Text'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import {
  setDefaultWallet,
  setFromWallet,
  setOfWallet,
  setSelectedWallet,
  setToWallet,
  setWalletToEdit,
} from '@/lib/reducers/screenReducer'
import { router, useLocalSearchParams } from 'expo-router'
import { LucideGalleryVerticalEnd, LucidePencil, LucidePlusSquare } from 'lucide-react-native'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, TouchableOpacity, View } from 'react-native'

function WalletPickerPage() {
  // hooks
  const { t: translate } = useTranslation()
  const t = useCallback((key: string) => translate('walletPickerPage.' + key), [translate])
  const dispatch = useAppDispatch()
  const { isFromWallet, isToWallet, showAllOption } = useLocalSearchParams()

  // store
  const { wallets } = useAppSelector(state => state.wallet)

  // states
  const [filterText, setFilterText] = useState<string>('')

  return (
    <DrawerWrapper>
      <CommonHeader
        title={t('Select wallet')}
        desc={t('Wallets are used to group your transactions by source of funds')}
      />

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
                  else if (showAllOption === 'true') {
                    console.log('showAllOption')
                    dispatch(setDefaultWallet(wallet))
                    dispatch(setOfWallet(wallet))
                  } else {
                    dispatch(setDefaultWallet(wallet))
                    dispatch(setSelectedWallet(wallet))
                  }
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
                    className="p-2"
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

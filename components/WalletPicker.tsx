'use client'

import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { addWallet, deleteWallet, updateWallet } from '@/lib/reducers/walletReducer'
import { cn } from '@/lib/utils'
import { LucidePencil, LucidePlusSquare, LucideX } from 'lucide-react'
import { memo, useCallback, useEffect, useState } from 'react'
import { Button } from './ui/button'
import { Separator } from './ui/separator'
import { Skeleton } from './ui/skeleton'
import { useTranslation } from 'react-i18next'
import { IWallet } from '@/types/type'
import { deleteWalletApi } from '@/requests/walletRequests'
import Toast from 'react-native-toast-message'
import { View } from 'react-native'

interface WalletPickerProps {
  wallet?: IWallet
  onChange: (wallet: IWallet | null) => void
  isAllowedAll?: boolean
  className?: string
}

function WalletPicker({ wallet, isAllowedAll, onChange, className = '' }: WalletPickerProps) {
  // hooks
  const { t: translate } = useTranslation()
  const t = (key: string) => translate('walletPicker.' + key)
  const dispatch = useAppDispatch()

  // store
  const { wallets, loading } = useAppSelector(state => state.wallet)

  // states
  const [open, setOpen] = useState<boolean>(false)
  const [selectedWallet, setSelectedWallet] = useState<IWallet | null>(wallet || null)

  const [deleting, setDeleting] = useState<string>('')

  // auto select wallet when wallet is passed
  useEffect(() => {
    if (wallet) setSelectedWallet(wallet)
  }, [wallet])

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
    <View className={`relative ${className}`}>
      {/* <Drawer
        open={open}
        onOpenChange={setOpen}
      >
        <DrawerTrigger asChild>
          {!loading ? (
            <Button
              variant="outline"
              className="w-full justify-between"
            >
              {selectedWallet ? (
                <p>
                  <span>{selectedWallet.icon}</span> {selectedWallet.name}
                </p>
              ) : isAllowedAll ? (
                <p>
                  <span>+</span> {t('All wallets')}
                </p>
              ) : (
                t('Select Wallet')
              )}
              <LuChevronsUpDown size={18} />
            </Button>
          ) : (
            <Skeleton className="h-9 rounded-md" />
          )}
        </DrawerTrigger>
        <DrawerContent className="w-full p-0 shadow-md">
          <View className="mx-auto w-full max-w-sm px-21/2">
            <DrawerHeader>
              <DrawerTitle className="text-center">{t('Select Wallet')}</DrawerTitle>
              <DrawerDescription className="text-center">
                {t('Wallets are used to group your transactions by source of funds')}
              </DrawerDescription>
            </DrawerHeader>

            <Command className="rounded-lg border shadow-md">
              <CommandInput
                autoFocus={false}
                className="text-base md:text-sm"
                placeholder={t('Find a wallet') + '...'}
              />

              <CreateWalletDrawer
                update={wallet => dispatch(addWallet(wallet))}
                trigger={
                  <Button
                    variant="ghost"
                    className="mb-0.5 flex w-full justify-start gap-2 rounded-none text-left text-sm"
                  >
                    <LucidePlusSquare size={18} />
                    {t('Create Wallet')}
                  </Button>
                }
              />
              <CommandList>
                <CommandEmpty>{t('No results found')}.</CommandEmpty>
                <CommandSeparator />
                {isAllowedAll && (
                  <CommandItem className="justify-between gap-1 rounded-none p-0 py-px">
                    <Button
                      variant="ghost"
                      className={cn('w-full justify-start rounded-none border-l-[3px]')}
                      onClick={() => {
                        setOpen(false)
                        setSelectedWallet(null)
                        onChange(null)
                      }}
                      disabled={false}
                    >
                      <span>+</span> All wallets
                    </Button>
                  </CommandItem>
                )}

                {wallets.map(wallet => (
                  <CommandItem
                    className="justify-between gap-1 rounded-none p-0 py-px"
                    key={wallet._id}
                  >
                    <Button
                      variant="ghost"
                      className={cn('w-full justify-start rounded-none border-l-[3px]')}
                      onClick={() => {
                        setOpen(false)
                        setSelectedWallet(wallet)
                        onChange(wallet)
                      }}
                      disabled={false}
                    >
                      <span>{wallet.icon}</span> {wallet.name}
                    </Button>

                    <UpdateWalletDrawer
                      wallet={wallet}
                      update={(wallet: IWallet) => dispatch(updateWallet(wallet))}
                      trigger={
                        <Button
                          variant="ghost"
                          size="icon"
                        >
                          <LucidePencil />
                        </Button>
                      }
                    />

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
                          className="trans-200 h-full flex-shrink-0 rounded-md px-21/2 py-1.5 text-start text-sm font-semibold hover:bg-slate-200/30"
                        >
                          {deleting === wallet._id ? (
                            <LuLoaderCircle
                              size={16}
                              className="animate-spin text-slate-400"
                            />
                          ) : (
                            <LucideX size={16} />
                          )}
                        </Button>
                      }
                    />
                  </CommandItem>
                ))}
              </CommandList>
            </Command>

            <Separator className="my-8" />
          </View>
        </DrawerContent>
      </Drawer> */}
    </View>
  )
}

export default memo(WalletPicker)

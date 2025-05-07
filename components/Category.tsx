import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { refresh, setRefreshing } from '@/lib/reducers/loadReducer'
import { setCategoryToEdit, setSelectedCategory } from '@/lib/reducers/screenReducer'
import { checkTranType, formatCurrency } from '@/lib/string'
import { cn } from '@/lib/utils'
import { deleteCategoryApi } from '@/requests/categoryRequests'
import { BlurView } from 'expo-blur'
import { router } from 'expo-router'
import {
  LucideBarChart2,
  LucideEllipsisVertical,
  LucidePencil,
  LucidePlus,
  LucideTrash,
} from 'lucide-react-native'
import { memo, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, TouchableOpacity, View } from 'react-native'
import Toast from 'react-native-toast-message'
import ConfirmDialog from './dialogs/ConfirmDialog'
import Icon from './Icon'
import Text from './Text'
import { Button } from './ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from './ui/dropdown-menu'

// MARK: Category
interface CategoryProps {
  category: ICategory
  hideMenu?: boolean
  className?: string
}

function Category({ category, hideMenu, className }: CategoryProps) {
  // hooks
  const dispatch = useAppDispatch()
  const { t: translate } = useTranslation()
  const t = useCallback((key: string) => translate('category.' + key), [translate])
  const tError = useCallback((key: string) => translate('error.' + key), [translate])

  // store
  const currency = useAppSelector(state => state.settings.settings?.currency)

  // states
  const [deleting, setDeleting] = useState<boolean>(false)

  // values
  const { background, border } = checkTranType(category.type)

  // delete category
  const handleDeleteCategory = useCallback(async () => {
    // start deleting
    setDeleting(true)

    try {
      const { message } = await deleteCategoryApi(category._id)
      Toast.show({
        type: 'success',
        text1: message,
      })

      dispatch(refresh())
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: tError('Failed to delete category'),
      })
      console.log(err)
    } finally {
      // stop deleting
      setDeleting(false)
      dispatch(setRefreshing(false))
    }
  }, [dispatch, tError, category._id])

  return (
    <View
      className={cn(
        'border-200/30 relative h-11 flex-row justify-end overflow-hidden rounded-md bg-primary text-secondary',
        className
      )}
    >
      {/* MARK: Background */}
      <View className="w-full max-w-[170px]">
        <View
          className={cn(
            'border-b-[40px] border-l-[40px]',
            border,
            'border-l-transparent border-r-transparent'
          )}
        />
        <View className={cn('h-full w-full', background)} />
      </View>

      <View className="absolute left-0 top-0 h-full w-full flex-row items-center justify-between gap-2 pl-21/2">
        {/* MARK: Name */}
        <View className="relative z-10 flex-row items-center gap-2">
          <Text>{category.icon}</Text>
          <Text className="font-semibold text-secondary">{category.name}</Text>
        </View>

        <View className="flex-row items-center gap-2">
          {/* MARK: Amount */}
          {currency && (
            <Text className={cn('font-body text-lg font-bold text-white', hideMenu && 'pr-21/2')}>
              {formatCurrency(currency, category.amount)}
            </Text>
          )}

          {/* MARK: Menu */}
          {!hideMenu &&
            (!deleting ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-12 rounded-none hover:bg-primary hover:text-secondary"
                  >
                    <Icon
                      render={LucideEllipsisVertical}
                      color="white"
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="rounded-xl bg-transparent px-0 py-0">
                  <BlurView
                    className="px-1 py-2"
                    tint="prominent"
                    intensity={90}
                  >
                    {/* MARK: Create Transaction */}
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => {
                        dispatch(setSelectedCategory(category))
                        router.push('/create-transaction')
                      }}
                      className="h-10 w-full flex-row items-center justify-start gap-2 px-5"
                    >
                      <Icon
                        render={LucidePlus}
                        size={16}
                      />
                      <Text className="font-semibold">{t('Add Transaction')}</Text>
                    </TouchableOpacity>

                    {category.type === 'expense' && (
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => {
                          dispatch(setSelectedCategory(category))
                          router.push('/create-budget')
                        }}
                        className="h-10 w-full flex-row items-center justify-start gap-2 px-5"
                      >
                        <Icon
                          render={LucideBarChart2}
                          size={16}
                          color="#f97316"
                        />
                        <Text className="font-semibold text-orange-500">{t('Set Budget')}</Text>
                      </TouchableOpacity>
                    )}

                    {/* MARK: Update Category */}
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => {
                        dispatch(setCategoryToEdit(category))
                        router.push('/update-category')
                      }}
                      className="h-10 w-full flex-row items-center justify-start gap-2 px-5"
                    >
                      <Icon
                        render={LucidePencil}
                        size={16}
                        color="#0ea5e9"
                      />
                      <Text className="font-semibold text-sky-500">{t('Edit')}</Text>
                    </TouchableOpacity>

                    {category.deletable && (
                      <ConfirmDialog
                        label="Delete Wallet"
                        desc="Are you sure you want to delete this wallet?"
                        confirmLabel="Delete"
                        onConfirm={handleDeleteCategory}
                        trigger={
                          <Button
                            variant="ghost"
                            className="h-8 w-full flex-row items-center justify-start gap-2 px-4"
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
                    )}
                  </BlurView>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <ActivityIndicator />
            ))}
        </View>
      </View>
    </View>
  )
}

export default memo(Category)

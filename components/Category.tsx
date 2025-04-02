'use client'

import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { refetching } from '@/lib/reducers/loadReducer'
import { checkTranType, formatCurrency } from '@/lib/string'
import { cn } from '@/lib/utils'
import { deleteCategoryApi } from '@/requests/categoryRequests'
import { ICategory } from '@/types/type'
import { LucideEllipsisVertical, LucideLoaderCircle } from 'lucide-react-native'
import { memo, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import Toast from 'react-native-toast-message'
import Icon from './Icon'
import Text from './Text'
import { Button } from './ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from './ui/dropdown-menu'

// MARK: Category
interface CategoryProps {
  category: ICategory
  className?: string
}

function Category({ category, className = '' }: CategoryProps) {
  // hooks
  const dispatch = useAppDispatch()
  const { t: translate } = useTranslation()
  const t = (key: string) => translate('category.' + key)
  const tSuccess = (key: string) => translate('success.' + key)
  const tError = (key: string) => translate('error.' + key)

  // store
  const currency = useAppSelector(state => state.settings.settings?.currency)

  // states
  const [updating, setUpdating] = useState<boolean>(false)
  const [deleting, setDeleting] = useState<boolean>(false)

  // values
  const { background, border } = checkTranType(category.type)

  // delete category
  const handleDeleteCategory = useCallback(async () => {
    // start deleting
    setDeleting(true)

    try {
      const { category: w, message } = await deleteCategoryApi(category._id)
      Toast.show({
        type: 'success',
        text1: message,
      })

      // dispatch(deleteCategory(w))
      dispatch(refetching())
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: tError('Failed to delete category'),
      })
      console.log(err)
    } finally {
      // stop deleting
      setDeleting(false)
    }
  }, [dispatch, category._id, t])

  return (
    <View
      className={cn(
        'border-200/30 relative flex h-11 flex-row justify-end overflow-hidden rounded-md bg-primary text-secondary',
        className
      )}
    >
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

      <View className="absolute left-0 top-0 flex h-full w-full flex-row items-center justify-between gap-2 pl-21/2">
        <View className="relative z-10 flex flex-row items-center gap-2">
          <Text>{category.icon}</Text>
          <Text className="font-semibold text-secondary">{category.name}</Text>
        </View>
        <View className="flex flex-row items-center gap-2">
          {currency && (
            <Text className="font-body font-bold">{formatCurrency(currency, category.amount)}</Text>
          )}
          {!updating && !deleting ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-12 rounded-none hover:bg-primary hover:text-secondary"
                >
                  <Icon render={LucideEllipsisVertical} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {/* {category.type === 'expense' && (
                  <CreateTransactionDrawer
                    initCategory={category}
                    trigger={
                      <Button
                        variant="ghost"
                        className="flex flex-row h-8 w-full items-center justify-start gap-2 px-2"
                      >
                        <LucideChartPie size={16} />
                        {t('Add Transaction')}
                      </Button>
                    }
                  />
                )}

                {category.type === 'expense' && (
                  <CreateBudgetDrawer
                    initCategory={category}
                    trigger={
                      <Button
                        variant="ghost"
                        className="flex flex-row h-8 w-full items-center justify-start gap-2 px-2 text-orange-500"
                      >
                        <LucideChartPie size={16} />
                        {t('Set Budget')}
                      </Button>
                    }
                  />
                )}

                <UpdateCategoryDrawer
                  category={category}
                  update={(category: ICategory) => dispatch(updateCategory(category))}
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

                {category.deletable && (
                  <ConfirmDialog
                    label="Delete Wallet"
                    desc="Are you sure you want to delete this wallet?"
                    confirmLabel="Delete"
                    onConfirm={handleDeleteCategory}
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
                )} */}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              disabled
              variant="ghost"
              size="icon"
            >
              <Icon
                render={LucideLoaderCircle}
                className="animate-spin"
              />
            </Button>
          )}
        </View>
      </View>
    </View>
  )
}

export default memo(Category)

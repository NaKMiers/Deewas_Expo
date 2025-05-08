import CommonFooter from '@/components/dialogs/CommonFooter'
import CommonHeader from '@/components/dialogs/CommonHeader'
import ConfirmDialog from '@/components/dialogs/ConfirmDialog'
import DrawerWrapper from '@/components/DrawerWrapper'
import Icon from '@/components/Icon'
import Text from '@/components/Text'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SelectSeparator } from '@/components/ui/select'
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { refresh } from '@/lib/reducers/loadReducer'
import { setCategoryToEdit, setSelectedCategory } from '@/lib/reducers/screenReducer'
import { checkTranType } from '@/lib/string'
import { cn } from '@/lib/utils'
import { deleteCategoryApi } from '@/requests/categoryRequests'
import { router, useLocalSearchParams } from 'expo-router'
import { LucidePencil, LucidePlusSquare, LucideTrash } from 'lucide-react-native'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, ScrollView, TouchableOpacity, View } from 'react-native'
import Toast from 'react-native-toast-message'

function CategoryPicker() {
  // hooks
  const { t: translate } = useTranslation()
  const t = (key: string) => translate('categoryPickerPage.' + key)
  const tSuccess = useCallback((key: string) => translate('success.' + key), [translate])
  const tError = useCallback((key: string) => translate('error.' + key), [translate])
  const dispatch = useAppDispatch()
  const { type } = useLocalSearchParams()

  // store
  const { categories } = useAppSelector(state => state.category)

  // states
  const [deleting, setDeleting] = useState<string>('')
  const [filterText, setFilterText] = useState<string>('')

  // delete category
  const handleDeleteCategory = useCallback(
    async (id: string) => {
      if (!id) return
      // start loading
      setDeleting(id)

      try {
        await deleteCategoryApi(id)

        Toast.show({
          type: 'success',
          text1: tSuccess('Category deleted'),
        })

        dispatch(refresh())
      } catch (err: any) {
        Toast.show({
          type: 'error',
          text1: tError('Failed to delete category'),
        })
        console.log(err)
      } finally {
        // stop loading
        setDeleting('')
      }
    },
    [dispatch, tSuccess, tError]
  )

  return (
    <DrawerWrapper>
      <CommonHeader
        title={
          <>
            {t('Select') + ' '}
            {type && (
              <Text className={cn(checkTranType(type as TransactionType).color)}>
                {t(type as TransactionType)}
              </Text>
            )}
            {' ' + t('category')}
          </>
        }
        desc={t('Categories are used to group your transactions')}
      />

      {/* Search Bar */}
      <View className="mt-6 rounded-lg border border-primary p-1">
        <Input
          autoFocus={false}
          className="text-base md:text-sm"
          placeholder={t('Find a category') + '...'}
          value={filterText}
          onChangeText={text => setFilterText(text)}
        />

        {/* MARK: Create Category */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push(`/create-category?type=${type}`)}
          className="mb-0.5 h-12 w-full flex-row items-center justify-start gap-2 rounded-none border-b border-secondary px-4"
        >
          <Icon
            render={LucidePlusSquare}
            size={18}
          />
          <Text className="font-semibold">{t('Create Category')}</Text>
        </TouchableOpacity>

        <ScrollView style={{ maxHeight: 400 }}>
          {categories
            .filter(c => c.type === type)
            .filter(category => {
              const key =
                category.name.toLowerCase() + category.icon.toLowerCase() + category.type.toLowerCase()
              return key.includes(filterText.toLowerCase())
            })
            .map(category => (
              <TouchableOpacity
                activeOpacity={0.7}
                className="h-10 flex-1 flex-row items-center justify-between gap-2 py-2"
                onPress={() => {
                  dispatch(setSelectedCategory(category))
                  router.back()
                }}
                disabled={false}
                key={category._id}
              >
                <View className="flex-1 flex-row items-center gap-2 pl-2">
                  <Text className="text-base">{category.icon}</Text>
                  <Text className="text-base font-semibold">{category.name}</Text>
                </View>

                <View className="flex-row items-center justify-end gap-1">
                  {/* MARK: Update Category */}
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => {
                      dispatch(setCategoryToEdit(category))
                      router.push('/update-category')
                    }}
                  >
                    <Icon
                      render={LucidePencil}
                      size={18}
                      color="#0ea5e9"
                    />
                  </TouchableOpacity>

                  {/* MARK: Delete Category */}
                  {category.deletable && (
                    <ConfirmDialog
                      label={t('Delete category')}
                      desc={`${t('Are you sure you want to delete')} ${category.name}?`}
                      confirmLabel={t('Delete')}
                      cancelLabel={t('Cancel')}
                      onConfirm={() => handleDeleteCategory(category._id)}
                      disabled={deleting === category._id}
                      className="!h-auto !w-auto"
                      trigger={
                        <Button
                          disabled={deleting === category._id}
                          variant="ghost"
                          className="trans-200 h-full w-8 flex-shrink-0 rounded-md px-21/2 py-1.5 text-start text-sm font-semibold hover:bg-slate-200/30"
                        >
                          {deleting === category._id ? (
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
                  )}
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

      <SelectSeparator className="my-8 h-0" />
    </DrawerWrapper>
  )
}

export default CategoryPicker

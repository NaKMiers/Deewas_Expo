import CommonFooter from '@/components/dialogs/CommonFooter'
import CommonHeader from '@/components/dialogs/CommonHeader'
import DrawerWrapper from '@/components/DrawerWrapper'
import Icon from '@/components/Icon'
import Text from '@/components/Text'
import { Input } from '@/components/ui/input'
import { SelectSeparator } from '@/components/ui/select'
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { setCategoryToEdit, setSelectedCategory } from '@/lib/reducers/screenReducer'
import { checkTranType } from '@/lib/string'
import { cn } from '@/lib/utils'
import { router, useLocalSearchParams } from 'expo-router'
import { LucidePencil, LucidePlusSquare } from 'lucide-react-native'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TouchableOpacity, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'

function CategoryPicker() {
  // hooks
  const { t: translate } = useTranslation()
  const t = (key: string) => translate('categoryPickerPage.' + key)
  const dispatch = useAppDispatch()
  const { type } = useLocalSearchParams()

  // store
  const { categories } = useAppSelector(state => state.category)

  // states
  // const [deleting, setDeleting] = useState<string>('')
  const [filterText, setFilterText] = useState<string>('')

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

      {/* MARK: Search Bar */}
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
                    className="p-2"
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

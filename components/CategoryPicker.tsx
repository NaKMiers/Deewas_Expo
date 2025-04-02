'use client'

import { deleteCategoryApi, getMyCategoriesApi } from '@/requests/categoryRequests'
import { ICategory, TransactionType } from '@/types/type'
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SafeAreaView, TouchableOpacity, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import Toast from 'react-native-toast-message'
import Text from './Text'
import { Input } from './ui/input'
import { Separator } from './ui/separator'

interface CategoryPickerProps {
  category?: ICategory
  type: TransactionType
  onChange: (value: string) => void
  className?: string
}

function CategoryPicker({ category, type, onChange, className = '' }: CategoryPickerProps) {
  // hooks
  const { t: translate } = useTranslation()
  const t = (key: string) => translate('categoryPicker.' + key)
  const tSuccess = (key: string) => translate('success.' + key)
  const tError = (key: string) => translate('error.' + key)

  // states
  const [open, setOpen] = useState<boolean>(false)
  const [categories, setCategories] = useState<ICategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<ICategory | null>(category || null)

  const [getting, setGetting] = useState<boolean>(true)
  const [deleting, setDeleting] = useState<string>('')

  // ref
  const bottomSheetRef = useRef<BottomSheet>(null)

  // values
  const snapPoints = useMemo(() => ['25%', '50%', '75%'], [])

  // reset selected category when type changes
  useEffect(() => {
    setSelectedCategory(null)
  }, [type])

  // auto select category when category is passed
  useEffect(() => {
    if (category) setSelectedCategory(category)
  }, [category])

  // get user categories
  const getUserCategories = useCallback(async () => {
    // start loading
    setGetting(true)

    try {
      const { categories } = await getMyCategoriesApi()

      setCategories(categories)
    } catch (err: any) {
      console.error(err)
      Toast.show({
        type: 'error',
        text1: tError('Failed to get categories'),
      })
    } finally {
      // stop loading
      setGetting(false)
    }
  }, [t])

  // initially get user categories
  useEffect(() => {
    getUserCategories()
  }, [getUserCategories])

  // delete category
  const handleDeleteCategory = useCallback(
    async (id: string) => {
      if (!id) return
      // start loading
      setDeleting(id)

      try {
        const { category: c, message } = await deleteCategoryApi(id)

        setCategories(categories.filter(category => category._id !== c._id))

        if (selectedCategory?._id === c._id) setSelectedCategory(null)
        Toast.show({
          type: 'success',
          text1: tSuccess('Category deleted'),
        })
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
    [categories, selectedCategory?._id]
  )

  return (
    <BottomSheet
      snapPoints={snapPoints}
      ref={bottomSheetRef}
      index={3}
    >
      <BottomSheetView>
        <SafeAreaView>
          <View className="mx-auto w-full max-w-sm px-21/2">
            <View>
              <Text className="text-center text-lg font-semibold text-secondary">
                {t('Select Category')}
              </Text>
              <Text className="text-center text-muted-foreground">
                {t('Categories are used to group your transactions')}
              </Text>
            </View>

            <View
              className="rounded-lg border"
              style={{ marginTop: 28 }}
            >
              <Input
                autoFocus={false}
                className="text-base md:text-sm"
                placeholder={t('Find a category') + '...'}
              />

              {/* <CreateCategoryDrawer
                  update={category => {
                    // update categories picker list
                    setCategories([...categories, category])
                    setSelectedCategory(category)

                    // update parent component
                    onChange(category._id)

                    // close
                    setOpen(false)
                  }}
                  type={type}
                  trigger={
                    <Button
                      variant="ghost"
                      className="mb-0.5 flex w-full justify-start gap-2 rounded-none text-left text-sm"
                    >
                      <LucidePlusSquare size={18} />
                      {t('Create Category')}
                    </Button>
                  }
                /> */}

              <ScrollView style={{ maxHeight: 400 }}>
                {categories
                  .filter(c => c.type === type)
                  .map(category => (
                    <TouchableOpacity
                      className="flex w-full flex-row items-center gap-1 bg-green-200 px-3 py-2"
                      onPress={() => {
                        setOpen(false)
                        setSelectedCategory(category)
                        onChange(category._id)
                      }}
                      disabled={false}
                    >
                      <Text className="text-secondary">{category.icon}</Text>
                      <Text
                        className="font-semibold text-secondary"
                        style={{ marginLeft: 8 }}
                      >
                        {category.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
              </ScrollView>
            </View>

            <Separator className="my-8" />
          </View>
        </SafeAreaView>
      </BottomSheetView>
    </BottomSheet>
  )
}

export default memo(CategoryPicker)

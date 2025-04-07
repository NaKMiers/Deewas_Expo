import CreateCategoryDrawer from '@/components/dialogs/CreateCategoryDrawer'
import UpdateCategoryDrawer from '@/components/dialogs/UpdateCategoryDrawer'
import { cn } from '@/lib/utils'
import { deleteCategoryApi, getMyCategoriesApi } from '@/requests/categoryRequests'
import { LucideChevronsUpDown, LucidePencil, LucidePlusSquare, LucideTrash } from 'lucide-react-native'
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react'
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

interface CategoryPickerProps {
  categories: ICategory[]
  setCategories: Dispatch<SetStateAction<ICategory[]>>
  type: TransactionType
  onChange: (value: string) => void
  className?: string
  selectedCategory: ICategory | null
  setSelectedCategory: Dispatch<SetStateAction<ICategory | null>>
  [key: string]: any
}

function CategoryPicker({
  categories,
  setCategories,
  type,
  onChange,
  selectedCategory,
  setSelectedCategory,
  className,
}: CategoryPickerProps) {
  // hooks
  const { t: translate } = useTranslation()
  const t = (key: string) => translate('categoryPicker.' + key)
  const tSuccess = (key: string) => translate('success.' + key)
  const tError = (key: string) => translate('error.' + key)
  const { closeDrawer2 } = useDrawer()

  // states
  const [deleting, setDeleting] = useState<string>('')
  const [filterText, setFilterText] = useState<string>('')

  // reset selected category when type changes
  useEffect(() => {
    setSelectedCategory(null)
  }, [type])

  // delete category
  const handleDeleteCategory = useCallback(
    async (id: string) => {
      if (!id) return
      // start loading
      setDeleting(id)

      try {
        const { category: c } = await deleteCategoryApi(id)
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
    [categories, setCategories, selectedCategory?._id]
  )

  return (
    <View className={cn('w-full', className)}>
      <View className="mx-auto w-full max-w-sm px-21/2">
        <View>
          <Text className="text-center text-xl font-semibold">{t('Select Category')}</Text>
          <Text className="text-center text-muted-foreground">
            {t('Categories are used to group your transactions')}
          </Text>
        </View>

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
          <CreateCategoryDrawer
            update={category => {
              // update categories picker list
              setCategories([...categories, category])
              setSelectedCategory(category)

              // update parent component
              onChange(category._id)

              // close
              closeDrawer2()
            }}
            type={type}
            trigger={
              <View className="mb-0.5 flex h-12 w-full flex-row items-center justify-start gap-2 rounded-none border-b border-secondary px-4">
                <Icon
                  render={LucidePlusSquare}
                  size={18}
                />
                <Text className="font-semibold">{t('Create Category')}</Text>
              </View>
            }
          />
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
                  className="flex h-10 flex-1 flex-row items-center justify-between gap-2 py-2"
                  onPress={() => {
                    setSelectedCategory(category)
                    onChange(category._id)
                    closeDrawer2()
                  }}
                  disabled={false}
                  key={category._id}
                >
                  <View className="flex-1 flex-row items-center gap-2 pl-2">
                    <Text className="text-base">{category.icon}</Text>
                    <Text className="text-base font-semibold">{category.name}</Text>
                  </View>

                  <View className="flex flex-row items-center justify-end gap-1">
                    {/* MARK: Update Category */}
                    {category.deletable && (
                      <UpdateCategoryDrawer
                        category={category}
                        update={(category: ICategory) =>
                          setCategories(categories.map(c => (c._id === category._id ? category : c)))
                        }
                        trigger={
                          <View>
                            <Icon
                              render={LucidePencil}
                              size={18}
                              color="#0ea5e9"
                            />
                          </View>
                        }
                      />
                    )}

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

        <Separator className="my-8" />
      </View>
    </View>
  )
}

interface NodeProps {
  category?: ICategory
  type: TransactionType
  onChange: (value: string) => void
  initCategories?: ICategory[]
  className?: string
}

const Node = ({ category, type, onChange, className }: NodeProps) => {
  // hooks
  const { t: translate } = useTranslation()
  const t = (key: string) => translate('categoryPicker.' + key)
  const tError = (key: string) => translate('error.' + key)
  const { openDrawer2 } = useDrawer()

  // states
  const [categories, setCategories] = useState<ICategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<ICategory | null>(category || null)

  const [getting, setGetting] = useState<boolean>(true)

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
  }, [])

  // initially get user categories
  useEffect(() => {
    getUserCategories()
  }, [getUserCategories])

  // auto select category when category is passed
  useEffect(() => {
    if (category) setSelectedCategory(category)
  }, [category])

  return !getting ? (
    <Button
      variant="outline"
      className="flex h-10 flex-row items-center justify-between gap-2 border border-primary bg-white"
      onPress={() =>
        openDrawer2(
          <CategoryPicker
            categories={categories}
            setCategories={setCategories}
            type={type}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            className={cn('w-full', className)}
            onChange={onChange}
          />
        )
      }
    >
      {selectedCategory ? (
        <View className="flex flex-row items-center gap-2">
          <Text className="text-base text-black">{selectedCategory.icon}</Text>
          <Text className="text-base font-semibold text-black">{selectedCategory.name}</Text>
        </View>
      ) : (
        <Text className="text-base font-semibold text-black">{t('Select Category')}</Text>
      )}
      <Icon
        render={LucideChevronsUpDown}
        size={18}
        color="black"
      />
    </Button>
  ) : (
    <Skeleton className="h-9 rounded-md" />
  )
}

export default Node

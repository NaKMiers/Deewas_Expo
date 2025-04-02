import { useAppDispatch } from '@/hooks/reduxHook'
import { checkTranType } from '@/lib/string'
import { cn } from '@/lib/utils'
import { ICategory, TransactionType } from '@/types/type'
import { memo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import Category from './Category'
import NoItemsFound from './NoItemsFound'
import Text from './Text'
import { TabsContent } from './ui/tabs'
import Icon from './Icon'

interface CategoryGroupProps {
  categories: ICategory[]
  type: TransactionType
  className?: string
}

function CategoryGroup({ categories, type, className = '' }: CategoryGroupProps) {
  // hooks
  const dispatch = useAppDispatch()
  const { t: translate } = useTranslation()
  const t = (key: string) => translate('categoryGroup.' + key)

  // states
  const [creating, setCreating] = useState<boolean>(false)

  // values
  const { Icon: renderIcon, border, background } = checkTranType(type)
  categories = categories.sort((a, b) => a.name.localeCompare(b.name))

  return (
    <TabsContent
      value={type}
      className={cn(className)}
    >
      <View className="rounded-lg border border-neutral-300 bg-secondary text-primary">
        <View className="flex flex-row items-center gap-21/2 border-b border-slate-200/30 p-2.5">
          <View
            className={cn(
              'flex h-10 w-10 flex-row items-center justify-center rounded-md border-2',
              border,
              background
            )}
          >
            <Icon
              render={renderIcon}
              size={24}
              color="white"
            />
          </View>
          <View className="flex flex-1 flex-col">
            <Text className="font-semibold capitalize md:text-2xl">
              {type} {t('Categories')}
            </Text>
            <Text className="text-sm font-semibold text-muted-foreground">{t('Sorted by name')}</Text>
          </View>
          {/* <CreateCategoryDrawer
            type={type}
            update={category => dispatch(addCategory(category))}
            load={setCreating}
            trigger={
              <Button
                disabled={creating}
                variant="default"
                className="md:px-4 flex flex-row h-8 flex-shrink-0 items-center gap-1.5 rounded-md px-2 text-xs font-semibold"
              >
                {!creating ? (
                  <>
                    <Icon render={LucidePlusSquare} />
                    {t('New Category')}
                  </>
                ) : (
                  <Icon render={LucideLoaderCircle} className="animate-spin" />
                )}
              </Button>
            }
          /> */}
        </View>

        <View className="flex flex-col gap-1 p-21/2">
          {categories.length > 0 ? (
            categories.map(category => (
              <Category
                category={category}
                key={category._id}
              />
            ))
          ) : (
            <NoItemsFound text={t('No categories found!')} />
          )}
        </View>
      </View>
    </TabsContent>
  )
}

export default memo(CategoryGroup)

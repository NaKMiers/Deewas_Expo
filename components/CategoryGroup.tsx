import { useAppDispatch } from '@/hooks/reduxHook'
import { checkTranType } from '@/lib/string'
import { cn } from '@/lib/utils'
import { router } from 'expo-router'
import { LucidePlusSquare } from 'lucide-react-native'
import { memo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TouchableOpacity, View } from 'react-native'
import Category from './Category'
import Icon from './Icon'
import NoItemsFound from './NoItemsFound'
import Text from './Text'
import { TabsContent } from './ui/tabs'

interface CategoryGroupProps {
  categories: ICategory[]
  type: TransactionType
  className?: string
}

function CategoryGroup({ categories, type, className }: CategoryGroupProps) {
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
      <View className="rounded-lg border border-primary text-primary">
        <View className="flex-row items-center gap-21/2 border-b border-slate-200/30 p-2.5">
          <View
            className={cn(
              'h-10 w-10 flex-row items-center justify-center rounded-md border-2',
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
          <View className="flex-1 flex-col">
            <Text className="font-semibold capitalize md:text-2xl">{t(type)}</Text>
            <Text className="text-sm font-semibold text-muted-foreground">{t('Sorted by name')}</Text>
          </View>

          {/* MARK: Create Category */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push(`/create-category?type=${type}`)}
            className="h-10 flex-shrink-0 flex-row items-center gap-1.5 rounded-md border border-secondary bg-primary px-2 md:px-4"
          >
            <Icon
              render={LucidePlusSquare}
              size={18}
              reverse
            />
            <Text className="font-semibold text-secondary">{t('New Category')}</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-col gap-1 p-21/2">
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

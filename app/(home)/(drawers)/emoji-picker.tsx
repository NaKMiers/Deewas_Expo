import CommonFooter from '@/components/dialogs/CommonFooter'
import CommonHeader from '@/components/dialogs/CommonHeader'
import DrawerWrapper from '@/components/DrawerWrapper'
import Icon from '@/components/Icon'
import NoItemsFound from '@/components/NoItemsFound'
import Text from '@/components/Text'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { emojiData, emojiGroups } from '@/constants/emojiData'
import { useAppDispatch } from '@/hooks/reduxHook'
import { setSelectedEmoji } from '@/lib/reducers/screenReducer'
import { decodeEmoji } from '@/lib/string'
import AsyncStorage from '@react-native-async-storage/async-storage'
import SegmentedControl from '@react-native-segmented-control/segmented-control'
import { router } from 'expo-router'
import { LucideSearch, LucideX } from 'lucide-react-native'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native'

function EmojiPickerPage() {
  // hooks
  const { t: translate } = useTranslation()
  const t = useCallback((key: string) => translate('emojiPickerPage.' + key), [translate])
  const dispatch = useAppDispatch()

  // values
  const categories = useMemo(
    () => [
      {
        name: 'Frequently used',
        icon: '🕛',
      },
      {
        name: 'Smileys & Emotion',
        icon: '😀',
      },
      {
        name: 'People & Body',
        icon: '🎅',
      },
      {
        name: 'Animals & Nature',
        icon: '🐶',
      },
      {
        name: 'Food & Drink',
        icon: '🍔',
      },
      {
        name: 'Activities',
        icon: '⚽',
      },
      {
        name: 'Travel & Places',
        icon: '🏖️',
      },
      {
        name: 'Objects',
        icon: '💡',
      },
      {
        name: 'Flags',
        icon: '🏳️',
      },
      {
        name: 'Component',
        icon: '🧩',
      },
      {
        name: 'Symbols',
        icon: '#️⃣',
      },
    ],
    []
  )

  // states
  const [category, setCategory] = useState<{ name: string; icon: string }>(categories[1])
  const [frequentlyUsed, setFrequentlyUsed] = useState<Emoji[]>([])
  const [search, setSearch] = useState<string>('')

  // initially load frequently used emojis
  useEffect(() => {
    const fetchFrequentlyUsed = async () => {
      const frequentlyUsedRaw = await AsyncStorage.getItem('frequentlyUsedEmojis')
      if (frequentlyUsedRaw) {
        const frequentlyUsedData = JSON.parse(frequentlyUsedRaw)
        setFrequentlyUsed(frequentlyUsedData)
      }
    }

    fetchFrequentlyUsed()
  }, [])

  // update frequently used emojis
  const updateFrequentlyUsed = useCallback(async (emoji: Emoji) => {
    const frequentlyUsedRaw = await AsyncStorage.getItem('frequentlyUsedEmojis')
    if (frequentlyUsedRaw) {
      let frequentlyUsed = JSON.parse(frequentlyUsedRaw)

      // if emoji already exists, remove it and add it to the beginning of the array
      frequentlyUsed = frequentlyUsed.filter((item: any) => item.unified !== emoji.unified)
      frequentlyUsed.unshift(emoji)
      if (frequentlyUsed.length > 9) frequentlyUsed.pop()

      setFrequentlyUsed(frequentlyUsed)
      await AsyncStorage.setItem('frequentlyUsedEmojis', JSON.stringify(frequentlyUsed))
      return
    }

    const frequentlyUsed = [emoji]
    await AsyncStorage.setItem('frequentlyUsedEmojis', JSON.stringify(frequentlyUsed))
    setFrequentlyUsed(frequentlyUsed)
  }, [])

  // render emojis
  const renderEmojis = useCallback(
    (title: string, data: any[]) =>
      data?.length > 0 ? (
        <View className="gap-2">
          <Text className="pl-1 text-lg font-medium">{t(title)}</Text>
          <View className="flex-row flex-wrap gap-y-1">
            {data.map((emoji, index) => (
              <TouchableOpacity
                className="w-[calc(100%/9)]"
                onPress={async () => {
                  updateFrequentlyUsed(emoji)
                  dispatch(setSelectedEmoji(decodeEmoji(emoji.unified)))
                  router.back()
                }}
                key={index}
              >
                <Text className="text-center text-3xl">{decodeEmoji(emoji.unified)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : (
        <NoItemsFound text={t('No emoji found')} />
      ),
    [dispatch, updateFrequentlyUsed, t]
  )

  return (
    <DrawerWrapper>
      <CommonHeader
        title={t('Pick an emoji')}
        desc={t('Emojis are a fun way to express yourself')}
      />

      <View className="mt-6 flex-1 flex-col gap-6">
        {/* Tab */}
        <SegmentedControl
          values={categories.map(item => item.icon)}
          style={{ flex: 1, width: '100%', height: 40 }}
          selectedIndex={categories.indexOf(category)}
          onChange={event => {
            const index = event.nativeEvent.selectedSegmentIndex
            setCategory(categories[index])
          }}
        />

        {/* Search */}
        <View className="flex-row items-center justify-center rounded-lg bg-primary/10">
          <Icon
            render={LucideSearch}
            size={18}
            width={40}
          />
          <Input
            className="flex-1 border-transparent bg-transparent pl-0"
            placeholder={t('Find an emoji') + '...'}
            value={search}
            onChangeText={text => setSearch(text)}
          />
          {search.trim() !== '' && (
            <TouchableWithoutFeedback onPress={() => setSearch('')}>
              <Icon
                render={LucideX}
                size={18}
                width={40}
              />
            </TouchableWithoutFeedback>
          )}
        </View>

        {/* Emoji */}
        <ScrollView style={{ maxHeight: 418 }}>
          <View className="flex-1">
            {search.trim() !== ''
              ? renderEmojis(
                  t('Search Results'),
                  emojiData.filter(emoji =>
                    emoji.short_name.toLowerCase().includes(search.toLowerCase())
                  )
                )
              : category.name === t('Frequently used')
                ? renderEmojis(t('Frequently used'), frequentlyUsed)
                : renderEmojis(category.name, emojiGroups[category.name])}
          </View>
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

export default EmojiPickerPage

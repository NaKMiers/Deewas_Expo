import { capitalize } from '@/lib/string'
import { cn } from '@/lib/utils'
import SegmentedControl from '@react-native-segmented-control/segmented-control'
import { LucideChevronLeft, LucideChevronRight } from 'lucide-react-native'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { TouchableOpacity, View } from 'react-native'
import Icon from './Icon'
import Text from './Text'

interface HistoryFooterProps {
  segments: string[]
  segment: string
  onChange: (tab: string) => void
  next: () => void
  prev: () => void
  disabledNext?: boolean
  disabledPrev?: boolean
  indicatorLabel?: string
  hideSegments?: boolean
  className?: string
}

function HistoryFooter({
  segments,
  segment,
  indicatorLabel,
  onChange,
  next,
  prev,
  disabledNext,
  disabledPrev,
  hideSegments,
  className,
}: HistoryFooterProps) {
  // hooks
  const { t: translate } = useTranslation()
  const t = (key: string) => translate('history.' + key)

  return (
    <View className={cn('flex-col gap-2', className)}>
      <View className="flex-row items-center justify-between">
        {/* Previous */}
        <TouchableOpacity
          onPress={prev}
          className={cn('flex-row items-center justify-center gap-2', disabledPrev && 'opacity-50')}
          disabled={disabledPrev}
        >
          <View className="aspect-square rounded-full bg-neutral-700 p-2">
            <Icon
              render={LucideChevronLeft}
              color="white"
            />
          </View>
          <Text className="font-body tracking-wider text-muted-foreground">
            {t('Previous ' + indicatorLabel)}
          </Text>
        </TouchableOpacity>

        {/* Next */}
        <TouchableOpacity
          onPress={next}
          className={cn('flex-row items-center justify-center gap-2', disabledNext && 'opacity-50')}
          disabled={disabledNext}
        >
          <Text className="font-body tracking-wider text-muted-foreground">
            {t('Next ' + indicatorLabel)}
          </Text>
          <View className="aspect-square rounded-full bg-neutral-700 p-2">
            <Icon
              render={LucideChevronRight}
              color="white"
            />
          </View>
        </TouchableOpacity>
      </View>

      {!hideSegments && (
        <SegmentedControl
          values={segments.map(s => capitalize(t(s)))}
          style={{ width: '100%', height: 34 }}
          selectedIndex={segments.indexOf(segment)}
          onChange={(event: any) => {
            const index = event.nativeEvent.selectedSegmentIndex
            onChange(segments[index])
          }}
          className="capitalize"
        />
      )}
    </View>
  )
}

export default memo(HistoryFooter)

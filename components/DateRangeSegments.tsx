import { capitalize, getLocale } from '@/lib/string'
import { cn } from '@/lib/utils'
import SegmentedControl from '@react-native-segmented-control/segmented-control'
import { format, isSameDay } from 'date-fns'
import { LucideChevronLeft, LucideChevronRight, LucideRotateCw } from 'lucide-react-native'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { TouchableOpacity, View } from 'react-native'
import Icon from './Icon'
import Text from './Text'

interface IDateRangeSegmentsProps {
  segment: string
  segments: string[]
  onChangeSegment: (segment: string) => void
  dateRange: { from: Date; to: Date }
  indicatorLabel: string
  next: () => void
  prev: () => void
  reset: () => void
}

function DateRangeSegments({
  segment,
  segments,
  onChangeSegment,
  dateRange,
  next,
  prev,
  reset,
}: IDateRangeSegmentsProps) {
  // hooks
  const { t: translate, i18n } = useTranslation()
  const t = (key: string) => translate('dateRangeSegments.' + key)
  const locale = i18n.language

  return (
    <View className={cn('flex-1')}>
      <View className="flex flex-row items-center justify-between gap-21/2">
        <SegmentedControl
          values={segments.map(s => capitalize(t(s)))}
          style={{ width: '100%', height: 34, flex: 1 }}
          selectedIndex={segments.indexOf(segment)}
          onChange={event => {
            const index = event.nativeEvent.selectedSegmentIndex
            onChangeSegment(segments[index])
          }}
        />

        <TouchableOpacity
          className="rounded-full bg-primary/10 p-2"
          onPress={reset}
        >
          <Icon
            render={LucideRotateCw}
            size={18}
          />
        </TouchableOpacity>
      </View>

      <View className="mt-21/2 flex flex-row items-center justify-between gap-2">
        {/* Previous */}
        <TouchableOpacity
          onPress={prev}
          className="rounded-full bg-neutral-700 p-2"
        >
          <Icon
            render={LucideChevronLeft}
            color="white"
          />
        </TouchableOpacity>

        <View className="flex flex-row items-center gap-21/2">
          <Text className="text-lg font-semibold capitalize">
            {format(
              new Date(dateRange.from),
              isSameDay(dateRange.from, dateRange.to) ? 'MMM dd' : 'MMM dd, yyyy',
              { locale: getLocale(locale) }
            )}
          </Text>
          <Text className="text-lg font-semibold">-</Text>
          <Text className="text-lg font-semibold capitalize">
            {format(new Date(dateRange.to), 'MMM dd, yyyy', { locale: getLocale(locale) })}
          </Text>
        </View>

        {/* Next */}
        <TouchableOpacity
          onPress={next}
          className="rounded-full bg-neutral-700 p-2"
        >
          <Icon
            render={LucideChevronRight}
            color="white"
          />
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default DateRangeSegments

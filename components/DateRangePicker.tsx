import { cn } from '@/lib/utils'
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet'
import { Separator } from '@rn-primitives/select'
import { isSameDay } from 'date-fns'
import { LucideMinus } from 'lucide-react-native'
import moment from 'moment-timezone'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, TouchableOpacity, View } from 'react-native'
import DateTimePicker from './DateTimePicker'
import Icon from './Icon'
import Text from './Text'
import { useDrawer } from './providers/DrawerProvider'
import { Button } from './ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'

interface DateRangePickerProps {
  values: { from: Date; to: Date }
  update: ({ from, to }: { from: Date; to: Date }) => void
  className?: string
}

const ranges = [
  {
    label: 'Today',
    value: {
      from: moment().startOf('day').toDate(),
      to: moment().endOf('day').toDate(),
    },
  },
  {
    label: 'Yesterday',
    value: {
      from: moment().subtract(1, 'days').startOf('day').toDate(),
      to: moment().subtract(1, 'days').endOf('day').toDate(),
    },
  },
  {
    label: 'Last 7 Days',
    value: {
      from: moment().subtract(6, 'days').startOf('day').toDate(),
      to: moment().endOf('day').toDate(),
    },
  },
  {
    label: 'Last 30 Days',
    value: {
      from: moment().subtract(29, 'days').startOf('day').toDate(),
      to: moment().endOf('day').toDate(),
    },
  },
  {
    label: 'This Week',
    value: {
      from: moment().startOf('week').toDate(),
      to: moment().endOf('week').toDate(),
    },
  },
  {
    label: 'Last Week',
    value: {
      from: moment().subtract(1, 'week').startOf('week').toDate(),
      to: moment().subtract(1, 'week').endOf('week').toDate(),
    },
  },
  {
    label: 'This Month',
    value: {
      from: moment().startOf('month').toDate(),
      to: moment().endOf('month').toDate(),
    },
  },
  {
    label: 'Last Month',
    value: {
      from: moment().subtract(1, 'month').startOf('month').toDate(),
      to: moment().subtract(1, 'month').endOf('month').toDate(),
    },
  },
]

function DateRangePicker({ values, update, className }: DateRangePickerProps) {
  // hooks
  const { t: translate } = useTranslation()
  const t = (key: string) => translate('dateRangePicker.' + key)
  const { closeDrawer } = useDrawer()

  // states
  const [from, setFrom] = useState<Date>(values.from)
  const [to, setTo] = useState<Date>(values.to)
  const [slide, setSlide] = useState<number>(1)

  // refs
  const flatListRef = useRef<FlatList>(null)

  const handleConfirm = useCallback(() => {
    update({ from, to })
    closeDrawer()
  }, [from, to, update, closeDrawer])

  // scroll when slide changes
  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToIndex({
        index: slide - 1,
        animated: true,
      })
    }
  }, [slide])

  return (
    <View
      className={cn('mx-auto w-full max-w-sm', className)}
      style={{ marginTop: 21 }}
    >
      <View className="flex flex-row items-center justify-center gap-3">
        <View className="flex flex-1 flex-col items-center gap-2">
          <Text className="px-2 font-semibold">{t('From Date')}</Text>
          <Button
            variant="outline"
            className={cn('w-full', slide === 1 && 'border-yellow-500')}
            onPress={() => setSlide(1)}
          >
            <Text className="font-semibold">{moment(from).format('MMM DD, YYYY')}</Text>
          </Button>
        </View>
        <Icon
          render={LucideMinus}
          style={{ marginBottom: -21 }}
        />
        <View className="flex flex-1 flex-col items-center gap-2">
          <Text className="px-2 font-semibold">{t('To Date')}</Text>
          <Button
            variant="outline"
            className={cn('w-full', slide === 2 && 'border-yellow-500')}
            onPress={() => setSlide(2)}
          >
            <Text className="font-semibold">{moment(to).format('MMM DD, YYYY')}</Text>
          </Button>
        </View>
      </View>

      <Select
        className="mt-4"
        onValueChange={(option: any) => {
          const selectedRange = ranges.find(range => range.label === option?.value)
          if (selectedRange) {
            setFrom(selectedRange.value.from)
            setTo(selectedRange.value.to)
          }
        }}
      >
        <SelectTrigger>
          <SelectValue
            className="text-primary"
            placeholder="Select Range..."
          />
        </SelectTrigger>
        <SelectContent>
          {ranges.map((range, index) => (
            <SelectItem
              value={range.label}
              label={range.label}
              key={index}
            />
          ))}
        </SelectContent>
      </Select>

      <FlatList
        className="mt-3"
        ref={flatListRef}
        horizontal
        data={[
          { label: 'From Date', type: 'from' },
          { label: 'To Date', type: 'to' },
        ]}
        keyExtractor={item => item.type}
        renderItem={({ item }) => (
          <View className={cn('mt-4 flex flex-col items-center gap-1')}>
            <Text className="px-2 text-lg font-semibold">{t(item.label)}</Text>
            <DateTimePicker
              currentDate={item.type === 'from' ? from : to}
              onChange={date => date && (item.type === 'from' ? setFrom(date) : setTo(date))}
              minimumDate={item.type === 'to' ? from : undefined}
              maximumDate={item.type === 'from' ? to : undefined}
            />
          </View>
        )}
        showsHorizontalScrollIndicator={false}
        snapToInterval={SCREEN_WIDTH}
        decelerationRate="fast"
        scrollEnabled={false}
      />

      <View
        className="mb-21 mt-8"
        style={{ paddingLeft: 21, paddingRight: 21 }}
      >
        <View className="mt-3 flex flex-row items-center justify-center gap-21">
          <Button
            variant="secondary"
            className="h-10 flex-1 rounded-md px-21/2"
            onPress={() => closeDrawer()}
          >
            <Text className="font-semibold">{t('Cancel')}</Text>
          </Button>
          <Button
            variant="default"
            className="h-10 flex-1 rounded-md px-21/2"
            onPress={handleConfirm}
          >
            <Text className="font-semibold text-secondary">{t('Confirm')}</Text>
          </Button>
        </View>
      </View>

      <Separator className="my-8" />
    </View>
  )
}

function Node(props: DateRangePickerProps) {
  const { openDrawer } = useDrawer()
  const { from, to } = props.values

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      className="flex h-10 flex-row items-center gap-1 rounded-md border border-secondary px-3"
      onPress={() => openDrawer(<DateRangePicker {...props} />)}
    >
      <Text className="font-semibold">
        {moment(from).format(isSameDay(from, to) ? 'MMM DD' : 'MMM DD, YYYY')}
      </Text>
      <Text className="font-semibold">-</Text>
      <Text className="font-semibold">{moment(to).format('MMM DD, YYYY')}</Text>
    </TouchableOpacity>
  )
}

export default Node

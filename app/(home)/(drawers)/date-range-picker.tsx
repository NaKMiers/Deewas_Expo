import DateTimePicker from '@/components/DateTimePicker'
import DrawerWrapper from '@/components/DrawerWrapper'
import Icon from '@/components/Icon'
import Text from '@/components/Text'
import { Button } from '@/components/ui/button'
import { DRAWER_MAX_WIDTH } from '@/constants'
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { setDateRange } from '@/lib/reducers/screenReducer'
import { capitalize, getLocale } from '@/lib/string'
import { isSameDate } from '@/lib/time'
import { cn } from '@/lib/utils'
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet'
import { Separator } from '@rn-primitives/select'
import { format } from 'date-fns'
import { router, useLocalSearchParams } from 'expo-router'
import { LucideChevronDown, LucideMinus } from 'lucide-react-native'
import moment from 'moment'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, Platform, TouchableOpacity, View } from 'react-native'
import Collapsible from 'react-native-collapsible'

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
    label: 'Last 7 days',
    value: {
      from: moment().subtract(6, 'days').startOf('day').toDate(),
      to: moment().endOf('day').toDate(),
    },
  },
  {
    label: 'Last 30 days',
    value: {
      from: moment().subtract(29, 'days').startOf('day').toDate(),
      to: moment().endOf('day').toDate(),
    },
  },
  {
    label: 'This week',
    value: {
      from: moment().startOf('week').toDate(),
      to: moment().endOf('week').toDate(),
    },
  },
  {
    label: 'Next week',
    value: {
      from: moment().add(1, 'week').startOf('week').toDate(),
      to: moment().add(1, 'week').endOf('week').toDate(),
    },
  },
  {
    label: 'Last week',
    value: {
      from: moment().subtract(1, 'week').startOf('week').toDate(),
      to: moment().subtract(1, 'week').endOf('week').toDate(),
    },
  },
  {
    label: 'This month',
    value: {
      from: moment().startOf('month').toDate(),
      to: moment().endOf('month').toDate(),
    },
  },
  {
    label: 'Next month',
    value: {
      from: moment().add(1, 'month').startOf('month').toDate(),
      to: moment().add(1, 'month').endOf('month').toDate(),
    },
  },
  {
    label: 'Last month',
    value: {
      from: moment().subtract(1, 'month').startOf('month').toDate(),
      to: moment().subtract(1, 'month').endOf('month').toDate(),
    },
  },
  {
    label: 'This year',
    value: {
      from: moment().startOf('year').toDate(),
      to: moment().endOf('year').toDate(),
    },
  },
  {
    label: 'Next year',
    value: {
      from: moment().add(1, 'year').startOf('year').toDate(),
      to: moment().add(1, 'year').endOf('year').toDate(),
    },
  },
  {
    label: 'Last year',
    value: {
      from: moment().subtract(1, 'year').startOf('year').toDate(),
      to: moment().subtract(1, 'year').endOf('year').toDate(),
    },
  },
]

function DateRangePickerPage() {
  // hooks
  const { t: translate, i18n } = useTranslation()
  const t = (key: string) => translate('dateRangePickerPage.' + key)
  const dispatch = useAppDispatch()
  const { isFuture } = useLocalSearchParams()
  const locale = i18n.language

  // store
  const dateRange = useAppSelector(state => state.screen.dateRange)

  // states
  const [from, setFrom] = useState<Date>(moment(dateRange.from).toDate())
  const [to, setTo] = useState<Date>(moment(dateRange.to).toDate())
  const [slide, setSlide] = useState<number>(1)
  const [openRangeSelection, setOpenRangeSelection] = useState<boolean>(false)
  const [selectedRange, setSelectedRange] = useState<any>(null)
  const [openFrom, setOpenFrom] = useState<boolean>(false)
  const [openTo, setOpenTo] = useState<boolean>(false)

  // refs
  const flatListRef = useRef<FlatList>(null)

  // values
  const rangeOptions =
    isFuture === 'true'
      ? ranges.filter(range => moment(range.value.to).isAfter(moment().endOf('day')))
      : ranges

  const isLarge = SCREEN_WIDTH >= DRAWER_MAX_WIDTH

  const handleConfirm = useCallback(() => {
    console.log('Confirm', { from, to })

    dispatch(setDateRange({ from: moment(from).toISOString(), to: moment(to).toISOString() }))
    router.back()
  }, [dispatch, from, to])

  // scroll when slide changes
  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToIndex({
        index: slide - 1,
        animated: true,
      })
    }
  }, [slide])

  useEffect(() => {
    const matchRange = ranges.find(
      range => isSameDate(range.value.from, from) && isSameDate(range.value.to, to)
    )
    setSelectedRange(matchRange || null)
  }, [from, to])

  return (
    <DrawerWrapper>
      {/* From - To */}
      <View className={cn('mt-21 flex-row items-center justify-center gap-3')}>
        <View className="flex-1 flex-col items-center gap-2">
          <Text className="px-2 font-semibold">{t('From Date')}</Text>
          <Button
            variant="outline"
            className={cn('w-full', slide === 1 && Platform.OS === 'ios' && 'border-sky-500')}
            onPress={() => (Platform.OS === 'ios' ? setSlide(1) : setOpenFrom(!openFrom))}
          >
            <Text className="font-semibold">
              {capitalize(format(from, 'MMM dd, yyyy', { locale: getLocale(locale) }))}
            </Text>
          </Button>
        </View>
        <Icon
          render={LucideMinus}
          style={{ marginBottom: -21 }}
        />
        <View className="flex-1 flex-col items-center gap-2">
          <Text className="px-2 font-semibold">{t('To Date')}</Text>
          <Button
            variant="outline"
            className={cn('w-full', slide === 2 && Platform.OS === 'ios' && 'border-sky-500')}
            onPress={() => (Platform.OS === 'ios' ? setSlide(2) : setOpenTo(!openFrom))}
          >
            <Text className="font-semibold">
              {capitalize(format(to, 'MMM dd, yyyy', { locale: getLocale(locale) }))}
            </Text>
          </Button>
        </View>
      </View>

      {/* Quick Range Selection */}
      <TouchableOpacity
        activeOpacity={0.7}
        className="mt-2 w-full flex-row items-center justify-between gap-1 rounded-lg border border-primary px-3 py-3"
        onPress={() => setOpenRangeSelection(!openRangeSelection)}
      >
        <Text className={cn('font-semibold capitalize')}>
          {selectedRange ? t(selectedRange.label) : t('Custom')}
        </Text>
        <Icon
          render={LucideChevronDown}
          className={cn(openRangeSelection && 'rotate-180')}
          size={18}
        />
      </TouchableOpacity>
      <Collapsible collapsed={!openRangeSelection}>
        <View className="mt-1 flex-col overflow-hidden rounded-lg border border-primary shadow-lg">
          {rangeOptions.map((range, index) => (
            <TouchableOpacity
              className="flex-row items-center justify-start gap-2 rounded-none border-b border-primary bg-transparent px-3 py-3"
              onPress={() => {
                setFrom(range.value.from)
                setTo(range.value.to)
                setSelectedRange(range)
                setOpenRangeSelection(false)
              }}
              key={index}
            >
              <Text className={cn('font-semibold capitalize')}>{t(range.label)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Collapsible>

      {/* Calendars */}
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
          <View
            className={cn('flex-1 items-center gap-1', Platform.OS === 'ios' && 'mt-4')}
            style={{ width: isLarge ? DRAWER_MAX_WIDTH - 42 : SCREEN_WIDTH - 42 }}
          >
            {Platform.OS === 'ios' && (
              <Text className="px-2 text-lg font-semibold">{t(item.label)}</Text>
            )}
            <DateTimePicker
              open={item.type === 'from' ? openFrom : openTo}
              close={() => {
                setOpenFrom(false)
                setOpenTo(false)
              }}
              className="bg-white"
              currentDate={item.type === 'from' ? from : to}
              onChange={date => {
                if (date) {
                  if (item.type === 'from') {
                    setFrom(date)
                    setOpenFrom(false)
                  } else {
                    if (moment(date).isBefore(from)) {
                      // exchange from and to
                      setTo(from)
                      setFrom(date)
                      setOpenTo(false)
                    } else {
                      setTo(date)
                      setOpenTo(false)
                    }
                  }
                }
              }}
            />
          </View>
        )}
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        scrollEnabled={false}
      />

      <View
        className="mb-21 mt-8"
        style={{ paddingLeft: 21, paddingRight: 21 }}
      >
        <View className="mt-3 flex-row items-center justify-center gap-21">
          <Button
            variant="secondary"
            className="h-10 flex-1 rounded-md px-21/2"
            onPress={() => {
              router.back()
            }}
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
    </DrawerWrapper>
  )
}

export default DateRangePickerPage

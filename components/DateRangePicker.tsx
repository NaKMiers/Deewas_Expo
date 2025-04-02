import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker'
import { differenceInDays, format, Locale } from 'date-fns'
import { enUS } from 'date-fns/locale' // Locale mặc định (tiếng Anh)
import React, { useState } from 'react'
import { Platform, StyleSheet, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native'

interface DateRange {
  from: Date
  to: Date
}

interface DateRangePickerProps {
  locale?: Locale // Ngôn ngữ tùy chọn
  initialDateFrom?: Date // Ngày bắt đầu mặc định
  initialDateTo?: Date // Ngày kết thúc mặc định
  showCompare?: boolean // Để tương thích với code của bạn
  onUpdate?: (values: { range: DateRange }) => void // Callback khi chọn ngày
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  locale = enUS,
  initialDateFrom = new Date(),
  initialDateTo = new Date(),
  showCompare = false,
  onUpdate,
}) => {
  const [fromDate, setFromDate] = useState<Date>(initialDateFrom)
  const [toDate, setToDate] = useState<Date>(initialDateTo)
  const [showFromPicker, setShowFromPicker] = useState<boolean>(false)
  const [showToPicker, setShowToPicker] = useState<boolean>(false)

  const handleFromChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || fromDate
    setShowFromPicker(Platform.OS === 'ios')
    setFromDate(currentDate)

    if (currentDate && toDate) {
      validateAndUpdate(currentDate, toDate)
    }
  }

  const handleToChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || toDate
    setShowToPicker(Platform.OS === 'ios')
    setToDate(currentDate)

    if (fromDate && currentDate) {
      validateAndUpdate(fromDate, currentDate)
    }
  }

  const validateAndUpdate = (from: Date, to: Date) => {
    if (!from || !to) return

    const diff = differenceInDays(to, from)
    // if (diff > 90) {
    //   alert(`The selected date range is too large. Max allowed range is 90 days!`)
    //   return
    // }

    if (onUpdate) {
      onUpdate({ range: { from, to } })
    }
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowFromPicker(true)}
      >
        <Text style={styles.dateText}>{format(fromDate, 'MMM dd, yyyy', { locale })}</Text>
      </TouchableOpacity>

      <Text style={styles.separator}> - </Text>

      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowToPicker(true)}
      >
        <Text style={styles.dateText}>{format(toDate, 'MMM dd, yyyy', { locale })}</Text>
      </TouchableOpacity>

      {showFromPicker && (
        <DateTimePicker
          value={fromDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'calendar'}
          onChange={handleFromChange}
          maximumDate={toDate}
        />
      )}

      {showToPicker && (
        <DateTimePicker
          value={toDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'calendar'}
          onChange={handleToChange}
          minimumDate={fromDate}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  } as ViewStyle,
  dateButton: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  } as ViewStyle,
  dateText: {
    fontSize: 16,
  } as TextStyle,
  separator: {
    marginHorizontal: 10,
    fontSize: 16,
  } as TextStyle,
})

export default DateRangePicker

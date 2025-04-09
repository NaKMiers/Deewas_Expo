import { useColorScheme } from '@/lib/useColorScheme'
import { cn } from '@/lib/utils'
import RNDateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker'
import React from 'react'
import { Platform, View } from 'react-native'
import Text from './Text'
import { Button } from './ui/button'

interface DateTimePickerProps {
  onChange: (date: Date) => void
  currentDate: Date
  className?: string
  [key: string]: any
}

function DateTimePicker(props: DateTimePickerProps) {
  if (Platform.OS === 'android') {
    return <AndroidDateTimePicker {...props} />
  }

  if (Platform.OS === 'ios') {
    return <IOSDateTimePicker {...props} />
  }
}

export const AndroidDateTimePicker = ({
  onChange,
  currentDate,
  className,
  ...rest
}: DateTimePickerProps) => {
  const showDateTimePicker = () => {
    DateTimePickerAndroid.open({
      value: currentDate,
      onChange: (_, date?: Date) => onChange(date || new Date()),
      mode: 'date',
    })
  }

  return (
    <View
      className={cn(className)}
      // {...rest}
    >
      <Text>{currentDate.toLocaleDateString()}</Text>
      <Button
        variant="outline"
        onPress={showDateTimePicker}
      >
        <Text>Open Calendar</Text>
      </Button>
    </View>
  )
}

export const IOSDateTimePicker = ({
  onChange,
  currentDate,
  className,
  ...rest
}: DateTimePickerProps) => {
  // hooks
  const { isDarkColorScheme } = useColorScheme()

  console.log('currentDate', currentDate)

  return (
    <RNDateTimePicker
      accentColor={isDarkColorScheme ? '#fff' : '#111'}
      value={currentDate}
      mode="date"
      display="inline"
      onChange={(_, date?: Date) => onChange(date || new Date())}
      className={cn('flex-1', className)}
      {...rest}
    />
  )
}

export default DateTimePicker

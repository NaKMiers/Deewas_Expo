import { useColorScheme } from '@/lib/useColorScheme'
import { cn } from '@/lib/utils'
import DateTimePickerRN, { DateTimePickerEvent } from '@react-native-community/datetimepicker'
import React, { ReactNode } from 'react'
import { Platform, View } from 'react-native'

interface Props {
  trigger?: ReactNode
  currentDate: Date
  onChange: (date: Date) => void
  className?: string
  open?: boolean
  close?: () => void
  [key: string]: any
}

const DateTimePicker = ({ currentDate, onChange, open, close, className, ...rest }: Props) => {
  const { isDarkColorScheme } = useColorScheme()

  return (
    <View>
      {Platform.OS === 'ios' ? (
        <DateTimePickerRN
          value={currentDate}
          accentColor={isDarkColorScheme ? '#fff' : '#111'}
          mode="date"
          display="inline"
          onChange={(_, date?: Date) => onChange(date || currentDate)}
          className={cn('flex-1', className)}
          {...rest}
        />
      ) : (
        open && (
          <DateTimePickerRN
            value={currentDate}
            accentColor={isDarkColorScheme ? '#fff' : '#111'}
            mode="date"
            display="default"
            onChange={(event: DateTimePickerEvent, date?: Date) => {
              if (event.type === 'dismissed') {
                if (close) close()
              } else if (event.type === 'set') {
                onChange(date || currentDate)
                if (close) close()
              }
            }}
            className={cn('flex-1', className)}
            {...rest}
          />
        )
      )}
    </View>
  )
}

export default DateTimePicker

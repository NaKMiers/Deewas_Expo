import { cn } from '@/lib/utils'
import React, { memo, useState } from 'react'
import { Text, TextInput, View } from 'react-native'

import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field'

const CELL_COUNT = 6

interface CodeEntryProps {
  cellCount?: number
  className?: string
}

const CodeEntry = ({ cellCount, className }: CodeEntryProps) => {
  const [value, setValue] = useState('')
  const ref = useBlurOnFulfill({ value, cellCount: CELL_COUNT })
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  })

  return (
    <CodeField
      InputComponent={TextInput}
      ref={ref}
      value={value}
      onChangeText={setValue}
      cellCount={cellCount}
      keyboardType="number-pad"
      className={cn(className)}
      testID="my-code-input"
      renderCell={({ index, symbol, isFocused }) => (
        <View
          className={cn(
            'h-10 w-10 flex-row items-center justify-center rounded-md border shadow-md',
            isFocused && 'border-2'
          )}
          key={index}
        >
          <Text
            className="text-center font-medium"
            onLayout={getCellOnLayoutHandler(index)}
          >
            {symbol || (isFocused ? <Cursor /> : null)}
          </Text>
        </View>
      )}
      {...props}
    />
  )
}

export default memo(CodeEntry)

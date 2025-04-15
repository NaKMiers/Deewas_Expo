import React from 'react'
import { View } from 'react-native'
import Text from './Text'
import { cn } from '@/lib/utils'

interface NoItemsFoundProps {
  text: string
  className?: string
}

function NoItemsFound({ text, className }: NoItemsFoundProps) {
  return (
    <View className={cn('px-21/2', className)}>
      <View
        className="flex flex-row items-center justify-center rounded-md border border-primary px-2 py-6"
        style={{
          paddingTop: 20,
          paddingBottom: 20,
          paddingLeft: 10,
          paddingRight: 10,
        }}
      >
        <Text className="text-center text-xl font-semibold text-muted-foreground">{text}</Text>
      </View>
    </View>
  )
}

export default NoItemsFound

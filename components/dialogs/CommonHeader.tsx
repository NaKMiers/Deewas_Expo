import { cn } from '@/lib/utils'
import React, { memo, ReactNode } from 'react'
import { Text, View } from 'react-native'

interface CommonHeaderProps {
  title: string | ReactNode
  desc?: string | ReactNode
  className?: string
}

function CommonHeader({ title, desc, className }: CommonHeaderProps) {
  return (
    <View className={cn(className)}>
      <Text className="text-center text-xl font-semibold text-primary">{title}</Text>
      {desc && <Text className="mt-0.5 text-center tracking-wider text-muted-foreground">{desc}</Text>}
    </View>
  )
}

export default memo(CommonHeader)

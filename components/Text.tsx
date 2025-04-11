import { cn } from '@/lib/utils'
import React from 'react'
import { Text as RNText, TextProps } from 'react-native'

export default function Text({ className, style, children, ...props }: TextProps) {
  return (
    <RNText
      className={cn('font-sans text-primary', className)}
      style={style}
      {...props}
    >
      {children}
    </RNText>
  )
}

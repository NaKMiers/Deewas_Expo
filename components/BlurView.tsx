import { useColorScheme } from '@/lib/useColorScheme'
import { cn } from '@/lib/utils'
import { BlurViewProps, BlurView as RNBlurView } from 'expo-blur'
import React, { memo } from 'react'
import { Platform, View } from 'react-native'

function BlurView({
  className,
  style,
  children,
  noBlur,
  ...props
}: BlurViewProps & { noBlur?: boolean }) {
  const { isDarkColorScheme } = useColorScheme()

  return noBlur && Platform.OS === 'android' ? (
    <View
      className={cn('bg-secondary', className)}
      style={style}
      {...props}
    >
      {children}
    </View>
  ) : (
    <RNBlurView
      tint={isDarkColorScheme ? 'dark' : 'light'}
      intensity={80}
      className={cn(className)}
      style={style}
      {...props}
    >
      {children}
    </RNBlurView>
  )
}

export default memo(BlurView)

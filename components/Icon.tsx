import { useColorScheme } from '@/lib/useColorScheme'
import React, { ElementType } from 'react'

interface IconProps {
  render: ElementType
  reverse?: boolean
  [key: string]: any
}

function Icon({ render: Icon, reverse, ...props }: IconProps) {
  const { isDarkColorScheme } = useColorScheme()
  const isDark = reverse ? !isDarkColorScheme : isDarkColorScheme

  return <Icon color={isDark ? 'white' : 'black'} {...props} />
}

export default Icon

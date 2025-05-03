import { cn } from '@/lib/utils'
import { ComponentPropsWithoutRef, useEffect } from 'react'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'

const duration = 1000

function Skeleton({
  className,
  ...props
}: Omit<ComponentPropsWithoutRef<typeof Animated.View>, 'style'>) {
  const sv = useSharedValue(1)

  useEffect(() => {
    sv.value = withRepeat(withSequence(withTiming(0.5, { duration }), withTiming(1, { duration })), -1)
  }, [sv])

  const style = useAnimatedStyle(() => ({
    opacity: sv.value,
  }))

  return (
    <Animated.View
      style={style}
      className={cn('rounded-xl border border-primary/10 bg-secondary dark:bg-muted', className)}
      {...props}
    />
  )
}

export { Skeleton }

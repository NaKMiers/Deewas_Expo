import { cn } from '@/lib/utils'
import { memo, useEffect, useRef, useState } from 'react'
import { Animated, Easing, View } from 'react-native'
import Text from './Text'

interface PriceProps {
  timeType: 'loop' | 'once'
  start?: string
  duration?: number
  expire?: string
  textClassName?: string
  className?: string
}

function CountDown({ timeType, start, duration, expire, textClassName, className }: PriceProps) {
  // states
  const [timeLeft, setTimeLeft] = useState<number[]>([0, 0, 0])

  // MARK: Effects
  // count down
  useEffect(() => {
    let interval: any

    // get hours, minutes, seconds left
    const getTimesLeft = () => {
      // target time
      const now = new Date().getTime()
      let targetTime: any

      // check time type
      if (timeType === 'once' && expire) {
        targetTime = new Date(expire)
      } else if (timeType === 'loop' && duration && start) {
        const begin = new Date(start).getTime()

        const a = (now - begin) / 1000 / 60 // time distance in minute
        const d = duration // duration in minute
        const b = a / d
        const c = Math.ceil(b) * d
        const t = new Date(begin)
        t.setMinutes(t.getMinutes() + c)
        targetTime = t
      }

      let timeDifference = targetTime - now

      let seconds = 0
      let minutes = 0
      let hours = 0
      if (timeDifference > 0) {
        seconds = Math.floor((timeDifference / 1000) % 60)
        minutes = Math.floor((timeDifference / (1000 * 60)) % 60)
        hours = Math.floor(timeDifference / (1000 * 60 * 60))
      }

      // return hours, minutes, seconds left
      return [hours, minutes, seconds]
    }

    // start count down
    interval = setInterval(() => {
      setTimeLeft(getTimesLeft())

      // check if time is up
      if (timeLeft[0] === 0 && timeLeft[1] === 0 && timeLeft[2] === 0) {
        clearInterval(interval)
      }
    }, 1000)

    // clean up
    return () => clearInterval(interval)
  }, [duration, expire, start, timeType, timeLeft])

  return (
    <View className={cn('shrink-0 flex-row items-center gap-1', className)}>
      {/* Hours */}
      <View className="flex-row items-center rounded-sm pl-[2px] pr-[1px]">
        <CounterItem
          value={
            +Math.floor(timeLeft[0] / 10)
              .toString()
              .slice(-1)
          }
          max={9}
          textClassName={textClassName}
        />
        <CounterItem
          value={timeLeft[0] % 10}
          max={9}
          textClassName={textClassName}
        />
      </View>

      <Text className={cn('font-semibold', textClassName)}>:</Text>

      {/* Minutes */}
      <View className="flex-row items-center rounded-sm pl-[2px] pr-[1px]">
        <CounterItem
          value={Math.floor(timeLeft[1] / 10)}
          max={5}
          textClassName={textClassName}
        />
        <CounterItem
          value={timeLeft[1] % 10}
          max={9}
          textClassName={textClassName}
        />
      </View>

      <Text className={cn('font-semibold', textClassName)}>:</Text>

      {/* Seconds */}
      <View className="flex-row items-center rounded-sm pl-[2px] pr-[1px]">
        <CounterItem
          value={Math.floor(timeLeft[2] / 10)}
          max={5}
          textClassName={textClassName}
        />
        <CounterItem
          value={timeLeft[2] % 10}
          max={9}
          textClassName={textClassName}
        />
      </View>
    </View>
  )
}

export default memo(CountDown)

interface CounterItemProps {
  max: number
  value: number
  size?: number
  textClassName?: string
  className?: string
}

function CounterItem({ max, value, size = 25, textClassName, className }: CounterItemProps) {
  const translateY = useRef(new Animated.Value(0)).current

  useEffect(() => {
    let slide = max - value

    if (slide === 0) {
      Animated.timing(translateY, {
        toValue: (max + 1) * size,
        duration: 200,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => {
        translateY.setValue(0)
      })
    } else {
      Animated.timing(translateY, {
        toValue: slide * size,
        duration: 200,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start()
    }
  }, [max, value, size, translateY])

  const numbers = [...Array.from({ length: max + 1 }, (_, i) => max - i), max]

  return (
    <View
      className={`overflow-hidden ${className}`}
      style={{ height: size }}
    >
      <Animated.View
        className="flex-col"
        style={{
          transform: [
            {
              translateY: translateY.interpolate({
                inputRange: [0, (max + 1) * size],
                outputRange: [0, -(max + 1) * size],
              }),
            },
          ],
        }}
      >
        {numbers.map((n, i) => (
          <Text
            key={i}
            style={{ height: 25 }}
            className={cn('ml-0.5 rounded-sm px-1 text-lg font-bold', textClassName)}
          >
            {n}
          </Text>
        ))}
      </Animated.View>
    </View>
  )
}

import Icon from '@/components/Icon'
import Slide1 from '@/components/onboarding/Slide1'
import Slide2 from '@/components/onboarding/Slide2'
import Slide3 from '@/components/onboarding/Slide3'
import Slide4 from '@/components/onboarding/Slide4'
import Slide5 from '@/components/onboarding/Slide5'
import Slide6 from '@/components/onboarding/Slide6'
import { useAuth } from '@/components/providers/AuthProvider'
import { IPAD_THRESHOLD } from '@/constants'
import { useAppDispatch } from '@/hooks/reduxHook'
import { setOnboarding } from '@/lib/reducers/userReducer'
import { sendReportApi } from '@/requests'
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Redirect, router } from 'expo-router'
import { LucideChevronLeft, LucideRotateCcw } from 'lucide-react-native'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Animated, FlatList, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

function OnboardingPage() {
  // hooks
  const { user, onboarding } = useAuth()
  const dispatch = useAppDispatch()

  // refs
  const swiperRef = useRef<any>(null)
  const progressAnim = useRef(new Animated.Value(0)).current

  // states
  const [slide, setSlide] = useState<number>(1)
  const [form, setForm] = useState<any[]>([])

  // values
  const isLarge = SCREEN_WIDTH > IPAD_THRESHOLD

  // send report
  const handleSendReport = useCallback(async () => {
    try {
      const onboardingData = await AsyncStorage.getItem('onboarding')

      if (onboardingData) {
        await sendReportApi(form)
      }

      // set onboarding
      await AsyncStorage.setItem('onboarding', JSON.stringify(form))
      dispatch(setOnboarding(form))
    } catch (err: any) {
      console.log(err)
    }
  }, [form, dispatch])

  // MARK: Indicators
  const nextSlide = useCallback(() => {
    if (swiperRef.current) {
      swiperRef.current.scrollToIndex({ index: Math.min(6, slide + 1) - 1 })
      setSlide(Math.min(6, slide + 1))
    }
  }, [swiperRef, slide])

  const prevSlide = useCallback(() => {
    if (swiperRef.current) {
      swiperRef.current.scrollToIndex({ index: Math.max(slide - 1, 1) - 1 })
      setSlide(Math.max(slide - 1, 1))

      // back to previous screen if on first slide
      if (slide === 1) router.back()
    }
  }, [swiperRef, slide])

  // slides
  const slides = useMemo(
    () => [
      <Slide1
        onChange={value => {
          const newForm = [...form]
          newForm[0] = value
          setForm(newForm)
          nextSlide()
        }}
      />,
      <Slide2
        onChange={value => {
          const newForm = [...form]
          newForm[1] = value
          setForm(newForm)
          nextSlide()
        }}
      />,
      <Slide3
        onChange={value => {
          const newForm = [...form]
          newForm[2] = value
          setForm(newForm)
          nextSlide()
        }}
      />,
      <Slide4
        onChange={async value => {
          await AsyncStorage.setItem('currency', JSON.stringify(value))
          nextSlide()
        }}
      />,
      <Slide5
        onChange={async value => {
          await AsyncStorage.setItem('personalities', JSON.stringify(value))
          nextSlide()
        }}
      />,
      <Slide6 onPress={handleSendReport} />,
    ],
    [form, handleSendReport, nextSlide]
  )

  // calculate progress bar
  useEffect(() => {
    const progress = slide / slides.length
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start()
  }, [slides, slide, progressAnim])

  // go home if user is logged in
  if (user) return <Redirect href="/home" />
  // else if (onboarding) return <Redirect href="/auth/sign-in" />

  return (
    <SafeAreaView className="flex-1 bg-primary-foreground">
      <View className="flex-1 px-21/2 md:px-21">
        {/* MARK: Progress */}
        <View className="mx-auto max-w-[500px] flex-row items-center justify-center gap-21 border-b border-secondary px-21/2 pb-21/2">
          <TouchableOpacity
            className="items-center justify-center rounded-full p-1"
            style={{ marginLeft: -21 / 2 }}
            onPress={prevSlide}
          >
            <Icon
              render={LucideChevronLeft}
              size={30}
            />
          </TouchableOpacity>
          <View className="h-2 flex-1 rounded-full bg-primary/10">
            <Animated.View
              className="h-2 rounded-full bg-primary"
              style={{
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              }}
            />
          </View>
          <TouchableOpacity
            className="items-center justify-center rounded-full p-1"
            onPress={() => router.replace('/onboarding')}
          >
            <Icon
              render={LucideRotateCcw}
              size={22}
            />
          </TouchableOpacity>
        </View>

        {/* MARK: Swiper */}
        <FlatList
          data={Array.from({ length: slides.length }, (_, i) => i + 1)}
          ref={swiperRef}
          horizontal
          keyExtractor={item => item.toString()}
          className="mt-21"
          renderItem={({ item }) => (
            <View
              className="w px-21/2"
              style={{
                width: isLarge ? SCREEN_WIDTH - 42 : SCREEN_WIDTH - 21,
              }}
            >
              {slides[item - 1]}
            </View>
          )}
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          scrollEnabled={false}
        />
      </View>
    </SafeAreaView>
  )
}

export default OnboardingPage

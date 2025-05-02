import icons from '@/assets/icons/icons'
import { images } from '@/assets/images/images'
import Icon from '@/components/Icon'
import Image from '@/components/Image'
import { useRevenueCat } from '@/components/providers/RevenueCatProvider'
import Text from '@/components/Text'
import { Separator } from '@/components/ui/separator'
import { setLoading } from '@/lib/reducers/budgetReducer'
import { formatPrice } from '@/lib/string'
import { cn } from '@/lib/utils'
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet'
import { BlurView } from 'expo-blur'
import { router, useNavigation } from 'expo-router'
import { LucideCheck, LucideMessageCircleMore, LucideX } from 'lucide-react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  FlatList,
  ImageBackground,
  Linking,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native'
import { PurchasesPackage } from 'react-native-purchases'
import { SafeAreaView } from 'react-native-safe-area-context'

const freeFeatures = [
  'Max 2 wallets',
  'Max 4 budgets',
  'Annoying ads',
  '10.000 AI tokens every day',
  'No priority support',
  "Can't export data",
  'Bar chart only',
  'Mobile only',
]

const premiumFeatures = [
  'Unlimited wallets',
  'Unlimited budgets',
  'No advertisement',
  'Up to 4.500.000 AI tokens per month',
  'Priority support',
  'Export data to Google Sheets, Excel, CSV',
  'Unlock advanced charts (pie, line, bar, etc.)',
  'Mobile and web',
]

const reviews = [
  {
    name: 'John Doe',
    country: 'USA',
    desc: 'This app is amazing! It has changed the way I manage my finances.',
    rating: 5,
  },
  {
    name: 'Jane Smith',
    country: 'Canada',
    desc: 'I love the AI features! They help me make better financial decisions.',
    rating: 5,
  },
  {
    name: 'Alice Johnson',
    country: 'UK',
    desc: 'The app is user-friendly and has a lot of great features. Highly recommend!',
    rating: 5,
  },
]

const IPAD_THRESHOLD = 768

function PremiumPage() {
  // hooks
  const { i18n } = useTranslation()
  const locale = i18n.language
  const navigation = useNavigation()
  const { packages, purchasing, purchasePackage, restorePurchase } = useRevenueCat()

  // states
  const [countdown, setCountdown] = useState(1) // seconds
  const [selectedPackage, setSelectedPackage] = useState<PurchasesPackage | null>(null)

  // values
  const isIpad = SCREEN_WIDTH > IPAD_THRESHOLD

  // initially select package
  useEffect(() => {
    setSelectedPackage(packages.find(item => item.packageType === 'ANNUAL') || null)
  }, [packages])

  // prevent change screen when back button pressed or when swipe back
  useEffect(() => {
    navigation.setOptions({ gestureEnabled: false })
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      return true
    })
    return () => backHandler.remove()
  }, [navigation])

  // countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown(prev => prev - 1)
      }, 1100)

      return () => clearInterval(timer)
    }
  }, [countdown])

  // MARK: Buy package
  const handleBuyPackage = useCallback(async () => {
    // start loading
    setLoading(1)

    try {
      if (!selectedPackage) {
        return Alert.alert('Please select a package')
      }

      await purchasePackage(selectedPackage)
    } catch (error) {
      console.error('Error purchasing package:', error)
      Alert.alert('Purchase failed', 'Please try again later.')
    } finally {
      // stop loading
      setLoading(0)
    }
  }, [selectedPackage, purchasePackage])

  // handle close
  const handleClose = useCallback(() => {
    if (countdown > 0 || purchasing) return
    router.back()
  }, [countdown, purchasing])

  return (
    <SafeAreaView className="flex-1">
      <BlurView
        className="relative flex-1"
        intensity={100}
        tint="prominent"
      >
        <ScrollView>
          <View>
            {/* MARK: Introduction */}
            <ImageBackground
              source={images.preBg}
              resizeMode="cover"
              className="flex-1 overflow-hidden rounded-b-3xl p-4 pb-21 shadow-lg"
            >
              <View className="flex-row items-center justify-end">
                <TouchableOpacity
                  className={cn(
                    'h-7 w-7 items-center justify-center rounded-full bg-white shadow-md',
                    purchasing && 'opacity-50'
                  )}
                  onPress={handleClose}
                  disabled={countdown > 0 || purchasing}
                >
                  {countdown > 0 ? (
                    <Text className="text-xs font-medium text-black">{countdown}</Text>
                  ) : (
                    <Icon
                      render={LucideX}
                      size={18}
                      color="black"
                    />
                  )}
                </TouchableOpacity>
              </View>

              <View style={{ height: 150 }}>
                <Image
                  source={images.preLogo}
                  resizeMode="contain"
                  className="h-full w-full"
                />
              </View>

              <View className="flex-row items-center justify-center gap-21/2">
                <Text className="flex items-end text-center text-3xl font-extrabold tracking-wider text-neutral-800">
                  DEEWAS
                </Text>
                <View className="flex-row items-center justify-center rounded-md bg-sky-500 px-3 py-1 shadow-md">
                  <Text className="text-lg font-bold text-white">Premium</Text>
                </View>
              </View>

              <Text className="mt-1 text-center font-body text-lg tracking-wider text-neutral-800">
                Unlock premium to access all powerful features!
              </Text>
            </ImageBackground>

            <Separator className="my-6 h-0" />

            {/* MARK: Comparisons */}
            <View className="flex-row items-start justify-center gap-1.5 px-21/2">
              <View className="mt-7 w-1/2 rounded-lg border border-border bg-secondary py-5 shadow-lg">
                <Text className="text-center text-2xl font-bold">FREE</Text>

                <View className="mt-3 gap-2 px-2">
                  {freeFeatures.map((feature, index) => (
                    <View
                      className="flex-row gap-2"
                      key={index}
                    >
                      <Icon
                        render={LucideX}
                        size={20}
                        color="#ccc"
                      />
                      <Text className="flex-1 font-medium">{feature}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <View className="w-1/2 rounded-lg border border-sky-500 bg-white py-12 shadow-lg">
                <Text className="text-center text-2xl font-bold text-sky-500">PREMIUM</Text>

                <View className="mt-3 gap-2 px-2">
                  {premiumFeatures.map((feature, index) => (
                    <View
                      className="flex-row gap-2"
                      key={index}
                    >
                      <Icon
                        render={LucideCheck}
                        size={20}
                        color="#ec4899"
                      />
                      <Text className="flex-1 font-medium text-black">{feature}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            <Separator className="my-6 h-0" />

            {/* MARK: Reviews */}
            <View className="px-21/2">
              <Text className="text-center text-2xl font-bold">What are users talk about Deewas?</Text>

              <View className="mt-21 flex-1">
                <FlatList
                  horizontal
                  data={reviews}
                  keyExtractor={(_, index) => index.toString()}
                  showsHorizontalScrollIndicator={false}
                  snapToInterval={SCREEN_WIDTH}
                  decelerationRate="fast"
                  className="-mx-21/2"
                  renderItem={({ item: review }) => (
                    <View
                      className="px-21/2"
                      style={{
                        width: isIpad ? (SCREEN_WIDTH - 21) / 2 : SCREEN_WIDTH,
                      }}
                    >
                      <View className="gap-1 rounded-2xl border border-primary p-21 shadow-md">
                        <Text className="text-center text-lg font-semibold">{review.name}</Text>
                        <Text className="text-center">{review.desc}</Text>
                        <View className="flex-row items-center justify-center gap-1">
                          {Array.from({ length: review.rating }, (_, index) => (
                            <View
                              style={{ width: 18, height: 18 }}
                              key={index}
                            >
                              <Image
                                source={icons.star}
                                resizeMode="contain"
                                className="h-full w-full"
                              />
                            </View>
                          ))}
                        </View>
                      </View>
                    </View>
                  )}
                />
              </View>
            </View>
          </View>

          <Separator className="my-6 h-0" />

          {/* MARK: Contact */}
          <View className="px-21/2">
            <TouchableOpacity
              onPress={() => Linking.openURL('mailto:deewas.now@gmail.com')}
              className="flex-row items-center justify-center gap-2 rounded-md border border-sky-500 bg-white px-21 py-3 shadow-md"
            >
              <Icon
                render={LucideMessageCircleMore}
                size={24}
                color="#0ea5e9"
              />
              <Text className="text-lg font-semibold text-sky-500">Contact Customer Service</Text>
            </TouchableOpacity>

            <Text className="mt-21 text-center text-sm font-medium tracking-wider text-primary">
              <Text
                className="font-semibold tracking-tight text-sky-600"
                onPress={() => router.push('/privacy-policy')}
              >
                Privacy Policy
              </Text>{' '}
              and{' '}
              <Text
                className="font-semibold tracking-tight text-sky-600"
                onPress={() => router.push('/terms-and-conditions')}
              >
                Terms of Conditions
              </Text>
            </Text>
          </View>

          <Separator className="my-52 h-0" />
        </ScrollView>

        {/* MARK: Packages */}
        <View className="absolute bottom-21 left-0 z-20 w-full">
          <ImageBackground
            source={images.preBgVFlip}
            resizeMode="cover"
            className="overflow-hidden rounded-t-3xl px-21 pb-10 pt-6 shadow-lg"
          >
            <View className="w-full flex-1 flex-row items-center justify-evenly gap-21/2">
              {packages.map(pack => {
                const { product, packageType } = pack
                const isSelected = selectedPackage?.packageType === packageType

                return (
                  <TouchableOpacity
                    key={pack.identifier}
                    activeOpacity={0.7}
                    onPress={() => setSelectedPackage(pack)}
                    className="w-1/3 flex-1 flex-row items-end shadow-md"
                  >
                    <View
                      className={cn(
                        'relative flex-1 rounded-xl border border-border bg-white/50',
                        isSelected && 'border-sky-500 bg-white'
                      )}
                    >
                      {packageType === 'ANNUAL' && (
                        <View
                          className={cn(
                            'absolute -top-1 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white px-2 shadow-md'
                          )}
                        >
                          <Text className="text-sm text-black">58% OFF</Text>
                        </View>
                      )}

                      <Text
                        className={cn(
                          'rounded-b-sm rounded-t-lg border-b py-2 text-center text-lg font-bold text-black',
                          isSelected && 'border-0 bg-sky-500 text-white'
                        )}
                      >
                        {product.title}
                      </Text>

                      <View className="px-0.5 py-2">
                        <Text className="text-center text-sm tracking-wider text-neutral-800">
                          {formatPrice(product.price, locale, product.currencyCode)}
                        </Text>

                        <Text className="mt-2 text-center font-semibold tracking-wider text-neutral-800">
                          {formatPrice(
                            product.pricePerMonth || product.price,
                            locale,
                            product.currencyCode
                          )}
                        </Text>
                        <Text className="text-center font-semibold tracking-wider text-neutral-800">
                          {packageType !== 'LIFETIME' ? 'per month' : 'one-time'}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                )
              })}
            </View>

            <Text className="mt-2 text-center text-sm font-medium text-muted-foreground">
              Subscription will be auto reviewed, cancel at any time.
            </Text>

            <TouchableOpacity
              className={cn(
                'mt-21/2 h-12 flex-row items-center justify-center rounded-full bg-white px-21 py-2 shadow-lg',
                purchasing && 'opacity-50'
              )}
              disabled={purchasing}
              onPress={handleBuyPackage}
            >
              {purchasing ? (
                <ActivityIndicator color="#262626" />
              ) : (
                <Text className="text-center font-body text-lg font-semibold tracking-wider text-neutral-800">
                  Start 1 Week Free Trial
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              className="mt-2 flex-row items-center justify-center px-21"
              disabled={purchasing}
              onPress={restorePurchase}
            >
              <Text className="font-body font-medium tracking-wider text-neutral-600 underline">
                Restore purchase
              </Text>
            </TouchableOpacity>
          </ImageBackground>
        </View>
      </BlurView>
    </SafeAreaView>
  )
}

export default PremiumPage

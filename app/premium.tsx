import icons from '@/assets/icons/icons'
import { images } from '@/assets/images/images'
import Icon from '@/components/Icon'
import Image from '@/components/Image'
import { useRevenueCat } from '@/components/providers/RevenueCatProvider'
import Text from '@/components/Text'
import { Separator } from '@/components/ui/separator'
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet'
import { router, useNavigation } from 'expo-router'
import { LucideCheck, LucideMessageCircleMore, LucideX } from 'lucide-react-native'
import React, { useEffect, useState } from 'react'
import {
  BackHandler,
  FlatList,
  ImageBackground,
  Linking,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import RevenueCatUI from 'react-native-purchases-ui'

const freeFeatures = [
  'Max 2 wallets',
  'Max 4 budgets',
  'Annoying ads',
  '500 AI tokens per month',
  'No priority support',
  "Can't export data",
  'Bar chart only',
  'Mobile only',
]

const premiumFeatures = [
  'Unlimited wallets',
  'Unlimited budgets',
  'No advertisement',
  'Up to 50.000 AI tokens per month',
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
  const navigation = useNavigation()
  const { packages, purchasePackage } = useRevenueCat()

  // states
  const [countdown, setCountdown] = useState(0)

  // values
  const isIpad = SCREEN_WIDTH > IPAD_THRESHOLD

  // prevent change screen when back button pressed or when swipe back
  // useEffect(() => {
  //   navigation.setOptions({ gestureEnabled: false })
  //   const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
  //     return true
  //   })
  //   return () => backHandler.remove()
  // }, [navigation])

  // countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown(prev => prev - 1)
      }, 1100)

      return () => clearInterval(timer)
    }
  }, [countdown])

  return (
    // <SafeAreaView className="flex-1">
    //   <ScrollView>
    //     <View>
    //       {/* MARK: Introduction */}
    //       <ImageBackground
    //         source={images.preBg}
    //         resizeMode="cover"
    //         className="flex-1 overflow-hidden rounded-b-3xl p-4 pb-21 shadow-lg"
    //       >
    //         <View className="flex-row items-center justify-end">
    //           <TouchableOpacity
    //             className="h-7 w-7 items-center justify-center rounded-full bg-white shadow-md"
    //             onPress={() => router.back()}
    //             disabled={countdown > 0}
    //           >
    //             {countdown > 0 ? (
    //               <Text className="text-xs font-medium text-black">{countdown}</Text>
    //             ) : (
    //               <Icon
    //                 render={LucideX}
    //                 size={18}
    //                 color="black"
    //               />
    //             )}
    //           </TouchableOpacity>
    //         </View>

    //         <View style={{ height: 150 }}>
    //           <Image
    //             source={images.preLogo}
    //             resizeMode="contain"
    //             className="h-full w-full"
    //           />
    //         </View>

    //         <View className="flex-row items-center justify-center gap-21/2">
    //           <Text className="flex items-end text-center text-3xl font-extrabold tracking-wider text-neutral-800">
    //             DEEWAS
    //           </Text>
    //           <View className="flex-row items-center justify-center rounded-md bg-sky-500 px-3 py-1 shadow-md">
    //             <Text className="text-lg font-bold text-white">Premium</Text>
    //           </View>
    //         </View>

    //         <Text className="mt-1 text-center font-body text-lg tracking-wider text-neutral-800">
    //           Unlock premium to access all powerful features!
    //         </Text>
    //       </ImageBackground>

    //       <Separator className="my-6 h-0" />

    //       {/* MARK: Comparisons */}
    //       <View className="flex-row items-start justify-center gap-1.5 px-21/2">
    //         <View className="mt-7 w-1/2 rounded-lg border border-border bg-secondary py-5 shadow-lg">
    //           <Text className="text-center text-2xl font-bold">FREE</Text>

    //           <View className="mt-3 gap-2 px-2">
    //             {freeFeatures.map((feature, index) => (
    //               <View
    //                 className="flex-row gap-2"
    //                 key={index}
    //               >
    //                 <Icon
    //                   render={LucideX}
    //                   size={20}
    //                   color="#ccc"
    //                 />
    //                 <Text className="flex-1 font-medium">{feature}</Text>
    //               </View>
    //             ))}
    //           </View>
    //         </View>
    //         <View className="w-1/2 rounded-lg border border-sky-500 bg-white py-12 shadow-lg">
    //           <Text className="text-center text-2xl font-bold text-sky-500">PREMIUM</Text>

    //           <View className="mt-3 gap-2 px-2">
    //             {premiumFeatures.map((feature, index) => (
    //               <View
    //                 className="flex-row gap-2"
    //                 key={index}
    //               >
    //                 <Icon
    //                   render={LucideCheck}
    //                   size={20}
    //                   color="#ec4899"
    //                 />
    //                 <Text className="flex-1 font-medium text-black">{feature}</Text>
    //               </View>
    //             ))}
    //           </View>
    //         </View>
    //       </View>

    //       <Separator className="my-6 h-0" />

    //       {/* MARK: Reviews */}
    //       <View className="px-21/2">
    //         <Text className="text-center text-2xl font-bold">What are users talk about Deewas?</Text>

    //         <View className="mt-21 flex-1">
    //           <FlatList
    //             horizontal
    //             data={reviews}
    //             keyExtractor={(_, index) => index.toString()}
    //             showsHorizontalScrollIndicator={false}
    //             snapToInterval={SCREEN_WIDTH}
    //             decelerationRate="fast"
    //             className="-mx-21/2"
    //             renderItem={({ item: review }) => (
    //               <View
    //                 className="px-21/2"
    //                 style={{
    //                   width: isIpad ? (SCREEN_WIDTH - 21) / 2 : SCREEN_WIDTH,
    //                 }}
    //               >
    //                 <View className="gap-1 rounded-2xl border border-primary p-21 shadow-md">
    //                   <Text className="text-center text-lg font-semibold">{review.name}</Text>
    //                   <Text className="text-center">{review.desc}</Text>
    //                   <View className="flex-row items-center justify-center gap-1">
    //                     {Array.from({ length: review.rating }, (_, index) => (
    //                       <View
    //                         style={{ width: 18, height: 18 }}
    //                         key={index}
    //                       >
    //                         <Image
    //                           source={icons.star}
    //                           resizeMode="contain"
    //                           className="h-full w-full"
    //                         />
    //                       </View>
    //                     ))}
    //                   </View>
    //                 </View>
    //               </View>
    //             )}
    //           />
    //         </View>
    //       </View>
    //     </View>

    //     <Separator className="my-6 h-0" />

    //     {/* MARK: Contact */}
    //     <View className="px-21/2">
    //       <TouchableOpacity
    //         onPress={() => Linking.openURL('mailto:deewas.now@gmail.com')}
    //         className="flex-row items-center justify-center gap-2 rounded-md border border-sky-500 bg-white px-21 py-3 shadow-md"
    //       >
    //         <Icon
    //           render={LucideMessageCircleMore}
    //           size={24}
    //           color="#0ea5e9"
    //         />
    //         <Text className="text-lg font-semibold text-sky-500">Contact Customer Service</Text>
    //       </TouchableOpacity>

    //       <Text className="mt-21 text-center text-sm font-medium tracking-wider text-primary">
    //         <Text
    //           className="font-semibold tracking-tight text-sky-600"
    //           onPress={() => router.push('/policies/privacy-policy')}
    //         >
    //           Privacy Policy
    //         </Text>{' '}
    //         and{' '}
    //         <Text
    //           className="font-semibold tracking-tight text-sky-600"
    //           onPress={() => router.push('/policies/terms-and-conditions')}
    //         >
    //           Terms of Conditions
    //         </Text>
    //       </Text>
    //     </View>

    //     <Separator className="my-2 h-0" />

    //     <TouchableOpacity className="flex-row items-center justify-center px-21 py-3">
    //       <Text className="font-body text-lg font-medium tracking-wide text-muted-foreground">
    //         Restore purchase
    //       </Text>
    //     </TouchableOpacity>

    //     <Separator className="my-48 h-0" />
    //   </ScrollView>

    //   {/* MARK: Plans */}
    //   <View className="absolute bottom-0 left-0 z-20 w-full">
    //     <ImageBackground
    //       source={images.preBgVFlip}
    //       resizeMode="cover"
    //       className="overflow-hidden rounded-t-3xl px-21 pb-10 pt-6 shadow-lg"
    //     >
    //       <View className="w-full flex-1 flex-row items-center justify-evenly gap-21/2">
    //         {packages.map(pack => (
    //           <TouchableOpacity
    //             key={pack.identifier}
    //             activeOpacity={0.7}
    //             onPress={() => purchasePackage(pack)}
    //             className="w-1/3 flex-1 flex-row items-end shadow-md"
    //           >
    //             <View className="flex-1 items-center justify-center overflow-hidden rounded-lg border border-border bg-white shadow-md">
    //               <View className="w-full flex-1 bg-black px-2 py-2">
    //                 <Text className="flex-1 text-center font-medium capitalize text-white">
    //                   {pack.packageType}
    //                 </Text>
    //               </View>
    //               <View className="py-21">
    //                 <Text className="text-center text-xl font-bold text-black">
    //                   {pack.product.price}
    //                 </Text>
    //               </View>
    //             </View>
    //           </TouchableOpacity>
    //         ))}

    //         {/* <TouchableOpacity
    //           activeOpacity={0.7}
    //           className="w-1/3 flex-1 flex-row items-end shadow-md"
    //         >
    //           <View className="flex-1 items-center justify-center overflow-hidden rounded-lg border border-border bg-white shadow-md">
    //             <View className="w-full bg-black px-2 py-2">
    //               <Text className="text-center font-medium text-white">Monthly</Text>
    //             </View>
    //             <View className="py-21">
    //               <Text className="text-center text-xl font-bold text-black">$1.99</Text>
    //             </View>
    //           </View>
    //         </TouchableOpacity>

    //         <TouchableOpacity
    //           activeOpacity={0.7}
    //           className="w-1/3 flex-1 flex-row items-end shadow-sm"
    //         >
    //           <View className="flex-1 items-center justify-center overflow-hidden rounded-lg border border-sky-500 bg-white shadow-md">
    //             <View className="w-full bg-sky-500 px-2 py-2">
    //               <Text className="text-center font-semibold text-white">Yearly</Text>
    //             </View>
    //             <View className="py-8">
    //               <Text className="text-center text-muted-foreground line-through">$20.00</Text>
    //               <Text className="text-center text-xl font-bold text-black">$9.99</Text>
    //               <Text className="text text-center text-sm font-medium text-neutral-600">
    //                 Save <Text className="font-bold text-neutral-600">50%</Text>
    //               </Text>
    //             </View>
    //           </View>
    //         </TouchableOpacity>

    //         <TouchableOpacity
    //           activeOpacity={0.7}
    //           className="w-1/3 flex-1 flex-row items-end shadow-lg"
    //         >
    //           <View className="flex-1 items-center justify-center overflow-hidden rounded-lg border border-border bg-white shadow-md">
    //             <View className="w-full bg-black px-2 py-2">
    //               <Text className="text-center font-medium text-white">Lifetime</Text>
    //             </View>
    //             <View className="py-21">
    //               <Text className="text-center text-muted-foreground line-through">$62.50</Text>
    //               <Text className="text-center text-xl font-bold text-black">$24.99</Text>
    //               <Text className="text text-center text-sm font-medium text-neutral-600">
    //                 Save <Text className="font-bold text-neutral-600">60%</Text>
    //               </Text>
    //             </View>
    //           </View>
    //         </TouchableOpacity> */}
    //       </View>

    //       <Text className="mt-2 text-center text-sm font-medium text-muted-foreground">
    //         Subscription will be auto reviewed, cancel at any time.
    //       </Text>

    //       <TouchableOpacity className="mt-21 rounded-full bg-white px-21 py-2 shadow-lg">
    //         <Text className="text-center font-body text-lg font-semibold tracking-wider text-black">
    //           Start 14 days Free Trial now!
    //         </Text>
    //       </TouchableOpacity>
    //     </ImageBackground>
    //   </View>
    // </SafeAreaView>

    <RevenueCatUI.Paywall />
  )
}

export default PremiumPage

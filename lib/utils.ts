import AsyncStorage from '@react-native-async-storage/async-storage'
import { clsx, type ClassValue } from 'clsx'
import { Platform } from 'react-native'
import { TestIds } from 'react-native-google-mobile-ads'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// if web and dev, use local server
export const BASE_URL =
  __DEV__ && Platform.OS !== 'web' ? 'http://172.20.10.3:3000' : process.env.EXPO_PUBLIC_WEB_SERVER_URL

export const getToken = async () => {
  const token = await AsyncStorage.getItem('token')
  return token
}

type AdmobType = 'APP_OPEN' | 'BANNER' | 'INTERSTITIAL' | 'NATIVE'

const admobIds = {
  APP_OPEN: {
    dev: TestIds.APP_OPEN,
    ios: process.env.EXPO_PUBLIC_ADMOB_IOS_APPOPEN_ID!,
    android: process.env.EXPO_PUBLIC_ADMOB_ANDROID_APPOPEN_ID!,
  },
  BANNER: {
    dev: TestIds.ADAPTIVE_BANNER,
    ios: process.env.EXPO_PUBLIC_ADMOB_IOS_BANNER_ID!,
    android: process.env.EXPO_PUBLIC_ADMOB_ANDROID_BANNER_ID!,
  },
  INTERSTITIAL: {
    dev: TestIds.INTERSTITIAL,
    ios: process.env.EXPO_PUBLIC_ADMOB_IOS_INTERSTITIAL_ID!,
    android: process.env.EXPO_PUBLIC_ADMOB_ANDROID_INTERSTITIAL_ID!,
  },
  NATIVE: {
    dev: TestIds.NATIVE,
    ios: process.env.EXPO_PUBLIC_ADMOB_IOS_NATIVE_ID!,
    android: process.env.EXPO_PUBLIC_ADMOB_ANDROID_NATIVE_ID!,
  },
}

export const getAdmobId = (type: AdmobType): string => {
  if (__DEV__) return admobIds[type].dev
  if (Platform.OS === 'ios') return admobIds[type].ios
  if (Platform.OS === 'android') return admobIds[type].android
  return admobIds[type].dev
}

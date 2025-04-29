import AsyncStorage from '@react-native-async-storage/async-storage'
import { clsx, type ClassValue } from 'clsx'
import { Platform } from 'react-native'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// if web and dev, use local server
export const BASE_URL =
  __DEV__ && Platform.OS !== 'web' ? 'http://192.168.1.12:3000' : process.env.EXPO_PUBLIC_WEB_SERVER_URL

export const getToken = async () => {
  const token = await AsyncStorage.getItem('token')
  return token
}

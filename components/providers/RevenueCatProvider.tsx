import { useAppDispatch } from '@/hooks/reduxHook'
import { setToken, setUser } from '@/lib/reducers/userReducer'
import { upgradePlanApi } from '@/requests'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { router } from 'expo-router'
import { jwtDecode } from 'jwt-decode'
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, Platform } from 'react-native'
import Purchases, { LOG_LEVEL, PurchasesPackage } from 'react-native-purchases'
import { useAuth } from './AuthProvider'

interface RevenueCatProps {
  purchasePackage: (pack: PurchasesPackage) => Promise<void>
  restorePurchase?: () => Promise<void>
  packages: PurchasesPackage[]
  purchasing: boolean
}

const RevenueCatContext = createContext<RevenueCatProps | null>(null)

function RevenueCatProvider({ children }: { children: ReactNode }) {
  // hooks
  const { user } = useAuth()
  const dispatch = useAppDispatch()
  const { t: translate } = useTranslation()
  const t = useCallback((key: string) => translate('revenueCatProvider.' + key), [translate])

  // states
  const [packages, setPackages] = useState<PurchasesPackage[]>([])
  const [purchasing, setPurchasing] = useState<boolean>(false)

  // load all offerings a user can (currently) purchase
  const loadOfferings = useCallback(async () => {
    try {
      const offerings = await Purchases.getOfferings()
      if (offerings.current) {
        setPackages(offerings.current.availablePackages)
      }
    } catch (error) {
      console.error('Error loading offerings:', error)
    }
  }, [])

  useEffect(() => {
    const init = async () => {
      if (Platform.OS === 'ios') {
        Purchases.setLogLevel(LOG_LEVEL.VERBOSE)
        Purchases.configure({
          apiKey: process.env.EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY!,
          appUserID: user?._id ?? null,
        })
      } else if (Platform.OS === 'android') {
        // Initialize RevenueCat for Android
      }

      await loadOfferings()
    }
    init()
  }, [loadOfferings, user])

  // purchase a package
  const purchasePackage = useCallback(
    async (pack: PurchasesPackage) => {
      // start loading
      setPurchasing(true)

      try {
        await Purchases.purchasePackage(pack)
        const customerInfo = await Purchases.getCustomerInfo()

        if (customerInfo.entitlements.active['Premium']) {
          const { token } = await upgradePlanApi(customerInfo.originalAppUserId)

          const decodedUser: IFullUser = jwtDecode(token)

          console.log(21312)

          // save token and user
          await AsyncStorage.setItem('token', token)
          dispatch(setUser(decodedUser))
          dispatch(setToken(token))
          console.log(222)

          Alert.alert(t('Purchase Success'), t('You are now Premium!'))
          router.back()
        } else {
          Alert.alert(t('Purchase Failed'), t('No active premium found'))
        }
      } catch (err: any) {
        console.log(err)
        Alert.alert('Error', err?.message || 'Unknown error')
      } finally {
        // stop loading
        setPurchasing(false)
      }
    },
    [dispatch, t]
  )

  // restore permissions
  const restorePurchase = useCallback(async () => {
    // start loading
    setPurchasing(true)

    try {
      const customerInfo = await Purchases.getCustomerInfo()

      if (customerInfo.entitlements.active['Premium']) {
        const { token } = await upgradePlanApi(customerInfo.originalAppUserId)

        const decodedUser: IFullUser = jwtDecode(token)
        // save token and user
        await AsyncStorage.setItem('token', token)
        dispatch(setUser(decodedUser))
        dispatch(setToken(token))

        Alert.alert(t('Restore Success'), t('Your Premium access has been restored!'))
        router.back()
      } else {
        Alert.alert(t('Restore Failed'), t('No active premium found to restore'))
      }
    } catch (err: any) {
      Alert.alert(t('Restore Error'), t('Unknown error during restore'))
      console.log(err)
    } finally {
      // stop loading
      setPurchasing(false)
    }
  }, [dispatch, t])

  const value: RevenueCatProps = {
    purchasePackage,
    restorePurchase,
    packages,
    purchasing,
  }

  return <RevenueCatContext.Provider value={value}>{children}</RevenueCatContext.Provider>
}

export const useRevenueCat = (): RevenueCatProps => {
  const context = useContext(RevenueCatContext)
  if (!context) {
    throw new Error('useRevenueCat must be used within an RevenueCatProvider')
  }
  return context
}

export default RevenueCatProvider

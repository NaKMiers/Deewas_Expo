import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react'
import { Alert, Platform } from 'react-native'
import Purchases, { CustomerInfo, LOG_LEVEL, PurchasesPackage } from 'react-native-purchases'

Purchases.setLogLevel(LOG_LEVEL.VERBOSE)

interface RevenueCatProps {
  purchasePackage: (pack: PurchasesPackage) => Promise<void>
  restorePermissions?: () => Promise<CustomerInfo>
  user: UserState
  packages: PurchasesPackage[]
}

export interface UserState {
  cookies: number
  items: string[]
  premium: boolean
}

const RevenueCatContext = createContext<RevenueCatProps | null>(null)

function RevenueCatProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserState>({ cookies: 0, items: [], premium: false })
  const [packages, setPackages] = useState<PurchasesPackage[]>([])

  // load all offerings a user can (currently) purchase
  const loadOfferings = useCallback(async () => {
    try {
      const offerings = await Purchases.getOfferings()
      if (offerings.current) {
        setPackages(offerings.current.availablePackages)
      }

      console.log('Loaded offerings:', offerings)
    } catch (error) {
      console.error('Error loading offerings:', error)
    }
  }, [])

  useEffect(() => {
    const init = async () => {
      if (Platform.OS === 'ios') {
        // Initialize RevenueCat for iOS
        console.log('Initializing RevenueCat for iOS')
        Purchases.configure({ apiKey: 'appl_IitkYytCPghMjjdqUmClSxblSfT' })
        await loadOfferings()
      } else if (Platform.OS === 'android') {
        // Initialize RevenueCat for Android
        // console.log('Initializing RevenueCat for Android')
      }
    }
    init()
  }, [loadOfferings])

  // purchase a package
  const purchasePackage = useCallback(async (pack: PurchasesPackage) => {
    try {
      await Purchases.purchasePackage(pack)

      if (pack.product.identifier === '') {
        // setUser
      }
    } catch (err: any) {
      console.log(err)
      Alert.alert(err)
    }
  }, [])

  const updateCustomerInformation = useCallback(async (customerInfo: CustomerInfo) => {}, [])

  const value: RevenueCatProps = {
    purchasePackage,
    user,
    packages,
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

import DrawerProvider from '@/components/providers/DrawerProvider'
import StoreProvider from '@/components/providers/StoreProvider'
import '@/global.scss'
import { setAndroidNavigationBar } from '@/lib/android-navigation-bar'
import { NAV_THEME } from '@/lib/constants'
import { useColorScheme } from '@/lib/useColorScheme'
import '@/polyfills'
import { DarkTheme, DefaultTheme, Theme, ThemeProvider } from '@react-navigation/native'
import { PortalHost } from '@rn-primitives/portal'
import { useFonts } from 'expo-font'
import { SplashScreen, Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useEffect, useRef, useState } from 'react'
import { Platform, View } from 'react-native'
import 'react-native-gesture-handler'
import Toast from 'react-native-toast-message'

const LIGHT_THEME: Theme = {
  ...DefaultTheme,
  colors: NAV_THEME.light,
}
const DARK_THEME: Theme = {
  ...DarkTheme,
  colors: NAV_THEME.dark,
}

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router'

function RootLayout() {
  const [loaded] = useFonts({
    'Montserrat-Black': require('../assets/fonts/Montserrat-Black.ttf'),
    'Montserrat-BlackItalic': require('../assets/fonts/Montserrat-BlackItalic.ttf'),
    'Montserrat-Bold': require('../assets/fonts/Montserrat-Bold.ttf'),
    'Montserrat-BoldItalic': require('../assets/fonts/Montserrat-BoldItalic.ttf'),
    'Montserrat-ExtraBold': require('../assets/fonts/Montserrat-ExtraBold.ttf'),
    'Montserrat-ExtraBoldItalic': require('../assets/fonts/Montserrat-ExtraBoldItalic.ttf'),
    'Montserrat-ExtraLight': require('../assets/fonts/Montserrat-ExtraLight.ttf'),
    'Montserrat-ExtraLightItalic': require('../assets/fonts/Montserrat-ExtraLightItalic.ttf'),
    'Montserrat-Italic': require('../assets/fonts/Montserrat-Italic.ttf'),
    'Montserrat-Light': require('../assets/fonts/Montserrat-Light.ttf'),
    'Montserrat-LightItalic': require('../assets/fonts/Montserrat-LightItalic.ttf'),
    'Montserrat-Medium': require('../assets/fonts/Montserrat-Medium.ttf'),
    'Montserrat-MediumItalic': require('../assets/fonts/Montserrat-MediumItalic.ttf'),
    'Montserrat-Regular': require('../assets/fonts/Montserrat-Regular.ttf'),
    'Montserrat-SemiBold': require('../assets/fonts/Montserrat-SemiBold.ttf'),
    'Montserrat-SemiBoldItalic': require('../assets/fonts/Montserrat-SemiBoldItalic.ttf'),
    'Montserrat-Thin': require('../assets/fonts/Montserrat-Thin.ttf'),
    'Montserrat-ThinItalic': require('../assets/fonts/Montserrat-ThinItalic.ttf'),
    'SourceSansPro-Black': require('../assets/fonts/SourceSansPro-Black.otf'),
    'SourceSansPro-BlackIt': require('../assets/fonts/SourceSansPro-BlackIt.otf'),
    'SourceSansPro-Bold': require('../assets/fonts/SourceSansPro-Bold.otf'),
    'SourceSansPro-BoldIt': require('../assets/fonts/SourceSansPro-BoldIt.otf'),
    'SourceSansPro-ExtraLight': require('../assets/fonts/SourceSansPro-ExtraLight.otf'),
    'SourceSansPro-ExtraLightIt': require('../assets/fonts/SourceSansPro-ExtraLightIt.otf'),
    'SourceSansPro-It': require('../assets/fonts/SourceSansPro-It.otf'),
    'SourceSansPro-Light': require('../assets/fonts/SourceSansPro-Light.otf'),
    'SourceSansPro-LightIt': require('../assets/fonts/SourceSansPro-LightIt.otf'),
    'SourceSansPro-Regular': require('../assets/fonts/SourceSansPro-Regular.otf'),
    'SourceSansPro-Semibold': require('../assets/fonts/SourceSansPro-Semibold.otf'),
    'SourceSansPro-SemiboldIt': require('../assets/fonts/SourceSansPro-SemiboldIt.otf'),
  })
  const [isAppReady, setIsAppReady] = useState(false)
  const hasMounted = useRef(false)
  const { colorScheme, isDarkColorScheme } = useColorScheme()
  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = useState(false)

  // Handle font loading and initialization in a single effect
  useEffect(() => {
    if (loaded && !hasMounted.current) {
      if (Platform.OS === 'web') {
        document.documentElement.classList.add('bg-background')
      }
      setAndroidNavigationBar(colorScheme)
      setIsColorSchemeLoaded(true)
      hasMounted.current = true
      setIsAppReady(true)
    }
  }, [loaded, colorScheme])

  if (!loaded || !isColorSchemeLoaded) {
    return null
  }

  return (
    <View
      className="flex-1"
      onLayout={async () => {
        if (!isAppReady) {
          await SplashScreen.hideAsync()
        }
      }}
    >
      <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
        <StoreProvider>
          <DrawerProvider>
            <StatusBar style={isDarkColorScheme ? 'light' : 'dark'} />

            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(home)" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="policies" />
              <Stack.Screen name="welcome" />
              <Stack.Screen name="onboarding" />
            </Stack>

            <PortalHost />
          </DrawerProvider>
        </StoreProvider>

        <Toast />
      </ThemeProvider>
    </View>
  )
}

export default RootLayout

import i18next from '@/i18n'
import { ReactNode, useRef } from 'react'
import { I18nextProvider } from 'react-i18next'
import { Provider } from 'react-redux'
import { AppStore, makeStore } from '../../lib/store'
import AuthProvider from './AuthProvider'
import DrawerProvider from './DrawerProvider'
import InitProvider from './InitProvider'
import RevenueCatProvider from './RevenueCatProvider'

function Providers({ children }: { children: ReactNode }) {
  const storeRef = useRef<AppStore | null>(null)

  if (!storeRef.current) {
    storeRef.current = makeStore()
  }

  return (
    <I18nextProvider i18n={i18next}>
      <Provider store={storeRef.current}>
        <AuthProvider>
          <InitProvider>
            <DrawerProvider>
              <RevenueCatProvider>{children}</RevenueCatProvider>
            </DrawerProvider>
          </InitProvider>
        </AuthProvider>
      </Provider>
    </I18nextProvider>
  )
}

export default Providers

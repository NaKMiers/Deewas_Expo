import i18next from '@/i18n'
import { useRef } from 'react'
import { I18nextProvider } from 'react-i18next'
import { Provider } from 'react-redux'
import { AppStore, makeStore } from '../../lib/store'
import AuthProvider from './AuthProvider'

function StoreProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore | null>(null)

  if (!storeRef.current) {
    storeRef.current = makeStore()
  }

  return (
    <I18nextProvider i18n={i18next}>
      <Provider store={storeRef.current}>
        <AuthProvider>{children}</AuthProvider>
      </Provider>
    </I18nextProvider>
  )
}

export default StoreProvider

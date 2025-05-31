import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { setLoading as setBudgetLoading, setBudgets } from '@/lib/reducers/budgetReducer'
import { setCategories, setLoading as setCategoryLoading } from '@/lib/reducers/categoryReducer'
import { setRefreshing } from '@/lib/reducers/loadReducer'
import { setDefaultWallet } from '@/lib/reducers/screenReducer'
import { setSettings, setLoading as setSettingsLoading } from '@/lib/reducers/settingsReducer'
import { setStats } from '@/lib/reducers/userReducer'
import { setLoading as setWalletLoading, setWallets } from '@/lib/reducers/walletReducer'
import { getMySettingsApi, initApi } from '@/requests'
import React, { createContext, ReactNode, useCallback, useContext, useEffect } from 'react'
import { useAuth } from './AuthProvider'

interface InitContextValue {
  refreshInit: () => Promise<void>
  refreshSettings: () => Promise<void>
  wallets: IFullWallet[]
  categories: IFullCategory[]
  budgets: IFullBudget[]
  settings: ISettings | null
}

const InitContext = createContext<InitContextValue | undefined>(undefined)

function InitProvider({ children }: { children: ReactNode }) {
  // hooks
  const dispatch = useAppDispatch()
  const { user, isRefreshedToken } = useAuth()

  // store
  const { refreshPoint } = useAppSelector(state => state.load)
  const wallets = useAppSelector(state => state.wallet.wallets)
  const categories = useAppSelector(state => state.category.categories)
  const budgets = useAppSelector(state => state.budget.budgets)
  const settings = useAppSelector(state => state.settings.settings)

  // fetch wallets, categories, and budgets
  const init = useCallback(async () => {
    if (!user || !isRefreshedToken) return

    // start loading
    dispatch(setWalletLoading(true))
    dispatch(setCategoryLoading(true))
    dispatch(setBudgetLoading(true))

    try {
      const { wallets, categories, budgets, settings } = await initApi()
      dispatch(setWallets(wallets))
      dispatch(setDefaultWallet(wallets.length > 0 ? wallets[0] : null))
      dispatch(setCategories(categories))
      dispatch(setBudgets(budgets))
      dispatch(setSettings(settings))
    } catch (err: any) {
      console.log(err)
    } finally {
      // stop loading
      dispatch(setWalletLoading(false))
      dispatch(setCategoryLoading(false))
      dispatch(setBudgetLoading(false))
      dispatch(setSettingsLoading(false))
      dispatch(setRefreshing(false))
    }
  }, [dispatch, user, isRefreshedToken])

  // get settings
  const getSettings = useCallback(async () => {
    if (!user || !isRefreshedToken) return

    // start loading
    dispatch(setSettingsLoading(true))

    try {
      // get settings
      const { settings } = await getMySettingsApi()
      dispatch(setSettings(settings))
    } catch (err: any) {
      console.log(err)
    } finally {
      // stop loading
      dispatch(setSettingsLoading(false))
    }
  }, [dispatch, user, isRefreshedToken])

  // watch refresh point change event
  useEffect(() => {
    dispatch(setStats(null))
  }, [dispatch, refreshPoint])

  // initially get wallets
  useEffect(() => {
    init()
  }, [init, refreshPoint])

  const value: InitContextValue = {
    refreshInit: init,
    refreshSettings: getSettings,
    wallets,
    categories,
    budgets,
    settings,
  }

  return <InitContext.Provider value={value}>{children}</InitContext.Provider>
}

export default InitProvider

export const useInit = (): InitContextValue => {
  const context = useContext(InitContext)
  if (!context) {
    throw new Error('useInit must be used within an InitProvider')
  }
  return context
}

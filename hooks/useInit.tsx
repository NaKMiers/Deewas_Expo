import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { setLoading as setBudgetLoading, setBudgets } from '@/lib/reducers/budgetReducer'
import { setCategories, setLoading as setCategoryLoading } from '@/lib/reducers/categoryReducer'
import { setRefreshing } from '@/lib/reducers/loadReducer'
import { setCurWallet, setLoading as setWalletLoading, setWallets } from '@/lib/reducers/walletReducer'
import { initApi } from '@/requests'
import { useCallback, useEffect } from 'react'
import { useAuth } from '../components/providers/AuthProvider'

function useInit() {
  // hooks
  const dispatch = useAppDispatch()
  const { user } = useAuth()

  // store
  const { refreshPoint } = useAppSelector(state => state.load)
  const { curWallet, wallets, loading } = useAppSelector(state => state.wallet)

  // fetch wallets, categories, and budgets
  const init = useCallback(async () => {
    if (!user) return

    // start loading
    dispatch(setWalletLoading(true))
    dispatch(setCategoryLoading(true))
    dispatch(setBudgetLoading(true))

    try {
      const { wallets, categories, budgets } = await initApi()
      dispatch(setWallets(wallets))
      dispatch(setCurWallet(wallets[0]))
      dispatch(setCategories(categories))
      dispatch(setBudgets(budgets))
    } catch (err: any) {
      console.log(err)
    } finally {
      // stop loading
      dispatch(setWalletLoading(false))
      dispatch(setCategoryLoading(false))
      dispatch(setBudgetLoading(false))
      dispatch(setRefreshing(false))
    }
  }, [dispatch, user])

  // initially get wallets
  useEffect(() => {
    init()
  }, [init, refreshPoint])

  return { refetch: init, curWallet, wallets, loading }
}

export default useInit

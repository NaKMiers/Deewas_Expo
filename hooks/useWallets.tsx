import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { setRefreshing } from '@/lib/reducers/loadReducer'
import { setCurWallet, setLoading, setWallets } from '@/lib/reducers/walletReducer'
import { getMyWalletsApi } from '@/requests/walletRequests'
import { useCallback, useEffect } from 'react'
import { useAuth } from '../components/providers/AuthProvider'

function useWallets() {
  // hooks
  const dispatch = useAppDispatch()
  const { user } = useAuth()

  // store
  const { refreshPoint } = useAppSelector(state => state.load)
  const { curWallet, wallets, loading } = useAppSelector(state => state.wallet)

  // fetch wallets
  const getWallets = useCallback(async () => {
    if (!user) return

    // start loading
    dispatch(setLoading(true))

    try {
      const { wallets } = await getMyWalletsApi()
      dispatch(setWallets(wallets))
      dispatch(setCurWallet(curWallet || wallets[0]))
    } catch (err: any) {
      console.log(err)
    } finally {
      // stop loading
      dispatch(setLoading(false))
      dispatch(setRefreshing(false))
    }
  }, [curWallet, dispatch, user, refreshPoint])

  // initially get wallets
  useEffect(() => {
    getWallets()
  }, [getWallets])

  return { refetch: getWallets, curWallet, wallets, loading }
}

export default useWallets

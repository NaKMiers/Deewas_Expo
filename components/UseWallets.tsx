'use client'

import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { setCurWallet, setLoading, setWallets } from '@/lib/reducers/walletReducer'
import { getMyWalletsApi } from '@/requests/walletRequests'
import { useEffect } from 'react'
import { useAuth } from './providers/AuthProvider'

function UseWallets() {
  // hooks
  const dispatch = useAppDispatch()
  const { user } = useAuth()

  // store
  const { refetching } = useAppSelector(state => state.load)

  // get wallets
  useEffect(() => {
    async function getWallets() {
      if (!user) return

      // start loading
      dispatch(setLoading(true))

      try {
        const { wallets } = await getMyWalletsApi()
        dispatch(setWallets(wallets))
        dispatch(setCurWallet(wallets[0]))
      } catch (err: any) {
        console.log(err)
      } finally {
        // stop loading
        dispatch(setLoading(false))
      }
    }

    getWallets()
  }, [dispatch, user, refetching])

  return null
}

export default UseWallets

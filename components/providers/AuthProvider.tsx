// @/contexts/AuthContext.tsx
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { clearUser, setLoading, setToken, setUser } from '@/lib/reducers/userReducer'
import { IFullUser } from '@/types/type'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { jwtDecode } from 'jwt-decode'
import React, { createContext, ReactNode, useCallback, useContext, useEffect } from 'react'

interface AuthContextValue {
  token: string | null
  user: IFullUser | null
  loading: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch()
  const { token, user, loading } = useAppSelector(state => state.user)

  useEffect(() => {
    const loadUserData = async () => {
      dispatch(setLoading(true))

      try {
        const storedToken = await AsyncStorage.getItem('token')

        if (storedToken && !token) {
          const decodedUser: IFullUser = jwtDecode(storedToken)
          const isExpired = Date.now() >= decodedUser.exp * 1000

          // not expired
          if (!isExpired) {
            dispatch(setToken(storedToken))
            dispatch(setUser(decodedUser))
          } else {
            await AsyncStorage.removeItem('token')
            dispatch(clearUser())
          }
        }
      } catch (err) {
        console.log(err)
        await AsyncStorage.removeItem('token')
        dispatch(clearUser())
      } finally {
        dispatch(setLoading(false))
      }
    }

    loadUserData()
  }, [dispatch, token])

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem('token')
    dispatch(clearUser())
  }, [dispatch])

  const value: AuthContextValue = {
    token,
    user,
    loading,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

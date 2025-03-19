// Auth -------------------------------------

import { Platform } from 'react-native'

// if web and dev, use local server
let BASE_URL =
  (process.env.NODE_ENV === 'development' && Platform.OS !== 'web'
    ? 'http://192.168.1.164:3000'
    : process.env.EXPO_PUBLIC_WEB_SERVER_URL) + '/api/auth'

// const BASE_URL = Platform.OS === 'web' ? process.env.EXPO_PUBLIC_WEB_SERVER_URL + '/api/auth/'

// [POST]: /auth/signin/credentials
export const signInCredentialsApi = async (data: any) => {
  console.log('BASE_URL', BASE_URL)
  const res = await fetch(BASE_URL + '/signin/credentials', {
    method: 'POST',
    body: JSON.stringify(data),
  })

  // check status
  if (!res.ok) {
    throw new Error((await res.json()).message)
  }

  return await res.json()
}

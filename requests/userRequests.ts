// User  -------------------------------------

import { BASE_URL, getToken } from '@/lib/utils'
import { Platform } from 'react-native'
const API = BASE_URL + '/api/user'

// [GET]: /user/refresh-token
export const refreshTokenApi = async () => {
  const token = await getToken()
  if (!token) throw new Error('No token found')

  const res = await fetch(API + '/refresh-token', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  // check status
  if (!res.ok) throw await res.json()

  return await res.json()
}

// [GET]: /user/stats
export const getUserStatsApi = async () => {
  const token = await getToken()
  if (!token) throw new Error('No token found')

  const res = await fetch(API + '/stats', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  // check status
  if (!res.ok) throw await res.json()

  return await res.json()
}

// [PUT]: /user/update
export const updateUserApi = async (data: any) => {
  const token = await getToken()
  if (!token) throw new Error('No token found')

  const res = await fetch(API + '/update', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    method: 'PUT',
    body: JSON.stringify(data),
  })

  // check status
  if (!res.ok) throw await res.json()

  return await res.json()
}

// [PUT]: /user/plan/upgrade
export const upgradePlanApi = async (appUserId: string) => {
  const token = await getToken()
  if (!token) throw new Error('No token found')

  const res = await fetch(API + '/plan/upgrade', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    method: 'PUT',
    body: JSON.stringify({ appUserId, platform: Platform.OS }),
  })

  // check status
  if (!res.ok) {
    throw new Error((await res.json()).message)
  }

  return await res.json()
}

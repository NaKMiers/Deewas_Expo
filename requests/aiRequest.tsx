// AI  -------------------------------------

import { BASE_URL, getToken } from '@/lib/utils'
const API = BASE_URL + '/api/ai'

// [POST]: /ai
export const sendMessage = async (message: string) => {
  const token = await getToken()
  if (!token) throw new Error('No token found')

  const res = await fetch(API, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    method: 'POST',
    body: JSON.stringify({ message }),
  })

  // check status
  if (!res.ok) {
    throw new Error((await res.json()).message)
  }

  return await res.json()
}

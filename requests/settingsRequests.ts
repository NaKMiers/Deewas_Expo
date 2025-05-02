// Settings -------------------------------------

import { BASE_URL, getToken } from '@/lib/utils'
const API = BASE_URL + '/api/settings'

// [GET]: /settings
export const getMySettingsApi = async (query: string = '') => {
  const token = await getToken()
  if (!token) throw new Error('No token found')

  const res = await fetch(API + `${query}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  // check status
  if (!res.ok) throw await res.json()

  return await res.json()
}

// [PUT]: /settings/update
export const updateMySettingsApi = async (data: any) => {
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

// [DELETE]: /settings/delete-all
export const deleteAllDataApi = async () => {
  const token = await getToken()
  if (!token) throw new Error('No token found')

  const res = await fetch(API + '/delete-all', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    method: 'DELETE',
  })

  // check status
  if (!res.ok) throw await res.json()

  return await res.json()
}

// Wallet  -------------------------------------

import { BASE_URL, getToken } from '@/lib/utils'
const API = BASE_URL + '/api/wallet'

// [GET]: /wallet
export const getMyWalletsApi = async () => {
  const token = await getToken()
  if (!token) throw new Error('No token found')

  const res = await fetch(API, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  // check status
  if (!res.ok) {
    throw new Error((await res.json()).message)
  }

  return await res.json()
}

// [GET]: /wallet/:id
export const getWalletApi = async (id: string) => {
  const token = await getToken()
  if (!token) throw new Error('No token found')

  const res = await fetch(API + `/${id}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  // check status
  if (!res.ok) {
    throw new Error((await res.json()).message)
  }

  return await res.json()
}

// [POST]: /wallet/create
export const createWalletApi = async (data: any) => {
  const token = await getToken()
  if (!token) throw new Error('No token found')

  const res = await fetch(API + '/create', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    method: 'POST',
    body: JSON.stringify(data),
  })

  // check status
  if (!res.ok) {
    throw new Error((await res.json()).message)
  }

  return await res.json()
}

// [POST]: /wallet/transfer
export const transferFundApi = async (data: any) => {
  const token = await getToken()
  if (!token) throw new Error('No token found')

  const res = await fetch(API + '/transfer', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    method: 'POST',
    body: JSON.stringify(data),
  })

  // check status
  if (!res.ok) {
    throw new Error((await res.json()).message)
  }

  return await res.json()
}

// [PUT]: /wallet/:id/update
export const updateWalletApi = async (id: string, data: any) => {
  const token = await getToken()
  if (!token) throw new Error('No token found')

  const res = await fetch(API + `/${id}/update`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    method: 'PUT',
    body: JSON.stringify(data),
  })

  // check status
  if (!res.ok) {
    throw new Error((await res.json()).message)
  }

  return await res.json()
}

// [DELETE]: /wallet/:id/delete
export const deleteWalletApi = async (id: string) => {
  const token = await getToken()
  if (!token) throw new Error('No token found')

  const res = await fetch(API + `/${id}/delete`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    method: 'DELETE',
  })

  // check status
  if (!res.ok) {
    throw new Error((await res.json()).message)
  }

  return await res.json()
}

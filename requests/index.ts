// Auth
export * from './authRequests'

// User
export * from './userRequests'

// Settings
export * from './settingsRequests'

// Transactions
export * from './transactionRequests'

// Budgets
export * from './budgetRequests'

// Categories
export * from './categoryRequests'

// Wallets
export * from './walletRequests'

// Reports
export * from './reportRequests'

import { BASE_URL, getToken } from '@/lib/utils'
const API = BASE_URL + '/api'

// [GET]: /
export const initApi = async () => {
  const token = await getToken()
  if (!token) throw new Error('No token found')

  const res = await fetch(API, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  // check status
  if (!res.ok) throw await res.json()

  return await res.json()
}

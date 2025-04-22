// Auth -------------------------------------

import { BASE_URL } from '@/lib/utils'
const API = BASE_URL + '/api/auth'

// [POST]: /auth/sign-in/credentials
export const signInCredentialsApi = async (data: any) => {
  const res = await fetch(API + '/sign-in/credentials', {
    method: 'POST',
    body: JSON.stringify(data),
  })

  // check status
  if (!res.ok) {
    throw new Error((await res.json()).message)
  }

  return await res.json()
}

// [POST]: /auth/sign-up/credentials
export const registerCredentialsApi = async (data: any) => {
  const res = await fetch(API + '/sign-up/credentials', {
    method: 'POST',
    body: JSON.stringify(data),
  })

  // check status
  if (!res.ok) {
    throw new Error((await res.json()).message)
  }

  return await res.json()
}

// [POST]: /auth/sign-in/google
export const signInGoogleApi = async (idToken: string) => {
  const res = await fetch(API + '/sign-in/google', {
    method: 'POST',
    body: JSON.stringify({ idToken }),
  })

  // check status
  if (!res.ok) {
    throw new Error((await res.json()).message)
  }

  return await res.json()
}

// [POST]: /auth/forgot-password
export const forgotPasswordApi = async (data: any) => {
  const res = await fetch(API + '/forgot-password', {
    method: 'POST',
    body: JSON.stringify(data),
  })

  // check status
  if (!res.ok) {
    throw new Error((await res.json()).message)
  }

  return await res.json()
}

// [PATCH]: /auth/reset-password
export const resetPasswordApi = async (token: string, newPassword: string) => {
  const res = await fetch(API + `/reset-password?token=${token}`, {
    method: 'PATCH',
    body: JSON.stringify({ newPassword }),
  })

  // check status
  if (!res.ok) {
    throw new Error((await res.json()).message)
  }

  return await res.json()
}

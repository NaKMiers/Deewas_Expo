// Category  -------------------------------------

import { BASE_URL, getToken } from '@/lib/utils'
const API = BASE_URL + '/api/category'

// [GET]: /category
export const getMyCategoriesApi = async (query: string = '') => {
  const token = await getToken()
  if (!token) throw new Error('No token found')

  const res = await fetch(API + `${query}`, {
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

// [POST]: /category/create
export const createCategoryApi = async (data: any) => {
  const token = await getToken()
  if (!token) throw new Error('No token found')

  const res = await fetch(API + '/create', {
    method: 'POST',
    body: JSON.stringify(data),
  })

  // check status
  if (!res.ok) {
    throw new Error((await res.json()).message)
  }

  return await res.json()
}

// [PUT]: /category/:id/update
export const updateCategoryApi = async (id: string, data: any) => {
  const token = await getToken()
  if (!token) throw new Error('No token found')

  const res = await fetch(API + `/${id}/update`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })

  // check status
  if (!res.ok) {
    throw new Error((await res.json()).message)
  }

  return await res.json()
}

// [DELETE]: /category/:id/delete
export const deleteCategoryApi = async (id: string) => {
  const token = await getToken()
  if (!token) throw new Error('No token found')

  const res = await fetch(API + `/${id}/delete`, {
    method: 'DELETE',
  })

  // check status
  if (!res.ok) {
    throw new Error((await res.json()).message)
  }

  return await res.json()
}

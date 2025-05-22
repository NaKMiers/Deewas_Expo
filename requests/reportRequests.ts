// REPORT  -------------------------------------

import { BASE_URL } from '@/lib/utils'
const API = BASE_URL + '/api/report'

// [POST]: /report/add
export const sendReportApi = async (results: any[]) => {
  const res = await fetch(API + '/add', {
    method: 'POST',
    body: JSON.stringify({ results }),
  })

  // check status
  if (!res.ok) throw await res.json()

  return await res.json()
}

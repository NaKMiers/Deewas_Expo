import { IFullUser } from '@/types/type'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export const user = createSlice({
  name: 'user',
  initialState: {
    token: null as string | null,
    user: null as IFullUser | null,
    loading: false as boolean,
  },
  reducers: {
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload
    },
    setUser: (state, action: PayloadAction<IFullUser>) => {
      state.user = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    clearUser(state) {
      state.token = null
      state.user = null
    },
  },
})

export const { setToken, setUser, setLoading, clearUser } = user.actions
export default user.reducer

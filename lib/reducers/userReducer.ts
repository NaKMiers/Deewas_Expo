import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export const user = createSlice({
  name: 'user',
  initialState: {
    user: null as IFullUser | null,
    loading: false as boolean,
    onboarding: null as any,
    stats: null as Stats | null,
  },
  reducers: {
    setUser: (state, action: PayloadAction<IFullUser>) => {
      state.user = action.payload
    },
    setOnboarding: (state, action: PayloadAction<any>) => {
      state.onboarding = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    clearUser(state) {
      state.user = null
    },
    setStats: (state, action: PayloadAction<Stats | null>) => {
      state.stats = action.payload
    },
  },
})

export const { setUser, setOnboarding, setLoading, clearUser, setStats } = user.actions
export default user.reducer

import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export const load = createSlice({
  name: 'load',
  initialState: {
    isPageLoading: false as boolean,
    isLoading: false as boolean,
    refreshPoint: new Date().getTime(),
    refreshing: false as boolean,
  },
  reducers: {
    setPageLoading: (state, action: PayloadAction<boolean>) => {
      state.isPageLoading = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    refresh: state => {
      state.refreshing = true
      state.refreshPoint = new Date().getTime()
    },
    setRefreshing: (state, action: PayloadAction<boolean>) => {
      state.refreshing = action.payload
    },
  },
})

export const { setPageLoading, setLoading, refresh, setRefreshing } = load.actions
export default load.reducer

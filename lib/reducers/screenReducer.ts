import { createSlice } from '@reduxjs/toolkit'
import moment from 'moment'

const initialState = {
  // wallet
  walletToEdit: null as IWallet | null,
  fromWallet: null as IWallet | null,
  toWallet: null as IWallet | null,
  selectedWallet: null as IWallet | null,
  ofWallet: null as IWallet | null,

  // category
  categoryToEdit: null as ICategory | null,
  selectedCategory: null as ICategory | null,

  // transaction
  transactionToEdit: null as IFullTransaction | null,

  // category
  budgetToEdit: null as IFullBudget | null,

  // emoji
  selectedEmoji: '' as string,

  // date range
  dateRange: {
    from: moment().startOf('month').toISOString(),
    to: moment().endOf('month').toISOString(),
  },
}

export const screen = createSlice({
  name: 'screen',
  initialState,
  reducers: {
    // wallet
    setWalletToEdit: (state, action) => {
      state.walletToEdit = action.payload
    },
    setFromWallet: (state, action) => {
      state.fromWallet = action.payload
    },
    setToWallet: (state, action) => {
      state.toWallet = action.payload
    },
    setSelectedWallet: (state, action) => {
      state.selectedWallet = action.payload
    },
    setOfWallet: (state, action) => {
      state.ofWallet = action.payload
    },

    // category
    setCategoryToEdit: (state, action) => {
      state.categoryToEdit = action.payload
    },
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload
    },

    // transaction
    setTransactionToEdit: (state, action) => {
      state.transactionToEdit = action.payload
    },

    // budget
    setBudgetToEdit: (state, action) => {
      state.budgetToEdit = action.payload
    },

    // emoji
    setSelectedEmoji: (state, action) => {
      state.selectedEmoji = action.payload
    },

    // date range
    setDateRange: (state, action) => {
      state.dateRange = action.payload
    },
    setFromDate: (state, action) => {
      state.dateRange.from = action.payload
    },
    setToDate: (state, action) => {
      state.dateRange.to = action.payload
    },
    resetDateRange: state => {
      state.dateRange = {
        from: moment().startOf('month').toISOString(),
        to: moment().endOf('month').toISOString(),
      }
    },

    // reset
    resetScreen: () => initialState,
  },
})

export const {
  // wallet
  setWalletToEdit,
  setFromWallet,
  setToWallet,
  setSelectedWallet,
  setOfWallet,

  // category
  setCategoryToEdit,
  setSelectedCategory,

  // transaction
  setTransactionToEdit,

  // budget
  setBudgetToEdit,

  // emoji
  setSelectedEmoji,

  // date range
  setDateRange,
  setFromDate,
  setToDate,
  resetDateRange,

  // reset
  resetScreen,
} = screen.actions

export default screen.reducer

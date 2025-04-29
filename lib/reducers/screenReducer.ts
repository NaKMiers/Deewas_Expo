import { createSlice } from '@reduxjs/toolkit'

export const screen = createSlice({
  name: 'screen',
  initialState: {
    walletToEdit: null as IWallet | null,
    initWallet: null as IWallet | null,
    initFromWallet: null as IWallet | null,
    initToWallet: null as IWallet | null,
    categoryToEdit: null as ICategory | null,
    initCategory: null as ICategory | null,
    transactionToEdit: null as IFullTransaction | null,
    budgetToEdit: null as IFullBudget | null,
    selectedEmoji: '' as string,
    selectedCategory: null as ICategory | null,
  },
  reducers: {
    setWalletToEdit: (state, action) => {
      state.walletToEdit = action.payload
    },
    setInitWallet: (state, action) => {
      state.initWallet = action.payload
    },
    setInitFromWallet: (state, action) => {
      state.initFromWallet = action.payload
    },
    setInitToWallet: (state, action) => {
      state.initToWallet = action.payload
    },
    setCategoryToEdit: (state, action) => {
      state.categoryToEdit = action.payload
    },
    setInitCategory: (state, action) => {
      state.initCategory = action.payload
    },
    setTransactionToEdit: (state, action) => {
      state.transactionToEdit = action.payload
    },
    setBudgetToEdit: (state, action) => {
      state.budgetToEdit = action.payload
    },
    setSelectedEmoji: (state, action) => {
      state.selectedEmoji = action.payload
    },
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload
    },
  },
})

export const {
  setWalletToEdit,
  setInitWallet,
  setInitFromWallet,
  setInitToWallet,
  setCategoryToEdit,
  setInitCategory,
  setTransactionToEdit,
  setBudgetToEdit,
  setSelectedEmoji,
  setSelectedCategory,
} = screen.actions

export default screen.reducer

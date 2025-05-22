import { createSlice, PayloadAction } from '@reduxjs/toolkit'

const initialState = {
  open: false as boolean,
  inProgress: false as boolean,
  step: 1 as number,
}

export const tutorial = createSlice({
  name: 'tutorial',
  initialState,
  reducers: {
    setOpenTutorial: (state, action: PayloadAction<boolean>) => {
      state.open = action.payload
    },
    setInProgress: (state, action: PayloadAction<boolean>) => {
      state.inProgress = action.payload
    },
    setStep: (state, action: PayloadAction<number>) => {
      state.step = action.payload
    },
  },
})

export const { setOpenTutorial, setInProgress, setStep } = tutorial.actions

export default tutorial.reducer

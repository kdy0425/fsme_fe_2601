import { createSlice } from '@reduxjs/toolkit'

export interface StdTnkType {
  STCModalOpen: boolean
  [key: string]: any
}

export const initialState: StdTnkType = {
  STCModalOpen: false,
}

export const StdTnkSlice = createSlice({
  name: 'StdTnkCpctyInfo',
  initialState,
  reducers: {
    openStdTnkCpctyModal: (state: StdTnkType) => {
      state['STCModalOpen'] = true
      return state
    },
    closeStdTnkCpctyModal: (state: StdTnkType) => {
      state['STCModalOpen'] = false
      return state
    },
  },
})

export const { openStdTnkCpctyModal, closeStdTnkCpctyModal } =
  StdTnkSlice.actions

export default StdTnkSlice.reducer

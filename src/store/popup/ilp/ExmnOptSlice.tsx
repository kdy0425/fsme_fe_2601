import { createSlice } from '@reduxjs/toolkit'

export interface ExmnOptType {
  eoModalOpen: boolean
  [key: string]: any //인덱스 시그니처
}

/**
 * EO : ExmnOptModal의 약어
 */

export const initialState: ExmnOptType = {
  eoModalOpen: false,
}

export const ExmnOptSlice = createSlice({
  name: 'ExmnOptInfo',
  initialState,
  reducers: {
    openExmnOptModal: (state: ExmnOptType) => {
      state['eoModalOpen'] = true
      return state
    },
    closeExmnOptModal: (state: ExmnOptType) => {
      state['eoModalOpen'] = false
      return state
    },
  },
})

export const { openExmnOptModal, closeExmnOptModal } =
  ExmnOptSlice.actions
export default ExmnOptSlice.reducer

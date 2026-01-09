import { createSlice } from '@reduxjs/toolkit'

export interface LgovTrfntfType {
  ltModalOpen: boolean
  [key: string]: any //인덱스 시그니처
}

/**
 * LT : LgovTrfntf의 약어
 */

export const initialState: LgovTrfntfType = {
  ltModalOpen: false,
}

export const LgovTrfntfSlice = createSlice({
  name: 'LgovTrfntfInfo',
  initialState,
  reducers: {
    openLgovTrfntfModal: (state: LgovTrfntfType) => {
      state['ltModalOpen'] = true
      return state
    },
    closeLgovTrfntfModal: (state: LgovTrfntfType) => {
      state['ltModalOpen'] = false
      return state
    },
  },
})

export const { openLgovTrfntfModal, closeLgovTrfntfModal } =
  LgovTrfntfSlice.actions
export default LgovTrfntfSlice.reducer

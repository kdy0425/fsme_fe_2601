import { createSlice } from '@reduxjs/toolkit'

export interface VhclBzmnPrmsnStateType {
  vbpModalOpen: boolean
  [key: string]: any //인덱스 시그니처
}

/**
 * VBP : VhclBzmnPrmsn의 약어
 */

export const initialState: VhclBzmnPrmsnStateType = {
  vbpModalOpen: false,
}

export const VhclBzmnPrmsnInfoSlice = createSlice({
  name: 'vhclBzmnPrmsnInfo',
  initialState,
  reducers: {
    openVhclBzmnPrmsnModal: (state: VhclBzmnPrmsnStateType) => {
      state['vbpModalOpen'] = true
      return state
    },
    closeVhclBzmnPrmsnModal: (state: VhclBzmnPrmsnStateType) => {
      state['vbpModalOpen'] = false
      return state
    },
  },
})

export const { openVhclBzmnPrmsnModal, closeVhclBzmnPrmsnModal } =
  VhclBzmnPrmsnInfoSlice.actions
export default VhclBzmnPrmsnInfoSlice.reducer

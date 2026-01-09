import { createSlice } from '@reduxjs/toolkit'

export interface VhclSpecHstryStateType {
  vhclNoVSHM: string //차량번호
  vshmModalOpen: boolean
  [key: string]: any //인덱스 시그니처
}

/**
 * VSHM : VhclSpecHstryModal의 약어
 */

export const initialState: VhclSpecHstryStateType = {
  vhclNoVSHM: '',
  vshmModalOpen: false,
}

export const VhclSpecHstrySlice = createSlice({
  name: 'vhclSpecHstryInfo',
  initialState,
  reducers: {
    setSpecHstryInfo: (state: VhclSpecHstryStateType, action) => {
      state = action.payload
      state['vshmModalOpen'] = true
      return state
    },
    clearSpecHstryInfo: (state: VhclSpecHstryStateType) => {
      for (const [key] of Object.entries(state)) {
        if (!key.includes('VSHM')) continue
        state[`${key}`] = ''
      }
      return state
    },
    openSpecHstryModal: (state: VhclSpecHstryStateType) => {
      state['vshmModalOpen'] = true
      return state
    },
    closeSpecHstryModal: (state: VhclSpecHstryStateType) => {
      state['vshmModalOpen'] = false
      return state
    },
  },
})

export const {
  setSpecHstryInfo,
  clearSpecHstryInfo,
  openSpecHstryModal,
  closeSpecHstryModal,
} = VhclSpecHstrySlice.actions
export default VhclSpecHstrySlice.reducer

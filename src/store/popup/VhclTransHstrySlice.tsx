import { createSlice } from '@reduxjs/toolkit'

export interface VhclTransHstryStateType {
  vhclNoVTHM: string //차량번호
  vthmModalOpen: boolean
  [key: string]: any //인덱스 시그니처
}

/**
 * VTHM : VhclTransHstryModal의 약어
 */

export const initialState: VhclTransHstryStateType = {
  vhclNoVTHM: '',
  vthmModalOpen: false,
}

export const VhclTransHstrySlice = createSlice({
  name: 'vhclTransHstryInfo',
  initialState,
  reducers: {
    setTransHstryInfo: (state: VhclTransHstryStateType, action) => {
      state = action.payload
      state['vthmModalOpen'] = false
      return state
    },
    clearTransHstryInfo: (state: VhclTransHstryStateType) => {
      for (const [key] of Object.entries(state)) {
        if (!key.includes('VTHM')) continue
        state[`${key}`] = ''
      }
      return state
    },
    openTransHstryModal: (state: VhclTransHstryStateType) => {
      state['vthmModalOpen'] = true
      return state
    },
    closeTransHstryModal: (state: VhclTransHstryStateType) => {
      state['vthmModalOpen'] = false
      return state
    },
  },
})

export const {
  setTransHstryInfo,
  clearTransHstryInfo,
  openTransHstryModal,
  closeTransHstryModal,
} = VhclTransHstrySlice.actions
export default VhclTransHstrySlice.reducer

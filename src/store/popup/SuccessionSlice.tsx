import { createSlice } from '@reduxjs/toolkit'

export interface SuccessionInfoType {
  vhclNoSUC: string
  sucModalOpen: boolean
  [key: string]: any //인덱스 시그니처
}

/**
 * SUC : SUCcession 의 약어
 */

export const initialState: SuccessionInfoType = {
  vhclNoSUC: '',
  sucModalOpen: false,
}

export const SuccessionInfoSlice = createSlice({
  name: 'successionInfo',
  initialState,
  reducers: {
    setSuccessionInfo: (state: SuccessionInfoType, action) => {
      state = action.payload
      state['sucModalOpen'] = true
      return state
    },
    clearSuccessionInfo: (state: SuccessionInfoType) => {
      for (const [key] of Object.entries(state)) {
        if (!key.includes('SUC')) continue
        state[`${key}`] = ''
      }
      return state
    },
    openSuccessionModal: (state: SuccessionInfoType) => {
      state['sucModalOpen'] = true
      return state
    },
    closeSuccessionModal: (state: SuccessionInfoType) => {
      state['sucModalOpen'] = false
      return state
    },
  },
})

export const {
  setSuccessionInfo,
  clearSuccessionInfo,
  openSuccessionModal,
  closeSuccessionModal,
} = SuccessionInfoSlice.actions
export default SuccessionInfoSlice.reducer

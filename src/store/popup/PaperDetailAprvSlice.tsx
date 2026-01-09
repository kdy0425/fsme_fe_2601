import { createSlice } from '@reduxjs/toolkit'

export interface PaperDetailAprvInfoType {
  vhclNoPDA: string
  aprvYmPDA: string
  pdaModalOpen: boolean
  [key: string]: any //인덱스 시그니처
}

/**
 * PDA : PaperDetailAprv 의 약어
 */

export const initialState: PaperDetailAprvInfoType = {
  vhclNoPDA: '',
  aprvYmPDA: '',
  pdaModalOpen: false,
}

export const PaperDetailAprvInfoSlice = createSlice({
  name: 'paperDetailAprvInfo',
  initialState,
  reducers: {
    setPaperDetailAprvInfo: (state: PaperDetailAprvInfoType, action) => {
      state['pdaModalOpen'] = true
      const targetState = Object.assign(state, action.payload)
      return targetState
    },
    clearPaperDetailAprvInfo: (state: PaperDetailAprvInfoType) => {
      for (const [key] of Object.entries(state)) {
        if (!key.includes('PDA')) continue
        state[`${key}`] = ''
      }
      return state
    },
    openPaperDetailAprvModal: (state: PaperDetailAprvInfoType) => {
      state['pdaModalOpen'] = true
      return state
    },
    closePaperDetailAprvModal: (state: PaperDetailAprvInfoType) => {
      state['pdaModalOpen'] = false
      return state
    },
  },
})

export const {
  setPaperDetailAprvInfo,
  clearPaperDetailAprvInfo,
  closePaperDetailAprvModal,
  openPaperDetailAprvModal,
} = PaperDetailAprvInfoSlice.actions
export default PaperDetailAprvInfoSlice.reducer

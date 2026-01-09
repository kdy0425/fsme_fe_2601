import { Row } from '@/app/(admin)/ilg/nbl/page'
import { createSlice } from '@reduxjs/toolkit'

export interface NblType {
  nblSearchDone: boolean
  nblSelectedData: Row[]
  nblExamResultData: Row[]
  [key: string]: any //인덱스 시그니처
}

/**
 * NBL : nbl 유효하지않은사업자의심거래주유 페이지
 */

export const initialState: NblType = {
  nblSearchDone: false,
  nblSelectedData: [],
  nblExamResultData: [],
}

export const NblSlice = createSlice({
  name: 'NblInfo',
  initialState,
  reducers: {
    setNblSearchFalse: (state: NblType) => {
      state['nblSearchDone'] = false
      return state
    },
    setNblSearchTrue: (state: NblType) => {
      state['nblSearchDone'] = true
      return state
    },
    setNblSelectedData: (state: NblType, action) => {
      state['nblSelectedData'] = action.payload
      return state
    },
    clearNblSelectedData: (state: NblType) => {
      state['nblSelectedData'] = []
      return state
    },
    setNblExamResultData: (state: NblType, action) => {
      state['nblExamResultData'] = action.payload
      return state
    },
    clearNblExamResultData: (state: NblType) => {
      state['nblExamResultData'] = []
      return state
    },
  },
})

export const {
  setNblSearchFalse,
  setNblSearchTrue,
  setNblSelectedData,
  clearNblSelectedData,
  setNblExamResultData,
  clearNblExamResultData,
} = NblSlice.actions
export default NblSlice.reducer

import { Row } from '@/app/(admin)/ilg/dmal/page'
import { createSlice } from '@reduxjs/toolkit'

export interface DmalType {
  dmalSearchDone: boolean
  dmalSelectedData: Row[]
  dmalExamResultData: Row[]
  [key: string]: any //인덱스 시그니처
}

/**
 * DMAL : dmal 1일4회이상주유 페이지
 */

export const initialState: DmalType = {
  dmalSearchDone: false,
  dmalSelectedData: [],
  dmalExamResultData: [],
}

export const DmalSlice = createSlice({
  name: 'DmalInfo',
  initialState,
  reducers: {
    setDmalSearchFalse: (state: DmalType) => {
      state['dmalSearchDone'] = false
      return state
    },
    setDmalSearchTrue: (state: DmalType) => {
      state['dmalSearchDone'] = true
      return state
    },
    setDmalSelectedData: (state: DmalType, action) => {
      state['dmalSelectedData'] = action.payload
      return state
    },
    clearDmalSelectedData: (state: DmalType) => {
      state['dmalSelectedData'] = []
      return state
    },
    setDmalExamResultData: (state: DmalType, action) => {
      state['dmalExamResultData'] = action.payload
      return state
    },
    clearDmalExamResultData: (state: DmalType) => {
      state['dmalExamResultData'] = []
      return state
    },
  },
})

export const {
  setDmalSearchFalse,
  setDmalSearchTrue,
  setDmalSelectedData,
  clearDmalSelectedData,
  setDmalExamResultData,
  clearDmalExamResultData,
} = DmalSlice.actions
export default DmalSlice.reducer

import { Row } from '@/app/(admin)/ilg/shl/page'
import { createSlice } from '@reduxjs/toolkit'

export interface ShlType {
  shlSearchDone: boolean
  shlSelectedData: Row[]
  shlExamResultData: Row[]
  [key: string]: any //인덱스 시그니처
}

/**
 * SHL : shl 단시간반복주유 페이지
 */

export const initialState: ShlType = {
  shlSearchDone: false,
  shlSelectedData: [],
  shlExamResultData: [],
}

export const ShlSlice = createSlice({
  name: 'ShlInfo',
  initialState,
  reducers: {
    setShlSearchFalse: (state: ShlType) => {
      state['shlSearchDone'] = false
      return state
    },
    setShlSearchTrue: (state: ShlType) => {
      state['shlSearchDone'] = true
      return state
    },
    setShlSelectedData: (state: ShlType, action) => {
      state['shlSelectedData'] = action.payload
      return state
    },
    clearShlSelectedData: (state: ShlType) => {
      state['shlSelectedData'] = []
      return state
    },
    setShlExamResultData: (state: ShlType, action) => {
      state['shlExamResultData'] = action.payload
      return state
    },
    clearShlExamResultData: (state: ShlType) => {
      state['shlExamResultData'] = []
      return state
    },
  },
})

export const {
  setShlSearchFalse,
  setShlSearchTrue,
  setShlSelectedData,
  clearShlSelectedData,
  setShlExamResultData,
  clearShlExamResultData,
} = ShlSlice.actions
export default ShlSlice.reducer

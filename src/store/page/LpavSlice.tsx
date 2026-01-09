import { Row } from '@/app/(admin)/ilg/lpav/page'
import { createSlice } from '@reduxjs/toolkit'

export interface LpavType {
  lpavSearchDone: boolean
  lpavSelectedData: Row[]
  lpavExamResultData: Row[]
  [key: string]: any //인덱스 시그니처
}

/**
 * LPAV : lpav 주유패턴이상차량 페이지
 */

export const initialState: LpavType = {
  lpavSearchDone: false,
  lpavSelectedData: [],
  lpavExamResultData: [],
}

export const LpavSlice = createSlice({
  name: 'LpavInfo',
  initialState,
  reducers: {
    setLpavSearchFalse: (state: LpavType) => {
      state['lpavSearchDone'] = false
      return state
    },
    setLpavSearchTrue: (state: LpavType) => {
      state['lpavSearchDone'] = true
      return state
    },
    setLpavSelectedData: (state: LpavType, action) => {
      state['lpavSelectedData'] = action.payload
      return state
    },
    clearLpavSelectedData: (state: LpavType) => {
      state['lpavSelectedData'] = []
      return state
    },
    setLpavExamResultData: (state: LpavType, action) => {
      state['lpavExamResultData'] = action.payload
      return state
    },
    clearLpavExamResultData: (state: LpavType) => {
      state['lpavExamResultData'] = []
      return state
    },
  },
})

export const {
  setLpavSearchFalse,
  setLpavSearchTrue,
  setLpavSelectedData,
  clearLpavSelectedData,
  setLpavExamResultData,
  clearLpavExamResultData,
} = LpavSlice.actions
export default LpavSlice.reducer

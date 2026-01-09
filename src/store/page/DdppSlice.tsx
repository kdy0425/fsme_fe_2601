import { Row } from '@/app/(ilp)/ilp/ddpp/page'
import { createSlice } from '@reduxjs/toolkit'

export interface DdppType {
  ddppSearchDone: boolean
  ddppSelectedData: Row[]
  ddppExamResultData: Row[]
  [key: string]: any //인덱스 시그니처
}

/**
 * Ddpp : ddpp 부정수급시스템 부정수급의심거래 행정처리 페이지
 */

export const initialState: DdppType = {
  ddppSearchDone: false,
  ddppSelectedData: [],
  ddppExamResultData: [],
}

export const DdppSlice = createSlice({
  name: 'DdppInfo',
  initialState,
  reducers: {
    setDdppSearchFalse: (state: DdppType) => {
      state['ddppSearchDone'] = false
      return state
    },
    setDdppSearchTrue: (state: DdppType) => {
      state['ddppSearchDone'] = true
      return state
    },
    setDdppSelectedData: (state: DdppType, action) => {
      state['ddppSelectedData'] = action.payload
      return state
    },
    clearDdppSelectedData: (state: DdppType) => {
      state['ddppSelectedData'] = []
      return state
    },
    setDdppExamResultData: (state: DdppType, action) => {
      state['ddppExamResultData'] = action.payload
      return state
    },
    clearDdppExamResultData: (state: DdppType) => {
      state['ddppExamResultData'] = []
      return state
    },
  },
})

export const {
  setDdppSearchFalse,
  setDdppSearchTrue,
  setDdppSelectedData,
  clearDdppSelectedData,
  setDdppExamResultData,
  clearDdppExamResultData,
} = DdppSlice.actions
export default DdppSlice.reducer

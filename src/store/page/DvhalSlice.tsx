import { Row } from '@/app/(admin)/ilg/dvhal/page'
import { createSlice } from '@reduxjs/toolkit'

export interface DvhalType {
  dvhalSearchDone: boolean
  dvhalSelectedData: Row[]
  dvhalExamResultData: Row[]
  [key: string]: any //인덱스 시그니처
}

/**
 * LPAV : dvhal 거리대비주유시간 이상주유 페이지
 */

export const initialState: DvhalType = {
  dvhalSearchDone: false,
  dvhalSelectedData: [],
  dvhalExamResultData: [],
}

export const DvhalSlice = createSlice({
  name: 'DvhalInfo',
  initialState,
  reducers: {
    setDvhalSearchFalse: (state: DvhalType) => {
      state['dvhalSearchDone'] = false
      return state
    },
    setDvhalSearchTrue: (state: DvhalType) => {
      state['dvhalSearchDone'] = true
      return state
    },
    setDvhalSelectedData: (state: DvhalType, action) => {
      state['dvhalSelectedData'] = action.payload
      return state
    },
    clearDvhalSelectedData: (state: DvhalType) => {
      state['dvhalSelectedData'] = []
      return state
    },
    setDvhalExamResultData: (state: DvhalType, action) => {
      state['dvhalExamResultData'] = action.payload
      return state
    },
    clearDvhalExamResultData: (state: DvhalType) => {
      state['dvhalExamResultData'] = []
      return state
    },
  },
})

export const {
  setDvhalSearchFalse,
  setDvhalSearchTrue,
  setDvhalSelectedData,
  clearDvhalSelectedData,
  setDvhalExamResultData,
  clearDvhalExamResultData,
} = DvhalSlice.actions
export default DvhalSlice.reducer

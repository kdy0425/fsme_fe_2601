import { Row } from '@/app/(admin)/ilg/tcel/page'
import { createSlice } from '@reduxjs/toolkit'

export interface TcelType {
  tcelSearchDone: boolean
  tcelSelectedData: Row[]
  tcelExamResultData: Row[]
  [key: string]: any //인덱스 시그니처
}

/**
 * LPAV : tcel 탱크용량초과주유 페이지
 */

export const initialState: TcelType = {
  tcelSearchDone: false,
  tcelSelectedData: [],
  tcelExamResultData: [],
}

export const TcelSlice = createSlice({
  name: 'TcelInfo',
  initialState,
  reducers: {
    setTcelSearchFalse: (state: TcelType) => {
      state['tcelSearchDone'] = false
      return state
    },
    setTcelSearchTrue: (state: TcelType) => {
      state['tcelSearchDone'] = true
      return state
    },
    setTcelSelectedData: (state: TcelType, action) => {
      state['tcelSelectedData'] = action.payload
      return state
    },
    clearTcelSelectedData: (state: TcelType) => {
      state['tcelSelectedData'] = []
      return state
    },
    setTcelExamResultData: (state: TcelType, action) => {
      state['tcelExamResultData'] = action.payload
      return state
    },
    clearTcelExamResultData: (state: TcelType) => {
      state['tcelExamResultData'] = []
      return state
    },
  },
})

export const {
  setTcelSearchFalse,
  setTcelSearchTrue,
  setTcelSelectedData,
  clearTcelSelectedData,
  setTcelExamResultData,
  clearTcelExamResultData,
} = TcelSlice.actions
export default TcelSlice.reducer

import { Row } from '@/app/(admin)/ilg/taavel/page'
import { createSlice } from '@reduxjs/toolkit'

export interface TaavelType {
  taavelSearchDone: boolean
  taavelSelectedData: Row[]
  taavelExamResultData: Row[]
  [key: string]: any //인덱스 시그니처
}

/**
 * LPAV : taavel 톤급별평균대비초과주유 페이지
 */

export const initialState: TaavelType = {
  taavelSearchDone: false,
  taavelSelectedData: [],
  taavelExamResultData: [],
}

export const TaavelSlice = createSlice({
  name: 'TaavelInfo',
  initialState,
  reducers: {
    setTaavelSearchFalse: (state: TaavelType) => {
      state['taavelSearchDone'] = false
      return state
    },
    setTaavelSearchTrue: (state: TaavelType) => {
      state['taavelSearchDone'] = true
      return state
    },
    setTaavelSelectedData: (state: TaavelType, action) => {
      state['taavelSelectedData'] = action.payload
      return state
    },
    clearTaavelSelectedData: (state: TaavelType) => {
      state['taavelSelectedData'] = []
      return state
    },
    setTaavelExamResultData: (state: TaavelType, action) => {
      state['taavelExamResultData'] = action.payload
      return state
    },
    clearTaavelExamResultData: (state: TaavelType) => {
      state['taavelExamResultData'] = []
      return state
    },
  },
})

export const {
  setTaavelSearchFalse,
  setTaavelSearchTrue,
  setTaavelSelectedData,
  clearTaavelSelectedData,
  setTaavelExamResultData,
  clearTaavelExamResultData,
} = TaavelSlice.actions
export default TaavelSlice.reducer

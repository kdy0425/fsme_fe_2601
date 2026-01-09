import { Row } from '@/app/(admin)/ilg/ddal/page'
import { createSlice } from '@reduxjs/toolkit'

export interface DdalType {
  ddalSearchDone: boolean
  ddalSelectedData: Row[]
  ddalExamResultData: Row[]
  [key: string]: any //인덱스 시그니처
}

/**
 * DDAL : ddal 주행거리 기반 주유량의심주유 페이지
 */

export const initialState: DdalType = {
  ddalSearchDone: false,
  ddalSelectedData: [],
  ddalExamResultData: [],
}

export const DdalSlice = createSlice({
  name: 'DdalInfo',
  initialState,
  reducers: {
    setDdalSearchFalse: (state: DdalType) => {
      state['ddalSearchDone'] = false
      return state
    },
    setDdalSearchTrue: (state: DdalType) => {
      state['ddalSearchDone'] = true
      return state
    },
    setDdalSelectedData: (state: DdalType, action) => {
      state['ddalSelectedData'] = action.payload
      return state
    },
    clearDdalSelectedData: (state: DdalType) => {
      state['ddalSelectedData'] = []
      return state
    },
    setDdalExamResultData: (state: DdalType, action) => {
      state['ddalExamResultData'] = action.payload
      return state
    },
    clearDdalExamResultData: (state: DdalType) => {
      state['ddalExamResultData'] = []
      return state
    },
  },
})

export const {
  setDdalSearchFalse,
  setDdalSearchTrue,
  setDdalSelectedData,
  clearDdalSelectedData,
  setDdalExamResultData,
  clearDdalExamResultData,
} = DdalSlice.actions
export default DdalSlice.reducer

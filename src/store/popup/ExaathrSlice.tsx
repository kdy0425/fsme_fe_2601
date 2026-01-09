import { createSlice } from '@reduxjs/toolkit'

export interface ExaathrType {
  exaModalOpen: boolean
  startFromErModal: boolean // 조사결과모달 -> 행정처분모달 이동시에 true로 변경됨
  [key: string]: any //인덱스 시그니처
}

/**
 * EXA : ExaathrModal의 약어
 */

export const initialState: ExaathrType = {
  exaModalOpen: false,
  startFromErModal: false,
}

export const ExaathrSlice = createSlice({
  name: 'ExaathrInfo',
  initialState,
  reducers: {
    openExaathrModal: (state: ExaathrType) => {
      state['exaModalOpen'] = true
      return state
    },
    closeExaathrModal: (state: ExaathrType) => {
      state['exaModalOpen'] = false
      return state
    },
    setNextProp: (state: ExaathrType) => {
      state['startFromErModal'] = true
      return state
    },
    clearNextProp: (state: ExaathrType) => {
      state['startFromErModal'] = false
      return state
    },
  },
})

export const {
  openExaathrModal,
  closeExaathrModal,
  setNextProp,
  clearNextProp,
} = ExaathrSlice.actions
export default ExaathrSlice.reducer

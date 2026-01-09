import { createSlice } from '@reduxjs/toolkit'

export interface ExamResultType {
  erModalOpen: boolean
  startFromErModal: boolean // 조사결과모달 -> 행정처분모달 이동시에 true로 변경됨
  [key: string]: any //인덱스 시그니처
}

/**
 * ER : ExamResultModal의 약어
 */

export const initialState: ExamResultType = {
  erModalOpen: false,
  startFromErModal: false,
}

export const ExamResultSlice = createSlice({
  name: 'ExamResultInfo',
  initialState,
  reducers: {
    openExamResultModal: (state: ExamResultType) => {
      state['erModalOpen'] = true
      return state
    },
    closeExamResultModal: (state: ExamResultType) => {
      state['erModalOpen'] = false
      return state
    },
    setNextProp: (state: ExamResultType) => {
      state['startFromErModal'] = true
      return state
    },
    clearNextProp: (state: ExamResultType) => {
      state['startFromErModal'] = false
      return state
    },
  },
})

export const { openExamResultModal, 
  closeExamResultModal, 
  setNextProp,
  clearNextProp, } =
  ExamResultSlice.actions
export default ExamResultSlice.reducer

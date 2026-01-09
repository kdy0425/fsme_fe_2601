import { createSlice } from '@reduxjs/toolkit'

export interface ExamResultType {
  erModalOpen: boolean
  [key: string]: any //인덱스 시그니처
}

/**
 * ER : ExamResultModal의 약어
 */

export const initialState: ExamResultType = {
  erModalOpen: false,
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
  },
})

export const { openExamResultModal, closeExamResultModal } =
  ExamResultSlice.actions
export default ExamResultSlice.reducer

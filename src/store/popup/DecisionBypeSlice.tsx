import { createSlice } from '@reduxjs/toolkit'

export interface DecisionBypeType {
  dbModalOpen: boolean
  [key: string]: any //인덱스 시그니처
}

/**
 * DB : DecisionBypeModal의 약어
 */

export const initialState: DecisionBypeType = {
  dbModalOpen: false,
}

export const DecisionBypeSlice = createSlice({
  name: 'DecisionBypeInfo',
  initialState,
  reducers: {
    openDecisionBypeModal: (state: DecisionBypeType) => {
      state['dbModalOpen'] = true
      return state
    },
    closeDecisionBypeModal: (state: DecisionBypeType) => {
      state['dbModalOpen'] = false
      return state
    },
  },
})

export const { openDecisionBypeModal, closeDecisionBypeModal } =
  DecisionBypeSlice.actions
export default DecisionBypeSlice.reducer

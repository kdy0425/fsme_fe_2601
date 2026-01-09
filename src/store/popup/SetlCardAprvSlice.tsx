import { createSlice } from '@reduxjs/toolkit'

export interface SetlCardAprvInfoStateType {
  vhclNoSRAIM: string //차량번호
  stlmCardNoSRAIM: string //결제카드번호
  stlmCardAprvNoSRAIM: string //결제일시
  crdcoCdSRAIM: string
  sraimModalOpen: boolean
  [key: string]: any //인덱스 시그니처
}

/**
 * SRAIM : SetledcaRdAprvInfoModal의 약어
 */

export const initialState: SetlCardAprvInfoStateType = {
  vhclNoSRAIM: '', //차량번호
  stlmCardNoSRAIM: '', //결제카드번호
  stlmCardAprvNoSRAIM: '', //결제일시
  crdcoCdSRAIM: '',
  sraimModalOpen: false,
}

export const SetlCardAprvInfoSlice = createSlice({
  name: 'setlCardAprvInfo',
  initialState,
  reducers: {
    setSetlCardAprvInfo: (state: SetlCardAprvInfoStateType, action) => {
      state = action.payload
      state['sraimModalOpen'] = true
      return state
    },
    clearSetlCardAprvInfo: (state: SetlCardAprvInfoStateType) => {
      for (const [key] of Object.entries(state)) {
        if (!key.includes('SRAIM')) continue
        state[`${key}`] = ''
      }
      return state
    },
    openSetlCardAprvModal: (state: SetlCardAprvInfoStateType) => {
      state['sraimModalOpen'] = true
      return state
    },
    closeSetlCardAprvModal: (state: SetlCardAprvInfoStateType) => {
      state['sraimModalOpen'] = false
      return state
    },
  },
})

export const {
  setSetlCardAprvInfo,
  clearSetlCardAprvInfo,
  openSetlCardAprvModal,
  closeSetlCardAprvModal,
} = SetlCardAprvInfoSlice.actions
export default SetlCardAprvInfoSlice.reducer

import { createSlice } from '@reduxjs/toolkit'

export interface SetledAprvInfoStateType {
  vhclNoSCAIM: string //차량번호
  stlmCardNoSCAIM: string //결제카드번호
  stlmCardAprvNoSCAIM: string //결제일시
  crdcoCdSCAIM: string
  scaimModalOpen: boolean
  [key: string]: any //인덱스 시그니처
}

/**
 * SCAIM : SetledCompletedAprvInfoModal의 약어
 */

export const initialState: SetledAprvInfoStateType = {
  vhclNoSCAIM: '', //차량번호
  stlmCardNoSCAIM: '', //결제카드번호
  stlmCardAprvNoSCAIM: '', //결제일시
  crdcoCdSCAIM: '',
  scaimModalOpen: false,
}

export const SetledAprvInfoSlice = createSlice({
  name: 'setledAprvInfo',
  initialState,
  reducers: {
    setSetledAprvInfo: (state: SetledAprvInfoStateType, action) => {
      state = action.payload
      state['scaimModalOpen'] = true
      return state
    },
    clearSetledAprvInfo: (state: SetledAprvInfoStateType) => {
      for (const [key] of Object.entries(state)) {
        if (!key.includes('SCAIM')) continue
        state[`${key}`] = ''
      }
      return state
    },
    openSetledAprvModal: (state: SetledAprvInfoStateType) => {
      state['scaimModalOpen'] = true
      return state
    },
    closeSetledAprvModal: (state: SetledAprvInfoStateType) => {
      state['scaimModalOpen'] = false
      return state
    },
  },
})

export const {
  setSetledAprvInfo,
  clearSetledAprvInfo,
  closeSetledAprvModal,
  openSetledAprvModal,
} = SetledAprvInfoSlice.actions
export default SetledAprvInfoSlice.reducer

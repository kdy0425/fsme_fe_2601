import { createSlice } from '@reduxjs/toolkit'

export interface RfIdHistoryStateType {
  vhclNoRIHM: string //차량번호
  aprvYmdRIHM: string //결제일시
  rfIdModalOpen: boolean
  [key: string]: any //인덱스 시그니처
}

/**
 * RIHM : SetledcaRdAprvInfoModal의 약어
 */

export const initialState: RfIdHistoryStateType = {
  vhclNoRIHM: '', //차량번호
  aprvYmdRIHM: '', //결제일시
  rfIdModalOpen: false,
}

export const RfIdHistorySlice = createSlice({
  name: 'rfIdHistoryInfo',
  initialState,
  reducers: {
    setRfIdHistory: (state:RfIdHistoryStateType, action) => {
      state = action.payload
      state['rfIdModalOpen'] = true
      return state
    },
    clearRfIdHistory: (state:RfIdHistoryStateType) => {
      for (const [key] of Object.entries(state)) {
        if (!key.includes('RIHM')) continue
        state[`${key}`] = ''
      }
      return state
    },
    openRfIdHistoryModal: (state:RfIdHistoryStateType) => {
      state['rfIdModalOpen'] = true
      return state
    },
    closeRfIdHistoryModal: (state:RfIdHistoryStateType) => {
      state['rfIdModalOpen'] = false
      return state
    },
  },
})

export const {
  setRfIdHistory,
  clearRfIdHistory,
  openRfIdHistoryModal,
  closeRfIdHistoryModal,
} = RfIdHistorySlice.actions
export default RfIdHistorySlice.reducer

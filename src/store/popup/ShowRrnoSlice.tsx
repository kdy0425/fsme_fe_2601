import { createSlice } from '@reduxjs/toolkit'

export interface RrnoDecStateType {
  rrnoModalOpen: boolean
  rrnoDecNo: string
  rrnoVhclNo: string
  rrnoInqRsnCn: string
  rrnoInqScrnInfoCn: string
  [key: string]: any //인덱스 시그니처
}

/**
 * SCAIM : SetledCompletedAprvInfoModal의 약어
 */

export const initialState: RrnoDecStateType = {
  rrnoModalOpen: false,
  rrnoDecNo: '',
  rrnoVhclNo: '',
  rrnoInqRsnCn: '',
  rrnoInqScrnInfoCn: '',
}

export const RrnoDecInfoSlice = createSlice({
  name: 'rrnoDecInfo',
  initialState,
  reducers: {
    openRrnoDecModal: (state: RrnoDecStateType, action) => {
      state['rrnoModalOpen'] = true
      state['rrnoDecNo'] = action.payload.rrnoDecNo
      state['rrnoVhclNo'] = action.payload.rrnoVhclNo
      state['rrnoInqRsnCn'] = action.payload.rrnoInqRsnCn
      state['rrnoInqScrnInfoCn'] = action.payload.rrnoInqScrnInfoCn
      return state
    },
    closeRrnoDecModal: (state: RrnoDecStateType) => {
      return initialState
    },
    setRrnoDecInfo: (state: RrnoDecStateType, action) => {
      state = action.payload
      return state
    },
  },
})

export const { setRrnoDecInfo, closeRrnoDecModal, openRrnoDecModal } =
  RrnoDecInfoSlice.actions
export default RrnoDecInfoSlice.reducer

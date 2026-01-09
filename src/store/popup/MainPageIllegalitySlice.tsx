import { createSlice } from '@reduxjs/toolkit'

export interface IllegalStateType {
  MpiModalOpen: boolean //메인화면 부정수급 행정처분 팝업 모달 오픈여부
  [key: string]: any //인덱스 시그니처
}

/**
 * MPI : MainPageIllegality의 약어
 */

export const initialState: IllegalStateType = {
  MpiModalOpen: false,
}

export const IllegalInfoSlice = createSlice({
  name: 'illegalInfo',
  initialState,
  reducers: {
    openIllegalModal: (state: IllegalStateType) => {
      state['MpiModalOpen'] = true
      return state
    },
    closeIllegalModal: (state: IllegalStateType) => {
      state['MpiModalOpen'] = false
      return state
    },
  },
})

export const { openIllegalModal, closeIllegalModal } = IllegalInfoSlice.actions
export default IllegalInfoSlice.reducer

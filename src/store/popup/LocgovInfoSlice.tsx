import { createSlice } from '@reduxjs/toolkit'

export interface LocStateType {
  ctpvCdLGM: string //시도코드
  sggCdLGM: string //시군구코드
  ctpvNmLGM: string //시도명
  locgovNmLGM: string //시도+시군구명
  locgovCdLGM: string //시도+시군구코드
  LgmModalOpen: boolean //차량검색 팝업 모달 오픈여부
  [key: string]: any //인덱스 시그니처
}

/**
 * LGM : locgovModal의 약어
 */

export const initialState: LocStateType = {
  ctpvCdLGM: '',
  sggCdLGM: '',
  ctpvNmLGM: '',
  locgovNmLGM: '',
  locgovCdLGM: '',
  LgmModalOpen: false,
}

export const LocgovInfoSlice = createSlice({
  name: 'locgovInfo',
  initialState,
  reducers: {
    setLocgovInfo: (state: LocStateType, action) => {
      state = action.payload
      state['LgmModalOpen'] = true
      return state
    },
    clearLocgovInfo: (state: LocStateType) => {
      return {
        ...initialState,
        LgmModalOpen: true,
      }
    },
    closeModalAndClearLocgovInfo : (state : LocStateType) => {
      return {
        ...initialState,
      }
    },
    openLocgovModal: (state: LocStateType) => {
      state['LgmModalOpen'] = true
      return state
    },
    closeLocgovModal: (state: LocStateType) => {
      state['LgmModalOpen'] = false
      return state
    },
  },
})

export const {
  setLocgovInfo,
  clearLocgovInfo,
  closeLocgovModal,
  openLocgovModal,
  closeModalAndClearLocgovInfo
} = LocgovInfoSlice.actions
export default LocgovInfoSlice.reducer

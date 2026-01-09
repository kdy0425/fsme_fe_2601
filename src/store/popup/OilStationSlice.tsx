import { createSlice } from '@reduxjs/toolkit'

export interface OilStationStateType {
  frcsBrnoOSM: string
  frcsNmOSM: string
  telnoOSM: string
  daddrOSM: string
  osmModalOpen: boolean //차량검색 팝업 모달 오픈여부
  [key: string]: any //인덱스 시그니처
}

/**
 * OSM : OilStationModal의 약어
 */

export const initialState: OilStationStateType = {
  frcsBrnoOSM: '',
  frcsNmOSM: '',
  telnoOSM: '',
  daddrOSM: '',
  osmModalOpen: false, //차량검색 팝업 모달 오픈여부
}

export const OilStationInfoSlice = createSlice({
  name: 'oilStationInfo',
  initialState,
  reducers: {
    setOilStationInfo: (state: OilStationStateType, action) => {
      state = action.payload
      state['osmModalOpen'] = true
      return state
    },
    clearOilStationInfo: (state: OilStationStateType) => {
      for (const [key] of Object.entries(state)) {
        if (!key.includes('OSM')) {
          continue
        }
        state[`${key}`] = ''
      }
      return state
    },
    openOilStationModal: (state: OilStationStateType) => {
      state['osmModalOpen'] = true
      return state
    },
    closeOilStationModal: (state: OilStationStateType) => {
      state['osmModalOpen'] = false
      return state
    },
  },
})

export const {
  setOilStationInfo,
  clearOilStationInfo,
  openOilStationModal,
  closeOilStationModal,
} = OilStationInfoSlice.actions
export default OilStationInfoSlice.reducer

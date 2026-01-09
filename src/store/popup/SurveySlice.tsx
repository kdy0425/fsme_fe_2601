import { createSlice } from '@reduxjs/toolkit'

export interface SurveyInfoStateType {
  svModalOpen: boolean
  svSrvyCycl: number
  [key: string]: any //인덱스 시그니처
}

export const initialState: SurveyInfoStateType = {
  svModalOpen: false,
  svSrvyCycl: 0,
}

export const SurveyInfoSlice = createSlice({
  name: 'surveyInfo',
  initialState,
  reducers: {
    setSurveyInfo: (state: SurveyInfoStateType, action) => {
      let returnObj = Object.assign(state, { svSrvyCycl: action.payload })
      return returnObj
    },
    openServeyModal: (state: SurveyInfoStateType) => {
      state['svModalOpen'] = true
      return state
    },
    closeServeyModal: (state: SurveyInfoStateType) => {
      state['svModalOpen'] = false
      return state
    },
  },
})

export const { openServeyModal, closeServeyModal, setSurveyInfo } =
  SurveyInfoSlice.actions
export default SurveyInfoSlice.reducer

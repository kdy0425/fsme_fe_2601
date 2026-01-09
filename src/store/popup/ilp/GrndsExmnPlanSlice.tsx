import { createSlice } from '@reduxjs/toolkit'

export interface GrndsExmnPlanType {
  gepModalOpen: boolean
  [key: string]: any //인덱스 시그니처
}

/**
 * GEP : GrndsExmnPlantModal의 약어
 */

export const initialState: GrndsExmnPlanType = {
  gepModalOpen: false,
}

export const GrndsExmnPlanSlice = createSlice({
  name: 'GrndsExmnPlanInfo',
  initialState,
  reducers: {
    openGrndsExmnPlanModal: (state: GrndsExmnPlanType) => {
      state['gepModalOpen'] = true
      return state
    },
    closeGrndsExmnPlanModal: (state: GrndsExmnPlanType) => {
      state['gepModalOpen'] = false
      return state
    },
  },
})

export const { openGrndsExmnPlanModal, closeGrndsExmnPlanModal } =
  GrndsExmnPlanSlice.actions
export default GrndsExmnPlanSlice.reducer

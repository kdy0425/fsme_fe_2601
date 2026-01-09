import { createSlice } from '@reduxjs/toolkit'

export interface IlgIsdType {
  IISModalOpen: boolean
  IISUpdateModalOpen: boolean
  IISModalMode: string
  [key: string]: any //인덱스 시그니처
}

/**
 * IlgIsdModal 의 약어
 */

export const initialState: IlgIsdType = {
  IISModalOpen: false,
  IISUpdateModalOpen: false,
  IISModalMode: '',
}

export const IlgIsdSlice = createSlice({
  name: 'IlgIsdInfo',
  initialState,
  reducers: {
    openIlgIsdModal: (state: IlgIsdType) => {
      state['IISModalOpen'] = true
      return state
    },
    closeIlgIsdModal: (state: IlgIsdType) => {
      state['IISModalMode'] = ''
      state['IISModalOpen'] = false
      return state
    },
    openIlgIsdUpdateModal: (state: IlgIsdType) => {
      state['IISUpdateModalOpen'] = true
      return state
    },
    closeIlgIsdUpdateModal: (state: IlgIsdType) => {
      state['IISUpdateModalOpen'] = false
      return state
    },
    setCreateModalMode: (state: IlgIsdType) => {
      state['IISModalMode'] = 'CREATE'
      return state
    },
    setUpdateModalMode: (state: IlgIsdType) => {
      state['IISModalMode'] = 'UPDATE'
      return state
    },
  },
})

export const {
  openIlgIsdModal,
  closeIlgIsdModal,
  setCreateModalMode,
  setUpdateModalMode,
  openIlgIsdUpdateModal,
  closeIlgIsdUpdateModal,
} = IlgIsdSlice.actions
export default IlgIsdSlice.reducer

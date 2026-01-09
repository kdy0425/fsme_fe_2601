import { createSlice } from '@reduxjs/toolkit'

export interface IsdType {
  isdSearchDone: boolean
  isdSelectedData: any
  [key: string]: any //인덱스 시그니처
}

/**
 * ISD : isd : 부정수급 행정처리 페이지 ( 화물탭 )
 */

export const initialState: IsdType = {
  isdSearchDone: false,
  isdSelectedData: {},
}

export const IsdSlice = createSlice({
  name: 'isdInfo',
  initialState,
  reducers: {
    setIsdSearchFalse: (state: IsdType) => {
      state['isdSearchDone'] = false
      return state
    },
    setIsdSearchTrue: (state: IsdType) => {
      state['isdSearchDone'] = true
      return state
    },
    setIsdSelectedData: (state: IsdType, action) => {
      state['isdSelectedData'] = action.payload
      return state
    },
    clearIsdSelectedData: (state: IsdType) => {
      state['isdSelectedData'] = {}
      return state
    },
  },
})

export const {
  setIsdSearchFalse,
  setIsdSearchTrue,
  setIsdSelectedData,
  clearIsdSelectedData,
} = IsdSlice.actions
export default IsdSlice.reducer

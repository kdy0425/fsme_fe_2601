import { createSlice } from '@reduxjs/toolkit'

export interface BfdnDspsType {
  exmnNoBD: string // 연번
  vhclNoBD: string // 차량번호
  vonrNmBD: string // 소유주명
  bfdnMdfcnYmdBD: string //  사전처분통지서 수정일자
  BDModalOpen: boolean // 사전처분통지서 모달 오픈
  [key: string]: any //인덱스 시그니처
}

/**
 * BD : bfdnDspsModal의 약어
 */

export const initialState: BfdnDspsType = {
  exmnNoBD: '',
  vhclNoBD: '',
  vonrNmBD: '',
  bfdnMdfcnYmdBD: '',
  bfdnDspsTtlBD: '', //사전처분통지서처분제목
  bfdnAddrBD: '', //사전처분통지서주소
  bfdnDspsRsnCnBD: '', //사전처분통지서처분사유내용
  bfdnDspsCnBD: '', //사전처분통지서처분내용
  bfdnLglBssCnBD: '', //사전처분통지서법적근거내용
  bfdnSbmsnOfficInstNmBD: '', //사전처분통지서제출처기관명
  bfdnSbmsnOfficDeptNmBD: '', //사전처분통지서제출처부서명
  bfdnSbmsnOfficPicNmBD: '', //사전처분통지서제출처담당자명
  bfdnSbmsnOfficAddrBD: '', //사전처분통지서제출처주소
  bfdnSbmsnOfficTelnoBD: '', //사전처분통지서제출처전화번호
  bfdnSbmsnOfficFxnoBD: '', //사전처분통지서제출처팩스번호
  bfdnSbmsnTermCnBD: '', //사전처분통지서제출기한내용
  bfdnRgnMayerNmBD: '', //사전처분통지서지역시장명
  BDModalOpen: false,
}

export const BfdnDspsSlice = createSlice({
  name: 'BfdnDspsInfo',
  initialState,
  reducers: {
    openBfdnDspsModal: (state: BfdnDspsType) => {
      state['BDModalOpen'] = true
      return state
    },
    closeBfdnDspsModal: (state: BfdnDspsType) => {
      state['BDModalOpen'] = false
      return state
    },
    setBfdnDspsTypeInfo: (state: BfdnDspsType, action) => {
      const { payload } = action
      return {
        ...payload,
        BDModalOpen: true,
      }
    },
    clearBfdnDspsTypeInfo: (state: BfdnDspsType) => {
      return {
        ...initialState,
      }
    },
  },
})

export const {
  openBfdnDspsModal,
  closeBfdnDspsModal,
  setBfdnDspsTypeInfo,
  clearBfdnDspsTypeInfo,
} = BfdnDspsSlice.actions
export default BfdnDspsSlice.reducer

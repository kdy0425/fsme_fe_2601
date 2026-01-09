import { createSlice } from '@reduxjs/toolkit'

export interface AdmdspNotieType {
  exmnNoAN: string //행정처분 통지서 연번
  vhclNoAN: string //행정처분 통지서 차량번호
  vonrNmAN: string //행정처분 통지서 소유주명
  bfdnAddrAN: string //사전처분 통지서 주소
  bfdnDspsRsnCnAN: string //사전처분통지서처분사유내용
  bfdnDspsTtlAN: string //사전처분통지서처분제목
  bfdnLglBssCnAN: string //사전처분통지서법적근거내용
  admdspSeNmAN: string //행정처분 통지서 행정처분구분명
  admdspNotieDspsTtlAN: string //행정처분통지서처분제목
  admdspNotieAddrAN: string //행정처분통지서주소
  admdspNotieDspsRsnCnAN: string //행정처분통지서처분사유내용
  admdspNotieLglBssCnAN: string //행정처분통지서법적근거내용
  admdspNotieClmPrdCnAN: string //행정처분통지서청구기간내용
  admdspNotieMdfcnYmdAN: string //행정처분 통지서 수정일자
  admdspNotieClmProcssCnAN: string //행정처분 통지서 처분절차
  admdspNotieRgnMayerNmAN: string //시장이름
  dspsDtAN: string //행정처분 통지서 처분일
  ANModalOpen: boolean //행정처분 통지서 모달 오픈
  [key: string]: any //인덱스 시그니처
}

/**
 * AN : AdmdspNotieModal의 약어
 */

export const initialState: AdmdspNotieType = {
  exmnNoAN: '',
  vhclNoAN: '',
  vonrNmAN: '',
  bfdnAddrAN: '',
  bfdnDspsRsnCnAN: '',
  bfdnDspsTtlAN: '',
  bfdnLglBssCnAN: '',
  admdspSeNmAN: '',
  admdspNotieDspsTtlAN: '',
  admdspNotieAddrAN: '',
  admdspNotieDspsRsnCnAN: '',
  admdspNotieLglBssCnAN: '',
  admdspNotieClmPrdCnAN: '',
  admdspNotieMdfcnYmdAN: '',
  admdspNotieClmProcssCnAN: '',
  admdspNotieRgnMayerNmAN: '',
  dspsDtAN: '',
  ANModalOpen: false,
}

export const AdmdspNotieSlice = createSlice({
  name: 'AdmdspNotieInfo',
  initialState,
  reducers: {
    openAdmdspNotieModal: (state: AdmdspNotieType) => {
      state['ANModalOpen'] = true
      return state
    },
    closeAdmdspNotieModal: (state: AdmdspNotieType) => {
      state['ANModalOpen'] = false
      return state
    },
    setAdmdspNotieInfo: (state: AdmdspNotieType, action) => {
      state['ANModalOpen'] = true
      const targetState = Object.assign(state, action.payload)
      return targetState
    },
    clearAdmdspNotieInfo: (state: AdmdspNotieType) => {
      return {
        ...initialState,
      }
    },
  },
})

export const {
  openAdmdspNotieModal,
  closeAdmdspNotieModal,
  setAdmdspNotieInfo,
  clearAdmdspNotieInfo,
} = AdmdspNotieSlice.actions
export default AdmdspNotieSlice.reducer

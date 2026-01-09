import { createSlice } from '@reduxjs/toolkit'

export interface StateType {
  vhclNoCM: string //차량번호
  locgovCdCM: string //지자체코드
  crnoDeCM: string //사업자번호(법인번호)
  koiCdCM: string //유종코드
  koiNmCM: string //유종명
  vhclTonCdCM: string //톤수코드
  lcnsTpbizCdCM: string //면허업종코드
  vhclSeCdCM: string //소유구분코드
  vhclRegYmdCM: string //차량등록일자
  yridnwCM: string //연식
  lenCM: string //길이
  btCM: string //너비
  maxLoadQtyCM: string //최대적재수량
  vhclSttsCdCM: string //차량상태코드
  vonrRrnoSeCM: string //주민등록번호(부분복호화)
  vonrRrnoDeCM: string //주민등록번호(부분복호화)
  vonrNmCM: string //소유자명
  delYnCM: string //삭제여부
  dscntYnCM: string //할인여부
  souSourcSeCdCM: string //원천소스구분코드
  bscInfoChgYnCM: string //기본정보변경여부
  locgovAprvYnCM: string //지자체승인여부
  locgovNmCM: string //지자체명
  vonrBrnoCM: string //차주사업자번호
  vhclPsnCdCM: string //차량소유코드
  prcsSttsCdCM: string //지자체이첩상태코드
  isTodayStopCancelCM: string //당일정지취소여부
  modalOpen: boolean //차량검색 팝업 모달 오픈여부
  [key: string]: any //인덱스 시그니처
}

/**
 * CM : carModal의 약어
 */
export const initialState: StateType = {
  vhclNoCM: '',
  locgovCdCM: '',
  crnoDeCM: '',
  koiCdCM: '',
  koiNmCM: '',
  vhclTonCdCM: '',
  lcnsTpbizCdCM: '',
  vhclSeCdCM: '',
  vhclRegYmdCM: '',
  yridnwCM: '',
  lenCM: '',
  btCM: '',
  maxLoadQtyCM: '',
  vhclSttsCdCM: '',
  vonrRrnoSeCM: '',
  vonrRrnoDeCM: '',
  vonrRrnoCM: '',
  vonrNmCM: '',
  delYnCM: '',
  dscntYnCM: '',
  souSourcSeCdCM: '',
  bscInfoChgYnCM: '',
  locgovAprvYnCM: '',
  locgovNmCM: '',
  vonrBrnoCM: '',
  vhclPsnCdCM: '',
  prcsSttsCdCM: '',
  isTodayStopCancelCM: '',
  modalOpen: false,
}

export const CarInfoSlice = createSlice({
  name: 'carInfo',
  initialState,
  reducers: {
    setCarInfo: (state: StateType, action) => {
      state = action.payload
      state['modalOpen'] = true
      return state
    },
    clearCarInfo: (state: StateType) => {
      for (const [key] of Object.entries(state)) {
        if (!key.includes('CM')) continue
        state[`${key}`] = ''
      }
      return state
    },
    openCarModal: (state: StateType) => {
      state['modalOpen'] = true
      return state
    },
    closeCarModal: (state: StateType) => {
      state['modalOpen'] = false
      return state
    },
  },
})

export const { setCarInfo, clearCarInfo, closeCarModal, openCarModal } =
  CarInfoSlice.actions

export default CarInfoSlice.reducer

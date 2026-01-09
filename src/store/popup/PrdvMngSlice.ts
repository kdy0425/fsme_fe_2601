/* node_modules */
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type buttons = 'prdvRate' | 'rcntImplPrfmnc' | 'frstHalfImplRate' | 'hcfhNeedRate' | 'ajmtPrdvRate'

export type rateObjType = {
  prdvRate: string
  rcntImplPrfmnc: string
  frstHalfImplRate: string
  hcfhNeedRate: string
}

export type implDateObjType = {
  implBgngYm: string
  implEndYm: string
}

type prdvYearDataType = {
  crtrYear: string
  halfYear: string
}

export interface resultList {
  locgovCd: string
  [key: string]: any
}

export type rateListType = 'prdvRateList' | 'rcntImplPrfmncList' | 'frstHalfImplRateList' | 'hcfhNeedRateList' | 'ajmtPrdvRateList' | 'prdvRateIcdcList'

export interface prdvRow {
  locgovCd: string            // 시군별
  locgovNm: string            // 시군별명
  totExsGiveAmt: string       // 총계_기지급액
  bsExsGiveAmt: string        // 버스_기지급액
  txExsGiveAmt: string        // 택시_기지급액
  trExsGiveAmt: string        // 화물_기지급액
  totHcfhGiveExpcAmt: string  // 총계_향후 지급예상액
  bsHcfhGiveExpcAmt: string   // 버스_향후 지급예상액
  txHcfhGiveExpcAmt: string   // 택시_향후 지급예상액
  trHcfhGiveExpcAmt: string   // 화물_향후 지급예상액
  prdvRate: string            // 디스플레이 기존안분률
  rcntImplPrfmnc: string      // 디스플레이 최근4년집행실적
  frstHalfImplRate: string    // 디스플레이 상반기집행률
  hcfhNeedRate: string        // 디스플레이 향후요구율
  ajmtPrdvRate: string        // 디스플레이 조정안분율
  prdvRateIcdc: string        // 디스플레이 안분율증감
  /* 실제 db 저장 값 */
  dbPrdvRate: string          // 디비저장값 기존안분률
  dbRcntImplPrfmnc: string    // 디비저장값 최근4년집행실적
  dbFrstHalfImplRate: string  // 디비저장값 상반기집행률
  dbHcfhNeedRate: string      // 디비저장값 향후요구율
  dbAjmtPrdvRate: string      // 디비저장값 조정안분율
  dbPrdvRateIcdc: string      // 디비저장값 안분율증감
  /* background 처리용도 */
  backgroundColor: string
}

/**
 * viewRateObj            - (조회) 비율 객체
 * createRateObj          - (등록) 비율 객체
 * viewImplDateObj        - (조회) 상반기 집행일자 객체
 * createImplDateObj      - (등록) 상반기 집행일자 객체
 * createModalOpen        - 등록모달 오픈 상태관리
 * rcntImplPrfmncOpen     - 최근4년집행실적 모달 오픈 상태관리
 * frstHalfImplRateOpen   - 상반기집행률 모달 오픈 상태관리
 * hcfhNeedRateOpen       - 향후요구율 모달 오픈 상태관리 
 * prdvYearData           - 안분등록 모달의 년도 및 반기 데이터
 * prdvRateList           - 기존안분율 결과 리스트
 * rcntImplPrfmncList     - 최근4년집행실적 결과 리스트
 * frstHalfImplRateList   - 상반기집행률 결과 리스트
 * hcfhNeedRateList       - 향후요구율 결과 리스트
 * ajmtPrdvRateList       - 조정안분율 결과 리스트
 * prdvRateIcdcList       - 안분율 증감 리스트
 * loadingBackdrop        - 프로세스시 로딩여부
 * prdvRows               - 안분관리 등록 로우
 * changeObj              - 비율변동여부 및 반기변동여부
 */
export type initialStateType = {
  viewRateObj: rateObjType
  createRateObj: rateObjType
  viewImplDateObj: implDateObjType
  createImplDateObj: implDateObjType
  createModalOpen: boolean
  rcntImplPrfmncOpen: boolean
  frstHalfImplRateOpen: boolean
  hcfhNeedRateOpen: boolean
  prdvYearData: prdvYearDataType
  prdvRateList: resultList[]
  rcntImplPrfmncList: resultList[]
  frstHalfImplRateList: resultList[]
  hcfhNeedRateList: resultList[]
  ajmtPrdvRateList: resultList[]
  prdvRateIcdcList: resultList[]
  loadingBackdrop: boolean
  prdvRows: prdvRow[]
  changeObj: Record<'rateIsChange' | 'halfYearIsChange', boolean>
}

const initialState: initialStateType = {
  viewRateObj: {
    prdvRate: '',
    rcntImplPrfmnc: '',
    frstHalfImplRate: '',
    hcfhNeedRate: '',
  },
  createRateObj: {
    prdvRate: '',
    rcntImplPrfmnc: '',
    frstHalfImplRate: '',
    hcfhNeedRate: '',
  },
  viewImplDateObj: {
    implBgngYm: '',
    implEndYm: '',
  },
  createImplDateObj: {
    implBgngYm: '',
    implEndYm: '',
  },
  createModalOpen: false,
  rcntImplPrfmncOpen: false,
  frstHalfImplRateOpen: false,
  hcfhNeedRateOpen: false,
  prdvYearData: {
    crtrYear: '',
    halfYear: '1',
  },
  prdvRateList: [],
  rcntImplPrfmncList: [],
  frstHalfImplRateList: [],
  hcfhNeedRateList: [],
  ajmtPrdvRateList: [],
  prdvRateIcdcList: [],
  loadingBackdrop: false,
  prdvRows: [],
  changeObj: {
    rateIsChange: true,
    halfYearIsChange: true,
  },
}

export const PrdvMngSlice = createSlice({
  name: 'PrdvMng',
  initialState,
  reducers: {
    // 등록모달 오픈
    handleCreateModalOpen: (state: initialStateType) => {
      state.createModalOpen = true
    },
    // 등록모달 클로즈
    handleCreateModalClose: (state: initialStateType) => {
      state.createModalOpen = false
      state.createImplDateObj = {
        implBgngYm: '',
        implEndYm: '',
      }
      state.prdvYearData = {
        crtrYear: '',
        halfYear: '1',
      }
      state.prdvRateList = []
      state.rcntImplPrfmncList = []
      state.frstHalfImplRateList = []
      state.hcfhNeedRateList = []
      state.ajmtPrdvRateList = []
      state.prdvRateIcdcList = []
      state.prdvRows = []
      state.changeObj = {
        rateIsChange: true,
        halfYearIsChange: true,
      }
    },
    // 안분등록 모달에서 년도 및 반기 변경시 데이터 세팅
    setPrdvYearData: (state: initialStateType, action: PayloadAction<prdvYearDataType>) => {
      state.prdvYearData = action.payload
    },
    // 최근4년집행실적, 상반기집행률, 향후요구율 모달 오픈 or 클로즈
    handleRateModal: (state: initialStateType, action: PayloadAction<{ name: 'rcntImplPrfmncOpen' | 'frstHalfImplRateOpen' | 'hcfhNeedRateOpen', open: boolean }>) => {
      const { name, open } = action.payload
      state[name] = open
    },
    // 기존안분율, 최근4년집행실적, 상반기집행률, 향후요구율, 조정안분율, 안분율증감 리스트 세팅
    handleSetList: (state: initialStateType, action: PayloadAction<{ name: rateListType, list: resultList[] }>) => {
      const { name, list } = action.payload
      state[name] = list
    },
    // (조회) 비율세팅
    handleSetViewRate: (state: initialStateType, action: PayloadAction<rateObjType>) => {
      state.viewRateObj = action.payload
    },
    // (등록) 비율세팅
    handleSetCreateRate: (state: initialStateType, action: PayloadAction<{ name: keyof rateObjType, value: string }>) => {
      const { name, value } = action.payload
      state.createRateObj[name] = value
    },
    // 집행일자세팅
    handleSetImplDate: (state: initialStateType, action: PayloadAction<{ name: 'view' | 'create', value: implDateObjType }>) => {
      const { name, value } = action.payload
      state[`${name}ImplDateObj`] = value
    },
    // 프로세스 로딩 처리
    handleLoadingBackdrop: (state: initialStateType, action: PayloadAction<boolean>) => {
      state.loadingBackdrop = action.payload
    },
    // 로우 set처리
    handleSetPrdvRows: (state: initialStateType, action: PayloadAction<prdvRow[]>) => {
      state.prdvRows = action.payload
    },
    // 저장시 비율이 바뀌었을경우 조정안분율 재계산 안내를 위한 플래그처리
    handleIsChage: (state: initialStateType, action: PayloadAction<{ name: 'rateIsChange' | 'halfYearIsChange', value: boolean }>) => {
      const { name, value } = action.payload
      state.changeObj[name] = value
    },
  },
})

export const {
  handleCreateModalOpen,
  handleCreateModalClose,
  setPrdvYearData,
  handleRateModal,
  handleSetList,
  handleSetViewRate,
  handleSetCreateRate,
  handleSetImplDate,
  handleLoadingBackdrop,
  handleSetPrdvRows,
  handleIsChage,
} = PrdvMngSlice.actions
export default PrdvMngSlice.reducer

const prdvActions = PrdvMngSlice.actions
export type prdvActionsType = ReturnType<(typeof prdvActions)[keyof typeof prdvActions]>
import { useSelector } from '@/store/hooks'
import {
  clearDdalSelectedData,
  setDdalExamResultData,
  setDdalSearchFalse,
  setDdalSearchTrue,
  setDdalSelectedData,
} from '@/store/page/DdalSlice'
import {
  clearDmalSelectedData,
  setDmalExamResultData,
  setDmalSearchFalse,
  setDmalSearchTrue,
  setDmalSelectedData,
} from '@/store/page/DmalSlice'
import {
  clearDvhalSelectedData,
  setDvhalExamResultData,
  setDvhalSearchFalse,
  setDvhalSearchTrue,
  setDvhalSelectedData,
} from '@/store/page/DvhalSlice'
import {
  clearLpavSelectedData,
  setLpavExamResultData,
  setLpavSearchFalse,
  setLpavSearchTrue,
  setLpavSelectedData,
} from '@/store/page/LpavSlice'
import {
  clearNblSelectedData,
  setNblExamResultData,
  setNblSearchFalse,
  setNblSearchTrue,
  setNblSelectedData,
} from '@/store/page/NblSlice'
import {
  clearShlSelectedData,
  setShlExamResultData,
  setShlSearchFalse,
  setShlSearchTrue,
  setShlSelectedData,
} from '@/store/page/ShlSlice'
import {
  clearTaavelSelectedData,
  setTaavelExamResultData,
  setTaavelSearchFalse,
  setTaavelSearchTrue,
  setTaavelSelectedData,
} from '@/store/page/TaavelSlice'
import {
  clearTcelSelectedData,
  setTcelExamResultData,
  setTcelSearchFalse,
  setTcelSearchTrue,
  setTcelSelectedData,
} from '@/store/page/TcelSlice'
import { AppDispatch, AppState } from '@/store/store'
import {
  ilgCommTabOneHC,
  ilgCommTabThreeHC,
  ilgCommTabTwoHC,
  ilgDdalTabOneHC,
  ilgDdalTabTwoHC,
  ilgDmalTabOneHC,
  ilgDmalTabTwoHC,
  ilgDvhalTabOneHC,
  ilgDvhalTabTwoHC,
  ilgLpavTabOneHC,
  ilgLpavTabTwoHC,
  ilgNblTabOneHC,
  ilgNblTabTwoHC,
  ilgShlTabOneHC,
  ilgShlTabTwoHC,
  ilgTaavelTabOneHC,
  ilgTaavelTabTwoHC,
  ilgTcelTabOneHC,
  ilgTcelTabTwoHC,
} from '@/utils/fsms/headCells'
import { HeadCell } from 'table'

export type Tab = {
  value: string
  label: string
  active: boolean
}

export const ilgTabs: Tab[] = [
  { value: '1', label: '의심거래내역', active: false },
  { value: '2', label: '조사대상내역', active: false },
  { value: '3', label: '조사결과조회', active: false },
  { value: '4', label: '행정처분조회', active: false },
  { value: '5', label: '지자체이첩승인', active: false },
  { value: '6', label: '지자체이첩요청', active: false },
]

export const tabEndpoints: string[] = [
  'getAllDoubtDelngDtls',
  'getAllExamTrgetDtls',
  'getAllExamResultDtls',
  'getAllExaathrDtls',
  'getAllLgovTrfCfmDtls',
  'getAllLgovTrfntfReq',
]

export const excelEndpoints: string[] = [
  'doubtDelngDtlsExcel',
  'examTrgetDtlsExcel',
  'examResultDtlsExcel',
  'exaathrDtlsExcel',
  'lgovTrfCfmDtlsExcel',
  'lgovTrfntfReqExcel',
]

/** 의심거래패턴 공통그리드 헤드셀 */
const commTabHeadCells: HeadCell[][] = [
  ilgCommTabOneHC,
  ilgCommTabTwoHC,
  ilgCommTabThreeHC,
  ilgCommTabThreeHC,
]

/** 주유패턴이상차량 그리드 헤드셀 */
export const lpavTabHeadCells: HeadCell[][] = [
  ilgLpavTabOneHC,
  ilgLpavTabTwoHC,
  ...commTabHeadCells,
]

/** 단시간반복주유 그리드 헤드셀 */
export const shlTabHeadCells: HeadCell[][] = [
  ilgShlTabOneHC,
  ilgShlTabTwoHC,
  ...commTabHeadCells,
]

/** 1일4회이상주유 그리드 헤드셀 */
export const dmalTabHeadCells: HeadCell[][] = [
  ilgDmalTabOneHC,
  ilgDmalTabTwoHC,
  ...commTabHeadCells,
]

/** 탱크용량초과주유 그리드 헤드셀 */
export const tcelTabHeadCells: HeadCell[][] = [
  ilgTcelTabOneHC,
  ilgTcelTabTwoHC,
  ...commTabHeadCells,
]

/** 톤급별평균대비초과주유 그리드 헤드셀 */
export const taavelTabHeadCells: HeadCell[][] = [
  ilgTaavelTabOneHC,
  ilgTaavelTabTwoHC,
  ...commTabHeadCells,
]

/** 거리대비 주유시간 이상주유 그리드 헤드셀 */
export const dvhalTabHeadCells: HeadCell[][] = [
  ilgDvhalTabOneHC,
  ilgDvhalTabTwoHC,
  ...commTabHeadCells,
]

/** 유효하지 않은 사업자의 의심주유 그리드 헤드셀 */
export const nblTabHeadCells: HeadCell[][] = [
  ilgNblTabOneHC,
  ilgNblTabTwoHC,
  ...commTabHeadCells,
]

/** 주행거리 기반 주유량 의심주유 그리드 헤드셀 */
export const ddalTabHeadCells: HeadCell[][] = [
  ilgDdalTabOneHC,
  ilgDdalTabTwoHC,
  ...commTabHeadCells,
]

/**
 * 모달 또는 페이지에서 등록, 수정, 삭제 기능 후에
 * 메인페이지의 조회기능을 자동으로 수행하도록 하는 함수
 *
 * @param url 현재 화면의 url
 * @param dispatch useDispatch hook에서 반환되는 객체
 * @returns
 */
export const callRefetch = (url: string, dispatch: AppDispatch) => {
  switch (url) {
    case 'lpav':
      dispatch(setLpavSearchTrue())
      return
    case 'shl':
      dispatch(setShlSearchTrue())
      return
    case 'dmal':
      dispatch(setDmalSearchTrue())
      return
    case 'tcel':
      dispatch(setTcelSearchTrue())
      return
    case 'taavel':
      dispatch(setTaavelSearchTrue())
      return
    case 'dvhal':
      dispatch(setDvhalSearchTrue())
      return
    case 'nbl':
      dispatch(setNblSearchTrue())
      return
    case 'ddal':
      dispatch(setDdalSearchTrue())
      return
    default:
      return
  }
}

/**
 * 메인페이지 조회 후 다른 기능( 등록, 수정, 삭제 ) 종료시 자동 조회 될 수 있도록
 * 페이지별 자동조회 플래그 값을 false로 지정
 * 
 * 각 의심거래 패턴별 화면에 조회 기능을 하는 useEffect 
 * useEffect(() => {
     if (lpavInfo.lpavSearchDone || flag) {
       fetchData()
     }
   }, [lpavInfo.lpavSearchDone, flag])
 * 
 * 
 * @param url 현재 화면의 url
 * @param dispatch useDispatch hook에서 반환되는 객체
 * @returns
 */
export const callRefetchDisable = (url: string, dispatch: AppDispatch) => {
  switch (url) {
    case 'lpav':
      dispatch(setLpavSearchFalse())
      return
    case 'shl':
      dispatch(setShlSearchFalse())
      return
    case 'dmal':
      dispatch(setDmalSearchFalse())
      return
    case 'tcel':
      dispatch(setTcelSearchFalse())
      return
    case 'taavel':
      dispatch(setTaavelSearchFalse())
      return
    case 'dvhal':
      dispatch(setDvhalSearchFalse())
      return
    case 'nbl':
      dispatch(setNblSearchFalse())
      return
    case 'ddal':
      dispatch(setDdalSearchFalse())
      return
    default:
      return
  }
}

/**
 * 모달 또는 페이지에서 등록, 수정, 삭제 기능 후에
 * 페이지별로 지정한 리덕스 변수에 남아있는 값을 초기화 하기 위한 함수
 *
 * @param url
 * @param dispatch
 * @returns
 */
export const commClearReduxData = (url: string, dispatch: AppDispatch) => {
  switch (url) {
    case 'lpav':
      dispatch(clearLpavSelectedData())
      return
    case 'shl':
      dispatch(clearShlSelectedData())
      return
    case 'dmal':
      dispatch(clearDmalSelectedData())
      return
    case 'tcel':
      dispatch(clearTcelSelectedData())
      return
    case 'taavel':
      dispatch(clearTaavelSelectedData())
      return
    case 'dvhal':
      dispatch(clearDvhalSelectedData())
      return
    case 'nbl':
      dispatch(clearNblSelectedData())
      return
    case 'ddal':
      dispatch(clearDdalSelectedData())
      return
    default:
      return
  }
}
export const commSetSelectedData = (
  url: string,
  dispatch: AppDispatch,
  data: any[],
) => {
  switch (url) {
    case 'lpav':
      dispatch(setLpavSelectedData(data))
      return
    case 'shl':
      dispatch(setShlSelectedData(data))
      return
    case 'dmal':
      dispatch(setDmalSelectedData(data))
      return
    case 'tcel':
      dispatch(setTcelSelectedData(data))
      return
    case 'taavel':
      dispatch(setTaavelSelectedData(data))
      return
    case 'dvhal':
      dispatch(setDvhalSelectedData(data))
      return
    case 'nbl':
      dispatch(setNblSelectedData(data))
      return
    case 'ddal':
      dispatch(setDdalSelectedData(data))
      return
    default:
      return
  }
}

export const commSetExamResultData = (
  url: string,
  dispatch: AppDispatch,
  data: any[],
) => {
  switch (url) {
    case 'lpav':
      dispatch(setLpavExamResultData(data))
      return
    case 'shl':
      dispatch(setShlExamResultData(data))
      return
    case 'dmal':
      dispatch(setDmalExamResultData(data))
      return
    case 'tcel':
      dispatch(setTcelExamResultData(data))
      return
    case 'taavel':
      dispatch(setTaavelExamResultData(data))
      return
    case 'dvhal':
      dispatch(setDvhalExamResultData(data))
      return
    case 'nbl':
      dispatch(setNblExamResultData(data))
      return
    case 'ddal':
      dispatch(setDdalExamResultData(data))
      return
    default:
      return
  }
}

export const useIlgSelectors = () => {
  return {
    lpavInfo: useSelector((state: AppState) => state.lpavInfo),
    shlInfo: useSelector((state: AppState) => state.shlInfo),
    dmalInfo: useSelector((state: AppState) => state.dmalInfo),
    tcelInfo: useSelector((state: AppState) => state.tcelInfo),
    taavelInfo: useSelector((state: AppState) => state.taavelInfo),
    dvhalInfo: useSelector((state: AppState) => state.dvhalInfo),
    nblInfo: useSelector((state: AppState) => state.nblInfo),
    ddalInfo: useSelector((state: AppState) => state.ddalInfo),
  }
}

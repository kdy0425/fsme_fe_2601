import { configureStore } from '@reduxjs/toolkit'
import { combineReducers } from 'redux'
import { persistReducer, persistStore } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import CustomizerReducer from './customizer/CustomizerSlice'
import {
  /** 모달 리듀서 */
  CarInfoReducer,
  LocgovInfoReducer,
  VhclTransHstryReducer,
  VhclSpecHstryReducer,
  SetledAprvInfoReducer,
  SetlCardAprvInfoReducer,
  SuccessionInfoReducer,
  PaperDetailAprvInfoReducer,
  RfIdHistoryReducer,
  MainIllegalityReducer,
  SurveyReducer,
  VhclBzmnPrmsnReducer,
  NoticeInfoReducer,
  OilStationInfoReducer,
  DecisionBypeReducer,
  LgovTrfntfReducer,
  ExamResultReducer,
  ExaathrReducer,
  BfdnDspsReducer,
  AdmdspNotieReducer,
  IlgIsdReducer,
  RrnoDecReducer,
  StdTnkReducer,
  IlpBoardReducer,
  PrdvMngSliceReducer,

  /** 페이지 리듀서 */
  IsdReducer,
  LpavReducer,
  ShlReducer,
  DmalReducer,
  TcelReducer,
  TaavelReducer,
  DvhalReducer,
  NblReducer,
  DdalReducer,

  /** 부정수급 - 분석 기간 모달 리듀서 */
  AnlsPrdReducer,

  /** 부정수급방지 모달 리듀서 */
  ExmnOptReducer,
  
  /** 검색 리듀서 */
  SeacrhReducer,
} from './slices'

const persistConfig = {
  key: 'root',
  storage,
}

export const store = configureStore({
  reducer: {
    customizer: persistReducer<any>(persistConfig, CustomizerReducer),
    /** 모달 리듀서 */
    carInfo: CarInfoReducer,
    locgovInfo: LocgovInfoReducer,
    transHstryInfo: VhclTransHstryReducer,
    specHstryInfo: VhclSpecHstryReducer,
    setledAprvInfo: SetledAprvInfoReducer,
    setlCardAprvInfo: SetlCardAprvInfoReducer,
    successionInfo: SuccessionInfoReducer,
    paperDetailAprvInfo: PaperDetailAprvInfoReducer,
    rfIdHistoryInfo: RfIdHistoryReducer,
    mainIlligalityInfo: MainIllegalityReducer,
    surveyInfo: SurveyReducer,
    vhclBzmnPrmsnInfo: VhclBzmnPrmsnReducer,
    noticeInfo: NoticeInfoReducer,
    oilStationInfo: OilStationInfoReducer,
    decisionBypeInfo: DecisionBypeReducer,
    LgovTrfntfInfo: LgovTrfntfReducer,
    ExamResultInfo: ExamResultReducer,
    ExaathrInfo: ExaathrReducer,
    BfdnDspsInfo: BfdnDspsReducer,
    AdmdspNotieInfo: AdmdspNotieReducer,
    IlgIsdInfo: IlgIsdReducer,
    RrnoDecInfo: RrnoDecReducer,
    StdTnkInfo: StdTnkReducer,
    IlpBoard: IlpBoardReducer,
    PrdvMng: PrdvMngSliceReducer,

    /** 페이지 리듀서 */
    lpavInfo: LpavReducer,
    isdInfo: IsdReducer,
    shlInfo: ShlReducer,
    dmalInfo: DmalReducer,
    tcelInfo: TcelReducer,
    taavelInfo: TaavelReducer,
    dvhalInfo: DvhalReducer,
    nblInfo: NblReducer,
    ddalInfo: DdalReducer,

    /** 부정수급 - 분석 기간 모달 리듀서 */
    anlsPrdInfo : AnlsPrdReducer,

    /** 부정수급방지 모달 리듀서 */
    ExmnOptInfo: ExmnOptReducer,

    /** 검색 리듀서 */
    searchCategory: SeacrhReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false, immutableCheck: false }),
})

const rootReducer = combineReducers({
  /** 모달 리듀서 */
  customizer: CustomizerReducer,
  carInfo: CarInfoReducer,
  locgovInfo: LocgovInfoReducer,
  transHstryInfo: VhclTransHstryReducer,
  specHstryInfo: VhclSpecHstryReducer,
  setledAprvInfo: SetledAprvInfoReducer,
  setlCardAprvInfo: SetlCardAprvInfoReducer,
  successionInfo: SuccessionInfoReducer,
  paperDetailAprvInfo: PaperDetailAprvInfoReducer,
  rfIdHistoryInfo: RfIdHistoryReducer,
  mainIlligalityInfo: MainIllegalityReducer,
  surveyInfo: SurveyReducer,
  vhclBzmnPrmsnInfo: VhclBzmnPrmsnReducer,
  noticeInfo: NoticeInfoReducer,
  oilStationInfo: OilStationInfoReducer,
  decisionBypeInfo: DecisionBypeReducer,
  LgovTrfntfInfo: LgovTrfntfReducer,
  ExamResultInfo: ExamResultReducer,
  ExaathrInfo: ExaathrReducer,
  BfdnDspsInfo: BfdnDspsReducer,
  AdmdspNotieInfo: AdmdspNotieReducer,
  IlgIsdInfo: IlgIsdReducer,
  RrnoDecInfo: RrnoDecReducer,
  StdTnkInfo: StdTnkReducer,
  IlpBoard: IlpBoardReducer,
  PrdvMng: PrdvMngSliceReducer,
  
  /** 페이지 리듀서 */
  lpavInfo: LpavReducer,
  isdInfo: IsdReducer,
  shlInfo: ShlReducer,
  dmalInfo: DmalReducer,
  tcelInfo: TcelReducer,
  taavelInfo: TaavelReducer,
  dvhalInfo: DvhalReducer,
  nblInfo: NblReducer,
  ddalInfo: DdalReducer,

  /** 부정수급 - 분석기간 모달 리듀서 */
  anlsPrdInfo: AnlsPrdReducer,

  /** 부정수급방지 모달 리듀서 */
  ExmnOptInfo: ExmnOptReducer,

  /** 검색 리듀서 */
  searchCategory: SeacrhReducer,
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export type AppState = ReturnType<typeof rootReducer>

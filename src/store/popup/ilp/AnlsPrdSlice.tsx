import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface AnlsPrdType {
  anpModalOpen: boolean
  mode: 'date' | 'period'
  showModes: Array<'date' | 'period'>
  selectedVhclNo?: string
  selectedBrno?: string

  // 입력값
  dateYmd?: string
  bgngAprvYmd?: string
  endAprvYmd?: string

  // 분석 결과(페이지 ↔ 모달 동기화)
  analysisMode?: 'date' | 'period'
  analysisDate?: string                  // date 모드
  analysisFrom?: string                  // period 모드
  analysisTo?: string                    // period 모드
  invalidDays?: string[]                 // period 모드에서 유효하지 않은 날짜 리스트 (YYYY-MM-DD)
  invalidReasons: Record<string, string[]>; //미유효사유

  scopeKey?: string | null;              // 추가

  applyFilterTrigger: number

  messageConfig?: {
    noTargetMsg?: string
    invalidInsrMsg?: string
  }
  [key: string]: any
}

export const initialState: AnlsPrdType = {
  anpModalOpen: false,
  mode: 'date',
  showModes: ['date', 'period'],
  dateYmd: '',
  bgngAprvYmd: '',
  endAprvYmd: '',
  analysisMode: undefined,
  analysisDate: '',
  analysisFrom: '',
  analysisTo: '',
  invalidDays: [],
  invalidReasons: {}, 
  scopeKey: null, // 추가
  applyFilterTrigger: 0,
  messageConfig: {},
}

export const AnlsPrdSlice = createSlice({
  name: 'anlsPrdInfo',
  initialState,
  reducers: {
    openAnlsPrdModal: (state, action: PayloadAction<Partial<AnlsPrdType> | undefined>) => {
      state.anpModalOpen = true
      const payload = action.payload || {}
      if (payload.mode) state.mode = payload.mode
      if (payload.showModes) state.showModes = payload.showModes
      //if (payload.selectedVhclNo) state.selectedVhclNo = payload.selectedVhclNo

      state.selectedVhclNo = payload.selectedVhclNo ?? ''
      state.selectedRrno   = payload.selectedRrno ?? ''
      state.selectedBrno   = payload.selectedBrno   ?? ''

      if (payload.scopeKey) state.scopeKey = payload.scopeKey     // ★ scopeKey 세팅

      // ★ 이전 분석 결과 완전 초기화
      state.analysisMode = undefined
      state.analysisDate = ''
      state.analysisFrom = ''
      state.analysisTo = ''
      state.invalidDays = []

    },
    closeAnlsPrdModal: (state) => { state.anpModalOpen = false },

    setAnlsPrdInputs: (state, action: PayloadAction<Partial<Pick<AnlsPrdType, 'mode' | 'dateYmd' | 'bgngAprvYmd' | 'endAprvYmd'>>>) => {
      const { mode, dateYmd, bgngAprvYmd, endAprvYmd } = action.payload
      if (mode) state.mode = mode
      if (dateYmd !== undefined) state.dateYmd = dateYmd
      if (bgngAprvYmd !== undefined) state.bgngAprvYmd = bgngAprvYmd
      if (endAprvYmd !== undefined) state.endAprvYmd = endAprvYmd
    },

    // ✅ 페이지가 사용할 공통 결과 세팅 (date/period 겸용)
    setAnlsPrdResult: (state, action: PayloadAction<
      | { analysisMode: 'date'; selectedVhclNo: string; selectedRrno?: string; selectedBrno?: string; analysisDate: string }
      | { analysisMode: 'period'; selectedVhclNo: string; selectedRrno?: string; selectedBrno?: string ; analysisFrom: string; analysisTo: string }
    >) => {
      //state.selectedVhclNo = action.payload.selectedVhclNo

      // 전달된 식별자만 갱신 (옵션)
      if (action.payload.selectedVhclNo !== undefined) {
        state.selectedVhclNo = action.payload.selectedVhclNo
      }
      if (action.payload.selectedBrno !== undefined) {
        state.selectedBrno = action.payload.selectedBrno
      }

      if (action.payload.analysisMode === 'date') {
        state.analysisMode = 'date'
        state.analysisDate = action.payload.analysisDate
        state.analysisFrom = ''
        state.analysisTo = ''
        state.invalidDays = []
      } else {
        state.analysisMode = 'period'
        state.analysisFrom = action.payload.analysisFrom
        state.analysisTo = action.payload.analysisTo
        state.analysisDate = ''
        state.invalidDays = []
      }
      state.applyFilterTrigger += 1
    },

    // 기간 분석에서 페이지가 계산한 invalidDays를 모달로 반영
    setAnlsInvalidDays: (state, action: PayloadAction<string[]>) => {
      state.invalidDays = action.payload || []
      state.invalidReasons = {}; // 날짜만 갱신됐을 때는 사유 초기화
    },

    // 날짜 + 사유 동시 저장
    setAnlsInvalidSummary(
      state,
      action: PayloadAction<{ invalidDays: string[]; invalidReasons: Record<string, string[]> }>
    ) {
      state.invalidDays = action.payload.invalidDays;
      state.invalidReasons = action.payload.invalidReasons;
    },

    // scopeKey 직접 세팅/초기화용
    setScopeKey: (state, action: PayloadAction<string | null>) => {
      state.scopeKey = action.payload
    },

  },
})

export const {
  openAnlsPrdModal,
  closeAnlsPrdModal,
  setAnlsPrdInputs,
  setAnlsPrdResult,
  setAnlsInvalidDays,
  setAnlsInvalidSummary,
  setScopeKey,          // 추가 export
} = AnlsPrdSlice.actions

export default AnlsPrdSlice.reducer
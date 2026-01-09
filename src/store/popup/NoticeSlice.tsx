import { createSlice } from '@reduxjs/toolkit'

export interface notiModalObj {
  bbsNm: string
  bbscttSn: number
  cn: string
  leadCnNm: string
  relateTaskSeNm: string
  regDt: string
  ttl: string
  fileCount: number
  fileList: Array<notiFile>
}

export interface notiFile {
  bbscttSn: string
  atchSn: string
  physFileNm: string
  lgcFileNm: string
  mdfcnDt: string
  mdfrId: string
  fileSize: string
  regDt: string
  rgtrId: string
}

export interface NoticeInfoStateType {
  notiModalOpen: boolean
  notiModalData: Array<notiModalObj>
  [key: string]: any //인덱스 시그니처
}

export const initialState: NoticeInfoStateType = {
  notiModalOpen: false,
  notiModalData: [],
}

export const NoticeInfoSlice = createSlice({
  name: 'noticeInfo',
  initialState,
  reducers: {
    setNoticeModalData: (state: NoticeInfoStateType, action) => {
      state.notiModalData = action.payload
      return state
    },
    openNoticeModal: (state: NoticeInfoStateType) => {
      state['notiModalOpen'] = true
      return state
    },
    closeNoticeModal: (state: NoticeInfoStateType) => {
      state['notiModalOpen'] = false
      return state
    },
  },
})

export const { openNoticeModal, closeNoticeModal, setNoticeModalData } =
  NoticeInfoSlice.actions
export default NoticeInfoSlice.reducer

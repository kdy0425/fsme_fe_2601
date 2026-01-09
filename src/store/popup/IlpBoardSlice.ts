/* node_modules */
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

/* 게시판 타입 */
import { openType, boardType } from '@/app/(ilp)/_components/board/type'

/* 게시판 정보 */
import { bbsSnObj } from '@/app/(ilp)/_components/board/boardInfo'

type ilpBoardStateType = {
  ilpBoardOpen: boolean
  boardType: boardType
  openType: openType
  bbsSn: string
  bbscttSn: string
}

type actionType = {
  boardType: boardType
  openType: openType
  bbscttSn: string
}

const initialState: ilpBoardStateType = {
  ilpBoardOpen: false,
  boardType: 'NOTICE',
  openType: 'VIEW',
  bbsSn: '',
  bbscttSn: '',
}

export const IlpBoardSlice = createSlice({
  name: 'IlpBoard',
  initialState,
  reducers: {
    handleIlpBoardOpen: (state: ilpBoardStateType, action: PayloadAction<actionType>) => {
      state.ilpBoardOpen = true
      state.boardType = action.payload.boardType
      state.openType = action.payload.openType
      state.bbsSn = bbsSnObj[action.payload.boardType]
      state.bbscttSn = action.payload.bbscttSn
    },
    handleIlpBoardClose: () => initialState,
    changeUpdateType: (state: ilpBoardStateType) => {
      state.openType = 'UPDATE'
    },
  },
})

export const { handleIlpBoardOpen, handleIlpBoardClose, changeUpdateType } = IlpBoardSlice.actions
export default IlpBoardSlice.reducer
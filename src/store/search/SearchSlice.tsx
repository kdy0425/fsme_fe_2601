import { createSlice } from '@reduxjs/toolkit'

export interface SearchCategoryCount {
  noticeTotalCount: number
  refTotalCount: number
  faqTotalCount: number
  qnaTotalCount: number
  complTotalCount: number
  lawTotalCount: number
  workTotalCount: number
  menuTotalCount: number
  retTotalCount: number
}

export const initialState: SearchCategoryCount = {
  noticeTotalCount: 0,
  refTotalCount: 0,
  faqTotalCount: 0,
  qnaTotalCount: 0,
  complTotalCount: 0,
  lawTotalCount: 0,
  workTotalCount: 0,
  menuTotalCount: 0,
  retTotalCount: 0,
}

export const SearchSlice = createSlice({
  name: 'SearchCategoryCount',
  initialState,
  reducers: {
    setSearchCategoryCount: (state: SearchCategoryCount, action) => {
      state = action.payload
      return state
    },
  },
})

export const {
  setSearchCategoryCount,
} = SearchSlice.actions
export default SearchSlice.reducer

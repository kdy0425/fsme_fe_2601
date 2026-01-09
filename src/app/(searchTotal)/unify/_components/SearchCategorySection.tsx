import { isEmpty } from "lodash"
import { useEffect, useRef, useState } from "react"
import { useSelector                 } from "react-redux"
import { useSearchParams, useRouter, usePathname } from "next/navigation"

import { AppState } from "@/store/store"

import { CustomFormLabel, CustomRadio } from "@/utils/fsms/fsm/mui-imports"
import { FormControlLabel, RadioGroup } from "@/utils/fsms/fsm/mui-imports"

import { getCommaNumber          } from "@/utils/fsms/common/util"
import { SearchType, UnifySearch } from "@/types/unify/unify"

const SearchCategorySection = () => {
    const router         = useRouter()
    const pathName       = usePathname()
    const querys         = useSearchParams()
    const searchCategory = useSelector((state: AppState) => state.searchCategory)

    const allParams: UnifySearch = Object.fromEntries(querys.entries()) 

    const [params, setParams] = useState<UnifySearch>({
        searchSort: allParams.searchSort ?? 'DATE'
    })

    const search_category = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if(isEmpty(querys.get("searchWord"))) {
        if(search_category.current) {
          search_category.current.style.border = "none"
          search_category.current.style.padding = "0"
        }
      } else {
        if(search_category.current) {
          search_category.current.style.borderTop = "1px solid #d4d4d4"
          search_category.current.style.padding = "20px 0 20px 0"
        }
      }
      setParams((prev) => ({
        ...prev,
        searchSort: allParams.searchSort ??  'DATE'
      }))
    }, [querys])

    const categoryCountSum =  () => {
        return Object.values(searchCategory).reduce((sum, value) => sum + value, 0);
    }

    const handleSearchSort = (event: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target
      setParams((prev) => ({ ...prev, searchSort: value }))
      const searchParam = new URLSearchParams(allParams as Record<string, string>)
      searchParam.set("searchSort", value)
      router.push(`${pathName}?${searchParam.toString()}`)
    }

    const handleSearchList = (category: string, totalCount: number) => {
      if(totalCount > 0) {
        const searchParam = new URLSearchParams(allParams as Record<string, string>)
        searchParam.set("searchMenu", category)
        searchParam.set("currentPage", "1")
        router.push(`/unify/searchList?${searchParam.toString()}`)
      }
    }

    return (
        <>
          {!isEmpty(allParams.searchWord) &&
          <div className="search-key">
              <>검색어 {params.searchOption} <strong>"{allParams.searchWord?.split("$|").join()}"</strong> 에 대한 전체 <em>"{getCommaNumber(categoryCountSum())}"</em>건의 검색 결과를 찾았습니다.</>
          </div>
          }
          <div className="search-category" ref={search_category}>
            <div className="search-top-align">
              <div className="form-group">
                <CustomFormLabel htmlFor="ft-fname-radio-01" className="input-label-none">label명</CustomFormLabel>
                <RadioGroup row id="ft-fname-radio-01" aria-label="searchSort" name="searchSort" defaultValue="DATE" className="mui-custom-radio-group" onChange={handleSearchSort}>
                  <FormControlLabel
                    value="DATE" 
                    control={<CustomRadio checked={params.searchSort === 'DATE'}/>} 
                    label="날짜순" 
                  />
                  <FormControlLabel
                    value="WEIGHT"
                    control={<CustomRadio checked={params.searchSort === 'WEIGHT'}/>}
                    label="정확도순"
                  />
                </RadioGroup>
              </div>
            </div>
            <dl className="category">
              <dt>전체 <span className="textB">({getCommaNumber(categoryCountSum())})</span></dt>
              <dd>
                <ul className="clfix">
                  <li><a href="#" className={allParams.searchMenu === SearchType.notice ? 'active' : ''} onClick={(e) => {e.preventDefault(); handleSearchList(SearchType.notice, searchCategory.noticeTotalCount)}}>공지사항<span>({getCommaNumber(searchCategory.noticeTotalCount)})</span></a></li>
                  <li><a href="#" className={allParams.searchMenu === SearchType.ref    ? 'active' : ''} onClick={(e) => {e.preventDefault(); handleSearchList(SearchType.ref,    searchCategory.refTotalCount)}}>자료실<span>({getCommaNumber(searchCategory.refTotalCount)})</span></a></li>
                  <li><a href="#" className={allParams.searchMenu === SearchType.faq    ? 'active' : ''} onClick={(e) => {e.preventDefault(); handleSearchList(SearchType.faq,    searchCategory.faqTotalCount)}}>자주하는 질문<span>({getCommaNumber(searchCategory.faqTotalCount)})</span></a></li>
                  <li><a href="#" className={allParams.searchMenu === SearchType.qna    ? 'active' : ''} onClick={(e) => {e.preventDefault(); handleSearchList(SearchType.qna,    searchCategory.qnaTotalCount)}}>Q & A<span>({getCommaNumber(searchCategory.qnaTotalCount)})</span></a></li>
                  <li><a href="#" className={allParams.searchMenu === SearchType.compl  ? 'active' : ''} onClick={(e) => {e.preventDefault(); handleSearchList(SearchType.compl,  searchCategory.complTotalCount)}}>민원처리 사례<span>({getCommaNumber(searchCategory.complTotalCount)})</span></a></li>
                  <li><a href="#" className={allParams.searchMenu === SearchType.law    ? 'active' : ''} onClick={(e) => {e.preventDefault(); handleSearchList(SearchType.law,    searchCategory.lawTotalCount)}}>소송, 심판사례<span>({getCommaNumber(searchCategory.lawTotalCount)})</span></a></li>
                  <li><a href="#" className={allParams.searchMenu === SearchType.work   ? 'active' : ''} onClick={(e) => {e.preventDefault(); handleSearchList(SearchType.work,   searchCategory.workTotalCount)}}>업무요청<span>({getCommaNumber(searchCategory.workTotalCount)})</span></a></li>
                  <li><a href="#" className={allParams.searchMenu === SearchType.menu   ? 'active' : ''} onClick={(e) => {e.preventDefault(); handleSearchList(SearchType.menu,   searchCategory.menuTotalCount)}}>메뉴 검색<span>({getCommaNumber(searchCategory.menuTotalCount)})</span></a></li>
                  <li><a href="#" className={allParams.searchMenu === SearchType.ret    ? 'active' : ''} onClick={(e) => {e.preventDefault(); handleSearchList(SearchType.ret,    searchCategory.retTotalCount)}}>소급요청<span>({getCommaNumber(searchCategory.retTotalCount)})</span></a></li>
                </ul>
              </dd>
            </dl>
          </div>
        </>
    )
}

export default SearchCategorySection
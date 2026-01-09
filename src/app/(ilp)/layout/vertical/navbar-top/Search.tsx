import { isEmpty }        from 'lodash'
import React, { useEffect, useState} from 'react'

import Button from '@mui/material/Button'
import DetailSearch from './DetailSearch'

// components 모듈
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'

import { useRouter, useSearchParams } from 'next/navigation'
import { UnifySearch } from '@/types/unify/unify'

const Search = () => {

  const router = useRouter()

  const querys = useSearchParams() // 쿼리스트링을 가져옴
  const allParams: UnifySearch = Object.fromEntries(querys.entries()) // 쿼리스트링 값을 오브젝트 형식으로 담음
  
  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<UnifySearch>({
      searchWord: allParams.searchWord ?? '', // 검색어
  })

  useEffect(() => {
      setParams((prev) => ({
          ...prev,
          searchWord: allParams.searchWord ?? '',
      }))
  }, [querys])


  const handleSearchWordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setParams((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    handleSearch()
  }

  const handleSearch = () => {
    if(isEmpty(params.searchWord?.trim())) {
      alert("검색어를 입력하세요.")
      return
    }
    router.push(`/unify/searchTotal?searchWord=${encodeURIComponent(params.searchWord+'')}`)
  }   

  return (
          <div className="total-search-wrapper">
            <div className="total-search-inner">
              <form onSubmit={handleSubmit}>
                <div className="input-group">
                  <CustomFormLabel
                    htmlFor="searchWord"
                    className="input-label-none"
                  >
                    label명
                  </CustomFormLabel>
                  <CustomTextField
                    id="searchWord"
                    name="searchWord"
                    value={params.searchWord || ""} 
                    className="form-control total-search-bar"
                    placeholder="검색어를 입력하세요."
                    autoComplete="off"
                    onChange={handleSearchWordChange}
                  />
                  <span className="input-group-btn">
                    <Button
                      variant="contained"
                      color="primary"
                      className="btn search-btn"
                      title="검색어 버튼"
                      onClick={handleSearch}
                    ></Button>
                  </span>
                </div>
              </form>
              {/* 상세검색 */}
              <DetailSearch />
            </div>
          </div>
  )
}

export default Search

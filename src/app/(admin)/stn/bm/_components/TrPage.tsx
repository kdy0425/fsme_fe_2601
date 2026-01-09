'use client'
import {
  Box,
  Button,
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControlLabel,
} from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useCallback, useEffect, useState } from 'react'

import PageContainer from '@/components/container/PageContainer'
import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'

// utils
import { sendHttpFileRequest, sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { toQueryString } from '@/utils/fsms/utils'

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'

import TableDataGrid from '@/app/components/tables/CommDataGrid2'

// types
import { listParamObj } from '@/types/fsms/fsm/listParamObj'
import { HeadCell,  Pageable2  } from 'table'
import { getCtpvCd, getCommCd, getLocGovCd, getDateRange, isValidDateRange, sortChange, getExcelFile, getToday} from '@/utils/fsms/common/comm'
import { SelectItem } from 'select'
import TrDetail from './TrDetail'

import CustomCheckbox from '@/app/components/forms/theme-elements/CustomCheckbox'
import TrModifyModal from './TrModifyModal'
import {stnBmBsnesMngTrHc} from '@/utils/fsms/headCells'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import { isNumber } from "@/utils/fsms/common/comm"

export interface Row {
  vhclNo?: string;            // 차량번호
  brno?: string;              // 법인등록번호
  vonrRrno?: string;          // 주민등록번호
  chk?: string;               // 일인다수 타 차량 조회
  crno?: string;              // 법인등록번호(암호화)
  crnoSecure?: string;             // 법인등록번호(복호화)
  bzmnSeCd?: string;          // 사업자구분코드
  crnoEncpt?: string;         // 법인등록번호암호화(암호화)
  crnoEncptS?: string;        // 법인등록번호암호화(복호화)
  rprsvRrno?: string;         // 대표자주민번호(암호화)
  rprsvRrnoS?: string;        // 대표자주민번호(복호화)
  rprsvRrnoSecure?: string;        // 대표자주민번호(복호화)
  bzentyNm?: string;          // 업체명
  rprsvNm?: string;           // 대표자명
  zip?: string;               // 우편번호
  part1Addr?: string;         // 부분1주소
  part2Addr?: string;         // 부분2주소
  telno?: string;             // 전화번호
  rgtrId?: string;            // 등록자아이디
  regDt?: string;             // 등록일시
  mdfrId?: string;            // 수정자아이디
  mdfcnDt?: string;           // 수정일시
  souSourcSeCd?: string;      // 원천소스구분코드
  locgovAprvYn?: string;      // 지자체승인여부
  locgovAprvYnNm?: string;    // 지자체승인여부명
  delYn?: string;             // 삭제여부
  bzmnPrmsnYmd?: string;      // 사업자허가일자
  bossNm?: string;            // 대표자명 (중복 포함되지 않음)

}

// 목록 조회시 필요한 조건
type listSearchObj = {
  page: number
  size: number
  searchValue: string
  searchSelect: string
  searchStDate: string
  searchEdDate: string
  //ctpvCd: number
  //locgovCd: number
  [key: string]: string | number // 인덱스 시그니처 추가
}


const TrPage = () => {
  const router = useRouter() // 화면이동을 위한객체
  const querys = useSearchParams() // 쿼리스트링을 가져옴
  const allParams: listParamObj = Object.fromEntries(querys.entries()) // 쿼리스트링 값을 오브젝트 형식으로 담음

  const [flag, setFlag] = useState<boolean | null>(null) // 데이터 갱신을 위한 플래그 설정
  const [dtFlag, setDtFlag] = useState<boolean>(false) // 전체날짜조회를 위한 플래그
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부
  const [selectedRow, setSelectedRow] = useState<Row | null>() // 클릭로우
  const [chk, setChk] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [excelFlag, setExcelFlag] = useState<boolean>(false);
  const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 로딩상태
  

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    // page: 1, // 페이지 번호는 1부터 시작
    // size: 10, // 기본 페이지 사이즈 설정
    page: Number(allParams.page ?? 1), // 페이지 번호는 1부터 시작
    size: Number(allParams.size ?? 10), // 기본 페이지 사이즈 설정
    searchValue: allParams.searchValue ?? '', // 검색어
    searchSelect: allParams.searchSelect ?? 'ttl', // 종류
    searchStDate: allParams.searchStDate ?? '', // 시작일
    searchEdDate: allParams.searchEdDate ?? '', // 종료일
  })

  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1,
  })



  useEffect(()=>{
    if(flag != null){
      if(params.crno || params.vonrRrno || params.vhclNo){
        fetchData()
      }
    }
  },[flag])

  useEffect(() => {
    if(chk) {
      setParams((prev) => ({...prev, chk: "01"}))
    }else {
      setParams((prev) => ({...prev, chk: ""}))
    }
  }, [chk])

  useEffect(() => {
    //첫행조회
    if (rows.length > 0) {
      handleRowClick(rows[0], 0)
    }
  }, [rows])


  const [qString, setQString] = useState<string>('')

  // 검색 조건이 변경되면 자동으로 쿼리스트링 변경
  useEffect(() => {
    setQString(toQueryString(params))
  }, [params])

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {


    // if(!params.crno && !params.vonrRrno && !params.vhclNo) {
    //   alert("검색조건으로 사업자(법인)번호, 주민등록번호, \n차량번호 중 1개이상은 입력해야 합니다.");
    //   return;
    // }
    
    
    setLoading(true);
    setSelectedIndex(-1);
    setSelectedRow(undefined);


    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/stn/bm/tr/getAllBsnesMng?page=${params.page}&size=${params.size}` +
        `${params.crno ? '&crno=' + params.crno : ''}`+
        `${params.vonrRrno ? '&vonrRrno=' + params.vonrRrno : ''}` +
        `${params.chk ? '&chk=' + params.chk : ''}` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` 
        
      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        setSelectedIndex(-1)
        setSelectedRow(undefined);
        setRows(response.data.content)
        setTotalRows(response.data.totalElements)
        setPageable({
          pageNumber : response.data.pageable.pageNumber+1,
          pageSize: response.data.pageable.pageSize,
          totalPages: response.data.totalPages,
        })
        setExcelFlag(true)
      } else {
        // 데이터가 없거나 실패
        setRows([])
        setTotalRows(0)
        setSelectedRow(undefined);
        setSelectedIndex(-1)
        setPageable({
          pageNumber: 1,
          pageSize: 10,
          totalPages: 1,
        })
      }
    } catch (error) {
      // 에러시
      setRows([])
      setTotalRows(0)
      setSelectedRow(undefined);
      setSelectedIndex(-1)
      setPageable({
        pageNumber: 1,
        pageSize: 10,
        totalPages: 1,
      })
    } finally {
      setLoading(false)
    }
  }

  const excelDownload = async () => {


    if(rows.length == 0){
      alert('엑셀파일을 다운로드할 데이터가 없습니다.')
      return;
    }

    if(!excelFlag){
      alert('조회조건이 변경되었습니다. 검색 후 다운로드가 가능합니다.')
      return
    }

	try{
	      setLoadingBackdrop(true)
	      let endpoint: string =
	      `/fsm/stn/bm/tr/getExcelBsnesMng?page=${params.page}&size=${params.size}` +
	          `${params.crno ? '&crno=' + params.crno : ''}`+
	          `${params.vonrRrno ? '&vonrRrno=' + params.vonrRrno : ''}` +
	          `${params.chk ? '&chk=' + params.chk : ''}` +
	          `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` 

	      await getExcelFile(endpoint, '화물 사업자관리_'+getToday()+'.xlsx')
	    }catch(error){
	      console.error("ERROR :: ", error)
	    }finally{
	      setLoadingBackdrop(false)
	    }
  }

  // 페이지 이동 감지 시작 //
  // 검색시 검색 조건에 맞는 데이터 갱신 및 1페이지로 이동
  const handleAdvancedSearch = (event: React.FormEvent) => {
    event.preventDefault()
    if(!params.crno && !params.vonrRrno && !params.vhclNo){
      alert('검색조건으로 법인등록번호, 주민등록번호\n차량번호 중 1개이상은 입력해야 합니다.')
      return
    }
    setParams((prev) => ({ ...prev, page: 1 ,size : 10 })) // 첫 페이지로 이동
    setFlag((prev) => !prev)
  }

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handlePaginationModelChange = useCallback(
    (page: number, pageSize: number) => {
      setParams((prev) => ({
        ...prev,
        page: page,
        size: pageSize,
      }))
      setFlag((prev) => !prev)
    },
    [],
  )



  const handleRowClick = useCallback((row: Row , rowIndex?: number, colIndex?: number) => {
    setSelectedRow(row)
    setSelectedIndex(rowIndex ?? -1);
  }, [])


  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    const regex = /[~`!@#$%^&*()_\-+={}[\]|\\:;"'<>,.?/]/g
    if(name == 'vonrRrno' || name == 'crno'){
      if(isNumber(value)){
        setParams(prev => ({ ...prev, [name]: value }));    
      }
    }else{
      setParams(prev => ({ ...prev, [name]: value.replaceAll(regex,'').replaceAll(' ','') }));    
    }

    setExcelFlag(false)
  }

  
  const handleReload = () => {
    setSelectedRow(undefined)
    setParams((prev) => ({ ...prev, page: 1, size:10 })) // 첫 페이지로 이동
    setFlag((prev) => !prev)
  }

  // const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
  //   if (event.key === 'Enter') {
  //     fetchData()
  //   }
  // }

  return (
    <Box>
      <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
        <Box className="sch-filter-box">
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor="ft-crno">
              <span className="required-text">*</span>법인등록번호
              </CustomFormLabel>
              <CustomTextField type='text' id="ft-crno" name="crno" value={params.crno ?? ""} onChange={handleSearchChange} fullWidth 
              inputProps={{
                maxLength:13
              }}
              />
            </div>

            <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor="ft-vonrRrno">
              <span className="required-text">*</span>주민등록번호
              </CustomFormLabel>
              <CustomTextField type='text' id="ft-vonrRrno" name="vonrRrno" value={params.vonrRrno ?? ""} onChange={handleSearchChange}  fullWidth 
              inputProps={{
                maxLength:13
              }}
              />
            </div>
            <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor="ft-vhclNo">
              <span className="required-text">*</span>차량번호
              </CustomFormLabel>
              <CustomTextField id="ft-vhclNo" name="vhclNo" 
              value={params.vhclNo ?? ""} onChange={handleSearchChange} fullWidth 
              inputProps={{
                maxLength:9
              }} />
            </div>
            <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor="ft-chk">
              일인다수 타 차량 조회
              </CustomFormLabel>
              <CustomCheckbox id="ft-chk" name="chk" 
              disabled={ params.vhclNo === '' || !params.vhclNo}
              value={params.chk} onChange={() => setChk(!chk)}
              />
            </div>
          </div>
        </Box>
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
		  <LoadingBackdrop open={loadingBackdrop} />
            <Button type="submit" variant="contained" color="primary">
              검색
            </Button>
            {selectedRow && 

            <TrModifyModal  
              data={selectedRow as Row} 
              buttonLabel={'수정'} 
              reloadFunc={handleReload}
              title={'사업자정보 변경'} 
            />
            }  
            <Button onClick={() => excelDownload()} variant="contained"
              color="success">
              엑셀
            </Button>
          </div>
        </Box>
      </Box>
      {/* 검색영역 끝 */}

      {/* 테이블영역 시작 */}
      <Box>
        <TableDataGrid
          headCells={stnBmBsnesMngTrHc} // 테이블 헤더 값
          rows={rows} // 목록 데이터
          totalRows={totalRows} // 총 로우 수
          loading={loading} // 로딩여부
          onRowClick={handleRowClick} // 행 클릭 핸들러 추가
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          pageable={pageable} // 현재 페이지 / 사이즈 정보
          paging={false}
          cursor={true}
          selectedRowIndex={selectedIndex}
          caption={"화물 사업자관리 목록 조회"}
        />
      </Box>
      {/* 테이블영역 끝 */}
      {selectedRow &&
        <>
          <TrDetail data={selectedRow} />
        </>
      }
    </Box>
  )
}

export default TrPage

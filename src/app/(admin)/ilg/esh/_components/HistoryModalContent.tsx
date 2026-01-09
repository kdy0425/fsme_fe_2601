'use client'
import {
  Box
} from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

// utils
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'

// types
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { listParamObj } from '@/types/fsms/fsm/listParamObj'
import { HeadCell, Pageable2 } from 'table'

const headCells: HeadCell[] = [
  {
    id: 'vhclNo',
    numeric: false,
    disablePadding: false,
    label: '차량번호',
  },
  {
    id: 'bgngYmd',
    numeric: false,
    disablePadding: false,
    label: '지급정지 시작일',
    format: 'yyyymmdd'
  },
  {
    id: 'endYmd',
    numeric: false,
    disablePadding: false,
    label: '지급정지 종료일',
    format: 'yyyymmdd'
  },
  {
    id: 'regDt',
    numeric: false,
    disablePadding: false,
    label: '등록일',
    format: 'yyyymmdd'
  },
  {
    id: 'localNm',
    numeric: false,
    disablePadding: false,
    label: '등록관할관청',
  },
]

export interface Row {
  hstrySn: string;
  transNm: string;
  brno: string;
  vhclNo: string;
  locgovCd: string;
  locgovNm: string;
  koiCd: string;
  koiNm: string;
  rprsvNm: string;
  rprsvRrno: string;
  delYn: string;
  delNm: string;
  dscntYn: string;
  souSourcSeCd: string;
  rfidYn: string;
  bscInfoChgYn: string;
  locgovAprvYn: string;
  stopBgngYmd: string;
  stopEndYmd: string;
  stopRsnCn: string;
  cardNo: string;
  crno: string;
  cardNm: string;
  rgtrId: string;
  regDt: string;
  mdfrId: string;
  mdfcnDt: string;
  vonrRrno: string;
  vonrRrnoSecure: string;
  crnoS: string;
  vonrBrno: string;
  vonrNm: string;
  vhclPsnCd: string;
  vonrRrnoS: string;
  vhclTonCd: string;
  vhclTonNm: string;
  bgngYmd: string;
  endYmd: string;
  chgSeCd: string;
  chgRsnCn: string;
  trsmYn: string;
  trsmDt: string;
  localNm: string;
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  sort: string
  page: number
  size: number
  searchValue: string
  searchSelect: string
  searchStDate: string
  searchEdDate: string
  [key: string]: string | number // 인덱스 시그니처 추가
}

interface ModalProps {
  vhclNo: string
} 

const HistoryModalContent = (props: ModalProps) => {
  const {vhclNo} = props
  const querys = useSearchParams() // 쿼리스트링을 가져옴
  const allParams: listParamObj = Object.fromEntries(querys.entries()) // 쿼리스트링 값을 오브젝트 형식으로 담음

  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: Number(allParams.page ?? 1), // 페이지 번호는 1부터 시작
    size: Number(allParams.size ?? 10), // 기본 페이지 사이즈 설정
    searchValue: allParams.searchValue ?? '', // 검색어
    searchSelect: allParams.searchSelect ?? 'ttl', // 종류
    searchStDate: allParams.searchStDate ?? '', // 시작일
    searchEdDate: allParams.searchEdDate ?? '', // 종료일
    sort: allParams.sort ?? '', // 정렬 기준 추가
  })

  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1,
  })

  useEffect(() => {
    if(vhclNo) {
      fetchData()
    }
  }, [vhclNo])

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    setLoading(true)
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/ilg/ssp/tr/getAllSbsidyStopPymntHst?page=${params.page}&size=${params.size}` +
        `${vhclNo ? '&' + '&vhclNo=' + vhclNo : ''}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        setRows(response.data.content)
        setTotalRows(response.data.totalElements)
        setPageable({
          pageNumber: response.data.pageable.pageNumber + 1,
          pageSize: response.data.pageable.pageSize,
          totalPages: response.data.totalPages,
        })
      } else {
        // 데이터가 없거나 실패
        setRows([])
        setTotalRows(0)
        setPageable({
          pageNumber: 1,
          pageSize: 10,
          totalPages: 1,
        })
      }
    } catch (error) {
      // 에러시
      console.error('Error fetching data:', error)
      setRows([])
      setTotalRows(0)
      setPageable({
        pageNumber: 1,
        pageSize: 10,
        totalPages: 1,
      })
    } finally {
      setLoading(false)
    }
  }

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handlePaginationModelChange = (page: number, pageSize: number) => {
    setParams((prev) => ({
      ...prev,
      page: page, // 실제 DB에서 조회시 -1을 하므로 +1 추가해서 넘겨야함. 페이지는 1로 보이지만 DB에선 0으로 조회
      size: pageSize,
    }))
    setFlag(!flag)
  }

  return (
      <Box>
        <TableDataGrid
          headCells={headCells} // 테이블 헤더 값
          rows={rows} // 목록 데이터
          totalRows={totalRows} // 총 로우 수
          loading={loading} // 로딩여부
          onRowClick={() => {}} // 행 클릭 핸들러 추가
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          pageable={pageable} // 현재 페이지 / 사이즈 정보
        />
      </Box>
  )
}

export default HistoryModalContent

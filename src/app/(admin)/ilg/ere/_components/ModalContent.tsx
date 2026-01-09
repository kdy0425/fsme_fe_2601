import { Box } from '@mui/material'
import React from 'react'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { ligErePopupHC } from '@/utils/fsms/headCells'

export interface ModalRow {
  exmnNo: string
  locgovCd: string
  locgovNm: string
  vhclNo: string
  vonrNm: string
  sn: number
  seqNo: number
  vonrBrno: string
  crtrLimLiter: number
  crtrLiter: number
  aprvYmd: string
  aprvTm: string
  aprvAmt: number
  useLiter: number
  asstAmtLiter: number
  asstAmt: number
  trgtAsstAmt: number
  cardSeNm: string
  vhclTonNm: string
  frcsCdNo: string
  frcsNm: string
  frcsBrno: string
  cardSeCd: string
  vhclTonCd: string
  crdcoCd: string
  crdcoNm: string
  frcsZip: string
  frcsAddr: string
}

type SearchParams = {
  page: 1 // 페이지 번호는 1부터 시작
  size: 10 // 기본 페이지 사이즈 설정
  exmnNo: string
  vhclNo: string
  locgovCd: string
  dwNo: string
}

interface ModalProperties {
  rows: ModalRow[]
  // params: SearchParams
}

const ModalContent = (props: ModalProperties) => {
  const { rows } = props

  // const fetchData = async () => {
  //   setLoading(true)
  //   try {
  //     // 검색 조건에 맞는 endpoint 생성
  //     let endpoint: string =
  //       `/fsm/ilg/ere/tr/getAllExamResExaathr?page=${params.page}&size=${params.size}` +
  //       `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
  //       `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
  //       `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
  //       `${params.dwNo ? '&dwNo=' + params.dwNo : ''}` +
  //       `${params.admsCd ? '&admsCd=' + params.admsCd : ''}` +
  //       `${params.searchStDate ? '&bgngAprvYm=' + params.searchStDate.replaceAll('-', '') : ''}` +
  //       `${params.searchEdDate ? '&endAprvYm=' + params.searchEdDate.replaceAll('-', '') : ''}`

  //     const response = await sendHttpRequest('GET', endpoint, null, true, {
  //       cache: 'no-store',
  //     })
  //     if (response && response.resultType === 'success' && response.data) {
  //       // 데이터 조회 성공시
  //       setRows(response.data.content)
  //       setTotalRows(response.data.totalElements)
  //       setPageable({
  //         pageNumber: response.data.pageable.pageNumber + 1,
  //         pageSize: response.data.pageable.pageSize,
  //         totalPages: response.data.totalPages,
  //       })
  //     } else {
  //       // 데이터가 없거나 실패
  //       setRows([])
  //       setTotalRows(0)
  //       setPageable({
  //         pageNumber: 1,
  //         pageSize: 10,
  //         totalPages: 1,
  //       })
  //     }
  //   } catch (error) {
  //     // 에러시
  //     console.error('Error fetching data:', error)
  //     setRows([])
  //     setTotalRows(0)
  //     setPageable({
  //       pageNumber: 1,
  //       pageSize: 10,
  //       totalPages: 1,
  //     })
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  return (
    <Box>
      <TableDataGrid headCells={ligErePopupHC} rows={rows} loading={false} />
    </Box>
  )
}

export default ModalContent

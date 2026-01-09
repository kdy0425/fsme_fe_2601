import {
  BlankCard,
  CustomFormLabel,
  CustomRadio,
  CustomSelect,
  CustomTextField,
} from '@/utils/fsms/fsm/mui-imports'
import { Box, Button, Dialog, DialogContent } from '@mui/material'
import React, { useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { HeadCell, Pageable2 } from 'table'

import StJeDayoffJudDetailModal from './StJeDayoffJudDetailModal'
import { IconSearch } from '@tabler/icons-react'

export interface Row {
  vhclNo?: string // 차량번호
  lastPrcsDtlDt?: string // 변경일
  aplySeNm?: string // 변경구분
  vin?: string // 차대번호
  rntlVhclNm?: string // 대차구분
  vhclStleNm?: string // 차종
  vhclNm?: string // 차명
  koiNm?: string | null // 유종
  usgDtlSeNm?: string // 차량구분
  hstrySn?: string // 순번
  vonrNm?: string // 소유자명
  vonrRrno?: string // 주민등록번호(암호화)
  vonrRrnoSe?: string // 주민등록번호(부분복호화)
  chgRsnCn?: string // 이력사항
  bgngYmd?: string // 정지시작일
  endYmd?: string // 정지종료일
  bfrVhclNo?: string // 이전차량번호
  exsLocgovCd?: string // 이전관할관청코드
  exsLocgovNm?: string // 이전관할관청
  aplcnYmd?: string // 변경일
  chgLocgovNm?: string // 변경후관할관청
  regDt?: string // 등록일
  chgSeCd?: string // 구분코드
  chgSeNm?: string // 구분
  vonrBrno?: string | null // 사업자등록번호
  locgovNm?: string // 관할관청
  bfchgVhclTonNm?: string // 이전톤수
  bfchgKoiNm?: string // 이전유종
  aftchVhclTonNm?: string // 변경후톤수
  aftchKoiNm?: string // 변경후유종
  chgRsnNm?: string // 구분
  exsVonrNm?: string // 이전소유자명
  exsVonrBrno?: string // 이전사업자등록번호
  exsVonrRrno?: string // 이전주민등록번호(암호화)
  exsVonrRrnoSe?: string // 이전주민등록번호(부분복호화)
  vhclPsnNm?: string // 소유구분명
  vhclTonNm?: string // 톤수명
  tnkCpcty?: string // 탱크용량
  dcNm?: string // 할인여부
  vhclSttsCd?: string // 차량상태코드
  vhclSttsNm?: string // 차량상태명
  seqNo?: number // 일련번호
  exmnNo?: string // 연번
  locgovCd?: string // 지자체명코드
  crtrLiter?: number // 기준리터
  aprvYmd?: string // 거래승인일
  rgtrId?: string
  mdfrId?: string
  mdfcnDt?: string
}

//1.차량번호
const headCells1: HeadCell[] = [
  {
    id: 'locgovNm',
    numeric: false,
    disablePadding: false,
    label: '관할관청',
  },
  {
    id: 'vhclNo',
    numeric: false,
    disablePadding: false,
    label: '차량번호',
  },
  {
    id: 'vonrNm',
    numeric: false,
    disablePadding: false,
    label: '소유자명',
  },
  {
    id: 'vhclPsnNm',
    numeric: false,
    disablePadding: false,
    label: '소유구분',
  },
  {
    id: 'vonrBrno',
    numeric: false,
    disablePadding: false,
    label: '사업자등록번호',
    format: 'brno',
  },
  {
    id: 'vonrRrnoSe',
    numeric: false,
    disablePadding: false,
    label: '주민등록번호',
    format: 'rrno',
  },
  {
    id: 'vhclTonNm',
    numeric: false,
    disablePadding: false,
    label: '톤수',
  },
  {
    id: 'koiNm',
    numeric: false,
    disablePadding: false,
    label: '유종',
  },
  {
    id: 'tnkCpcty',
    numeric: false,
    disablePadding: false,
    label: '탱크용량',
  },
  {
    id: 'dcNm',
    numeric: false,
    disablePadding: false,
    label: '할인상태',
  },
  {
    id: 'vhclSttsNm',
    numeric: false,
    disablePadding: false,
    label: '차량상태',
  },
]

//2.차량소유자 변경이력
const headCells2: HeadCell[] = [
  {
    id: 'aplcnYmd',
    numeric: false,
    disablePadding: false,
    label: '변경일',
    format: 'yyyymmdd',
  },
  {
    id: 'chgRsnNm',
    numeric: false,
    disablePadding: false,
    label: '구분',
  },
  {
    id: 'exsVonrNm',
    numeric: false,
    disablePadding: false,
    label: '이전소유자명',
  },
  {
    id: 'exsVonrBrno',
    numeric: false,
    disablePadding: false,
    label: '이전사업자등록번호',
    format: 'brno',
  },
  {
    id: 'exsVonrRrnoSe',
    numeric: false,
    disablePadding: false,
    label: '이전주민등록번호',
    format: 'rrno',
  },
]

//3.차량제원 변경이력
const headCells3: HeadCell[] = [
  {
    id: 'aplcnYmd',
    numeric: false,
    disablePadding: false,
    label: '변경일',
    format: 'yyyymmdd',
  },
  {
    id: 'bfchgVhclTonNm',
    numeric: false,
    disablePadding: false,
    label: '이전톤수',
  },
  {
    id: 'bfchgKoiNm',
    numeric: false,
    disablePadding: false,
    label: '이전유종',
  },
  {
    id: 'aftchVhclTonNm',
    numeric: false,
    disablePadding: false,
    label: '변경후톤수',
  },
  {
    id: 'aftchKoiNm',
    numeric: false,
    disablePadding: false,
    label: '변경후유종',
  },
]

//5. 지자체 변경이력
const headCells5: HeadCell[] = [
  {
    id: 'aplcnYmd',
    numeric: false,
    disablePadding: false,
    label: '변경일',
    format: 'yyyymmdd',
  },
  {
    id: 'exsLocgovNm',
    numeric: false,
    disablePadding: false,
    label: '이전관할관청',
  },
  {
    id: 'chgLocgovNm',
    numeric: false,
    disablePadding: false,
    label: '변경후관할관청',
  },
]

//6. 행정처분 승계이력
const headCells6: HeadCell[] = [
  {
    id: 'vhclNo',
    numeric: false,
    disablePadding: false,
    label: '차량번호',
  },
  {
    id: 'vonrNm',
    numeric: false,
    disablePadding: false,
    label: '소유자명',
  },
  {
    id: 'vonrRrnoSe',
    numeric: false,
    disablePadding: false,
    label: '주민등록번호',
    format: 'rrno'
  },
  {
    id: 'vonrBrno',
    numeric: false,
    disablePadding: false,
    label: '사업자등록번호',
    format: 'brno',
  },
  {
    id: 'chgRsnCn',
    numeric: false,
    disablePadding: false,
    label: '이력사항',
  },
  {
    id: 'bgngYmd',
    numeric: false,
    disablePadding: false,
    label: '정지시작일',
    format: 'yyyymmdd',
  },
  {
    id: 'endYmd',
    numeric: false,
    disablePadding: false,
    label: '정지종료일',
    format: 'yyyymmdd',
  },
  {
    id: 'bfrVhclNo',
    numeric: false,
    disablePadding: false,
    label: '이전차량번호',
  },
  {
    id: 'exsLocgovNm',
    numeric: false,
    disablePadding: false,
    label: '이전관할관청',
  },
]

//7. 자동차관리정보시스템 변경이력
const headCells7: HeadCell[] = [
  {
    id: 'lastPrcsDtlDt',
    numeric: false,
    disablePadding: false,
    label: '변경일',
    format: 'yyyymmdd',
  },
  {
    id: 'aplySeNm',
    numeric: false,
    disablePadding: false,
    label: '변경구분',
  },
  {
    id: 'vin',
    numeric: false,
    disablePadding: false,
    label: '차대번호',
  },
  {
    id: 'vhclNo',
    numeric: false,
    disablePadding: false,
    label: '차량번호',
  },
  {
    id: 'rntlVhclNm',
    numeric: false,
    disablePadding: false,
    label: '대차구분',
  },
  {
    id: 'vhclStleNm',
    numeric: false,
    disablePadding: false,
    label: '차종',
  },
  {
    id: 'vhclNm',
    numeric: false,
    disablePadding: false,
    label: '차명',
  },
  {
    id: 'koiNm',
    numeric: false,
    disablePadding: false,
    label: '유종',
  },
  {
    id: 'usgDtlSeNm',
    numeric: false,
    disablePadding: false,
    label: '차량구분',
  },
]

interface TxSubHisModalProps {
  propsSearchVhclNo?: string
  open: boolean
  onCloseClick: () => void
}
export const CarNumberSearchModal = (props: TxSubHisModalProps) => {
  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정

  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터

  // 가져온 데이터 초기화
  const [carDispScsHist, setCarDispScsHist] = useState<Row[]>([]) // 차량 말소 이력
  const [carGiveStpHist, setCarGiveStpHist] = useState<Row[]>([]) // 차량 양도 정지 이력
  const [carInfo, setCarInfo] = useState<Row[]>([]) // 차량 정보
  const [carNtwkChgHist, setCarNtwkChgHist] = useState<Row[]>([]) // 차량 네트워크 변경 이력
  const [carOwnrChgHist, setCarOwnrChgHist] = useState<Row[]>([]) // 차량 소유자 변경 이력
  const [carSidoChgHist, setCarSidoChgHist] = useState<Row[]>([]) // 차량 시도 변경 이력
  const [carSpecChgHist, setCarSpecChgHist] = useState<Row[]>([]) // 차량 사양 변경 이력

  const [selectedRow, setSelectedRow] = useState<Row>()

  const [loading, setLoading] = useState(false) // 로딩여부

  const [searchVhclno, setSearchVhclno] = useState<string>('')

  const { propsSearchVhclNo, open, onCloseClick } = props

  const [openStJeDayoffJudDetailModal, setOpenStJeDayoffJudDetailModal] =
    useState<boolean>(false)

  //4. 지급정지/거절/휴지/처분유예 내역
  const headCells4: HeadCell[] = [
    {
      id: 'Detail',
      numeric: false,
      disablePadding: false,
      label: '상세',
      format: 'button',
      button: {
        label: <IconSearch size={18} />,
        color: 'primary', // 버튼 색상
        onClick: (row: Row) => {
          let vhclNo = propsSearchVhclNo ? propsSearchVhclNo : searchVhclno

          setSelectedRow({ ...row, vhclNo: vhclNo })
          setOpenStJeDayoffJudDetailModal(true)
        },
      },
    },
    {
      id: 'regDt',
      numeric: false,
      disablePadding: false,
      label: '등록일',
      format: 'yyyymmdd',
    },
    {
      id: 'chgSeNm',
      numeric: false,
      disablePadding: false,
      label: '구분',
    },
    {
      id: 'vonrNm',
      numeric: false,
      disablePadding: false,
      label: '소유자명',
    },
    {
      id: 'vonrBrno',
      numeric: false,
      disablePadding: false,
      label: '사업자등록번호',
      format: 'brno',
    },
    {
      id: 'locgovNm',
      numeric: false,
      disablePadding: false,
      label: '관할관청',
    },
    {
      id: 'bgngYmd',
      numeric: false,
      disablePadding: false,
      label: '시작일',
      format: 'yyyymmdd',
    },
    {
      id: 'endYmd',
      numeric: false,
      disablePadding: false,
      label: '종료일',
      format: 'yyyymmdd',
    },
  ]

  useEffect(() => {
    setRows([])
    if (open == true) setFlag((prev) => !prev)
  }, [open])

  useEffect(() => {
    if (!propsSearchVhclNo && (searchVhclno == '' || !searchVhclno)) {
      return
    }
    fetchData()
  }, [flag])

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    // console.log(propsSearchVhclNo)
    if (!propsSearchVhclNo && (searchVhclno == '' || !searchVhclno)) {
      alert('차량번호를 입력해주세요')
      return
    }
    setLoading(true)
    try {
      //fsm/stn/vm/tx/getDayoffHisTx
      let endpoint: string =
        `/fsm/cmm/cmmn/cp/getAllCarInfo?` +
        `${propsSearchVhclNo ? '&vhclNo=' + propsSearchVhclNo : ''}` +
        `${searchVhclno ? '&vhclNo=' + searchVhclno : ''}`

      let no = propsSearchVhclNo ? propsSearchVhclNo : searchVhclno

      //   console.log('차량조회', endpoint)
      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        // console.log(response.data)
        // setRows(response.data)

        // carDispScsHist// 차량 말소 이력
        // carGiveStpHist// 차량 양도 정지 이력
        // carInfo// 차량 정보
        // carNtwkChgHist// 차량 네트워크 변경 이력
        // carOwnrChgHist // 차량 소유자 변경 이력
        // carSidoChgHist// 차량 시도 변경 이력
        // carSpecChgHist// 차량 사양 변경 이력

        setCarDispScsHist(response.data.carDispScsHist)
        setCarGiveStpHist(response.data.carGiveStpHist)
        // carInfo는 값이 없을 경우 null로 넘어와서 빈배열로 처리
        setCarInfo(response.data.carInfo ? [response.data.carInfo] : [])
        setCarNtwkChgHist(response.data.carNtwkChgHist)
        setCarOwnrChgHist(response.data.carOwnrChgHist)
        setCarSidoChgHist(response.data.carSidoChgHist)
        setCarSpecChgHist(response.data.carSpecChgHist)
      } else {
        // 데이터가 없거나 실패
        setCarDispScsHist([])
        setCarGiveStpHist([])
        setCarInfo([])
        setCarNtwkChgHist([])
        setCarOwnrChgHist([])
        setCarSidoChgHist([])
        setCarSpecChgHist([])
      }
    } catch (error) {
      setCarDispScsHist([])
      setCarGiveStpHist([])
      setCarInfo([])
      setCarNtwkChgHist([])
      setCarOwnrChgHist([])
      setCarSidoChgHist([])
      setCarSpecChgHist([])
      //   console.log(error)
      // 에러시
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  // 페이지 이동 감지 시작 //
  // 검색시 검색 조건에 맞는 데이터 갱신 및 1페이지로 이동
  const handleAdvancedSearch = (event: React.FormEvent) => {
    event.preventDefault()
    setFlag(!flag)
  }

  // 어차피 검색어 바뀔게 하나밖에 없음.
  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    setSearchVhclno(value)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      fetchData()
    }
  }

  return (
    <Box>
      <Dialog
        fullWidth={false}
        sx={{
          '& .MuiDialog-paper': {
            width: '90vw', // Viewport 너비의 90%
            maxWidth: '1800px', // 최대 1200px로 제한
          },
        }}
        open={open}
        onClose={onCloseClick}
      >
        <DialogContent>
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              <h2>차량번호 검색</h2>
            </CustomFormLabel>
            <div className=" button-right-align">
              <Button
                variant="contained"
                color="primary"
                onClick={fetchData}
                type="submit"
              >
                검색
              </Button>

              <Button variant="contained" color="dark" onClick={onCloseClick}>
                취소
              </Button>
            </div>
          </Box>
          <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
            <Box className="sch-filter-box">
              <div className="filter-form">
                <div className="form-group">
                  <CustomFormLabel
                    className="input-label-display"
                    htmlFor="ft-searchVhclno"
                  >
                    <span className="required-text">*</span>차량번호
                  </CustomFormLabel>
                  <CustomTextField
                    id="ft-searchVhclno"
                    name="searchVhclno"
                    value={propsSearchVhclNo ?? searchVhclno}
                    onChange={handleSearchChange}
                    onKeyDown={handleKeyDown}
                    disabled={propsSearchVhclNo}
                  />
                </div>
              </div>
            </Box>
          </Box>

          {/* 
        // 직역해서 번역할 경우 
        // carDispScsHist// 차량 말소 이력
        // carGiveStpHist// 차량 양도 정지 이력
        // carInfo// 차량 정보
        // carNtwkChgHist// 차량 네트워크 변경 이력
        // carOwnrChgHist // 차량 소유자 변경 이력
        // carSidoChgHist// 차량 시도 변경 이력
        // carSpecChgHist// 차량 사양 변경 이력 
        // */}
          {/* 1.차량정보 */}
          <BlankCard className="contents-card" title="차량정보">
            <Box>
              <TableDataGrid
                headCells={headCells1} // 테이블 헤더 값
                rows={carInfo} // 목록 데이터
                loading={loading} // 로딩여부
                onRowClick={() => {}} // 행 클릭 핸들러 추가
                onPaginationModelChange={() => {}} // 페이지 , 사이즈 변경 핸들러 추가
                paging={false}
                cursor={false}
                caption={'차량정보 목록 조회'}
              />
            </Box>
          </BlankCard>
          {/* 2.차량소유자 변경이력 & 3.차량제원 변경이력 */}
          <Box
            sx={{
              display: 'flex',
              gap: 2, // 두 테이블 간의 간격
              justifyContent: 'space-between', // 테이블 간의 균등 간격
              alignItems: 'stretch', // 세로로 동일한 높이를 유지
            }}
          >
            <BlankCard className="contents-card" title="차량소유자 변경이력">
              {/* 2.차량소유자 변경이력 */}
              <Box sx={{ flex: 1 }}>
                <TableDataGrid
                  headCells={headCells2} // 테이블 헤더 값
                  rows={carOwnrChgHist} // 목록 데이터
                  loading={loading} // 로딩여부
                  onRowClick={() => {}} // 행 클릭 핸들러 추가
                  onPaginationModelChange={() => {}} // 페이지 , 사이즈 변경 핸들러 추가
                  paging={false}
                  cursor={false}
                  caption={'차량소유자 변경이력 목록 조회'}
                />
              </Box>
            </BlankCard>
            {/* 3.차량제원 변경이력 */}
            <BlankCard className="contents-card" title="차량제원 변경이력">
              <Box sx={{ flex: 1 }}>
                <TableDataGrid
                  headCells={headCells3} // 테이블 헤더 값
                  rows={carSpecChgHist} // 목록 데이터
                  loading={loading} // 로딩여부
                  onRowClick={() => {}} // 행 클릭 핸들러 추가
                  onPaginationModelChange={() => {}} // 페이지 , 사이즈 변경 핸들러 추가
                  paging={false}
                  cursor={false}
                  caption={'차량제원 변경이력 목록 조회'}
                />
              </Box>
            </BlankCard>
          </Box>

          {/* 4.지급정지/거절/휴지/처분유예 내역 & 5.지자체 변경이력 */}
          <Box
            sx={{
              display: 'flex',
              gap: 2, // 두 테이블 간의 간격
              justifyContent: 'space-between', // 테이블 간의 균등 간격
              alignItems: 'stretch', // 세로로 동일한 높이를 유지
            }}
          >
            {/* 4.지급정지/거절/휴지/처분유예 내역 */}
            <BlankCard
              sx={{ flex: 2 }}
              className="contents-card"
              title="지급정지/거절/휴지/처분유예 내역"
            >
              <Box>
                <TableDataGrid
                  headCells={headCells4} // 테이블 헤더 값
                  rows={carGiveStpHist} // 목록 데이터
                  loading={loading} // 로딩여부
                  onRowClick={() => {}} // 행 클릭 핸들러 추가
                  onPaginationModelChange={() => {}} // 페이지 , 사이즈 변경 핸들러 추가
                  paging={false}
                  cursor={false}
                  caption={'지급정지/거절/휴지/처분유예 내역 목록 조회'}
                />
              </Box>
            </BlankCard>

            {/* 5.지자체 변경이력 */}
            <BlankCard
              sx={{ flex: 1 }}
              className="contents-card"
              title="지자체 변경이력 "
            >
              <Box>
                <TableDataGrid
                  headCells={headCells5} // 테이블 헤더 값
                  rows={carSidoChgHist} // 목록 데이터
                  loading={loading} // 로딩여부
                  onRowClick={() => {}} // 행 클릭 핸들러 추가
                  onPaginationModelChange={() => {}} // 페이지 , 사이즈 변경 핸들러 추가
                  paging={false}
                  cursor={false}
                  caption={'지자체 변경이력 목록 조회'}
                />
              </Box>
            </BlankCard>
          </Box>

          {/* 6.행정처분 승계이력 */}
          <BlankCard className="contents-card" title="행정처분 승계이력">
            <Box>
              <TableDataGrid
                headCells={headCells6} // 테이블 헤더 값
                rows={carDispScsHist} // 목록 데이터
                loading={loading} // 로딩여부
                onRowClick={() => {}} // 행 클릭 핸들러 추가
                onPaginationModelChange={() => {}} // 페이지 , 사이즈 변경 핸들러 추가
                paging={false}
                cursor={false}
                caption={'행정처분 승계이력 목록 조회'}
              />
            </Box>
          </BlankCard>

          {/* 7.자동차관리정보시스템 변경이력 */}
          <BlankCard
            className="contents-card"
            title="자동차관리정보시스템 변경이력"
          >
            <Box>
              <TableDataGrid
                headCells={headCells7} // 테이블 헤더 값
                rows={carNtwkChgHist} // 목록 데이터
                loading={loading} // 로딩여부
                onRowClick={() => {}} // 행 클릭 핸들러 추가
                onPaginationModelChange={() => {}} // 페이지 , 사이즈 변경 핸들러 추가
                paging={false}
                cursor={false}
                caption={'자동차관리정보시스템 변경이력 목록 조회'}
              />
            </Box>
          </BlankCard>

          {selectedRow && (
            <StJeDayoffJudDetailModal
              params={selectedRow}
              open={openStJeDayoffJudDetailModal}
              setClose={() => {
                setSelectedRow(undefined)
                setOpenStJeDayoffJudDetailModal(false)
              }}
            />
          )}

          {/* 테이블영역 끝 */}
        </DialogContent>
      </Dialog>
    </Box>
  )
}
export default CarNumberSearchModal

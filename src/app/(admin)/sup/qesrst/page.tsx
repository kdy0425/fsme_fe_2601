'use client'
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material'
import { useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import PageContainer from '@/components/container/PageContainer'
import { BlankCard, Breadcrumb } from '@/utils/fsms/fsm/mui-imports'

// utils
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import CircularProgress from '@mui/material/CircularProgress'

// types
import FormModal from '@/app/components/popup/FormDialog'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import HeaderTab, { Tab } from '@/app/components/tables/HeaderTab'
import { useDispatch } from '@/store/hooks'
import { listParamObj } from '@/types/fsms/fsm/listParamObj'
import { getDateRange, getExcelFile, getToday } from '@/utils/fsms/common/comm'
import { IconSearch } from '@tabler/icons-react'
import { HeadCell, Pageable2 } from 'table'
import ModalContent from './_components/ModalContent'


const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '업무지원',
  },
  {
    title: '설문조사',
  },
  {
    to: '/sup/qesrst',
    title: '결과조회',
  },
]

const Tabs: Tab[] = [
  { value: '1', label: '기본', active: false },
  { value: '2', label: '상세', active: false },
]

const headCells: HeadCell[] = [
  {
    id: 'srvyCycl',
    numeric: false,
    disablePadding: false,
    label: '회차',
    format: 'number',
    align: 'td-right'
  },
  {
    id: 'srvyTtl',
    numeric: false,
    disablePadding: false,
    label: '설문제목',
  },
  {
    id: 'srvyBgngYmd',
    numeric: false,
    disablePadding: false,
    label: '설문시작일자',
    format: 'yyyymmdd'
  },
  {
    id: 'srvyEndYmd',
    numeric: false,
    disablePadding: false,
    label: '설문종료일자',
    format: 'yyyymmdd'
  },
  {
    id: 'srvyQitemCnt',
    numeric: false,
    disablePadding: false,
    label: '문항수',
    format: 'number',
    align: 'td-right'
  },
  {
    id: 'wholTrgtCnt',
    numeric: false,
    disablePadding: false,
    label: '대상(명)',
    format: 'number',
    align: 'td-right'
  },
  {
    id: 'rspnsNmprCnt',
    numeric: false,
    disablePadding: false,
    label: '참여(명)',
    format: 'number',
    align: 'td-right'
  },
  {
    id: 'chcRt',
    numeric: false,
    disablePadding: false,
    label: '참여율(%)',
    format: 'number',
    align: 'td-right'
  },
  {
    id: 'totlScr',
    numeric: false,
    disablePadding: false,
    label: '100점환산평균',
    format: 'number',
    align: 'td-right'
  },
]

const detailCells: HeadCell[] = [
  {
    id: 'srvyQitemSn',
    numeric: false,
    disablePadding: false,
    label: '문항번호',
    align: 'td-center'
  },
  {
    id: 'srvyQitemCn',
    numeric: false,
    disablePadding: false,
    label: '문항내용',
    align: 'td-left'
  },
  {
    id: 'chcArtclScorScr',
    numeric: false,
    disablePadding: false,
    label: '배점',
    format: 'number',
    align: 'td-right'
  },
  {
    id: 'chcArtclChcNmtm',
    numeric: false,
    disablePadding: false,
    label: '선택(명)',
    format: 'number',
    align: 'td-right'
  },
  {
    id: 'avgScr',
    numeric: false,
    disablePadding: false,
    label: '평균점수',
    format: 'lit',
    align: 'td-right'
  },
] 

export interface Row {
  srvyCycl: number;
  srvyTtl: string;
  srvyGdMsgCn: string;
  srvyBgngYmd: string;
  srvyEndYmd: string;
  srvyQitemCnt: number;
  wholTrgtCnt: number;
  rspnsNmprCnt: number;
  totlScr: number;
  chcRt: number;
}

export interface DetailRow {
  srvyCycl: number;
  srvyQitemSn: number;
  srvyQitemCn: string;
  chcArtclSn: number;
  chcArtclCn: string;
  chcArtclChcNmtm: number;
  chcArtclScorScr: number;
  avgScr: number;
  chcRt: number;
  sbjctvYn: string;
  sn: number | string;
  sbjctvRspnsCn: string;
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

const DataList = () => {
  const querys = useSearchParams() // 쿼리스트링을 가져옴
  const allParams: listParamObj = Object.fromEntries(querys.entries()) // 쿼리스트링 값을 오브젝트 형식으로 담음

  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부
  
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [selectedRow, setSelectedRow] = useState<Row | null>(null)
  const [selectedTab, setSelectedTab] = useState<string>('1')
  
  const [detailRows, setDetailRows] = useState<DetailRow[]>([]);
  const [loading2, setLoading2] = useState(false) // 로딩여부

  const [selectedSrvy, setSelectedSrvy] = useState<DetailRow>();
  const [subjectResData, setSubjectResData] = useState<DetailRow[]>([]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 저장시 로딩상태

  // const dispatch = useDispatch();

  const dateRange = getDateRange('d', 30)

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: Number(allParams.page ?? 1), // 페이지 번호는 1부터 시작
    size: Number(allParams.size ?? 10), // 기본 페이지 사이즈 설정
    searchValue: allParams.searchValue ?? '', // 검색어
    searchSelect: allParams.searchSelect ?? 'ttl', // 종류
    searchStDate: allParams.searchStDate ?? dateRange.startDate, // 시작일
    searchEdDate: allParams.searchEdDate ?? dateRange.endDate, // 종료일
    // searchStDate: allParams.searchStDate ?? '', // 시작일
    // searchEdDate: allParams.searchEdDate ?? '', // 종료일
    sort: allParams.sort ?? '', // 정렬 기준 추가
  })
  //
  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1, // 정렬 기준
  })

  // 플래그를 통한 데이터 갱신
  // 플래그의 변화를 통해 현재 정보를 기준으로 데이터를 가져오기위해 설정
  useEffect(() => {
    setSelectedIndex(-1);
    setSelectedRow(null);
    setSelectedTab('1');
    setDetailRows([]);
    setSelectedSrvy(undefined);
    setSubjectResData([]);
    fetchData()
  }, [flag])

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    
    if(params.searchStDate > params.searchEdDate) {
      alert('종료일은 시작일보다 빠를 수 없습니다.');
      return;
    }

    setLoading(true)
    
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/sup/qesrst/getAllQestnarResult?page=${params.page}&size=${params.size}` +
        `${params.searchStDate ? '&srvyBgngYmd=' + params.searchStDate.replaceAll('-', '') : ''}` +
        `${params.searchEdDate ? '&srvyEndYmd=' + params.searchEdDate.replaceAll('-', '') : ''}` +
        `${params.srvyTtl ? '&srvyTtl=' + params.srvyTtl : ''}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success' && response.data.content.length != 0) {
        // 데이터 조회 성공시
        setRows(response.data.content)
        setTotalRows(response.data.totalElements)
        setPageable({
          pageNumber: response.data.pageable.pageNumber + 1,
          pageSize: response.data.pageable.pageSize,
          totalPages: response.data.totalPages,
        })
        handleRowClick(response.data.content[0], 0);
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

  const fetchDetailData = async (srvyCycl: number) => {
    setLoading2(true)
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/sup/qesrst/getAllQestnarResultBase?srvyCycl=${srvyCycl}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        setDetailRows(response.data)
      } else {
        // 데이터가 없거나 실패
        setDetailRows([])
      }
    } catch (error) {
      // 에러시
      console.error('Error fetching data:', error)
      setDetailRows([])
    } finally {
      setLoading2(false)
    }
  }

  const fetchDetailData2 = async (srvyCycl: number) => {
    setLoading2(true)
    try {
      let endpoint: string =
        `/fsm/sup/qesrst/getAllQestnarResultDtl?srvyCycl=${srvyCycl}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        setDetailRows(response.data)
      } else {
        // 데이터가 없거나 실패
        setDetailRows([])
      }
    } catch (error) {
      // 에러시
      console.error('Error fetching data:', error)
      setDetailRows([])
    } finally {
      setLoading2(false)
    }
  }

  // 주관식 답변 조회
  const getSubjectResponse = async (srvyCycl: number, srvyQitemSn: number, chcArtclSn: number) => {
    
    try {
      let endpoint: string =
        `/fsm/sup/qesrst/getSbjctvRspnsCn?srvyCycl=${srvyCycl}&srvyQitemSn=${srvyQitemSn}&chcArtclSn=${chcArtclSn}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        setSubjectResData(response.data)
      } else {
        // 데이터가 없거나 실패
        setSubjectResData([])
      }
    } catch (error) {
      // 에러시
      console.error('Error fetching data:', error)
      setSubjectResData([])
    } finally {
      setModalOpen(true);
    }
  }

  // 집계
  const createQestnarResult = async () => {
    
    setLoadingBackdrop(true);
    
    try {

      if(!selectedRow) {
        alert('집계할 설문조사를 선택해주세요.')
        return;
      }

      let endpoint: string = `/fsm/sup/qesrst/createQestnarResult`;
      
       let body = {
        srvyCycl: selectedRow?.srvyCycl
      }

      const response = await sendHttpRequest('POST', endpoint, body, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success') {
        alert(response.message);
      } else {
        alert(response.message)
      }
    } catch (error) {
      // 에러시
      console.error('Error fetching data:', error)      
    } finally {
      setLoadingBackdrop(false);
      setFlag(prev => !prev)
    }
  }

  const excelDownload = async () => {

    if(!selectedRow) {
      alert('엑셀다운로드 받을 설문조사를 선택해주세요.')
      return;
    }

    let endpoint: string =
    `/fsm/sup/qesrst/getExcelQestnarResult?` +
    `${selectedRow?.srvyCycl ? '&srvyCycl=' + selectedRow?.srvyCycl : ''}` +
    `${selectedTab == '1' ? '&excelSeCd=Base' : '&excelSeCd=Dtl'}`

    await  getExcelFile(endpoint, BCrumb[BCrumb.length-1].title + (selectedTab == '1' ? '_기본_' : '_상세_') + getToday()+'.xlsx')
  }

  // 페이지 이동 감지 시작 //

  // 검색시 검색 조건에 맞는 데이터 갱신 및 1페이지로 이동
  const handleAdvancedSearch = (event: React.FormEvent) => {
    event.preventDefault()
    setParams((prev) => ({ ...prev, page: 1, size:10 })) // 첫 페이지로 이동
    setFlag(prev => !prev)
  }

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handlePaginationModelChange = (page: number, pageSize: number) => {
    setParams((prev) => ({
      ...prev,
      page: page, // 실제 DB에서 조회시 -1을 하므로 +1 추가해서 넘겨야함. 페이지는 1로 보이지만 DB에선 0으로 조회
      size: pageSize,
    }))
    setFlag(prev => !prev)
  }

  // 행 클릭 시 호출되는 함수
  const handleRowClick = (row: Row, index?: number) => {
    setSelectedTab('1');
    setSelectedIndex(index ?? -1);
    setSelectedRow(row);

    fetchDetailData(row.srvyCycl);
  }

  const handleTabChange = (event: React.SyntheticEvent, tabValue: string) => {
    
    setDetailRows([]);
    setSelectedTab(tabValue)

    if(tabValue === '1') {
      if(selectedRow) {
        fetchDetailData(selectedRow?.srvyCycl)
      }
    }else if (tabValue === '2') {
      if(selectedRow) {
        fetchDetailData2(selectedRow?.srvyCycl)
      }
    }
  }

  // 페이지 이동 감지 종료 //

  // 시작일과 종료일 비교 후 일자 변경
  const handleSearchChange = ( event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,) => {
    const { name, value } = event.target    
    setParams((prev) => ({ ...prev, [name]: value }))    
  }

  const openSubjectResModal = (srvy: DetailRow) => {
    setSelectedSrvy(srvy);
    getSubjectResponse(srvy.srvyCycl,srvy.srvyQitemSn,srvy.chcArtclSn)
  }

  return (
    <PageContainer title="문항관리" description="문항관리">
      {/* breadcrumb */}
      <Breadcrumb title="문항관리" items={BCrumb} />
      {/* end breadcrumb */}

      {/* 검색영역 시작 */}
      <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
        <Box className="sch-filter-box">
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel className="input-label-display" required>
                설문조사기간
              </CustomFormLabel>
              <CustomFormLabel className="input-label-none" htmlFor="ft-date-start">
                시작일
              </CustomFormLabel>
              <CustomTextField type="date" id="ft-date-start" name='searchStDate' value={params.searchStDate} onChange={handleSearchChange} fullWidth />
              <CustomFormLabel className="input-label-none" htmlFor="ft-date-end">
                종료일
              </CustomFormLabel>
              <CustomTextField type="date" id="ft-date-end" name='searchEdDate' value={params.searchEdDate} onChange={handleSearchChange} fullWidth />
            </div>
            <div className="form-group">
              <CustomFormLabel className="input-label-display" required>
                설문제목
              </CustomFormLabel>
              <CustomTextField id="srvyTtl" name='srvyTtl' value={params.srvyTtl} onChange={handleSearchChange} fullWidth />
            </div>
          </div>
        </Box>
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <Button variant="contained" color="primary" type='submit'>
              검색
            </Button>
            <Button variant="contained" color="success" onClick={() => excelDownload()}>
              엑셀
            </Button>
            <Button variant="contained" color="primary" onClick={() => createQestnarResult()}>
              집계
            </Button>
          </div>
        </Box>
      </Box>
      {/* 검색영역 시작 */}

      {/* 테이블영역 시작 */}
      <Box>
        
        <TableDataGrid
          headCells={headCells} // 테이블 헤더 값
          rows={rows} // 목록 데이터
          totalRows={totalRows} // 총 로우 수
          loading={loading} // 로딩여부
          onRowClick={handleRowClick} // 행 클릭 핸들러 추가
          selectedRowIndex={selectedIndex}
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          pageable={pageable} // 현재 페이지 / 사이즈 정보
          cursor
        />
      </Box>
      {selectedIndex > -1 && detailRows ? 
        <Box>
          <BlankCard title='문항별 설문조사 결과'>
            <HeaderTab 
              tabs={Tabs} 
              selectedTab={selectedTab} 
              onTabChange={handleTabChange}
            />
            {selectedTab == '1' ? 
              <TableDataGrid
                headCells={detailCells} // 테이블 헤더 값
                rows={detailRows} // 목록 데이터
                loading={loading2} // 로딩여부
                paging={false}
              />
              : selectedTab == '2' ?
              // <TableDataGrid
              //   headCells={detailCells} // 테이블 헤더 값
              //   rows={detailRows} // 목록 데이터
              //   loading={loading2} // 로딩여부
              //   paging={false}
              // />
              
              <Box className="data-grid-wrapper">
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell align={'left'} padding={'normal'} style={{ whiteSpace: 'nowrap'}}>
                          <div className="table-head-text">문항번호</div>
                        </TableCell>
                        <TableCell align={'left'} padding={'normal'} style={{ whiteSpace: 'nowrap'}}>
                          <div className="table-head-text">문항내용</div>
                        </TableCell>
                        <TableCell align={'left'} padding={'normal'} style={{ whiteSpace: 'nowrap'}}>
                          <div className="table-head-text">선택항목</div>
                        </TableCell>
                        <TableCell align={'left'} padding={'normal'} style={{ whiteSpace: 'nowrap'}}>
                          <div className="table-head-text">배점</div>
                        </TableCell>
                        <TableCell align={'left'} padding={'normal'} style={{ whiteSpace: 'nowrap'}}>
                          <div className="table-head-text">선택(명)</div>
                        </TableCell>
                        <TableCell align={'left'} padding={'normal'} style={{ whiteSpace: 'nowrap'}}>
                          <div className="table-head-text">평균점수</div>
                        </TableCell>
                        <TableCell align={'left'} padding={'normal'} style={{ whiteSpace: 'nowrap'}}>
                          <div className="table-head-text">선택율</div>
                        </TableCell>
                        <TableCell align={'left'} padding={'normal'} style={{ whiteSpace: 'nowrap'}}>
                          <div className="table-head-text">주관식</div>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {!loading2 ? (
                        <>
                          {Array.isArray(detailRows) && detailRows.length !== 0 ? (
                            <>
                              {detailRows.map((item, index) => {
                                
                                let itemCount = detailRows.filter((obj) => obj.srvyQitemSn === item.srvyQitemSn).length

                                return (
                                  <TableRow>
                                    {item.chcArtclCn == '' ? 
                                    <>
                                      <TableCell rowSpan={itemCount}>{item.srvyQitemSn}</TableCell>
                                      <TableCell rowSpan={itemCount}>{item.srvyQitemCn}</TableCell>
                                    </>
                                    : <></>}
                                    <TableCell>{item.chcArtclCn}</TableCell>
                                    <TableCell>{item.chcArtclScorScr}</TableCell>
                                    <TableCell>{item.chcArtclChcNmtm}</TableCell>
                                    <TableCell>{item.avgScr}</TableCell>
                                    <TableCell>{item.chcRt}</TableCell>
                                    <TableCell>{item.sbjctvYn === 'Y' ? 
                                      <Button variant='contained' color='dark' onClick={() => openSubjectResModal(item)}>
                                        <IconSearch/>
                                      </Button>
                                      :
                                      ''
                                    }
                                    </TableCell>
                                  </TableRow>
                                )
                              })}
                            </>
                          ) : (
                            <TableRow>
                              <TableCell colSpan={8}>
                                검색된 데이터가 없습니다.
                              </TableCell>
                            </TableRow>
                          )}
                        </>
                      ) : (
                        <TableRow key={'tr0'}>
                          <TableCell colSpan={8} className="td-center">
                            <p>
                              <CircularProgress />
                            </p>
                          </TableCell>
                        </TableRow>
                      )}                      
                    </TableBody>
                  </Table>
                </TableContainer>
                {selectedSrvy && subjectResData ? 
                  <FormModal 
                    size={'md'}
                    buttonLabel={''} 
                    title={'주관식 답변보기'} 
                    submitBtn={false}
                    remoteFlag={modalOpen}
                    closeHandler={() => setModalOpen(false)}
                  >
                    <ModalContent 
                      srvy = {selectedSrvy}
                      data = {subjectResData}
                    />
                  </FormModal>
                : <></>}
              </Box>              
              : <></>
            }
          </BlankCard>
        </Box>
      : <></>}
      {/* 테이블영역 끝 */}

      {/* 로딩 */}
      <LoadingBackdrop open={loadingBackdrop} />
    </PageContainer>
  )
}

export default DataList

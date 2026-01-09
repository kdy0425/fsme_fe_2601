'use client'

/* React */
import React, { useCallback, useEffect, useMemo, useState } from 'react'

/* 공통 component */
import PageContainer from '@/components/container/PageContainer'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import BlankCard from '@/app/components/shared/BlankCard'
import TxSearchHeaderTab from '@/app/components/tx/txSearchHeaderTab/TxSearchHeaderTab'
import CustomCheckbox from '@/app/components/forms/theme-elements/CustomCheckbox'

/* 공통 type, interface */
import { Pageable2 } from 'table'

/* mui component */
import { Breadcrumb, CustomFormLabel, CustomTextField } from '@/utils/fsms/fsm/mui-imports'
import { Box, Button, FormControlLabel } from '@mui/material'

/* 공통js */
import { toQueryParameter } from '@/utils/fsms/utils'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'

/* _type/vhmHeadCell */
import { vhclHeadCells, flnmHeadCells, koiHeadCells, stopHeadCells, pauseHeadCells, locgovHeadCells, ersrHeadCells } from './_type/vhmHeadCell'

/* _type/vhmInterface */
import { listSearchObj, vhclRow, flnmRow, koiRow, stopRow, pauseRow, locgovRow, ersrRow } from './_type/vhmInterface'

const BCrumb = [
  {
    to:'/',
    title:'Home',
  },
  {
    title:'기준관리',
  },
  {
    to:'/stn/vhm',
    title:'택시_차량 이력조회',
  },
]

const DataList = () => {
  
  /* 탭 리스트 */
  const tabList = useMemo(() => ['차량 기본 정보', '수급자 변경이력', '유종 변경이력', '지급정지 등록이력', '차량휴지 등록이력', '지자체 변경이력', '차량말소 등록이력'], []); 

  /* 공통 상태관리 */
  const [params, setParams] = useState<listSearchObj>({ page:1, size:10, vhclNo:'' });  
  const [searchFlag, setSearchFlag] = useState<boolean | null>(null);
  const [selectedTab, setSelectedTab] = useState<string>('0')
  const [show, setShow] = useState<boolean>(false)

  /* 차량 목록 상태관리 */  
  const [vhclRows, setVhclRows] = useState<vhclRow[]>([]);
  const [totalVhclRows, setTotalVhclRows] = useState<number>(0);
  const [vhclRowIndex, setVhclRowIndex] = useState<number>(-1);
  const [vhclPageable, setVhclPageable] = useState<Pageable2>({ pageNumber:1, pageSize:10, totalPages:1 });
  const [vhclLoading, setVhclLoading] = useState<boolean>(false);
  const [selectedVhclRows, setSelectedVhclRows] = useState<vhclRow|null>(null);

  /* 수급자 변경이력 */
  const [flnmRows, setFlnmRows] = useState<flnmRow[]>([]);
  const [totalFlnmRows, setTotalFlnmRows] = useState<number>(0);
  const [flnmPageable, setFlnmPageable] = useState<Pageable2>({ pageNumber:1, pageSize:10, totalPages:1 });
  const [flnmLoading, setFlnmLoading] = useState<boolean>(false);

  /* 유종 변경이력 */
  const [koiRows, setKoiRows] = useState<koiRow[]>([]);
  const [totalKoiRows, setTotalKoiRows] = useState<number>(0);
  const [koiPageable, setKoiPageable] = useState<Pageable2>({ pageNumber:1, pageSize:10, totalPages:1 });
  const [koiLoading, setKoiLoading] = useState<boolean>(false);

  /* 지급정지 등록이력 */
  const [stopRows, setStopRows] = useState<stopRow[]>([]);
  const [totalStopRows, setTotalStopRows] = useState<number>(0);
  const [stopPageable, setStopageable] = useState<Pageable2>({ pageNumber:1, pageSize:10, totalPages:1 });
  const [stopLoading, setStopLoading] = useState<boolean>(false);

  /* 차량휴지 등록이력 */
  const [pauseRows, setPauseRows] = useState<pauseRow[]>([]);
  const [totalPauseRows, setTotalPauseRows] = useState<number>(0);
  const [pausePageable, setPausePageable] = useState<Pageable2>({ pageNumber:1, pageSize:10, totalPages:1 });
  const [pauseLoading, setPauseLoading] = useState<boolean>(false);

  /* 지자체 변경이력 */
  const [locgovRows, setLocgovRows] = useState<locgovRow[]>([]);
  const [totalLocgovRows, setTotalLocgovRows] = useState<number>(0);
  const [locgovPageable, setLocgovPageable] = useState<Pageable2>({ pageNumber:1, pageSize:10, totalPages:1 });
  const [locgovLoading, setLocgovLoading] = useState<boolean>(false);

  /* 차량말소 등록이력 */
  const [ersrRows, setErsrRows] = useState<ersrRow[]>([]);
  const [totalErsrRows, setTotalErsrRows] = useState<number>(0);
  const [ersrPageable, setErsrPageable] = useState<Pageable2>({ pageNumber:1, pageSize:10, totalPages:1 });
  const [ersrLoading, setErsrLoading] = useState<boolean>(false);

  // 차량 검색 플래그 변동시
  useEffect(() => {
    if (searchFlag !== null) {
      getAllVhcleMng();
    }
  }, [searchFlag]);

  useEffect(() => {
    if (selectedVhclRows) {
      getAllFlnmHistoryMng(1, 10);
      getAllKoiHistoryMng(1, 10);
      getAllStopHistoryMng(1, 10);
      getAllPauseHistoryMng(1, 10);
      getAllLocgovHistoryMng(1, 10);
      getAllErsrHistoryMng(1, 10);
    }
  }, [selectedVhclRows]);

  // 조회결과 초기화
  const resetData = () => {

    /* 차량목록 */
    setVhclRows([])
    setTotalVhclRows(0)
    setVhclRowIndex(-1)
    setVhclPageable({ pageNumber:1, pageSize:10, totalPages:1 });
    setSelectedVhclRows(null)

    /* 수급자 변경이력 */
    setFlnmRows([]);
    setTotalFlnmRows(0);
    setFlnmPageable({ pageNumber:1, pageSize:10, totalPages:1 });

    /* 유종 변경이력 */
    setKoiRows([]);
    setTotalKoiRows(0);
    setKoiPageable({ pageNumber:1, pageSize:10, totalPages:1 });

    /* 지급정지 등록이력 */
    setStopRows([]);
    setTotalStopRows(0);
    setStopageable({ pageNumber:1, pageSize:10, totalPages:1 });

    /* 차량휴지 등록이력 */
    setPauseRows([]);
    setTotalPauseRows(0);
    setPausePageable({ pageNumber:1, pageSize:10, totalPages:1 });

    /* 지자체 변경이력 */
    setLocgovRows([]);
    setTotalLocgovRows(0);
    setLocgovPageable({ pageNumber:1, pageSize:10, totalPages:1 });

    /* 차량말소 등록이력 */  
    setErsrRows([]);
    setTotalErsrRows(0);
    setErsrPageable({ pageNumber:1, pageSize:10, totalPages:1 });
  }

  // 조회조건 변경시
  const handleSearchChange = (event:React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setParams((prev) => ({ ...prev, [name]:value }));
  };

  // 조회시
  const handleAdvancedSearch = (event:React.FormEvent) => {
    event.preventDefault();
    resetData();
    setSelectedTab('0');
    setParams((prev) => ({ ...prev, page:1, size:10 }));
    setSearchFlag(prev => !prev);
  }
  // 차량 목록 데이터 클릭시
  const vhcleHandleClick = useCallback((row:vhclRow, index?:number) => {    
    setSelectedVhclRows(row);
    setVhclRowIndex(index ?? -1);
  }, []);

  // 차량 목록 페이징 이벤트
  const vhclHandlePagination = useCallback((page:number, pageSize:number) => {
    resetData();
    setParams((prev) => ({ ...prev, page:page, size:pageSize }));
    setSearchFlag(prev => !prev)
  }, []);

  // 수급자 변경이력 목록 페이징 이벤트
  const flnmHandlePagination = useCallback((page:number, pageSize:number) => {
    getAllFlnmHistoryMng(page, pageSize);
  }, [selectedVhclRows]);

  // 유종 변경이력 목록 페이징 이벤트
  const koiHandlePagination = useCallback((page:number, pageSize:number) => {
    getAllKoiHistoryMng(page, pageSize);
  }, [selectedVhclRows]);

  // 지급정지 등록이력 목록 페이징 이벤트
  const stopHandlePagination = useCallback((page:number, pageSize:number) => {
    getAllStopHistoryMng(page, pageSize);
  }, [selectedVhclRows]);

  // 차량휴지 등록이력 목록 페이징 이벤트
  const pauseHandlePagination = useCallback((page:number, pageSize:number) => {
    getAllPauseHistoryMng(page, pageSize);
  }, [selectedVhclRows]);

  // 지자체 변경이력 목록 페이징 이벤트
  const locgovHandlePagination = useCallback((page:number, pageSize:number) => {
    getAllLocgovHistoryMng(page, pageSize);
  }, [selectedVhclRows]);

  // 차량말소 등록이력 목록 페이징 이벤트
  const ersrHandlePagination = useCallback((page:number, pageSize:number) => {
    getAllErsrHistoryMng(page, pageSize);
  }, [selectedVhclRows]);

  /* 차량목록 */
  const getAllVhcleMng = async () => {

    if (!params.vhclNo) {
      alert('차량번호를 입력 해주세요');
      return;
    }

    setVhclRows([])
    setTotalVhclRows(0)
    setVhclRowIndex(-1)
    setVhclPageable({ pageNumber:1, pageSize:10, totalPages:1 });
    setSelectedVhclRows(null)
    setVhclLoading(true)
    
    try {

      const endpoint = '/fsm/stn/vhm/cm/getAllVhcleMng' + toQueryParameter(params)
      const response = await sendHttpRequest('GET', endpoint, null, true, { cache:'no-store' })

      if (response && response.resultType === 'success' && response.data.content.length != 0) {
        
        setVhclRows(response.data.content)
        setTotalVhclRows(response.data.totalElements)
        setVhclPageable({
          pageNumber:response.data.pageable.pageNumber + 1,
          pageSize:response.data.pageable.pageSize,
          totalPages:response.data.totalPages,
        })

        vhcleHandleClick(response.data.content[0], 0)
      }
    } catch (error) {
      console.log(error)
    } finally {
      setVhclLoading(false)
    }
  };

  /* 수급자 변경이력 */
  const getAllFlnmHistoryMng = async (pPage:number, pageSize:number) => {
    
    setFlnmRows([]);
    setTotalFlnmRows(0);
    setFlnmPageable({ pageNumber:1, pageSize:10, totalPages:1 });
    setFlnmLoading(true);

    try {

      const searchObj = { vhclNo:selectedVhclRows?.vhclNo, brno:selectedVhclRows?.brno, page:pPage, size:pageSize }
      const endpoint = '/fsm/stn/vhm/cm/getAllFlnmHistoryMng' + toQueryParameter(searchObj)
      const response = await sendHttpRequest('GET', endpoint, null, true, { cache:'no-store' })

      if (response && response.resultType === 'success' && response.data.content.length != 0) {        
        setFlnmRows(response.data.content)
        setTotalFlnmRows(response.data.totalElements)
        setFlnmPageable({
          pageNumber:response.data.pageable.pageNumber + 1,
          pageSize:response.data.pageable.pageSize,
          totalPages:response.data.totalPages,
        })
      }
    } catch (error) {
      console.log(error)
    } finally {
      setFlnmLoading(false)
    }
  }

  /* 유종 변경이력 */
  const getAllKoiHistoryMng = async (pPage:number, pageSize:number) => {
    
    setKoiRows([]);
    setTotalKoiRows(0);
    setKoiPageable({ pageNumber:1, pageSize:10, totalPages:1 });
    setKoiLoading(true);

    try {

      const searchObj = { vhclNo:selectedVhclRows?.vhclNo, brno:selectedVhclRows?.brno, page:pPage, size:pageSize }
      const endpoint = '/fsm/stn/vhm/cm/getAllKoiHistoryMng' + toQueryParameter(searchObj)
      const response = await sendHttpRequest('GET', endpoint, null, true, { cache:'no-store' })

      if (response && response.resultType === 'success' && response.data.content.length != 0) {        
        setKoiRows(response.data.content)
        setTotalKoiRows(response.data.totalElements)
        setKoiPageable({
          pageNumber:response.data.pageable.pageNumber + 1,
          pageSize:response.data.pageable.pageSize,
          totalPages:response.data.totalPages,
        })
      }
    } catch (error) {
      console.log(error)
    } finally {
      setKoiLoading(false)
    }
  }

  /* 지급정지 등록이력 */
  const getAllStopHistoryMng = async (pPage:number, pageSize:number) => {
    
    setStopRows([]);
    setTotalStopRows(0);
    setStopageable({ pageNumber:1, pageSize:10, totalPages:1 });
    setStopLoading(true);

    try {

      const searchObj = { vhclNo:selectedVhclRows?.vhclNo, brno:selectedVhclRows?.brno, page:pPage, size:pageSize }
      const endpoint = '/fsm/stn/vhm/cm/getAllStopHistoryMng' + toQueryParameter(searchObj)
      const response = await sendHttpRequest('GET', endpoint, null, true, { cache:'no-store' })

      if (response && response.resultType === 'success' && response.data.content.length != 0) {        
        setStopRows(response.data.content)
        setTotalStopRows(response.data.totalElements)
        setStopageable({
          pageNumber:response.data.pageable.pageNumber + 1,
          pageSize:response.data.pageable.pageSize,
          totalPages:response.data.totalPages,
        })
      }
    } catch (error) {
      console.log(error)
    } finally {
      setStopLoading(false)
    }
  }

  /* 차량휴지 등록이력 */
  const getAllPauseHistoryMng = async (pPage:number, pageSize:number) => {
    
    setPauseRows([]);
    setTotalPauseRows(0);
    setPausePageable({ pageNumber:1, pageSize:10, totalPages:1 });
    setPauseLoading(true);

    try {

      const searchObj = { vhclNo:selectedVhclRows?.vhclNo, brno:selectedVhclRows?.brno, page:pPage, size:pageSize }
      const endpoint = '/fsm/stn/vhm/cm/getAllPauseHistoryMng' + toQueryParameter(searchObj)
      const response = await sendHttpRequest('GET', endpoint, null, true, { cache:'no-store' })

      if (response && response.resultType === 'success' && response.data.content.length != 0) {        
        setPauseRows(response.data.content)
        setTotalPauseRows(response.data.totalElements)
        setPausePageable({
          pageNumber:response.data.pageable.pageNumber + 1,
          pageSize:response.data.pageable.pageSize,
          totalPages:response.data.totalPages,
        })
      }
    } catch (error) {
      console.log(error)
    } finally {
      setPauseLoading(false)
    }
  }

  /* 지자체 변경이력 */
  const getAllLocgovHistoryMng = async (pPage:number, pageSize:number) => {
    
    setLocgovRows([]);
    setTotalLocgovRows(0);
    setLocgovPageable({ pageNumber:1, pageSize:10, totalPages:1 });
    setLocgovLoading(true);

    try {

      const searchObj = { vhclNo:selectedVhclRows?.vhclNo, brno:selectedVhclRows?.brno, page:pPage, size:pageSize }
      const endpoint = '/fsm/stn/vhm/cm/getAllLocgovHistoryMng' + toQueryParameter(searchObj)
      const response = await sendHttpRequest('GET', endpoint, null, true, { cache:'no-store' })

      if (response && response.resultType === 'success' && response.data.content.length != 0) {        
        setLocgovRows(response.data.content)
        setTotalLocgovRows(response.data.totalElements)
        setLocgovPageable({
          pageNumber:response.data.pageable.pageNumber + 1,
          pageSize:response.data.pageable.pageSize,
          totalPages:response.data.totalPages,
        })
      }
    } catch (error) {
      console.log(error)
    } finally {
      setLocgovLoading(false)
    }
  }

  /* 차량말소 등록이력 */
  const getAllErsrHistoryMng = async (pPage:number, pageSize:number) => {
    
    setErsrRows([]);
    setTotalErsrRows(0);
    setErsrPageable({ pageNumber:1, pageSize:10, totalPages:1 });
    setErsrLoading(true);

    try {

      const searchObj = { vhclNo:selectedVhclRows?.vhclNo, brno:selectedVhclRows?.brno, page:pPage, size:pageSize }
      const endpoint = '/fsm/stn/vhm/cm/getAllErsrHistoryMng' + toQueryParameter(searchObj)
      const response = await sendHttpRequest('GET', endpoint, null, true, { cache:'no-store' })

      if (response && response.resultType === 'success' && response.data.content.length != 0) {        
        setErsrRows(response.data.content)
        setTotalErsrRows(response.data.totalElements)
        setErsrPageable({
          pageNumber:response.data.pageable.pageNumber + 1,
          pageSize:response.data.pageable.pageSize,
          totalPages:response.data.totalPages,
        })
      }
    } catch (error) {
      console.log(error)
    } finally {
      setErsrLoading(false)
    }
  }

  return (
    <PageContainer
      title='택시_차량 이력조회'
      description='택시_차량 이력조회'
    >
      <>
        {/* breadcrumb */}
        <Breadcrumb title='택시_차량 이력조회' items={BCrumb} />

        {/* 검색영역 시작 */}
        <Box component='form' onSubmit={handleAdvancedSearch} sx={{ mb:2 }}>
          <Box className='sch-filter-box'>            
            <div className='filter-form'>
              <div className="form-group">
                <CustomFormLabel
                  className='input-label-display'
                  htmlFor='sch-vhclNo'
                >
                  <span className='required-text'>*</span>차량번호
                </CustomFormLabel>
                <CustomTextField
                  id='sch-vhclNo'
                  fullWidth
                  name='vhclNo'
                  value={params.vhclNo}
                  onChange={handleSearchChange}
                />
                <CustomFormLabel className="input-label-display">
                  한눈에보기
                </CustomFormLabel>
                <FormControlLabel
                  control={
                    <CustomCheckbox
                      name="regYn"
                      value={show}
                      onChange={() => setShow(prev => !prev)}
                    />
                  }
                  label=''
                />
              </div>
            </div>
          </Box>

          {/* 버튼영역 시작 */}
          <Box className='table-bottom-button-group'>
            <div className='button-right-align'>                            
              <Box mr={1} color={'#f44336'}>
                ※ 차량상태가 말소인 차량은 조회가 불가함
              </Box>
              <Button variant='contained' type='submit' color='primary'>
                검색
              </Button>
            </div>
          </Box>
        </Box>
        
        {show ? (
          <TxSearchHeaderTab
            tabIndex={selectedTab}
            setTabIndex={setSelectedTab}
            tabList={tabList}
          />
        ) : null}        

        <div style={{ marginTop: '-8px' }}>  
          {/* 차량 기본 정보 */}
          <Box display={(show && selectedTab === '0') || !show ? 'block' : 'none'} sx={{ mb: 2 }}>
            <BlankCard
              className='contents-card'
              title='차량 기본 정보'          
            >
              <TableDataGrid
                headCells={vhclHeadCells}
                rows={vhclRows}
                totalRows={totalVhclRows}
                selectedRowIndex={vhclRowIndex}
                loading={vhclLoading}
                pageable={vhclPageable}
                onRowClick={vhcleHandleClick}
                onPaginationModelChange={vhclHandlePagination}
                caption={'택시 차량 기본 정보'}
              />
            </BlankCard>
          </Box>
          
          {/* 수급자 변경이력 목록 */}
          <Box display={(show && selectedTab === '1') || !show ? 'block' : 'none'} sx={{ mb: 2 }}>
            <BlankCard
              className='contents-card'
              title='수급자 변경이력 목록'          
            >
              <TableDataGrid
                headCells={flnmHeadCells}
                rows={flnmRows}
                totalRows={totalFlnmRows}
                loading={flnmLoading}
                pageable={flnmPageable}
                onPaginationModelChange={flnmHandlePagination}
                caption={'수급자 변경이력 목록'}
              />
            </BlankCard>
          </Box>

          {/* 유종 변경이력 목록 */}
          <Box display={(show && selectedTab === '2') || !show ? 'block' : 'none'} sx={{ mb: 2 }}>
            <BlankCard
              className='contents-card'
              title='유종 변경이력 목록'          
            >
              <TableDataGrid
                headCells={koiHeadCells}
                rows={koiRows}
                totalRows={totalKoiRows}
                loading={koiLoading}
                pageable={koiPageable}
                onPaginationModelChange={koiHandlePagination}
                caption={'유종 변경이력 목록'}
              />
            </BlankCard>
          </Box>

          {/* 지급정지 등록이력 목록 */}
          <Box display={(show && selectedTab === '3') || !show ? 'block' : 'none'} sx={{ mb: 2 }}>
            <BlankCard
              className='contents-card'
              title='지급정지 등록이력 목록'          
            >
              <TableDataGrid
                headCells={stopHeadCells}
                rows={stopRows}
                totalRows={totalStopRows}
                loading={stopLoading}
                pageable={stopPageable}
                onPaginationModelChange={stopHandlePagination}
                caption={'지급정지 등록이력 목록'}
              />
            </BlankCard>
          </Box>
          
          {/* 차량휴지 등록이력 목록 */}
          <Box display={(show && selectedTab === '4') || !show ? 'block' : 'none'} sx={{ mb: 2 }}>
            <BlankCard
              className='contents-card'
              title='차량휴지 등록이력 목록'          
            >
              <TableDataGrid
                headCells={pauseHeadCells}
                rows={pauseRows}
                totalRows={totalPauseRows}
                loading={pauseLoading}
                pageable={pausePageable}
                onPaginationModelChange={pauseHandlePagination}
                caption={'차량휴지 등록이력 목록'}
              />
            </BlankCard>
          </Box>
          
          {/* 지자체 변경이력 목록 */}
          <Box display={(show && selectedTab === '5') || !show ? 'block' : 'none'} sx={{ mb: 2 }}>
            <BlankCard
              className='contents-card'
              title='지자체 변경이력 목록'          
            >
              <TableDataGrid
                headCells={locgovHeadCells}
                rows={locgovRows}
                totalRows={totalLocgovRows}
                loading={locgovLoading}
                pageable={locgovPageable}
                onPaginationModelChange={locgovHandlePagination}
                caption={'지자체 변경이력 목록'}
              />
            </BlankCard>
          </Box>

          {/* 차량말소 등록이력 목록 */}
          <Box display={(show && selectedTab === '6') || !show ? 'block' : 'none'} sx={{ mb: 2 }}>
            <BlankCard
              className='contents-card'
              title='차량말소 등록이력 목록'          
            >
              <TableDataGrid
                headCells={ersrHeadCells}
                rows={ersrRows}
                totalRows={totalErsrRows}
                loading={ersrLoading}
                pageable={ersrPageable}
                onPaginationModelChange={ersrHandlePagination}
                caption={'차량말소 등록이력 목록'}
              />
            </BlankCard>  
          </Box>
        </div>
      </>
    </PageContainer>
  )
}

export default DataList

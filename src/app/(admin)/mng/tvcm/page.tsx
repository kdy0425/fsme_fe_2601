'use client'

/* React */
import React, { useCallback, useEffect, useState } from 'react'

/* 공통 component */
import PageContainer from '@/components/container/PageContainer'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import BlankCard from '@/app/components/shared/BlankCard'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

/* 공통 type, interface */
import { Pageable2 } from 'table'

/* mui component */
import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'
import { Box, Button } from '@mui/material'
import { CustomFormLabel, CustomTextField } from '@/utils/fsms/fsm/mui-imports'

/* _components */
import PaperFileUploadModal from './_components/PaperFileUploadModal'
import AagncyDrvYmdModal from './_components/AagncyDrvYmdModal'
import HstryModal from './_components/HstryModal'

/* util/interface.ts */
import { listSearchObj, vhclRow, vhclStopRow, bsnesRow, cardRow, hstryModalDatatype, procDataInterface } from './util/interface'

/* util/headCells.ts */
import { vhclHeadCells, vhclStopHeadCells, bsnesHeadCells, cardHeadCells } from './util/headCells'

/* 공통js */
import { toQueryParameter } from '@/utils/fsms/utils'
import { getToday, isNumber } from '@/utils/fsms/common/comm'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'

const BCrumb = [
  {
    to:'/',
    title:'Home',
  },
  {
    title:'운영관리',
  },
  {
    to:'/mng/tvcm',
    title:'택시차량카드관리',
  },
]

const DataList = () => {
  
  /* 공통 상태관리 */
  const [params, setParams] = useState<listSearchObj>({ page:1, size:10, vhclNo:'', brno:'' });  
  const [searchFlag, setSearchFlag] = useState<boolean | null>(null);
  const [loadingBackdrop, setLoadingBackdrop] = useState(false);  

  /* 차량 목록 상태관리 */  
  const [vhclRows, setVhclRows] = useState<vhclRow[]>([]);
  const [totalVhclRows, setTotalVhclRows] = useState<number>(0);
  const [vhclRowIndex, setVhclRowIndex] = useState<number>(-1);
  const [vhclPageable, setVhclPageable] = useState<Pageable2>({ pageNumber:1, pageSize:10, totalPages:1 });
  const [vhclLoading, setVhclLoading] = useState<boolean>(false);
  const [selectedVhclRows, setSelectedVhclRows] = useState<vhclRow|null>(null);
  
  /* 차량 정지 이력 목록 상태관리 */
  const [vhclStopRows, setVhclStopRows] = useState<vhclStopRow[]>([]);
  const [totalVhclStopRows, setTotalVhclStopRows] = useState<number>(0);
  const [vhclStopRowIndex, setVhclStopRowIndex] = useState<number>(-1);
  const [vhclStopPageable, setVhclStopPageable] = useState<Pageable2>({ pageNumber:1, pageSize:10, totalPages:1 });
  const [vhclStopLoading, setVhclStopLoading] = useState<boolean>(false);
  const [selectedVhclStopRows, setSelectedVhclStopRows] = useState<vhclStopRow|null>(null);
  
  /* 사업자 목록 상태관리 */
  const [bsnesRows, setBsnesRows] = useState<bsnesRow[]>([]);
  const [bsnesRowIndex, setBsnesRowIndex] = useState<number>(-1);
  const [bsnesLoading, setBsnesLoading] = useState<boolean>(false);
  
  /* 카드 목록 상태관리 */
  const [cardRows, setCardRows] = useState<cardRow[]>([]);
  const [totalCardRows, setTotalCardRows] = useState<number>(0);
  const [cardRowIndex, setCardRowIndex] = useState<number>(-1);
  const [cardPageable, setCardPageable] = useState<Pageable2>({ pageNumber:1, pageSize:10, totalPages:1 });
  const [cardLoading, setCardLoading] = useState<boolean>(false);
  const [selectedCardRows, setSelectedCardRows] = useState<cardRow|null>(null);
  
  /* 모달 상태관리 */
  const [pfumOpen, setPfumOpen] = useState<boolean>(false); // 서면신청 파일업로드 모달
  const [hstryModalOpen, setHstryModalOpen] = useState<boolean>(false); // 이력보기 모달
  const [hstryModalData, setHstryModalData] = useState<hstryModalDatatype>({}); // 이력보기 모달 데이터
  const [hstryType, setHstryType] = useState<string>(''); // 이력보기 모달 타입
  const [agncyDrvYmdOpen, setAgncyDrvYmdOpen] = useState<boolean>(false); // 대리운전 기간변경 모달
  
  /* 차량 목록 버튼 활성화 여부 */
  const [vchlRestorationCancel, setVchlRestorationCancel] = useState<boolean>(true); // 당일 차량복원 취소
  const [vhclDeregistrationCancel, setVhclDeregistrationCancel] = useState<boolean>(true); // 당일 차량말소 취소
  const [vchlRestoration, setVchlRestoration] = useState<boolean>(true); // 차량상태 정상복원
  const [vhclHstry, setVhclHstry] = useState<boolean>(true); // 차량 이력 보기
  
  /* 사업자 목록 버튼 활성화 여부 */
  const [bsnesRestoration, setBsnesRestoration] = useState<boolean>(true); // 사업자상태 정상복원
  const [bsnesHstry, setBsnesHstry] = useState<boolean>(true); // 사업자 이력 보기
  
  /* 카드 목록 버튼 활성화 여부 */
  const [changeCardDscntYSpecialty, setChangeCardDscntYSpecialty] = useState<boolean>(true); // 카드 할인 변경 + 전문
  const [dscntYSpecialty, setDscntYSpecialty] = useState<boolean>(true); // 카드 할인 전문 생성
  const [changeCardDscntNSpecialty, setChangeCardDscntNSpecialty] = useState<boolean>(true); // 카드 미할인 변경 + 전문
  const [dscntNSpecialty, setDscntNSpecialty] = useState<boolean>(true); // 카드 미할인 전문 생성
  const [changeAgncyDrvYmd, setChangeAgncyDrvYmd] = useState<boolean>(true); // 대리운전 기간변경
  const [cardHstry, setCardHstry] = useState<boolean>(true); // 카드 이력 보기

  // 차량 검색 플래그 변동시
  useEffect(() => {
    if (searchFlag !== null) {
      getAllVhcleMng();
    }
  }, [searchFlag]);

  // 차량 row에 값에 따른 버튼 활성화여부 처리
  useEffect(() => {
    
    if (!selectedVhclRows) {

      /* 차량목록 버튼 */
      setVchlRestorationCancel(true);
      setVhclDeregistrationCancel(true);
      setVchlRestoration(true);
      setVhclHstry(true);

    } else {

      setVhclHstry(false);

      if (selectedVhclRows.vertifyMdfcnDt === getToday()) {

        if (!selectedVhclRows.ersrYmd?.trim()) { // 금일 차량말소복원 대상
          
          if (selectedVhclRows.sttsCd === '000') {
            setVchlRestorationCancel(false);
          } else {
            setVchlRestorationCancel(true);
          }

          setVhclDeregistrationCancel(true);
          setVchlRestoration(true);
        } else { // 금일 차량말소 대상
          setVchlRestorationCancel(true);
          setVhclDeregistrationCancel(false);
          setVchlRestoration(true);
        }
      } else {

        if (selectedVhclRows.sttsCd !== '000') { // 차량상태가 정상이 아닐때 차량상태 정상복원 가능
          setVchlRestorationCancel(true);
          setVhclDeregistrationCancel(true);
          setVchlRestoration(false);
        } else {
          setVchlRestorationCancel(true);
          setVhclDeregistrationCancel(true);
          setVchlRestoration(true);
        }
      }
    }
  }, [selectedVhclRows]);

  useEffect(() => {

    if (bsnesRows.length === 0) {
      setBsnesRestoration(true);
      setBsnesHstry(true);
    } else {

      setBsnesHstry(false);

      if (bsnesRows[0].sttsCd !== '000') {
        setBsnesRestoration(false);
      } else {
        setBsnesRestoration(true);
      }
    }
  }, [bsnesRows]);

  useEffect(() => {

    if (!selectedCardRows) {
      setChangeCardDscntYSpecialty(true);
      setDscntYSpecialty(true);
      setChangeCardDscntNSpecialty(true);
      setDscntNSpecialty(true);
      setChangeAgncyDrvYmd(true);
      setCardHstry(true);
    } else {

      setCardHstry(false);

      // 대리운전기간 변경 버튼 상태 변경
      if (selectedCardRows?.custSeCd == '3') {
        setChangeAgncyDrvYmd(false);
      } else {
        setChangeAgncyDrvYmd(true);
      }
      
      // 카드 할인 변경 및 전문 생성 버튼 상태 변경
      if (selectedCardRows?.dscntYn === 'Y') {
        setChangeCardDscntYSpecialty(true);
        setDscntYSpecialty(false);
        setChangeCardDscntNSpecialty(false);
        setDscntNSpecialty(true);
      } else {
        setChangeCardDscntYSpecialty(false);
        setDscntYSpecialty(true);
        setChangeCardDscntNSpecialty(true);
        setDscntNSpecialty(false);
      }
    }
  }, [selectedCardRows]);

  const resetData = () => {

    /* 차량 목록 */
    setVhclRows([])
    setTotalVhclRows(0)
    setVhclRowIndex(-1)
    setVhclPageable({ pageNumber:1, pageSize:10, totalPages:1 });
    setSelectedVhclRows(null)

    /* 차량 정지 이력 목록 */
    setVhclStopRows([]);
    setTotalVhclStopRows(0);
    setVhclStopRowIndex(-1);
    setVhclStopPageable({ pageNumber:1, pageSize:10, totalPages:1 });
    setSelectedVhclStopRows(null);

    /* 사업자 목록 */
    setBsnesRows([]);
    setBsnesRowIndex(-1);

    /* 카드 목록 */
    setCardRows([]);
    setTotalCardRows(0);
    setCardRowIndex(-1);
    setCardPageable({ pageNumber:1, pageSize:10, totalPages:1 });
    setSelectedCardRows(null);
  }

  // 조회조건 변경시
  const handleSearchChange = (event:React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    if (name === 'brno') {
      if (isNumber(value)) {
        setParams((prev) => ({ ...prev, [name]:value }));
      }
    } else {
      setParams((prev) => ({ ...prev, [name]:value }));
    }    
  };

  // 조회시
  const handleAdvancedSearch = (event:React.FormEvent) => {
    event.preventDefault();
    setParams((prev) => ({ ...prev, page:1, size:10 }));
    resetData();
    setSearchFlag(prev => !prev);
  }

  // 차량 목록 가져오기
  const getAllVhcleMng = async () => {

    if (!params.vhclNo && !params.brno) {
      alert('차량번호 또는 사업자번호를 입력 해주세요');
      return;
    }

    setVhclRows([])
    setTotalVhclRows(0)
    setVhclRowIndex(-1)
    setVhclPageable({ pageNumber:1, pageSize:10, totalPages:1 });
    setSelectedVhclRows(null)
    setVhclLoading(true)
    
    try {

      const endpoint = '/fsm/mng/tvcm/cm/getAllVhcleMng' + toQueryParameter(params)
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

  // 차량 목록 데이터 클릭시
  const vhcleHandleClick = useCallback((row:vhclRow, index?:number) => {
    
    // 차량데이터세팅
    setSelectedVhclRows(row);
    setVhclRowIndex(index ?? -1);
    
    // 차량 정지 이력 목록 가져오기
    if (selectedVhclStopRows?.vhclNo !== row.vhclNo || selectedVhclStopRows?.brno !== row.brno) {
      getAllVhcleStopMng(1, 10, row.vhclNo, row.brno);
    }

    // 사업자 목록 가져오기
    if (bsnesRows.length === 0 || bsnesRows[0].brno !== row.brno) {    
      getAllBsnesMng(row.brno);
    }

    // 카드 목록 가져오기
    if (selectedCardRows?.vhclNo !== row.vhclNo || selectedCardRows?.brno !== row.brno) {
      getAllCardMng(1, 10, row.vhclNo, row.brno);
    }

  }, [selectedVhclStopRows, bsnesRows, selectedCardRows]);

  // 차량 목록 페이징 이벤트
  const vhclHandlePagination = useCallback((page:number, pageSize:number) => {
    setParams((prev) => ({ ...prev, page:page, size:pageSize }));
    resetData();
    setSearchFlag(prev => !prev)
  }, []);

  // 차량 정지 이력 목록 가져오기
  const getAllVhcleStopMng = async (pPage:number, pSize:number, pVhclNo:string, pBrno:string) => {
    
    setVhclStopRows([]);
    setTotalVhclStopRows(0);
    setVhclStopRowIndex(-1);
    setVhclStopPageable({ pageNumber:1, pageSize:10, totalPages:1 });
    setSelectedVhclStopRows(null);
    setVhclStopLoading(true)
    
    try {

      const searchObj = { page:pPage, size:pSize, vhclNo:pVhclNo, brno:pBrno }
      const endpoint = '/fsm/mng/tvcm/cm/getAllVhcleStopMng' + toQueryParameter(searchObj)
      const response = await sendHttpRequest('GET', endpoint, null, true, { cache:'no-store' })

      if (response && response.resultType === 'success' && response.data.content.length != 0) {
        
        setVhclStopRows(response.data.content)
        setTotalVhclStopRows(response.data.totalElements)
        setVhclStopPageable({
          pageNumber:response.data.pageable.pageNumber + 1,
          pageSize:response.data.pageable.pageSize,
          totalPages:response.data.totalPages,
        })

        vhclStopHandleClick(response.data.content[0], 0);
      }
    } catch (error) {
      console.log(error)
    } finally {
      setVhclStopLoading(false)
    }
  };

  // 차량 정지 이력 목록 데이터 클릭시
  const vhclStopHandleClick = useCallback((row:vhclStopRow, index?:number) => {
    setSelectedVhclStopRows(row)
    setVhclStopRowIndex(index ?? -1)
  }, []);

  // 차량 정지 이력 목록 페이징 이벤트
  const vhclStopHandlePagination = useCallback((page:number, pageSize:number) => {
    getAllVhcleStopMng(page, pageSize, selectedVhclStopRows?.vhclNo ?? '', selectedVhclStopRows?.brno ?? '');
  }, [selectedVhclStopRows]);
  
  // 사업자 목록 가져오기
  const getAllBsnesMng = async (pBrno:string) => {

    setBsnesRows([]);
    setBsnesRowIndex(-1);
    setBsnesLoading(true)
  
    try {

      const searchObj = { brno:pBrno };
      const endpoint = '/fsm/mng/tvcm/cm/getAllBsnesMng' + toQueryParameter(searchObj);
      const response = await sendHttpRequest('GET', endpoint, null, true, { cache:'no-store' });

      if (response && response.resultType === 'success' && response.data) {
        setBsnesRows([response.data]);
        setBsnesRowIndex(0);
      }
    } catch (error) {
      console.log(error)
    } finally {
      setBsnesLoading(false)
    }    
  };

  // 카드 목록 가져오기
  const getAllCardMng = async (pPage:number, pSize:number, pVhclNo:string, pBrno:string) => {
    
    setCardRows([]);
    setTotalCardRows(0);
    setCardRowIndex(-1);
    setCardPageable({ pageNumber:1, pageSize:10, totalPages:1 });
    setSelectedCardRows(null);
    setCardLoading(true)
    
    try {

      const searchObj = { page:pPage, size:pSize, vhclNo:pVhclNo, brno:pBrno }
      const endpoint = '/fsm/mng/tvcm/cm/getAllCardMng' + toQueryParameter(searchObj)
      const response = await sendHttpRequest('GET', endpoint, null, true, { cache:'no-store' })

      if (response && response.resultType === 'success' && response.data.content.length != 0) {
        
        setCardRows(response.data.content)
        setTotalCardRows(response.data.totalElements)
        setCardPageable({
          pageNumber:response.data.pageable.pageNumber + 1,
          pageSize:response.data.pageable.pageSize,
          totalPages:response.data.totalPages,
        })

        cardHandleClick(response.data.content[0], 0);
      }
    } catch (error) {
      console.log(error)
    } finally {
      setCardLoading(false)
    }
  };

  // 카드 목록 데이터 클릭시
  const cardHandleClick = useCallback((row:cardRow, index?:number) => {
    setSelectedCardRows(row)
    setCardRowIndex(index ?? -1)
  }, []);

  // 카드 목록 페이징 이벤트
  const cardHandlePagination = useCallback((page:number, pageSize:number) => {
    getAllCardMng(page, pageSize, selectedCardRows?.vhclNo ?? '', selectedCardRows?.brno ?? '');
  }, [selectedCardRows]);

  // 이력 보기 모달 클릭
  const handleHstryModalOpen = (type:'vhcl'|'bsnes'|'card') => {
    
    if ((type === 'vhcl' && vhclRowIndex === -1) || (type === 'bsnes' && bsnesRowIndex === -1) || (type === 'card' && cardRowIndex === -1)) {
      alert('선택된 데이터가 없습니다.');
      return;
    }

    if (type === 'vhcl') {
      setHstryModalData({ vhclNo:selectedVhclRows?.vhclNo ?? '', brno:selectedVhclRows?.brno ?? '' });
    } else if (type === 'bsnes') {
      setHstryModalData({ brno:bsnesRows[0].brno });
    } else {
      setHstryModalData({ crdcoCd:selectedCardRows?.crdcoCd ?? '', cardNo:selectedCardRows?.cardNo ?? '' });
    }

    setHstryType(type);
    setHstryModalOpen(true);
  }

  // 당일 차량복원 취소
  const handleVchlRestorationCancel = () => {

    if(confirm('주의! 차량말소복원으로 말소된 차량은 복원 처리되고 해당 차량은 말소 처리됩니다.\n\n해당차량에 대하여 차량말소복원 취소 처리를 하시겠습니까?')) {
      
      const procData = {
        endPoint:'/fsm/mng/tvcm/cm/updateVhcleErsrRestoreCancel',
        body:{
          vhclNo:selectedVhclRows?.vhclNo,
          brno:selectedVhclRows?.brno
        }
      }
      
      processData(procData);
    }       
  }

  // 당일 차량말소 취소
  const handleVhclDeregistrationCancel = () => {

    if(confirm('주의! 차량말소복원된 차량은 차량말소복원 취소 처리를 해야합니다.\n\n해당차량에 대하여 차량말소 취소 처리를 하시겠습니까?')) {
      
      const procData = {
        endPoint:'/fsm/mng/tvcm/cm/updateVhcleErsrCancel',
        body:{
          vhclNo:selectedVhclRows?.vhclNo,
          brno:selectedVhclRows?.brno,
          ersrYmd:selectedVhclRows?.ersrYmd
        }
      }
      
      processData(procData);
    }	
  }

  // 차량상태 정상복원
  const handleVchlRestoration = () => {

    if (confirm('동일한 차량번호로 정상 차량이 있는 경우 차량상태 변경이 불가합니다.\n차량상태를 정상으로 변경하시겠습니까?')) {
      
      const procData = {
        endPoint:'/fsm/mng/tvcm/cm/updateVhcleSttsRestore',
        body:{
          vhclNo:selectedVhclRows?.vhclNo,
          brno:selectedVhclRows?.brno
        }
      }
      
      processData(procData);
    }
  }

  // 사업자상태 정상복원
  const handleBsnesRestoration = () => {
    
    if(confirm('국세청 홈페이지 사업자 상태를 확인 후 변경하시길 바랍니다.\n저장하시겠습니까?')){
      
      const procData = {
        endPoint:'/fsm/mng/tvcm/cm/updateBsnesSttsRestore',
        body:{
          brno:bsnesRows[0].brno
        }
      }
      
      processData(procData);
    }
  }

  // 카드 할인 변경 + 전문 / 카드 미할인 변경 + 전문
  const handleChangeCardDscntSpecialty = (dscntYn:'Y'|'N') => {

    const msg = dscntYn === 'Y' ? '[ 카드 할인 변경 + 전문 ] 처리 하시겠습니까?' : '[ 카드 미할인 변경 + 전문 ] 처리 하시겠습니까?'

    if (confirm(msg)) {
      
      const procData = {
        endPoint:'/fsm/mng/tvcm/cm/UpdateCardDscntYn',
        body:{
          crdcoCd:selectedCardRows?.crdcoCd,
          cardNo:selectedCardRows?.cardNo,
          vhclNo:selectedCardRows?.vhclNo,
          brno:selectedCardRows?.brno,
          dscntYn:dscntYn
        }
      }
      
      processData(procData);
    }
  }

  // 카드 할인 전문 생성 / 카드 미할인 전문 생성
  const handleDscntSpecialty = (dscntYn:'Y'|'N') => {

    const msg = dscntYn === 'Y' ? '[ 카드 할인 전문 생성 ] 처리 하시겠습니까?' : '[ 카드 미할인 전문 생성 ] 처리 하시겠습니까?'

    if (confirm(msg)) {
      
      const chgYmd = selectedCardRows?.custSeCd === '3' ? selectedCardRows?.agncyDrvEndYmd : getToday();

      const procData = {
        endPoint:'/fsm/mng/tvcm/cm/createCardDscntYnIfData',
        body:{
          crdcoCd:selectedCardRows?.crdcoCd,
          rcptYmd:selectedCardRows?.rcptYmd,
          rcptSeqNo:selectedCardRows?.rcptSeqNo,
          vhclNo:selectedCardRows?.vhclNo,
          brno:selectedCardRows?.brno,
          dscntYn:dscntYn,
          chgYmd:chgYmd
        }
      }
      
      processData(procData);
    }
  }

  // 대리운전 기간변경
  const handleChangeAgncyDrvYmd = () => {
    setAgncyDrvYmdOpen(true);
  }

  // 데이터 처리
  const processData = async (procData:procDataInterface) => {

    setLoadingBackdrop(true)
    
    try {
      
      const response = await sendHttpRequest('POST', procData.endPoint, procData.body, true, { cache:'no-store' })

      if (response && response.resultType === 'success') {
        alert('완료되었습니다')
        setParams((prev) => ({ ...prev, page:1, size:10 }));
        resetData();
        setSearchFlag(prev => !prev);
      } else {
        alert(response.message);
      }
    } catch (error) {
      console.log(error)
    } finally {
      setLoadingBackdrop(false)
    }
  }

  return (
    <PageContainer
      title='택시차량카드관리'
      description='택시차량카드관리'
    >
      <>
        {/* breadcrumb */}
        <Breadcrumb title='택시차량카드관리' items={BCrumb} />

        {/* 검색영역 시작 */}
        <Box component='form' onSubmit={handleAdvancedSearch} sx={{ mb:2 }}>
          <Box className='sch-filter-box'>            
            <div className='filter-form'>
              <div className='form-group'>
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
              </div>
              <div className='form-group'>
                <CustomFormLabel
                  className='input-label-display'
                  htmlFor='sch-brno'
                >
                  <span className='required-text'>*</span>사업자번호
                </CustomFormLabel>
                <CustomTextField
                  id='sch-brno'
                  fullWidth
                  name='brno'
                  value={params.brno}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
          </Box>

          {/* 버튼영역 시작 */}
          <Box className='table-bottom-button-group'>
            <div className='button-right-align'>              
              <Button variant='contained' type='submit' color='primary'>
                검색
              </Button>

              <Button variant='contained' color='success' onClick={() => setPfumOpen(true)}>
                서면신청파일업로드
              </Button>
            </div>
          </Box>
        </Box>

        {/* 차량 목록 */}
        <BlankCard
          className='contents-card'
          title='차량 목록'
          buttons={[
            {
              label:'당일 차량복원 취소',
              color:'outlined',
              onClick:handleVchlRestorationCancel,
              disabled:vchlRestorationCancel
            },
            {
              label:'당일 차량말소 취소',
              color:'outlined',
              onClick:handleVhclDeregistrationCancel,
              disabled:vhclDeregistrationCancel
            },
            {
              label:'차량상태 정상복원',
              color:'outlined',
              onClick:handleVchlRestoration,
              disabled:vchlRestoration
            },
            {
              label:'차량 이력 보기',
              color:'outlined',
              onClick:() => handleHstryModalOpen('vhcl'),
              disabled:vhclHstry
            },
          ]}
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
            caption={'택시 차량 목록'}
          />
        </BlankCard>

        {/* 차량 정지 이력 목록 */}
        <BlankCard
          className='contents-card'
          title='차량 정지 이력 목록'          
        > 
          <TableDataGrid
            headCells={vhclStopHeadCells}
            rows={vhclStopRows}
            totalRows={totalVhclStopRows}
            selectedRowIndex={vhclStopRowIndex}
            loading={vhclStopLoading}
            pageable={vhclStopPageable}
            onRowClick={vhclStopHandleClick}
            onPaginationModelChange={vhclStopHandlePagination}
            caption={'택시 차량 정지 이력 목록'}
          />
        </BlankCard>

        {/* 사업자 목록 */}
        <BlankCard
          className='contents-card'
          title='사업자 목록'
          buttons={[
            {
              label:'사업자상태 정상복원',
              color:'outlined',
              onClick:handleBsnesRestoration,
              disabled:bsnesRestoration
            },
            {
              label:'사업자 이력 보기',
              color:'outlined',
              onClick:() => handleHstryModalOpen('bsnes'),
              disabled:bsnesHstry
            },
          ]}
        >
          <TableDataGrid
            headCells={bsnesHeadCells}
            rows={bsnesRows}
            selectedRowIndex={bsnesRowIndex}
            loading={bsnesLoading}
            caption={'택시 사업자 목록'}
          />
        </BlankCard>

        {/* 카드 목록 */}
        <BlankCard
          className='contents-card'
          title='카드 목록'
          buttons={[
            {
              label:'카드 할인 변경 + 전문',
              color:'outlined',
              onClick:() => handleChangeCardDscntSpecialty('Y'),
              disabled:changeCardDscntYSpecialty
            },
            {
              label:'카드 할인 전문 생성',
              color:'outlined',
              onClick:() => handleDscntSpecialty('Y'),
              disabled:dscntYSpecialty
            },
            {
              label:'카드 미할인 변경 + 전문',
              color:'outlined',
              onClick:() => handleChangeCardDscntSpecialty('N'),
              disabled:changeCardDscntNSpecialty
            },
            {
              label:'카드 미할인 전문 생성',
              color:'outlined',
              onClick:() => handleDscntSpecialty('N'),
              disabled:dscntNSpecialty
            },
            {
              label:'대리운전 기간변경',
              color:'outlined',
              onClick:handleChangeAgncyDrvYmd,
              disabled:changeAgncyDrvYmd,
            },
            {
              label:'카드 이력 보기',
              color:'outlined',
              onClick:() => handleHstryModalOpen('card'),
              disabled:cardHstry
            },
          ]}
        >
          <TableDataGrid
            headCells={cardHeadCells}
            rows={cardRows}
            totalRows={totalCardRows}
            selectedRowIndex={cardRowIndex}
            loading={cardLoading}
            pageable={cardPageable}
            onRowClick={cardHandleClick}
            onPaginationModelChange={cardHandlePagination}
            caption={'택시 카드 목록'}
          />
        </BlankCard>

        {/* 로딩 */}
        <LoadingBackdrop open={loadingBackdrop} />

        {/* 서면신청 파일업로드 */}
        {pfumOpen ? (
          <PaperFileUploadModal
            open={pfumOpen}
            setOpen={setPfumOpen}
          />
        ) :null}

        {/* 이력보기 */}
        {hstryModalOpen ? (
          <HstryModal
            open={hstryModalOpen}
            setOpen={setHstryModalOpen}
            hstryModalData={hstryModalData}
            hstryType={hstryType}
          />
        ) :null}
        
        {/* 대리운전 기간변경 */}
        {agncyDrvYmdOpen ? (
          <AagncyDrvYmdModal
            open={agncyDrvYmdOpen}
            setOpen={setAgncyDrvYmdOpen}
            processData={processData}
            selectedCardRows={selectedCardRows}
          />
        ) :null}

      </>
    </PageContainer>
  )
}

export default DataList

import { CustomFormLabel, CustomRadio, CustomSelect, CustomTextField } from '@/utils/fsms/fsm/mui-imports';
import { Box, Button, Dialog, DialogContent, FormControlLabel, MenuItem, RadioGroup, Table, TableBody, TableCell, TableContainer, TableRow } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation'

import PageContainer from '@/components/container/PageContainer'
import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils';

import { listParamObj } from '@/types/fsms/fsm/listParamObj'
import { HeadCell, Pageable, Pageable2  } from 'table'
import { getCtpvCd, getCommCd, getLocGovCd, getDateRange, isValidDateRange, sortChange, getExcelFile, getToday} from '@/utils/fsms/common/comm'
import { SelectItem } from 'select'
import { CtpvSelect, LocgovSelect } from '../tx/commSelect/CommSelect';

interface TxVhclModal {
  buttonLabel: string;
  title: string;
  url: string;
  onRowClick: (row: any) => void;
  clickClose?: boolean;
  staticLocgovCd?: string
}

const headCells: HeadCell[] = [
  {
    id: 'brno',
    numeric: false,
    disablePadding: false,
    label: '사업자등록번호',
    format: 'brno',
  },
  {
    id: 'bzentyNm',
    numeric: false,
    disablePadding: false,
    label: '업체명',
  },
  {
    id: 'vhclNo',
    numeric: false,
    disablePadding: false,
    label: '차량번호',
  },
  {
    id: 'rprsvNm',
    numeric: false,
    disablePadding: false,
    label: '대표자명',
  },
  {
    id: 'cmSttsNm',
    numeric: false,
    disablePadding: false,
    label: '차량상태',
  }
]

export interface TxVhclRow {
  vhclNo:string //차량번호
  brno:string //사업자등록번호
  bzentyNm:string //업체명
  bzmnSeNm:string //개인법인구분
  bmSttsNm:string //사업자상태
  rprsvNm:string //수급자명
  rprsvRrno:string //수급자주민등록번호
  koiNm:string //유종명
  dayoffYn:string //부제여부
  dayoffGroupNm:string //부제그룹명
  dscntNm:string //할인여부
  crno:string //법인등록번호
  telno:string //전화번호
  ntsChgYmd:string //국세청변경일자
  locgovNm:string //관할관청
  cmSttsNm:string //차량상태
  rgtrId:string //등록자아이디
  regDt:string //등록일자
  mdfrId:string //수정자아이디
  mdfcnDt:string //수정일자
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  page: number,
  size: number,
  ctpvCd:string,
  locgovCd:string,
  vhclNo:string,
  brno:string
}

export const TxVhclModal = (props: TxVhclModal) => {
  const router = useRouter() // 화면이동을 위한객체
  const querys = useSearchParams() // 쿼리스트링을 가져옴

  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<TxVhclRow[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부

  const {buttonLabel, title, url, onRowClick, staticLocgovCd} = props;

  const [open, setOpen] = useState(false);

  const [params, setParams] = useState<listSearchObj>({ page: 1, size: 10, ctpvCd:'', locgovCd:'', vhclNo:'', brno:'' });
  const [pageable, setPageable] = useState<Pageable2>({ pageNumber: 1, pageSize: 10, totalPages: 1 });


  useEffect(() => {
    if(params.ctpvCd && params.locgovCd) {
      fetchData()
    }
  }, [flag])

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {


    setLoading(true)
    try {
      if(!params.ctpvCd) {
        alert("시도명을 선택해주세요.");
        return;
      }

      if(!params.locgovCd) {
        alert("관할관청을 선택해주세요.");
        return;
      }

      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `${url}?page=${params.page}&size=${params.size}` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}`+
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.brno ? '&brno=' + params.brno : ''}` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}`

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
          pageSize: 5,
          totalPages: 1,
        })
      }
    } catch (error) {
      // 에러시
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
  
  const handleClickOpen = () => {
    setOpen(true);
    setRows([])
    setTotalRows(0)
  };

  const handleClickClose = () => {
    setOpen(false);
    setRows([])
    setTotalRows(0)
  };

  const handleRowClick = (row: any) => {
    onRowClick(row);
    if(props.clickClose) 
    handleClickClose();
  }

  // 조회시 검색 조건에 맞는 데이터 갱신 및 1페이지로 이동
  const handleAdvancedSearch = (event: React.FormEvent) => {
    setParams((prev) => ({ ...prev, page: 1, size:10 })) // 첫 페이지로 이동
    setFlag(!flag)
  }


  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handlePaginationModelChange = (page: number, pageSize: number) => {
    setParams((prev) => ({...prev, page: page, size: pageSize}));
    setFlag(!flag)
  }



  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target

    if(staticLocgovCd && name == 'ctpvCd' && staticLocgovCd.slice(0,2) !== value){
      alert('현재 관할관청이 아닙니다.')
      return 
    }
    if(staticLocgovCd && name == 'locgovCd' && staticLocgovCd !== value){
      alert('현재 관할관청이 아닙니다.')
      return 
    }


    setParams((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <Box>
    <Button variant="contained" color="dark" onClick={handleClickOpen}>
      {buttonLabel}
    </Button>
    <Dialog
      fullWidth={false}
      maxWidth={'lg'}
      open={open}
      onClose={handleClickClose}
    >
      <DialogContent>
        <Box className='table-bottom-button-group'>
          <CustomFormLabel className="input-label-display">
            <h2>{title}</h2>
          </CustomFormLabel>
          <div className=" button-right-align">
              <Button variant="contained" color="primary" onClick={(fetchData)}>검색</Button>
              <Button variant="contained" color="dark" onClick={(handleClickClose)}>취소</Button>
          </div>
        </Box>
        {/* 검색영역 시작 */}
        <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
          <Box className="sch-filter-box">
            <div className="filter-form">            
              <div className="form-group">
                <CustomFormLabel className="input-label-display" htmlFor="ft-select-01">
                  <span className="required-text" >*</span>시도명
                </CustomFormLabel>
              <CtpvSelect
                pValue={staticLocgovCd?.slice(0,2) ?? params.ctpvCd}
                handleChange={handleSearchChange}
                htmlFor={'sch-ctpv'}
              />
              </div>

              <div className="form-group">
                <CustomFormLabel className="input-label-display" htmlFor="ft-select-02">
                  <span className="required-text" >*</span>관할관청
                </CustomFormLabel>
                <LocgovSelect
                  ctpvCd={params.ctpvCd}
                  pValue={params.locgovCd}
                  defaultCd={staticLocgovCd}
                  handleChange={handleSearchChange}
                  htmlFor={'sch-locgov'}
                />
              </div>
            </div>
            <div className="filter-form">
              <div className="form-group">
                <CustomFormLabel
                  className="input-label-display"
                >
                  <span className="required-text" >*</span>차량번호
                </CustomFormLabel>
                <CustomTextField name="vhclNo" value={params.vhclNo} onChange={handleSearchChange}/>
              </div>
              <div className="form-group">
                <CustomFormLabel
                  className="input-label-display"
                >
                  <span className="required-text" >*</span>사업자등록번호
                </CustomFormLabel>
                <CustomTextField name="brno" value={params.brno} onChange={handleSearchChange}/>
              </div>
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
            onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
            pageable={pageable} // 현재 페이지 / 사이즈 정보
            paging={true}
          />
        </Box>
        {/* 테이블영역 끝 */}
      </DialogContent>
    </Dialog>
  </Box>
  );
}

export default TxVhclModal;
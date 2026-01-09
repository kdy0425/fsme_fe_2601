import { CustomFormLabel, CustomRadio, CustomSelect, CustomTextField } from '@/utils/fsms/fsm/mui-imports';
import { Box, Button, Dialog, DialogContent, FormControlLabel, MenuItem, RadioGroup, Table, TableBody, TableCell, TableContainer, TableRow } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation'

import PageContainer from '@/components/container/PageContainer'
import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'
import TableDataGrid from '@/app/components/tables/CommDataGrid'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils';

import { listParamObj } from '@/types/fsms/fsm/listParamObj'
import { HeadCell, Pageable  } from 'table'
import { getCtpvCd, getCommCd, getLocGovCd, getDateRange, isValidDateRange, sortChange, getExcelFile, getToday} from '@/utils/fsms/common/comm'
import { SelectItem } from 'select'

interface BsVhclModal {
  buttonLabel: string;
  title: string;
  url: string;
  onRowClick: (row: any) => void;
  clickClose?: boolean;
}

const headCells: HeadCell[] = [
  {
    id: 'brno',
    numeric: false,
    disablePadding: false,
    label: '사업자번호',
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
  }
]

export interface BsVhclRow {
  vhclNo:string //차량번호
  locgovNm:string //관할관청
  brno:string //사업자번호
  bzentyNm:string //업체명
  rprsvRrno:string //수급자주민번호
  koiCd:string //유종코드
  vhclSeCd:string //면허업종코드
  delYn:string //삭제여부
  dscntYn:string //할인여부
  locgovAprvYn:string //지자체승인여부
  crno:string //법인등록번호
  rprsvNm:string //대표자명
  zip:string //우편번호
  addr:string //주소
  telno:string //전화번호
  locgovCd:string //관할관청코드
  vhclSttsCd:string //차량상태코드
  rfidYn:string //RFID차량여부
  rgtrId:string //등록자아이디
  regDt:string //등록일자
  mdfrId:string //수정자아이디
  mdfcnDt:string //수정일자
  vhclSttsNm:string //차량상태
  dscntNm:string //할인여부
  koiNm:string //유종
  vhclSeNm:string //면허업종
  bzmnSeNm:string //개인법인구분
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  sort: string
  page: number
  size: number
  [key: string]: string | number // 인덱스 시그니처 추가
}

export const BsVhclModal = (props: BsVhclModal) => {
  const router = useRouter() // 화면이동을 위한객체
  const querys = useSearchParams() // 쿼리스트링을 가져옴

  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<BsVhclRow[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부

  const [ctpvCdItems, setCtpvCdItems] = useState<SelectItem[]>([]); // 시도 코드
  const [locgovCdItems, setLocgovCdItems] = useState<SelectItem[]>([]); // 관할관청 코드

  const {buttonLabel, title, url, onRowClick} = props;

  const [open, setOpen] = useState(false);

  const [params, setParams] = useState<listSearchObj>({
    page: 1, // 페이지 번호는 1부터 시작
    size: 10, // 기본 페이지 사이즈 설정
    sort: '' // 정렬 기준 추가
  });
  //
  const [pageable, setPageable] = useState<Pageable>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 5, // 기본 페이지 사이즈 설정
    sort: '', // 정렬 기준
  })

  useEffect(() => {
    if(params.ctpvCd || params.locgovCd) {
      fetchData()
    }
  }, [flag])

  // 초기 데이터 로드
  useEffect(() => {
    setFlag(!flag) 

    getCtpvCd().then((itemArr) => {
      setCtpvCdItems(itemArr);
      setParams((prev) => ({...prev, ctpvCd: itemArr[0].value})); // 첫번째 아이템으로 기본값 설정
    })// 시도코드 

  }, [])

  useEffect(() => { // 시도 코드 변경시 관할관청 재조회
    // 관할관청
    if(params.ctpvCd) {
      getLocGovCd(params.ctpvCd).then((itemArr) => {
        setLocgovCdItems(itemArr)
        setParams((prev) => ({...prev, locgovCd: itemArr[0].value})); // 첫번째 아이템으로 기본값 설정
      })
    }
  }, [params.ctpvCd])

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
          pageNumber: response.data.pageable.pageNumber +1,
          pageSize: response.data.pageable.pageSize,
          sort: params.sort,
        })
      } else {
        // 데이터가 없거나 실패
        setRows([])
        setTotalRows(0)
        setPageable({
          pageNumber: 1,
          pageSize: 5,
          sort: params.sort,
        })
      }
    } catch (error) {
      // 에러시
      setRows([])
      setTotalRows(0)
      setPageable({
        pageNumber: 1,
        pageSize: 10,
        sort: params.sort,
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

  // 페이지 이동 감지 시작 //
  // 검색시 검색 조건에 맞는 데이터 갱신 및 1페이지로 이동
  const handleAdvancedSearch = (event: React.FormEvent) => {
    event.preventDefault()
    setParams((prev) => ({ ...prev, page: 1 })) // 첫 페이지로 이동
    setFlag(!flag)
  }

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handlePaginationModelChange = (page: number, pageSize: number) => {
    setParams((prev) => ({
      ...prev,
      page: page + 1, // 실제 DB에서 조회시 -1을 하므로 +1 추가해서 넘겨야함. 페이지는 1로 보이지만 DB에선 0으로 조회
      size: pageSize,
    }))
    setFlag(!flag)
  }

  // 정렬시 데이터 갱신
  const handleSortModelChange = (sort: string) => {
    // 정렬 기준을 params에 업데이트
    setParams((prev) => ({ ...prev, sort: sort })) // 예: "ttl,asc"
    setFlag(!flag) // 정렬 기준이 변경되었으므로 데이터 재조회
  }

  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
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
                <select
                  id="ft-select-01"
                  className="custom-default-select"
                  name="ctpvCd"
                  onChange={handleSearchChange}
                  value={params.ctpvCd}
                  style={{ width: '100%' }}  
                >
                  {ctpvCdItems.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <CustomFormLabel className="input-label-display" htmlFor="ft-select-02">
                  <span className="required-text" >*</span>관할관청
                </CustomFormLabel>
                <select
                  id="ft-select-02"
                  className="custom-default-select"
                  name="locgovCd"
                  onChange={handleSearchChange}
                  value={params.locgovCd}
                  style={{ width: '100%' }}
                >
                  {locgovCdItems.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
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
            onSortModelChange={handleSortModelChange} // 정렬 모델 변경 핸들러 추가
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

export default BsVhclModal;
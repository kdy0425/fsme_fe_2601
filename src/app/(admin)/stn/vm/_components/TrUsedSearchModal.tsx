import {
  CustomFormLabel,
  CustomRadio,
  CustomSelect,
  CustomTextField,
} from '@/utils/fsms/fsm/mui-imports'
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  FormControlLabel,
  MenuItem,
  RadioGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@mui/material'
import React, { useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import PageContainer from '@/components/container/PageContainer'
import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'

import { listParamObj } from '@/types/fsms/fsm/listParamObj'
import { HeadCell, Pageable2 } from 'table'
import { SelectItem } from 'select'
import {
  CtpvSelect,
  LocgovSelect,
  CommSelect,
} from '@/app/components/tx/commSelect/CommSelect'
import { Row } from './TrPage'
import {stnVmUpdateVhcleBizTrHc} from '@/utils/fsms/headCells'
import TrNUsedModal from './TrNUsedModal'

interface TrUsedModalProps {
  title: string
  url: string
  open: boolean
  data : Row
  // onClickNew: () => void
  onCloseClick: () => void
  handleRedirect: () => void
}

export interface TrUsedRow {
  vhclNo: string;
  bzentyNm: string; // 업체명
  crno: string; // 법인등록번호
  crnoS: string; // 법인등록번호(복호화)
  rprsvNm: string; // 대표자명
  bzmnSeCd: string; // 사업자구분코드
  bzmnSeNm: string; // 사업자구분코드명
  vonrNm: string; // 차량소유자명
  vonrRrno: string;
  chgBfrCrno: string;
  chgBfrCoNm: string;
  chgBfrRprsvNm: string;
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  page: number
  size: number
  bzentyNm: string
  [key: string]: string | number // 인덱스 시그니처 추가
}

export const TrUsedSearchModal = (props: TrUsedModalProps) => {
  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [trUsedRow, setTrUsedRow] = useState<TrUsedRow>();
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부
  const [selectedRowIndex, setSelectedRowIndex] = useState<number>(-1)
  const { title, url, open,onCloseClick, data, handleRedirect} = props
  const [nUsedOpen, setNUsedOpen] = useState<boolean>(false);
  const [params, setParams] = useState<listSearchObj>({
    page: 1, // 페이지 번호는 1부터 시작
    size: 10, // 기본 페이지 사이즈 설정
    bzentyNm: '',
  })
  //
  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1, // 정렬 기준
  })



  useEffect(() => {
    setRows([])
    setTrUsedRow((prev) => ({...prev, 
      vhclNo: data.vhclNo,
      bzentyNm: '',
      crno: '',
      crnoS: '',
      rprsvNm: '',
      bzmnSeCd: '',
      bzmnSeNm: '',
      vonrNm: data.vonrNm,
      chgBfrCrno: data.crno,
      chgBfrCoNm: data.bzentyNm,
      chgBfrRprsvNm: data.rprsvNm,
      vonrRrno: data.vonrRrno,
    }));
    setParams({
      page: 1, // 페이지 번호는 1부터 시작
      size: 10, // 기본 페이지 사이즈 설정
      bzentyNm: '',
    })
    setPageable({
      pageNumber: 1, // 페이지 번호는 1부터 시작
      pageSize: 10, // 기본 페이지 사이즈 설정
      totalPages: 1, // 정렬 기준
    })
  }, [open])

  useEffect(() => {
    if (params.ctpvCd || params.locgovCd) {
      fetchData()
    }
  }, [flag])


  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    setLoading(true)
    try {

      if (!params.bzentyNm && !params.crno) {
        alert('업체명 또는 법인등록번호를 입력해주세요.')
        return
      }

      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `${url}?page=${params.page}&size=${params.size}&` +
        `${params.bzentyNm ? '&bzentyNm=' + params?.bzentyNm.replaceAll(' ', '') : ''}` +
        `${params.crno ? '&crno=' + params.crno : ''}`  
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
        setSelectedRowIndex(-1)
      } else {
        // 데이터가 없거나 실패
        setRows([])
        setTotalRows(0)
        setPageable({
          pageNumber: 1,
          pageSize: 10,
          totalPages: 1,
        })
        setSelectedRowIndex(-1)
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
      setSelectedRowIndex(-1)
    } finally {
      setLoading(false)
    }
  }

  // 페이지 이동 감지 시작 //
  // 검색시 검색 조건에 맞는 데이터 갱신 및 1페이지로 이동
  const handleAdvancedSearch = (event: React.FormEvent) => {
    event.preventDefault()
    setParams((prev) => ({ ...prev, page: 1, size: 10 })) // 첫 페이지로 이동
    setFlag(!flag)
  }

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handlePaginationModelChange = useCallback(
    (page: number, pageSize: number) => {
      setParams((prev) => ({
        ...prev,
        page: page, // 실제 DB에서 조회시 -1을 하므로 +1 추가해서 넘겨야함. 페이지는 1로 보이지만 DB에선 0으로 조회
        size: pageSize,
      }))
      setFlag((prev) => !prev)
    },
    [],
  )

  const onRowClick = useCallback((row: Row, rowIndex? : number) => {
      setSelectedRowIndex(rowIndex ?? -1)
      if(confirm('해당 지입사로 변경하시겠습니까?')){
        setTrUsedRow((prev) => ({...prev, 
          vhclNo: data.vhclNo,
          bzentyNm: row.bzentyNm,
          crno: row.crno,
          crnoS: row.crnoS,
          rprsvNm: row.rprsvNm,
          bzmnSeCd: row.bzmnSeCd,
          bzmnSeNm: row.bzentyNm,
          vonrNm: data.vonrNm,
          chgBfrCrno: data.crno,
          chgBfrCoNm: data.bzentyNm,
          chgBfrRprsvNm: data.rprsvNm,
          vonrRrno: data.vonrRrno,
        }));
        setNUsedOpen(true);
      }
    },[])
        

  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    const regex = /[~`!@#$%^&*_\-+={}[\]|\\:;"'<>,.?/]/g
    if(name == 'crno'){
      if(value.length > 14){
        return
      }else{
        setParams((prev) => ({ ...prev, page: 1, [name]: value.replaceAll(' ','') }))  
      }
    }else{
      setParams((prev) => ({ ...prev, page: 1, [name]: value.replaceAll(regex, '').replaceAll(' ','') }))
    }    
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      fetchData()
    }
  }

  const closeModal = () =>{
    setTrUsedRow((prev) => ({...prev, 
      vhclNo: data.vhclNo,
      bzentyNm: '',
      crno: '',
      crnoS: '',
      rprsvNm: '',
      bzmnSeCd: '',
      bzmnSeNm: '',
      vonrNm: data.vonrNm,
      chgBfrCrno: data.crno,
      chgBfrCoNm: data.bzentyNm,
      chgBfrRprsvNm: data.rprsvNm,
      vonrRrno: data.vonrRrno,
    }));
    setNUsedOpen(false)
    onCloseClick()
    //handleRedirect()
  }

  const modalClose = () => {
    setNUsedOpen(false);
  }

  const onClickNew = () => {
    setNUsedOpen(true)
    setTrUsedRow((prev) => ({...prev, 
      vhclNo: data.vhclNo,
      bzentyNm: '',
      crno: '',
      crnoS: '',
      rprsvNm: '',
      bzmnSeCd: '',
      bzmnSeNm: '',
      vonrNm: data.vonrNm,
      chgBfrCrno: data.crno,
      chgBfrCoNm: data.bzentyNm,
      chgBfrRprsvNm: data.rprsvNm,
      vonrRrno: data.vonrRrno,
    }));
  }

  return (
    <Box component="form" onSubmit={handleAdvancedSearch}>
      <Dialog
        fullWidth={false}
        maxWidth={'lg'}
        open={open}
        //onClose={onCloseClick}
        >
        <DialogContent>
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              <h2 >{title}</h2>
            </CustomFormLabel>
            <div className=" button-right-align">
              <Button variant="contained" color="primary" onClick={fetchData}>
                검색
              </Button>
              <Button
                variant="contained" color="primary"
                onClick={onClickNew}
              >
                등록
              </Button>
              <Button
                variant="contained"
                color="dark"
                onClick={onCloseClick}
              >
                취소
              </Button>
            </div>
          </Box>
          {/* 검색영역 시작 component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}*/}
          <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
            <Box className="sch-filter-box">
              <div className="filter-form">
                <div className="form-group">
                  <CustomFormLabel className="input-label-display" htmlFor="ft-bzentyNm">
                  <span className="required-text">*</span>업체명
                  </CustomFormLabel>
                  <CustomTextField
                    id="ft-bzentyNm"
                    name="bzentyNm"
                    value={params.bzentyNm}
                    onChange={handleSearchChange}
                    onKeyDown={handleKeyDown}
                  />
                </div>
                <div className="form-group">
                  <CustomFormLabel className="input-label-display" htmlFor="ft-crno">
                  <span className="required-text">*</span>법인등록번호
                  </CustomFormLabel>
                  <CustomTextField
                    id="ft-crno"
                    name="crno"
                    value={params.crno}
                    onChange={handleSearchChange}
                    onKeyDown={handleKeyDown}
                    type="number"
                  />
                </div>
              </div>
            </Box>
          </Box>
          {/* 검색영역 시작 */}

          {/* 테이블영역 시작 */}
          <Box>
            <TableDataGrid
              headCells={stnVmUpdateVhcleBizTrHc} // 테이블 헤더 값
              rows={rows} // 목록 데이터
              totalRows={totalRows} // 총 로우 수
              loading={loading} // 로딩여부
              onRowClick={onRowClick} // 행 클릭 핸들러 추가
              onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
              pageable={pageable} // 현재 페이지 / 사이즈 정보
              paging={true}
              cursor={false}
              selectedRowIndex={selectedRowIndex}
              caption={"화물 지입사 목록 조회"}
            />
          </Box>

          <>
            {nUsedOpen ? (
              <TrNUsedModal
                open={nUsedOpen}
                data={trUsedRow} 
                title={'신규 지입사변경'}
                onCloseClick={closeModal}
                reloadFunc={handleRedirect}
                onModalClose={modalClose}
              />
            ) : null}
          </>

          {/* 테이블영역 끝 */}
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default TrUsedSearchModal

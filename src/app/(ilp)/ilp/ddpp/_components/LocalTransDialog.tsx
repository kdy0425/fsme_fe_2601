'use client'
import {
  Box,
  Button,
  Table,
  TableContainer,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material'

import Dialog, { DialogProps } from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import React, { useEffect, useState } from 'react'

import { CustomFormLabel, CustomTextField } from '@/utils/fsms/fsm/mui-imports'
import { Row } from '../page'
import { sendHttpFileRequest, sendHttpRequest, sendMultipartFormDataRequest } from '@/utils/fsms/common/apiUtils';

import { ilgAaveeOrgTxHC } from '@/utils/fsms/headCells' // 지자체이첩 등록 HeadCell
import { getUserInfo } from '@/utils/fsms/utils' // 로그인 유저 정보
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop' // 백앤드 처리시 로딩

import BlankCard from '@/app/components/shared/BlankCard'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'

interface LocalTransDialogProps {
  title: string
  // children: React.ReactElement<ModalFormProps>; // ModalFormProps 타입의 ReactElement
  size?: DialogProps['maxWidth'] | 'lg'
  open: boolean
  selectedRows: Row[]
  reloadFunc: () => void
  closeLocalTransModal: (saveFlag: boolean) => void
}

export interface ddppDoubtDlngPbadmsPrcsReqstInfo {
  exmnNo?: string // 조사번호 연변
  locgovCd?: string //  지자체코드
  locgovNm?: string //  지자체명
  vhclNo?: string // 차량번호
  //vonrNm?: string // 수급자명
  bzentyNm: string // 수급자명 (vonrNm) 
  brno: string //사업자번호
  // tpbizCd?: string // 업종
  // bzmnSeCd: string // 법인/개인
  // tpbizSeCd?: string // 업종구분
  // droperYn?: string // 직영여부
  exmnRsltCn?: string // 조사결과내용
  rdmActnAmt?: string // 환수조치금액
  exmnRegYn?: string // 조사등록여부
  rdmTrgtNocs?: string | number | null // 환수대상건수 => 거래건수
  mdfrId?: string | number | null // 수정자아이디

  moliatAsstAmt?: string //유가보조금
  acmlAprvAmt?: string | number | null // 누적승인금액 =>  거래금액?
}

export default function LocalTransDialog(props: LocalTransDialogProps) {
  const {
    title,
    //children
    size,
    open,
    selectedRows,
    closeLocalTransModal,
    reloadFunc,
  } = props
  const [isEditMode, setIsEditMode] = useState<boolean>(false) // 등록 수정 모드 상태 관리
  // const [formData, setFormData] = useState<areaAvgVolExElctcReqstInfo>(); // 저장될 데이터를 관리하는 상태
  const [loading, setLoading] = useState(false) // 로딩여부
  const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 저장시 로딩상태

  const [textSearch, setTextSearch] = useState('')
  const [textReason, setTextReason] = useState('')

  const [flag, setFlag] = useState<boolean>(false) // 검색 플래그

  const [notInRows, setNotInRows] = useState<Row[]>(selectedRows) // 메인화면에서 가져온 로우 데이터
  const [rows, setRows] = useState<Row[]>([]) // 조회용

  const [rowIndex, setRowIndex] = useState(-1) // 선택한 행의 index를 저장하는 State
  const [selectedRowIndex, setSelectedRowIndex] = useState(-1) // 공통 그리드 설정용 파라미터
  const [selectedLocgovCd, setSelectedLocgovCd] = useState('') // 선택한 행의 지자체 코드를 저장하는 State

  // 로그인 유저 정보 조회
  const userInfo = getUserInfo()
  const userLoginId = userInfo.lgnId
  const userlocgovCd = userInfo.locgovCd

  // 저장될 데이터를 관리하는 상태
  const [formData, setFormData] = useState<ddppDoubtDlngPbadmsPrcsReqstInfo>({
    exmnNo: '', // 조사번호 연변
    locgovCd: '', //  지자체코드
    locgovNm: '', //  지자체명
    vhclNo: '', // 차량번호
    //vonrNm: '', // 수급자명
    bzentyNm: '', // 수급자명 (vonrNm) 
    brno: '', //사업자등록번호
    // tpbizCd: '', // 업종
    // bzmnSeCd: '', // 법인/개인
    // tpbizSeCd: '', // 업종구분
    // droperYn: '', // 직영여부
    exmnRsltCn: '', // 조사결과내용
    rdmActnAmt: '', // 환수조치금액
    exmnRegYn: '', // 조사등록여부
    rdmTrgtNocs: '', // 환수대상건수
    mdfrId: '', // 수정자아이디

    moliatAsstAmt: '', //유가 보조금
    acmlAprvAmt: '', //누적승인금액 =>  거래금액?
  })

  // 행 클릭 시 호출되는 함수
  const handleRowClick = async (
    rowData: Row,
    rowIndex: number,
    colIndex: number,
  ) => {
    setRowIndex(rowIndex)
    setSelectedRowIndex(rowIndex)
    setSelectedLocgovCd(rowData.locgovCd)
  }

  // 다이얼로그 닫기 핸들러
  const handleCloseModal = () => {
    setIsEditMode(false)    // 닫을 때 수정 모드 초기화
    closeLocalTransModal(false) // 닫을 때 재조회 방지
  }

  const handleTextSearch = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setTextSearch(event.target.value)
  }

  const handleTextReason = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setTextReason(event.target.value)
  }

  // 엔터 키 입력시 조회 이벤트
  const handleEnterKey = (event: any) => {
    if (event.key === 'Enter') {
      setFlag(!flag)
    }
  }

  // 검색시 검색 조건에 맞는 데이터 갱신 및 1페이지로 이동
  const handleLocgovSearch = async () => {
    setFlag(!flag)
  }

  // 지자체 이관 요청 등록
  const handleLocgovSave = async () => {
    createDoubtLocalTransReq()
  }

  // 탭 영역 조회
  useEffect(() => {
    fetchSearch()
  }, [flag])

  const fetchSearch = async () => {
    try {
      setLoading(true)

      let notOrgList: string = ''

      selectedRows.forEach((row, idx) => {
        notOrgList = notOrgList + row.locgovCd
        if (idx < selectedRows.length - 1) {
          notOrgList = notOrgList + ','
        }
      })

      let endpoint: string =
        `/ilp/ddpp/bs/getAllDoubtOrgList?` +
        `${notOrgList ? '&notOrgList=' + notOrgList : ''}` +
        `${textSearch ? '&orgNm=' + textSearch : ''}` +
        `${userlocgovCd ? '&locgovCd=' + userlocgovCd : ''}`

      let response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        setRows(response.data)
      } else {
        // 데이터가 없거나 실패
        setRows([])
      }
    } catch (error) {
      // 에러시
      console.error('Error Search Data:', error)
    } finally {
      setLoading(false)
    }
  }

  // 기간별 조사대상 확정 처리
  const createDoubtLocalTransReq = async () => {
    if (selectedLocgovCd === '') {
      alert('이첩 요청할 지자체를 선택하세요.')
      return
    }

    if (textReason === '') {
      alert('이첩 사유는 필수 입력 항목입니다.')
      return
    }

    const cancelConfirm: boolean = confirm(
      '차량 지자체 이첩을 요청하시겠습니까?',
    )
    if (!cancelConfirm) return

    try {
      setLoadingBackdrop(true)

      let param: any[] = []

      selectedRows.map((row) => {
        param.push({
          exmnNo: row.exmnNo,
          exsLocgovCd: row.locgovCd,

          chgLocgovCd: selectedLocgovCd,
          trnsfRsnCn: textReason,
          rgtrId: userLoginId,
          mdfrId: userLoginId,
          vhclNo: row.vhclNo,
          bzentyNm: row.bzentyNm,
          brno: row.brno,
          //vonrNm: row.vonrNm,
          //vonrBrno: row.brno,
          aprvYm: row.aprvYm,
        })
      })

      const body = { ddppDoubtDlngPbadmsPrcsReqstDto: param }

      const endpoint: string = `/ilp/ddpp/bs/createDoubtLocalTransReq`
      const response = await sendHttpRequest('POST', endpoint, body, true, {
        cache: 'no-store',
      })

      if (response && response.data > 0) {
        alert('차량 지자체 이첩 요청이 완료되었습니다.')
      } else {
        alert('차량 지자체 이첩 요청 내역이 없습니다.')
      }
    } catch (error) {
      alert('차량 지자체 이첩 요청에 실패하였습니다.')
      console.error('ERROR POST DATA : ', error)
    } finally {
      setLoadingBackdrop(false)
      setIsEditMode(false)
      closeLocalTransModal(true)    // 닫을 때 재조회 처리
    }
  }

  return (
    <React.Fragment>
      <Dialog
        fullWidth={false}
        maxWidth={size}
        open={open}
        onClose={handleCloseModal}
      >
        <DialogContent>
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              <h2>지자체이첩</h2>
            </CustomFormLabel>
            <div className="button-right-align">
              <LoadingBackdrop open={loadingBackdrop} />
              <Button
                variant="contained"
                color="primary"
                onClick={handleLocgovSearch}
              >
                검색
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleLocgovSave}
              >
                저장
              </Button>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleCloseModal}
              >
                취소
              </Button>
            </div>
          </Box>
          <Box
            id="form-modal"
            component="form"
            onSubmit={(e) => {
              e.preventDefault()
              setIsEditMode(false)
              alert('Form Submitted') // 실제 제출 로직 추가
            }}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              m: 'auto',
              width: 'full',
            }}
          >
            <Box sx={{ maxWidth: 'fullWidth', margin: '0 auto' }}>
              <TableContainer style={{ margin: '0px 0px 0px 0px' }}>
                <Table
                  className="table table-bordered"
                  aria-labelledby="tableTitle"
                  style={{ tableLayout: 'fixed', width: '792px' }}
                >
                  <TableBody>
                    <TableRow>
                      <TableCell
                        className="td-head"
                        style={{ width: '130px', verticalAlign: 'middle' }}
                      >
                        <span className="required-text">*</span> 지자체명
                      </TableCell>
                      <TableCell style={{ textAlign: 'right' }}>
                        <CustomTextField
                          type="text"
                          id="txtSearch"
                          name="locgovNm"
                          onChange={handleTextSearch}
                          onKeyDown={(event: any) => handleEnterKey(event)}
                          value={textSearch}
                          fullWidth
                        />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
            <Box sx={{ maxWidth: 'fullWidth', margin: '0 auto' }}>
              <BlankCard className="contents-card" title="지자체검색">
                <Box
                  style={{
                    width: '750px',
                    maxHeight: '380px',
                    overflowY: 'auto',
                  }}
                >
                  <TableDataGrid
                    headCells={ilgAaveeOrgTxHC} // 테이블 헤더 값
                    rows={rows} // 목록 데이터
                    // totalRows={rows.length} // 총 로우 수
                    loading={loading} // 로딩여부
                    onRowClick={
                      (Row, rowIndex, colIndex) => {
                        handleRowClick(
                          Row,
                          rowIndex ? rowIndex : 0,
                          colIndex ? colIndex : 0,
                        )
                      } // 행 클릭 핸들러 추가
                    }
                    selectedRowIndex={selectedRowIndex}
                    paging={false}
                  />
                </Box>
              </BlankCard>
            </Box>
            <Box sx={{ maxWidth: 'fullWidth', margin: '0 auto' }}>
              <TableContainer style={{ margin: '0px 0px 0px 0px' }}>
                <Table
                  className="table table-bordered"
                  aria-labelledby="tableTitle"
                  style={{ tableLayout: 'fixed', width: '792px' }}
                >
                  <TableBody>
                    <TableRow>
                      <TableCell
                        className="td-head"
                        style={{ width: '130px', verticalAlign: 'middle' }}
                      >
                        <span className="required-text">*</span> 이첩사유
                      </TableCell>
                      <TableCell style={{ textAlign: 'right' }}>
                        <CustomTextField
                          type="text"
                          id="txtReason"
                          name="trnsfRsnCn"
                          onChange={handleTextReason}
                          value={textReason}
                          fullWidth
                        />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  )
}

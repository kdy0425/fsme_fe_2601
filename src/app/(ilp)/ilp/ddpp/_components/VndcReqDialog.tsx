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
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import React, { useEffect, useState } from 'react'
import Dialog, { DialogProps } from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import AdminProcessDialog from './AdminProcessDialog'

import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import BlankCard from '@/app/components/shared/BlankCard'

import { CustomFormLabel, CustomTextField } from '@/utils/fsms/fsm/mui-imports'

import { Row } from '../page'

import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import { getUserInfo } from '@/utils/fsms/utils' // 로그인 유저 정보
import { ilpCommVndcReqPopHC } from '@/utils/fsms/ilp/headCells' // 소명요청 등록HeadCell

interface VndcReqDialogProps {
  title: string
  size?: DialogProps['maxWidth'] | 'lg'
  open: boolean
  selectedRows: Row[]
  reloadFunc: () => void
  closeVndcReqModal: (saveFlag: boolean) => void
}

export interface areaAvgVolExElctcReqstInfo {
  chk: string // 체크여부
  exmnNo: string // 조사번호 연변
  locgovCd: string //  지자체코드
  locgovNm: string //  지자체명
  vhclNo: string // 차량번호
  bzentyNm: string // 수급자명 (vonrNm)
  vndcDmndCn: string // 소명요청내용
  mdfrId: string // 수정자아이디
  dlngNocs: string // 거래건수
  totlAprvAmt: string // 거래금액
  totlAsstAmt: string // 유가보조금
  rdmActnAmt: string // 환수조치액
}

export default function VndcReqDialog(props: VndcReqDialogProps) {
  const {
    title,
    //children
    size,
    open,
    selectedRows,
    closeVndcReqModal,
    reloadFunc,
  } = props

  const [isEditMode, setIsEditMode] = useState<boolean>(false) // 등록 수정 모드 상태 관리

  const [loading, setLoading] = useState(false) // 로딩여부
  const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 저장시 로딩상태

  const [rows, setRows] = useState<Row[]>(selectedRows) // 가져온 로우 데이터
  const [checkedRows, setCheckedRows] = useState<Row[]>([]) // 팝업 목록에서 선택된 행
  const [checkArray, setCheckArray] = useState<string[]>([]) // 체크된 아이디(인덱스) 배열

  const userInfo = getUserInfo() // 로그인 유저 정보 조회
  const userLoginId = userInfo.lgnId

  const [adminProcessModalFlag, setAdminProcessModalFlag] = useState(false) // 행정처분 등록 모달

  // 저장될 데이터를 관리하는 상태
  const [formData, setFormData] = useState<areaAvgVolExElctcReqstInfo>({
    chk: '', // 체크여부
    exmnNo: '', // 조사번호 연변
    locgovCd: '', //  지자체코드
    locgovNm: '', //  지자체명
    vhclNo: '', // 차량번호
    bzentyNm: '', // 수급자명
    vndcDmndCn: '', // 소명요청내용
    mdfrId: '', // 수정자아이디
    dlngNocs: '', // 거래건수
    totlAprvAmt: '', // 거래금액
    totlAsstAmt: '', // 유가보조금
    rdmActnAmt: '', // 환수조치액
  })

  // 검색 조건이 변경되면 자동으로 쿼리스트링 변경
  useEffect(() => {
    rowChangeMap(formData)
  }, [formData])

  // 체크된 항목만 담기
  useEffect(() => {
    setRows(rows)

    const checkRows = rows.filter((row) => {
      return row.chk === '1'
    })
    setCheckedRows(checkRows)
  }, [rows])

  // 다이얼로그 닫기 핸들러
  const handleCloseModal = () => {
    setIsEditMode(false) // 닫을 때 수정 모드 초기화
    closeVndcReqModal(false) // 닫을 때 재조회 방지
  }

  // 행정처분 등록 모달 열기
  const openAdminProcessModal = async () => {
    checkedRows.map((row) => {
      row.chk = '0'
    }) // 행정처분 등록 화면 이동시 체크 해제
    setCheckedRows(checkedRows)

    setAdminProcessModalFlag(true)
  }

  // 행정처분 등록 모달 닫기
  const closeAdminProcessModal = async (saveFlag: boolean) => {
    setAdminProcessModalFlag((prev) => false)
    if (saveFlag) {
      setIsEditMode(false) // 닫을 때 수정 모드 초기화
      closeVndcReqModal(true) // 닫을 때 재조회 처리
    } else {
      checkedRows.map((row) => {
        row.chk = '1'
      }) // 행정처분 등록 화면 취소시 체크 복원
      setCheckedRows(checkedRows)
    }
  }

  // 모달 새고로침
  const handleModalReload = () => {
    // setParams((prev) => ({ ...prev, page: 1 })) // 첫 페이지로 이동
  }

  const handleParamChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }
  //체크 항목을 저장 rows 에 담음
  const handleCheckChange = (selected: string[]) => {
    if (selected.length > checkArray.length) {
      bindFormData(
        rows[Number(selected[selected.length - 1].replace('tr', ''))],
      )
    } else {
      initFormData()
    }

    setCheckArray(selected)

    let checkRows: Row[] = []

    for (var i = 0; i < rows.length; i++) {
      let isCheck = false
      for (var j = 0; j < selected.length; j++) {
        if (Number(selected[j].replace('tr', '')) === i) {
          isCheck = true
        }
      }

      if (isCheck) {
        rows[i].chk = '1'
      } else {
        rows[i].chk = '0'
      }

      checkRows.push(rows[i])
    }

    setRows(checkRows)
  }

  // 입력 폼 데이터 초기화
  const initFormData = async () => {
    formData.chk = '' // 체크유무
    formData.exmnNo = '' // 조사번호 연변
    formData.locgovCd = '' //  지자체코드
    formData.locgovNm = '' //  지자체명
    formData.vhclNo = '' // 차량번호
    formData.bzentyNm = '' // 수급자명
    formData.vndcDmndCn = '' // 소명요청내용
    formData.dlngNocs = '' // 거래건수
    formData.totlAprvAmt = '' // 거래금액
    formData.totlAsstAmt = '' // 유가보조금
    formData.rdmActnAmt = '' // 환수조치액

    setFormData((prev) => ({ ...prev }))
  }

  // 입력 폼 데이터 초기화
  const bindFormData = async (selectedRow: Row) => {
    //선택된 행을 담음
    formData.chk = selectedRow.chk // 체크유무
    formData.exmnNo = selectedRow.exmnNo // 조사번호 연변
    formData.locgovCd = selectedRow.locgovCd //  지자체코드
    formData.locgovNm = '' //  지자체명
    formData.vhclNo = selectedRow.vhclNo // 차량번호
    formData.bzentyNm = selectedRow.bzentyNm // 수급자명
    formData.vndcDmndCn = selectedRow.vndcDmndCn // 소명요청내용
    formData.dlngNocs = selectedRow.dlngNocs // 거래건수
    formData.totlAprvAmt = selectedRow.totlAprvAmt // 거래금액
    formData.totlAsstAmt = selectedRow.totlAsstAmt // 유가보조금
    formData.rdmActnAmt = selectedRow.rdmActnAmt // 환수조치액

    setFormData((prev) => ({ ...prev }))
  }

  // 행 클릭 시 호출되는 함수
  const handleRowClick = (selectedRow: Row) => {}

  // 변경된 formData를 rows 에 반영
  const rowChangeMap = (changeRow: areaAvgVolExElctcReqstInfo) => {
    if (rows && changeRow) {
      const tempRows = rows.map((map) => {
        if (map.exmnNo == changeRow.exmnNo) {
          return {
            ...map,
            vndcDmndCn: changeRow.vndcDmndCn,
          }
        } else {
          return { ...map }
        }
      })
      setRows(tempRows)
    }
  }

  // 콤마 설정
  function setCommaAmt(value: string | number | null | undefined) {
    if (value === '') return

    if (value === formData.dlngNocs && formData.dlngNocs != undefined) {
      const removedCommaValue: number = Number(
        formData.dlngNocs.toString().replaceAll(',', ''),
      )
      formData.dlngNocs = removedCommaValue.toLocaleString()
    }

    if (value === formData.totlAprvAmt && formData.totlAprvAmt != undefined) {
      const removedCommaValue: number = Number(
        formData.totlAprvAmt.toString().replaceAll(',', ''),
      )
      formData.totlAprvAmt = removedCommaValue.toLocaleString()
    }

    if (value === formData.totlAsstAmt && formData.totlAsstAmt != undefined) {
      const removedCommaValue: number = Number(
        formData.totlAsstAmt.toString().replaceAll(',', ''),
      )
      formData.totlAsstAmt = removedCommaValue.toLocaleString()
    }
  }

  // 유효성 검사
  function checkValidation() {
    let isCheck = false
    let isVndcDmndCn = false

    let checkRows: any[] = []
    rows.map((row) => {
      if (row.chk === '1') {
        isCheck = true

        if (!(row.vndcDmndCn ?? '').trim()) {
          isVndcDmndCn = true
        }
        checkRows.push(row)
      }
    })

    if (!isCheck) {
      alert('선택된 소명요청 등록정보가 없습니다.')
      return []
    }
    if (isVndcDmndCn) {
      alert('소명요청내용을 입력하지 않은 건이 존재합니다.')
      return []
    }

    setCheckedRows(checkRows)

    return checkRows
  }

  // 소명요청 등록 처리
  const updateDoubtInvestigationResult = async () => {
    const checkRows: any[] = checkValidation() // 유효성 검사

    if (checkRows.length < 1) return

    const cancelConfirm: boolean = confirm('소명요청를 등록하시겠습니까?')
    if (!cancelConfirm) return

    try {
      setLoadingBackdrop(true)

      let param: any[] = []
      checkRows.map((row) => {
        param.push({
          exmnNo: row.exmnNo,
          locgovCd: row.locgovCd,
          locgovNm: row.locgovNm,
          vhclNo: row.vhclNo,
          bzentyNm: row.bzentyNm,
          vndcDmndCn: row.vndcDmndCn,
          mdfrId: userLoginId,
          exmnRegYn: row.exmnRsltCn && row.exmnRsltCn.trim() !== '' ? 'Y' : 'N',
        })
      })

      const body = { ddppDoubtDlngPbadmsPrcsReqstDto: param }

      const endpoint: string = `/ilp/ddpp/bs/upsertVndcReq`
      const response = await sendHttpRequest('PUT', endpoint, body, true, {
        cache: 'no-store',
      })

      if (response && response.data > 0) {
        alert('소명요청 등록이 완료되었습니다.')
      } else {
        alert('소명요청 등록 내역이 없습니다.')
      }
    } catch (error) {
      alert('소명요청 등록에 실패하였습니다.')
      console.error('ERROR POST DATA : ', error)
    } finally {
      setLoadingBackdrop(false)
      setIsEditMode(false) // 닫을 때 수정 모드 초기화
      closeVndcReqModal(true) // 닫을 때 재조회 처리
    }
  }

  // 행정처분 등록 팝업으로 이동
  const handleNextPopup = async () => {
    // 1) 체크된 행만 확인
    const checkRows: Row[] = (rows || []).filter(r => r.chk === '1')

    if (checkRows.length < 1) {
      alert('선택된 소명요청 대상이 없습니다.')
      return
    }

    // 저장 여부 확인
    const wantSave = confirm('행정처분등록 전에 소명요청을 저장하시겠습니까?')

    if (wantSave) {
      // 저장 버튼 누르도록 안내만 (여기서 저장하지 않음)
      alert('먼저 [저장] 버튼을 눌러 저장한 뒤, 다시 [다음]을 눌러 진행해 주세요.')
      return
    }

    // 취소 = 저장 없이 다음 모달 이동
    openAdminProcessModal()
  }

  // 소명요청 등록
  const handleResultSave = async () => {
    updateDoubtInvestigationResult()
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
              <h2>소명요청 등록</h2>
            </CustomFormLabel>
            <div className="button-right-align">
              <LoadingBackdrop open={loadingBackdrop} />
              <Button
                variant="outlined"
                color="primary"
                onClick={handleNextPopup}
              >
                다음
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleResultSave}
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
          <BlankCard className="contents-card" title="소명요청 등록">
            <TableContainer style={{ maxHeight: '286px' }}>
              <TableDataGrid
                headCells={ilpCommVndcReqPopHC} // 테이블 헤더 값
                rows={rows} // 목록 데이터
                loading={loading} // 로딩여부
                onRowClick={handleRowClick} // 행 클릭 핸들러 추가
                checkAndRowClick={true} // 행클릭 시 체크 기능 추가
                paging={false}
                onCheckChange={handleCheckChange}
              />
            </TableContainer>
          </BlankCard>
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
            <BlankCard className="contents-card" title="환수정보">
              <Box sx={{ maxWidth: 'fullWidth', margin: '0 auto' }}>
                <TableContainer style={{ margin: '0 0 0 0' }}>
                  <Table
                    className="table table-bordered"
                    aria-labelledby="tableTitle"
                    style={{ tableLayout: 'fixed', width: '100%' }}
                  >
                    <TableBody>
                      <TableRow>
                        <TableCell
                          className="td-head"
                          style={{ width: '120px', verticalAlign: 'middle' }}
                        >
                          거래건수
                        </TableCell>
                        <TableCell>
                          <CustomTextField
                            sx={{
                              '& input': { textAlign: 'right' },
                              paddingRight: '3px',
                            }}
                            type="text"
                            id="dlngNocs"
                            name="dlngNocs"
                            value={formData.dlngNocs}
                            onChange={setCommaAmt(formData.dlngNocs)}
                            disabled={true}
                            fullWidth
                          />
                        </TableCell>
                        <TableCell
                          className="td-head"
                          style={{ width: '120px', verticalAlign: 'middle' }}
                        >
                          거래금액
                        </TableCell>
                        <TableCell>
                          <CustomTextField
                            sx={{
                              '& input': { textAlign: 'right' },
                              paddingRight: '3px',
                            }}
                            type="text"
                            id="totlAprvAmt"
                            name="totlAprvAmt"
                            value={formData.totlAprvAmt}
                            onChange={setCommaAmt(formData.totlAprvAmt)}
                            disabled={true}
                            fullWidth
                          />
                        </TableCell>
                        <TableCell
                          className="td-head"
                          style={{ width: '120px', verticalAlign: 'middle' }}
                        >
                          유가보조금
                        </TableCell>
                        <TableCell>
                          <CustomTextField
                            sx={{
                              '& input': { textAlign: 'right' },
                              paddingRight: '3px',
                            }}
                            type="text"
                            id="totlAsstAmt"
                            name="totlAsstAmt"
                            value={formData.totlAsstAmt}
                            onChange={setCommaAmt(formData.totlAsstAmt)}
                            disabled={true}
                            fullWidth
                          />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </BlankCard>
            <BlankCard className="contents-card" title="소명요청 등록정보">
              <Box sx={{ maxWidth: 'fullWidth', margin: '0 auto' }}>
                <TableContainer style={{ margin: '0 0 0 0' }}>
                  <Table
                    className="table table-bordered"
                    aria-labelledby="tableTitle"
                    style={{ tableLayout: 'fixed', width: '100%' }}
                  >
                    <TableBody>
                      <TableRow>
                        <TableCell
                          className="td-head"
                          style={{ width: '120px', verticalAlign: 'middle' }}
                        >
                          <span className="required-text">*</span>소명요청내용
                        </TableCell>
                        <TableCell
                          colSpan={5}
                          style={{
                            width: 'calc(50% - 150px)',
                            textAlign: 'left',
                          }}
                        >
                          <CustomTextField
                            type="text"
                            id="modal-ttl"
                            name="vndcDmndCn"
                            onChange={handleParamChange}
                            value={formData.vndcDmndCn ?? ''}
                            fullWidth
                          />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </BlankCard>
          </Box>
        </DialogContent>
      </Dialog>
      {/* 행정처분 등록 모달 */}
      <div>
        {adminProcessModalFlag && (
          <AdminProcessDialog
            size="lg"
            title="행정처분 등록"
            reloadFunc={handleModalReload}
            closeAdminProcessModal={closeAdminProcessModal}
            selectedRows={checkedRows}
            open={adminProcessModalFlag}
          ></AdminProcessDialog>
        )}
      </div>
    </React.Fragment>
  )
}

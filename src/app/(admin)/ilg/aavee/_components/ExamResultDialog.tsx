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

import React, { useEffect, useState } from 'react'
import Dialog, { DialogProps } from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import AdminProcessDialog from './AdminProcessDialog'

import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import BlankCard from '@/app/components/shared/BlankCard'

import { CustomFormLabel, CustomTextField } from '@/utils/fsms/fsm/mui-imports'
import {
  sendHttpFileRequest,
  sendHttpRequest,
  sendMultipartFormDataRequest,
} from '@/utils/fsms/common/apiUtils'
import {
  CtpvSelect,
  LocgovSelect,
  CommSelect,
} from '@/app/components/tx/commSelect/CommSelect'
import {
  getCityCodes,
  getCodesByGroupNm,
  getLocalGovCodes,
} from '@/utils/fsms/common/code/getCode'

import { Row } from '../page'
import { SelectItem } from 'select'

import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import { getUserInfo } from '@/utils/fsms/utils' // 로그인 유저 정보
import { ilgAaveeRegisterTxHC } from '@/utils/fsms/headCells' // 조사결과 등록HeadCell

interface ExamResultDialogProps {
  title: string
  // children: React.ReactElement<ModalFormProps>; // ModalFormProps 타입의 ReactElement
  size?: DialogProps['maxWidth'] | 'lg'
  open: boolean
  selectedRows: Row[]
  reloadFunc: () => void
  closeExamResultModal: (saveFlag: boolean) => void
}

export interface areaAvgVolExElctcReqstInfo {
  chk: string // 체크여부
  exmnNo: string // 조사번호 연변
  locgovCd: string //  지자체코드
  locgovNm: string //  지자체명
  vhclNo: string // 차량번호
  vonrNm: string // 수급자명
  tpbizCd: string // 업종
  bzmnSeCd: string // 법인/개인 코드
  bzmnSeNm: string // 법인/개인 명칭
  tpbizSeCd: string // 업종구분
  droperYn: string // 직영여부
  exmnRsltCn: string // 조사결과내용
  exmnRegYn: string // 조사등록여부
  mdfrId: string // 수정자아이디
  dlngNocs: string // 거래건수
  totlAprvAmt: string // 거래금액
  totlAsstAmt: string // 유가보조금
  rdmActnAmt: string // 환수조치액
}

export default function ExamResultDialog(props: ExamResultDialogProps) {
  const {
    title,
    //children
    size,
    open,
    selectedRows,
    closeExamResultModal,
    reloadFunc,
  } = props

  const [isEditMode, setIsEditMode] = useState<boolean>(false) // 등록 수정 모드 상태 관리

  const [loading, setLoading] = useState(false) // 로딩여부
  const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 저장시 로딩상태

  const [rows, setRows] = useState<Row[]>(selectedRows) // 가져온 로우 데이터
  const [checkedRows, setCheckedRows] = useState<Row[]>([]) // 팝업 목록에서 선택된 행

  const [disabled, setDisabled] = useState<boolean>(true) // 데이터 입력 위한 플래그 설정

  const [rdmActnAmt, setRdmActnAmt] = useState<string>('') // 환수조치액

  const [bzmnSeCdItems, setBzmnSeCdItems] = useState<SelectItem[]>([]) // 사업자 구분

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
    vonrNm: '', // 수급자명
    tpbizCd: '', // 업종
    bzmnSeCd: '', // 법인/개인 코드
    bzmnSeNm: '', // 법인/개인 명칭
    tpbizSeCd: '', // 업종구분
    droperYn: '', // 직영여부
    exmnRsltCn: '', // 조사결과내용
    exmnRegYn: '', // 조사등록여부
    mdfrId: '', // 수정자아이디
    dlngNocs: '', // 거래건수
    totlAprvAmt: '', // 거래금액
    totlAsstAmt: '', // 유가보조금
    rdmActnAmt: '', // 환수조치액
  })

  // 코드 파싱을 위한 item 세팅
  useEffect(() => {
    // 개인법인구분(택시) 706
    getCodesByGroupNm('706').then((res) => {
      let itemArr: SelectItem[] = []
      if (res) {
        res.map((code: any) => {
          let item: SelectItem = {
            label: code['cdKornNm'],
            value: code['cdNm'],
          }

          itemArr.push(item)
        })
      }
      setBzmnSeCdItems(itemArr)
    })
  }, [])

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
    closeExamResultModal(false) // 닫을 때 재조회 방지
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
      closeExamResultModal(true) // 닫을 때 재조회 처리
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

  // 수정 모드 토글
  const handleEditToggle = () => {
    setIsEditMode(!isEditMode) // 수정 모드 토글
  }

  // 데이터 변경 핸들러
  const handleFormDataChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleParamChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleComboChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target

    if (value === '0') {
      formData.bzmnSeNm = '법인'
    } else {
      formData.bzmnSeNm = '개인'
    }

    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  //체크 항목을 저장 rows 에 담음
  const handleCheckChange = (selected: string[]) => {
    if (selected.length > checkArray.length) {
      setDisabled(false)
      bindFormData(
        rows[Number(selected[selected.length - 1].replace('tr', ''))],
      )
    } else {
      setDisabled(true)
      setRdmActnAmt('')
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
    formData.vonrNm = '' // 수급자명
    formData.tpbizCd = '' // 업종?
    formData.bzmnSeCd = '' // 법인/개인 코드
    formData.bzmnSeNm = '' // 법인/개인 명칭
    formData.tpbizSeCd = '' // 업종구분?
    formData.droperYn = '' // 직영여부?
    formData.exmnRsltCn = '' // 조사결과내용
    formData.exmnRegYn = '' // 조사등록여부
    formData.dlngNocs = '' // 거래건수
    formData.totlAprvAmt = '' // 거래금액
    formData.totlAsstAmt = '' // 유가보조금
    formData.rdmActnAmt = '' // 환수조치액

    setFormData((prev) => ({ ...prev }))
  }

  // 입력 폼 데이터 초기화
  const bindFormData = async (selectedRow: Row) => {
    // 환수조치액 설정 및 제거 처리
    if (
      selectedRow.rdmActnAmt !== '' &&
      selectedRow.rdmActnAmt !== null &&
      selectedRow.rdmActnAmt !== undefined
    ) {
      setRdmActnAmt(selectedRow.rdmActnAmt)
    } else {
      setRdmActnAmt('0')
    }

    //선택된 행을 담음
    formData.chk = selectedRow.chk // 체크유무
    formData.exmnNo = selectedRow.exmnNo // 조사번호 연변
    formData.locgovCd = selectedRow.locgovCd //  지자체코드
    formData.locgovNm = '' //  지자체명
    formData.vhclNo = selectedRow.vhclNo // 차량번호
    formData.vonrNm = selectedRow.vonrNm // 수급자명
    formData.tpbizCd = '' // 업종?
    formData.bzmnSeCd = selectedRow.bzmnSeCd // 법인/개인 코드
    formData.bzmnSeNm = selectedRow.bzmnSeNm // 법인/개인 명칭
    formData.tpbizSeCd = '' // 업종구분?
    formData.droperYn = '' // 직영여부?
    formData.exmnRsltCn = selectedRow.exmnRsltCn // 조사결과내용
    formData.exmnRegYn = 'Y' // 조사등록여부?
    // formData.mdfrId = selectedRow.mdfrId. // 수정자아이디? 세션에서 가져와야 하나?
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
            bzmnSeCd: changeRow.bzmnSeCd,
            bzmnSeNm: changeRow.bzmnSeNm,
            rdmActnAmt: changeRow.rdmActnAmt,
            exmnRsltCn: changeRow.exmnRsltCn,
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

  // 환수조치액 설정
  const changeRdmActnAmt = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value: string = event.target.value
    const removedCommaValue: number = Number(value.replaceAll(',', ''))

    if (isNaN(removedCommaValue)) {
      setFormData((prev) => ({ ...prev, rdmActnAmt: '' }))
      return
    }

    setRdmActnAmt(removedCommaValue.toLocaleString())
    formData.rdmActnAmt = removedCommaValue.toString()
    setFormData((prev) => ({
      ...prev,
      rdmActnAmt: removedCommaValue.toString(),
    }))
  }

  // 유효성 검사
  function checkValidation() {
    let isCheck = false
    let isNotAmt = false
    let isNotBzmn = false

    let checkRows: any[] = []
    rows.map((row) => {
      if (row.chk === '1') {
        isCheck = true
        if (row.rdmActnAmt === null) {
          isNotAmt = true
        } else {
          row.rdmActnAmt = row.rdmActnAmt?.replaceAll(',', '')
        }
        if (row.bzmnSeCd === null) {
          isNotBzmn = true
        }
        checkRows.push(row)
      }
    })

    if (!isCheck) {
      alert('선택된 조사결과 등록정보가 없습니다.')
      return []
    }
    if (isNotAmt) {
      alert('환수조치액을 입력하지 않은 건이 존재합니다.')
      return []
    }
    if (isNotBzmn) {
      alert('개인/법인을 선택하지 않은 건이 존재합니다.')
      return []
    }

    setCheckedRows(checkRows)

    return checkRows
  }

  // 조사결과 등록 처리
  const updateDoubtInvestigationResult = async () => {
    const checkRows: any[] = checkValidation() // 유효성 검사

    if (checkRows.length < 1) return

    const cancelConfirm: boolean = confirm('조사결과를 등록하시겠습니까?')
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
          vonrNm: row.vonrNm,
          bzmnSeCd: row.bzmnSeCd,
          tpbizCd: row.tpbizCd,
          tpbizSeCd: row.tpbizSeCd,
          droperYn: row.droperYn,
          exmnRsltCn: row.exmnRsltCn,
          rdmActnAmt: row.rdmActnAmt,
          rdmTrgtNocs: row.rdmTrgtNocs,
          mdfrId: userLoginId,
        })
      })

      const body = { areaAvgVolExElctcReqstDto: param }

      const endpoint: string = `/fsm/ilg/aavee/tx/updateDoubtInvestigationResult`
      const response = await sendHttpRequest('PUT', endpoint, body, true, {
        cache: 'no-store',
      })

      if (response && response.data > 0) {
        alert('조사결과 등록이 완료되었습니다.')
      } else {
        alert('조사결과 등록 내역이 없습니다.')
      }
    } catch (error) {
      alert('조사결과 등록에 실패하였습니다.')
      console.error('ERROR POST DATA : ', error)
    } finally {
      setLoadingBackdrop(false)
      setIsEditMode(false) // 닫을 때 수정 모드 초기화
      closeExamResultModal(true) // 닫을 때 재조회 처리
    }
  }

  // 행정처분 등록 팝업으로 이동
  const handleNextPopup = async () => {
    const checkRows: any[] = checkValidation() // 유효성 검사
    if (checkRows.length < 1) return

    openAdminProcessModal()
  }

  // 조사결과 등록
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
              <h2>조사결과 등록</h2>
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
                등록
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
          <BlankCard className="contents-card" title="조사결과 등록">
            <TableContainer style={{ maxHeight: '286px' }}>
              <TableDataGrid
                headCells={ilgAaveeRegisterTxHC} // 테이블 헤더 값
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
                        <TableCell
                          className="td-head"
                          style={{ width: '120px', verticalAlign: 'middle' }}
                        >
                          환수조치액
                        </TableCell>
                        <TableCell>
                          <CustomTextField
                            sx={{
                              '& input': { textAlign: 'right' },
                              paddingRight: '3px',
                            }}
                            type="text"
                            id="rdmActnAmt"
                            name="rdmActnAmt"
                            value={rdmActnAmt}
                            onChange={changeRdmActnAmt}
                            disabled={disabled}
                            fullWidth
                          />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </BlankCard>
            <BlankCard className="contents-card" title="조사결과 등록정보">
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
                          법인/개인
                        </TableCell>
                        <TableCell
                          style={{
                            width: 'calc(50% - 150px)',
                            textAlign: 'left',
                          }}
                        >
                          <CommSelect
                            cdGroupNm={'706'}
                            pValue={formData.bzmnSeCd}
                            pName={'bzmnSeCd'}
                            width={'100%'}
                            handleChange={handleComboChange}
                            addText=""
                          />
                        </TableCell>
                        <TableCell
                          className="td-head"
                          style={{ width: '120px', verticalAlign: 'middle' }}
                        >
                          조사결과
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
                            name="exmnRsltCn"
                            onChange={handleParamChange}
                            value={formData.exmnRsltCn ?? ''}
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
            title="조사결과 등록"
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

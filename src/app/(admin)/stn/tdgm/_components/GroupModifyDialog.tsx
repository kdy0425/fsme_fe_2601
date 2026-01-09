'use client'
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@mui/material'
import Dialog, { DialogProps } from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import React, { useEffect, useState } from 'react'
import { CustomFormLabel, CustomTextField } from '@/utils/fsms/fsm/mui-imports'
import { DetailRow } from '../page'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import BlankCard from '@/app/components/shared/BlankCard'

import TableDataGrid from '@/app/components/tables/CommDataGrid2'

import { serverCheckTime } from '@/utils/fsms/common/comm'
import { stnTdgmGroupModalHC } from '@/utils/fsms/headCells'

// 시도코드, 관할관청 조회
import { LocgovSelect } from '@/app/components/tx/commSelect/CommSelect'

interface GroupModifyDialogProps {
  title: string
  // children: React.ReactElement<ModalFormProps>; // ModalFormProps 타입의 ReactElement
  size?: DialogProps['maxWidth'] | 'lg'
  open: boolean
  type: string
  selectedRow: DetailRow
  reloadFunc: () => void
  handleDetailCloseModal: () => void
}
export interface Row {
  locgovNm: string //지자체명
  dayoffSeNm: string //부제구분
  dayoffTypeNm: string //부제유형
  dayoffLocgovCd: string //부제지자체코드
  dayoffNm: string //부제기준명
  dayoffNo: string //부제번호
  sn: string // 순번
  chk: string //부제연결여부
  indctNm: string //부제조
  bgngHr: string //부제기준
  endHrNxtyNm: string //부제종료시간명
  endHr: string //부제종료시간
  locgovCd: string //관할관청코드
}

// 부제기준 연결 정보
export interface dayoffLinkInfo {
  dayoffNo: string // 부제번호
  sn: string //순번
  chk: string //부제연결여부(0:제외,1:체크,2:해지)
}

export interface DetailLinkRow {
  dayoffLocgovCd: string //부제 지자체코드
  groupId: string //부제그룹ID
  groupNm: string //부제그룹명
  groupExpln: string //부제그룹설명
  dayoffLinkInfo?: [dayoffLinkInfo] | [] // 부제번호, 순번, 부제연결여부(0:제외,1:체크,2:해지)
}

export default function GroupModifyDialog(props: GroupModifyDialogProps) {
  const {
    title,
    //children
    size,
    open,
    selectedRow,
    handleDetailCloseModal,
    reloadFunc,
    type,
  } = props
  const [isEditMode, setIsEditMode] = useState<boolean>(false) // 등록 수정 모드 상태 관리
  const [formData, setFormData] = useState<DetailRow>(selectedRow) // 수정될 데이터를 관리하는 상태
  const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 데이터처리시 로딩

  const [loading, setLoading] = useState(false) // 로딩여부
  const [selectedRows, setSelectedRows] = useState<string[]>([]) // 체크 로우 데이터
  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터

  useEffect(() => {
    //if (formData.dayoffLocgovCd) {
    fetchData()
    //}
  }, [flag])

  useEffect(() => {
    setSelectedRows([])
  }, [open])

  useEffect(() => {
    if (formData.dayoffLocgovCd) {
      fetchData()
    }
  }, [formData.dayoffLocgovCd])

  const fetchData = async () => {
    setLoading(true)

    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/stn/tdgm/tx/getTaxiDayoffStandMngList?page=0&size=9999` +
        `${formData.dayoffLocgovCd ? '&locgovCd=' + formData.dayoffLocgovCd : ''}` +
        `${formData.groupId ? '&groupId=' + formData.groupId : ''}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        // chk === 1인 항목 초기화
        setRows(response.data.content)
      } else {
        // 데이터가 없거나 실패
        setRows([])
      }
    } catch (error) {
      // 에러시
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  const handleCheckChange = (selected: string[]) => {
    setSelectedRows(selected)
  }

  // 다이얼로그 닫기 핸들러
  const handleClose = () => {
    handleDetailCloseModal()
    setIsEditMode(false) // 닫을 때 수정 모드 초기화
  }

  const handleModify = async () => {
    if (!(await serverCheckTime('dayoff'))) {
      return
    }

    if (!formData.dayoffLocgovCd) {
      alert('일시적인 오류입니다. 팝업을 다시 열어주세요')
      return
    }

    if (!formData.groupNm) {
      alert('부제그룹명을 입력해주세요')
      return
    }

    if (!formData.groupExpln) {
      alert('부제그룹 설명을 입력해주세요')
      return
    }

    const userConfirm = confirm('등록된 내용을 저장하시겠습니까?')
    if (!userConfirm) return

    const endpoint = `/fsm/stn/tdgm/tx/updateTaxiDayoffGroupMng`

    setLoadingBackdrop(true)

    let param: any[] = []
    for (let i = 0; i < rows.length; i++) {
      const bfRow = rows[i]
      let bfDayoffLocgovCd = bfRow.dayoffLocgovCd
      let bfDayoffNo = bfRow.dayoffNo
      let bfSn = bfRow.sn
      let bfChk = bfRow.chk

      selectedRows.map((id) => {
        const ckRow = rows[Number(id.replace('tr', ''))]
        let afDayoffLocgovCd = ckRow.dayoffLocgovCd
        let afDayoffNo = ckRow.dayoffNo
        let afSn = ckRow.sn

        // 신규등록: 기존 chk가 0이고 모든 PK가 일치하는 경우만 등록
        if (bfChk === '0') {
          if (
            bfDayoffLocgovCd === afDayoffLocgovCd &&
            bfDayoffNo === afDayoffNo &&
            bfSn === afSn
          ) {
            param.push({
              chk: '1',
              dayoffNo: ckRow.dayoffNo,
              sn: ckRow.sn,
              groupId: formData.groupId,
              dayoffLocgovCd: formData.dayoffLocgovCd,
              groupNm: formData.groupNm,
              groupExpln: formData.groupExpln,
            })
          }
        }
      })

      // 기존 chk가 1인 경우, selectRows에 일치하는 값이 없는 경우만 추가
      if (bfChk === '1') {
        const isMatched = selectedRows.some((id) => {
          const ckRow = rows[Number(id.replace('tr', ''))]
          return (
            bfDayoffLocgovCd === ckRow.dayoffLocgovCd &&
            bfDayoffNo === ckRow.dayoffNo &&
            bfSn === ckRow.sn
          )
        })

        // 일치여부췤! 중복췤!
        if (!isMatched) {
          const isDuplicate = param.some(
            (item) =>
              item.dayoffLocgovCd === bfDayoffLocgovCd &&
              item.dayoffNo === bfDayoffNo &&
              item.sn === bfSn,
          )

          if (!isDuplicate) {
            let chk = bfRow.chk
            if (selectedRows.length > 0) {
              if (selectedRows.indexOf('tr' + i) == -1) {
                chk = '0'
              } else {
                chk = '1'
              }
            } else {
              chk = bfRow.chk
            }

            param.push({
              chk: chk,
              dayoffNo: bfRow.dayoffNo,
              sn: bfRow.sn,
              groupId: formData.groupId,
              dayoffLocgovCd: formData.dayoffLocgovCd,
              groupNm: formData.groupNm,
              groupExpln: formData.groupExpln,
            })
          }
        }
      }
    }

    // 연결정보가 수정된건이 1건도 없다면 그룹정보만 수정되면 됩니다.
    if (param.length == 0) {
      param.push({
        groupId: formData.groupId,
        dayoffLocgovCd: formData.dayoffLocgovCd,
        groupNm: formData.groupNm,
        groupExpln: formData.groupExpln,
      })
    }

    const updatedRows = { taxiDayoffGroupMngReqstDto: param }

    // 추가되는 파일만 전달
    const response = await sendHttpRequest(
      'POST',
      endpoint,
      updatedRows,
      true, // JWT 사용 여부
    )

    if (response?.resultType === 'success') {
      alert(response.message)
      reloadFunc?.()
      handleClose()
      setLoadingBackdrop(false)
    } else {
      alert(response.message)
      reloadFunc?.()
      handleClose()
      setLoadingBackdrop(false)
    }
  }

  // 등록 내용 저장 핸들러
  const handleSave = async () => {
    // 필수 값 체크
    if (!(await serverCheckTime('dayoff'))) {
      return
    }

    if (!formData.dayoffLocgovCd) {
      alert('일시적인 오류입니다. 팝업을 다시 열어주세요')
      return
    }

    if (!formData.groupNm) {
      alert('부제그룹명을 입력해주세요')
      return
    }

    if (!formData.groupExpln) {
      alert('부제그룹 설명을 입력해주세요')
      return
    }

    const userConfirm = confirm('등록된 내용을 저장하시겠습니까?')
    if (!userConfirm) return

    const endpoint = `/fsm/stn/tdgm/tx/createTaxiDayoffGroupMng`

    setLoadingBackdrop(true)

    let param: any[] = []
    // 그룹등록만 하는경우
    if (selectedRows.length == 0) {
      param.push({
        groupId: formData.groupId,
        dayoffLocgovCd: formData.dayoffLocgovCd,
        groupNm: formData.groupNm,
        groupExpln: formData.groupExpln,
      })
      // 연결까지 같이 진행하는 경우
    } else {
      selectedRows.map((id) => {
        const row = rows[Number(id.replace('tr', ''))]
        param.push({
          chk: row.chk,
          dayoffNo: row.dayoffNo,
          sn: row.sn,
          groupId: formData.groupId,
          dayoffLocgovCd: formData.dayoffLocgovCd,
          groupNm: formData.groupNm,
          groupExpln: formData.groupExpln,
        })
      })
    }

    const updatedRows = { taxiDayoffGroupMngReqstDto: param }

    // 추가되는 파일만 전달
    const response = await sendHttpRequest(
      'POST',
      endpoint,
      updatedRows,
      true, // JWT 사용 여부
    )

    if (response?.resultType === 'success') {
      alert(response.message)
      reloadFunc?.()
      handleClose()
      setLoadingBackdrop(false)
    } else {
      alert(response.message)
      reloadFunc?.()
      handleClose()
      setLoadingBackdrop(false)
    }
  }

  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target

    setFormData((prev) => ({ ...prev, page: 1, [name]: value }))
  }

  const handleChange = (val: string) => {
    setFormData((prev) => ({ ...prev, groupExpln: val }))
  }

  return (
    <React.Fragment>
      <Dialog
        fullWidth={false}
        maxWidth={size}
        open={open}
        //onClose={handleClose}
      >
        <DialogContent>
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              <h2>{type === 'U' ? '부제그룹수정' : '부제그룹등록'}</h2>
            </CustomFormLabel>
            <div className="button-right-align">
              {type === 'U' ? (
                <>
                  <Button
                    variant="contained"
                    onClick={handleModify}
                    color="primary"
                  >
                    수정
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="contained"
                    onClick={handleSave}
                    color="primary"
                  >
                    저장
                  </Button>
                </>
              )}

              <Button variant="contained" color="dark" onClick={handleClose}>
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
            {/* 수정 모드 전달 */}
            <Box sx={{ maxWidth: 'fullWidth', margin: '0 auto' }}>
              <TableContainer style={{ margin: '16px 0 0 0' }}>
                <Table
                  className="table table-bordered"
                  aria-labelledby="tableTitle"
                  style={{ tableLayout: 'fixed', width: '100%' }}
                >
                  <TableBody>
                    <TableRow>
                      {type === 'I' ? (
                        <>
                          <TableCell
                            className="td-head"
                            style={{ width: '150px', verticalAlign: 'middle' }}
                          >
                            <span className="required-text">*</span>관할관청
                          </TableCell>
                          <TableCell
                            style={{
                              width: 'calc(50% - 150px)',
                              textAlign: 'left',
                            }}
                          >
                            <CustomFormLabel
                              className="input-label-none"
                              htmlFor="sch-locgovCd"
                            >
                              관할관청
                            </CustomFormLabel>
                            <LocgovSelect
                              ctpvCd={formData.dayoffLocgovCd.substring(0, 2)}
                              pValue={formData.dayoffLocgovCd}
                              handleChange={handleSearchChange}
                              htmlFor={'sch-locgovCd'}
                              pName="dayoffLocgovCd"
                            />
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell
                            className="td-head"
                            style={{ width: '150px', verticalAlign: 'middle' }}
                          >
                            <span className="required-text">*</span>관할관청
                          </TableCell>
                          <TableCell>
                            <div>{formData.locgovNm}</div>
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                    <TableRow>
                      <TableCell
                        className="td-head"
                        style={{ width: '150px', verticalAlign: 'middle' }}
                      >
                        <span className="required-text">*</span>부제그룹명
                      </TableCell>
                      <TableCell
                        style={{
                          width: 'calc(50% - 150px)',
                          textAlign: 'left',
                        }}
                      >
                        <CustomFormLabel
                          className="input-label-none"
                          htmlFor="modal-groupNm"
                        >
                          부제그룹명
                        </CustomFormLabel>
                        <CustomTextField
                          type="text"
                          id="modal-groupNm"
                          name="groupNm"
                          onChange={handleSearchChange}
                          value={formData.groupNm ?? ''}
                          inputProps={{
                            maxLength: 12,
                          }}
                          fullWidth
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell
                        className="td-head"
                        style={{ width: '150px', verticalAlign: 'middle' }}
                      >
                        <span className="required-text">*</span>부제그룹설명
                      </TableCell>
                      <TableCell
                        style={{
                          width: 'calc(50% - 150px)',
                          textAlign: 'left',
                        }}
                      >
                        <CustomFormLabel
                          className="input-label-none"
                          htmlFor="modal-groupExpln"
                        >
                          부제그룹설명
                        </CustomFormLabel>
                        <CustomTextField
                          id="modal-groupExpln"
                          fullWidth
                          name="groupExpln"
                          value={formData.groupExpln ?? ''}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleChange(e.target.value)
                          }
                        />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
            <CustomFormLabel className="input-label-display">
              <h2>부제기준정보 연결</h2>
            </CustomFormLabel>
            <BlankCard className="contents-card" title="부제기준정보">
              <TableDataGrid
                headCells={stnTdgmGroupModalHC} // 테이블 헤더 값
                rows={rows} // 목록 데이터
                loading={loading} // 로딩여부
                onCheckChange={handleCheckChange}
                caption={'부제기준정보 목록 조회'}
              />
            </BlankCard>
          </Box>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  )
}

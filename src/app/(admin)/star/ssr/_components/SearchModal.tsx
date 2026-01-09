import {
  CustomFormLabel,
  CustomSelect,
  CustomTextField,
} from '@/utils/fsms/fsm/mui-imports'
import { Box } from '@mui/material'
import { Button, Dialog, DialogTitle, DialogContent } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { Row } from '../page'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import {
  CtpvSelect,
  LocgovSelect,
  CommSelect,
} from '@/app/components/tx/commSelect/CommSelect'
import { getFormatToday } from '@/utils/fsms/common/dateUtils'
import StrctStatsRptpModal from './StrctStatsRptpModal'

export interface RptpRow {
  crtrYyyy: string //기준년도
  crtrMm: string //기준월
  rptpVl: string //보고서값
  locgovNm: string //지자체코드
  seNm: string //구분명
}

export interface TransformRow {
  crtrMm: string
  seNm: string
  [crtrYyyy: string]: number | string | undefined
}

interface SearchModalProps {
  open: boolean
  handleClickClose: () => void
  row: Row | undefined
}

const SearchModal = (props: SearchModalProps) => {
  const { open, handleClickClose, row } = props
  const [loadingBackdrop, setLoadingBackdrop] = useState(false)
  const [rptpRows, setRptpRows] = useState<RptpRow[]>([]) // 가져온 로우 데이터
  const [transformRows, setTransformRows] = useState<TransformRow[]>([])

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<{ [key: string]: string | number }>({})

  const [rptpOpen, setRptpOpen] = useState<boolean>(false)

  useEffect(() => {
    let endDt = getFormatToday().substring(0, 4)
    let bgngDt = Number(endDt) - 4

    setParams(() => ({
      ctpvCd: '',
      locgovCd: '',
      bgngDt: bgngDt,
      endDt: endDt,
      title: row ? row.rptpNm : '',
      rptpSeCd: row ? row.rptpSeCd : '',
      taskSeCd: row ? row.taskSeCd : '',
      groupSeCd: row ? row.groupSeCd : '',
    }))
  }, [open])

  useEffect(() => {
    if (rptpRows.length === 0) return

    const group: Record<string, TransformRow> = {}

    rptpRows.forEach((rptpRow) => {
      const { crtrMm, crtrYyyy, seNm, rptpVl } = rptpRow

      if (!group[crtrMm + seNm]) {
        group[crtrMm + seNm] = { crtrMm: crtrMm, seNm: seNm }
      }

      group[crtrMm + seNm][crtrYyyy] =
        Number(rptpVl) === 0 ? '-' : Number(rptpVl)
    })
    setTransformRows(Object.values(group))
    setRptpOpen(true)
    setParams((prev) => ({
      ...prev,
      locgovNm: rptpRows[0].locgovNm,
    }))
  }, [rptpRows])

  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    if (name === 'endDt') {
      if (value > getFormatToday().substring(0, 4)) {
        alert(
          getFormatToday().substring(0, 4) + '년이후는 선택 하실 수 없습니다.',
        )
      }
      let endDt =
        value > getFormatToday().substring(0, 4)
          ? getFormatToday().substring(0, 4)
          : value

      setParams((prev) => ({
        ...prev,
        [name]: endDt,
      }))
      setParams((prev) => ({
        ...prev,
        bgngDt: Number(endDt) - 4,
      }))
    } else {
      setParams((prev) => ({ ...prev, [name]: value }))
    }
  }

  const fetchData = async () => {
    setLoadingBackdrop(true)
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/star/ssr/cm/getAllStrctStatsRptp?&rptpSeCd=${params.rptpSeCd}` +
        `${params.taskSeCd ? '&taskSeCd=' + params.taskSeCd : ''}` +
        `${params.groupSeCd ? '&groupSeCd=' + params.groupSeCd : ''}` +
        `${params.bgngDt ? '&bgngDt=' + params.bgngDt : ''}` +
        `${params.endDt ? '&endDt=' + params.endDt : ''}` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        setRptpRows(response.data)
      } else {
        // 데이터가 없거나 실패
        setRptpRows([])
      }
    } catch (error) {
      // 에러시
      setRptpRows([])
    } finally {
      setLoadingBackdrop(false)
    }
  }

  return (
    <Box>
      <Dialog fullWidth={true} maxWidth={'md'} open={open}>
        <DialogContent>
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              <h2>{row?.rptpNm}</h2>
            </CustomFormLabel>
            <div className=" button-right-align">
              <Button
                variant="contained"
                color="success"
                onClick={() => {
                  fetchData()
                }}
              >
                검색
              </Button>
              <Button
                variant="contained"
                color="dark"
                onClick={handleClickClose}
              >
                취소
              </Button>
            </div>
          </Box>
          {/* 검색영역 시작 */}
          <Box sx={{ mb: 2 }}>
            <Box className="sch-filter-box">
              <div className="filter-form">
                <div className="form-group">
                  <CustomFormLabel
                    className="input-label-display"
                    htmlFor="sch-ctpv"
                  >
                    <span className="required-text">*</span>시도명
                  </CustomFormLabel>
                  <CtpvSelect
                    pValue={params.ctpvCd}
                    handleChange={handleSearchChange}
                    htmlFor={'sch-ctpv'}
                  />
                </div>

                <div className="form-group">
                  <CustomFormLabel
                    className="input-label-display"
                    htmlFor="sch-locgov"
                  >
                    <span className="required-text">*</span>관할관청
                  </CustomFormLabel>
                  <LocgovSelect
                    ctpvCd={params.ctpvCd}
                    pValue={params.locgovCd}
                    handleChange={handleSearchChange}
                    htmlFor={'sch-locgov'}
                  />
                </div>
              </div>

              <hr />

              <div className="filter-form">
                <div className="form-group">
                  <CustomFormLabel className="input-label-display" required>
                    기간
                  </CustomFormLabel>
                  <CustomFormLabel
                    className="input-label-none"
                    htmlFor="ft-date-start"
                  >
                    시작
                  </CustomFormLabel>
                  <CustomTextField
                    id="ft-date-start"
                    name="bgngDt"
                    value={params.bgngDt}
                    onChange={handleSearchChange}
                    disabled
                    fullWidth
                  />
                  ~
                  <CustomFormLabel
                    className="input-label-none"
                    htmlFor="ft-date-end"
                  >
                    종료
                  </CustomFormLabel>
                  <CustomTextField
                    type="year"
                    id="ft-date-end"
                    name="endDt"
                    value={params.endDt}
                    onChange={handleSearchChange}
                    inputProps={{
                      maxLength: 4,
                      inputMode: 'numeric',
                      pattern: '[0-9]*',
                    }}
                    fullWidth
                  />
                </div>
              </div>
            </Box>
          </Box>
        </DialogContent>
        <LoadingBackdrop open={loadingBackdrop} />
      </Dialog>
      <StrctStatsRptpModal
        open={rptpOpen}
        handleClickClose={() => {
          setRptpOpen(false)
          handleClickClose()
        }}
        params={params}
        transformRows={transformRows}
      />
    </Box>
  )
}

export default SearchModal

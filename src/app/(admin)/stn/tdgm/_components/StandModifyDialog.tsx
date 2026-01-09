'use client'
import {
  Box,
  Button,
  Table,
  TableBody,
  TableHead,
  TableCell,
  TableContainer,
  TableRow,
} from '@mui/material'
import Dialog, { DialogProps } from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import React, { useEffect, useState } from 'react'
import { CustomFormLabel, CustomTextField } from '@/utils/fsms/fsm/mui-imports'

import { serverCheckTime } from '@/utils/fsms/common/comm'
import { ReqItem, StandRow } from '../page'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { CommSelect } from '@/app/components/tx/commSelect/CommSelect'
import { uniqueId } from 'lodash'

interface StandModifyDialogProps {
  title: string
  // children: React.ReactElement<ModalFormProps>; // ModalFormProps 타입의 ReactElement
  size?: DialogProps['maxWidth'] | 'lg'
  open: boolean
  type: string
  selectedRow: StandRow
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

export interface NmRow {
  id: string
  indctNm: string
  dayoffNo: string
  dayoffLocgovCd: string
  sn: string
  chgRsnCd: string
  dataType: string
}

const TYPE_OPTIONS = [
  { key: '0', value: '주기별' },
  { key: '1', value: '월별' },
  { key: '2', value: '매주' },
  { key: '3', value: '주별' },
  { key: '4', value: '격주' },
  { key: '5', value: '차량번호연동' },
]

const DOW_OPTIONS = [
  { key: '0', value: '일' },
  { key: '1', value: '월' },
  { key: '2', value: '화' },
  { key: '3', value: '수' },
  { key: '4', value: '목' },
  { key: '5', value: '금' },
  { key: '6', value: '토' },
]

const PRK_WEEK_OPTIONS = [
  { key: '1', value: '첫째주' },
  { key: '2', value: '둘째주' },
  { key: '3', value: '셋째주' },
  { key: '4', value: '넷째주' },
  { key: '5', value: '다섯째주' },
]

export default function StandCreateDialog(props: StandModifyDialogProps) {
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
  const [params, setParams] = useState<StandRow>(selectedRow) // 수정될 데이터를 관리하는 상태
  const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 데이터처리시 로딩

  const [loading, setLoading] = useState(false) // 로딩여부
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [typeOptions, setTypeOptions] = useState([{ key: '', value: '' }])
  const [prkCdOptions, setPrkCdOptions] = useState([{ key: '', value: '' }]) //부제주차
  const [dowCdOptions, setDowCdOptions] = useState([{ key: '', value: '' }]) //부제요일
  const [prevValue, setPrevValue] = useState('')

  const [prkCdFlag, setPrkCdFlag] = useState(false)
  const [dowCdFlag, setDowCdFlag] = useState(false)
  const [crtrYmdFlag, setCrtrYmdFlag] = useState(false)

  const [nmList, setNmList] = useState<NmRow[]>([]) // 가져온 로우 데이터
  const [nmOrgList, setNmOrgList] = useState<NmRow[]>([]) // 가져온 로우 데이터
  const [reqList, setReqList] = useState<ReqItem[]>([])

  useEffect(() => {
    if (type === 'I') {
      setReqList([
        {
          id: '00',
          indctNm: '',
          sn: '',
          chgRsnCd: 'I',
          dataType: 'I',
        },
      ])

      setTypeOptions([TYPE_OPTIONS[0]])
    }
  }, [])

  useEffect(() => {
    //if (params.dayoffLocgovCd) {
    if (type == 'U') {
      fetchData()
      fetchNmListData()
    }
    //}
  }, [])

  const fetchData = async () => {
    setLoading(true)

    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/stn/tdgm/tx/getTaxiDayoffMdfyInfoList?page=1` +
        `${params.dayoffLocgovCd ? '&dayoffLocgovCd=' + params.dayoffLocgovCd : ''}` +
        `${params.dayoffNo ? '&dayoffNo=' + params.dayoffNo : ''}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        // chk === 1인 항목 초기화
        let content = response.data[0]

        setPrevValue(content.dayoffSeCd)

        handleSearchChange({
          target: { name: 'dayoffSeCd', value: content.dayoffSeCd },
        } as React.ChangeEvent<HTMLInputElement>)
        handleSearchChange({
          target: { name: 'dayoffTypeCd', value: content.dayoffTypeCd },
        } as React.ChangeEvent<HTMLInputElement>)

        setParams({
          ...content,
          bgngHr: content.bgngHr.substring(0, 2),
          endHr: content.endHr.substring(0, 2),
          crtrYmd:
            content.crtrYmd.substring(0, 4) +
            '-' +
            content.crtrYmd.substring(4, 6) +
            '-' +
            content.crtrYmd.substring(6, 8),
        })
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

  const fetchNmListData = async () => {
    setLoading(true)

    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/stn/tdgm/tx/getTaxiDayoffMdfyInfoNmList?page=1` +
        `${params.dayoffLocgovCd ? '&dayoffLocgovCd=' + params.dayoffLocgovCd : ''}` +
        `${params.dayoffNo ? '&dayoffNo=' + params.dayoffNo : ''}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        // chk === 1인 항목 초기화
        setNmList(response.data)
        setNmOrgList(response.data)
      } else {
        // 데이터가 없거나 실패
        setNmList([])
        setNmOrgList([])
      }
    } catch (error) {
      // 에러시
      setNmList([])
      setNmOrgList([])
    } finally {
      setLoading(false)
    }
  }

  const addListItem = () => {
    let newArr: ReqItem[] = [...reqList]

    newArr.push({
      id: uniqueId(),
      indctNm: '',
      sn: '',
      chgRsnCd: 'I',
      dataType: 'I',
    })

    if (type === 'I') {
      if (params.dayoffSeCd === '2') {
        if (reqList.length > 0) {
          alert('특수부제는 부제조명 1개만 등록가능합니다.')
          return
        }
      }
    } else {
      if (params.dayoffSeCd === '2') {
        if (reqList.length > 0 || nmList.length > 0) {
          alert('특수부제는 부제조명 1개만 등록가능합니다.')
          return
        }
      }
    }

    setReqList(newArr)
  }

  // 다이얼로그 닫기 핸들러
  const handleClose = () => {
    handleDetailCloseModal()
    setIsEditMode(false) // 닫을 때 수정 모드 초기화
  }

  const handleNmListChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    index: number,
  ) => {
    const { name, value } = event.target
    let nmArr = [...nmList]

    nmArr[index] = {
      ...nmArr[index],
      [name]: value,
    }

    setNmList(nmArr)
  }

  const handleListChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    index: number,
  ) => {
    const { name, value } = event.target
    let reqArr = [...reqList]

    reqArr[index] = {
      ...reqArr[index],
      [name]: value,
    }

    setReqList(reqArr)
  }

  const deleteNmListItem = (index: number) => {
    setNmList((prev) => prev.filter((_, i) => i !== index))
  }

  const deleteListItem = (id: string) => {
    let newArr: ReqItem[] = [...reqList]

    newArr = newArr.filter((item) => item.id !== id)

    setReqList(newArr)
  }

  const handleModify = async () => {
    if (!(await serverCheckTime('dayoff'))) {
      return
    }

    if (!validateList()) return

    if (!confirm('수정하시겠습니까?')) return

    const param: any[] = []
    const seen = new Set<string>() // 중복 방지를 위한 Set

    // nmOrgList 기준으로 처리
    nmOrgList.forEach((bfRow) => {
      const {
        dayoffLocgovCd: bfDayoffLocgovCd,
        dayoffNo: bfDayoffNo,
        sn: bfSn,
      } = bfRow

      // nmList와 비교
      const matchFound = nmList.some(
        ({ dayoffLocgovCd, dayoffNo, sn }) =>
          bfDayoffLocgovCd === dayoffLocgovCd &&
          bfDayoffNo === dayoffNo &&
          bfSn === sn,
      )

      const uniqueKey = `${bfDayoffLocgovCd}-${bfDayoffNo}-${bfSn}`

      // 일치하면 type = 2로 추가(수정항목)
      if (matchFound && !seen.has(uniqueKey)) {
        // 일치하는 항목을 찾은 경우, indctNm 값을 nmList에서 찾아서 추가
        const matchedItem = nmList.find(
          ({ dayoffLocgovCd, dayoffNo, sn }) =>
            bfDayoffLocgovCd === dayoffLocgovCd &&
            bfDayoffNo === dayoffNo &&
            bfSn === sn,
        )

        // matchedItem이 존재하면, 해당 item에서 indctNm을 가져와 추가
        const updatedRow = {
          ...bfRow, // 기존 bfRow 값을 그대로 복사
          mType: 2, // type은 2로 설정
          dayoffLocgovCd: params.dayoffLocgovCd, // params 값 추가
          dayoffSeCd: params.dayoffSeCd,
          dayoffTypeCd: params.dayoffTypeCd,
          crtrYmd: params.crtrYmd.replaceAll('-', ''),
          bzmnSeCd: params.bzmnSeCd,
          dayoffNm: params.dayoffNm,
          dayoffExpln: params.dayoffExpln,
          bgngHr: params.bgngHr + '0000',
          endHrNxtyYn: params.endHrNxtyYn,
          endHr: params.endHr + '0000',
          dowCd: params.dowCd,
          prkCd: params.prkCd,
        }

        if (matchedItem) {
          updatedRow.indctNm = matchedItem.indctNm // 일치하는 항목의 indctNm 추가
        }

        param.push(updatedRow)
        seen.add(uniqueKey)
      }
      // 일치하지 않으면 type = 3으로 추가(삭제항목)
      else if (!matchFound && !seen.has(uniqueKey)) {
        param.push({ ...bfRow, mType: 3 })
        seen.add(uniqueKey)
      }
    })

    // 신규가 있는경우
    if (reqList.length > 0) {
      const newParams = reqList.map((req) => ({
        dayoffLocgovCd: params.dayoffLocgovCd,
        dayoffSeCd: params.dayoffSeCd,
        dayoffNo: params.dayoffNo,
        dayoffTypeCd: params.dayoffTypeCd,
        crtrYmd: params.crtrYmd.replaceAll('-', ''),
        bzmnSeCd: params.bzmnSeCd,
        dayoffNm: params.dayoffNm,
        dayoffExpln: params.dayoffExpln,
        bgngHr: params.bgngHr + '0000',
        endHrNxtyYn: params.endHrNxtyYn,
        endHr: params.endHr + '0000',
        dowCd: params.dowCd,
        prkCd: params.prkCd,
        indctNm: req.indctNm,
        mType: '1',
      }))

      param.push(...newParams)
    }

    const endpoint = `/fsm/stn/tdgm/tx/updateTaxiDayoffInfoMng`

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

  const validateList = () => {
    if (!params.dayoffNm) {
      alert('부제기준명을 입력해주세요.')
      return false
    }

    let dayoffTypeCd = params.dayoffTypeCd
    if (dayoffTypeCd == '0' || dayoffTypeCd == '1' || dayoffTypeCd == '4') {
      if (!params.crtrYmd.replaceAll('-', '')) {
        alert('기준일자를 선택해주세요')
        return false
      }
    }

    let endHrNxtyYn = params.endHrNxtyYn
    if (endHrNxtyYn === '1') {
      if (params.bgngHr > params.endHr) {
        alert('당일종료시 부제 시작시간은 종료시간을 넘을 수 없습니다.')
        return false
      }
    }

    let isValid = true
    if (type === 'I') {
      if (reqList.length === 0) {
        alert('부제조는 1개이상 필수 입력입니다')
        return false
      }

      reqList.forEach((item) => {
        if (!item.indctNm || item.indctNm.trim() === '') {
          isValid = false
          alert('부제조명을 입력해주세요.')
        }
      })
    } else {
      if (reqList.length === 0 && nmList.length === 0) {
        alert('부제조는 1개이상 필수 입력입니다')
        return false
      }

      if (reqList.length > 0) {
        reqList.forEach((item) => {
          if (!item.indctNm || item.indctNm.trim() === '') {
            isValid = false
            alert('부제조명을 입력해주세요.')
          }
        })
      }

      if (nmList.length > 0) {
        nmList.forEach((item) => {
          if (!item.indctNm || item.indctNm.trim() === '') {
            isValid = false
            alert('부제조명을 입력해주세요.')
          }
        })
      }
    }

    return isValid // 모든 유효성 검사 통과 시 true 반환
  }

  // 등록 내용 저장 핸들러
  const handleSave = async () => {
    if (!(await serverCheckTime('dayoff'))) {
      return
    }

    if (!validateList()) return

    if (!confirm('등록된 내용을 저장하시겠습니까?')) return

    const endpoint = `/fsm/stn/tdgm/tx/createTaxiDayoffInfoMng`
    setLoadingBackdrop(true)

    const param = reqList.map((req) => ({
      dayoffLocgovCd: params.locgovCd,
      dayoffSeCd: params.dayoffSeCd,
      dayoffTypeCd: params.dayoffTypeCd,
      crtrYmd: params.crtrYmd.replaceAll('-', ''),
      bzmnSeCd: params.bzmnSeCd,
      dayoffNm: params.dayoffNm,
      dayoffExpln: params.dayoffExpln,
      bgngHr: params.bgngHr + '0000',
      endHrNxtyYn: params.endHrNxtyYn,
      endHr: params.endHr + '0000',
      dowCd: params.dowCd,
      prkCd: params.prkCd,
      indctNm: req.indctNm,
    }))

    const updatedRows = { taxiDayoffGroupMngReqstDto: param }

    // 추가되는 파일만 전달
    const response = await sendHttpRequest(
      'POST',
      endpoint,
      updatedRows,
      true, // JWT 사용 여부
    )

    if (response && response.resultType === 'success') {
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

  //삭제
  const handleDelete = async () => {
    if (!(await serverCheckTime('dayoff'))) {
      return
    }

    const userConfirm = confirm(
      '선택하신 부제 기준관리정보를 삭제하시겠습니까?',
    )
    if (!userConfirm) return

    const endpoint = `/fsm/stn/tdgm/tx/deleteTaxiDayoffInfoMng`

    setLoadingBackdrop(true)

    const response = await sendHttpRequest(
      'DELETE',
      endpoint,
      params,
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

  const updateDowCdOptions = (
    options: { key: string; value: string }[],
    isDisabled: boolean,
  ): void => {
    setDowCdOptions(options)
    setDowCdFlag(isDisabled)
  }

  const updatePrkCdOptions = (
    options: { key: string; value: string }[],
    isDisabled: boolean,
  ): void => {
    setPrkCdOptions(options)
    setPrkCdFlag(isDisabled)
  }

  const resetParams = (updates: Partial<typeof params>): void => {
    setParams((prev) => ({ ...prev, ...updates }))
  }

  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target

    setParams((prev) => ({ ...prev, [name]: value }))

    if (name === 'dayoffSeCd') {
      if (value === '1') {
        // 주기별
        setTypeOptions([TYPE_OPTIONS[0]])
        updateDowCdOptions([{ key: '', value: '' }], true)
        updatePrkCdOptions([{ key: '', value: '' }], true)
        resetParams({ dayoffTypeCd: '0', prkCd: '', dowCd: '' })
      } else {
        // 일반 부제 유형
        setTypeOptions(TYPE_OPTIONS.slice(1))
        updateDowCdOptions([{ key: '', value: '' }], true)
        updatePrkCdOptions([{ key: '', value: '' }], true)
        resetParams({ dayoffTypeCd: '1', prkCd: '', dowCd: '' })
      }
    }

    if (name === 'dayoffSeCd' && value !== prevValue && type !== 'U') {
      setReqList([
        {
          id: '00',
          indctNm: '',
          sn: '',
          chgRsnCd: 'I',
          dataType: 'I',
        },
      ])
      setPrevValue(value)
    }

    if (name === 'dayoffTypeCd') {
      switch (value) {
        case '0': // 주기별
          updateDowCdOptions([{ key: '', value: '' }], true)
          updatePrkCdOptions([{ key: '', value: '' }], true)
          setCrtrYmdFlag(false)
          resetParams({ prkCd: '', dowCd: '' })
          break

        case '1': // 월별
          updateDowCdOptions([{ key: '', value: '' }], true)
          updatePrkCdOptions([{ key: '', value: '' }], true)
          setCrtrYmdFlag(false)
          resetParams({ prkCd: '', dowCd: '' })
          break

        case '2': // 매주
          updatePrkCdOptions([{ key: '', value: '' }], true)
          updateDowCdOptions(DOW_OPTIONS, false)
          setCrtrYmdFlag(true)
          const selectedDowCd2 = DOW_OPTIONS[0].key
          resetParams({ prkCd: '', crtrYmd: '', dowCd: selectedDowCd2 })
          break

        case '3': // 주별
          updatePrkCdOptions(PRK_WEEK_OPTIONS, false)
          updateDowCdOptions(DOW_OPTIONS, false)
          setCrtrYmdFlag(true)
          const selectedPrkCd = TYPE_OPTIONS[0].key
          const selectedDowCd3 = DOW_OPTIONS[0].key
          resetParams({ prkCd: selectedPrkCd, dowCd: selectedDowCd3 })
          break

        case '4': // 격주
          updatePrkCdOptions([{ key: '', value: '' }], true)
          updateDowCdOptions(DOW_OPTIONS, false)
          setCrtrYmdFlag(false)
          const selectedDowCd4 = DOW_OPTIONS[0].key
          resetParams({ prkCd: '', dowCd: selectedDowCd4 })
          break

        case '5': // 차량번호연동
          updateDowCdOptions([{ key: '', value: '' }], true)
          setCrtrYmdFlag(true)
          resetParams({ prkCd: '', dowCd: '', crtrYmd: '' })
          break

        default:
          break
      }
    }
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
              <h2>{type === 'U' ? '부제기준수정' : '부제기준등록'}</h2>
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
                  <Button
                    variant="contained"
                    onClick={handleDelete}
                    color="error"
                  >
                    삭제
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
                <Table aria-labelledby="tableTitle">
                  <TableBody>
                    <TableRow>
                      <TableCell className="table-title-column td-left">
                        <span className="required-text">*</span> 부제구분
                      </TableCell>
                      <TableCell>
                        <CustomFormLabel
                          className="input-label-none"
                          htmlFor="sch-dayoffSeCd"
                        >
                          부제구분
                        </CustomFormLabel>
                        <CommSelect
                          cdGroupNm="IHG1"
                          pValue={params.dayoffSeCd ?? ''}
                          handleChange={handleSearchChange}
                          pName="dayoffSeCd"
                          pDisabled={type === 'U' ? true : false}
                          htmlFor={'sch-dayoffSeCd'}
                        />
                      </TableCell>
                      <TableCell className="table-title-column td-left">
                        <span className="required-text">*</span> 부제유형
                      </TableCell>
                      <TableCell>
                        <CustomFormLabel
                          className="input-label-none"
                          htmlFor="sch-dayoffTypeCd"
                        >
                          부제유형
                        </CustomFormLabel>
                        <select
                          id="sch-dayoffTypeCd"
                          name="dayoffTypeCd"
                          value={params.dayoffTypeCd}
                          className="custom-default-select"
                          style={{ width: '100%' }}
                          html-for={'sch-dayoffTypeCd'}
                          disabled={type === 'U' ? true : false}
                          onChange={handleSearchChange}
                        >
                          {typeOptions.map((option) => (
                            <option key={option.key} value={option.key}>
                              {option.value}
                            </option>
                          ))}
                        </select>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="table-title-column td-left">
                        {params.dayoffTypeCd === '0' ||
                        params.dayoffTypeCd === '1' ||
                        params.dayoffTypeCd === '4' ? (
                          <span className="required-text">* </span>
                        ) : null}
                        기준일자
                      </TableCell>
                      <TableCell>
                        <CustomFormLabel
                          className="input-label-none"
                          htmlFor="ft-date-start"
                        >
                          기준일자
                        </CustomFormLabel>
                        <CustomTextField
                          type="date"
                          id="ft-date-start"
                          name="crtrYmd"
                          disabled={crtrYmdFlag}
                          onChange={handleSearchChange}
                          value={params.crtrYmd ?? ''}
                          fullWidth
                        />
                      </TableCell>
                      <TableCell className="table-title-column td-left">
                        <span className="required-text">*</span> 사업자구분
                      </TableCell>
                      <TableCell>
                        <CustomFormLabel
                          className="input-label-none"
                          htmlFor="sch-bzmnSeCd"
                        >
                          사업자구분
                        </CustomFormLabel>
                        <CommSelect
                          cdGroupNm="CBG0"
                          pValue={params.bzmnSeCd ?? ''}
                          handleChange={handleSearchChange}
                          pName="bzmnSeCd"
                          /* width */ // 필수 X, default 100% ** 특정 width 값이 필요하신 경우 기재해주시면 됩니다
                          htmlFor={'sch-bzmnSeCd'}
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="table-title-column td-left">
                        <span className="required-text">*</span> 부제기준명
                      </TableCell>
                      <TableCell colSpan={3}>
                        <CustomFormLabel
                          className="input-label-none"
                          htmlFor="modal-dayoffNm"
                        >
                          부제기준명
                        </CustomFormLabel>
                        <CustomTextField
                          type="text"
                          id="modal-dayoffNm"
                          name="dayoffNm"
                          onChange={handleSearchChange}
                          value={params.dayoffNm ?? ''}
                          inputProps={{
                            maxLength: 12,
                          }}
                          fullWidth
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="table-title-column td-left">
                        부제설명
                      </TableCell>
                      <TableCell colSpan={3}>
                        <CustomFormLabel
                          className="input-label-none"
                          htmlFor="modal-dayoffExpln"
                        >
                          부제설명
                        </CustomFormLabel>
                        <CustomTextField
                          type="text"
                          id="modal-dayoffExpln"
                          name="dayoffExpln"
                          onChange={handleSearchChange}
                          value={params.dayoffExpln ?? ''}
                          fullWidth
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="table-title-column td-left">
                        <span className="required-text">*</span> 부제시작시간
                      </TableCell>
                      <TableCell>
                        <CustomFormLabel
                          className="input-label-none"
                          htmlFor="sch-bgngHr"
                        >
                          부제시작시간
                        </CustomFormLabel>
                        <CommSelect
                          cdGroupNm="IHG5"
                          pValue={params.bgngHr ?? ''}
                          handleChange={handleSearchChange}
                          pName="bgngHr"
                          /* width */ // 필수 X, default 100% ** 특정 width 값이 필요하신 경우 기재해주시면 됩니다
                          htmlFor={'sch-bgngHr'}
                        />
                      </TableCell>
                      <TableCell className="table-title-column td-left">
                        <span className="required-text">*</span> 부제종료시간
                      </TableCell>
                      <TableCell>
                        <CustomFormLabel
                          className="input-label-none"
                          htmlFor="sch-endHrNxtyYn"
                        >
                          부제종료여부
                        </CustomFormLabel>
                        <CommSelect
                          cdGroupNm="IHG6"
                          pValue={params.endHrNxtyYn ?? ''}
                          handleChange={handleSearchChange}
                          pName="endHrNxtyYn"
                          width={'50%'}
                          htmlFor={'sch-endHrNxtyYn'}
                        />
                        <CustomFormLabel
                          className="input-label-none"
                          htmlFor="sch-endHr"
                        >
                          부제종료시간
                        </CustomFormLabel>
                        <CommSelect
                          cdGroupNm="IHG5"
                          pValue={params.endHr ?? ''}
                          handleChange={handleSearchChange}
                          pName="endHr"
                          width={'50%'}
                          htmlFor={'sch-endHr'}
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="table-title-column td-left">
                        부제주차
                      </TableCell>
                      <TableCell>
                        <CustomFormLabel
                          className="input-label-none"
                          htmlFor="sch-prkCd"
                        >
                          부제주차
                        </CustomFormLabel>
                        <select
                          id="sch-prkCd"
                          name="prkCd"
                          value={params.prkCd ?? ''}
                          className="custom-default-select"
                          style={{ width: '100%' }}
                          disabled={prkCdFlag}
                          onChange={handleSearchChange}
                        >
                          {prkCdOptions.map((option) => (
                            <option key={option.key} value={option.key}>
                              {option.value}
                            </option>
                          ))}
                        </select>
                      </TableCell>
                      <TableCell className="table-title-column td-left">
                        부제요일
                      </TableCell>
                      <TableCell>
                        <CustomFormLabel
                          className="input-label-none"
                          htmlFor="sch-dowCd"
                        >
                          부제요일
                        </CustomFormLabel>
                        <select
                          id="sch-dowCd"
                          name="dowCd"
                          value={params.dowCd ?? ''}
                          className="custom-default-select"
                          style={{ width: '100%' }}
                          disabled={dowCdFlag}
                          onChange={handleSearchChange}
                        >
                          {dowCdOptions.map((option) => (
                            <option key={option.key} value={option.key}>
                              {option.value}
                            </option>
                          ))}
                        </select>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={4} className="td-right">
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={addListItem}
                        >
                          추가
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                <Table className="table table-bordered">
                  <caption>부제조 테이블</caption>
                  <TableHead>
                    <TableRow>
                      <TableCell colSpan={4} className="table-title-column">
                        부제조
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {nmList?.map((row, index) => (
                      <TableRow key={index} id={index.toString()}>
                        <TableCell className="td-center" colSpan={2}>
                          <span className="required-text">* </span>
                          부제조명
                        </TableCell>
                        <TableCell>
                          <CustomFormLabel
                            className="input-label-none"
                            htmlFor="mldal-indctNm"
                          >
                            부제조명
                          </CustomFormLabel>
                          <CustomTextField
                            type="text"
                            id="modal-indctNm"
                            name="indctNm"
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>,
                            ) => handleNmListChange(e, index)}
                            value={row.indctNm}
                            inputProps={{
                              maxLength: 12,
                            }}
                            fullWidth
                          />
                        </TableCell>
                        <TableCell className="td-center">
                          <Button
                            variant="contained"
                            color="error"
                            onClick={() => deleteNmListItem(index)}
                          >
                            삭제
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {reqList.map((item, index) => (
                      <TableRow key={'reqList' + item?.id} id={item.id}>
                        <TableCell className="td-center" colSpan={2}>
                          <span className="required-text">* </span>
                          부제조명
                        </TableCell>
                        <TableCell>
                          <CustomFormLabel
                            className="input-label-none"
                            htmlFor="modal-indctNm"
                          >
                            부제조명
                          </CustomFormLabel>
                          <CustomTextField
                            type="text"
                            id="modal-indctNm"
                            name="indctNm"
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>,
                            ) => handleListChange(e, index)}
                            value={item.indctNm}
                            inputProps={{
                              maxLength: 12,
                            }}
                            fullWidth
                          />
                        </TableCell>
                        <TableCell className="td-center">
                          <Button
                            variant="contained"
                            color="error"
                            onClick={() => deleteListItem(item.id)}
                          >
                            삭제
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
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

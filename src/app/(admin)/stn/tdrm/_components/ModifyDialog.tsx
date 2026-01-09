'use client'
import {
  Box,
  Button,
  FormControlLabel,
  MenuItem,
  RadioGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  FormGroup,
} from '@mui/material'
import CustomCheckbox from '@/components/forms/theme-elements/CustomCheckbox'
import Dialog, { DialogProps } from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import React, { useEffect, useState } from 'react'
import {
  CustomFormLabel,
  CustomSelect,
  CustomTextField,
} from '@/utils/fsms/fsm/mui-imports'
import { StandRow, DetailRow } from '../page'
import { SelectItem } from 'select'
import { Pageable2 } from 'table'
import {
  sendHttpFileRequest,
  sendHttpRequest,
  sendMultipartFormDataRequest,
} from '@/utils/fsms/common/apiUtils'
import BlankCard from '@/app/components/shared/BlankCard'

import { getUserInfo } from '@/utils/fsms/utils'
import { getDateRange } from '@/utils/fsms/common/comm'

// 시도코드, 관할관청 조회
import {
  CtpvSelect,
  LocgovSelect,
  CommSelect,
} from '@/app/components/tx/commSelect/CommSelect'
import { getCodesByGroupNm } from '@/utils/fsms/common/code/getCode'

interface ModifyDialogProps {
  title: string
  // children: React.ReactElement<ModalFormProps>; // ModalFormProps 타입의 ReactElement
  size?: DialogProps['maxWidth'] | 'lg'
  open: boolean
  // selectedRow: DetailRow;
  reloadFunc: () => void
  handleDetailCloseModal: () => void
  dayoffLocgovCd: string
}

// selectedRow(Row)안에  fileList : File[]로 가짐
// export interface File {
//     atchSn?: string;  //첨부일련번호
//     bbscttSn?: string; //게시글일련번호
//     fileSize?: string; //파일용량
//     lgcFileNm?: string; //논리파일명
//     mdfcnDt?: string; //수정일시
//     mdfrId?: string; //수정자아이디
//     physFileNm?: string; // 물리파일명
//     regDt?: string; // 등록일시
//     rgtrId?: string;  // 등록자아이디
// }
// export interface Row {
//     rowNum: string //숫자
//     locgovNm: string //지자체명
//     dayoffSeNm: string //부제구분
//     dayoffTypeNm: string //부제유형
//     dayoffNm: string //부제기준명
//     indctNm: string //부제조
//     bgngHr: string //부제기준
//     endHrNxtyNm: string //부제종료시간명
//     endHr: string //부제종료시간
//     locgovCd: string //관할관청코드
//   }

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

const dayoffTypeCd: SelectItem[] = []
const endHrNxtyYn: SelectItem[] = []
const prkCd: SelectItem[] = []
const dowCd: SelectItem[] = []

export default function ModifyDialog(props: ModifyDialogProps) {
  const {
    title,
    //children
    size,
    open,
    handleDetailCloseModal,
    reloadFunc,
    dayoffLocgovCd,
  } = props
  const [isEditMode, setIsEditMode] = useState<boolean>(false) // 등록 수정 모드 상태 관리
  // const [formData, setFormData] = useState<StandRow>(); // 수정될 데이터를 관리하는 상태
  const [locgovCdItems, setLocgovCdItems] = useState<SelectItem[]>([]) // 관할관청 코드
  const [loading, setLoading] = useState(false) // 로딩여부
  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  // const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1,
  })
  const [dayoffRtrcnSeCode, setDayoffRtrcnSeCode] = useState('1') // 부제해제구분코드
  const [dayoffTypeCode, setDayoffTypeCode] = useState('0') // 부제해제구분코드

  const [dayoffTypeCdOptions, setDayoffTypeCdOptions] = useState([
    { label: '', value: '' },
  ])
  const [endHrNxtyYnOptions, setEndHrNxtyYnOptions] = useState([
    { label: '', value: '' },
  ])
  const [prkCdOptions, setPrkCdOptions] = useState([{ label: '', value: '' }])
  const [dowCdOptions, setDowCdOptions] = useState([{ label: '', value: '' }])

  const [formData, setFormData] = useState<StandRow>({
    // 등록될 데이터를 관리하는 상태
    dayoffLocgovCd: '', //부제 지자체코드
    dayoffRmvNo: '', //부제해제번호
    locgovNm: '', //지자체명
    dayoffNm: '', //부제명
    dayoffExpln: '', //부제설명
    rmvBgngYmd: '', //해제시작일시
    rmvEndYmd: '', //해제종료일시
    dayoffRtrcnSeCd: '', //부제해제구분코드
    rtrcnBgngHr: '', //해제 시작시간
    rtrcnEndHr: '', //해제종료시간
    cfmtnSeCd: '', //확정구분코드
    dayoffTypeCd: '', //부제유형코드
    endHrNxtyYn: '', //종료시간익일여부
    crtrYmd: '', //기준일자
    prkCd: '', //주차코드
    dowCd: '', //요일코드
    delYn: '', //삭제여부
    rgtrId: '', //등록자ID
    regDt: '', //등록일
    mdfrId: '', //수정자ID
    mdfcnDt: '', //수정일
    cancelStandStart: '', //해제시작일시
    cancelStandEnd: '', //해제종료일시
    cancelStandInfo: '', //부제해제정보
    dayoffAll: false,
  })

  const userInfo = getUserInfo()

  useEffect(() => {
    const dateRange = getDateRange('d', -1)
    let startDate = dateRange.startDate
    setFormData((prev) => ({ ...prev, rmvBgngYmd: startDate }))

    const fetchCodes = async () => {
      const dayoffTypeCdRes = await getCodesByGroupNm('IHF2')
      const endHrNxtyYnRes = await getCodesByGroupNm('IHG6')
      const prkCdRes = await getCodesByGroupNm('IHG4')
      const dowCdRes = await getCodesByGroupNm('IHG3')
      if (dayoffTypeCd.length == 0)
        dayoffTypeCdRes?.forEach((code: any) =>
          dayoffTypeCd.push({ label: code['cdKornNm'], value: code['cdNm'] }),
        )
      if (endHrNxtyYn.length == 0)
        endHrNxtyYnRes?.forEach((code: any) =>
          endHrNxtyYn.push({ label: code['cdKornNm'], value: code['cdNm'] }),
        )
      if (prkCd.length == 0)
        prkCdRes?.forEach((code: any) =>
          prkCd.push({ label: code['cdKornNm'], value: code['cdNm'] }),
        )
      if (dowCd.length == 0)
        dowCdRes?.forEach((code: any) =>
          dowCd.push({ label: code['cdKornNm'], value: code['cdNm'] }),
        )
      // setDayoffTypeCdOptions(dayoffTypeCd);
      // setEndHrNxtyYnCdOptions(endHrNxtyYn);
      // setPrkCdOptions(prkCd);
      // setDowCdOptions(dowCd);
    }

    fetchCodes()
  }, [])

  useEffect(() => {
    if (formData.dayoffRtrcnSeCd) {
      setDayoffRtrcnSeCode(formData.dayoffRtrcnSeCd)
    }
    if (formData.dayoffTypeCd) {
      setDayoffTypeCode(formData.dayoffTypeCd)
    }
  }, [formData])

  // 다이얼로그 닫기 핸들러
  const handleClose = () => {
    handleDetailCloseModal()
    setIsEditMode(false) // 닫을 때 수정 모드 초기화
  }

  // 수정 모드 토글
  const handleEditToggle = () => {
    setIsEditMode(!isEditMode) // 수정 모드 토글
  }
  // 데이터 변경 핸들러
  const handleFormDataChange = (name: string, value: string) => {
    if ('popupNtcYn' === name) {
      setFormData((prev) => ({
        ...prev,
        ['popupEndYmd']: '',
        ['popupBgngYmd']: '',
      }))
    }
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // 등록 내용 저장 핸들러
  const handleSave = async () => {
    try {
      if (userInfo.rollYn === '') {
        alert('현재 부제 미사용 지자체입니다. 관리자에게 문의해주세요')
        // return
      } else if (userInfo.rollYn === 'N' && userInfo.authLocgovNm) {
        alert(userInfo.authLocgovNm + '만 가능합니다.')
        return
      } else if (
        userInfo.locgovCd &&
        userInfo.locgovCd.length == 5 &&
        dayoffLocgovCd &&
        dayoffLocgovCd.length == 5 //타겟데이터 지자체코드 확인
      ) {
        //타겟정보
        const ctpvCd = dayoffLocgovCd.substring(0, 2)
        // console.log('ctpvCd : ', ctpvCd)
        //유저정보
        const userCtpvCd = userInfo.locgovCd.substring(0, 2)
        const userInstCd = userInfo.locgovCd.substring(2, 5)

        if (
          userCtpvCd == '11' &&
          (userInstCd == '000' || userInstCd == '001' || userInstCd == '009')
        ) {
          //서울 시도 담당자
          if (userCtpvCd != ctpvCd) {
            alert(userInfo.authLocgovNm + '만 가능합니다.')
            return
          }
        } else if (
          userCtpvCd == '11' &&
          userInstCd != '000' &&
          userInstCd != '001' &&
          userInstCd == '009'
        ) {
          //서울 시도 담당자 아님
          if (userInfo.locgovCd != dayoffLocgovCd) {
            alert('소속 지자체만 등록 가능합니다.')
            return
          }
        } else if (userInstCd == '000' || userInstCd == '001') {
          //서울외 시도 담당자
          if (userCtpvCd != ctpvCd) {
            alert(userInfo.authLocgovNm + '만 가능합니다.')
            return
          }
        } else if (userInstCd != '000' && userInstCd != '001') {
          //서울외 시도 담당자 아님
          if (userInfo.locgovCd != dayoffLocgovCd) {
            alert('소속 지자체만 등록 가능합니다.')
            return
          }
        }
      }

      // 필수 값 체크
      if (!formData.dayoffNm) {
        alert('부제해제명을 입력해야 합니다.')
        return
      }
      if (!formData.dayoffExpln) {
        alert('부제해제설명을 입력해야 합니다.')
        return
      }
      if (!formData.dayoffRtrcnSeCd) {
        alert('부제해제구분을 선택해야 합니다.')
        return
      }
      // if (!formData.dayoffTypeCd) {
      //   alert('부제해제유형을 선택해야 합니다.')
      //   return
      // }
      if (!formData.rmvBgngYmd) {
        alert('해제시작일자를 선택해야 합니다.')
        return
      }
      if (!formData.rmvEndYmd) {
        alert('해제종료일자를 선택해야 합니다.')
        return
      }
      if (!formData.crtrYmd) {
        if (
          !(
            dayoffRtrcnSeCode === '1' ||
            (dayoffTypeCode != '1' && dayoffTypeCode != '4')
          )
        ) {
          alert('기준일자를 선택해야 합니다.')
          return
        }
      }

      if (formData.rmvBgngYmd && formData.rmvEndYmd) {
        if (formData.rmvBgngYmd > formData.rmvEndYmd) {
          alert('해제종료일은 해제시작일보다 빠를 수 없습니다.')
          return
        }
      }

      if (formData.rtrcnBgngHr && formData.rtrcnEndHr && formData.endHrNxtyYn) {
        if (
          formData.endHrNxtyYn === '1' &&
          formData.rtrcnBgngHr > formData.rtrcnEndHr
        ) {
          alert('당일 해제종료시간은 해제시작시간보다 빠를 수 없습니다.')
          return
        }
      }

      const userConfirm = confirm('등록된 내용을 저장하시겠습니까?')
      if (!userConfirm) return

      const endpoint = `/fsm/stn/tdrm/tx/createTaxiDayoffRelisStdr`

      // JSON 데이터
      const data = {
        dayoffLocgovCd: dayoffLocgovCd, //formData.dayoffLocgovCd,
        dayoffNm: formData.dayoffNm, //부제명
        dayoffExpln: formData.dayoffExpln, //부제설명
        rmvBgngYmd: formData.rmvBgngYmd.replaceAll('-', ''), //해제시작일시
        rmvEndYmd: formData.rmvEndYmd.replaceAll('-', ''), //해제종료일시
        dayoffRtrcnSeCd: formData.dayoffRtrcnSeCd, //부제해제구분코드
        rtrcnBgngHr: formData.rtrcnBgngHr + '0000', //해제 시작시간
        rtrcnEndHr: formData.rtrcnEndHr + '0000', //해제종료시간
        cfmtnSeCd: formData.dayoffAll === true ? '10' : '00', //확정구분코드
        dayoffTypeCd: formData.dayoffTypeCd, //부제유형코드
        endHrNxtyYn: formData.endHrNxtyYn, //종료시간익일여부
        crtrYmd: formData.crtrYmd.replaceAll('-', ''), //기준일자
        prkCd: formData.prkCd, //주차코드
        dowCd: formData.dowCd, //요일코드
        mdfrId: userInfo.lgnId,
        rgtrId: userInfo.lgnId,
        //relateTaskSeCd: formData.relateTaskSeCd,
      }

      // 추가되는 파일만 전달
      const response = await sendHttpRequest(
        'POST',
        endpoint,
        data,
        true, // JWT 사용 여부
      )

      if (response?.resultType === 'success') {
        alert('부제해제기준 정보가 등록되었습니다.')
        reloadFunc?.()
        handleClose()
      } else {
        console.error('Response fail:', response)
        alert(
          `부제해제기준 정보 등록 응답이 성공이 아닙니다. (${response?.message || 'Unknown Error'})`,
        )
        reloadFunc?.()
        handleClose()
      }
    } catch (error) {
      console.error('Error during update:', error)
      alert(`부제해제기준 정보 등록에 실패했습니다. `)
      handleClose()
    }
  }

  // const handleSearchChange = (
  //     event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  //   ) => {
  //     const { name, value } = event.target

  //     setLocgovCdItems((prev) => ({ ...prev, [name]: value }))
  //     formData.dayoffLocgovCd = value;
  //     fetchData();
  //   }
  const handleParamChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    if (name == 'dayoffRtrcnSeCd' && value === '1') {
      // 일반부제
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        dayoffAll: false,
        crtrYmd: '',
        endHrNxtyYn: '',
        dayoffTypeCd: '',
      }))
      setDayoffRtrcnSeCode(value)

      // 부제해제유형
      setDayoffTypeCdOptions([{ label: '', value: '' }])
      setEndHrNxtyYnOptions([{ label: '', value: '' }])
      setPrkCdOptions([{ label: '', value: '' }])
      setDowCdOptions([{ label: '', value: '' }])
    } else if (name == 'dayoffRtrcnSeCd' && value === '2') {
      // 특수부제
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        dayoffAll: true,
        endHrNxtyYn: '1',
        dayoffTypeCd: '0',
      }))
      setDayoffRtrcnSeCode(value)

      // 부제해제유형
      setDayoffTypeCdOptions(dayoffTypeCd)
      setEndHrNxtyYnOptions(endHrNxtyYn)
    }

    if (dayoffRtrcnSeCode === '2' && name == 'dayoffTypeCd' && value !== '3') {
      setPrkCdOptions([{ label: '', value: '' }])
    } else if (
      dayoffRtrcnSeCode === '2' &&
      name == 'dayoffTypeCd' &&
      value === '3'
    ) {
      setPrkCdOptions(prkCd)
    }

    if (
      dayoffRtrcnSeCode === '2' &&
      name == 'dayoffTypeCd' &&
      (value === '0' || value === '1')
    ) {
      setDowCdOptions([{ label: '', value: '' }])
    } else if (
      dayoffRtrcnSeCode === '2' &&
      name == 'dayoffTypeCd' &&
      value !== '0' &&
      value !== '1'
    ) {
      setDowCdOptions(dowCd)
    }

    // if (formData.dayoffTypeCd) {
    //     setDayoffTypeCode(formData.dayoffTypeCd)
    // }
    setFormData((prev) => ({ ...prev, [name]: value }))
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
              <h2>{title}</h2>
            </CustomFormLabel>
            <div className="button-right-align">
              <Button variant="contained" onClick={handleSave} color="primary">
                저장
              </Button>
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
                      <TableCell
                        className="td-head"
                        style={{ width: '20%', verticalAlign: 'middle' }}
                      >
                        <span className="required-text">*</span>부제해제명
                      </TableCell>
                      <TableCell
                        colSpan={3}
                        style={{
                          width: 'calc(50% - 150px)',
                          textAlign: 'left',
                        }}
                      >
                        <CustomFormLabel
                          className="input-label-none"
                          htmlFor="modal-dayoffNm"
                        >
                          부제해제명
                        </CustomFormLabel>
                        <CustomTextField
                          id="modal-dayoffNm"
                          name="dayoffNm"
                          type="text"
                          onChange={handleParamChange}
                          value={formData.dayoffNm ?? ''}
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
                        style={{ width: '20%', verticalAlign: 'middle' }}
                      >
                        <span className="required-text">*</span>부제해제설명
                      </TableCell>
                      <TableCell
                        colSpan={3}
                        style={{
                          width: 'calc(50% - 150px)',
                          textAlign: 'left',
                        }}
                      >
                        <CustomFormLabel
                          className="input-label-none"
                          htmlFor="modal-dayoffExpln"
                        >
                          부제해제설명
                        </CustomFormLabel>
                        <CustomTextField
                          type="text"
                          id="modal-dayoffExpln"
                          name="dayoffExpln"
                          onChange={handleParamChange}
                          value={formData.dayoffExpln ?? ''}
                          fullWidth
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell
                        className="td-head"
                        style={{ width: '20%', verticalAlign: 'middle' }}
                      >
                        <span className="required-text">*</span>부제해제구분
                      </TableCell>
                      <TableCell style={{ textAlign: 'left' }}>
                        <CustomFormLabel
                          className="input-label-none"
                          htmlFor="sch-dayoffRtrcnSeCd"
                        >
                          부제해제구분
                        </CustomFormLabel>
                        <CommSelect
                          cdGroupNm={'IHG1'}
                          pValue={formData.dayoffRtrcnSeCd}
                          pName={'dayoffRtrcnSeCd'}
                          width={'100%'}
                          handleChange={handleParamChange}
                          htmlFor={'sch-dayoffRtrcnSeCd'}
                          // addText='전체'
                        />
                      </TableCell>
                      <TableCell
                        className="td-head"
                        style={{ width: '20%', verticalAlign: 'middle' }}
                      >
                        {dayoffRtrcnSeCode === '1' ? null : (
                          <span className="required-text">*</span>
                        )}
                        부제해제유형
                      </TableCell>
                      <TableCell style={{ textAlign: 'left' }}>
                        <CustomFormLabel
                          className="input-label-none"
                          htmlFor="sch-dayoffTypeCd"
                        >
                          부제해제유형
                        </CustomFormLabel>
                        <select
                          id="sch-dayoffTypeCd"
                          name="dayoffTypeCd"
                          value={formData.dayoffTypeCd}
                          className="custom-default-select"
                          style={{ width: '100%' }}
                          html-for={'sch-dayoffTypeCd'}
                          disabled={dayoffRtrcnSeCode === '1'}
                          onChange={handleParamChange}
                        >
                          {dayoffTypeCdOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell
                        className="td-head"
                        style={{ width: '20%', verticalAlign: 'middle' }}
                      >
                        <span className="required-text">*</span>해제시작일자
                      </TableCell>
                      <TableCell style={{ textAlign: 'left' }}>
                        <CustomFormLabel
                          className="input-label-none"
                          htmlFor="ft-date-start"
                        >
                          해제시작일자
                        </CustomFormLabel>
                        <CustomTextField
                          type="date"
                          id="ft-date-start"
                          name="rmvBgngYmd"
                          value={formData.rmvBgngYmd}
                          onChange={handleParamChange}
                          fullWidth
                        />
                      </TableCell>
                      <TableCell
                        className="td-head"
                        style={{ width: '20%', verticalAlign: 'middle' }}
                      >
                        <span className="required-text">*</span>해제종료일자
                      </TableCell>
                      <TableCell style={{ textAlign: 'left' }}>
                        <CustomFormLabel
                          className="input-label-none"
                          htmlFor="ft-date-end"
                        >
                          해제종료일자
                        </CustomFormLabel>
                        <CustomTextField
                          type="date"
                          id="ft-date-end"
                          name="rmvEndYmd"
                          value={formData.rmvEndYmd}
                          onChange={handleParamChange}
                          fullWidth
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell
                        className="td-head"
                        style={{ width: '20%', verticalAlign: 'middle' }}
                      >
                        <span className="required-text">*</span> 해제시작시간
                      </TableCell>
                      <TableCell>
                        <CustomFormLabel
                          className="input-label-none"
                          htmlFor="sch-rtrcnBgngHr"
                        >
                          해제시작시간
                        </CustomFormLabel>
                        <CommSelect
                          cdGroupNm="IHG5"
                          pValue={formData.rtrcnBgngHr ?? ''}
                          handleChange={handleParamChange}
                          pName="rtrcnBgngHr"
                          /* width */ // 필수 X, default 100% ** 특정 width 값이 필요하신 경우 기재해주시면 됩니다
                          htmlFor={'sch-rtrcnBgngHr'}
                        />
                      </TableCell>
                      <TableCell
                        className="td-head"
                        style={{ width: '20%', verticalAlign: 'middle' }}
                      >
                        <span className="required-text">*</span> 해제종료시간
                      </TableCell>
                      <TableCell>
                        <CustomFormLabel
                          className="input-label-none"
                          htmlFor="sch-endHrNxtyYn"
                        >
                          해제종료여부
                        </CustomFormLabel>
                        <select
                          id="sch-endHrNxtyYn"
                          name="endHrNxtyYn"
                          value={formData.endHrNxtyYn}
                          className="custom-default-select"
                          style={{ width: '50%' }}
                          html-for={'sch-endHrNxtyYn'}
                          disabled={dayoffRtrcnSeCode === '1'}
                          onChange={handleParamChange}
                        >
                          {endHrNxtyYnOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <CustomFormLabel
                          className="input-label-none"
                          htmlFor="sch-rtrcnEndHr"
                        >
                          해제종료시간
                        </CustomFormLabel>
                        <CommSelect
                          cdGroupNm="IHG5"
                          pValue={formData.rtrcnEndHr ?? ''}
                          handleChange={handleParamChange}
                          pName="rtrcnEndHr"
                          width={'50%'}
                          htmlFor={'sch-rtrcnEndHr'}
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell
                        className="td-head"
                        style={{ width: '20%', verticalAlign: 'middle' }}
                      >
                        {dayoffRtrcnSeCode === '1' ||
                        (dayoffTypeCode != '1' &&
                          dayoffTypeCode != '4') ? null : (
                          <span className="required-text">*</span>
                        )}
                        기준일자
                      </TableCell>
                      <TableCell colSpan={3} style={{ textAlign: 'left' }}>
                        <CustomFormLabel
                          className="input-label-none"
                          htmlFor="ft-crtrYmd-start"
                        ></CustomFormLabel>
                        <CustomTextField
                          type={
                            dayoffRtrcnSeCode === '1' ||
                            (dayoffTypeCode != '1' && dayoffTypeCode != '4')
                              ? 'text'
                              : 'date'
                          }
                          id="ft-crtrYmd-start"
                          name="crtrYmd"
                          value={formData.crtrYmd}
                          onChange={handleParamChange}
                          disabled={
                            dayoffRtrcnSeCode === '1' ||
                            (dayoffTypeCode != '1' && dayoffTypeCode != '4')
                          }
                          fullWidth
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell
                        className="td-head"
                        style={{ width: '20%', verticalAlign: 'middle' }}
                      >
                        {dayoffRtrcnSeCode === '1' ||
                        dayoffTypeCode === '0' ||
                        dayoffTypeCode === '1' ? null : (
                          <span className="required-text">*</span>
                        )}
                        해제요일
                      </TableCell>
                      <TableCell colSpan={3} style={{ textAlign: 'left' }}>
                        <CustomFormLabel
                          className="input-label-none"
                          htmlFor="sch-prkCd"
                        >
                          해제요일
                        </CustomFormLabel>
                        <select
                          id="sch-prkCd"
                          name="prkCd"
                          value={formData.prkCd}
                          className="custom-default-select"
                          style={{ width: '50%' }}
                          html-for={'sch-prkCd'}
                          disabled={
                            dayoffRtrcnSeCode === '1' || dayoffTypeCode != '3'
                          }
                          onChange={handleParamChange}
                        >
                          {prkCdOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <CustomFormLabel
                          className="input-label-none"
                          htmlFor="sch-dowCd"
                        >
                          X
                        </CustomFormLabel>
                        <select
                          id="sch-dowCd"
                          name="dowCd"
                          value={formData.dowCd}
                          className="custom-default-select"
                          style={{ width: '50%' }}
                          html-for={'sch-dowCd'}
                          disabled={
                            dayoffRtrcnSeCode === '1' ||
                            dayoffTypeCode === '0' ||
                            dayoffTypeCode === '1'
                          }
                          onChange={handleParamChange}
                        >
                          {dowCdOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell
                        className="td-head"
                        style={{ width: '20%', verticalAlign: 'middle' }}
                      >
                        전체해제
                      </TableCell>
                      <TableCell colSpan={3} style={{ textAlign: 'left' }}>
                        <CustomFormLabel
                          className="input-label-none"
                          htmlFor="chkAll"
                        >
                          전체해제
                        </CustomFormLabel>
                        <CustomCheckbox
                          id="chkAll"
                          name="dayoffAll"
                          value={formData.dayoffAll}
                          checked={formData.dayoffAll}
                          // defaultChecked={false}
                          // onChange={handleParamChange}
                        />
                        지자체 부제전체해제(해제차량 등록필요 없음)
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

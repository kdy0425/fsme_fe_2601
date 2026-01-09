import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { getDateRange, getToday } from '@/utils/fsms/common/comm'
import { CustomFormLabel, CustomTextField } from '@/utils/fsms/fsm/mui-imports'
import { Box, Button, TableCell } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { brNoFormatter, getDateTimeString } from '@/utils/fsms/common/util'
import { rrNoFormatter } from '@/utils/fsms/common/util'

import { Row } from '../page'
import VhclSearchModal, {
  VhclRow,
} from '@/app/components/tr/popup/VhclSearchModal'
import { LocalSearchModal } from '@/app/components/tr/popup/LocalSearchModal'
import { useDispatch, useSelector } from 'react-redux'
import {
  clearLocgovInfo,
  openLocgovModal,
  closeLocgovModal,
  closeModalAndClearLocgovInfo,
} from '@/store/popup/LocgovInfoSlice'
import { getForamtAddDay } from '@/utils/fsms/common/dateUtils'

interface ModalProperties {
  data: Row | null
  reload: () => void
  type: 'CREATE' | 'UPDATE'
}

const ModalContent = (props: ModalProperties) => {
  const { data, reload, type } = props
  const [flag, setFlag] = useState<boolean>(false)
  const [flag2, setFlag2] = useState<boolean>(false)

  const selectedLocgovInfo = useSelector((state: any) => state.locgovInfo)
  const dispatch = useDispatch()

  const [params, setParams] = useState({
    hstrySn: '',
    vhclNo: '',
    vonrNm: '',
    vonrBrno: '',
    vonrRrno: '',
    vonrRrnoSecure: '',
    bgngYmd: '',
    endYmd: '',
    chgRsnCn: '',
    bfrVhclNo: '',
    exsLocgovNm: '',
    vhclPsnCd: '',
    locgovCd: '', // 차량의 지자체코드
    crno: '',
    crnoSecure: '',
    ctpvCd: '',
    sggCd: '',
    ctpvNm: '',
    locgovNm: '',
    exsLocgovCd: '', // 이전 지자체코드
  })

  const [openVhclModal, setOpenVhclModal] = useState<boolean>(false)

  const [openLocSchModal, setOpenLocSchModal] = useState<boolean>(false)
  useEffect(() => {
    if (type == 'UPDATE' && data) {
      setFlag(data.bgngYmd.replaceAll('-', '') <= getToday()) // false 인데 여기서 오늘날짜보다 작으면 true 로 가야함
      setFlag2(data.endYmd.replaceAll('-', '') <= getToday())
      setParams((prev) => ({
        ...prev,
        hstrySn: String(Number(data.hstrySn)),
        vhclNo: data.vhclNo,
        vonrNm: data.vonrNm,
        vonrBrno: data.vonrBrno,
        vonrRrno: data.vonrRrno,
        vonrRrnoSecure: data.vonrRrnoSecure,
        vhclPsnCd: data.vhclPsnCd,
        bgngYmd: getDateTimeString(data.bgngYmd, 'date')?.dateString ?? '',
        endYmd: getDateTimeString(data.endYmd, 'date')?.dateString ?? '',
        chgRsnCn: data.chgRsnCn,
        bfrVhclNo: data.bfrVhclNo,
        exsLocgovCd: data.exsLocgovCd,
        ctpvNm: data.ctpvNm,
        exsLocgovNm: data.exsLocgovNm,
        locgovNm: data.locgovNm,
      }))
    }
  }, [type, data])

  useEffect(() => {
    setParams((prev) => ({
      ...prev,
      ctpvCd: '',
      sggCd: '',
      ctpvNm: '',
      locgovNm: '',
      exsLocgovCd: '',
    }))
  }, [])

  const handleParamChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = event.target
    const regex = /[\-~`!@#$%^&*()_+={}[\]|\\:;"'<>,.?/]/g

    if (name == 'endYmd') {
      if (!params.bgngYmd) {
        alert('지급정지시작일을 먼저 입력해야 합니다.')
        return
      } else if (
        value.replaceAll('-', '') < params.bgngYmd.replaceAll('-', '')
      ) {
        alert('지급정지종료일은 지급정지시작일 이전이어야 합니다.')
        return
      }
    }
    if (name == 'vhclNo') {
      setParams((prev) => ({
        ...prev,
        [name]: value.replaceAll(regex, '').replaceAll(' ', ''),
      }))
    } else {
      setParams((prev) => ({ ...prev, [name]: value }))
    }
  }

  const sendData = async () => {
    try {
      if (!params.vhclNo) {
        alert('차량정보를 선택해주세요.')
        return
      }

      if (!params.bgngYmd) {
        alert('정지시작일을 입력해주세요.')
        return
      }

      if (!params.endYmd) {
        alert('정지종료일을 입력해주세요.')
        return
      }

      if (!params.chgRsnCn.replaceAll(/\n/g, '').replaceAll(/\t/g, '')) {
        alert('이력사항을 입력해주세요.')
        return
      }

      // if (
      //   params.chgRsnCn.replaceAll(/\n/g, '').replaceAll(/\t/g, '').length > 60
      // ) {
      //   alert('이력사항은 30자리 이하로 입력해주시기 바랍니다.')
      //   return
      // }

      let endpoint: string =
        type == 'CREATE'
          ? `/fsm/ilg/esh/tr/insertExaathrSucHis`
          : `/fsm/ilg/esh/tr/updateExaathrSucHis`

      let body = {
        ...params,
        chgRsnCn: params.chgRsnCn.replaceAll(/\n/g, '').replaceAll(/\t/g, ''),
        bgngYmd: params.bgngYmd.replaceAll('-', ''),
        endYmd: params.endYmd.replaceAll('-', ''),
      }

      const response = await sendHttpRequest(
        type == 'CREATE' ? 'POST' : 'PUT',
        endpoint,
        body,
        true,
        {
          cache: 'no-store',
        },
      )

      if (response && response.resultType == 'success') {
        alert(response.message)
        reload()
      } else {
        console.log(response.message)
      }
    } catch (error) {
      console.error('Error ::: ', error)
    } finally {
      dispatch(closeLocgovModal())
      dispatch(closeModalAndClearLocgovInfo())
    }
  }

  const handleVhclRowClick = (row: VhclRow) => {
    setParams((prev) => ({
      ...prev,
      vhclNo: row.vhclNo,
      vonrRrno: row.vonrRrno,
      vonrRrnoSecure: row.vonrRrnoSecure,
      vonrBrno: row.vonrBrno,
      vonrNm: row.vonrNm,
      vhclPsnCd: row.vhclPsnCd,
      locgovCd: row.locgovCd,
      crno: row.crno,
      crnoSecure: row.crnoSecure,
    }))
    setOpenVhclModal(false)
  }

  const submitData = async (event: React.FormEvent) => {
    event.preventDefault()
    event.stopPropagation()
    // dispatch(closeLocgovModal());
    // dispatch(closeModalAndClearLocgovInfo());
    await sendData()
  }

  const handleOpenModal = () => {
    dispatch(openLocgovModal()) // 모달 열기
    dispatch(clearLocgovInfo())
  }

  useEffect(() => {
    if (
      selectedLocgovInfo.locgovNmLGM === '' ||
      !selectedLocgovInfo.locgovNmLGM
    ) {
      return
    }
    if (selectedLocgovInfo && Object.keys(selectedLocgovInfo).length > 0) {
      if (type === 'CREATE') {
        setParams((prev) => ({
          ...prev,
          ctpvCd: selectedLocgovInfo.ctpvCdLGM ?? '',
          sggCd: selectedLocgovInfo.sggCdLGM ?? '',
          ctpvNm: selectedLocgovInfo.ctpvNmLGM ?? '',
          locgovNm: selectedLocgovInfo.locgovNmLGM ?? '',
          exsLocgovCd: selectedLocgovInfo.locgovCdLGM ?? '',
        }))
      } else {
        setParams((prev) => ({
          ...prev,
          ctpvCd: selectedLocgovInfo.ctpvCdLGM ?? '',
          sggCd: selectedLocgovInfo.sggCdLGM ?? '',
          ctpvNm: selectedLocgovInfo.ctpvNmLGM ?? '',
          locgovNm: selectedLocgovInfo.locgovNmLGM ?? '',
          exsLocgovCd: selectedLocgovInfo.locgovCdLGM ?? '',
          exsLocgovNm:
            selectedLocgovInfo.ctpvNmLGM + ' ' + selectedLocgovInfo.locgovNmLGM,
        }))
      }
    }
  }, [selectedLocgovInfo])

  return (
    // <Box className="table-scrollable">
    <Box
      component="form"
      id="submit-data"
      onSubmit={submitData}
      className="table-scrollable data-grid-wrapper"
      style={{ minWidth: '1200px' }}
    >
      <table className="table table-bordered">
        <tbody>
          <tr>
            <th className="td-head td-left" scope="row" style={{ width: '8%' }}>
              차량번호
            </th>
            <TableCell
              style={
                type == 'CREATE'
                  ? {
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      height: '100%',
                      whiteSpace: 'nowrap',
                    }
                  : { width: '15%' }
              }
            >
              <span style={{ width: '100%' }}>{params.vhclNo}</span>
              {type == 'CREATE' ? (
                <span>
                  <Button
                    onClick={() => setOpenVhclModal(true)}
                    variant="contained"
                    color="dark"
                  >
                    선택
                  </Button>
                  <VhclSearchModal
                    title={'차량번호 조회'}
                    // url={'/fsm/stn/ltmm/tr/pop/getUserVhclInfo'}
                    open={openVhclModal}
                    onRowClick={handleVhclRowClick}
                    onCloseClick={() => setOpenVhclModal(false)}
                  />
                </span>
              ) : (
                ''
              )}
            </TableCell>
            <th className="td-head td-left" scope="row" style={{ width: '9%' }}>
              소유자명
            </th>
            <td style={{ width: '20%' }}>
              <CustomTextField
                id="ft-vonrNm"
                name="vonrNm"
                value={params.vonrNm}
                onChange={handleParamChange}
                fullWidth
                inputProps={{ readOnly: true }}
              />
            </td>
            <th
              className="td-head td-left"
              scope="row"
              style={{ width: '10%' }}
            >
              사업자등록번호
            </th>
            <td style={{ width: '10%' }}>
              <CustomTextField
                id="ft-vonrBrno"
                name="vonrBrno"
                value={brNoFormatter(params?.vonrBrno)}
                onChange={handleParamChange}
                fullWidth
                inputProps={{ readOnly: true }}
              />
            </td>
            <th
              className="td-head td-left"
              scope="row"
              style={{ width: '10%' }}
            >
              주민등록번호
            </th>
            <td style={{ width: '25%' }}>
              <CustomTextField
                id="ft-vonrRrnoSecure"
                name="vonrRrnoSecure"
                value={rrNoFormatter(params?.vonrRrnoSecure)}
                onChange={handleParamChange}
                fullWidth
                inputProps={{ readOnly: true }}
              />
            </td>
          </tr>
          <tr>
            <th className="td-head td-left" scope="row" style={{ width: '9%' }}>
              정지시작일
            </th>
            <td style={{ width: '15%' }}>
              <CustomTextField
                type="date"
                id="ft-bgngYmd"
                name="bgngYmd"
                value={params.bgngYmd}
                onChange={handleParamChange}
                fullWidth
                inputProps={{
                  max: getForamtAddDay(1),
                }}
                disabled={flag}
              />
            </td>
            <th className="td-head td-left" scope="row" style={{ width: '8%' }}>
              정지종료일
            </th>
            <td style={{ width: '20%' }}>
              <CustomTextField
                type="date"
                id="ft-endYmd"
                name="endYmd"
                value={params.endYmd}
                onChange={handleParamChange}
                fullWidth
                inputProps={{
                  min: params.bgngYmd,
                }}
                disabled={flag2}
              />
            </td>
            <th
              className="td-head td-left"
              scope="row"
              style={{ width: '12.5%' }}
            >
              이전차량번호
            </th>
            <td style={{ width: '10%' }}>
              <CustomTextField
                id="ft-bfrVhclNo"
                name="bfrVhclNo"
                value={params.bfrVhclNo}
                onChange={handleParamChange}
                fullWidth
              />
            </td>
            <th
              className="td-head td-left"
              scope="row"
              style={{ width: '10%' }}
            >
              이전관할관청
            </th>
            {/* <td className='td-left' style={type == 'CREATE' ? { display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%' } : {width:'17%'}}> */}
            <td
              className="td-left"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                height: '100%',
              }}
            >
              <>
                {type === 'CREATE' ? (
                  <span style={{ width: '100%' }}>
                    {params.ctpvNm + ' ' + params.locgovNm}
                  </span>
                ) : (
                  <span style={{ width: '100%' }}>{params.exsLocgovNm}</span>
                )}
                {/* <span style={{width:'100%'}}>
                     {params.ctpvNm+' '+params.locgovNm}
                </span> */}
                <span>
                  <Button
                    variant="contained"
                    onClick={handleOpenModal}
                    color="dark"
                  >
                    선택
                  </Button>
                  <LocalSearchModal />
                </span>
              </>
            </td>
          </tr>
          <tr>
            <th className="td-head td-left" scope="row" style={{ width: '9%' }}>
              이력사항
            </th>
            <td colSpan={7}>
              <CustomFormLabel
                className="input-label-none"
                htmlFor="modal-chgRsnCn"
              >
                내용
              </CustomFormLabel>
              <textarea
                className="MuiTextArea-custom"
                id="modal-chgRsnCn"
                name="chgRsnCn"
                value={params.chgRsnCn}
                onChange={handleParamChange}
                // multiline
                rows={5}
                // fullWidth
              />
            </td>
          </tr>
        </tbody>
      </table>
    </Box>
  )
}

export default ModalContent

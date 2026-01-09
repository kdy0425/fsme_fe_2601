import CustomCheckbox from '@/app/components/forms/theme-elements/CustomCheckbox'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { telnoFormatter } from '@/utils/fsms/common/comm'
import { getDateTimeString } from '@/utils/fsms/common/util'
import { CustomFormLabel, CustomTextField } from '@/utils/fsms/fsm/mui-imports'
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  TableContainer,
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import { Row } from '../page'
import UserFormModal from './UserFormModal'
import { uniqueId } from 'lodash'

interface UserData {
  userAcntSttsCd: string
  userTsid: string
  lgnId: string
  userNm: string
  pswd: string
  ctpvCd: string
  locgovCd: string
  ipAddr: string
  ctpvNm: string
  locgovNm: string
  roleNm: string
  deptNm: string
  part1Addr: string
  part2Addr: string
  zip?: string // 지금은 없지만 필요함
  emlAddr: string
  telno: string
  mbtlnum: string
  aplyBgngYmd: string
  aplyEndYmd: string
  useYn: string
  subDnEncpt: string
  gccDeptNm: string
  prhibtRsnCn: string
  userRoles: any[]
  userAuths: UserAuth[]
  menus: any
}

interface UserAuth {
  userTypeCd: string
}

interface Body {
  lgnId: string
  userTsid?: string
  pswd: string
  locgovGb: string
  ctpvCd: string
  instCd: string
  bsBillYn: string
  bsPayYn: string
  bsRegYn: string
  bsQualYn: string
  bsInstcYn: string
  txBillYn: string
  txPayYn: string
  txRegYn: string
  txInstcYn: string
  txQualYn: string
  trBillYn: string
  trPayYn: string
  trRegYn: string
  trQualYn: string
  trInstcYn: string
  scrapYn: string
  userNm: string
  deptNm: string
  zip: string
  part1Addr: string
  part2Addr: string
  emlAddr: string
  telno: string
  mbtlnum: string
  aplyBgngYmd: string
  aplyEndYmd: string
  ipAddr: string
  userAcntSttsCd?: string
  prhibtRsnCn?: string
}

interface ModalProps {
  title: string
  row: Row | null
  remoteFlag: boolean
  closeHandler: () => void
  reload: () => void
}

// 1.
// CTPV 시도권한
// SGG 시군구권한
// MOLIT 국토부권한

// 해당 값들은 이렇게 설정되어 있습니다.

// 2.
// CTPV_01 버스-카드발급심사
// CTPV_02 버스-서류신청
// CTPV_03 버스-부정수급조사및처분
// CTPV_13 택시-부정수급조사및처분
// CTPV_12 택시-서류신청
// CTPV_11 택시-카드발급심사
// CTPV_21 화물-카드발급심사
// CTPV_22 화물-서류신청
// CTPV_23 화물-부정수급조사및처분

// 1번의 연장선이라고 생각하시면 되며 앞에 문자는 권한
// 뒤에 숫자가 담당업무라고 생각하시면 됩니다.

// 다른권한들도 앞에 문자만 다르며 뒤에 01,02,03 이런 숫자들이
// 해당하는 업무에 매핑된다고 생각해주시면 됩니다.

// 3.
// userYn 은 사용,요청 등과 같이 한글이름이라고 생각해주시면 되고
// userAncntSttsCd은 해당하는 코드 값이라고 생각해주시면 됩니다.

// R 요청
// U 사용
// T 거절
// D 탈퇴
// S 정지

const UserInfoModal = (props: ModalProps) => {
  const { title, row, remoteFlag, closeHandler, reload } = props
  const [open, setOpen] = useState(false)

  const [modifyModalOpen, setModifyModalOpen] = useState(false) // 수정 팝업
  const [prhibtModalOpen, setPrhibtModalOpen] = useState(false) // 거절사유 팝업

  const [data, setData] = useState<UserData>() // 상세조회로 받아온 Data
  const [body, setBody] = useState<Body>({
    // 파라미터 전송용 body
    lgnId: '',
    pswd: '',
    locgovGb: '',
    ctpvCd: '',
    instCd: '',
    bsBillYn: 'N',
    bsPayYn: 'N',
    bsRegYn: 'N',
    bsQualYn: 'N',
    bsInstcYn: 'N',
    txBillYn: 'N',
    txPayYn: 'N',
    txRegYn: 'N',
    txQualYn: 'N',
    txInstcYn: 'N',
    trBillYn: 'N',
    trPayYn: 'N',
    trRegYn: 'N',
    trQualYn: 'N',
    trInstcYn: 'N',
    scrapYn: '',
    userNm: '',
    deptNm: '',
    zip: '',
    part1Addr: '',
    part2Addr: '',
    emlAddr: '',
    telno: '',
    mbtlnum: '',
    aplyBgngYmd: '',
    aplyEndYmd: '',
    ipAddr: '',
    userTsid: '',
    userAcntSttsCd: '',
  })

  useEffect(() => {
    if (props.remoteFlag !== undefined) {
      setOpen(remoteFlag)
    }
  }, [remoteFlag])

  useEffect(() => {
    if (row?.lgnId) {
      getData(row?.lgnId)
    }
  }, [open])

  useEffect(() => {
    if (data) {
      console.log(data)
      if (data.userAuths && data.userAuths.length > 0) {
        let locgovGbString: string = data.userAuths[0].userTypeCd.split('_')[0]

        setBody((prev) => ({ ...prev, locgovGb: locgovGbString }))

        data.userAuths.map((auth) => {
          let code: string = auth.userTypeCd.split('_')[1]

          switch (code) {
            case '21':
              setBody((prev) => ({ ...prev, bsBillYn: 'Y' }))
              break
            case '22':
              setBody((prev) => ({ ...prev, bsPayYn: 'Y' }))
              break
            case '23':
              setBody((prev) => ({ ...prev, bsRegYn: 'Y' }))
              break
            case '24':
              setBody((prev) => ({ ...prev, bsQualYn: 'Y' }))
              break
            case '25':
              setBody((prev) => ({ ...prev, bsInstcYn: 'Y' }))
              break
            case '31':
              setBody((prev) => ({ ...prev, txBillYn: 'Y' }))
              break
            case '32':
              setBody((prev) => ({ ...prev, txPayYn: 'Y' }))
              break
            case '33':
              setBody((prev) => ({ ...prev, txRegYn: 'Y' }))
              break
            case '34':
              setBody((prev) => ({ ...prev, txQualYn: 'Y' }))
              break
            case '35':
              setBody((prev) => ({ ...prev, txInstcYn: 'Y' }))
              break
            case '11':
              setBody((prev) => ({ ...prev, trBillYn: 'Y' }))
              break
            case '12':
              setBody((prev) => ({ ...prev, trPayYn: 'Y' }))
              break
            case '13':
              setBody((prev) => ({ ...prev, trQualYn: 'Y' }))
              break
            case '14':
              setBody((prev) => ({ ...prev, trRegYn: 'Y' }))
              break
            case '15':
              setBody((prev) => ({ ...prev, trInstcYn: 'Y' }))
              break
            default:
              break
          }
        })
      }

      setBody((prev) => ({
        ...prev,
        userTsid: data.userTsid,
        lgnId: data.lgnId ?? '',
        pswd: data.pswd ?? '',
        ctpvCd: data.ctpvCd ?? '',
        instCd: data.locgovCd ?? '',
        scrapYn: '',
        userNm: data.userNm ?? '',
        deptNm: data.deptNm ?? '',
        zip: data.zip ?? '',
        part1Addr: data.part1Addr ?? '',
        part2Addr: data.part2Addr ?? '',
        emlAddr: data.emlAddr ?? '',
        telno: data.telno,
        mbtlnum: data.mbtlnum,
        aplyBgngYmd:
          getDateTimeString(data.aplyBgngYmd, 'date')?.dateString ?? '',
        aplyEndYmd:
          getDateTimeString(data.aplyEndYmd, 'date')?.dateString ?? '',
        ipAddr: data.ipAddr,
        userAcntSttsCd: data.userAcntSttsCd,
      }))
    }
  }, [data])

  const getData = async (lgnId: string) => {
    try {
      let endpoint: string = `/fsm/sym/user/cm/getOneDetailUser?lgnId=${lgnId}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success' && response.data) {
        setData(response.data)
      }
    } catch (error) {
      console.error('ERROR ::: ', error)
    }
  }

  // 승인(U), 거절(T), 정지해제(S -> U), 탈퇴(D)
  const confirmUser = async (userAncntSttsCd: string, resetStop?: boolean) => {
    try {
      let endpoint: string = `/fsm/sym/user/cm/confirmUser`

      let userConfirm: boolean = false

      if (userAncntSttsCd == 'U') {
        if (data?.useYn == '정지' && resetStop == true) {
          userConfirm = confirm(
            '정지된 사용자 정보를 사용으로 변경하시겠습니까?',
          )
        } else if (data?.useYn !== '정지' && resetStop == true) {
          alert('정지된 사용자만 정지해제를 할 수 있습니다')
          return
        } else {
          userConfirm = confirm('승인하시겠습니까?')
        }
      }

      if (userAncntSttsCd == 'T') {
        userConfirm = confirm('거절하시겠습니까?')
      }

      if (userAncntSttsCd == 'D') {
        userConfirm = confirm('사용자계정을 탈퇴처리 하시겠습니까?')
      }

      if (userConfirm) {
        let formData = {
          userTsid: body.userTsid,
          userAcntSttsCd: userAncntSttsCd,
          prhibtRsnCn: userAncntSttsCd == 'T' ? body.prhibtRsnCn : null,
          deptNm: body.deptNm,
        }

        const response = await sendHttpRequest(
          'PUT',
          endpoint,
          formData,
          true,
          {
            cache: 'no-store',
          },
        )

        if (response && response.resultType == 'success') {
          alert(response.message)
          setPrhibtModalOpen(false)
          reload()
        } else {
          console.log(response.message)
        }
      } else {
        return
      }
    } catch (error) {
      console.error(error)
    }
  }

  // 거절철회
  const resetUserConfirm = async () => {
    try {
      let endpoint: string = `/fsm/sym/user/cm/resetUserConfirm`

      const userConfirm = confirm('사용자 요청에대한 거절을 철회하시겠습니까?')

      if (userConfirm) {
        let formData = {
          userTsid: body.userTsid,
        }

        const response = await sendHttpRequest(
          'PUT',
          endpoint,
          formData,
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
      } else {
        return
      }
    } catch (error) {
      console.error(error)
    }
  }

  // 삭제
  const deleteUser = async () => {
    try {
      let endpoint: string = `/fsm/sym/user/cm/deleteUser`

      const userConfirm = confirm('사용자 정보를 삭제하시겠습니까?')

      if (userConfirm) {
        let formData = {
          userTsid: body.userTsid,
        }

        const response = await sendHttpRequest(
          'DELETE',
          endpoint,
          formData,
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
      } else {
        return
      }
    } catch (error) {
      console.error(error)
    }
  }

  // 비밀번호 초기화
  const resetPassword = async () => {
    try {
      let endpoint: string = `/fsm/sym/user/cm/resetUserPwd`

      const userConfirm = confirm(
        '비밀번호를 초기화 하시겠습니까?\n비밀번호는 아이디 + 1! 입니다.',
      )

      if (userConfirm) {
        let formData = {
          lgnId: body.lgnId,
        }

        const response = await sendHttpRequest(
          'PUT',
          endpoint,
          formData,
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
      } else {
        return
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleClose = () => {
    closeHandler()
    setOpen(false)
  }

  const handleFormReload = () => {
    setModifyModalOpen(false)
    reload()
  }

  return (
    <>
      <Dialog fullWidth={false} maxWidth={'xl'} open={open}>
        <DialogContent>
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              <h2>{title}</h2>
            </CustomFormLabel>
            <div className=" button-right-align">
              <UserFormModal
                type={'UPDATE'}
                key={uniqueId()}
                title={'사용자 수정'}
                row={row}
                remoteFlag={modifyModalOpen}
                closeHandler={() => setModifyModalOpen(false)}
                reload={handleFormReload}
              />
              {data && data.useYn == '요청' ? (
                <>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => confirmUser('U')}
                  >
                    승인
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setPrhibtModalOpen(true)}
                  >
                    거절
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setModifyModalOpen(true)}
                  >
                    수정
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => deleteUser()}
                  >
                    삭제
                  </Button>
                </>
              ) : data && data.useYn == '사용' ? (
                <>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => resetPassword()}
                  >
                    비밀번호초기화
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => confirmUser('U', true)}
                  >
                    정지해제
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setModifyModalOpen(true)}
                  >
                    수정
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => confirmUser('D')}
                  >
                    탈퇴
                  </Button>
                </>
              ) : data && data.useYn == '거절' ? (
                <>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => resetUserConfirm()}
                  >
                    거절철회
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() =>
                      alert('거절된 사용자는 수정이 불가능합니다.')
                    }
                  >
                    수정
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => confirmUser('D')}
                  >
                    탈퇴
                  </Button>
                </>
              ) : (
                // 탈퇴
                <></>
              )}
              <Button variant="contained" color="dark" onClick={handleClose}>
                취소
              </Button>
            </div>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              m: 'auto',
              width: 'full',
            }}
          >
            <TableContainer
              className="table-scrollable"
              style={{ minWidth: '1000px', margin: '16px 0 2em 0' }}
            >
              <table className="table table-bordered">
                <tbody>
                  {data && data.useYn == '요청' ? (
                    <>
                      <tr>
                        <th
                          className="td-head td-left"
                          scope="row"
                          style={{ width: '16.6%' }}
                        >
                          <span className="required-text">*</span>권한
                        </th>
                        <td colSpan={2}>
                          <div
                            className="table-form"
                            style={{ width: 'inherit' }}
                          >
                            {data.roleNm}
                          </div>
                        </td>
                        <th
                          className="td-head td-left"
                          scope="row"
                          style={{ width: '16.6%' }}
                        >
                          <span className="required-text">*</span>지자체
                        </th>
                        <td colSpan={3}>
                          <div className="table-form">
                            {data.ctpvNm + ' ' + data.locgovNm}
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <th className="td-head td-left" rowSpan={6}>
                          <span className="required-text">*</span>담당업무
                        </th>
                      </tr>
                      <tr>
                        <th colSpan={2}>업무유형</th>
                        <th>버스</th>
                        <th>택시</th>
                        <th>화물</th>
                      </tr>

                      <tr>
                        <td colSpan={2}>청구</td>
                        <td className="td-center">
                          <CustomCheckbox
                            name="bsBillYn"
                            checked={body.bsBillYn == 'Y'}
                            readOnly={body.bsBillYn == 'Y'}
                            disabled={body.bsBillYn !== 'Y'}
                          />
                        </td>
                        <td className="td-center">
                          <CustomCheckbox
                            name="txBillYn"
                            checked={body.txBillYn == 'Y'}
                            readOnly={body.txBillYn == 'Y'}
                            disabled={body.txBillYn !== 'Y'}
                          />
                        </td>
                        <td className="td-center">
                          <CustomCheckbox
                            name="trBillYn"
                            checked={body.trBillYn == 'Y'}
                            readOnly={body.trBillYn == 'Y'}
                            disabled={body.trBillYn !== 'Y'}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={2}>지급</td>
                        <td className="td-center">
                          <CustomCheckbox
                            name="bsPayYn"
                            checked={body.bsPayYn == 'Y'}
                            readOnly={body.bsPayYn == 'Y'}
                            disabled={body.bsPayYn !== 'Y'}
                          />
                        </td>
                        <td className="td-center">
                          <CustomCheckbox
                            name="txPayYn"
                            checked={body.txPayYn == 'Y'}
                            readOnly={body.txPayYn == 'Y'}
                            disabled={body.txPayYn !== 'Y'}
                          />
                        </td>
                        <td className="td-center">
                          <CustomCheckbox
                            name="trPayYn"
                            checked={body.trPayYn == 'Y'}
                            readOnly={body.trPayYn == 'Y'}
                            disabled={body.trPayYn !== 'Y'}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={2}>발급</td>
                        <td className="td-center">
                          <CustomCheckbox
                            name="bsRegYn"
                            checked={body.bsRegYn == 'Y'}
                            readOnly={body.bsRegYn == 'Y'}
                            disabled={body.bsRegYn !== 'Y'}
                          />
                        </td>
                        <td className="td-center">
                          <CustomCheckbox
                            name="txRegYn"
                            checked={body.txRegYn == 'Y'}
                            readOnly={body.txRegYn == 'Y'}
                            disabled={body.txRegYn !== 'Y'}
                          />
                        </td>
                        <td className="td-center">
                          <CustomCheckbox
                            name="trRegYn"
                            checked={body.trRegYn == 'Y'}
                            readOnly={body.trRegYn == 'Y'}
                            disabled={body.trRegYn !== 'Y'}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={2}>자격</td>
                        <td className="td-center">
                          <CustomCheckbox
                            name="bsQualYn"
                            checked={body.bsQualYn == 'Y'}
                            readOnly={body.bsQualYn == 'Y'}
                            disabled={body.bsQualYn !== 'Y'}
                          />
                        </td>
                        <td className="td-center">
                          <CustomCheckbox
                            name="txQualYn"
                            checked={body.txQualYn == 'Y'}
                            readOnly={body.txQualYn == 'Y'}
                            disabled={body.txQualYn !== 'Y'}
                          />
                        </td>
                        <td className="td-center">
                          <CustomCheckbox
                            name="trQualYn"
                            checked={body.trQualYn == 'Y'}
                            readOnly={body.trQualYn == 'Y'}
                            disabled={body.trQualYn !== 'Y'}
                          />
                        </td>
                      </tr>

                      <tr>
                        <th className="td-head td-left">
                          <span className="required-text">*</span>아이디
                        </th>
                        <td colSpan={6}>
                          <div className="table-form">{data.lgnId}</div>
                        </td>
                      </tr>
                      <tr>
                        <th className="td-head td-left">
                          <span className="required-text">*</span>사용자명
                        </th>
                        <td colSpan={2}>
                          <div className="table-form">{data.userNm}</div>
                        </td>
                        <th className="td-head td-left">
                          <span className="required-text">*</span>부서명
                        </th>
                        <td colSpan={3}>
                          <div className="table-form">{data.deptNm}</div>
                        </td>
                      </tr>

                      <tr>
                        <th className="td-head td-left">
                          <span className="required-text">*</span>기관주소
                        </th>
                        <td colSpan={6}>
                          {data.zip
                            ? `(${data.zip ?? ''}) ${data.part1Addr ?? ''} ${data.part2Addr ?? ''} `
                            : `${data.zip ?? ''} ${data.part1Addr ?? ''} ${data.part2Addr ?? ''} `}
                        </td>
                      </tr>
                      <tr>
                        <th className="td-head td-left">
                          <span className="required-text">*</span>이메일
                        </th>
                        <td colSpan={6}>
                          <div className="table-form">{data.emlAddr}</div>
                        </td>
                      </tr>

                      <tr>
                        <th className="td-head td-left">
                          <span className="required-text">*</span>내선번호
                        </th>
                        <td colSpan={2}>
                          <div className="table-form">
                            {telnoFormatter(String(data.telno))}
                          </div>
                        </td>
                        <th className="td-head td-left">핸드폰번호</th>
                        <td colSpan={3}>
                          <div className="table-form">
                            {telnoFormatter(String(data.mbtlnum))}
                          </div>
                        </td>
                      </tr>

                      <tr>
                        <th className="td-head td-left">
                          <span className="required-text">*</span>신청기간
                        </th>
                        <td colSpan={6}>
                          <div className="table-form">
                            {data.aplyBgngYmd && data.aplyEndYmd
                              ? `${getDateTimeString(String(data.aplyBgngYmd), 'date')?.dateString} ~ ${getDateTimeString(String(data.aplyEndYmd), 'date')?.dateString}`
                              : ``}
                          </div>
                        </td>
                      </tr>

                      <tr>
                        <th className="td-head td-left">
                          <span className="required-text">*</span>IP주소
                        </th>
                        <td colSpan={6}>
                          <div className="table-form">{data.ipAddr}</div>
                        </td>
                      </tr>
                      <tr>
                        <th className="td-head td-left">사용구분</th>
                        <td colSpan={6}>요청(미승인)</td>
                      </tr>
                      <tr>
                        <th className="td-head td-left">연계정보</th>
                        <td colSpan={6}>{data.gccDeptNm}</td>
                      </tr>
                    </>
                  ) : data && data.useYn == '사용' ? (
                    <>
                      <tr>
                        <th
                          className="td-head td-left"
                          scope="row"
                          style={{ width: '16.6%' }}
                        >
                          <span className="required-text">*</span>권한
                        </th>
                        <td colSpan={2}>
                          <div
                            className="table-form"
                            style={{ width: 'inherit' }}
                          >
                            {data.roleNm}
                          </div>
                        </td>
                        <th
                          className="td-head td-left"
                          scope="row"
                          style={{ width: '16.6%' }}
                        >
                          <span className="required-text">*</span>지자체
                        </th>
                        <td colSpan={3}>
                          <div className="table-form">
                            {data.ctpvNm + ' ' + data.locgovNm}
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <th className="td-head td-left" rowSpan={6}>
                          <span className="required-text">*</span>담당업무
                        </th>
                      </tr>
                      <tr>
                        <th colSpan={2}>업무유형</th>
                        <th>버스</th>
                        <th>택시</th>
                        <th>화물</th>
                      </tr>
                      <tr>
                        <td colSpan={2}>청구</td>
                        <td className="td-center">
                          <CustomCheckbox
                            name="bsBillYn"
                            checked={body.bsBillYn == 'Y'}
                            readOnly={body.bsBillYn == 'Y'}
                            disabled={body.bsBillYn !== 'Y'}
                          />
                        </td>
                        <td className="td-center">
                          <CustomCheckbox
                            name="txBillYn"
                            checked={body.txBillYn == 'Y'}
                            readOnly={body.txBillYn == 'Y'}
                            disabled={body.txBillYn !== 'Y'}
                          />
                        </td>
                        <td className="td-center">
                          <CustomCheckbox
                            name="trBillYn"
                            checked={body.trBillYn == 'Y'}
                            readOnly={body.trBillYn == 'Y'}
                            disabled={body.trBillYn !== 'Y'}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={2}>지급</td>
                        <td className="td-center">
                          <CustomCheckbox
                            name="bsPayYn"
                            checked={body.bsPayYn == 'Y'}
                            readOnly={body.bsPayYn == 'Y'}
                            disabled={body.bsPayYn !== 'Y'}
                          />
                        </td>
                        <td className="td-center">
                          <CustomCheckbox
                            name="txPayYn"
                            checked={body.txPayYn == 'Y'}
                            readOnly={body.txPayYn == 'Y'}
                            disabled={body.txPayYn !== 'Y'}
                          />
                        </td>
                        <td className="td-center">
                          <CustomCheckbox
                            name="trPayYn"
                            checked={body.trPayYn == 'Y'}
                            readOnly={body.trPayYn == 'Y'}
                            disabled={body.trPayYn !== 'Y'}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={2}>발급</td>
                        <td className="td-center">
                          <CustomCheckbox
                            name="bsRegYn"
                            checked={body.bsRegYn == 'Y'}
                            readOnly={body.bsRegYn == 'Y'}
                            disabled={body.bsRegYn !== 'Y'}
                          />
                        </td>
                        <td className="td-center">
                          <CustomCheckbox
                            name="txRegYn"
                            checked={body.txRegYn == 'Y'}
                            readOnly={body.txRegYn == 'Y'}
                            disabled={body.txRegYn !== 'Y'}
                          />
                        </td>
                        <td className="td-center">
                          <CustomCheckbox
                            name="trRegYn"
                            checked={body.trRegYn == 'Y'}
                            readOnly={body.trRegYn == 'Y'}
                            disabled={body.trRegYn !== 'Y'}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={2}>자격</td>
                        <td className="td-center">
                          <CustomCheckbox
                            name="bsQualYn"
                            checked={body.bsQualYn == 'Y'}
                            readOnly={body.bsQualYn == 'Y'}
                            disabled={body.bsQualYn !== 'Y'}
                          />
                        </td>
                        <td className="td-center">
                          <CustomCheckbox
                            name="txQualYn"
                            checked={body.txQualYn == 'Y'}
                            readOnly={body.txQualYn == 'Y'}
                            disabled={body.txQualYn !== 'Y'}
                          />
                        </td>
                        <td className="td-center">
                          <CustomCheckbox
                            name="trQualYn"
                            checked={body.trQualYn == 'Y'}
                            readOnly={body.trQualYn == 'Y'}
                            disabled={body.trQualYn !== 'Y'}
                          />
                        </td>
                      </tr>

                      <tr>
                        <th className="td-head td-left">
                          <span className="required-text">*</span>아이디
                        </th>
                        <td colSpan={6}>
                          <div className="table-form">{data.lgnId}</div>
                        </td>
                      </tr>
                      <tr>
                        <th className="td-head td-left">
                          <span className="required-text">*</span>사용자명
                        </th>
                        <td colSpan={2}>
                          <div className="table-form">{data.userNm}</div>
                        </td>
                        <th className="td-head td-left">
                          <span className="required-text">*</span>부서명
                        </th>
                        <td colSpan={3}>
                          <div className="table-form">{data.deptNm}</div>
                        </td>
                      </tr>

                      <tr>
                        <th className="td-head td-left">
                          <span className="required-text">*</span>기관주소
                        </th>
                        <td colSpan={6}>
                          {data.zip
                            ? `(${data.zip ?? ''}) ${data.part1Addr ?? ''} ${data.part2Addr ?? ''} `
                            : `${data.zip ?? ''} ${data.part1Addr ?? ''} ${data.part2Addr ?? ''} `}
                        </td>
                      </tr>
                      <tr>
                        <th className="td-head td-left">
                          <span className="required-text">*</span>이메일
                        </th>
                        <td colSpan={6}>
                          <div className="table-form">{data.emlAddr}</div>
                        </td>
                      </tr>

                      <tr>
                        <th className="td-head td-left">
                          <span className="required-text">*</span>내선번호
                        </th>
                        <td colSpan={2}>
                          <div className="table-form">
                            {telnoFormatter(String(data.telno))}
                          </div>
                        </td>
                        <th className="td-head td-left">핸드폰번호</th>
                        <td colSpan={3}>
                          <div className="table-form">
                            {telnoFormatter(String(data.mbtlnum))}
                          </div>
                        </td>
                      </tr>

                      <tr>
                        <th className="td-head td-left">
                          <span className="required-text">*</span>신청기간
                        </th>
                        <td colSpan={6}>
                          <div className="table-form">
                            {data.aplyBgngYmd && data.aplyEndYmd
                              ? `${getDateTimeString(String(data.aplyBgngYmd), 'date')?.dateString} ~ ${getDateTimeString(String(data.aplyEndYmd), 'date')?.dateString}`
                              : ``}
                          </div>
                        </td>
                      </tr>

                      <tr>
                        <th className="td-head td-left">
                          <span className="required-text">*</span>IP주소
                        </th>
                        <td colSpan={6}>
                          <div className="table-form">{data.ipAddr}</div>
                        </td>
                      </tr>
                      <tr>
                        <th className="td-head td-left">사용구분</th>
                        <td colSpan={6}>사용</td>
                      </tr>
                      <tr>
                        <th className="td-head td-left">연계정보</th>
                        <td colSpan={6}>{data.gccDeptNm}</td>
                      </tr>
                    </>
                  ) : data && data.useYn == '거절' ? (
                    <>
                      <tr>
                        <th
                          className="td-head td-left"
                          scope="row"
                          style={{ width: '16.6%' }}
                        >
                          <span className="required-text">*</span>권한
                        </th>
                        <td colSpan={2}>
                          <div
                            className="table-form"
                            style={{ width: 'inherit' }}
                          >
                            {data.roleNm}
                          </div>
                        </td>
                        <th
                          className="td-head td-left"
                          scope="row"
                          style={{ width: '16.6%' }}
                        >
                          <span className="required-text">*</span>지자체
                        </th>
                        <td colSpan={3}>
                          <div className="table-form">
                            {data.ctpvNm + ' ' + data.locgovNm}
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <th className="td-head td-left" rowSpan={6}>
                          <span className="required-text">*</span>담당업무
                        </th>
                      </tr>
                      <tr>
                        <th colSpan={2}>업무유형</th>
                        <th>버스</th>
                        <th>택시</th>
                        <th>화물</th>
                      </tr>
                      <tr>
                        <td colSpan={2}>청구</td>
                        <td className="td-center">
                          <CustomCheckbox
                            name="bsBillYn"
                            checked={body.bsBillYn == 'Y'}
                            readOnly={body.bsBillYn == 'Y'}
                            disabled={body.bsBillYn !== 'Y'}
                          />
                        </td>
                        <td className="td-center">
                          <CustomCheckbox
                            name="txBillYn"
                            checked={body.txBillYn == 'Y'}
                            readOnly={body.txBillYn == 'Y'}
                            disabled={body.txBillYn !== 'Y'}
                          />
                        </td>
                        <td className="td-center">
                          <CustomCheckbox
                            name="trBillYn"
                            checked={body.trBillYn == 'Y'}
                            readOnly={body.trBillYn == 'Y'}
                            disabled={body.trBillYn !== 'Y'}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={2}>지급</td>
                        <td className="td-center">
                          <CustomCheckbox
                            name="bsPayYn"
                            checked={body.bsPayYn == 'Y'}
                            readOnly={body.bsPayYn == 'Y'}
                            disabled={body.bsPayYn !== 'Y'}
                          />
                        </td>
                        <td className="td-center">
                          <CustomCheckbox
                            name="txPayYn"
                            checked={body.txPayYn == 'Y'}
                            readOnly={body.txPayYn == 'Y'}
                            disabled={body.txPayYn !== 'Y'}
                          />
                        </td>
                        <td className="td-center">
                          <CustomCheckbox
                            name="trPayYn"
                            checked={body.trPayYn == 'Y'}
                            readOnly={body.trPayYn == 'Y'}
                            disabled={body.trPayYn !== 'Y'}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={2}>발급</td>
                        <td className="td-center">
                          <CustomCheckbox
                            name="bsRegYn"
                            checked={body.bsRegYn == 'Y'}
                            readOnly={body.bsRegYn == 'Y'}
                            disabled={body.bsRegYn !== 'Y'}
                          />
                        </td>
                        <td className="td-center">
                          <CustomCheckbox
                            name="txRegYn"
                            checked={body.txRegYn == 'Y'}
                            readOnly={body.txRegYn == 'Y'}
                            disabled={body.txRegYn !== 'Y'}
                          />
                        </td>
                        <td className="td-center">
                          <CustomCheckbox
                            name="trRegYn"
                            checked={body.trRegYn == 'Y'}
                            readOnly={body.trRegYn == 'Y'}
                            disabled={body.trRegYn !== 'Y'}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={2}>자격</td>
                        <td className="td-center">
                          <CustomCheckbox
                            name="bsQualYn"
                            checked={body.bsQualYn == 'Y'}
                            readOnly={body.bsQualYn == 'Y'}
                            disabled={body.bsQualYn !== 'Y'}
                          />
                        </td>
                        <td className="td-center">
                          <CustomCheckbox
                            name="txQualYn"
                            checked={body.txQualYn == 'Y'}
                            readOnly={body.txQualYn == 'Y'}
                            disabled={body.txQualYn !== 'Y'}
                          />
                        </td>
                        <td className="td-center">
                          <CustomCheckbox
                            name="trQualYn"
                            checked={body.trQualYn == 'Y'}
                            readOnly={body.trQualYn == 'Y'}
                            disabled={body.trQualYn !== 'Y'}
                          />
                        </td>
                      </tr>

                      <tr>
                        <th className="td-head td-left">
                          <span className="required-text">*</span>아이디
                        </th>
                        <td colSpan={6}>
                          <div className="table-form">{data.lgnId}</div>
                        </td>
                      </tr>
                      <tr>
                        <th className="td-head td-left">
                          <span className="required-text">*</span>사용자명
                        </th>
                        <td colSpan={2}>
                          <div className="table-form">{data.userNm}</div>
                        </td>
                        <th className="td-head td-left">
                          <span className="required-text">*</span>부서명
                        </th>
                        <td colSpan={3}>
                          <div className="table-form">{data.deptNm}</div>
                        </td>
                      </tr>

                      <tr>
                        <th className="td-head td-left">
                          <span className="required-text">*</span>기관주소
                        </th>
                        <td colSpan={6}>
                          {`(${data.zip ?? ''}) ${data.part1Addr} ${data.part2Addr}`}
                        </td>
                      </tr>
                      <tr>
                        <th className="td-head td-left">
                          <span className="required-text">*</span>이메일
                        </th>
                        <td colSpan={6}>
                          <div className="table-form">{data.emlAddr}</div>
                        </td>
                      </tr>

                      <tr>
                        <th className="td-head td-left">
                          <span className="required-text">*</span>내선번호
                        </th>
                        <td colSpan={2}>
                          <div className="table-form">
                            {telnoFormatter(String(data.telno))}
                          </div>
                        </td>
                        <th className="td-head td-left">핸드폰번호</th>
                        <td colSpan={3}>
                          <div className="table-form">
                            {telnoFormatter(String(data.mbtlnum))}
                          </div>
                        </td>
                      </tr>

                      <tr>
                        <th className="td-head td-left">
                          <span className="required-text">*</span>신청기간
                        </th>
                        <td colSpan={6}>
                          <div className="table-form">
                            {data.aplyBgngYmd && data.aplyEndYmd
                              ? `${getDateTimeString(String(data.aplyBgngYmd), 'date')?.dateString} ~ ${getDateTimeString(String(data.aplyEndYmd), 'date')?.dateString}`
                              : ``}
                          </div>
                        </td>
                      </tr>

                      <tr>
                        <th className="td-head td-left">
                          <span className="required-text">*</span>IP주소
                        </th>
                        <td colSpan={6}>
                          <div className="table-form">{data.ipAddr}</div>
                        </td>
                      </tr>
                      <tr>
                        <th className="td-head td-left">사용구분</th>
                        <td colSpan={6}>사용</td>
                      </tr>
                      <tr>
                        <th className="td-head td-left">거절사유</th>
                        <td colSpan={6}>
                          <div className="table-form">{data.prhibtRsnCn}</div>
                        </td>
                      </tr>
                      <tr>
                        <th className="td-head td-left">연계정보</th>
                        <td colSpan={6}>{data.gccDeptNm}</td>
                      </tr>
                    </>
                  ) : (
                    <></>
                  )}
                </tbody>
              </table>
            </TableContainer>
          </Box>
        </DialogContent>
      </Dialog>

      {/* 거절사유 팝업 */}
      <Dialog fullWidth={false} maxWidth={'xl'} open={prhibtModalOpen}>
        <DialogContent>
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              <h2>거절 사유 등록</h2>
            </CustomFormLabel>
            <div className=" button-right-align">
              <Button onClick={() => confirmUser('T')}>저장</Button>
              <Button onClick={() => setPrhibtModalOpen(false)}>취소</Button>
            </div>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              m: 'auto',
              width: 'full',
            }}
          >
            <table
              className="table table-bordered"
              style={{ minWidth: '500px', margin: '16px 0 2em 0' }}
            >
              <tbody>
                <tr>
                  <th className="td-head td-left">거절사유</th>
                  <td>
                    <CustomFormLabel
                      className="input-label-none"
                      htmlFor="modal-prhibtRsnCn"
                    >
                      내용
                    </CustomFormLabel>
                    <textarea
                      className="MuiTextArea-custom"
                      id="modal-prhibtRsnCn"
                      name="prhibtRsnCn"
                      value={body.prhibtRsnCn}
                      onChange={(
                        e: React.ChangeEvent<
                          HTMLInputElement | HTMLTextAreaElement
                        >,
                      ) =>
                        setBody((prev) => ({
                          ...prev,
                          prhibtRsnCn: e.target.value,
                        }))
                      }
                      // multiline
                      rows={5}
                      // fullWidth
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default UserInfoModal

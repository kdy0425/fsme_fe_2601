import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import React, { useContext, useEffect, useState } from 'react'
import { Row } from '../page'
import { brNoFormatter, getDateTimeString } from '@/utils/fsms/common/util'
import {
  Box,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Button,
  TableHead,
} from '@mui/material'
import { CustomFormLabel, CustomTextField } from '@/utils/fsms/fsm/mui-imports'
import { telnoFormatter } from '@/utils/fsms/common/comm'
import { SelectItem } from 'select'
import UserAuthContext from '@/app/components/context/UserAuthContext'
import { CommSelect } from '@/app/components/tx/commSelect/CommSelect'
import AddrSearchModal, {
  AddrRow,
} from '@/app/components/popup/AddrSearchModal2'

interface Properties {
  formType: 'POST' | 'PUT'
  resType?: string
  frcsId?: string
  reloadFn?: () => void
  data: Row | null
  frcsBrno: string
}

const salsSeNmItems: SelectItem[] = [
  {
    value: '영업',
    label: '영업',
  },
  {
    value: '휴업',
    label: '휴업',
  },
  {
    value: '영업취소',
    label: '영업취소',
  },
  {
    value: '영업정지',
    label: '영업정지',
  },
  {
    value: '폐업',
    label: '폐업',
  },
  {
    value: '확인불가',
    label: '확인불가',
  },
]

const instlYnItems: SelectItem[] = [
  {
    value: 'Y',
    label: '설치',
  },
  {
    value: 'N',
    label: '미설치',
  },
]

const RegisterModalForm = (props: Properties) => {
  const { authInfo } = useContext(UserAuthContext)

  const { data, frcsBrno, formType, resType, frcsId, reloadFn } = props
  const [params, setParams] = useState<Row>({
    frcsId: '',
    frcsBrno: frcsBrno,
    frcsNm: '',
    daddr: '',
    instlYn: 'Y',
    posCoNm: '',
    posNm: '',
    instlYmd: '',
    locgovNm: '',
    locgovCd: '',
    xcrd: '',
    ycrd: '',
    ornCmpnyNm: 'etc',
    ornCmpnyNmS: '',
    frcsTelnoCn: '',
    salsSeNm: '영업',
    stopBgngYmd: '',
    stopEndYmd: '',
    rgtrId: '',
    regDt: '',
    mdfrId: '',
    mdfcnDt: '',
    authType: '',
    resType: '',
    resList: [],
  })
  const [addrModalOpen, setAddrModalOpen] = useState<boolean>(false)
  const handleParamChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target

    if (formType == 'PUT' && name == 'instlYn' && data?.instlYn == 'N') {
      alert(
        '미설치에서 설치로 변경 시 보조금 미지급건에 대한 소급은 트라이언소프트로 공문을 보내주셔야 합니다.',
      )
    }

    setParams((prev) => ({ ...prev, [name]: value }))
  }

  useEffect(() => {
    if (data) {
      let formData: Row = {
        ...data,
        instlYmd: getDateTimeString(data?.instlYmd, 'date')?.dateString ?? '',
      }
      setParams(formData)
    }
  }, [data])

  useEffect(() => {
    //console.log("PARAMS ::: " , params);
  }, [params])

  const sendData = async () => {
    try {
      if (!params.frcsNm) {
        alert('가맹점명을 필수로 입력해야 합니다.')
        return
      }
      if (!params.frcsTelnoCn) {
        alert('연락처를 필수로 입력해야 합니다.')
        return
      }
      if (!params.daddr) {
        alert('주소를 필수로 입력해야 합니다.')
        return
      }
      if (!params.instlYmd.replaceAll('-', '')) {
        alert('설치일자를 필수로 선택해야 합니다.')
        return
      }

      let endpoint: string =
        formType == 'POST'
          ? `/fsm/apv/psim/tr/createPosSysInstlMng`
          : `/fsm/apv/psim/tr/updatePosSysInstlMng`

      let body: unknown

      if (formType == 'POST') {
        body = {
          resType: resType,
          frcsBrno: params.frcsBrno.replaceAll('-', '').replaceAll(' ', '').replaceAll(/\t/g, ''),
          frcsNm: params.frcsNm,
          daddr: params.daddr,
          instlYn: params.instlYn,
          posCoNm: params.posCoNm,
          instlYmd: params.instlYmd.replaceAll('-', ''),
          locgovCd: authInfo && 'locgovCd' in authInfo ? authInfo.locgovCd : '',
          xcrd: params.xcrd,
          ycrd: params.ycrd,
          ornCmpnyNm: params.ornCmpnyNm,
          frcsTelnoCn: params.frcsTelnoCn,
          salsSeNm: params.salsSeNm,
          stopBgngYmd: params.stopBgngYmd,
          stopEndYmd: params.stopEndYmd,
        }
      } else if (formType == 'PUT') {
        body = {
          frcsId: frcsId,
          frcsBrno: params.frcsBrno.replaceAll('-', '').replaceAll(' ', '').replaceAll(/\t/g, ''),
          frcsNm: params.frcsNm,
          daddr: params.daddr,
          instlYn: params.instlYn,
          instlYmd: params.instlYmd.replaceAll('-', ''),
          xcrd: params.xcrd,
          ycrd: params.ycrd,
          ornCmpnyNm: params.ornCmpnyNm,
          frcsTelnoCn: params.frcsTelnoCn,
          salsSeNm: params.salsSeNm,
          stopBgngYmd: params.stopBgngYmd,
          stopEndYmd: params.stopEndYmd,
        }
      }

      const response = await sendHttpRequest(formType, endpoint, body, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success') {
        alert(response.message)
        reloadFn?.()
      } else {
        // 데이터가 없거나 실패
        alert(response.message)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const sendPostData = async (event: React.FormEvent) => {
    event.preventDefault()
    event.stopPropagation()

    await sendData()
  }

  const getAddress = (row: AddrRow, daddr: string) => {
    setParams((prev) => ({
      ...prev,
      zip: row.zipNo,
      daddr: `${row.roadAddr ?? ''} ${daddr ?? ''}`,
    }))

    setAddrModalOpen(false)
  }

  return (
    <>
      <Box
        className="table-scrollable"
        id="send-posdata"
        component="form"
        onSubmit={sendPostData}
        sx={{ minWidth: 900 }}
      >
        <Table className="table table-bordered">
          <TableBody>
            <TableHead style={{ display: 'none' }}>
              <TableRow>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableRow>
              <TableCell
                className="td-head td-left"
                scope="row"
                style={{ whiteSpace: 'nowrap' }}
              >
                사업자등록번호
              </TableCell>
              <TableCell>{brNoFormatter(frcsBrno)}</TableCell>
              <TableCell
                className="td-head td-left"
                scope="row"
                style={{ whiteSpace: 'nowrap' }}
              >
                가맹점명
              </TableCell>
              <TableCell colSpan={3}>
                <CustomFormLabel
                  className="input-label-none"
                  htmlFor="ft-frcsNm"
                >
                  가맹점명
                </CustomFormLabel>
                <CustomTextField
                  name="frcsNm"
                  id="ft-frcsNm"
                  value={params?.frcsNm}
                  onChange={handleParamChange}
                  inputProps={{
                    inputMode: 'text',
                    maxLength: 100,
                  }}
                  required
                />
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell
                className="td-head td-left"
                scope="row"
                style={{ whiteSpace: 'nowrap' }}
              >
                주소
              </TableCell>
              <TableCell colSpan={3}>
                <CustomFormLabel
                  className="input-label-none"
                  htmlFor="fr-daddr"
                >
                  상세주소
                </CustomFormLabel>
                <CustomTextField
                  name="daddr"
                  id="daddr"
                  value={params?.daddr}
                  onClick={() => setAddrModalOpen(true)}
                  onChange={handleParamChange}
                  inputProps={{
                    inputMode: 'text',
                    maxLength: 200,
                    readOnly: true,
                  }}
                  sx={{ width: '80%' }}
                  fullWidth
                  readOnly
                  required
                />
                <Button
                  variant="contained"
                  color="dark"
                  onClick={() => setAddrModalOpen(true)}
                >
                  선택
                </Button>
              </TableCell>
              <TableCell
                className="td-head td-left"
                scope="row"
                style={{ whiteSpace: 'nowrap' }}
              >
                연락처
              </TableCell>
              <TableCell>
                <CustomFormLabel
                  className="input-label-none"
                  htmlFor="fr-frcsTelnoCn"
                >
                  연락처
                </CustomFormLabel>
                <CustomTextField
                  name="frcsTelnoCn"
                  id="ft-frcsTelnoCn"
                  value={telnoFormatter(params?.frcsTelnoCn)}
                  onChange={handleParamChange}
                  fullWidth
                  required
                />
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell
                className="td-head td-left"
                scope="row"
                style={{ whiteSpace: 'nowrap' }}
              >
                설치구분
              </TableCell>
              <TableCell style={{ width: '' }}>
                <CustomFormLabel
                  className="input-label-none"
                  htmlFor="sch-instlYn"
                >
                  설치구분
                </CustomFormLabel>
                <select
                  id="sch-instlYn"
                  className="custom-default-select"
                  name="instlYn"
                  value={params?.instlYn}
                  onChange={handleParamChange}
                  style={{ width: '100%' }}
                >
                  {instlYnItems.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </TableCell>
              <TableCell
                className="td-head td-left"
                scope="row"
                style={{ whiteSpace: 'nowrap' }}
              >
                설치일자
              </TableCell>
              <TableCell>
                <CustomFormLabel
                  className="input-label-none"
                  htmlFor="date-instlYmd"
                >
                  설치일자
                </CustomFormLabel>
                <CustomTextField
                  type="date"
                  id="date-instlYmd"
                  name="instlYmd"
                  value={params.instlYmd}
                  onChange={handleParamChange}
                  required
                />
              </TableCell>
              <TableCell
                className="td-head td-left"
                scope="row"
                style={{ whiteSpace: 'nowrap' }}
              >
                정유사
              </TableCell>
              <TableCell>
                <CustomFormLabel
                  className="input-label-none"
                  htmlFor="sch-ornCmpnyNm"
                >
                  정유사
                </CustomFormLabel>
                <CommSelect
                  cdGroupNm="175"
                  pValue={params.ornCmpnyNm}
                  handleChange={handleParamChange}
                  pName="ornCmpnyNm"
                  htmlFor={'sch-ornCmpnyNm'}
                />
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell
                className="td-head td-left"
                scope="row"
                style={{ whiteSpace: 'nowrap', width: '12.5%' }}
              >
                영업여부
              </TableCell>
              <TableCell colSpan={5}>
                <CustomFormLabel
                  className="input-label-none"
                  htmlFor="sch-salsSeNm"
                >
                  영업여부
                </CustomFormLabel>
                <select
                  id="sch-salsSeNm"
                  className="custom-default-select"
                  name="salsSeNm"
                  value={params?.salsSeNm}
                  onChange={handleParamChange}
                >
                  {salsSeNmItems.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Box>
      <div style={{ color: 'red', fontWeight: 'bold' }}>
        설치일자부터 등록일자까지 지급거절 주유내역에 대해 자동소급 지급됨
      </div>
      <AddrSearchModal
        open={addrModalOpen}
        onCloseClick={() => setAddrModalOpen(false)}
        onSaveClick={getAddress}
      />
    </>
  )
}

export default RegisterModalForm

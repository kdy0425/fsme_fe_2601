'use client'

import {
  CustomFormLabel,
  CustomRadio,
  CustomSelect,
  CustomTextField,
} from '@/utils/fsms/fsm/mui-imports'
import {
  Button,
  Dialog,
  DialogContent,
  FormControlLabel,
  MenuItem,
  RadioGroup,
  Table,
  TableBody,
  TableCell,
  TableRow,
  DialogProps,
  Grid,
  Typography,
} from '@mui/material'
import React, { useContext, useEffect, useMemo, useState } from 'react'
import { SelectItem } from 'select'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { Row } from './BusPage'
import { HeadCell } from 'table'
import TableDataGrid from '@/app/components/tables/CommDataGrid'
import UserAuthContext, {
  UserAuthInfo,
} from '@/app/components/context/UserAuthContext'
import BuTrRegisModal from './BusPage'
import { TxVhclModal } from '@/app/components/popup/TxVhclModal'
import { BsVhclModal } from '@/app/components/popup/BsVhclModal'
import { formBrno } from '@/utils/fsms/common/convert'
import { getLocalGovCodes } from '@/utils/fsms/common/code/getCode'

import { Box } from '@mui/material'
import { getCtpvCd } from '@/utils/fsms/common/comm'
import VhclSearchModal from '@/app/components/bs/popup/VhclSearchModal'

// 목록 조회시 필요한 조건
type listSearchObj = {
  [key: string]: string | number // 인덱스 시그니처 추가
}

const getTodayDate = () => {
  const today = new Date()
  const yyyy = today.getFullYear()
  const mm = String(today.getMonth() + 1).padStart(2, '0') // 월은 0부터 시작하므로 +1
  const dd = String(today.getDate()).padStart(2, '0')

  return `${yyyy}-${mm}-${dd}`
}

//차량 조회용
interface RowTrnsfrn {
  ctpvCd?: string //시도코드
  locgovCd?: string //관할관청코드
  locgovNm?: string //관할관청
  vhclNo?: string //차량번호
  brno?: string //사업자등록번호
  rprsvNm?: string //대표자명
  vhclSttsNm?: string //차량상태
  bzentyNm?: string //업체명

  vhclSeNm?: string
  rprsvRrno?: string

  // 이상하게 택시 차량 조회 파라미터정의서에 없는 것들 일단 넣어놈
  vonrNm?: string // 소유자명
  vonrRrno?: string // 주민등록번호
  vonrBrno?: string // 사업자등록번호
  koiNm?: string // 유종
  vhclTonCdNm?: string //  톤수
  lcnsTpbizCd?: string // 면허업종
  vhclSttsCd?: string // 최종차량상태
  vhclPsnCd?: string // 차량소유구분
}

interface FormModalProps {
  size?: DialogProps['maxWidth'] | 'lg'
  buttonLabel?: string
  title: string
  isOpen: boolean
  setOpen: (isOpen: boolean) => void
  reload: () => void
}

function FormModal(props: FormModalProps) {
  const { buttonLabel, title, size, isOpen, setOpen, reload } = props
  const [selectedRowTrnsfrn, setSelectedRowTrnsfrn] = useState<RowTrnsfrn>()
  const [localGovCode, setLocalGovCode] = useState<SelectItem[]>([]) // 관할관청 코드
  const { authInfo } = useContext(UserAuthContext)
  const [vhclOpen, setVhclOpen] = useState(false)

  const [locgovNm, setLocgvNm] = useState<string>('')
  const [ctpvNm, setCtpvNm] = useState<string>('')

  const handleClickOpen = () => {
    setOpen(true)
  }

  //모든 모달 닫힘.
  const handleClose = () => {
    setOpen(false)
  }

  useEffect(() => {
    let locgovCodes: SelectItem[] = [
      {
        label: '전체',
        value: '',
      },
    ]

    // 관할관청 select item setting
    getLocalGovCodes().then((res) => {
      if (res) {
        res.map((code: any) => {
          let item: SelectItem = {
            label: code['locgovNm'],
            value: code['locgovCd'],
          }
          locgovCodes.push(item)
        })
      }
      setLocalGovCode(locgovCodes)
    })
  }, [])

  useEffect(() => {
    if (
      localGovCode.length > 0 &&
      'locgovCd' in authInfo &&
      authInfo.locgovCd
    ) {
      const matchedItem = localGovCode.find(
        (item) => item.value === authInfo.locgovCd,
      )
      if (matchedItem) {
        setLocgvNm(matchedItem.label) // Assuming `setLocgvNm` sets the label of the matched item
      }

      getCtpvCd(authInfo.locgovCd.slice(0, 2)).then((itemArr) => {
        setCtpvNm(itemArr[0].label)
      })
    }
  }, [authInfo, localGovCode])

  //창을 닫을 때 선택된 요소도 undefined로 초기화
  const handleCloseandReset = () => {
    setSelectedRowTrnsfrn(undefined)
    handleClose()
  }

  // 행 클릭 시 호출되는 함수
  const handleRowClick = (selectedRowTrnsfrn: RowTrnsfrn) => {
    setSelectedRowTrnsfrn(selectedRowTrnsfrn)
    setVhclOpen(false)
  }

  // 저장 버튼 클릭시 호출되는 함수.
  //vhclNo
  //exsLocgovCd
  //chgLocgovCd

  useEffect(() => {
    if (
      'locgovCd' in authInfo &&
      authInfo.locgovCd &&
      selectedRowTrnsfrn?.locgovCd == authInfo?.locgovCd &&
      selectedRowTrnsfrn?.locgovCd !== ''
    ) {
      alert('전입관청과 전출관청이 동일합니다.')
      setSelectedRowTrnsfrn(undefined)
      return
    }
  }, [selectedRowTrnsfrn?.locgovCd])

  const createBsnsfrnRequ = async () => {
    try {
      let endpoint: string = `/fsm/stn/lttm/bs/createLgovTrnsfrnRequst`
      const exsLocgovCd = selectedRowTrnsfrn?.locgovCd as string //전입관청
      const chgLocgovCd =
        'locgovCd' in authInfo && authInfo.locgovCd ? authInfo?.locgovCd : '' //전출관청
      const vhclNo = selectedRowTrnsfrn?.vhclNo as string
      const brno = selectedRowTrnsfrn?.brno as string

      if (
        !(
          exsLocgovCd &&
          exsLocgovCd !== '' &&
          chgLocgovCd &&
          chgLocgovCd !== '' &&
          vhclNo &&
          vhclNo != ''
        )
      ) {
        alert('저장하려면 필수 전달 값을 빼먹으면 안 됩니다.')
        return
      }

      let body = {
        brno: brno,
        exsLocgovCd: exsLocgovCd,
        chgLocgovCd: chgLocgovCd,
        vhclNo: vhclNo,
      }

      const userConfirm: boolean = confirm('버스 차량 전입등록을 하시겠습니까?')

      if (userConfirm) {
        const response = await sendHttpRequest('POST', endpoint, body, true, {
          cache: 'no-store',
        })

        if (response && response.resultType === 'success') {
          setOpen(false)
          alert('차량 전입등록되었습니다.')
          setSelectedRowTrnsfrn(undefined)
          reload()
        }
      } else {
        alert('차량 전입 등록 실패하셨습니다.')
        return
      }
    } catch (error) {
      alert('차량 전입 실패 Error')
      console.error('Error Post Data : ', error)
    } finally {
    }
  }

  const handleStore = () => {
    // 전입 관청  (사용자의 관청)
    createBsnsfrnRequ()
  }

  return (
    <Box>
      {buttonLabel ? (
        <Button variant="contained" color="primary" onClick={handleClickOpen}>
          {buttonLabel}
        </Button>
      ) : (
        ''
      )}
      <Dialog
        fullWidth={false}
        maxWidth="lg" // 두 번째 모달은 더 큰 크기로 설정
        open={isOpen}
        PaperProps={{
          style: {
            width: '1100px',
          },
        }}
        //onClose={handleClose}
      >
        <DialogContent>
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              <h2>전입방법</h2>
            </CustomFormLabel>
            <div className="button-right-align">
              <Button
                variant="contained"
                type="button"
                color="primary"
                onClick={() => handleStore()}
              >
                저장
              </Button>
              <Button
                variant="contained"
                color="dark"
                onClick={handleCloseandReset}
              >
                취소
              </Button>
            </div>
          </Box>

          {/* 모달팝업 내용 시작 */}
          <div id="alert-dialog-description1">
            {/* 테이블영역 시작 */}
            <div className="table-scrollable">
              <table className="table table-bordered">
                <caption>상세 내용 시작</caption>
                <colgroup>
                  <col style={{ width: '12%' }}></col>
                  <col style={{ width: '13%' }}></col>
                  <col style={{ width: '12%' }}></col>
                  <col style={{ width: '13%' }}></col>
                  <col style={{ width: '12%' }}></col>
                  <col style={{ width: '13%' }}></col>
                  <col style={{ width: '12%' }}></col>
                  <col style={{ width: '13%' }}></col>
                </colgroup>
                <tbody>
                  <tr>
                    <th className="td-head" scope="row">
                      차량번호
                    </th>
                    <td>
                      <div
                        className="form-group"
                        style={{ width: '100%', whiteSpace: 'nowrap' }}
                      >
                        {selectedRowTrnsfrn?.vhclNo
                          ? selectedRowTrnsfrn.vhclNo
                          : ''}
                        <div style={{ float: 'right' }}>
                          <Button
                            sx={{ marginRight: '2%' }}
                            onClick={() => setVhclOpen(true)}
                            variant="contained"
                            color="dark"
                          >
                            선택
                          </Button>
                        </div>

                        {/* <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                                        <div style={{ float: 'right' }}>
                                            <BsVhclModal
                                                buttonLabel={'선택'}  
                                                title={'차량번호 조회'}  
                                                clickClose={true}
                                                url={'/fsm/stn/lttm/bs/getAllVhcleMng'} 
                                                onRowClick={handleRowClick}>
                                            </BsVhclModal>
                                        </div>
                                    </Box> */}
                      </div>
                    </td>
                    <th className="td-head" scope="row">
                      관할관청
                    </th>
                    <td>
                      {selectedRowTrnsfrn?.locgovNm
                        ? selectedRowTrnsfrn.locgovNm
                        : ''}
                    </td>
                    <th className="td-head" scope="row">
                      사업자등록번호
                    </th>
                    <td>
                      {selectedRowTrnsfrn?.brno
                        ? formBrno(selectedRowTrnsfrn.brno)
                        : ''}
                    </td>
                    <th className="td-head" scope="row">
                      면허업종
                    </th>
                    <td>
                      {selectedRowTrnsfrn?.vhclSeNm
                        ? selectedRowTrnsfrn.vhclSeNm
                        : ''}
                    </td>
                  </tr>

                  <tr>
                    <th className="td-head" scope="row">
                      대표자명
                    </th>
                    <td>
                      {selectedRowTrnsfrn?.rprsvNm
                        ? selectedRowTrnsfrn.rprsvNm
                        : ''}
                    </td>
                    <th className="td-head" scope="row">
                      대표자주민등록번호
                    </th>
                    <td>
                      {selectedRowTrnsfrn?.rprsvRrno
                        ? selectedRowTrnsfrn.rprsvRrno
                        : ''}
                    </td>
                    <th className="td-head" scope="row">
                      차량상태
                    </th>
                    <td>
                      {selectedRowTrnsfrn?.vhclSttsNm
                        ? selectedRowTrnsfrn.vhclSttsNm
                        : ''}
                    </td>
                    <th className="td-head" scope="row">
                      유종
                    </th>
                    <td>
                      {selectedRowTrnsfrn?.koiNm
                        ? selectedRowTrnsfrn.koiNm
                        : ''}
                    </td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">
                      업체명
                    </th>
                    <td>
                      {selectedRowTrnsfrn?.bzentyNm
                        ? selectedRowTrnsfrn.bzentyNm
                        : ''}
                    </td>
                    <th className="td-head" scope="row"></th>
                    <td></td>
                    <th className="td-head" scope="row"></th>
                    <td></td>
                    <th className="td-head" scope="row"></th>
                    <td>{''}</td>
                  </tr>

                  <tr>
                    <th className="td-head" scope="row">
                      요청일자
                    </th>
                    <td>{getTodayDate()}</td>
                    <th className="td-head" scope="row">
                      전출관청
                    </th>
                    <td>
                      {selectedRowTrnsfrn?.locgovNm
                        ? selectedRowTrnsfrn.locgovNm
                        : ''}
                    </td>
                    <th className="td-head" scope="row">
                      전입관청
                    </th>
                    <td>{ctpvNm + ' ' + locgovNm}</td>
                    <th className="td-head" scope="row">
                      요청관청
                    </th>
                    <td>{ctpvNm + ' ' + locgovNm}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            {/* 테이블영역 끝 */}
          </div>
          {/* 모달팝업 내용 끝 */}
        </DialogContent>
      </Dialog>
      <VhclSearchModal
        onCloseClick={() => setVhclOpen(false)}
        onRowClick={handleRowClick}
        title="차량번호 조회"
        url="/fsm/stn/lttm/bs/getAllVhcleMng"
        open={vhclOpen}
        isNotRollCheck={true}
      />
    </Box>
  )
}

export default FormModal

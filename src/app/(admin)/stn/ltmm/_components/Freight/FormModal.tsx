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
  Box,
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
import React, { useContext, useEffect, useState } from 'react'
import { SelectItem } from 'select'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { Row } from './FreightPage'
import { HeadCell } from 'table'
import TableDataGrid from '@/app/components/tables/CommDataGrid'
import UserAuthContext from '@/app/components/context/UserAuthContext'
import BuTrRegisModal from './BuTrRegisModal'
import VhclSearchModal from '@/app/components/tr/popup/VhclSearchModal'
import { getLocalGovCodes } from '@/utils/fsms/common/code/getCode'
import { formBrno } from '@/utils/fsms/common/convert'
import TrVhlModal from '@/app/components/popup/TrVhclModal'
import { LocalSearchModal } from '@/app/components/tr/popup/LocalSearchModal'
import { useDispatch, useSelector } from 'react-redux'
import { openLocgovModal, clearLocgovInfo } from '@/store/popup/LocgovInfoSlice'
import { rrNoFormatter } from '@/utils/fsms/common/util'
import { getCtpvCd } from '@/utils/fsms/common/comm'
import { StatusType } from '@/types/message'

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
  locgovCd?: string // 시도+관할관청코드
  vonrNm?: string // 차주성명
  vhclNo?: string // 차량번호
  koiCd?: string // 유종코드
  koiCdNm?: string // 유종
  vhclTonCd?: string // 톤수코드
  vhclTonCdNm?: string // 톤수
  CRNO?: string // 법인등록번호(원본)
  crnoS?: string // 법인등록번호(복호화)
  vonrRrno?: string // 주민등록번호(원본)
  vonrRrnoS?: string // 주민등록번호(복호화)
  vonrRrnoSecure?: string // 주민등록번호(별표)
  lcnsTpbizCd?: string // 업종코드
  vhclSeCd?: string // 차량구분코드
  vhclRegYmd?: string // 차량등록일자
  YRIDNW?: string // 연식
  LEN?: string // 길이
  BT?: string // 너비
  maxLoadQty?: string // 최대적재수량
  vhclSttsCd?: string // 차량상태코드
  vonrBrno?: string // 차주사업자등록번호
  vhclPsnCd?: string // 차량소유코드
  delYn?: string // 삭제여부
  dscntYn?: string // 할인여부
  souSourcSeCd?: string // 원천소스구분코드
  bscInfoChgYn?: string // 기본정보변경여부
  locgovAprvYn?: string // 지자체승인여부
  rgtrId?: string // 등록자아이디
  regDt?: string // 등록일시
  mdfrId?: string // 수정자아이디
  mdfcnDt?: string // 수정일시
  locgovNm?: string // 관할관청명
  prcsSttsCd?: string // 처리상태코드
  koiNm?: string
  vhclTonNm?: string
  vhclSttsNm?: string
  vhclPsnNm?: string
  bzentyNm?: string
  prcsYmd?: string // 추후에 추가 될 수 있음.
  lcnsTpbizNm?: string
}

interface LocalSearchRow {
  ctpvCd: string
  sggCd: string
  ctpvNm: string
  locgovNm: string
  locgovCd: string
}

interface FormModalProps {
  size?: DialogProps['maxWidth'] | 'lg'
  buttonLabel?: string
  title: string
  isOpen: boolean
  setOpen: (isOpen: boolean) => void
  reload: () => void
}

export default function FormModal(props: FormModalProps) {
  const { buttonLabel, title, size, isOpen, setOpen, reload } = props
  const [selectedRowTrnsfrn, setSelectedRowTrnsfrn] = useState<RowTrnsfrn>()
  const [vhclOpen, setVhclOpen] = useState(false)

  // const [params, setParams] = useState<listSearchObj>({
  // });

  const { authInfo } = useContext(UserAuthContext)
  const [locgovNm, setLocgvNm] = useState<string>()
  const [ctpvNm, setCtpvNm] = useState<string>()

  const [radio, setRadio] = useState<string>('A') // 초기값을 설정
  const [showNextModal, setShowNextModal] = useState<boolean>(false)
  const [locgov, setLocgov] = useState<LocalSearchRow>({
    ctpvCd: '',
    sggCd: '',
    ctpvNm: '',
    locgovNm: '',
    locgovCd: '',
  })
  const [localGovCode, setLocalGovCode] = useState<SelectItem[]>([]) // 관할관청 코드

  const [showSearchModal, setShowSearchModal] = useState<boolean>(false)

  const selectedLocgovInfo = useSelector((state: any) => state.locgovInfo)
  const dispatch = useDispatch()
  const handleOpenModal = () => {
    dispatch(openLocgovModal()) // 모달 열기
  }

  useEffect(() => {
    if (
      selectedLocgovInfo.locgovNmLGM === '' ||
      !selectedLocgovInfo.locgovNmLGM
    ) {
      return
    }
    if (selectedLocgovInfo && Object.keys(selectedLocgovInfo).length > 0) {
      setLocgov({
        ctpvCd: selectedLocgovInfo.ctpvCdLGM ?? '',
        sggCd: selectedLocgovInfo.sggCdLGM ?? '',
        ctpvNm: selectedLocgovInfo.ctpvNmLGM ?? '',
        locgovNm: selectedLocgovInfo.locgovNmLGM ?? '',
        locgovCd: selectedLocgovInfo.locgovCdLGM ?? '',
      })
    }
  }, [selectedLocgovInfo])

  const handleClickOpen = () => {
    setOpen(true)
  }

  //모든 모달 닫힘.
  const handleClose = () => {
    setOpen(false)
    setShowNextModal(false) // Close the secondary modal as well when the main modal is closed
    setShowSearchModal(false)
  }

  // 창을 선택하는 라디오 동작
  const handleRadio = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    setRadio(value)
  }

  // 다음 모달 오픈
  const handleNextButtonClick = () => {
    setShowNextModal(true)
  }

  // 관할관청 전출 단건등록에서 차량 선택
  const handleShowSearchModal = () => {
    setShowSearchModal(true)
  }

  //창을 닫을 때 선택된 요소도 undefined로 초기화
  const handleCloseandReset = () => {
    setSelectedRowTrnsfrn(undefined)
    setLocgov({
      ctpvCd: '',
      sggCd: '',
      ctpvNm: '',
      locgovNm: '',
      locgovCd: '',
    })
    handleClose()
  }

  // 행 클릭 시 호출되는 함수
  const handleRowClick = (selectedRowTrnsfrn: RowTrnsfrn) => {
    setSelectedRowTrnsfrn(selectedRowTrnsfrn)
  }

  // 저장 버튼 클릭시 호출되는 함수.
  //vhclNo
  //exsLocgovCd
  //chgLocgovCd
  // 저장 버튼 클릭시 호출되는 함수.
  //vhclNo
  //exsLocgovCd
  //chgLocgovCd
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

  // useEffect(() => {
  //     // if (localGovCode.length > 0 && 'locgovCd' in authInfo && authInfo.locgovCd) {
  //     //     const matchedItem = localGovCode.find(
  //     //         (item) => item.value === authInfo.locgovCd
  //     //     );
  //     //     if (matchedItem) {
  //     //         console.log(matchedItem.label)
  //     //         setLocgvNm(matchedItem.label); // Assuming `setLocgvNm` sets the label of the matched item
  //     //     }
  //     // }
  //       if (localGovCode.length > 0 && 'locgovCd' in authInfo && authInfo.locgovCd) {
  //           const matchedItem = localGovCode.find(
  //               (item) => item.value === authInfo.locgovCd
  //           );
  //           if (matchedItem) {
  //               console.log(matchedItem.label)
  //               setLocgvNm(matchedItem.label); // Assuming `setLocgvNm` sets the label of the matched item
  //           }

  //         getCtpvCd(authInfo.locgovCd.slice(0,2)).then((itemArr) => { setCtpvNm(itemArr[0].label)})
  //       }
  // }, [authInfo,localGovCode])

  useEffect(() => {
    if (
      selectedRowTrnsfrn?.locgovCd == locgov.locgovCd &&
      selectedRowTrnsfrn?.locgovCd !== undefined
    ) {
      alert('전입 관청과 전출 관청이 동일합니다.')
      //dispatch(openLocgovModal());
      dispatch(clearLocgovInfo())
      setLocgov({
        ctpvCd: '',
        sggCd: '',
        ctpvNm: '',
        locgovNm: '',
        locgovCd: '',
      })
    }
  }, [selectedRowTrnsfrn?.locgovCd, locgov?.locgovCd])

  const createTrnsfrnRequ = async () => {
    if (!('locgovCd' in authInfo && authInfo.locgovCd)) {
      alert(
        '로그인한 유저의 관할관청 정보가 없는 경우에는 등록을 할 수 없습니다.',
      )
      return
    }

    if (!selectedRowTrnsfrn) {
      alert('차량을 선택해주세요.')
      return
    }

    if (!locgov.locgovCd) {
      alert('전입관청을 선택해주세요.')
      return
    }

    try {
      let endpoint: string = `/fsm/stn/ltmm/tr/createLgovMvtRequst`

      const exsLocgovCd = selectedRowTrnsfrn?.locgovCd as string //전출관청
      const chgLocgovCd = locgov?.locgovCd ?? '' //전입관청
      const vhclNo = selectedRowTrnsfrn?.vhclNo as string
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
        return
      }
      let body = {
        exsLocgovCd: exsLocgovCd,
        chgLocgovCd: chgLocgovCd,
        vhclNo: vhclNo,
      }

      const userConfirm: boolean = confirm('화물 차량 전출등록을 하시겠습니까?')

      if (userConfirm) {
        const response = await sendHttpRequest('POST', endpoint, body, true, {
          cache: 'no-store',
        })

        if (response && response.resultType === 'success') {
          handleClose()
          alert('차량 전출등록되었습니다.')
          setSelectedRowTrnsfrn(undefined)
          reload()
        } else {
          alert(response.errors?.[0].reason)
        }
      } else {
        alert('차량 전출 등록 실패하셨습니다.')
        return
      }
    } catch (error: StatusType | any) {
      alert(error.errors?.[0].reason)
    }
  }

  const handleStore = () => {
    // 전출 관청  (사용자의 관청)
    createTrnsfrnRequ()
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
        maxWidth={size}
        open={isOpen}
        //onClose={handleClose}
      >
        <DialogContent>
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              <h2>등록방법 선택</h2>
            </CustomFormLabel>
            <div className="button-right-align">
              <Button
                variant="contained"
                type="button"
                color="primary"
                onClick={handleNextButtonClick}
              >
                다음
              </Button>
              <Button variant="contained" color="dark" onClick={handleClose}>
                취소
              </Button>
            </div>
          </Box>
          <Box
            sx={{
              border: '1px solid #d3d3d3',
              borderRadius: '8px',
              padding: '16px',
              marginTop: '16px',
            }}
          >
            <div className="form-group" style={{ width: 'inherit' }}>
              <RadioGroup
                name="useYn"
                onChange={handleRadio}
                value={radio} // 상태 변수를 value로 설정
                className="mui-custom-radio-group"
              >
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControlLabel
                      value="A"
                      control={<CustomRadio />}
                      label="관할관청 전출 단건등록"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      value="B"
                      control={<CustomRadio />}
                      label="관할관청 전출 일괄등록"
                    />
                  </Grid>
                </Grid>
              </RadioGroup>
            </div>
          </Box>
        </DialogContent>
      </Dialog>

      {/* <TrVhlModal
        onCloseClick={() => setVhclOpen(false)}
        onRowClick={setSelectedRowTrnsfrn}
        title="차량번호 조회"
        url="/fsm/stn/vpm/tr/getUserVhcle"
        open={vhclOpen}
        clickClose={true}
      /> */}

      <VhclSearchModal
        onCloseClick={() => setVhclOpen(false)}
        onRowClick={setSelectedRowTrnsfrn}
        title="차량번호 조회"
        // url="/fsm/stn/vdcm/tr/getUserVhcle"
        RowClickClose={true}
        open={vhclOpen}
      />

      <Dialog
        fullWidth={false}
        maxWidth="xl" // 두 번째 모달은 더 큰 크기로 설정
        open={showNextModal}
        PaperProps={{
          style: {
            width: '1400px',
          },
        }}
        //onClose={handleClose}
      >
        {radio === 'A' ? (
          <>
            <DialogContent>
              <Box className="table-bottom-button-group">
                <CustomFormLabel className="input-label-display">
                  <h2>전출방법</h2>
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
                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                width: '100%',
                              }}
                            >
                              <div style={{ float: 'right' }}>
                                <Box
                                  sx={{
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    width: '100%',
                                  }}
                                >
                                  <Button
                                    onClick={() => setVhclOpen(true)}
                                    variant="contained"
                                    color="dark"
                                  >
                                    선택
                                  </Button>
                                </Box>
                              </div>
                            </Box>
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
                          소유자명
                        </th>
                        <td>
                          {selectedRowTrnsfrn?.vonrNm
                            ? selectedRowTrnsfrn.vonrNm
                            : ''}
                        </td>
                        <th className="td-head" scope="row">
                          주민등록번호
                        </th>
                        <td>
                          {rrNoFormatter(
                            selectedRowTrnsfrn?.vonrRrnoSecure ?? '',
                          )
                            ? rrNoFormatter(
                                selectedRowTrnsfrn?.vonrRrnoSecure ?? '',
                              )
                            : ''}
                        </td>
                      </tr>
                      <tr>
                        <th className="td-head" scope="row">
                          사업자등록번호
                        </th>
                        <td>
                          {selectedRowTrnsfrn?.vonrBrno
                            ? formBrno(selectedRowTrnsfrn.vonrBrno)
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
                        <th className="td-head" scope="row">
                          톤수
                        </th>
                        <td>
                          {selectedRowTrnsfrn?.vhclTonNm
                            ? selectedRowTrnsfrn.vhclTonNm
                            : ''}
                        </td>
                        <th className="td-head" scope="row">
                          면허업종
                        </th>
                        <td>
                          {selectedRowTrnsfrn?.lcnsTpbizNm ??
                            selectedRowTrnsfrn?.lcnsTpbizCd}
                        </td>
                      </tr>
                      <tr>
                        <th className="td-head" scope="row">
                          최종차량상태
                        </th>
                        <td>
                          {selectedRowTrnsfrn?.vhclSttsNm ??
                            selectedRowTrnsfrn?.vhclSttsCd}
                        </td>
                        <th className="td-head" scope="row">
                          차량소유구분
                        </th>
                        <td>
                          {selectedRowTrnsfrn?.vhclPsnNm ??
                            selectedRowTrnsfrn?.vhclPsnCd}
                        </td>
                        <th className="td-head" scope="row">
                          업체명
                        </th>
                        <td>
                          {selectedRowTrnsfrn?.bzentyNm //업체명?
                            ? selectedRowTrnsfrn.bzentyNm
                            : ''}
                        </td>
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
                        <td>
                          <div
                            className="form-group"
                            style={{ width: '100%', whiteSpace: 'nowrap' }}
                          >
                            {locgov?.ctpvNm + ' ' + locgov?.locgovNm}
                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                width: '100%',
                              }}
                            >
                              <div style={{ float: 'right' }}>
                                <Box
                                  sx={{
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    width: '100%',
                                  }}
                                >
                                  <Button
                                    style={{ float: 'right' }}
                                    variant="contained"
                                    color="dark"
                                    onClick={handleOpenModal}
                                  >
                                    선택
                                  </Button>
                                </Box>
                              </div>
                            </Box>
                          </div>
                          <LocalSearchModal />
                        </td>
                        <th className="td-head" scope="row"></th>
                        <td>{''}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                {/* 테이블영역 끝 */}
              </div>
              {/* 모달팝업 내용 끝 */}
            </DialogContent>
          </>
        ) : (
          <DialogContent>
            <div className="table-scrollable">
              <BuTrRegisModal handleClose={handleClose} reload={reload} />
            </div>
          </DialogContent>
        )}
      </Dialog>
    </Box>
  )
}

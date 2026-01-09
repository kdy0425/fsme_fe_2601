import { CustomFormLabel, CustomTextField } from '@/utils/fsms/fsm/mui-imports'
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  FormControlLabel,
} from '@mui/material'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import TableDataGrid from './CustomDataGrid2'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { serverCheckTime } from '@/utils/fsms/common/comm'

import { Pageable2 } from 'table'
import { getFormatTomorrow, getToday } from '@/utils/fsms/common/comm'
import { SelectItem } from 'select'
import UserAuthContext, {
  UserAuthInfo,
} from '@/app/components/context/UserAuthContext'
import CustomCheckbox from '@/app/components/forms/theme-elements/CustomCheckbox'
import { Row } from '../page'
import { stnbdmDayoffSearchModalheadCells } from '@/utils/fsms/headCells'
import { getUserInfo } from '@/utils/fsms/utils'

// 목록 조회시 필요한 조건
type listSearchObj = {
  page: number
  size: number
  [key: string]: string | number // 인덱스 시그니처 추가
}

interface RegisterModal {
  title: string
  open: boolean
  authLocalNm: string
  onCloseClick: () => void
  dayoffLocgovCd: string
  reload: () => void
}

export const DayoffSearchModal = (props: RegisterModal) => {
  const router = useRouter() // 화면이동을 위한객체
  const querys = useSearchParams() // 쿼리스트링을 가져옴

  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정

  const [rows, setRows] = useState<Row[]>([])

  const [selectedRows, setSelectedRows] = useState<string[]>([]) // 체크 로우 데이터

  const { authInfo } = useContext(UserAuthContext)
  const [authContext, setAuthContext] = useState<UserAuthInfo | {}>()
  const [selectedIndex, setSelectedIndex] = useState<number>(-1)

  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부

  // 부제그룹명
  const [groupNmCode, setGroupNmCode] = useState<SelectItem[]>([])

  const [carErsrYn, setCarErsrYn] = useState<boolean>(false)
  const [connReserYn, setConnReserYn] = useState<boolean>(false)

  const [rsvtAplcnYmd, setRsvtAplcnYmd] = useState<string>('')
  const userInfo = getUserInfo()
  const [params, setParams] = useState<listSearchObj>({
    page: 1, // 페이지 번호는 1부터 시작
    size: 10, // 기본 페이지 사이즈 설정
  })

  // 페이지 이동 감지 시작 //
  // 검색시 검색 조건에 맞는 데이터 갱신 및 1페이지로 이동
  const handleAdvancedSearch = (event: React.FormEvent) => {
    event.preventDefault()
    setParams((prev) => ({ ...prev, page: 1 })) // 첫 페이지로 이동
    setFlag(!flag)
  }

  const { title, open, onCloseClick, reload, dayoffLocgovCd, authLocalNm } =
    props

  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1,
  })

  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target

    if (name === 'rsvtAplcnYmd') {
      setRsvtAplcnYmd(value)
      return
    }

    setParams((prev) => ({ ...prev, page: 1, [name]: value }))
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      fetchData()
    }
  }

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handlePaginationModelChange = useCallback(
    (page: number, pageSize: number) => {
      setParams((prev) => ({
        ...prev,
        page: page, // 실제 DB에서 조회시 -1을 하므로 +1 추가해서 넘겨야함. 페이지는 1로 보이지만 DB에선 0으로 조회
        size: pageSize,
      }))
      setFlag((prev) => !prev)
    },
    [],
  )

  useEffect(() => {
    if (!(params.groupId || params.brno || params.vhclNo)) {
      return
    }

    fetchData()
  }, [flag])

  useEffect(() => {
    setAuthContext(authInfo)
  }, [authInfo])

  // Fetch를 통해 데이터 갱신, 템플릿을 가져온다
  const fetchData = async () => {
    if (!(params.groupId || params.brno || params.vhclNo)) {
      alert('그룹을 선택하거나 사업자번호 또는 차량 번호를 입력해주세요')
      return
    }
    setLoading(true)
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/stn/bdm/tx/getAllDayoffVeInfoSchList?page=${params.page}&size=${params.size}` +
        `${dayoffLocgovCd ? '&dayoffLocgovCd=' + dayoffLocgovCd : ''}` +
        `${params.groupId ? '&groupId=' + params.groupId : ''}` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
        `${params.brno ? '&brno=' + params.brno : ''}` +
        `${carErsrYn ? '&carErsrYn=Y' : '&carErsrYn=N'}` //미등록 차량 파라미터 추가 요망

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        setRows(response.data.content)
        setTotalRows(response.data.totalElements)
        setPageable({
          pageNumber: response.data.pageable.pageNumber + 1,
          pageSize: response.data.pageable.pageSize,
          totalPages: response.data.totalPages,
        })
      } else {
        // 데이터가 없거나 실패
        setRows([])
        setTotalRows(0)
        setPageable({
          pageNumber: 1,
          pageSize: 10,
          totalPages: 1,
        })
        setSelectedRows([])
      }
    } catch (error) {
      // 에러시
      //setList([]);
      setRows([])
      setTotalRows(0)
      setPageable({
        pageNumber: 1,
        pageSize: 10,
        totalPages: 1,
      })
    } finally {
      setSelectedRows([])
      setLoading(false)
    }
  }

  // dayoffLocgovCd :지자체코드 가 바뀔 경우 재요청을 한다.
  useEffect(() => {
    fetchGroupNm()
  }, [dayoffLocgovCd])

  //부제 그룹 샐랙트를 채우는 API
  const fetchGroupNm = async () => {
    let groupCodes: SelectItem[] = [
      {
        label: '전체',
        value: '',
      },
    ]
    setLoading(true)
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/stn/bdm/tx/getAllDayoffGroupNmList?` +
        `${dayoffLocgovCd ? '&dayoffLocgovCd=' + dayoffLocgovCd : ''}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        setGroupNmCode(response.data)

        response.data.map((code: any) => {
          let item: SelectItem = {
            label: code['groupNm'],
            value: code['groupId'],
          }
          groupCodes.push(item)
        })
        setGroupNmCode(groupCodes)
      } else {
        alert(response.message)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCheckChange = (selected: string[]) => {
    setSelectedRows(selected)
  }

  const handleClickClose = () => {
    setRows([])
    setParams({
      page: 1, // 페이지 번호는 1부터 시작
      size: 10, // 기본 페이지 사이즈 설정
    })
    onCloseClick()
  }

  // vhclNo:"경기34바4095",	차량번호
  // groupId:"4121000007",	그룹ID
  // rsvtAplcnYmd:"20241106",	예약변경일자
  // chgYmd:"20241110",	변경일자
  // mdfrId:"trionsoft",	수정자ID
  // dayoffLocgovCd:"41210"	부제 지자체코드

  // 모든행을 저장한다.
  const fetchDisConnect = async () => {
    if (!(await serverCheckTime('dayoff'))) {
      return
    }

    if (selectedRows.length < 1) {
      alert('선택항목이 없습니다.')
      return
    }

    if (userInfo.rollYn === '') {
      alert('현재 부제 미사용 지자체입니다. 관리자에게 문의해주세요')
      return
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
      const ctpvCd = dayoffLocgovCd?.substring(0, 2)
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
          alert('소속 지자체만 삭제 가능합니다.')
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
          alert('소속 지자체만 삭제 가능합니다.')
          return
        }
      }
    }

    if (!confirm('선택한 차량의 부제차량연결을 해제 하시겠습니까?')) return
    let endpoint: string = `/fsm/stn/bdm/tx/updateDayoffVhcleConnCancel`

    if (!(authContext && 'lgnId' in authContext && authContext.lgnId)) {
      alert('로그인 정보가 없습니다. 다시 시도하세요')
      return
    }

    if (connReserYn && rsvtAplcnYmd < getFormatTomorrow()) {
      alert('연결해제일자는 금일 이후만 입력 가능합니다.')
      return
    }

    //선택된 행을 저장하는 방식
    let param: any[] = []
    selectedRows.map((id) => {
      const row = rows[Number(id.replace('tr', ''))]
      param.push({
        vhclNo: row.vhclNo,
        groupId: row.groupId,
        rsvtAplcnYmd: connReserYn ? rsvtAplcnYmd.replaceAll('-', '') : '',
        chgYmd: row.chgYmd,
        mdfrId: authContext.lgnId,
        dayoffLocgovCd: row.dayoffLocgovCd,
        bfRsvtAplcnYmd: row.rsvtAplcnYmd,
        reProYn: row.reProYn,
      })
    })

    let body = {
      byveDayoffMngReqstDto: param,
    }
    try {
      const response = await sendHttpRequest('POST', endpoint, body, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success') {
        alert('차량연결해제했습니다.')
        // fetchData()
        onCloseClick()
        reload()
      } else {
        alert(response.message)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setSelectedRows([])
      setRows([])
    }
  }

  const handleClose = () => {
    setRows([])
    setPageable({
      pageNumber: 0,
      pageSize: 0,
      totalPages: 0,
    })

    setParams({
      page: 1, // 페이지 번호는 1부터 시작
      size: 10, // 기본 페이지 사이즈 설정
    })

    onCloseClick()
  }

  return (
    <React.Fragment>
      <Dialog
        fullWidth={true}
        maxWidth={'lg'}
        open={open}
        //onClose={onCloseClick}
      >
        <DialogContent>
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              <h2>{title}</h2>
            </CustomFormLabel>

            <div className=" button-right-align">
              <Button variant="contained" color="primary" onClick={fetchData}>
                검색
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={fetchDisConnect}
              >
                차량연결해제
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
          <Box
            component="form"
            onSubmit={handleAdvancedSearch}
            marginBottom={2}
          >
            <Box className="sch-filter-box">
              <div className="filter-form">
                <div className="form-group">
                  <CustomFormLabel
                    className="input-label-display"
                    htmlFor="ft-groupNm"
                  >
                    부제그룹명
                  </CustomFormLabel>
                  <select
                    id="ft-groupNm"
                    className="custom-default-select"
                    name="groupId"
                    value={params.groupId}
                    onChange={handleSearchChange}
                    style={{ width: '70%' }}
                  >
                    {groupNmCode.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <CustomFormLabel
                    className="input-label-display"
                    htmlFor="ft-vhclNo"
                  >
                    차량번호
                  </CustomFormLabel>
                  <CustomTextField
                    id="ft-vhclNo"
                    name="vhclNo"
                    value={params.vhclNo}
                    onChange={handleSearchChange}
                    onKeyDown={handleKeyDown}
                  />
                </div>
                <div className="form-group">
                  <CustomFormLabel
                    className="input-label-display"
                    htmlFor="ft-brno"
                  >
                    사업자등록번호
                  </CustomFormLabel>
                  <CustomTextField
                    id="ft-brno"
                    name="brno"
                    value={params.brno}
                    onChange={handleSearchChange}
                    onKeyDown={handleKeyDown}
                  />
                </div>
                <div className="form-group" style={{ maxWidth: '8rem' }}>
                  <CustomFormLabel className="input-label-display">
                    말소차량
                  </CustomFormLabel>
                  <FormControlLabel
                    control={
                      <CustomCheckbox
                        name="carErsrYn"
                        value={carErsrYn}
                        onChange={() => setCarErsrYn(!carErsrYn)}
                      />
                    }
                    label=""
                  />
                </div>
              </div>
            </Box>
          </Box>
          {/* 검색영역 시작 */}

          {/* 테이블영역 시작 */}
          <Box sx={{ mb: 5 }}>
            <TableDataGrid
              headCells={stnbdmDayoffSearchModalheadCells} // 테이블 헤더 값
              rows={rows} // 목록 데이터
              totalRows={totalRows} // 총 로우 수
              loading={loading} // 로딩여부
              onRowClick={() => {}} // 행 클릭 핸들러 추가
              selectedRowIndex={selectedIndex}
              onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
              pageable={pageable}
              paging={true}
              cursor={false}
              onCheckChange={handleCheckChange}
              caption={'부제차량 목록 조회'}
            />
          </Box>

          <div className="table-scrollable">
            <table className="table table-bordered">
              <caption>사업자 정보 테이블 요약</caption>
              <colgroup>
                <col style={{ width: '25%' }}></col>
                <col style={{ width: '75%' }}></col>
              </colgroup>
              <tbody>
                <tr>
                  <th className="td-head" scope="row">
                    연결해제예약
                  </th>
                  <td>
                    <div className="form-group" style={{ width: '40%' }}>
                      <FormControlLabel
                        control={
                          <CustomCheckbox
                            name="connReserYn"
                            value={connReserYn}
                            onChange={() => setConnReserYn(!connReserYn)}
                          />
                        }
                        label=""
                      />
                      {connReserYn && ( //connReserYn 이 true일 때만 렌더링
                        <>
                          <CustomFormLabel
                            className="input-label-none"
                            htmlFor="ft-date-start"
                          >
                            연결해제시작일
                          </CustomFormLabel>
                          <CustomTextField
                            value={rsvtAplcnYmd}
                            onChange={handleSearchChange}
                            name="rsvtAplcnYmd"
                            type="date"
                            id="ft-date-start"
                            fullWidth
                            inputProps={{
                              min: getFormatTomorrow(),
                            }}
                          />
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 테이블영역 끝 */}
        </DialogContent>
      </Dialog>
    </React.Fragment>
  )
}
export default DayoffSearchModal

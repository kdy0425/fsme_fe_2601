import { CustomFormLabel, CustomTextField } from '@/utils/fsms/fsm/mui-imports'
import { Box, Button, Dialog, DialogContent } from '@mui/material'
import React, { useContext, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { serverCheckTime } from '@/utils/fsms/common/comm'

import { Pageable2 } from 'table'
import { SelectItem } from 'select'
import UserAuthContext, {
  UserAuthInfo,
} from '@/app/components/context/UserAuthContext'
import { Row } from '../page'
import { getForamtAddDay } from '@/utils/fsms/common/dateUtils'
import { stnbdmDayOffCarReserveModalHeadCells } from '@/utils/fsms/headCells'
import { getUserInfo } from '@/utils/fsms/utils'

// 목록 조회시 필요한 조건
type listSearchObj = {
  sort: string
  page: number
  size: number
  [key: string]: string | number // 인덱스 시그니처 추가
}

interface RegisterModal {
  title: string
  open: boolean
  rows: Row[]
  dayoffLocgovCd: string
  authLocalNm: string
  onCloseClick: () => void
  reload: () => void
}

export const DayoffCarReserveModal = (props: RegisterModal) => {
  const router = useRouter() // 화면이동을 위한객체
  const querys = useSearchParams() // 쿼리스트링을 가져옴

  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const { authInfo } = useContext(UserAuthContext)
  const [authContext, setAuthContext] = useState<UserAuthInfo | {}>()

  const [loading, setLoading] = useState(false) // 로딩여부
  const [selectedIndex, setSelectedIndex] = useState<number>()

  const [reserveRows, setReserveRows] = useState<Row[]>([])

  const [selectedRow, setSelectedRow] = useState<Row>()

  const [groupNmCode, setGroupNmCode] = useState<SelectItem[]>([])
  const userInfo = getUserInfo()
  //초기 데이터 세팅
  const [data, setData] = useState<Row>({})

  const {
    title,
    open,
    onCloseClick,
    reload,
    dayoffLocgovCd,
    rows,
    authLocalNm,
  } = props

  useEffect(() => {
    // 부모에서 받은 rows를 복제하여 localRows로 설정
    setReserveRows(
      props.rows.map((row, index) => ({ ...row, number: index + 1 })),
    ) // 순번 추가
  }, [props.rows])

  // 입력 값으로 바꿔주는 함수
  const handleDataChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    setData((prev) => ({ ...prev, page: 1, [name]: value }))
  }

  //
  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1,
  })

  useEffect(() => {
    setAuthContext(authInfo)
  }, [authInfo])

  //저장 버튼이 클릭되고 모든 정보를 일괄등록 해야한다.
  const handleClickStore = async () => {
    if (!(await serverCheckTime('dayoff'))) {
      return
    }

    await saveData()
  }

  const handleClickClose = () => {
    setSelectedIndex(-1)
    setSelectedRow(undefined)
    setReserveRows([])
    setData({})
    onCloseClick()
  }

  const handleRowClick = (row: Row, index?: number) => {
    setSelectedRow(row) // 인덱스를 추가하여 선택된 행 데이터 설정
    setSelectedIndex(index)
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

  const handleRemove = () => {
    let newReserveRows = []
    if (!selectedRow) {
      alert('선택된 행이 없습니다.')
      return
    }

    let dayoffLocgovCd = reserveRows[0].dayoffLocgovCd
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

    selectedRow.number
    newReserveRows = reserveRows.filter(
      (row) => row.number !== selectedRow.number,
    )
    setReserveRows(newReserveRows)
  }

  const saveData = async () => {
    if (reserveRows.length < 1) {
      alert('요청 보낼 차량정보가 없습니다.')
      return
    }
    if (!data.groupId || data.groupId === '') {
      alert('예약부제그룹명을 입력해주세요.')
      return
    }
    if (!data.rsvtAplcnYmd || data.rsvtAplcnYmd === '') {
      alert('부제예약일자를 입력해주세요.')
      return
    }

    if (
      !confirm(`부제그룹 : ${groupNmCode.find((item) => item.value === data.groupId)?.label || 'N/A'}
        차량 : ${reserveRows.length}대
        부제예약일 : ${data.rsvtAplcnYmd}
        부제예약을 설정 하시겠습니까?
        `)
    )
      return
    let endpoint: string = `/fsm/stn/bdm/tx/createByveDayoffVeResve`

    if (!(authContext && 'lgnId' in authContext && authContext.lgnId)) {
      alert('로그인 정보가 없습니다. 다시 시도하세요')
      return
    }

    // index 필드를 제외하고 aplcnBgngYmd에서 '-'를 제거한 reqList 생성
    let reqList = reserveRows.map((row) => ({
      dayoffLocgovCd: row.dayoffLocgovCd,
      groupId: data.groupId,
      vhclNo: row.vhclNo,
      rgtrId: authContext.lgnId,
      mdfrId: authContext.lgnId,
      rsvtAplcnYmd: data.rsvtAplcnYmd?.replaceAll('-', '') ?? '',
    }))

    let body = {
      byveDayoffMngReqstDto: reqList,
    }

    try {
      const response = await sendHttpRequest('POST', endpoint, body, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success') {
        alert(response.message)
      } else {
        alert(response.message)
      }
    } catch (error) {
      alert(error)
    } finally {
      handleClickClose()
      reload()
      setReserveRows([])
    }
  }

  return (
    <Box>
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
              <Button
                variant="contained"
                color="primary"
                onClick={handleRemove}
              >
                차량제외
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleClickStore}
              >
                예약등록
              </Button>
              <Button variant="contained" color="dark" onClick={onCloseClick}>
                취소
              </Button>
            </div>
          </Box>

          {/* 테이블영역 시작 */}
          <Box sx={{ maxHeight: '60vh', overflow: 'auto', mb: 2 }}>
            <TableDataGrid
              headCells={stnbdmDayOffCarReserveModalHeadCells} // 테이블 헤더 값
              rows={reserveRows} // 목록 데이터
              totalRows={reserveRows.length} // 총 로우 수
              loading={loading} // 로딩여부
              onRowClick={handleRowClick} // 행 클릭 핸들러 추가
              selectedRowIndex={selectedIndex}
              onPaginationModelChange={() => {}} // 페이지 , 사이즈 변경 핸들러 추가
              // pageable={pageable} // 현재 페이지 / 사이즈 정보
              paging={false}
              cursor={true}
              caption={'부제차량예약 목록 조회'}
            />
          </Box>
          {/* 테이블영역 시작 */}

          <div className="table-scrollable">
            <table className="table table-bordered">
              <caption>사업자 정보 테이블 요약</caption>
              <colgroup>
                <col style={{ width: '20%' }}></col>
                <col style={{ width: '30%' }}></col>
                <col style={{ width: '20%' }}></col>
                <col style={{ width: '30%' }}></col>
              </colgroup>
              <tbody>
                <tr>
                  <th className="td-head" scope="row">
                    예약부제그룹명
                  </th>
                  <td>
                    <div className="form-group" style={{ width: '100%' }}>
                      <CustomFormLabel
                        className="input-label-none"
                        htmlFor="ft-groupId"
                      >
                        예약부제그룹명
                      </CustomFormLabel>
                      <select
                        id="ft-groupId"
                        className="custom-default-select"
                        name="groupId"
                        value={data.groupId}
                        onChange={handleDataChange}
                        style={{ width: '100%' }}
                      >
                        {groupNmCode.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>

                  <th className="td-head" scope="row">
                    부제예약일자
                  </th>
                  <td>
                    <div className="form-group" style={{ width: '100%' }}>
                      <CustomFormLabel
                        className="input-label-none"
                        htmlFor="ft-date-start"
                      >
                        부제예약일자
                      </CustomFormLabel>
                      <CustomTextField
                        value={data.bgngDt}
                        onChange={handleDataChange}
                        inputProps={{
                          min: getForamtAddDay(2),
                        }}
                        name="rsvtAplcnYmd"
                        type="date"
                        id="ft-date-start"
                        fullWidth
                      />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 테이블영역 끝 */}
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default DayoffCarReserveModal

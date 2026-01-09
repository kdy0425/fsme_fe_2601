import { Button, Dialog, DialogContent, Box } from '@mui/material'
import React, { useCallback, useEffect, useState } from 'react'
import BlankCard from '@/components/shared/BlankCard'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { Pageable2 } from 'table'
import { movePathReqHC } from '@/utils/fsms/ilp/headCells'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { getFormatToday } from '@/utils/fsms/common/dateUtils'

import { CustomFormLabel, CustomTextField } from '@/utils/fsms/fsm/mui-imports'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

interface Row {
  aplySn: string
  vhclNo: string
  oprBgngDt: string
  oprEndDt: string
  trsmYn: string
  trsmDt: string
  rcptnYn: string
  rcptnDt: string
}

interface Req {
  taskSeCd: string
  vhclNo: string
  oprBgngDt: string
  oprEndDt: string
}

interface DetailProps {
  data: any
}

type listSearchObj = {
  page: number
  size: number
}

const MovePathReqDataGrid: React.FC<DetailProps> = ({ data }) => {
  const [params, setParams] = useState<listSearchObj>({
    page: 1,
    size: 10,
  })

  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([])
  const [totalRows, setTotalRows] = useState(0)
  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1,
    pageSize: 10,
    totalPages: 1,
  })
  const [loading, setLoading] = useState(false)
  const [selectedRow, setSelectedRow] = useState<Row>() // 클릭로우
  const [selectedRowIndex, setSelectedRowIndex] = useState<number>(-1)
  const [open, setOpen] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [loadingBackdrop, setLoadingBackdrop] = useState(false)

  const [req, setReq] = useState<Req>({
    taskSeCd: '',
    vhclNo: '',
    oprBgngDt: '',
    oprEndDt: '',
  })

  // 페이징 이벤트
  const handlePaginationModelChange = useCallback(
    (page: number, pageSize: number) => {
      setParams((prev) => ({ ...prev, page: page, size: pageSize }))
      setFlag((prev) => !prev)
    },
    [],
  )
  // 행 클릭 시 호출되는 함수
  const handleRowClick = useCallback((row: Row, index?: number) => {
    setSelectedRow(row)
    setSelectedRowIndex(index ?? -1)
  }, [])

  // 최초 진입 시 자동 조회
  useEffect(() => {
    if (data.vhclNo) {
      fetchData()
    }
  }, [data.vhclNo, flag])

  useEffect(() => {
    if (data.vhclNo) {
      setReq({
        taskSeCd: data.taskSeCd,
        vhclNo: data.vhclNo,
        oprBgngDt: getFormatToday(),
        oprEndDt: getFormatToday(),
      })
    }
  }, [open])

  // 데이터 조회
  const fetchData = async () => {
    setLoading(true)
    setSelectedRow(undefined)
    setSelectedRowIndex(-1)
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string = `/ilp/vi/cm/getAllMovePathReq?page=${params.page}&size=${params.size}&taskSeCd=${data.taskSeCd}&vhclNo=${data.vhclNo}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
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
      }
    } catch (error) {
      // 에러시
      console.error('Error fetching data:', error)
      setRows([])
      setTotalRows(0)
      setPageable({
        pageNumber: 1,
        pageSize: 10,
        totalPages: 1,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleParamChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = event.target
    setReq((prev) => ({ ...prev, [name]: value }))
  }

  const save = async () => {
    if (!req.oprBgngDt) {
      alert('시작일자를 입력해주세요.')
      return
    }

    if (!req.oprEndDt) {
      alert('종료일자를 입력해주세요.')
      return
    }

    const startDate = new Date(req.oprBgngDt)
    const endDate = new Date(req.oprEndDt)
    const diffDays =
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    if (diffDays > 7) {
      alert('운행기간은 7일을 초과할 수 없습니다.')
      return
    }

    if (!confirm('등록하시겠습니까?')) {
      return
    }
    let endpoint: string = `/ilp/vi/cm/insertMovePathReq`

    try {
      setLoadingBackdrop(true)
      const params = {
        ... req,
        oprBgngDt: req.oprBgngDt.replaceAll('-', '') + '000000',
        oprEndDt: req.oprEndDt.replaceAll('-', '') + '235959',
      }

      const response = await sendHttpRequest('POST', endpoint, params, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success') {
        if (response.data === 'S') {
          alert(response.message)
          fetchData()
        } else alert(response.data)
        setOpen(false)
      } else {
        alert(response.message)
      }
    } catch (error) {
      alert(error)
    } finally {
      setLoadingBackdrop(false)
    }
  }

  const del = async () => {
    if (!selectedRow?.aplySn) {
      alert('선택된 내역이 없습니다.')
      return
    }
    if (!confirm('삭제하시겠습니까?')) {
      return
    }
    let endpoint: string = `/ilp/vi/cm/deleteMovePathReq`

    try {
      setLoadingBackdrop(true)
      const response = await sendHttpRequest(
        'PUT',
        endpoint,
        { aplySn: selectedRow?.aplySn, taskSeCd: data.taskSeCd },
        true,
        {
          cache: 'no-store',
        },
      )

      if (response && response.resultType === 'success') {
        alert(response.message)
        fetchData()
      } else {
        alert(response.message)
      }
    } catch (error) {
      alert(error)
    } finally {
      setLoadingBackdrop(false)
    }
  }

  return (
    <Box>
      <BlankCard
        className="contents-card"
        title="이동경로 요청내역"
        buttons={[
          {
            label: '등록',
            onClick: () => setOpen(true),
            color: 'outlined',
          },
          {
            label: '삭제',
            onClick: () => del(),
            color: 'outlined',
          },
        ]}
      >
        <TableDataGrid
          headCells={movePathReqHC}
          rows={rows}
          totalRows={totalRows}
          loading={loading}
          onRowClick={handleRowClick} // 행 클릭 핸들러 추가
          onPaginationModelChange={handlePaginationModelChange}
          pageable={pageable}
          paging={true}
          cursor={true}
          selectedRowIndex={selectedRowIndex}
          caption={'이동경로 요청내역'}
        />
      </BlankCard>

      <Dialog
        fullWidth={false}
        maxWidth={'lg'}
        open={open}
        PaperProps={{
          style: {
            width: '500px',
          },
        }}
        onClose={() => setOpen(false)}
      >
        <DialogContent>
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              <h2>이동경로 요청 등록</h2>
            </CustomFormLabel>
            <div className=" button-right-align">
              <Button variant="contained" color="primary" onClick={save}>
                저장
              </Button>
              <Button
                variant="contained"
                color="dark"
                onClick={() => setOpen(false)}
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
                <caption>요청내역</caption>
                <colgroup>
                  <col style={{ width: '40%' }}></col>
                  <col style={{ width: '60%' }}></col>
                </colgroup>
                <tbody>
                  <tr>
                    <th className="td-head" scope="row">
                      운행 시작일
                    </th>
                    <td>
                      <div className="form-group" style={{ width: '100%' }}>
                        <CustomFormLabel
                          className="input-label-none"
                          htmlFor="ft-date-start"
                        >
                          운행시작일
                        </CustomFormLabel>
                        <CustomTextField
                          type="date"
                          id="ft-date-start"
                          name="oprBgngDt"
                          value={req.oprBgngDt}
                          onChange={handleParamChange}
                          inputProps={{
                            max: req.oprEndDt,
                          }}
                          fullWidth
                        />
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">
                      운행 종료일
                    </th>
                    <td>
                      <div className="form-group" style={{ width: '100%' }}>
                        <CustomFormLabel
                          className="input-label-none"
                          htmlFor="ft-date-end"
                        >
                          운행종료일
                        </CustomFormLabel>
                        <CustomTextField
                          type="date"
                          id="ft-date-end"
                          name="oprEndDt"
                          value={req.oprEndDt}
                          onChange={handleParamChange}
                          inputProps={{
                            min: req.oprBgngDt,
                            max: getFormatToday(),
                          }}
                          fullWidth
                        />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            {/* 테이블영역 끝 */}
          </div>
          {/* 모달팝업 내용 끝 */}
          <LoadingBackdrop open={loadingBackdrop} />
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default MovePathReqDataGrid

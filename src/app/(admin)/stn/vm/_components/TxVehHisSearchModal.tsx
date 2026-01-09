import {
  CustomFormLabel,
  CustomRadio,
  CustomSelect,
  CustomTextField,
} from '@/utils/fsms/fsm/mui-imports'
import {
  Box,
  Button,
  Dialog,
  DialogContent,

} from '@mui/material'
import React, { useEffect, useState, useCallback } from 'react'


import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'

import { HeadCell, Pageable2 } from 'table'
import { Row } from './TxPage'
import { stnvmTxVehHisSearchModalheadCells } from '@/utils/fsms/headCells'


/**
 *  차량정보 변경 이력 (택시)
 */


interface TxVehHisSearchModalProps {
  title: string
  url: string
  open: boolean
  data: Row
  onCloseClick: () => void
}


export const TxVehHisSearchModal = (props: TxVehHisSearchModalProps) => {
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [loading, setLoading] = useState(false) // 로딩여부

  const { title, url, open, data ,onCloseClick } = props

  useEffect(() => {
    if (open){
      fetchData()
    }    
  }, [open])


  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    setLoading(true)
    
    try {

      let endpoint: string = `${url}?${data.vhclNo ? 'vhclNo=' + data.vhclNo : ''}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        // 순번 추가 
        response.data.map((row: any, index: number) => {
          row.hstrySn = index + 1
          return row
        })

        setRows(response.data)
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

  return (
    <Box>
      <Dialog
        fullWidth={false}
        maxWidth={'lg'}
        open={open}
      >
        <DialogContent>
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              <h2>{title}</h2>
            </CustomFormLabel>
            <div className=" button-right-align">
              <Button
                variant="contained"
                color="dark"
                onClick={onCloseClick}
              >
                취소
              </Button>
            </div>
          </Box>
          {/* 검색영역 시작 */}
          <Box component="form" sx={{ mb: 2 }}>
            <Box className="sch-filter-box">
              <div className="filter-form">
                <div className="form-group">
                  <CustomFormLabel className="input-label-display" htmlFor="ft-vhclNo">
                  차량번호
                  </CustomFormLabel>
                  <CustomTextField
                    id="ft-vhclNo"
                    name="vhclNo"
                    value={data.vhclNo}
                    disabled             
                  />
                </div>
                <div className="form-group">
                  <CustomFormLabel className="input-label-display" htmlFor="ft-bzentyNm">
                  업체명
                  </CustomFormLabel>
                  <CustomTextField
                    id="ft-bzentyNm"
                    name="bzentyNm"
                    value={data.bzentyNm}
                    disabled              
                  />
                </div>
              </div>
            </Box>
          </Box>
          {/* 검색영역 시작 */}

          {/* 테이블영역 시작 */}
          <Box>
            <TableDataGrid
              headCells={stnvmTxVehHisSearchModalheadCells} // 테이블 헤더 값
              rows={rows} // 목록 데이터
              loading={loading} // 로딩여부
              caption={"택시 차량정보 변경이력 목록 조회"}
            />
          </Box>
          {/* 테이블영역 끝 */}
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default TxVehHisSearchModal

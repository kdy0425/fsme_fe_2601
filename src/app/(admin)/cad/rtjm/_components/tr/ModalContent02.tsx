import {
  Box,
  TableContainer,
} from '@mui/material'
import { Row } from './page'

// react
import React, { useEffect, useState } from 'react'

// components
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'

// utils
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { rfidTagJudgStpTrHeadCells } from '@/utils/fsms/headCells'

interface ModalProps {
  vhclNo: string | undefined
  vonrBrno: string | undefined
  vonrRrno: string | undefined
  type: string | undefined
}

const ModalForm = (props: ModalProps) => {
  const { vhclNo, vonrBrno, vonrRrno, type } = props
  const [row, setRow] = useState<Row[]>([])

  const [loading, setLoading] = useState(false) // 로딩여부

  const fetchData = async () => {
    setLoading(true)
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string = ''
      if (type === 'tr') {
        endpoint = `/fsm/cad/rtjm/tr/getAllPymntStopRfidTagJdgmnMng` +
        `${vonrBrno ? '?vonrBrno=' + vonrBrno : ''}` +
        `${vonrRrno ? '&vonrRrno=' + vonrRrno : ''}` +
        `${vhclNo ? '&vhclNo=' + vhclNo : ''}`
      } else if (type === 'bs') {
        endpoint = `/fsm/cad/rtjm/bs/getAllPymntStopRfidTagJdgmnMng` +
        `${vonrBrno ? '?brno=' + vonrBrno : ''}` +
        `${vhclNo ? '&vhclNo=' + vhclNo : ''}`
      }
        
      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        setRow(response.data.content)
      } else {
        setRow([])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setRow([])
    } finally {
      setLoading(false)
    }
  }

  // 데이터 갱신
  useEffect(() => {
    fetchData()
  }, [])

  return (
    <Box>
      <Box className="sch-filter-box">
        <div className="filter-form">
          <div className="form-group">
            <CustomFormLabel className="input-label-display" htmlFor="sch-ctpv">
              차량번호
            </CustomFormLabel>
            <CustomTextField
              id="ft-vhclNo"
              name="vhclNo"
              value={props.vhclNo}
              fullWidth
              readOnly
            />
          </div>
        </div>
      </Box>
      <TableContainer sx={{ minWidth: 900 }}>
        <TableDataGrid
          headCells={rfidTagJudgStpTrHeadCells}
          rows={row}
          loading={loading}
          paging={false}
          cursor={true}
          caption={"보조금지급정지/거절 및 차량 휴지 내역 조회"}
        />
      </TableContainer>
    </Box>
  )
}

export default ModalForm

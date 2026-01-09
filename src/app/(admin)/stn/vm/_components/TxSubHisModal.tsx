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
import { useRouter, useSearchParams } from 'next/navigation'


import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'

import { HeadCell, Pageable2 } from 'table'
import {
  CtpvSelect,
  LocgovSelect,
  CommSelect,
} from '@/app/components/tx/commSelect/CommSelect'
import { Row } from './TxPage'
import { stnvmTxSubHisModalheadCells } from '@/utils/fsms/headCells'


/**
 *  부제이력보기 (택시)
 */


interface TxSubHisModalProps {
  title: string
  url: string
  open: boolean
  data: Row
  onCloseClick: () => void
}


export const TxSubHisModal = (props: TxSubHisModalProps) => {
  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [loading, setLoading] = useState(false) // 로딩여부

  const { title, url, open, data ,onCloseClick } = props

  useEffect(() => {
    setRows([])
    if(open == true )
      setFlag(prev => !prev)
  }, [open])

  useEffect(() => {

    if (data.brno && data.vhclNo) {
      fetchData()
    }
  }, [flag])

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    if(!data){
      return 
    }
    console.log('전달받은 데이터  부제 이력 : ',data)
    setLoading(true)
    try {

      //fsm/stn/vm/tx/getDayoffHisTx
      let endpoint: string =
        `${url}?` +
        `${data.vhclNo ? '&vhclNo=' + data.vhclNo : ''}` 
        
      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
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
          {/* 검색영역 시작 */}

          {/* 테이블영역 시작 */}
          <Box>
            <TableDataGrid
              headCells={stnvmTxSubHisModalheadCells} // 테이블 헤더 값
              rows={rows} // 목록 데이터
              loading={loading} // 로딩여부
              caption={"택시 부제이력 목록 조회"}
            />
          </Box>
          {/* 테이블영역 끝 */}
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default TxSubHisModal

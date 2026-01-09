/* React */
import React, { useEffect, useState } from 'react'

/* mui component */
import { Box, Button, Dialog, DialogContent } from '@mui/material'
import { CustomFormLabel } from '@/utils/fsms/fsm/mui-imports'

/* 공통 component */
import TableDataGrid from '@/app/components/tables/CommDataGrid2'

/* 공통js */
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import _ from 'lodash'

/* type */
import { supPmRcntImplPrfmncHC } from '@/utils/fsms/headCells'

/* _components */
import { RcntImplPrfmncHeader } from './CustomHeaders'

/* redux-toolkit */
import { useDispatch, useSelector } from 'react-redux'
import { AppState } from '@/store/store'
import { handleRateModal, handleSetList } from '@/store/popup/PrdvMngSlice'

/* prdvJs */
import { isSumLocgovCd, excelPrecision } from '../prdvJs'

export interface rcntImplPrfmncRow {
  locgovCd: string
  locgovNm: string
  aopsAmt: number
  bopsAmt: number
  copsAmt: number
  dopsAmt: number
  topsAmt: number
  rcntImplPrfmnc: string
  dbRcntImplPrfmnc: string
  backgroundColor: string
}

const RcntImplPrfmncModal = () => {

  // redux-toolkit
  const { rcntImplPrfmncOpen } = useSelector((state: AppState) => state.PrdvMng)
  const dispatch = useDispatch()

  const [rows, setRows] = useState<rcntImplPrfmncRow[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  // 모달오픈시 최근4년 집행실적 리스트 가져옴
  useEffect(() => {
    if (rcntImplPrfmncOpen) {
      fetchData()
    }
  }, [rcntImplPrfmncOpen])

  // 저장
  const handleSelect = (): void => {
    // 저장시 지자체 합계는 소수점2자리, 지자체는 소수점 5자리로 재 세팅
    const temp = _.cloneDeep(rows)
    temp.map(item => {
      const rate = Number(item.rcntImplPrfmnc) * 100
      if (isSumLocgovCd(item.locgovCd)) {
        item.rcntImplPrfmnc = rate === 100 ? '100.00' : rate.toString()
      } else {
        item.rcntImplPrfmnc = rate.toFixed(2)
      }
    })
    dispatch(handleSetList({ name: 'rcntImplPrfmncList', list: temp }))
    handleClose()
  }

  // 모달 close
  const handleClose = (): void => {
    dispatch(handleRateModal({ name: 'rcntImplPrfmncOpen', open: false }))
  }

  // 최근4년 집행실적 리스트 조회
  const fetchData = async (): Promise<void> => {

    try {

      setLoading(true)

      const endpoint = '/fsm/sup/pm/cm/getRcntImplPrfmncRateList'
      const response = await sendHttpRequest('GET', endpoint, null, true, { cache: 'no-store' })

      if (response && response.resultType === 'success' && response.data.length) {
        const temp: rcntImplPrfmncRow[] = _.cloneDeep(response.data)
        // 누계 집행액         
        const total = temp[0].topsAmt
        // 비율 계산
        temp.map(item => {
          const rate = item.topsAmt / total
          item.dbRcntImplPrfmnc = excelPrecision(rate) // 유효소수로 변환
          item.rcntImplPrfmnc = rate.toFixed(7)
          if (isSumLocgovCd(item.locgovCd)) {
            item.backgroundColor = 'lightgrey'
          }
        })
        setRows(temp)
      }
    } catch (error) {
      console.log('fetchData error : ' + error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box>
      <Dialog
        fullWidth={true}
        maxWidth={'lg'}
        open={rcntImplPrfmncOpen}
      >
        <DialogContent>
          <Box className='table-bottom-button-group'>
            <CustomFormLabel className='input-label-display'>
              <h2 className='popup-title'>
                집행실적 등록
              </h2>
            </CustomFormLabel>

            <div className='button-right-align'>
              <Button
                variant='contained'
                color='primary'
                onClick={handleSelect}
              >
                등록
              </Button>
              <Button
                variant='contained'
                color='dark'
                onClick={handleClose}
              >
                닫기
              </Button>
            </div>
          </Box>

          {/* 테이블영역 시작 */}
          <Box mt={2}>
            <TableDataGrid
              headCells={supPmRcntImplPrfmncHC}
              rows={rows}
              loading={loading}
              customHeader={RcntImplPrfmncHeader}
              caption={'최근4년 집행실적 조회 목록'}
            />
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default RcntImplPrfmncModal
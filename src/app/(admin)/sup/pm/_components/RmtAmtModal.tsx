/* React */
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react'

/* mui component */
import { Box, Button, Dialog, DialogContent } from '@mui/material'
import { CustomFormLabel } from '@/utils/fsms/fsm/mui-imports'

/* 공통 component */
import TableDataGrid from '@/app/components/tables/CommDataGrid2'

/* 공통js */
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { toQueryParameter } from '@/utils/fsms/utils'
import { getExcelFile, getToday } from '@/utils/fsms/common/comm'
import _ from 'lodash'

/* type */
import { supPmRmtAmtHC } from '@/utils/fsms/headCells'
import { rcntImplPrfmncRow } from './RcntImplPrfmncModal'

/* _components */
import { RmtAmtHeader } from './CustomHeaders'

/* prdvJs */
import { isSumLocgovCd, excelPrecision } from '../prdvJs'

interface RmtAmtRow extends rcntImplPrfmncRow {
  armtAmt: number
  brmtAmt: number
  crmtAmt: number
  drmtAmt: number
  trmtAmt: number
  diffAmt: number
}

type propsType = {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  year: string
}

const RmtAmtModal = (props: propsType) => {

  const { open, setOpen, year } = props

  const [rows, setRows] = useState<RmtAmtRow[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  // 모달오픈시 송금액 및 집행실적 리스트 가져옴
  useEffect(() => {
    if (open) {
      fetchData()
    }
  }, [open])

  // 송금액 및 집행실적 리스트 조회
  const fetchData = async (): Promise<void> => {

    try {

      setLoading(true)

      const endpoint = '/fsm/sup/pm/cm/getRmtAmtList' + toQueryParameter({ crtrYear: year })
      const response = await sendHttpRequest('GET', endpoint, null, true, { cache: 'no-store' })

      if (response && response.resultType === 'success' && response.data.length) {
        const temp: RmtAmtRow[] = _.cloneDeep(response.data)
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

  // 송금액 및 집행실적 리스트 조회
  const handleExcelDownload = async (): Promise<void> => {
    const endpoint = '/fsm/sup/pm/cm/getRmtAmtExcel' + toQueryParameter({ crtrYear: year })
    const title = '송금액 및 집행실적_' + getToday() + '.xlsx'
    await getExcelFile(endpoint, title)
  }

  return (
    <Box>
      <Dialog
        fullWidth={true}
        maxWidth={'lg'}
        open={open}
      >
        <DialogContent>
          <Box className='table-bottom-button-group'>
            <CustomFormLabel className='input-label-display'>
              <h2 className='popup-title'>
                송금액 및 집행실적
              </h2>
            </CustomFormLabel>

            <div className='button-right-align'>
              <Button
                variant='contained'
                color='success'
                onClick={handleExcelDownload}
              >
                엑셀
              </Button>
              <Button
                variant='contained'
                color='dark'
                onClick={() => setOpen(false)}
              >
                닫기
              </Button>
            </div>
          </Box>

          {/* 테이블영역 시작 */}
          <Box mt={2}>
            <TableDataGrid
              headCells={supPmRmtAmtHC}
              rows={rows}
              loading={loading}
              customHeader={() => RmtAmtHeader(Number(year))}
              caption={'송금액 및 집행실적 조회 목록'}
            />
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default RmtAmtModal
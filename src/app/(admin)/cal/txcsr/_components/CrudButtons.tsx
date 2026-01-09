/* React */
import React, { useEffect, useState } from 'react'

/* mui component */
import { Box, Button } from '@mui/material'

/* 공통 js */
import { getUserInfo } from '@/utils/fsms/utils'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { getToday } from '@/utils/fsms/common/comm'

/* _component */
import ModalContent from './ModalContent'
import FormDialog from './FormDialog'
import { every } from 'lodash'

/* interface, type 선언 */
interface propsInterface {
  rowIndex: number
  tabIndex: string
  handleAdvancedSearch: () => void
  handleExcelDownLoad: () => void
  CsbySbsidyRqestList?: any[]
  getData?: () => void
}

const CrudButtons = (props: propsInterface) => {
  const {
    rowIndex,
    tabIndex,
    handleAdvancedSearch,
    handleExcelDownLoad,
    CsbySbsidyRqestList,
    getData,
  } = props

  const [remoteFlag, setRemoteFlag] = useState<boolean | undefined>()

  const [open, setOpen] = useState<boolean>(false)

  const handleClickOpen = () => {
    // const checkYNX = false;
    // CsbySbsidyRqestList?.map((row => {
    //   if (row.ddlnYn != 'X') {
    //     checkYNX = true
    //     return
    //   }
    // }))
    // console.log('CsbySbsidyRqestList : ', CsbySbsidyRqestList)
    const checkYNX = CsbySbsidyRqestList?.every(function (row, index) {
      return row.ddlnYn === 'N'
    })
    const checCAYn = CsbySbsidyRqestList?.every(function (row, index) {
      console.log(row.clmAprvYn)
      console.log(row.clmAprvYn !== 'X')
      return !(row.clmAprvYn !== 'X')
    })

    // console.log('checkYNX : ', checkYNX)

    if (CsbySbsidyRqestList?.length == 0) {
      alert('청구내역을 선택해 주세요.')
      return
    }

    if (!checkYNX) {
      alert('확정여부가 미확정상태인 데이터만 거절할 수 있습니다.')
      return
    }
    if (!checCAYn) {
      alert('이미 처리된 내역입니다.')
      return
    }
    setOpen(true)
  }

  const handleClickClose = () => {
    setOpen(false)
  }

  useEffect(() => {
    setRemoteFlag(undefined)
  }, [rowIndex])

  return (
    <Box className="table-bottom-button-group">
      <div className="button-right-align">
        {/* 조회 */}
        <Button
          variant="contained"
          color="primary"
          onClick={handleAdvancedSearch}
        >
          검색
        </Button>

        {/* 엑셀 */}
        <Button
          variant="contained"
          color="success"
          onClick={handleExcelDownLoad}
        >
          엑셀
        </Button>
        
        {/* {tabIndex === '1' ? (
          <>
            <Button
              variant="contained"
              color="inherit"
              onClick={() => handleClickOpen()}
            >
              거절
            </Button>
          </>
        ) : (
          ''
        )} */}
      </div>
      {/* <FormDialog
        open={open}
        handleClickClose={handleClickClose}
        size="lg"
        reqDataList={CsbySbsidyRqestList}
        getData={getData}
      /> */}
    </Box>
  )
}

export default CrudButtons

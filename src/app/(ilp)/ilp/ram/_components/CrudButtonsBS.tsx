import { Box, Button } from "@mui/material"
import { Row } from "../page"
import BsRegisterModal from "./BsRegisterModal"
import React, { useState } from "react"

/* interface, type 선언 */
interface propsInterface {
  rows:Row[],
  rowIndex:number,
  handleAdvancedSearch:() => void,
  handleExcelDownload:() => void,
  tabIndex:string,
  reload:() => void,
}

const CrudButtonsBS = (props: propsInterface) => {
  
  const { rows, rowIndex, handleAdvancedSearch, handleExcelDownload, tabIndex, reload } = props

  const [bsOpen, setBsOpen] = useState<boolean>(false)

  const [modalType, setModalType] = useState<'I' | 'U'>('I')

  const selectedRow = rowIndex !== -1 ? rows[rowIndex] : undefined
  // exmnNo가 '99'로 시작할 때만 수정 가능
  const canUpdate =
    !!selectedRow?.exmnNo && selectedRow.exmnNo.startsWith('99')

  const handleModalOpen = (type:'I'|'U') => {
    
    if (type === 'U') {      
      
      if (rowIndex === -1) {
        alert("수정할 데이터를 선택해주세요.")
        return
      }

    }

    setModalType(type);

    setBsOpen(true);

  }

  return (
    <Box className="table-bottom-button-group">
      <div className="button-right-align">
        
        {/* 조회 */}
        <Button
          variant='contained'
          color='primary'
          onClick={handleAdvancedSearch}
        >
          검색
        </Button>

       {/* 등록 >>> 오픈 후 삭제 */}
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => handleModalOpen('I')}
        >
          등록
        </Button>     

       {/* 수정 >>> 오픈 후 삭제 */}
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => handleModalOpen('U')}
          disabled={!canUpdate}
        >
          수정
        </Button>              

        {/* 엑셀 */}
        <Button
          variant='contained'
          color='success'
          onClick={handleExcelDownload}
        >
          엑셀
        </Button>
      </div>
      
      {bsOpen ? (
        <BsRegisterModal
          open={bsOpen}
          row={rows[rowIndex]}
          handleClickClose={() => setBsOpen(false)}
          type={modalType}
          reload={reload}
          origin="list" 
        />
      ) : null}
    </Box>
  )
}

export default CrudButtonsBS
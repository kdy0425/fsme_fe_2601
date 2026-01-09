import FormDialog from "@/app/components/popup/FormDialog"
import { Box, Button } from "@mui/material"
import ModalContent from "./ModalContent"
import { Row } from "../page"
import TrRegisterModal from "./TrRegisterModal"
import TxRegisterModal from "./TxRegisterModal"
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

const CrudButtons = (props: propsInterface) => {
  
  const { rows, rowIndex, handleAdvancedSearch, handleExcelDownload, tabIndex, reload } = props

  const [trOpen, setTrOpen] = useState<boolean>(false)
  const [txOpen, setTxOpen] = useState<boolean>(false)

  const [modalType, setModalType] = useState<'I' | 'U'>('I')

  const handleModalOpen = (type:'I'|'U') => {
    
    if (type === 'U') {      
      
      if (rowIndex === -1) {
        alert("수정할 데이터를 선택해주세요.")
        return
      }
      
      if (rows[rowIndex].trsmYn !== 'N') { 
        alert("전송완료 된 건은 수정할 수 없습니다.")
        return
      }
    }

    setModalType(type);

    if (tabIndex === '0') {
      setTrOpen(true);
    } else {
      setTxOpen(true);
    }
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

        {/* 신규 */}
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => handleModalOpen('I')}
        >
          등록
        </Button>

        {/* 수정 */}
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => handleModalOpen('U')}
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
      
      {trOpen ? (
        <TrRegisterModal 
          open={trOpen}
          row={rows[rowIndex]}
          handleClickClose={() => setTrOpen(false)}
          type={modalType}
          reload={reload}
        />
      ) : null}

      {txOpen ? (
        <TxRegisterModal 
          open={txOpen}
          row={rows[rowIndex]}
          handleClickClose={() => setTxOpen(false)}
          type={modalType}
          reload={reload}
        />
      ) : null}
    </Box>
  )
}

export default CrudButtons
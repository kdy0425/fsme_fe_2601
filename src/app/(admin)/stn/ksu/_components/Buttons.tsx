/* React */
import React, { useState } from 'react'

/* mui component */
import { Box, Button } from '@mui/material'

/* 공통js */
import { getUserInfo } from '@/utils/fsms/utils'

/* _component */
import { RegisterModal } from './RegisterModal'

/* 부모 컴포넌트에서 선언한 interface */
import { Row } from '../page';

interface propsInterface {
  reload:(type?:'reload') => void,
  excelDownload:() => void,
  handleDelete:() => void,
  rows:Row[],
}

const Buttons = (props:propsInterface) => {
  
  const { reload, excelDownload, handleDelete, rows } = props;
  
  const userInfo = getUserInfo();
  const [open, setOpen] = useState<boolean>(false);
  const [type, setType] = useState<'update'|'new'>('new');

  const handleClickClose = () => {
    setOpen(false);
  }

  const handleOpen = (type:'new'|'update') => {
    
    if(userInfo.roles[0] != 'ADMIN') {
      alert('관리자권한만 사용 가능합니다.');
      return;
    }

    setOpen(true);
    setType(type)
  }

  return (
    <Box className="table-bottom-button-group">
      <div className="button-right-align">
        
        <Button
          onClick={() => reload()}
          variant="contained"
          color="primary"
        >
          검색
        </Button>
        
        <Button
          onClick={() => handleOpen('new')}
          variant="contained"
          color="primary"
        >
          등록
        </Button>
      
        <Button
          onClick={() => handleOpen('update')}
          variant="contained"
          color="primary"
        >
          수정
        </Button>
      
        <Button
          onClick={() => handleDelete()}
          variant="contained"
          color="error"
        >
          삭제
        </Button>
        
        <Button
          onClick={() => excelDownload()}
          variant="contained"
          color="success"
        >
          엑셀
        </Button>
      </div>

      {open ? (
        <RegisterModal
          title={type == 'update' ? '전국표준한도수정' : '전국표준한도등록'}
          open={open}
          type={type}
          pRows={type == 'update' ? rows : []}
          onCloseClick={handleClickClose}
          reload={() => reload('reload')}
        />
      ) : null}      
    </Box>
  )
}

export default Buttons

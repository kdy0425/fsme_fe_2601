import React, { ReactNode, useContext, useEffect, useState } from 'react';
import { DetailRow } from '../page';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

interface ModalProps {
  srvy: DetailRow
  data: DetailRow[]
}

const ModalContent = (props: ModalProps) => {
  const { srvy, data } = props;
  const [selectedData, setSelectedData] = useState<string>('')

  return (
    <Box className="data-grid-wrapper">
      <TableContainer style={{minHeight:'100px' ,maxHeight: '500px', marginBottom: '20px'}}>
        <Table style={{minHeight:'100px'}}>
          <TableBody>
            <TableRow>
              <TableCell className="table-head-text" style={{width:'15%', backgroundColor: '#e5ebf0'}}>문항내용</TableCell>
              <TableCell>{srvy.chcArtclCn ?? '데이터 없음'}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <TableContainer style={{minHeight:'200px' ,maxHeight: '500px', marginBottom: '20px'}}>
        <Table className='table table-bordered'>
          <TableHead>
            <TableRow>
              <TableCell className="table-head-text" style={{whiteSpace:'nowrap'}}>번호</TableCell>
              <TableCell className="table-head-text">답변내용</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data && data.map((item) => (
              <TableRow selected={selectedData === item.sbjctvRspnsCn} onClick={() => setSelectedData(item.sbjctvRspnsCn)} hover >
                <TableCell className='td-center'>{item.sn ?? '데이터 없음'}</TableCell>
                <TableCell  className='td-left'>
                    <div style={{width:'700px',overflow:'hidden',textOverflow:'ellipsis',wordBreak:'break-word',whiteSpace:'nowrap'}}>
                      {item.sbjctvRspnsCn ?? '데이터 없음'}
                    </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TableContainer>
        <Table style={{minHeight:'100px'}}>
          <TableBody>
            <TableRow style={{minWidth:'300px'}}>
              <TableCell className="table-head-text" style={{width:'15%', backgroundColor: '#e5ebf0'}}>답변상세</TableCell>              
              <TableCell className='td-left'>{selectedData ?? '데이터 없음'}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
    
  )
}

export default ModalContent;
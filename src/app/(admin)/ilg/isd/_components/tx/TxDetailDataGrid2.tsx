/* React */
import React, { useEffect, useState, memo } from 'react';

/* mui component */
import { FormControlLabel, RadioGroup, Table, TableBody, TableCell, TableContainer, TableRow } from '@mui/material';
import { CustomRadio } from '@/utils/fsms/fsm/mui-imports';

/* 공통 component */
import BlankCard from '@/app/components/shared/BlankCard';
import CustomCheckbox from '@/app/components/forms/theme-elements/CustomCheckbox';

/* 공통 js */
import { formatDate } from '@/utils/fsms/common/convert';
import { brNoFormatter, getCommaNumber } from '@/utils/fsms/common/util';

/* _component */
import AdmdspSeRadio from './AdmdspSeRadio'

/* 부모페이지에서 선언한 interface */
import { Row } from './TxPage';

/* interface 선언 */
interface DetailDataGridProps {
  selectedRow:Row;
}

const TxDetailDataGrid2 = (props:DetailDataGridProps) => {
  
  const { selectedRow } = props;

  return (
      <BlankCard className='contents-card' title='조사 및 행정처리'>
        <TableContainer>
          <Table className='table table-bordered'>
            <caption>조사 및 행정처리 테이블</caption>
            <colgroup>
              <col style={{width: '13%' }} />
              <col style={{width: '20%' }} />
              <col style={{width: '13%' }} />
              <col style={{width: '20%' }} />
              <col style={{width: '13%' }} />
              <col style={{width: '20%' }} />
            </colgroup>
            <TableBody>
              
              <TableRow>
                <TableCell className='td-head' scope='row'>
                  적발방법
                </TableCell>
                <TableCell>
                  {selectedRow.dsclMthdNm}
                </TableCell>
                <TableCell className='td-head' scope='row'>
                  기타
                </TableCell>
                <TableCell colSpan={3}>
                  {selectedRow.dsclMthdEtcMttrCn}
                </TableCell>                  
              </TableRow>

              <TableRow>
                <TableCell className='td-head' scope='row'>
                  규정 위반 조항
                </TableCell>
                <TableCell>
                  {selectedRow.ruleVltnCluNm}
                </TableCell>
                <TableCell className='td-head' scope='row'>
                  기타
                </TableCell>
                <TableCell colSpan={3}>
                  {selectedRow.ruleVltnCluEtcCn}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className='td-head' scope='row'>
                  위반횟수
                </TableCell>
                <TableCell className='td-right'>
                  {selectedRow.exmnRegNocs}
                </TableCell>
                <TableCell className='td-head' scope='row'>
                  행정처분
                </TableCell>
                <TableCell colSpan={3}>
                  <AdmdspSeRadio
                    admdspSeCd={selectedRow.admdspSeCd}
                  />                  
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className='td-head' scope='row'>
                  행정처분일
                </TableCell>
                <TableCell>
                  {formatDate(selectedRow.dspsDt)}
                </TableCell>
                <TableCell className='td-head' scope='row'>
                  행정처분 시작일
                </TableCell>
                <TableCell>
                  {formatDate(selectedRow.stopBgngYmd)}
                </TableCell>
                <TableCell className='td-head' scope='row'>
                  행정처분 종료일
                </TableCell>
                <TableCell>
                  {formatDate(selectedRow.stopEndYmd)}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className='td-head' scope='row'>
                  환수금
                </TableCell>
                <TableCell>
                  <RadioGroup
                    row
                    id='chk_rdmYn'
                    className='mui-custom-radio-group'
                    name='rdmYn'
                    value={selectedRow.rdmYn}
                  >
                    <FormControlLabel
                      control={<CustomRadio id='chk_Y' value='Y' />}
                      label='환수'
                    />
                    <FormControlLabel
                      control={<CustomRadio id='chk_N' value='N' />}
                      label='환수안함'
                    />
                  </RadioGroup>
                </TableCell>
                <TableCell className='td-head' scope='row'>
                  환수금액
                </TableCell>
                <TableCell className='td-right'>
                  {getCommaNumber(Number(selectedRow.rdmActnAmt))}
                </TableCell>
                <TableCell className='td-head' scope='row'>
                  국토부보조금
                </TableCell>
                <TableCell>
                  <FormControlLabel 
                    label='미지급' 
                    control={
                      <CustomCheckbox 
                        checked={selectedRow.moliatOtspyYn === 'Y'}
                      />
                    } 
                  />
                </TableCell>
              </TableRow>
              
              <TableRow style={{height: '100px'}}>
                <TableCell className='td-head' scope='row' >
                  조사내용 및<br/>행정처분사유
                </TableCell>
                <TableCell colSpan={7}>
                  {selectedRow.admdspRsnCn}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className='td-head' scope='row'>
                  주유소 공모
                </TableCell>
                <TableCell>
                  {selectedRow.oltPssrpPrtiYnNm}
                </TableCell>
                <TableCell className='td-head' scope='row'>
                  주유소명
                </TableCell>
                <TableCell>
                  {selectedRow.oltPssrpPrtiOltNm}
                </TableCell>
                <TableCell className='td-head' scope='row'>
                  사업자등록번호
                </TableCell>
                <TableCell>
                  {brNoFormatter(selectedRow.oltPssrpPrtiBrno)}
                </TableCell>                  
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </BlankCard>
  );
};

export default memo(TxDetailDataGrid2);

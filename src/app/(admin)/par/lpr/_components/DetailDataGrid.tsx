import { Box } from '@mui/material'
import { Row } from '../page'
import { BlankCard } from '@/utils/fsms/fsm/mui-imports'
import PublicDataGrid from './table/PublicTable'
import PrivateDataGrid from './table/PrivateTable'
import { useEffect, useState } from 'react'
import { addDays, dateToString, getDateFormatYMD } from '@/utils/fsms/common/dateUtils'

type DetailDataGridProps = {
  detail: Row,
  tabIndex: string,
  saveData: () => void,
}

const DetailDataGrid = (props: DetailDataGridProps) => {
  
  const { detail, tabIndex, saveData } = props

  const [cardUseDate, setCardUseDate] = useState<string>('');
  const [chuseYMD, setChuseYMD] = useState<string>('');

  useEffect(() => {    
    if (detail) {      
      fn_setCardUseDate();      
      if (tabIndex === '1') {
        fn_setChuseYMD();
      }      
    }
  }, [detail])

  /*
    서면신청 가능기간 조건
    1. 면허개시일부터 신규발급 유류구매카드 최초사용일까지(15일이내)
    2. 분실-훼손일부터 재발급 유류구매카드 최초사용일까지(15일이내)
    3. 카드정지일부터 정지일 이후 발급된 유류구매카드 최초사용일까지
    4. 충전(주유)일로부터 2개월 이내
  */
  const fn_setCardUseDate = () => {
    
    let result = '';
  
    if (!detail?.regSeCd || detail.regSeCd === '9') {      
      result = ''; // 등록구분이 기타일 경우 서면신청 가능기간 표시 안함
    } else {

      if ((detail.rcptYmd ?? '').length !== 8 || (detail.regSeCdAcctoYmd ?? '').length !== 8) {
        result = '';
      } else if (detail.regSeCd !== '4' && (detail.cardFrstUseYmd ?? '').length !== 8) {
        result = '';
      } else if (detail.regSeCd === '4' && (detail.regSeCdAcctoEndYmd ?? '').length !== 8) {
        result = '';
      } else {

        let bgngYmd = '';
        let endYmd = '';

        if (detail.regSeCd === '0' || detail.regSeCd === '1') {
          
          const tempEndYmd = dateToString(addDays(new Date(getDateFormatYMD(detail.regSeCdAcctoYmd)), 14));
          
          if (tempEndYmd < detail.cardFrstUseYmd) {
            endYmd = tempEndYmd;	
          } else {
            endYmd = detail.cardFrstUseYmd;
          }
        }
        
        if (detail.regSeCd === '3') {
          endYmd = detail.cardFrstUseYmd;
        }
        
        if (detail.regSeCd === '4') {
          
          if (detail.regSeCdAcctoEndYmd < detail.rcptYmd) {
            endYmd = detail.regSeCdAcctoEndYmd;
          } else {
            endYmd = detail.rcptYmd;
          }
        }

        const tempDate = new Date(getDateFormatYMD(detail.rcptYmd));
        const tempRcptYmd = dateToString(new Date(tempDate.setMonth(tempDate.getMonth() - 2)))
        
        if (endYmd < tempRcptYmd || detail.regSeCdAcctoYmd > detail.rcptYmd) {
          result = '서면신청 가능한 기간이 없습니다.';
        } else {

          if (detail.regSeCdAcctoYmd < tempRcptYmd) {
            bgngYmd = tempRcptYmd;
          } else {
            bgngYmd = detail.regSeCdAcctoYmd;
          }			

          result = '* 서면신청 가능기간 : ' + getDateFormatYMD(bgngYmd) + ' ~ ' + getDateFormatYMD(endYmd);                           
        }        
      }
    }

    setCardUseDate(result);
  }

  const fn_setChuseYMD = () => {

    let result = '';
    const agncyDrvBgngYmd = detail.agncyDrvBgngYmd;
    const agncyDrvEndYmd = detail.agncyDrvEndYmd;

    if (agncyDrvBgngYmd && agncyDrvEndYmd) {
      result = "* 대리운전기간 : " + getDateFormatYMD(agncyDrvBgngYmd) + ' ~ ' + getDateFormatYMD(agncyDrvEndYmd);
    }

    setChuseYMD(result);
  }

  return (
    <BlankCard className="contents-card" title="상세 정보"
      buttons={[
        {
          label: '지급확정',
          onClick: () => saveData(),
          color: 'outlined',
        },            
      ]}
    >
      <>
        {cardUseDate ? (
          <Box mb={1} color={'#f44336'}>
            {cardUseDate}
          </Box>
        ) : null}

        {chuseYMD ? (
          <Box mb={1} color={'#f44336'}>
            {chuseYMD}
          </Box>
        ) : null}
        
        {/* 테이블영역 시작 */}
        {tabIndex === '0' ? (
          <PublicDataGrid 
            detail={detail}
          />
        ) : (
          <PrivateDataGrid 
            detail={detail}
          />
        )}
      </>
    </BlankCard>
  )
}

export default DetailDataGrid

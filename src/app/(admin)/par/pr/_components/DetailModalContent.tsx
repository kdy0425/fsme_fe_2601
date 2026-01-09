import { sendHttpRequest } from '@/utils/fsms/common/apiUtils';
import { CustomFormLabel, CustomRadio } from '@/utils/fsms/fsm/mui-imports';
import { Box, Button, FormControlLabel, RadioGroup } from '@mui/material';
import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Row } from '../page';
import TableDataGrid from '@/app/components/tables/CommDataGrid2';
import { getExcelFile, getToday, openReport } from '@/utils/fsms/common/comm';
import { parPrRfidDtlTrHeadCells, parPrDealDtlTrHeadCells  } from '@/utils/fsms/headCells'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

interface ModalContentProps {
  dataSeCd: string
  detail: Row | null
}

const DetailModalContent = forwardRef((props: ModalContentProps, forwardRef) => {
  const {detail, dataSeCd} = props;
  const [rows , setRows] = useState<Row[]>([]);
  //const [remoteFlag, setRemoteFlag] = useState<boolean | undefined>(undefined);
  const [loading, setLoading] = useState(false) // 로딩여부
  const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 로딩상태
  
  const [params, setParams] = useState({
    locgovCd: detail?.locgovCd,
    crno: detail?.crno,
    vhclNo: detail?.vhclNo,
    lbrctYm: detail?.lbrctYm,
    vonrBrno: detail?.vonrBrno,
    giveCfmtnYn: '',
    searchType: 'vhclNo',
    clclnYm: detail?.clclnYm
  });

  const fetchData = async () => {
    
    try {
      setLoading(true)

      let endpoint: string =
      dataSeCd == 'RFID' ? `/fsm/par/pr/tr/getAllDelngPapersReqstRfid?` +
      `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` + 
      `${params.lbrctYm ? '&lbrctYm=' + params.lbrctYm : ''}` +
      `${params.searchType == 'brno' && params.crno ? '&crno=' + params.crno : ''}` +
      `${params.searchType == 'vhclNo' && params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
      `${params.giveCfmtnYn ? '&giveCfmtnYn=' + params.giveCfmtnYn : ''}`
      :
      `/fsm/par/pr/tr/getAllDelngPapersReqstDealCnfirm?` +
      `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
      `${params.clclnYm ? '&clclnYm=' + params.clclnYm : ''}` +
      `${params.searchType == 'brno' && params.vonrBrno ? '&vonrBrno=' + params.vonrBrno : ''}` +
      `${params.searchType == 'vhclNo' && params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
      `${params.giveCfmtnYn ? '&giveCfmtnYn=' + params.giveCfmtnYn : ''}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        setRows(response.data)
      } else {
        // 데이터가 없거나 실패
        alert(response.message)
        setRows([])
      }  
    }catch (error) {
    // 에러시
    console.error('Error fetching data:', error)
    setRows([])
    }finally{
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData();
  }, [params.searchType, params.giveCfmtnYn])

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const {name, value} = event.target

    setParams(prev => ({ ...prev, [name]: value }));
  }

  const excelDownload = async () => {

    if (rows.length == 0) {
      alert('엑셀파일을 다운로드할 데이터가 없습니다.')
      return
    }
      
    try{
      setLoadingBackdrop(true)

      let endpoint: string =
        dataSeCd == 'RFID' ? `/fsm/par/pr/tr/getExcelDelngPapersReqstRfid?` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` + 
        `${params.lbrctYm ? '&lbrctYm=' + params.lbrctYm : ''}` +
        `${params.searchType == 'brno' && params.crno ? params.crno : ''}` +
        `${params.searchType == 'vhclNo' && params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
        `${params.giveCfmtnYn ? '&giveCfmtnYn=' + params.giveCfmtnYn : ''}`
        :
        `/fsm/par/pr/tr/getExcelDelngPapersReqstDealCnfirm?` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.clclnYm ? '&clclnYm=' + params.clclnYm : ''}` +
        `${params.searchType == 'brno' && params.vonrBrno ? '&vonrBrno=' + params.vonrBrno : ''}` +
        `${params.searchType == 'vhclNo' && params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
        `${params.giveCfmtnYn ? '&giveCfmtnYn=' + params.giveCfmtnYn : ''}`

      let excelNm = dataSeCd == 'RFID' ? '자가주유상세내역_' : '카드거래상세내역_'

      await getExcelFile(endpoint, excelNm + getToday()+'.xlsx')
    }catch(error){

    }finally{
      setLoadingBackdrop(false)
    }
  }

  const submitExcel = (event: React.FormEvent) => {
    event.preventDefault();
    event.stopPropagation();

    excelDownload();
  }

  // 부모 컴포넌트가 호출할 수 있는 메서드 설정
  useImperativeHandle(forwardRef, () => ({
    childPrintClickHandler,
  }));

  // 자식 컴포넌트 이벤트 함수
  const childPrintClickHandler = async() => {

    if (rows.length == 0) {
      alert('출력 할 데이터가 없습니다.')
      return
    }

    try {
      setLoadingBackdrop(true)

      let endpoint: string = 
        dataSeCd == 'RFID' ? `/fsm/par/pr/tr/printDtstmnPapersReqstRfid?` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` + 
        `${params.lbrctYm ? '&lbrctYm=' + params.lbrctYm : ''}` +
        `${params.searchType == 'brno' && params.crno ? params.crno : ''}` +
        `${params.searchType == 'vhclNo' && params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
        `${params.giveCfmtnYn ? '&giveCfmtnYn=' + params.giveCfmtnYn : ''}`
        :
        `/fsm/par/pr/tr/printDtstmnPapersReqstDealCnfirm?` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.clclnYm ? '&clclnYm=' + params.clclnYm : ''}` +
        `${params.searchType == 'brno' && params.vonrBrno ? '&vonrBrno=' + params.vonrBrno : ''}` +
        `${params.searchType == 'vhclNo' && params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
        `${params.giveCfmtnYn ? '&giveCfmtnYn=' + params.giveCfmtnYn : ''}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })

      const jsonData = { "papersReqstDelng" : response.data }
      if (response && response.resultType === 'success' && response.data) {
        handleReport(dataSeCd == 'RFID' ? "dtstmnPapersReqstRfid" : "dtstmnPapersReqstDealCnfirm", JSON.stringify(jsonData))

      } else {
        // 데이터가 없거나 실패
        alert(response.message)
      }

    }catch (error) {
      // 에러시
      console.error('Error fetching data:', error)
    }finally{
      setLoadingBackdrop(false)
    }
  }

  const handleReport = (crfName?: string, crfData?: any) => {
    openReport(crfName, crfData)
  }

  return (
    <Box style={{minWidth: 1200}}>
      <Box component="form" id="detail-modal" onSubmit={submitExcel}>
      <LoadingBackdrop open={loadingBackdrop} />
      <Box className="sch-filter-box" sx={{ mb: 2 }}>
        <div className="filter-form">
          <div className="form-group" style={{maxWidth:'30rem'}}>
            <CustomFormLabel className="input-label-display">
              대상선택
            </CustomFormLabel>
            <RadioGroup
              row
              id="chk"
              className="mui-custom-radio-group"
              onChange={handleSearchChange}
              value={params.searchType}
            >
              <FormControlLabel
                control={<CustomRadio id="chk_01" name="searchType" value="" />}
                label="전체"
              />
              <FormControlLabel
                control={<CustomRadio id="chk_02" name="searchType" value="crno" />}
                label="선택된 사업자"
              />
              <FormControlLabel
                control={<CustomRadio id="chk_02" name="searchType" value="vhclNo" />}
                label="선택된 차량"
              />
            </RadioGroup>
          </div>
        </div>
        <hr></hr>
        <div className="filter-form">
          <div className="form-group">
            <CustomFormLabel className="input-label-display">
              보조금 지급여부
            </CustomFormLabel>
            <RadioGroup
              row
              id="giveCfmtnYn"
              className="mui-custom-radio-group"
              onChange={handleSearchChange}
              value={params.giveCfmtnYn}
            >
              <FormControlLabel
                control={<CustomRadio id="giveCfmtnYn_01" name="giveCfmtnYn" value="" />}
                label="전체"
              />
              <FormControlLabel
                control={<CustomRadio id="giveCfmtnYn_02" name="giveCfmtnYn" value="N" />}
                label="미지급"
              />
              <FormControlLabel
                control={<CustomRadio id="giveCfmtnYn_02" name="giveCfmtnYn" value="Y" />}
                label="지급확정"
              />
            </RadioGroup>
          </div>
        </div>
      </Box>
      <TableDataGrid 
        headCells={dataSeCd == 'RFID' ? parPrRfidDtlTrHeadCells : parPrDealDtlTrHeadCells} 
        rows={rows} 
        loading={loading}
        onPaginationModelChange={()=>{}}
        onRowClick={()=>{}}
        paging={false}
      />
      </Box>
    </Box>
  );
})

export default DetailModalContent;
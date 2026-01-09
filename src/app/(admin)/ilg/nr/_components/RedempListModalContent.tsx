import {
  CustomFormLabel,
} from '@/utils/fsms/fsm/mui-imports'
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogProps,
} from '@mui/material'
import React, { useState, useEffect } from 'react'
import { HeadCell, Pageable2 } from 'table'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { getExcelFile, getToday } from '@/utils/fsms/common/comm'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import { Row } from '../page'
import { toQueryParameter } from '@/utils/fsms/utils'

interface RedempListModalProps {
  row:Row
  tabIndex: string
  detailOpen:boolean
  setDetailOpen:React.Dispatch<React.SetStateAction<boolean>>
}

const trHeadCells: HeadCell[] = [
  {
    id: 'vhclNo',
    numeric: false,
    disablePadding: false,
    label: '차량번호',
  },
  {
    id: 'vonrNm',
    numeric: false,
    disablePadding: false,
    label: '소유자명',
  },
  {
    id: 'cardNoS',
    numeric: false,
    disablePadding: false,
    label: '카드번호',
    format: 'cardNo',
  },
  {
    id: 'cardSeCd',
    numeric: false,
    disablePadding: false,
    label: '구분',
  },
  {
    id: 'aprvYn',
    numeric: false,
    disablePadding: false,
    label: '거래구분',
  },
  {
    id: 'aprvAmt',
    numeric: false,
    disablePadding: false,
    label: '승인금액',
    format: 'number',
    align: 'td-right',
  },
  {
    id: 'useLiter',
    numeric: false,
    disablePadding: false,
    label: '사용리터',
    format: 'lit',
    align: 'td-right'
  },
  {
    id: 'asstAmt',
    numeric: false,
    disablePadding: false,
    label: '보조금액',
    format: 'number',
    align: 'td-right',
  },
  {
    id: 'asstAmtLiter',
    numeric: false,
    disablePadding: false,
    label: '보조리터',
    format: 'lit',
    align: 'td-right',
  },
  {
    id: 'sbtrRdmAmt',
    numeric: false,
    disablePadding: false,
    label: '환수금액',
    format: 'number',
    align: 'td-right',
  },
  {
    id: 'aprvYmdTm',
    numeric: false,
    disablePadding: false,
    label: '승인일시',
    format: 'yyyymmddhh24miss'
  },
  {
    id: 'aprvNo',
    numeric: false,
    disablePadding: false,
    label: '승인번호',
  },
  {
    id: 'frcsNm',
    numeric: false,
    disablePadding: false,
    label: '가맹점명',
  },
]

const txHeadCells: HeadCell[] = [
  {
    id: 'colorGb',
    numeric: false,
    disablePadding: false,
    label: '승인구분'
  },
  {
    id: 'vhclNo',
    numeric: false,
    disablePadding: false,
    label: '차량번호',
  },
  {
    id: 'flnm',
    numeric: false,
    disablePadding: false,
    label: '소유자명',
  },
  {
    id: 'crdcoNm',
    numeric: false,
    disablePadding: false,
    label: '카드사',
  },
  {
    id: 'cardNoS',
    numeric: false,
    disablePadding: false,
    label: '카드번호',
    format: 'cardNo',
  },
  {
    id: 'aprvAmt',
    numeric: false,
    disablePadding: false,
    label: '승인금액',
    format: 'number',
    align: 'td-right',
  },
  {
    id: 'sumNtsRmbrAmt',
    numeric: false,
    disablePadding: false,
    label: '국세청보조금',
    format: 'number',
    align: 'td-right'
  },
  {
    id: 'moliatAsstAmt',
    numeric: false,
    disablePadding: false,
    label: '국토부보조금',
    format: 'number',
    align: 'td-right',
  },
  {
    id: 'moliatUseLiter',
    numeric: false,
    disablePadding: false,
    label: '국토부사용리터',
    format: 'lit',
    align: 'td-right',
  },
  {
    id: 'rdmAmt',
    numeric: false,
    disablePadding: false,
    label: '환수금액',
    format: 'number',
    align: 'td-right',
  },
  {
    id: 'aprvYmdTm',
    numeric: false,
    disablePadding: false,
    label: '승인일시',
    format: 'yyyymmddhh24miss'
  },
  {
    id: 'aprvNo',
    numeric: false,
    disablePadding: false,
    label: '승인번호',
  },
  {
    id: 'frcsNm',
    numeric: false,
    disablePadding: false,
    label: '가맹점명',
  },
]

interface DetailRows {
  vhclNo?: string
  vonrNm?: string
  crdcoNm?: string
  crdcoCd?: string
  cardNo?: string
  cardNoS?: string
  aprvYmd?: string
  aprvTm?: string
  aprvYmdTm?: string
  aprvAmt?: string
  useLiter?: string
  asstAmt?: string
  asstAmtLiter?: string
  sbrtRdmAmt?: string
  frcsNm?: string
  frcsCdNo?: string
  cardSeCd?: string
  cardSttsCd?: string
  origTrauTm?: string
  orgAprvYmdTm?: string
  subsGb?: string
  colorGb?: string
  rdmAmt?: string
  moliatAsstAmt?: string
  moliatUseLiter?: string
  sumNtsRmbrAmt?: string
}

// 목록 조회시 필요한 조건
  type listSearchObj = {
    page: number
    size: number
    [key: string]: string | number // 인덱스 시그니처 추가
  }

const RedempListModalForm = (props: RedempListModalProps) => {
  const { row, tabIndex, detailOpen, setDetailOpen } = props;
  
  const [flag, setFlag] = useState<boolean|null>(null);
  const [rows, setRows] = useState<DetailRows[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingBackdrop, setLoadingBackdrop] = useState(false) // back로딩상태

  const [params, setParams] = useState<listSearchObj>({
    page: 1, // 페이지 번호는 1부터 시작
    size: 10, // 기본 페이지 사이즈 설정
    locgovCd:'',
    vhclNo:'',
    sn:''
  })

  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1
  })

  useEffect(() => {
    if (detailOpen) {
      setParams((prev) => ({
        ...prev
        , locgovCd:row.locgovCd
        , vhclNo:row.vhclNo
        , sn:row.sn
      }));
      setFlag(prev => !prev);
    }
  }, [detailOpen])

  useEffect(() => {
    if (flag != null) {
      fetchData();
    }
  }, [flag])

  const fetchData = async () => {

    setLoading(true)
    
    try {
      
      let endpoint: string = ''

      if (tabIndex === '0') {        
        endpoint = '/fsm/ilg/nr/tr/getAllDdctNpymRedemp' + toQueryParameter(params);
      } else {
        endpoint = '/fsm/ilg/nr/tx/getAllDdctNpymRedemp' + toQueryParameter(params);        
      }

      const response = await sendHttpRequest('GET', endpoint, null, true, { cache: 'no-store' });

      if (response && response.resultType === 'success' && response.data.content.length !== 0) {
        let responseData
        if (tabIndex === '0') {
          responseData = response.data.content.map((item: any) => ({
            ...item,
            color: item.colorGb === '일반' ? 'black'
                 : item.colorGb === '취소' ? 'blue'
                 : 'black'
          }));
        }else{
          responseData = response.data.content.map((item: any) => ({
            ...item,
            color: item.colorGb === '일반' ? 'black'
                 : item.colorGb === '일반소급' ? 'blue'
                 : (item.colorGb === '취소' || item.colorGb === '거절' ||
                    item.colorGb === '매입취소' || item.colorGb === '환수소급'
                   ) ? 'red'
                 : 'black'
          }));
        }

        setRows(responseData)
        setTotalRows(response.data.totalElements)
        setPageable({
            pageNumber: response.data.pageable.pageNumber + 1,
            pageSize: response.data.pageable.pageSize,
            totalPages: response.data.totalPages,
        })
      } else {
        setRows([])
        setTotalRows(0)
        setPageable({
            pageNumber: 1,
            pageSize: 10,
            totalPages: 1,
        })
      }
    } catch (error) {
      setRows([])
      setTotalRows(0)
      setPageable({
          pageNumber: 1,
          pageSize: 10,
          totalPages: 1,
      })
    } finally { 
      setLoading(false)      
    }
  }

  const excelDownload = async () => {

    if (rows.length === 0) {
      alert('엑셀파일을 다운로드할 데이터가 없습니다.')
      return
    }

    try{
      setLoadingBackdrop(true);

      let endpoint: string = ''

      if (tabIndex === '0') {
        endpoint = '/fsm/ilg/nr/tr/getExcelDdctNpymRedemp' + toQueryParameter(params);
      } else {
        endpoint = '/fsm/ilg/nr/tx/getExcelDdctNpymRedemp' + toQueryParameter(params);        
      }

      await getExcelFile(endpoint, "환수금차감내역_" + getToday() + ".xlsx")
    }catch(error){
      console.error('ERROR :: ', error)
    }finally{
      setLoadingBackdrop(false);
    }
  }

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handlePaginationModelChange = (page: number, pageSize: number) => {
    setParams((prev) => ({
      ...prev,
      page: page, // 실제 DB에서 조회시 -1을 하므로 +1 추가해서 넘겨야함. 페이지는 1로 보이지만 DB에선 0으로 조회
      size: pageSize,
    }))
    setFlag(!flag)
  }

  return (
    <Box>
      <Dialog
        fullWidth={false}
        maxWidth={'xl'}
        open={detailOpen}
      >
        <DialogContent>          
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              <h2>환수금 차감내역 조회</h2>
            </CustomFormLabel>
            {tabIndex === '0' ? (
            <>
              <Box style={{ display: 'flex', padding: '1rem 1rem', gap: '1rem' }}>
                <span style={{ margin: 'auto' }}>■ 일반거래</span>
                <span style={{ margin: 'auto', color: 'blue' }}>■ 취소거래</span>
              </Box>
            </>
            ) : (
            <>
              <Box style={{ display: 'flex', padding: '1rem 1rem', gap: '1rem' }}>
                <span style={{ margin: 'auto' }}>■ 일반거래</span>
                <span style={{ margin: 'auto', color: 'blue' }}>■ 소급거래</span>
                <span style={{ margin: 'auto', color: 'red' }}>■ 취소,거절,매입취소,환수소급거래</span>
              </Box>
            </>
            )}
            <div className="button-right-align">
              <Button variant="contained" color="success" onClick={(excelDownload)}>엑셀</Button>
              <Button variant="contained" color="dark" onClick={() => setDetailOpen(false)}>닫기</Button>
            </div>
          </Box>
          <Box>
            <TableDataGrid 
              headCells={tabIndex === '0' ? trHeadCells : txHeadCells}
              rows={rows}
              totalRows={totalRows}
              loading={loading}
              onPaginationModelChange={handlePaginationModelChange}
              pageable={pageable}
              paging={true}
              caption={"환수금 차감내역 목록 조회"}
            />
          </Box>
          <LoadingBackdrop open={loadingBackdrop} />
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default RedempListModalForm
  
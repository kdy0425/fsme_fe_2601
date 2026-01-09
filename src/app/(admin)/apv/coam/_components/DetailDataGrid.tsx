import FormDialog from '@/app/components/popup/FormDialog'
import BlankCard from '@/app/components/shared/BlankCard'
import { CommSelect } from '@/app/components/tx/commSelect/CommSelect'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { Box, Button, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import { useEffect, useState } from 'react'
import { getDateTimeString } from '../../../../../utils/fsms/common/util'
import { Row } from '../page'
import UserSearchModalContent from './UserSearchModalContent'
import CustomFormLabel from '@/app/components/forms/theme-elements/CustomFormLabel'

type DetailDataGridProps = {
  detail: Row
  reloadFn?: () => void
}

const DetailDataGrid = (props: DetailDataGridProps) => {
  const { detail, reloadFn } = props
  const [remoteFlag, setRemoteFlag] = useState<boolean>(false)
  const [params, setParams] = useState({
    frcsBrno: detail.frcsBrno,
    bltSn: detail.bltSn,    
    bltRmvRsnCd: "",
    bltSttsCd: detail.bltSttsCd,
    shFrcsCdNo: detail.shFrcsCdNo,
    kbFrcsCdNo: detail.kbFrcsCdNo,
    wrFrcsCdNo: detail.wrFrcsCdNo,
    ssFrcsCdNo: detail.ssFrcsCdNo,
    hdFrcsCdNo: detail.hdFrcsCdNo
  } );
  
  useEffect(() => {
    setParams({
      frcsBrno: detail.frcsBrno,
      bltSn: detail.bltSn,    
      bltRmvRsnCd: "",
      bltSttsCd: detail.bltSttsCd,
      shFrcsCdNo: detail.shFrcsCdNo,
      kbFrcsCdNo: detail.kbFrcsCdNo,
      wrFrcsCdNo: detail.wrFrcsCdNo,
      ssFrcsCdNo: detail.ssFrcsCdNo,
      hdFrcsCdNo: detail.hdFrcsCdNo
    })
  },[detail])

  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    
    setParams((prev) => ({ ...prev, [name]: value }))
  }

  const sendData = async () => {
    try {
      let endpoint: string = `/fsm/apv/coam/tr/updateDismissCousmOlt`;

      if(!params.bltRmvRsnCd) {
        alert('해제사유를 선택해야 합니다.')
        return;
      }

      const response = await sendHttpRequest('PUT', endpoint, params, true, {
        cache: 'no-store'
      })

      if(response && response.resultType == 'success') {
        alert(response.message);
        setRemoteFlag(false);
        reloadFn?.();
      }else{
        alert(response.message);
      }

    }catch(error) {
      console.error("ERROR :: ", error);
    }
  }

  const submitForm = async (event: React.FormEvent) => {
    event.preventDefault();
    event.stopPropagation();

    await sendData();
  }

  return (
    <Grid container spacing={2} className="card-container">
      <Grid item xs={12}>
        <BlankCard className="contents-card" title="상세 정보">
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginBottom: '12px',
              gap:'4px'
            }}
          >
            {detail.bltSttsCd !== '3' ? 
            <>
              <Button variant='outlined' onClick={() => setRemoteFlag(true)}>
                특별관리 해제
              </Button>
              <FormDialog
                buttonLabel={''}
                size={'lg'}
                title={'특별관리주유소해제'}
                formLabel='저장'
                formId='send-dismiss'
                remoteFlag={remoteFlag}
                closeHandler={() => setRemoteFlag(false)}
                children={
                <Box component='form' id='send-dismiss' onSubmit={submitForm}>
                  <TableContainer className="table-scrollable">
                  <Table className="table table-bordered">
                    <caption>상세 내용 시작</caption>
                    <TableHead style={{display:'none'}}>
                      <TableRow>
                        <TableCell className='td-head td-left'></TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell className='td-head td-left'>
                          해제사유
                        </TableCell>
                        <TableCell>
                          <CustomFormLabel className="input-label-none" htmlFor="sch-bltRmvRsnCd">해체사유</CustomFormLabel>
                          <CommSelect 
                            cdGroupNm={'081'} 
                            pValue={params.bltRmvRsnCd} 
                            handleChange={handleSearchChange} 
                            pName={'bltRmvRsnCd'} 
                            addText={'해제사유'}
                            htmlFor={'sch-bltRmvRsnCd'}
                          />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                  </TableContainer>
                </Box>
                }
              />
            </>
            : <></>}
            {detail.bltSttsCd !== '0' && detail.bltSttsCd !== '4' ? 
            <>
            <FormDialog
              buttonLabel={'이용자 조회'}
              size={'lg'}
              title={'이용자 조회'}
              submitBtn={false}
              varient='outlined'
              btnSet={
                <>
                  <Button variant='contained' color='success' type='submit' form='excel-download'>엑셀</Button>
                </>
              }
              children={
                <UserSearchModalContent 
                  data={detail}
                />
              }
            />
            </>
            : <></>}
          </div>
          <>
            {/* 테이블영역 시작 */}
            <div className="table-scrollable">
              <table className="table table-bordered">
                <caption>상세 내용 시작</caption>
                <colgroup>
                  <col style={{ width: '12%' }} />
                  <col style={{ width: '21%' }} />
                  <col style={{ width: '12%' }} />
                  <col style={{ width: '21%' }} />
                  <col style={{ width: '12%' }} />
                  <col style={{ width: '21%' }} />
                </colgroup>
                <tbody>
                  <tr>
                    <th className="td-head td-left" scope="row">
                      특별관리 발효(시작)일자
                    </th>
                    <td colSpan={1}>{getDateTimeString(detail['bltBgngYmd'], 'date')?.dateString}</td>
                    <th className="td-head td-left" scope="row">
                      특별관리 종료일자
                    </th>
                    <td colSpan={1}>{getDateTimeString(detail['bltEndYmd'], 'date')?.dateString}</td>
                    <th className="td-head td-left" scope="row">
                      상태
                    </th>
                    <td>{detail['bltSttsCdNm']}</td>
                  </tr>
                  <tr style={{height: '100px'}}> 
                    <th className="td-head td-left" scope="row">
                      특별관리 사유
                    </th>
                    <td colSpan={6} style={{wordBreak:'break-all'}}>{detail['bltRsnCn']}</td>
                  </tr>
                  <tr>
                    <th className="td-head td-left" scope="row">
                      신한 가맹점번호
                    </th>
                    <td colSpan={1}>{detail['shFrcsCdNo']}</td>
                    <th className="td-head td-left" scope="row">
                      kb 가맹점번호
                    </th>
                    <td colSpan={1}>{detail['kbFrcsCdNo']}</td>
                    <th className="td-head td-left" scope="row">
                      우리 가맹점번호
                    </th>
                    <td colSpan={1}>{detail['wrFrcsCdNo']}</td>
                  </tr>
                  <tr>
                    <th className="td-head td-left" scope="row">
                      삼성 가맹점번호
                    </th>
                    <td>{detail['ssFrcsCdNo']}</td>
                    <th className="td-head td-left" scope="row">
                      현대 가맹점번호
                    </th>
                    <td>{detail['hdFrcsCdNo']}</td>
                    <th className="td-head" scope="row"></th>
                    <td />
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        </BlankCard>
      </Grid>
    </Grid>
  )
}

export default DetailDataGrid

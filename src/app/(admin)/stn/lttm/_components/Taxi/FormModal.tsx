'use client'

import { CustomFormLabel } from '@/utils/fsms/fsm/mui-imports'
import { Button, Dialog, DialogContent, Box } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { getLocalGovCodes } from '@/utils/fsms/common/code/getCode'
import { isArray } from 'lodash'
import { getUserInfo } from '@/utils/fsms/utils'
import { VhclSearchModal, VhclRow } from '@/components/tx/popup/VhclSearchModal'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import { getFormatToday } from '@/utils/fsms/common/comm'
import { brNoFormatter, rrNoFormatter } from '@/utils/fsms/common/util'
import { createType } from '@/app/components/tx/localChangeModal/LocalChangeModal'

//차량 조회용
interface RowTrnsfrn {
  ctpvCd?: string //시도코드
  locgovCd?: string //관할관청코드
  vhclNo?: string //차량번호
  brno?: string //사업자등록번호
  locgovNm?: string //관할관청
  rprsvNm?: string //대표자명
  rprsvRrnoS?: string //대표자주민번호 암호화
  vhclSttsNm?: string //차량상태
  bzentyNm?: string //업체명
  exsLocgovNm?: string
  chgLocgovNm?: string
  koiNm?: string
  rprsvRrno?: string
  bzmnSeCd?: string
  // 이상하게 택시 차량 조회 파라미터정의서에 없는 것들 일단 넣어놈
  vonrNm?: string // 소유자명
  vonrRrno?: string // 주민등록번호
  vonrBrno?: string // 사업자등록번호
  koiCdNm?: string // 유종
  vhclTonCdNm?: string //  톤수
  lcnsTpbizCd?: string // 면허업종
  cmSttsNm?: string // 최종차량상태
  vhclPsnCd?: string // 차량소유구분
  bzmnSeNm?: string // 업종구분
}

interface locgovType {
  locgovCd:string
  locgovNm:string
  ctpvNm:string
}

interface FormModalProps {
  isOpen: boolean
  setOpen:React.Dispatch<React.SetStateAction<boolean>>
  reload: () => void
}

function FormModal(props: FormModalProps) {

  const { isOpen, setOpen, reload } = props

  const authInfo = getUserInfo();
  const [authLocgovCd, setAuthLocgovCd] = useState<string>('');
  const [localGovCode, setLocalGovCode] = useState<locgovType[]>([]) // 관할관청 코드
  const [locgovNm, setLocgvNm] = useState<string>('')
  const [ctpvNm, setCtpvNm] = useState<string>('')
  const [selectedRowTrnsfrn, setSelectedRowTrnsfrn] = useState<RowTrnsfrn>()
  const [vhclOpen, setVhclOpen] = useState(false)
  const [loadingBackdrop, setLoadingBackdrop] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setAuthLocgovCd(authInfo.locgovCd);
    }
  }, [isOpen])

  useEffect(() => {
    if (authLocgovCd) {
      settingData();
    }
  }, [authLocgovCd]);

  useEffect(() => {
    if (isArray(localGovCode) && localGovCode.length !== 0) {
      const matchedItem = localGovCode.find((item) => item.locgovCd === authLocgovCd);
      if (matchedItem) {
        setLocgvNm(matchedItem.locgovNm)
        setCtpvNm(matchedItem.ctpvNm)
      }
    }
  }, [localGovCode])

  const settingData = () => {
    if (authLocgovCd.includes('000')) {
      alert('지자체 담당자만 등록 가능합니다.');
      setOpen(false);
    } else {
      getLocalGovCodes().then((res) => {
        if (res) {
          setLocalGovCode(res);
        }
      });      
    }
  }

  // 행 클릭 시 호출되는 함수
  const handleRowClick = (vhclRow:VhclRow) => {
    if (vhclRow.locgovCd === authLocgovCd) {
      alert('전입관청과 전출관청이 동일합니다.')
    } else {
      setSelectedRowTrnsfrn(vhclRow);
      setVhclOpen(false); 
    }    
  }

  const validation = () => {
    if (!selectedRowTrnsfrn?.vhclNo) {
      alert('차량을 선택해주세요');
    } else if (!authLocgovCd) {
      alert('본인 지자체 정보가 로드되지 않아 등록 불가합니다.\n관리자에게 문의 부탁드립니다');
    } else if (authLocgovCd === selectedRowTrnsfrn?.locgovCd) {
      alert('전입관청과 전출관청이 동일합니다.')
    } else { 
      return true;  
    }
    return false;
  }

  const createTrnsfrnRequ = async () => {
    
    if (validation()) {

      if (confirm('전입등록 하시겠습니까?')) {

        try {
        
          setLoadingBackdrop(true);

          const endpoint:string = `/fsm/stn/lttm/tx/createLgovTrnsfrnRequst`

          const body: createType = {
            brno: selectedRowTrnsfrn?.brno ?? '',
            vhclNo: selectedRowTrnsfrn?.vhclNo ?? '',
            exsLocgovCd: selectedRowTrnsfrn?.locgovCd ?? '',
            chgLocgovCd: authLocgovCd ?? '',
            bzmnSeCd:selectedRowTrnsfrn?.bzmnSeCd ?? ''
          }
          
          const response = await sendHttpRequest('POST', endpoint, body, true, { cache: 'no-store' })

          if (response && response.resultType === 'success') {            
            alert(response.message);
            setOpen(false)
            reload();
          } else {
            alert(response.message);
          }
        } catch (error) {
          console.error(error)
        } finally {
          setLoadingBackdrop(false);
        }
      }
    }
  }

  return (
    <Box>
      <Dialog
        fullWidth={true}
        maxWidth="lg"
        open={isOpen}
      >
        <DialogContent>
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              <h2>전입등록</h2>
            </CustomFormLabel>
            <div className="button-right-align">
              <Button
                variant="contained"
                type="button"
                color="primary"
                onClick={() => createTrnsfrnRequ()}
              >
                저장
              </Button>
              <Button
                variant="contained"
                color="dark"
                onClick={() => setOpen(false)}
              >
                닫기
              </Button>
            </div>
          </Box>

          {/* 모달팝업 내용 시작 */}
          <div id="alert-dialog-description1">
            {/* 테이블영역 시작 */}
            <div className="table-scrollable">
              <table className="table table-bordered">
                <caption>상세 내용 시작</caption>
                <colgroup>
                  <col style={{ width: '13%' }}></col>
                  <col style={{ width: '20%' }}></col>
                  <col style={{ width: '13%' }}></col>
                  <col style={{ width: '20%' }}></col>
                  <col style={{ width: '13%' }}></col>
                  <col style={{ width: '20%' }}></col>
                </colgroup>
                <tbody>
                  <tr>
                    <th className="td-head" scope="row">
                      차량번호
                    </th>
                    <td>
                      <div
                        className="form-group"
                        style={{ width: '100%', whiteSpace: 'nowrap' }}
                      >
                        {selectedRowTrnsfrn?.vhclNo ?? ''}
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            width: '100%',
                          }}
                        >
                          <Button
                            onClick={() => setVhclOpen(true)}
                            variant="contained"
                            color="dark"
                          >
                            선택
                          </Button>
                        </Box>
                      </div>
                    </td>
                    <th className="td-head" scope="row">
                      업체명
                    </th>
                    <td>
                      {selectedRowTrnsfrn?.bzentyNm ?? ''}
                    </td>                    
                    <th className="td-head" scope="row">
                      사업자등록번호
                    </th>
                    <td>
                      {brNoFormatter(selectedRowTrnsfrn?.brno ?? '')}
                    </td>
                  </tr>

                  <tr>                    
                    <th className="td-head" scope="row">
                      면허업종
                    </th>
                    <td>
                      {selectedRowTrnsfrn?.bzmnSeNm ?? ''}
                    </td>
                    <th className="td-head" scope="row">
                      대표자명
                    </th>
                    <td>
                      {selectedRowTrnsfrn?.rprsvNm ?? ''}
                    </td>
                    <th className="td-head" scope="row">
                      대표자주민등록번호
                    </th>
                    <td>
                      {rrNoFormatter(selectedRowTrnsfrn?.rprsvRrnoS ?? '')}
                    </td>
                  </tr>

                  <tr>
                    <th className="td-head" scope="row">
                      관할관청
                    </th>
                    <td>
                      {selectedRowTrnsfrn?.locgovNm ?? ''}
                    </td>
                    <th className="td-head" scope="row">
                      차량상태
                    </th>
                    <td>
                      {selectedRowTrnsfrn?.cmSttsNm ?? ''}
                    </td>
                    <th className="td-head" scope="row">
                      유종
                    </th>
                    <td>
                      {selectedRowTrnsfrn?.koiNm ?? ''}
                    </td>
                  </tr>

                  <tr>                    
                    <th className="td-head" scope="row">
                      요청일자
                    </th>
                    <td>{getFormatToday()}</td>
                    <th className="td-head" scope="row">
                      전출관청
                    </th>
                    <td>
                      {selectedRowTrnsfrn?.locgovNm ?? ''}
                    </td>
                    <th className="td-head" scope="row">
                      전입관청
                    </th>
                    <td>{ctpvNm + ' ' + locgovNm}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            {/* 테이블영역 끝 */}
          </div>
          
          {vhclOpen ? (
            <VhclSearchModal
              onCloseClick={() => setVhclOpen(false)}
              onRowClick={handleRowClick}
              title="차량번호 조회"
              open={vhclOpen}
              pDisableSelectAll={true}
              isNotRollCheck={true}
            />
          ) : null}

          <LoadingBackdrop open={loadingBackdrop} />
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default FormModal

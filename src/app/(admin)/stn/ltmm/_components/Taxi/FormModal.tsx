'use client'

import { CustomFormLabel } from '@/utils/fsms/fsm/mui-imports'
import { Button, Dialog, DialogContent, Box } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { LocalSearchModal } from '@/app/components/tr/popup/LocalSearchModal'
import { useDispatch, useSelector } from 'react-redux'
import { openLocgovModal } from '@/store/popup/LocgovInfoSlice'
import { brNoFormatter, rrNoFormatter } from '@/utils/fsms/common/util'
import VhclSearchModal, { VhclRow } from '@/app/components/tx/popup/VhclSearchModal';
import { getFormatToday } from '@/utils/fsms/common/comm'
import { getUserInfo } from '@/utils/fsms/utils'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import { createType } from '@/app/components/tx/localChangeModal/LocalChangeModal'

/* 지자체변경 모달 */
import TxLocalSearchModal from '@/app/components/tx/popup/TxLocalSearchModal'
import { LocalSearchRow } from '@/app/components/tx/popup/TxLocalSearchModal'

//차량 조회용
interface RowTrnsfrn {
  ctpvCd?: string //시도코드
  locgovCd?: string //관할관청코드
  vhclNo?: string //차량번호
  brno?: string //사업자등록번호
  locgovNm?: string //관할관청
  rprsvNm?: string //대표자명
  cmSttsNm?: string //차량상태
  bzentyNm?: string //업체명
  exsLocgovNm?: string
  chgLocgovNm?: string
  koiNm?: string
  rprsvRrno?: string
  rprsvRrnoS?: string // 암호화 대표자 주민번호
  bzmnSeCd?: string
  bzmnSeNm?: string
  // 이상하게 택시 차량 조회 파라미터정의서에 없는 것들 일단 넣어놈
  vonrNm?: string // 소유자명
  vonrRrno?: string // 주민등록번호
  vonrBrno?: string // 사업자등록번호
  koiCdNm?: string // 유종
  vhclTonCdNm?: string //  톤수
  lcnsTpbizCd?: string // 면허업종
  vhclSttsCd?: string // 최종차량상태
  vhclPsnCd?: string // 차량소유구분
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
  const [selectedRowTrnsfrn, setSelectedRowTrnsfrn] = useState<RowTrnsfrn>()
  const [vhclOpen, setVhclOpen] = useState(false)
  const [loadingBackdrop, setLoadingBackdrop] = useState(false)

  const [locgov, setLocgov] = useState<LocalSearchRow>({
    ctpvCd: '',
    sggCd: '',
    ctpvNm: '',
    locgovNm: '',
    locgovCd: '',
  })
  
  // 지자체변경 모달 상태관리 변수
  const [locModalOpen, setLocModalOpen] = useState<boolean>(false);

  // 지자체 변경값 선택시 ( ** 미선택시에는 빈값 json 리턴 )
  const locgovModalRowClick = (row:LocalSearchRow) => {
    
    if (selectedRowTrnsfrn?.locgovCd === row.locgovCd) {
      alert('전입 관청과 전출 관청이 동일합니다.')
      return false;
    }

    setLocgov({
      ctpvCd: row.ctpvCd ?? '',
      sggCd: row.sggCd ?? '',
      ctpvNm: row.ctpvNm ?? '',
      locgovNm: row.locgovNm ?? '',
      locgovCd: row.locgovCd ?? '',
    })

    return true;
  };

  useEffect(() => {
    if (isOpen) {      
      setLocgov({
        ctpvCd: '',
        sggCd: '',
        ctpvNm: '',
        locgovNm: '',
        locgovCd: '',
      })
      setAuthLocgovCd(authInfo.locgovCd);
    }
  }, [isOpen])

  useEffect(() => {
    if (authLocgovCd && authLocgovCd.includes('000')) {
      alert('지자체 담당자만 등록 가능합니다.');
      setOpen(false);
    }
  }, [authLocgovCd]);

  // 행 클릭 시 호출되는 함수
  const handleRowClick = (vhclRow:VhclRow) => {
    if (vhclRow.locgovCd !== authLocgovCd) {
      alert('현재 관할 차량이 아닙니다.')
    } else if (vhclRow.locgovCd === locgov.locgovCd) {
      alert('전입 관청과 전출 관청이 동일합니다.')
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
    } else if (selectedRowTrnsfrn?.locgovCd === locgov.locgovCd) {
      alert('전입관청과 전출관청이 동일합니다.')
    } else if (selectedRowTrnsfrn?.locgovCd !== authLocgovCd) {
      alert('현재 관할 차량이 아닙니다.')
    } else if (!locgov.locgovCd) {
      alert('전입관청을 선택해주세요.')
    } else { 
      return true;  
    }
    return false;
  }

  const createTrnsfrnRequ = async () => {

    if (validation()) {

      if (confirm('전출등록 하시겠습니까?')) {

        try {

          setLoadingBackdrop(true);

          const endpoint: string = `/fsm/stn/ltmm/tx/createLgovMvtRequst`

          const body: createType = {
            brno: selectedRowTrnsfrn?.brno ?? '',
            vhclNo: selectedRowTrnsfrn?.vhclNo ?? '',
            exsLocgovCd: selectedRowTrnsfrn?.locgovCd ?? '',
            chgLocgovCd: locgov.locgovCd ?? '',
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
        maxWidth="lg" // 두 번째 모달은 더 큰 크기로 설정
        open={isOpen}
      >
        <DialogContent>
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              <h2>전출등록</h2>
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
                    <td>
                      <div
                        className="form-group"
                        style={{ width: '100%', whiteSpace: 'nowrap' }}
                      >
                        {locgov?.ctpvNm + ' ' + locgov?.locgovNm}
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            width: '100%',
                          }}
                        >
                          <div style={{ float: 'right' }}>
                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                width: '100%',
                              }}
                            >
                              <Button
                                style={{ float: 'right' }}
                                variant="contained"
                                color="dark"
                                onClick={() => setLocModalOpen(true)}
                              >
                                선택
                              </Button>
                            </Box>
                          </div>
                        </Box>
                      </div>
                      <LocalSearchModal />
                    </td>
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
            />
          ) : null}

          {/* 지자체 변경 모달 */}
          {locModalOpen ? (
            <TxLocalSearchModal
              open={locModalOpen}
              setOpen={setLocModalOpen}
              rowClick={locgovModalRowClick}
            />
          ) : null}

          <LoadingBackdrop open={loadingBackdrop} />
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default FormModal

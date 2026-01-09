import BlankCard from '@/app/components/shared/BlankCard'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { Button, Grid } from '@mui/material'
import React, { useEffect, useState, useContext } from 'react'
import { SelectItem } from 'select'
import { Row } from '../page'
import FormModal from './FormModal'
import DetailFormModal from './DetailFormModal'
import DetailModalContent from './DetailModalContent'
import ConfirmModalContent from './ConfrimModalContent'
import UserAuthContext from '@/app/components/context/UserAuthContext';


type DetailDataGridProps = {
  detail: Row | null
  koiCdItems: SelectItem[]
  bankCdItems: SelectItem[]
  vhclTonCdItems: SelectItem[]
  dataSeCd: string
  reloadFn?: () => void
}

const DetailDataGrid = (props: DetailDataGridProps) => {
  const { detail, koiCdItems, bankCdItems, vhclTonCdItems, dataSeCd, reloadFn } = props
  const { authInfo } = useContext(UserAuthContext);
  const [confirmRemoteFlag, setConfirmRemoteFlag] = useState<boolean>(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(true); // 버튼 깜박이 표시 여부

  // 깜박임 로직
  useEffect(() => {

    let interval: NodeJS.Timeout | null = null;

    if (detail?.asstGiveNotAmt && detail?.asstGiveNotAmt > 0) {
      interval = setInterval(() => {
        setIsConfirmVisible((prev) => !prev); // 텍스트 표시 여부 토글
      }, 500); // 500ms 간격
    } else {
      setIsConfirmVisible(true); // 깜박임이 꺼져 있을 때 항상 보이게
    }

    return () => {
      if (interval) clearInterval(interval); // 컴포넌트 언마운트 시 정리
    };
  }, [detail]);

  const cancel = async () => {
    await cancelData()
  }

  const cancelData = async () => {
    try {
      let endpoint: string = dataSeCd == 'RFID' ? `/fsm/par/pr/tr/cancelPapersReqstRfid` : `/fsm/par/pr/tr/cancelPapersReqstDealCnfirm`
      let body = dataSeCd == 'RFID' ? 
      {
        locgovCd:detail?.locgovCd ?? '',
        vhclNo: detail?.vhclNo ?? '',
        lbrctYm: detail?.lbrctYm ?? ''
       }
       :
       {
         vhclNo: detail?.vhclNo ?? '',
         clclnYm: detail?.clclnYm ?? ''
        }

      const response = await sendHttpRequest('PUT', endpoint, body, true, {
        cache: 'no-store',
      })

      if(!confirm("해당 서면신청건을 확정취소 하시겠습니까?")){
        return;
      }

      if (response && response.resultType === 'success') {
        // 데이터 조회 성공시
        alert(response.message)
        reloadFn?.()
      } else {
        // 데이터가 없거나 실패
        alert(response.message)
      }  
    }catch (error) {
    // 에러시
    console.error('Error fetching data:', error)
    }
  }

  const openConfirmModal = () => {
    if(dataSeCd == 'RFID') {
      if(detail?.aplySn != 0){
        alert('자가주유 온라인 지급신청 대상입니다.\n\n[RFID(자가주유) 지급신청]화면에서 지급확정 처리가 가능합니다.')
      }else{
        setConfirmRemoteFlag(true);  
      }
    }else{
      setConfirmRemoteFlag(true);  
    }
  }

  const reload = () => {
    setConfirmRemoteFlag(false);
    reloadFn?.();
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
            <>
              <DetailFormModal
                buttonLabel={dataSeCd == 'RFID' ? '자가주유 상세내역' : '카드거래 상세내역'}
                size={'xl'}
                title={dataSeCd == 'RFID' ? '자가주유 상세내역' : '카드거래 상세내역'}
                //content props
                detail={detail}
                dataSeCd={dataSeCd}
              />
              {detail?.asstGiveNotAmt ? 
                <>
                <Button 
                  variant='outlined'
                  onClick={() => openConfirmModal()}
                  sx={{
                    transition: 'opacity 0.3s ease',
                    opacity: isConfirmVisible ? 1 : 0, // 깜박임 상태에 따라 투명도 변경
                  }}
                >
                  지급확정
                </Button>
                <FormModal
                  buttonLabel={''}
                  size={'xl'}
                  title={dataSeCd == 'RFID' ? '자가주유 지급확정' : '거래확인 지급확정'}
                  formLabel='저장'
                  formId='confirm-modal'
                  remoteFlag={confirmRemoteFlag}
                  closeHandler={() => setConfirmRemoteFlag(false)}
                  children={<ConfirmModalContent 
                    locgovCd={detail?.locgovCd ?? ''}
                    bzentyNm={detail?.bzentyNm ?? ''}
                    vonrNm={detail?.vonrNm ?? ''}
                    crno={detail?.crno ?? ''}
                    clclnYm={detail?.clclnYm ?? ''}
                    vhclNo={detail?.vhclNo ?? ''}
                    lbrctYm={detail?.lbrctYm ?? ''}
                    dpstrNm={detail?.dpstrNm ?? ''}
                    vonrBrno={detail?.vonrBrno ?? ''}
                    bankCdItems={bankCdItems}
                    dataSeCd={dataSeCd} 
                    giveCfmtnYn={'N'} //미지급건만 조회함
                    // reload
                    reloadFn={reload}
                  />}
                />
                </>
              : ''
              }

              {/* 관리자권한일때만 취소가능 */}
              {authInfo && "roles" in authInfo && Array.isArray(authInfo.roles) && authInfo.roles[0] === "ADMIN" 
               && detail?.asstGiveNotAmt === 0 ?
              <Button
                variant="outlined"
                color="primary"
                style={{ marginLeft: '6px' }}
                onClick={() => cancel()}
              >
                확정취소
              </Button>
               : 
               null
              } 
            </>
          </div>
          <>
            {/* 테이블영역 시작 */}
            <div className="table-scrollable">
              <table className="table table-bordered">
                <caption>상세 내용 시작</caption>
                <colgroup>
                  <col style={{ width: '120px' }} />
                  <col style={{ width: 'auto' }} />
                  <col style={{ width: '120px' }} />
                  <col style={{ width: 'auto' }} />
                  <col style={{ width: '120px' }} />
                  <col style={{ width: 'auto' }} />
                </colgroup>
                <tbody>
                  <tr>
                    <th className="td-head" scope="row" style={{whiteSpace:'nowrap'}}>
                      차량번호
                    </th>
                    <td>{detail ? detail['vhclNo'] : ''}</td>
                    <th className="td-head" scope="row" style={{whiteSpace:'nowrap'}}>
                      법인등록번호
                    </th>
                    <td>{dataSeCd == 'RFID' ? detail?.crno ?? '' : detail?.vonrBrno ?? ''}</td>
                    <th className="td-head" scope="row" style={{whiteSpace:'nowrap'}}>
                      소유자명
                    </th>
                    <td>{dataSeCd == 'RFID' ? detail?.bzentyNm ?? '' : detail?.vonrNm ?? ''}</td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row" style={{whiteSpace:'nowrap'}}>
                      유종
                    </th>
                    <td>{detail ? koiCdItems.find(item => detail['koiCd']==item.value)?.label : ''}</td>
                    <th className="td-head" scope="row" style={{whiteSpace:'nowrap'}}>
                      톤수
                    </th>
                    <td>{detail ? vhclTonCdItems.find(item => detail['vhclTonCd']==item.value)?.label: ''}</td>
                    <th className="td-head" scope="row" style={{whiteSpace:'nowrap'}}>
                      
                    </th>
                    <td></td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row" style={{whiteSpace:'nowrap'}}>
                      예금주명
                    </th>
                    <td>{detail ? detail['dpstrNm'] : ''}</td>
                    <th className="td-head" scope="row" style={{whiteSpace:'nowrap'}}>
                      금융기관
                    </th>
                    <td>{detail ? bankCdItems.find(item => detail['bankCd']==item.value )?.label : ''}</td>
                    <th className="td-head" scope="row" style={{whiteSpace:'nowrap'}}>
                      
                    </th>
                    <td></td>
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

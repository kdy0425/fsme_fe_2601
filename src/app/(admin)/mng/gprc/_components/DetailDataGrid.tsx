import { Grid, Button } from '@mui/material'
import { Row } from '../page'
import BlankCard from '@/app/components/shared/BlankCard'
import { formatDate, formatKorYearMonth } from '@/utils/fsms/common/convert'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'

type DetailDataGridProps = {
  detail: Row
  reload: () => void
}

const DetailDataGrid = (props: DetailDataGridProps) => {
  const { detail, reload } = props

  const brNoFormatter = (brNo?: string) => {
    if (brNo && brNo.length == 10) {
      const brNo1 = brNo.substring(0, 3)
      const brNo2 = brNo.substring(3, 5)
      const brNo3 = brNo.substring(5, 10);
  
      return `${brNo1}-${brNo2}-${brNo3}`
    }
  }
  
  const rrNoFormatter = (rrNo?: string) => {
    if (rrNo) {
      // '-'가 있을 경우 호환을 위해 제거
      rrNo = rrNo.replaceAll('-', '')
  
      const rrNo1 = rrNo.substring(0, 6)
      const rrNo2 = rrNo.substring(6, 13)
  
      return `${rrNo1}-${rrNo2}`
    }
  }
  
  // 재정산요청
  const onClickReassessmentBtn = async (detail: Row) => {
    if (detail['prcsSttsNm'] === '정산완료') {
      let vhclNo = detail['vhclNo'];
      let clclnYm = formatKorYearMonth(detail['clclnYm']);
      const userConfirm = confirm(`${vhclNo} 차량의 ${clclnYm} 서면신청건 재정산요청을 진행하시겠습니까?`);
  
      if (!userConfirm) {
        return;
      } else {
        try {
          let body = {
            'clclnYm': detail['clclnYm'],
            'vhclNo': vhclNo,
            'locgovCd': detail['locgovCd'],
            'aplySn': detail['aplySn'] 
          }
    
          let endpoint: string = '/fsm/mng/gprc/tr/requestGnrlPaReqRecalcEx';
    
          const response = await sendHttpRequest('PUT', endpoint, body, true, {
            cache: 'no-store'
          })
    
          if (response && response.resultType === 'success') {
            // 성공
            alert(response.data);
            reload()
          } else {
            // 실패
            alert("실패 :: " + response.data);
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      }
    } else {
      alert("처리상태가 '정산완료'가 아닙니다.");
      return;
    }
  }
  
  // 정산취소요청
  const onClickSettleCancelBtn = async (detail: Row) => {
    if (detail['prcsSttsNm'] === '지급확정') {
      let vhclNo = detail['vhclNo'];
      let clclnYm = formatKorYearMonth(detail['clclnYm']);
      const userConfirm = confirm(`${vhclNo} 차량의 ${clclnYm} 서면신청건 정산취소요청을 진행하시겠습니까?`);
  
      if (!userConfirm) {
        return;
      } else {
        try {
          let body = {
            'clclnYm': detail['clclnYm'],
            'vhclNo': vhclNo,
            'locgovCd': detail['locgovCd'],
            'aplySn': detail['aplySn'] 
          }
    
          let endpoint: string = '/fsm/mng/gprc/tr/requestGnrlPaReqCancelEx';
    
          const response = await sendHttpRequest('PUT', endpoint, body, true, {
            cache: 'no-store'
          })
    
          if (response && response.resultType === 'success') {
            // 성공
            alert(response.data);
            reload()
          } else {
            // 실패
            alert("실패 :: " + response.data);
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      }
    } else {
      alert("처리상태가 '지급확정'이 아닙니다.");
      return;
    }
  }

  return (
    <Grid container spacing={2} className="card-container">
      <Grid item xs={12}>
        <BlankCard 
          className="contents-card" 
          title="상세 정보"
          buttons={[
            {
              label: '재정산요청',
              onClick: () => onClickReassessmentBtn(detail),
              color: 'outlined'
            },{
              label: '정산취소요청',
              onClick: () => onClickSettleCancelBtn(detail),
              color: 'outlined'
            }
          ]}>
          <>
            {/* 테이블영역 시작 */}
            <div className="table-scrollable">
              <table className="table table-bordered">
                <caption>상세 내용 시작</caption>
                <colgroup>
                  <col style={{ width: '100px' }} />
                  <col style={{ width: 'auto' }} />
                  <col style={{ width: '100px' }} />
                  <col style={{ width: 'auto' }} />
                  <col style={{ width: '150px' }} />
                  <col style={{ width: 'auto' }} />
                  <col style={{ width: '100px' }} />
                  <col style={{ width: 'auto' }} />
                </colgroup>
                <tbody>
                  <tr>
                    <th className="td-head" scope="row">차량번호</th>
                    <td>{detail['vhclNo']}</td>
                    <th className="td-head" scope="row">법인등록번호</th>
                    <td>{detail['crnoDe']}</td>
                    <th className="td-head" scope="row">사업자등록번호</th>
                    <td>{brNoFormatter(detail['vonrBrno'])}</td>
                    <th className="td-head" scope="row">주민등록번호</th>
                    <td>{rrNoFormatter(detail['vonrRrnoDeS'])}</td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">소유자명</th>
                    <td>{detail['vonrNm']}</td>
                    <th className="td-head" scope="row">구분</th>
                    <td>{detail['vhclPsnNm']}</td>
                    <th className="td-head" scope="row">유종</th>
                    <td>{detail['koiNm']}</td>
                    <th className="td-head" scope="row">톤수</th>
                    <td>{detail['vhclTonNm']}</td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">주유월</th>
                    <td>{formatKorYearMonth(detail['clclnYm'])}</td>
                    <th className="td-head" scope="row">유류사용량</th>
                    <td>{Number(detail['useLiter']).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}</td>
                    <th className="td-head" scope="row"></th>
                    <td></td>
                    <th className="td-head" scope="row"></th>
                    <td></td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">신청사유</th>
                    <td colSpan={7}>{detail['docmntAplyRsnCn']}</td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">예금주명</th>
                    <td>{detail['dpstrNm']}</td>
                    <th className="td-head" scope="row">금융기관</th>
                    <td colSpan={2}>{detail['bankNm']}</td>
                    <th className="td-head" scope="row">계좌번호</th>
                    <td colSpan={2}>{detail['actno']}</td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">정산리터</th>
                    <td>{Number(detail['tclmLiter']).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}</td>
                    <th className="td-head" scope="row">정산금액</th>
                    <td>{Number(detail['tclmAmt']).toLocaleString('ko-KR')}</td>
                    <th className="td-head" scope="row">지급확정일자</th>
                    <td>{formatDate(detail['giveCfmtnYmd'])}</td>
                    <th className="td-head" scope="row"></th>
                    <td></td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">등록자아이디</th>
                    <td>{detail['rgtrId']}</td>
                    <th className="td-head" scope="row">등록일자</th>
                    <td>{formatDate(detail['regDt'])}</td>
                    <th className="td-head" scope="row">수정자아이디</th>
                    <td>{detail['mdfrId']}</td>
                    <th className="td-head" scope="row">수정일자</th>
                    <td>{formatDate(detail['mdfcnDt'])}</td>
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

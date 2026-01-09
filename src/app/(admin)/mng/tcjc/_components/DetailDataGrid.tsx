import { Grid } from '@mui/material'
import { Row } from '../page'
import BlankCard from '@/app/components/shared/BlankCard'
import { getToday } from '@/utils/fsms/common/comm'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'


type DetailDataGridProps = {
  detail?: Row
  reload: () => void
}

const DetailDataGrid = (props: DetailDataGridProps) => {
  const { detail, reload } = props

  const brNoFormatter = (brNo?: string) => {
    if (brNo && brNo.length == 10) {
      const brNo1 = brNo.substring(0, 3)
      const brNo2 = brNo.substring(3, 5)
      const brNo3 = brNo.substring(5, 10)
  
      return `${brNo1}-${brNo2}-${brNo3}`
    }
  }

  const getDateTimeString = (
    DtString?: string,
    target?: 'date' | 'time' | 'mon',
  ) => {
    // yyyymmddhhmmss 형식을 yyyy-mm-dd / hh:mm:ss 형식으로 각각 반환함
    if (DtString && DtString.trim().length > 0) {
      if (DtString.length == 14) {
        let year = DtString.substring(0, 4)
        let month = DtString.substring(4, 6)
        let day = DtString.substring(6, 8)
  
        let hour = DtString.substring(8, 10)
        let minute = DtString.substring(10, 12)
        let seconds = DtString.substring(12, 14)
  
        let dateString = year + '-' + month + '-' + day
        let timeString = hour + ':' + minute + ':' + seconds
  
        return { dateString: dateString, timeString: timeString }
      } else if (target == 'mon') {
        let year = DtString.substring(0, 4)
        let month = DtString.substring(4, 6).padStart(2, '0')
  
        let dateString = year + '-' + month
  
        return { dateString: dateString, timeString: '' }
      } else if (target == 'date') {
        let year = DtString.substring(0, 4)
        let month = DtString.substring(4, 6)
        let day = DtString.substring(6, 8)
  
        let dateString = year + '-' + month + '-' + day
  
        return { dateString: dateString, timeString: '' }
      } else if (target == 'time') {
        let hour = DtString.substring(0, 2)
        let minute = DtString.substring(2, 4)
        let seconds = DtString.substring(4, 6)
  
        let timeString = hour + ':' + minute + ':' + seconds
  
        return { dateString: '', timeString: timeString }
      }
    } else {
      return { dateString: '', timeString: '' }
    }
  }

  const phoneNoFormatter = (phoneNo?: string) => {
    if (phoneNo?.length == 11) {
      return `${phoneNo.substring(0, 3)}-${phoneNo.substring(3, 7)}-${phoneNo.substring(7, 11)}`
    } else if (phoneNo?.length == 10) {
      return `${phoneNo.substring(0, 3)}-${phoneNo.substring(3, 6)}-${phoneNo.substring(6, 10)}`
    }
  }
  
  const restoreData = async (detail?: Row) => {
    const mdfcnDt = getDateTimeString(
      detail?.['mdfcnDt'],
      'date',
    )?.dateString.replaceAll('-', '')

    if(detail?.['prcsSttsCd'] === '00'){
      alert('심사요청 상태인 항목은 복원할 수 없습니다.');
      return
    }

    if (
      (detail?.['prcsSttsCd'] === '01' || detail?.['prcsSttsCd'] === '02') &&
      mdfcnDt === getToday() &&
      detail?.['trsmYn'] === 'N'
    ) {
      const userConfirm = confirm('해당 요청건을 심사요청 상태로 복원하시겠습니까?')
  
      if (!userConfirm) {
        return
      } else {
        try {
          let body = {
            vhclNo: detail?.['vhclNo'],
            vonrBrno: detail?.['vonrBrno'],
            dmndYmd: detail?.['dmndYmd'],
            crtrYmd: detail?.['crtrYmd'],
          }
  
          let endpoint: string = '/fsm/mng/tcjc/tr/recoveryTnkCpctyJdgmn'
  
          const response = await sendHttpRequest('PUT', endpoint, body, true, {
            cache: 'no-store',
          })
  
          if (response && response.resultType === 'success') {
            // 성공
            alert(response.data)
            reload()
          } else {
            // 실패
            alert(response.message)
          }
        } catch (error) {
          // 에러시
          console.error('Error fetching data:', error)
        }
      }
    } else {
      alert('당일 처리건만 복원이 가능합니다.')
      return
    }
  }

  return (
    <Grid container spacing={2} className="card-container">
      <Grid item xs={12}>
        <BlankCard className="contents-card" 
          title="상세 정보"
          buttons={[
            {
              label: '복원',
              onClick: () => restoreData(detail),
              color: 'outlined'
            }
          ]}
        >
          {/* 
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginBottom: '12px',
            }}
          >
            <Button
              variant="contained"
              color="dark"
              style={{ marginLeft: '6px' }}
              onClick={() => restoreData(detail)}
            >
              복원
            </Button>
          </div>
          */}
          {/* 테이블영역 시작 */}
          <div className="table-scrollable">
            <table className="table table-bordered">
              <caption>상세 내용 시작</caption>
              <colgroup>
                <col style={{ width: '150px' }} />
                <col style={{ width: 'auto' }} />
                <col style={{ width: '150px' }} />
                <col style={{ width: 'auto' }} />
                <col style={{ width: '150px' }} />
                <col style={{ width: 'auto' }} />
                <col style={{ width: '150px' }} />
                <col style={{ width: 'auto' }} />
              </colgroup>
              <tbody>
                <tr>
                  <th className="td-head" scope="row">
                    처리상태
                  </th>
                  <td>{detail?.['prcsSttsCdNm']}</td>
                  <th className="td-head" scope="row">
                    차량번호
                  </th>
                  <td>{detail?.['vhclNo']}</td>
                  <th className="td-head" scope="row">
                    소유자명
                  </th>
                  <td>{detail?.['vonrNm']}</td>
                  <th className="td-head" scope="row">
                    사업자등록번호
                  </th>
                  <td>{brNoFormatter(detail?.['vonrBrno'])}</td>
                </tr>
                <tr>
                  <th className="td-head" scope="row">
                    관할관청
                  </th>
                  <td>{detail?.['locgovNm']}</td>
                  <th className="td-head" scope="row">
                    연락처
                  </th>
                  <td>{phoneNoFormatter(detail?.['mbtlnum'])}</td>
                  <th className="td-head" scope="row">
                    톤수
                  </th>
                  <td>{detail?.['vhclTonCdNm']}</td>
                  <th className="td-head" scope="row">
                    차량형태
                  </th>
                  <td>{detail?.['vhclSttsCd']}</td>
                </tr>
                <tr>
                  <th className="td-head" scope="row">
                    차명
                  </th>
                  <td colSpan={3}>{detail?.['vhclNm']}</td>
                  <th className="td-head" scope="row">
                    요청일자
                  </th>
                  <td>
                    {getDateTimeString(detail?.['dmndYmd'], 'date')?.dateString}
                  </td>
                  <th className="td-head" scope="row">
                    처리일자
                  </th>
                  <td>
                    {getDateTimeString(detail?.['mdfcnDt'], 'date')?.dateString}
                  </td>
                </tr>
                <tr>
                  <th className="td-head" scope="row">
                    탱크용량변경일자
                  </th>
                  <td>
                    {getDateTimeString(detail?.['crtrYmd'], 'date')?.dateString}
                  </td>
                  <th className="td-head" scope="row">
                    변경전 탱크용량(ℓ)
                  </th>
                  <td>
                    {Number(detail?.['bfchgTnkCpcty']).toLocaleString(
                      undefined,
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      },
                    )}
                  </td>
                  <th className="td-head" scope="row">
                    변경후 탱크용량(ℓ)
                  </th>
                  <td>
                    {Number(detail?.['tnkCpcty']).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <th className="td-head" scope="row"></th>
                  <td />
                </tr>
                <tr>
                  <th className="td-head" scope="row">
                    탱크용량변경사유
                  </th>
                  <td colSpan={3}>{detail?.['chgRsnCnNm']}</td>
                  <th className="td-head" scope="row">
                    비고
                  </th>
                  <td colSpan={3}>{detail?.['rmrkCn']}</td>
                </tr>
                <tr>
                  <th className="td-head" scope="row">
                    탈락유형
                  </th>
                  <td colSpan={3}>{detail?.['flCdNm']}</td>
                  <th className="td-head" scope="row">
                    탈락사유
                  </th>
                  <td colSpan={4}>{detail?.['flRsnCn']}</td>
                </tr>
                <tr>
                  <th className="td-head" scope="row">
                    등록자아이디
                  </th>
                  <td>{detail?.['mdfrId']}</td>
                  <th className="td-head" scope="row">
                    등록일자
                  </th>
                  <td>
                    {getDateTimeString(detail?.['mdfcnDt'], 'date')?.dateString}
                  </td>
                  <th className="td-head" scope="row">
                    수정자아이디
                  </th>
                  <td>{detail?.['mdfrId']}</td>
                  <th className="td-head" scope="row">
                    수정일자
                  </th>
                  <td>
                    {getDateTimeString(detail?.['mdfcnDt'], 'date')?.dateString}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </BlankCard>
      </Grid>
    </Grid>
  )
}

export default DetailDataGrid

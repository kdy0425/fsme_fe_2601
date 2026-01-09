import { Grid, Button, Select } from '@mui/material'
import { Row } from './page'
import BlankCard from '@/app/components/shared/BlankCard'
import { getDateTimeString, phoneNoFormatter } from '@/utils/fsms/common/util'
import { formatDate } from '@/utils/fsms/common/convert'
import { getToday } from '@/utils/fsms/common/comm'
import { SelectItem } from 'select'
import FormDialog from './FormDialog'

type DetailDataGridProps = {
  detail: Row
  // locgovAprvYnItems: SelectItem[]
  onClickUpdateBtn: (row: Row, bzmnPrmsnYmd: string) => void // 허가일변경 버튼 action
}

const brNoFormatter = (brNo?: string) => {
  if (brNo && brNo.length == 10) {
    const brNo1 = brNo.substring(0, 3)
    const brNo2 = brNo.substring(3, 5)
    const brNo3 = brNo.substring(5, 10)

    return `${brNo1}-${brNo2}-${brNo3}`
  }
}

const DetailDataGrid = (props: DetailDataGridProps) => {
  const {
    detail,
    //  locgovAprvYnItems,
    onClickUpdateBtn,
  } = props

  // const getLocgovAprvYnLabel = (locgovAprvYn?: string) => {
  //   for (let i = 0; i < locgovAprvYnItems.length; i++) {
  //       if (locgovAprvYnItems[i].value === locgovAprvYn) {
  //           return locgovAprvYnItems[i].label
  //       }
  //   }
  // }

  return (
    <Grid container spacing={2} className="card-container">
      <Grid item xs={12}>
        <BlankCard className="contents-card" title="상세 정보">
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginBottom: '12px',
            }}
          >
            <FormDialog
              buttonLabel="허가일변경"
              title="허가일변경"
              detail={detail}
              onClickUpdateBtn={onClickUpdateBtn}
            />
          </div>
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
                  <col style={{ width: '100px' }} />
                  <col style={{ width: 'auto' }} />
                  <col style={{ width: '100px' }} />
                  <col style={{ width: 'auto' }} />
                </colgroup>
                <tbody>
                  <tr>
                    <th className="td-head" scope="row">
                      차량번호
                    </th>
                    <td>{detail['vhclNo']}</td>
                    <th className="td-head" scope="row">
                      소유자명
                    </th>
                    <td>{detail['vonrNm']}</td>
                    <th className="td-head" scope="row">
                      사업자등록번호
                    </th>
                    <td>{brNoFormatter(detail['vonrBrno'])}</td>
                    <th className="td-head" scope="row">
                      주민등록번호
                    </th>
                    <td>{detail['vonrRrnoS']}</td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">
                      법인등록번호
                    </th>
                    <td>{detail['brnoD']}</td>
                    <th className="td-head" scope="row">
                      연락처
                    </th>
                    <td>{phoneNoFormatter(detail['telno'])}</td>
                    <th className="td-head" scope="row">
                      유종
                    </th>
                    <td>{detail['koiNm']}</td>
                    <th className="td-head" scope="row">
                      톤수
                    </th>
                    <td>{detail['vhclTonNm']}</td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">
                      관할관청
                    </th>
                    <td>{detail['locgovNm']}</td>
                    <th className="td-head" scope="row">
                      차량소유구분
                    </th>
                    <td>{detail['vhclPsnNm']}</td>
                    <th className="td-head" scope="row">
                      업체명
                    </th>
                    <td>{detail['bzentyNm']}</td>
                    <th className="td-head" scope="row">
                      대표자명
                    </th>
                    <td>{detail['rprsvNm']}</td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">
                      카드사
                    </th>
                    <td>{detail['crdcoNm']}</td>
                    <th className="td-head" scope="row">
                      카드구분
                    </th>
                    <td>{detail['cardSeNm']}</td>
                    <th className="td-head" scope="row">
                      발급구분
                    </th>
                    <td>{detail['issuSeNm']}</td>
                    <th className="td-head" scope="row">
                      카드번호
                    </th>
                    <td>{detail['cardNoS']}</td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">
                      처리상태
                    </th>
                    <td>{detail['locgovAprvYnNm']}</td>
                    {/* <td>{getLocgovAprvYnLabel(detail['locgovPrvYn'])}</td> */}
                    <th className="td-head" scope="row">
                      처리일자
                    </th>
                    <td>{formatDate(detail['idntyYmd'])}</td>
                    <th className="td-head" scope="row">
                      기존카드말소여부
                    </th>
                    <td>{detail['reissueNm']}</td>
                    <th className="td-head" scope="row"></th>
                    <td></td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">
                      탈락유형
                    </th>
                    <td colSpan={3}>{detail['flRsnNm']}</td>
                    <th className="td-head" scope="row">
                      탈락사유
                    </th>
                    <td colSpan={3}>{detail['flRsnCn']}</td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">
                      허가일
                    </th>
                    <td>{formatDate(detail['bzmnPrmsnYmd']?.trim())}</td>
                    <th className="td-head" scope="row">
                      전송상태
                    </th>
                    <td>{detail['trsmYn']}</td>
                    <th className="td-head" scope="row"></th>
                    <td></td>
                    <th className="td-head" scope="row"></th>
                    <td></td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">
                      등록자아이디
                    </th>
                    <td>{detail['rgtrId']}</td>
                    <th className="td-head" scope="row">
                      등록일자
                    </th>
                    <td>{formatDate(detail['regDt'])}</td>
                    <th className="td-head" scope="row">
                      수정자아이디
                    </th>
                    <td>{detail['mdfrId']}</td>
                    <th className="td-head" scope="row">
                      수정일자
                    </th>
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

import { Grid, Button, Select } from '@mui/material'
import { Row } from '../page'
import BlankCard from '@/app/components/shared/BlankCard'
import { formatDate } from '@/utils/fsms/common/convert'

type DetailDataGridProps = {
  detail: Row
}

const brNoFormatter = (brNo?: string) => {
  if (brNo && brNo.length == 10) {
    const brNo1 = brNo.substring(0, 3)
    const brNo2 = brNo.substring(3, 5)
    const brNo3 = brNo.substring(5, 10)

    return `${brNo1}-${brNo2}-${brNo3}`
  }
}

const telnoFormatter = (value?: string) => {
  if (!value) {
    return ''
  }
  value.replaceAll('-', '')

  value = value.replace(/[^0-9]/g, '')

  let result = []
  let restNumber = ''

  // 지역번호와 나머지 번호로 나누기
  if (value.startsWith('02')) {
    // 서울 02 지역번호
    result.push(value.substr(0, 2))
    restNumber = value.substring(2)
  } else if (value.startsWith('1')) {
    // 지역 번호가 없는 경우
    // 1xxx-yyyy
    restNumber = value
  } else {
    // 나머지 3자리 지역번호
    // 0xx-yyyy-zzzz
    result.push(value.substr(0, 3))
    restNumber = value.substring(3)
  }

  if (restNumber.length === 7) {
    // 7자리만 남았을 때는 xxx-yyyy
    result.push(restNumber.substring(0, 3))
    result.push(restNumber.substring(3))
  } else {
    result.push(restNumber.substring(0, 4))
    result.push(restNumber.substring(4))
  }

  return result.filter((val) => val).join('-')
}

const DetailDataGrid = (props: DetailDataGridProps) => {
  const { detail } = props

  return (
    <Grid container spacing={2} className="card-container">
      <Grid item xs={12}>
        <BlankCard className="contents-card" title="상세 정보">
          <>
            {/* 테이블영역 시작 */}
            <div className="table-scrollable">
              <table className="table table-bordered">
                <caption>상세 내용 시작</caption>
                <colgroup>
                  <col style={{ width: '8%' }} />
                  <col style={{ width: 'auto' }} />
                  <col style={{ width: '8%' }} />
                  <col style={{ width: 'auto' }} />
                  <col style={{ width: '8%' }} />
                  <col style={{ width: 'auto' }} />
                  <col style={{ width: '8%' }} />
                  <col style={{ width: 'auto' }} />
                </colgroup>
                <tbody>
                  <tr>
                    <th
                      className="td-head"
                      scope="row"
                      style={{ textAlign: 'left' }}
                    >
                      차량정보
                    </th>
                    <td>{detail['vhclNo']}</td>
                    <th
                      className="td-head"
                      scope="row"
                      style={{ textAlign: 'left' }}
                    >
                      소유자명
                    </th>
                    <td>{detail['vonrNm']}</td>
                    <th
                      className="td-head"
                      scope="row"
                      style={{ textAlign: 'left' }}
                    >
                      주민사업자번호
                    </th>
                    <td>{detail['crno']}</td>
                    <th
                      className="td-head"
                      scope="row"
                      style={{ textAlign: 'left' }}
                    >
                      주민등록번호
                    </th>
                    <td>{detail['vonrRrnoSc']}</td>
                  </tr>
                  <tr>
                    <th
                      className="td-head"
                      scope="row"
                      style={{ textAlign: 'left' }}
                    >
                      관할관청
                    </th>
                    <td>{detail['locgovNm']}</td>
                    <th
                      className="td-head"
                      scope="row"
                      style={{ textAlign: 'left' }}
                    >
                      유종
                    </th>
                    <td>{detail['koiNm']}</td>
                    <th
                      className="td-head"
                      scope="row"
                      style={{ textAlign: 'left' }}
                    >
                      톤수
                    </th>
                    <td colSpan={3}>{detail['vhclTonNm']}</td>
                  </tr>
                  <tr>
                    <th
                      className="td-head"
                      scope="row"
                      style={{ textAlign: 'left' }}
                    >
                      사업자등록번호
                    </th>
                    <td>{brNoFormatter(detail['vonrBrno'])}</td>
                    <th
                      className="td-head"
                      scope="row"
                      style={{ textAlign: 'left' }}
                    >
                      업체명
                    </th>
                    <td colSpan={3}>{detail['bzentyNm']}</td>
                    <th
                      className="td-head"
                      scope="row"
                      style={{ textAlign: 'left' }}
                    >
                      대표자명
                    </th>
                    <td>{detail['rprsvNm']}</td>
                  </tr>
                  <tr>
                    <th
                      className="td-head"
                      scope="row"
                      style={{ textAlign: 'left' }}
                    >
                      면허업종구분
                    </th>
                    <td>{detail['lcnsTpbizNm']}</td>
                    <th
                      className="td-head"
                      scope="row"
                      style={{ textAlign: 'left' }}
                    >
                      사업자구분
                    </th>
                    <td>{detail['bzmnSeNm']}</td>
                    <th
                      className="td-head"
                      scope="row"
                      style={{ textAlign: 'left' }}
                    >
                      법인등록번호
                    </th>
                    <td>{detail['crnoEncpt']}</td>
                    <th
                      className="td-head"
                      scope="row"
                      style={{ textAlign: 'left' }}
                    >
                      연락처
                    </th>
                    <td>{telnoFormatter(detail['telno'])}</td>
                  </tr>
                  <tr>
                    <th
                      className="td-head"
                      scope="row"
                      style={{ textAlign: 'left' }}
                    >
                      처리상태
                    </th>
                    <td>{detail['prcsSttsNm']}</td>
                    <th
                      className="td-head"
                      scope="row"
                      style={{ textAlign: 'left' }}
                    >
                      심사일자
                    </th>
                    <td>{formatDate(detail['idntyYmd'])}</td>
                    <th
                      className="td-head"
                      scope="row"
                      style={{ textAlign: 'left' }}
                    >
                      RFID태그ID
                    </th>
                    <td colSpan={3}>{detail['rfidTagId']}</td>
                  </tr>
                  <tr>
                    <th
                      className="td-head"
                      scope="row"
                      style={{ textAlign: 'left' }}
                    >
                      탈락사유
                    </th>
                    <td colSpan={7}>{detail['flRsnCn']}</td>
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

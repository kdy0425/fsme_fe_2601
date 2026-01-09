import { formatDate } from '@/utils/fsms/common/convert'
import { Row } from '../../page'
import { brNoFormatter, rrNoFormatter, telnoFormatter } from '@/utils/fsms/common/util'
import { trim } from 'lodash'

type PublicTableProps = {
  detail: Row | null
}

const PublicDataGrid = (props: PublicTableProps) => {
  
  const { detail } = props
  
  return (
    <div className='table-scrollable'>
      <table className='table table-bordered'>
        <caption>상세 내용 시작</caption>
        <colgroup>
          <col style={{ width: '10%' }} />
          <col style={{ width: '13.5%' }} />
          <col style={{ width: '11%' }} />
          <col style={{ width: '14%' }} />
          <col style={{ width: '14%' }} />
          <col style={{ width: '14%' }} />
          <col style={{ width: '10%' }} />
          <col style={{ width: '13.5%' }} />
        </colgroup>
        <tbody>
          <tr>
            <th className='td-head' scope='row'>
              상호
            </th>
            <td>{detail?.flnm}</td>
            <th className='td-head' scope='row'>
              사업자등록번호
            </th>
            <td>{brNoFormatter(detail?.brno ?? '')}</td>
            <th className='td-head' scope='row'>
              대표자주민등록번호
            </th>
            <td>{rrNoFormatter(detail?.secureRrno ?? '')}</td>
            <th className='td-head' scope='row'>
              유종
            </th>
            <td>{detail?.koiNm}</td>
          </tr>
          <tr>
            <th className='td-head' scope='row'>
              주유·충전량
            </th>
            <td>
              {Number(detail?.qty).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </td>
            <th className='td-head' scope='row'>
              주유·충전금액
            </th>
            <td>{Number(detail?.useAmt).toLocaleString('ko-KR')}</td>
            <th className='td-head' scope='row'>
              보조금액
            </th>
            <td>{Number(detail?.moliatAsstAmt).toLocaleString('ko-KR')}</td>
            <th className='td-head' scope='row'>
              연락처
            </th>
            <td>{telnoFormatter(detail?.telno)}</td>
          </tr>
          <tr>
            <th className='td-head' scope='row'>
              금융기관
            </th>
            <td colSpan={3}>{detail?.bankNm}</td>
            <th className='td-head' scope='row'>
              계좌번호
            </th>
            <td>{detail?.actno}</td>
            <th className='td-head' scope='row'>
              예금주
            </th>
            <td>{detail?.dpstrNm}</td>
          </tr>
          <tr>
            <th className='td-head' scope='row'>
              등록구분
            </th>
            <td>{detail?.regSeCdNm}</td>
            <th className='td-head' scope='row'>
              {detail?.regSeCd === '0' ? (
                <>면허개시일</>                
              ) : (
                <>등록구분일자</>
              )}              
            </th>
            <td>{formatDate(trim(detail?.regSeCdAcctoYmd) ?? '')}</td>
            <th className='td-head' scope='row'>
              카드첫사용일
            </th>
            <td>{formatDate(trim(detail?.cardFrstUseYmd ?? ''))}</td>
            <th className='td-head' scope='row'>
              신청일자
            </th>
            <td>{formatDate(detail?.rcptYmd)}</td>
          </tr>
          <tr>
            <th className='td-head' scope='row'>
              서면신청사유
            </th>
            <td colSpan={5}>{detail?.docmntAplyRsnCn}</td>
            <th className='td-head' scope='row'>
              상태
            </th>
            <td>{detail?.giveYnNm}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default PublicDataGrid

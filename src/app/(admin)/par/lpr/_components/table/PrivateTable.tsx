import { formatDate } from '@/utils/fsms/common/convert'
import { Row } from '../../page'
import { brNoFormatter, rrNoFormatter, telnoFormatter } from '@/utils/fsms/common/util'
import { trim } from 'lodash'
import { useEffect, useState } from 'react'

type PrivateTableProps = {
  detail: Row | null
}

const PrivateDataGrid = (props: PrivateTableProps) => {
  
  const { detail } = props

  const [strText, setStrText] = useState<string>('');
  const [endText, setEndText] = useState<string>('');

  useEffect(() => {
    if (detail) {
      fn_setRegCDText();
    }
  }, [detail]);

  const fn_setRegCDText = () => {
    
    // M001 통장압류 추가로 통장압류시작일, 통장압류종료일 추가
    if (detail?.regSeCd === '0') {
      setStrText('면허개시일');
      setEndText('카드첫사용일');
    } else if (detail?.regSeCd === '1') {
      setStrText('분실훼손일');
      setEndText('카드첫사용일');
    } else if (detail?.regSeCd === '3') {
      setStrText('카드정지일');
      setEndText('카드첫사용일');
    } else if (detail?.regSeCd == '4') {	
      setStrText('압류 시작일');
      setEndText('압류 종료일');
    } else {
      setStrText('등록구분일자');
      setEndText('카드첫사용일');
    }  
  }

  return (
    <div className='table-scrollable'>
      <table className='table table-bordered'>
        <caption>상세 내용 시작</caption>
        <colgroup>
          <col style={{ width: '10%' }} />
          <col style={{ width: '13.5%' }} />
          <col style={{ width: '15%' }} />
          <col style={{ width: '14%' }} />
          <col style={{ width: '10%' }} />
          <col style={{ width: '14%' }} />
          <col style={{ width: '10%' }} />
          <col style={{ width: '13.5%' }} />
        </colgroup>
        <tbody>
          <tr>
            <th className='td-head' scope='row'>
              소유자명
            </th>
            <td>{detail?.flnm}</td>
            <th className='td-head' scope='row'>
              사업자등록번호
            </th>
            <td>{brNoFormatter(detail?.brno ?? '')}</td>
            <th className='td-head' scope='row'>
              주민등록번호
            </th>
            <td>{rrNoFormatter(detail?.secureRrno ?? '')}</td>
            <th className='td-head' scope='row'>
              원차주여부
            </th>
            <td>{detail?.agdrvrYnNm}</td>
          </tr>
          <tr>
            <th className='td-head' scope='row'>
              대리운전자성명
            </th>
            <td>{detail?.agdrvrNm}</td>
            <th className='td-head' scope='row'>
              대리운전자주민등록번호
            </th>
            <td>{detail?.secureAgdrvrRrno}</td>
            <th className='td-head' scope='row'>
              차량번호
            </th>
            <td>{detail?.vhclNo}</td>
            <th className='td-head' scope='row'>
              유종
            </th>
            <td>{detail?.koiNm}</td>
          </tr>
          <tr>
            <th className='td-head' scope='row'>
              주소
            </th>
            <td colSpan={7}>{detail?.addr}</td>
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
            <td colSpan={3}>{detail?.regSeCdNm}</td>
            <th className='td-head' scope='row'>
              {strText}
            </th>
            <td>{trim(formatDate(detail?.regSeCdAcctoYmd))}</td>
            <th className='td-head' scope='row'>
              {endText}
            </th>
            <td>
              {detail?.regSeCd === '4' ? (                
                <>{trim(formatDate(detail.regSeCdAcctoEndYmd))}</>
              ) : (
                <>{trim(formatDate(detail?.cardFrstUseYmd))}</>
              )}              
            </td>
          </tr>
          <tr>
            <th className='td-head' scope='row'>
              조합
            </th>
            <td>{detail?.pasctNm}</td>
            <th className='td-head' scope='row'>
              지부
            </th>
            <td>{detail?.asctNm}</td>
            <th className='td-head' scope='row'>
              신청일자
            </th>
            <td>{formatDate(detail?.rcptYmd)}</td>
            <th className='td-head' scope='row'>
              상태
            </th>
            <td>{detail?.giveYnNm}</td>
          </tr>
          <tr>
            <th className='td-head' scope='row'>
              서면신청사유
            </th>
            <td colSpan={7}>{detail?.docmntAplyRsnCn}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default PrivateDataGrid

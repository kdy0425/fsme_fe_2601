import React from 'react'

// MUI 그리드 한글화 import
import BlankCard from '@/app/components/shared/BlankCard'
import { formBrno } from '@/utils/fsms/common/convert'
import { getDateTimeString } from '@/utils/fsms/common/util'
import { Row } from './TxPage'
import { rrNoFormatter } from '@/utils/fsms/common/util'

interface DetailDataGridProps {
  row?: Row // row 속성을 선택적 속성으로 변경
}

const TxDetail: React.FC<DetailDataGridProps> = ({ row }) => {
  if (!row) return null // row가 없을 때 null 반환

  return (
    <BlankCard className="contents-card" title="상세 정보">
      <>
        {/* 테이블영역 시작 */}
        <div className="table-scrollable">
          <table className="table table-bordered">
            <caption>상세 내용 시작</caption>
            <colgroup>
              <col style={{ width: '10%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '15%' }} />
            </colgroup>
            <tbody>
              <tr>
                <th className="td-head" scope="row">
                  차량번호
                </th>
                <td>{row?.vhclNo}</td>
                <th className="td-head" scope="row">
                  소유자명
                </th>
                <td>{row?.vonrNm}</td>
                <th className="td-head" scope="row">
                  사업자등록번호
                </th>
                <td>{formBrno(row.vonrBrno)}</td>
                <th className="td-head" scope="row">
                  주민등록번호
                </th>
                <td>{rrNoFormatter(row?.vonrRrnoSe ?? '')}</td>
              </tr>
              <tr>
                <th className="td-head" scope="row">
                  지급정지시작일
                </th>
                <td>{getDateTimeString(row.bgngYmd, 'date')?.dateString}</td>
                <th className="td-head" scope="row">
                  지급정지종료일
                </th>
                <td colSpan={5}>
                  {getDateTimeString(row.endYmd, 'date')?.dateString}
                </td>
              </tr>

              <tr>
                <th className="td-head" scope="row">
                  지급정지사유
                </th>
                <td
                  colSpan={7}
                  style={{ whiteSpace: 'pre-wrap', height: '150px' }}
                >
                  {row?.chgRsnCn}
                </td>
              </tr>
              <tr>
                <th className="td-head" scope="row">
                  등록자아이디
                </th>
                <td>{row?.rgtrId}</td>
                <th className="td-head" scope="row">
                  등록일자
                </th>
                <td>
                  {getDateTimeString(row.regDt.trim(), 'date')?.dateString}
                </td>
                <th className="td-head" scope="row">
                  수정자아이디
                </th>
                <td>{row?.mdfrId}</td>
                <th className="td-head" scope="row">
                  수정일자
                </th>
                <td>
                  {getDateTimeString(row.mdfcnDt.trim(), 'date')?.dateString}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        {/* 테이블영역 끝 */}
      </>
    </BlankCard>
  )
}

export default TxDetail

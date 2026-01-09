import React, { useEffect, useState } from 'react'

import {
  Box,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
} from '@mui/material'
import { visuallyHidden } from '@mui/utils'
// MUI 그리드 한글화 import
import { createTheme, ThemeProvider, useTheme } from '@mui/material/styles'
import * as locales from '@mui/material/locale'
import { HeadCell } from 'table'
import { Row } from '../page'

import {
  getLabelFromCode,
  getNumtoWon,
  formatDate,
  formatKorYearMonth,
  formBrno,
  getNumtoWonAndDecimalPoint,
} from '@/utils/fsms/common/convert'
import BlankCard from '@/app/components/shared/BlankCard'
import { rrNoFormatter } from '@/utils/fsms/common/util'
type SupportedLocales = keyof typeof locales

// 페이지 정보
type pageable = {
  pageNumber: number
  pageSize: number
  sort: string
}

// 테이블 caption
const tableCaption: string = '전국표준한도관리 목록'

// 검색 결과 건수 툴바
function TableTopToolbar(props: Readonly<{ totalRows: number }>) {
  return (
    <div className="data-grid-top-toolbar">
      <div className="data-grid-search-count">
        검색 결과 <span className="search-count">{props.totalRows}</span>건
      </div>
    </div>
  )
}

// TableDataGrid의 props 정의
interface DetailDataGridProps {
  row?: Row // row 속성을 선택적 속성으로 변경
}

type order = 'asc' | 'desc'

const DetailDataGrid: React.FC<DetailDataGridProps> = ({ row }) => {
  if (!row) return null // row가 없을 때 null 반환

  const [selectedIndex, setSelectedIndex] = useState<number | null>()

  // MUI 그리드 한글화
  const locale: SupportedLocales = 'koKR'
  const theme = useTheme()
  const themeWithLocale = React.useMemo(
    () => createTheme(theme, locales[locale]),
    [locale, theme],
  )

  return (
    <Grid container spacing={2} className="card-container">
      <Grid item xs={12} sm={12} md={12}>
        <BlankCard className="contents-card" title="상세 정보">
          <>
            {/* 테이블영역 시작 */}
            <div className="table-scrollable">
              <table className="table table-bordered">
                <caption>상세 내용 시작</caption>
                <colgroup>
                  <col style={{ width: '12%' }} />
                  <col style={{ width: '13%' }} />
                  <col style={{ width: '12%' }} />
                  <col style={{ width: '13%' }} />
                  <col style={{ width: '12%' }} />
                  <col style={{ width: '13%' }} />
                  <col style={{ width: '12%' }} />
                  <col style={{ width: '13%' }} />
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
                      주민등록번호
                    </th>
                    <td>{rrNoFormatter(row.vonrRrnoS ?? ' ')}</td>
                    <th className="td-head" scope="row" colSpan={1}>
                      사업자등록번호
                    </th>
                    <td>{formBrno(row?.vonrBrno)}</td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">
                      법인등록번호
                    </th>
                    <td>{row?.crnoS}</td>
                    <th className="td-head" scope="row">
                      연락처
                    </th>
                    <td>{row?.telno}</td>
                    <th className="td-head" scope="row">
                      유종
                    </th>
                    <td>{row?.koiNm}</td>
                    <th className="td-head" scope="row">
                      톤수
                    </th>
                    <td>{row?.vhclTonNm ?? ' '}</td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">
                      차량소유구분
                    </th>
                    <td>{row?.vhclPsnNm}</td>
                    <th className="td-head" scope="row">
                      대표자명
                    </th>
                    <td>{row?.rprsvNm}</td>
                    <th className="td-head" scope="row">
                      업체명
                    </th>
                    <td colSpan={4}>{row?.bzentyNm}</td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">
                      카드사
                    </th>
                    <td>{row?.crdcoNm}</td>
                    <th className="td-head" scope="row">
                      카드구분
                    </th>
                    <td>{row?.cardSeNm}</td>
                    <th className="td-head" scope="row">
                      발급구분
                    </th>
                    <td>{row?.issuGbNm}</td>
                    <th className="td-head" scope="row">
                      카드번호
                    </th>
                    <td>{row?.cardNoS}</td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">
                      처리상태
                    </th>
                    <td>{row?.issuGbNm}</td>
                    <th className="td-head" scope="row">
                      처리일자
                    </th>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {/* 처리 일자 뭐 넣을지 에매함 row에서 */}
                      {formatDate(row?.idntyYmd ?? '')}
                    </td>
                    <th className="td-head" scope="row">
                      탈락유형
                    </th>
                    <td colSpan={4}>
                      {/* 탈락유형 뭐 넣을지 에매함 row에서 */}
                      {row?.errorNm}
                    </td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">
                      탈락사유
                    </th>
                    <td colSpan={3}>
                      {/* 탈락사유 뭐 넣을지 에매함 row에서 */}
                      {row?.errorNm}
                    </td>
                    <th className="td-head" scope="row">
                      등록자아이디
                    </th>
                    <td>{row?.rgtrId}</td>
                    <th className="td-head" scope="row">
                      등록일자
                    </th>
                    <td>{formatDate(row?.regDt ?? '')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            {/* 테이블영역 끝 */}
          </>
        </BlankCard>
      </Grid>
    </Grid>
  )
}

export default DetailDataGrid

import React from 'react'

import {
  Box,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material'
// MUI 그리드 한글화 import
import BlankCard from '@/app/components/shared/BlankCard'
import * as locales from '@mui/material/locale'
import { createTheme, useTheme } from '@mui/material/styles'
import {
  brNoFormatter,
  getDateTimeString,
} from '../../../../../utils/fsms/common/util'
import { Row } from '../page'

type SupportedLocales = keyof typeof locales

interface DetailDataGridProps {
  row: Row | null // row 속성을 선택적 속성으로 변경
}

type order = 'asc' | 'desc'

const DetailDataGrid: React.FC<DetailDataGridProps> = ({ row }) => {
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
            <Box className="table-scrollable">
              <Table className="table table-bordered">
                <caption>상세 내용 시작</caption>
                <TableHead style={{ display: 'none' }}>
                  <TableRow>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell
                      className="td-head td-left"
                      scope="row"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      사업자등록번호
                    </TableCell>
                    <TableCell colSpan={3}>
                      {brNoFormatter(String(row?.frcsBrno))}
                    </TableCell>
                    <TableCell
                      className="td-head td-left"
                      scope="row"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      가맹점명
                    </TableCell>
                    <TableCell colSpan={3}>{row?.frcsNm}</TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell
                      className="td-head td-left"
                      scope="row"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      주소
                    </TableCell>
                    <TableCell colSpan={7}>
                      {/* {`(${row.}) ${row?.daddr}`} */}
                      {row?.daddr}
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell
                      className="td-head td-left"
                      scope="row"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      설치구분
                    </TableCell>
                    <TableCell>
                      {row?.instlYn == 'Y'
                        ? '설치'
                        : row?.instlYn == 'N'
                          ? '미설치'
                          : ''}
                    </TableCell>
                    <TableCell
                      className="td-head td-left"
                      scope="row"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      설치일자
                    </TableCell>
                    <TableCell>
                      {row?.instlYmd
                        ? getDateTimeString(String(row?.instlYmd), 'date')
                            ?.dateString
                        : ''}
                    </TableCell>
                    <TableCell
                      className="td-head td-left"
                      scope="row"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      정유사
                    </TableCell>
                    <TableCell>{row?.ornCmpnyNmS}</TableCell>
                    <TableCell
                      className="td-head td-left"
                      scope="row"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      영업여부
                    </TableCell>
                    <TableCell>{row?.salsSeNm}</TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell
                      className="td-head td-left"
                      scope="row"
                      style={{ whiteSpace: 'nowrap', width: '12.5%' }}
                    >
                      등록자아이디
                    </TableCell>
                    <TableCell style={{ width: '12.5%' }}>
                      {row?.rgtrId}
                    </TableCell>
                    <TableCell
                      className="td-head td-left"
                      scope="row"
                      style={{ whiteSpace: 'nowrap', width: '12.5%' }}
                    >
                      등록일자
                    </TableCell>
                    <TableCell style={{ width: '12.5%' }}>
                      {
                        getDateTimeString(String(row?.regDt), 'date')
                          ?.dateString
                      }
                    </TableCell>
                    <TableCell
                      className="td-head td-left"
                      scope="row"
                      style={{ whiteSpace: 'nowrap', width: '12.5%' }}
                    >
                      수정자아이디
                    </TableCell>
                    <TableCell style={{ width: '12.5%' }}>
                      {row?.mdfrId}
                    </TableCell>
                    <TableCell
                      className="td-head td-left"
                      scope="row"
                      style={{ whiteSpace: 'nowrap', width: '12.5%' }}
                    >
                      수정일자
                    </TableCell>
                    <TableCell style={{ width: '12.5%' }}>
                      {
                        getDateTimeString(String(row?.mdfcnDt ?? ''), 'date')
                          ?.dateString
                      }
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>
            {/* 테이블영역 끝 */}
          </>
        </BlankCard>
      </Grid>
    </Grid>
  )
}

export default DetailDataGrid

import React from 'react'
import * as locales from '@mui/material/locale'
import { Row } from './TaxiPage'
import { createTheme, ThemeProvider, useTheme } from '@mui/material/styles'
import {
  CircularProgress,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material'
import { brNoFormatter, rrNoFormatter } from '@/utils/fsms/common/util'

type SupportedLocales = keyof typeof locales

interface TaxiDetailDataGridProps {
  hisRows?: Row[]
  loading: boolean
}

const TaxiDetailDataGrid: React.FC<TaxiDetailDataGridProps> = ({
  hisRows,
  loading,
}) => {
  if (hisRows === undefined) {
    hisRows = []
  }

  // MUI 그리드 한글화
  const locale: SupportedLocales = 'koKR'
  const theme = useTheme()
  const themeWithLocale = React.useMemo(
    () => createTheme(theme, locales[locale]),
    [locale, theme],
  )

  const compareVal = (bfVal?: string, afVal?: string) => {
    if (afVal != null) {
      if (afVal == '') return true
      else if (bfVal != afVal) return false
      else return true
    } else {
      return true
    }
  }

  return (
    <>
      <ThemeProvider theme={themeWithLocale}>
        <div className="data-grid-wrapper">
          <div className="table-scrollable">
            <table className="table table-bordered">
              <caption>차량비교정보 테이블</caption>
              <TableHead>
                <TableRow>
                  <TableCell style={{ whiteSpace: 'nowrap' }}>구분</TableCell>
                  <TableCell style={{ whiteSpace: 'nowrap' }}>
                    업체명(차주성명)
                  </TableCell>
                  <TableCell style={{ whiteSpace: 'nowrap' }}>
                    차량번호
                  </TableCell>
                  <TableCell style={{ whiteSpace: 'nowrap' }}>
                    사업자번호
                  </TableCell>
                  <TableCell style={{ whiteSpace: 'nowrap' }}>
                    주민(법인)번호
                  </TableCell>
                  <TableCell style={{ whiteSpace: 'nowrap' }}>유종</TableCell>
                  <TableCell style={{ whiteSpace: 'nowrap' }}>
                    지자체명
                  </TableCell>
                  <TableCell style={{ whiteSpace: 'nowrap' }}>
                    차량상태
                  </TableCell>
                  <TableCell style={{ whiteSpace: 'nowrap' }}>
                    말소일자
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {!loading ? (
                  hisRows.length > 0 ? (
                    hisRows.map((row) => (
                      <>
                        <TableRow>
                          <TableCell
                            className="td-center"
                            style={{ whiteSpace: 'nowrap' }}
                          >
                            {row.gbFsms ?? ''}
                          </TableCell>{' '}
                          {/* 역순 번호 */}
                          <TableCell
                            className="td-center"
                            style={{ 
                              whiteSpace: 'nowrap',
                              color: !compareVal(row.reowNm, row.netReowNm) ? 'red' : 'black'
                            }}
                          >
                            {row.reowNm ?? ''}
                          </TableCell>
                          <TableCell
                            className="td-center"
                            style={{ 
                              whiteSpace: 'nowrap',
                              color: !compareVal(row.vhclNo, row.netVhclNo) ? 'red' : 'black'
                            }}
                          >
                            {row.vhclNo ?? ''}
                          </TableCell>
                          <TableCell
                            className="td-center"
                            style={{ 
                              whiteSpace: 'nowrap',
                              color: !compareVal(row.brno, row.netBrno) ? 'red' : 'black'                        
                            }}
                          >
                            {brNoFormatter(row.brno ?? '')}
                          </TableCell>
                          <TableCell
                            className="td-center"
                            style={{ 
                              whiteSpace: 'nowrap',
                              color: !compareVal(row.rrno, row.netRrno) ? 'red': 'black'
                            }}
                          >
                            {rrNoFormatter(row.rrno ?? '')}
                          </TableCell>
                          <TableCell
                            className="td-center"
                            style={{ 
                              whiteSpace: 'nowrap',
                              color: !compareVal(row.koiNm, row.netKoiNm) ? 'red' : 'black'
                            }}
                          >
                            {row.koiNm ?? ''}
                          </TableCell>
                          <TableCell
                            className="td-center"
                            style={{ 
                              whiteSpace: 'nowrap',
                              color: !compareVal(row.locgovNm, row.newLocgovNm) ? 'red' : 'black'
                            }}
                          >
                            {row.locgovNm ?? ''}
                          </TableCell>
                          <TableCell
                            className="td-center"
                            style={{ 
                              whiteSpace: 'nowrap',
                              color: !compareVal(row.vhclSttsNm, row.netVhclSttsNm) ? 'red' : 'black'
                            }}
                          >
                            {row.vhclSttsNm ?? ''}
                          </TableCell>
                          <TableCell
                            className="td-center"
                            style={{ whiteSpace: 'nowrap' }}
                          >
                            {row.ersrYmd ?? ''}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell
                            className="td-center"
                            style={{ whiteSpace: 'nowrap' }}
                          >
                            {row.gbCar ?? ''}
                          </TableCell>{' '}
                          {/* 역순 번호 */}
                          <TableCell
                            className="td-center"
                            style={{ 
                              whiteSpace: 'nowrap',
                              color: !compareVal(row.reowNm, row.netReowNm) ? 'red' : 'black'
                            }}
                          >
                            {row.netReowNm ?? ''}
                          </TableCell>
                          <TableCell
                            className="td-center"
                            style={{ 
                              whiteSpace: 'nowrap',
                              color: !compareVal(row.vhclNo, row.netVhclNo) ? 'red' : 'black'
                            }}
                          >
                            {row.netVhclNo ?? ''}
                          </TableCell>
                          <TableCell
                            className="td-center"
                            style={{ 
                              whiteSpace: 'nowrap',
                              color: !compareVal(row.brno, row.netBrno) ? 'red' : 'black'
                            }}
                          >
                            {brNoFormatter(row.netBrno ?? '')}
                          </TableCell>
                          <TableCell
                            className="td-center"
                            style={{ 
                              whiteSpace: 'nowrap',
                              color: !compareVal(row.rrno, row.netRrno) ? 'red' : 'black'
                            }}
                          >
                            {rrNoFormatter(row.netRrno ?? '')}
                          </TableCell>
                          <TableCell
                            className="td-center"
                            style={{ 
                              whiteSpace: 'nowrap',
                              color: !compareVal(row.koiNm, row.netKoiNm) ? 'red' : 'black'
                            }}
                          >
                            {row.netKoiNm ?? ''}
                          </TableCell>
                          <TableCell
                            className="td-center"
                            style={{ 
                              whiteSpace: 'nowrap',
                              color: !compareVal(row.locgovNm, row.newLocgovNm) ? 'red' : 'black'
                            }}
                          >
                            {row.newLocgovNm ?? ''}
                          </TableCell>
                          <TableCell
                            className="td-center"
                            style={{ 
                              whiteSpace: 'nowrap',
                              color: !compareVal(row.vhclSttsNm, row.netVhclSttsNm) ? 'red' : 'black'
                            }}
                          >
                            {row.netVhclSttsNm ?? ''}
                          </TableCell>
                          <TableCell
                            className="td-center"
                            style={{ whiteSpace: 'nowrap' }}
                          >
                            {row.netErsrYmd ?? ''}
                          </TableCell>
                        </TableRow>
                      </>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="td-center">
                        <p>자료가 없습니다. 다른 검색조건을 선택해주세요.</p>
                      </TableCell>
                    </TableRow>
                  )
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="td-center">
                      <p>
                        <CircularProgress />
                      </p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </table>
          </div>
        </div>
      </ThemeProvider>
    </>
  )
}

export default TaxiDetailDataGrid

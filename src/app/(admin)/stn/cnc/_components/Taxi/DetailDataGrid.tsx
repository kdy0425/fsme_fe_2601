import React from 'react'
import { Button } from '@mui/material'
import BlankCard from '@/components/shared/BlankCard'
import { Row } from './TaxiPage'
import { Box, TableBody, TableCell, TableHead, TableRow } from '@mui/material'
import { createTheme, ThemeProvider, useTheme } from '@mui/material/styles'
import * as locales from '@mui/material/locale'
import { rrNoFormatter } from '@/utils/fsms/common/util'
type SupportedLocales = keyof typeof locales

interface DetailDataGridProps {
  hisRows?: Row[]
  btnActions?: ButtonGroupActionProps // 일괄승인,일괄거절,승인,거절,취소 버튼
}

export interface ButtonGroupActionProps {
  onClickFSMSApproAllBtn: () => void // FSMS 일괄 승인 버튼 action
  onClickFSMSCanCelAllBtn: () => void // FSMS 일괄 말소 버튼 action
}

const DetailDataGrid: React.FC<DetailDataGridProps> = ({
  hisRows,
  btnActions,
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

  return (
    <>
      <ThemeProvider theme={themeWithLocale}>
        <BlankCard title="택시차량비교정보 ( 법인 )">
          {/* 엑셀 버튼을 우측으로 정렬 */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="contained"
              color="dark"
              style={{ marginLeft: '6px' }}
              onClick={() => btnActions?.onClickFSMSApproAllBtn()}
            >
              FSMS 차량복원
            </Button>
            <Button
              variant="contained"
              color="dark"
              style={{ marginLeft: '6px' }}
              onClick={() => btnActions?.onClickFSMSCanCelAllBtn()}
            >
              FSMS 차량말소
            </Button>
          </Box>
          <div className="data-grid-wrapper">
            <div className="table-scrollable">
              <table className="table table-bordered">
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
                  {hisRows.length > 0 ? (
                    hisRows.map((row, index) => (
                      <TableRow hover key={`tr${index}`}>
                        <TableCell
                          className="td-center"
                          style={{ whiteSpace: 'nowrap' }}
                        >
                          {row.gbFsms ?? ''}
                        </TableCell>{' '}
                        {/* 역순 번호 */}
                        <TableCell
                          className="td-center"
                          style={{ whiteSpace: 'nowrap' }}
                        >
                          {row.reowNm ?? ''}
                        </TableCell>
                        <TableCell
                          className="td-center"
                          style={{ whiteSpace: 'nowrap' }}
                        >
                          {row.vhclNo ?? ''}
                        </TableCell>
                        <TableCell
                          className="td-center"
                          style={{ whiteSpace: 'nowrap' }}
                        >
                          {row.brno ?? ''}
                        </TableCell>
                        <TableCell
                          className="td-center"
                          style={{ whiteSpace: 'nowrap' }}
                        >
                          {rrNoFormatter(row.rrno ?? '')}
                        </TableCell>
                        <TableCell
                          className="td-center"
                          style={{ whiteSpace: 'nowrap' }}
                        >
                          {row.koiNm ?? ''}
                        </TableCell>
                        <TableCell
                          className="td-center"
                          style={{ whiteSpace: 'nowrap' }}
                        >
                          {row.locgovNm ?? ''}
                        </TableCell>
                        <TableCell
                          className="td-center"
                          style={{ whiteSpace: 'nowrap' }}
                        >
                          {row.vhclSttsNm ?? ''}
                        </TableCell>
                        <TableCell
                          className="td-center"
                          style={{ whiteSpace: 'nowrap' }}
                        >
                          {row.netErsrYmd ?? ''}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="td-center">
                        <p>자료가 없습니다. 다른 검색조건을 선택해주세요.</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </table>
            </div>
          </div>
        </BlankCard>
      </ThemeProvider>
    </>
  )
}

export default DetailDataGrid

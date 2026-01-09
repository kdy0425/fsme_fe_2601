import React from 'react'
import { Grid, Button } from '@mui/material'
import BlankCard from '@/components/shared/BlankCard'
import { Row } from './BusPage'
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TableSortLabel,
} from '@mui/material'
import { createTheme, ThemeProvider, useTheme } from '@mui/material/styles'
import * as locales from '@mui/material/locale';

import {
    getLabelFromCode,
    getNumtoWon,
    formatDate,
    formatKorYearMonth,
    formBrno,
    getNumtoWonAndDecimalPoint
} from '@/utils/fsms/common/convert'
import { Pageable } from 'table'
import { CustomFormLabel } from '@/utils/fsms/fsm/mui-imports'

type SupportedLocales = keyof typeof locales;


interface DetailDataGridProps {
    rows?: Row[]


}

const DetailDataGrid: React.FC<DetailDataGridProps> = ({ 
    rows,
}) => {


    if(rows === undefined){
        rows = [];
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
    {/* 엑셀 버튼을 우측으로 정렬 */}
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" color="primary">
        차량상태 변경
        </Button>
    </Box>
        <ThemeProvider theme={themeWithLocale}>
            <BlankCard title="화물차량비교정보 ( 개인 )">
                <div className="data-grid-wrapper">
                    <div className="table-scrollable">
                        <table className="table table-bordered">
                            <TableHead>
                                    <TableRow>
                                        <TableCell style={{whiteSpace:'nowrap'}}>구분</TableCell>
                                        <TableCell style={{whiteSpace:'nowrap'}}>업체명(차주성명)</TableCell>
                                        <TableCell style={{whiteSpace:'nowrap'}}>차량번호</TableCell>
                                        <TableCell style={{whiteSpace:'nowrap'}}>사업자번호</TableCell>
                                        <TableCell style={{whiteSpace:'nowrap'}}>주민(법인)번호</TableCell>
                                        <TableCell style={{whiteSpace:'nowrap'}}>유종</TableCell>
                                        <TableCell style={{whiteSpace:'nowrap'}}>면허업종</TableCell>
                                        <TableCell style={{whiteSpace:'nowrap'}}>지자체명</TableCell>
                                        <TableCell style={{whiteSpace:'nowrap'}}>차량상태</TableCell>
                                    </TableRow>
                            </TableHead>
                            <TableBody>
                            { rows.length > 0 ? (
                                rows.map((row, index) => (
                                <TableRow
                                    hover
                                    key={`tr${index}`}
                                >
                                    {/* 
                                    <TableCell className='td-center' style={{whiteSpace:'nowrap'}}>{row.gbItas ?? ''}</TableCell>                     
                                    <TableCell className='td-center' style={{whiteSpace:'nowrap'}}>{row.carOwnerBzentyNm ?? ''}</TableCell>
                                    <TableCell className='td-center' style={{whiteSpace:'nowrap'}}>{row.netVhclNo ?? ''}</TableCell>
                                    <TableCell className='td-center' style={{whiteSpace:'nowrap'}}>{row.netVonrBrno ?? ''}</TableCell>
                                    <TableCell className='td-center' style={{whiteSpace:'nowrap'}}>{row.netVonrRrno ?? ''}</TableCell>
                                    <TableCell className='td-center' style={{whiteSpace:'nowrap'}}>{row.netKoiNm ?? ''}</TableCell>
                                    <TableCell className='td-center' style={{whiteSpace:'nowrap'}}>{row.netVhclTonNm ?? ''}</TableCell>
                                    <TableCell className='td-center' style={{whiteSpace:'nowrap'}}>{row.netLocgovCdNm ?? ''}</TableCell>
                                    <TableCell className='td-center' style={{whiteSpace:'nowrap'}}>{row.netVhclSttsNm ?? ''}</TableCell> 
                                    */}
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
        </ThemeProvider >
    </>
    )
}

export default DetailDataGrid

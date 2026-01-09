import React from 'react'
import { Grid, Button } from '@mui/material'
import BlankCard from '@/components/shared/BlankCard'
import { Row } from './FreightPage'
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
import {
    rrNoFormatter
  } from '@/utils/fsms/common/util'
type SupportedLocales = keyof typeof locales;


interface DetailDataGridProps {
    row: Row
    confirmData: () =>  Promise<void>
}

const DetailDataGrid: React.FC<DetailDataGridProps> = ({ 
    row,
    confirmData
}) => {


    // if(row === undefined){
    //     row = undefined;
    // }

    // MUI 그리드 한글화
    const locale: SupportedLocales = 'koKR'
    const theme = useTheme()
    const themeWithLocale = React.useMemo(
        () => createTheme(theme, locales[locale]),
        [locale, theme],
    )



    return (
    <>
    {/* {
          row?.vhclSttsCd == '00' && row?.netVhclSttsCd != '00' ? 
          (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button variant="outlined" color="primary" onClick={() => confirmData?.()}>
                차량상태 변경
                </Button>
            </Box>
          ) : 
          (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button variant="outlined" color="primary" disabled>
                차량상태 변경
                </Button>
            </Box>
          )
    } */}
        
        <ThemeProvider theme={themeWithLocale}>
            <BlankCard title='화물차량비교'
                buttons={[
                    {
                        label: '차량상태 변경',
                        disabled: !(row?.vhclSttsCd == '00' && row?.netVhclSttsCd != '00'),
                        color: 'outlined' as 'outlined',
                        onClick: () => {confirmData?.()}
                        
                    }
                ]}
            >
                <div className="data-grid-wrapper">
                    <div className="table-scrollable">
                        <table className="table table-bordered">
                            <caption>화물차량비교</caption>
                            <TableHead>
                                    <TableRow>
                                        <TableCell style={{whiteSpace:'nowrap'}}>구분</TableCell>
                                        <TableCell style={{whiteSpace:'nowrap'}}>업체명(차주성명)</TableCell>
                                        <TableCell style={{whiteSpace:'nowrap'}}>차량번호</TableCell>
                                        <TableCell style={{whiteSpace:'nowrap'}}>차주사업자번호</TableCell>
                                        <TableCell style={{whiteSpace:'nowrap'}}>차주(주민)사업자번호</TableCell>
                                        <TableCell style={{whiteSpace:'nowrap'}}>유종</TableCell>
                                        <TableCell style={{whiteSpace:'nowrap'}}>톤급</TableCell>
                                        <TableCell style={{whiteSpace:'nowrap'}}>지자체명</TableCell>
                                        <TableCell style={{whiteSpace:'nowrap'}}>차량상태</TableCell>
                                    </TableRow>
                            </TableHead>
                            <TableBody>   
                                <TableRow
                                    hover
                                    key={`tr0`}
                                >
                                <TableCell className='td-center' style={{whiteSpace:'nowrap'}}>FSMS</TableCell>                
                                <TableCell className='td-center' style={{whiteSpace:'nowrap'}}>{row.carOwnerBzentyNm ?? ''}</TableCell>
                                <TableCell className='td-center' style={{whiteSpace:'nowrap'}}>{row.vhclNo ?? ''}</TableCell>
                                <TableCell className='td-center' style={{whiteSpace:'nowrap'}}>{formBrno(row.vonrBrno ?? '')}</TableCell>
                                <TableCell className='td-center' style={{whiteSpace:'nowrap'}}>{rrNoFormatter(row.vonrRrnoSecure ?? '')}</TableCell>
                                <TableCell className='td-center' style={{whiteSpace:'nowrap'}}>{row.carKoiNm ?? ''}</TableCell>
                                <TableCell className='td-center' style={{whiteSpace:'nowrap'}}>{row.carVhclTonNm ?? ''}</TableCell>
                                <TableCell className='td-center' style={{whiteSpace:'nowrap'}}>{row.carLocgovCdNm ?? ''}</TableCell>
                                <TableCell className='td-center' style={{whiteSpace:'nowrap'}}>{row.vhclSttsNm ?? ''}</TableCell>
                                </TableRow>
                                <TableRow
                                    hover
                                    key={`tr1`}
                                >
                                <TableCell className='td-center' style={{whiteSpace:'nowrap'}}>자망</TableCell>                
                                <TableCell className='td-center' style={{whiteSpace:'nowrap'}}>{row.netReowNm ?? ''}</TableCell>
                                <TableCell className='td-center' style={{whiteSpace:'nowrap'}}>{row.netVhclNo ?? ''}</TableCell>
                                <TableCell className='td-center' style={{whiteSpace:'nowrap'}}>{formBrno(row.netVonrBrno ?? '')}</TableCell>
                                <TableCell className='td-center' style={{whiteSpace:'nowrap'}}>{rrNoFormatter(row.netVonrRrnoSecure ?? '')}</TableCell>
                                <TableCell className='td-center' style={{whiteSpace:'nowrap'}}>{row.netKoiNm ?? ''}</TableCell>
                                <TableCell className='td-center' style={{whiteSpace:'nowrap'}}>{row.netVhclTonNm ?? ''}</TableCell>
                                <TableCell className='td-center' style={{whiteSpace:'nowrap'}}>{row.netLocgovCdNm ?? ''}</TableCell>
                                <TableCell className='td-center' style={{whiteSpace:'nowrap'}}>{row.netVhclSttsNm ?? ''}</TableCell>
                                </TableRow>
                            </TableBody>
                            {/* <TableHead>
                                    <TableRow>
                                        <TableCell style={{whiteSpace:'nowrap'}}>구분</TableCell>
                                        <TableCell style={{whiteSpace:'nowrap'}}>업체명(차주성명)</TableCell>
                                        <TableCell style={{whiteSpace:'nowrap'}}>차량번호</TableCell>
                                        <TableCell style={{whiteSpace:'nowrap'}}>차주사업자번호</TableCell>
                                        <TableCell style={{whiteSpace:'nowrap'}}>차주(주민)사업자번호</TableCell>
                                        <TableCell style={{whiteSpace:'nowrap'}}>유종</TableCell>
                                        <TableCell style={{whiteSpace:'nowrap'}}>톤급</TableCell>
                                        <TableCell style={{whiteSpace:'nowrap'}}>지자체명</TableCell>
                                        <TableCell style={{whiteSpace:'nowrap'}}>차량상태</TableCell>
                                    </TableRow>
                            </TableHead>
                            <TableBody>   
                                <TableRow
                                    hover
                                    key={`tr0`}
                                >
                                <TableCell className='td-center' style={{whiteSpace:'nowrap'}}>FSMS</TableCell>                
                                <TableCell className='td-center' style={{whiteSpace:'nowrap'}}>{row.carOwnerBzentyNm ?? ''}</TableCell>
                                <TableCell className='td-center' style={{whiteSpace:'nowrap'}}>{row.vhclNo ?? ''}</TableCell>
                                <TableCell className='td-center' style={{whiteSpace:'nowrap'}}>{formBrno(row.vonrBrno ?? '')}</TableCell>
                                <TableCell className='td-center' style={{whiteSpace:'nowrap'}}>{row.vonrRrnoSecure ?? ''}</TableCell>
                                <TableCell className='td-center' style={{whiteSpace:'nowrap'}}>{row.carKoiNm ?? ''}</TableCell>
                                <TableCell className='td-center' style={{whiteSpace:'nowrap'}}>{row.carVhclTonNm ?? ''}</TableCell>
                                <TableCell className='td-center' style={{whiteSpace:'nowrap'}}>{row.carLocgovCdNm ?? ''}</TableCell>
                                <TableCell className='td-center' style={{whiteSpace:'nowrap'}}>{row.vhclSttsNm ?? ''}</TableCell>
                                </TableRow>
                                <TableRow
                                    hover
                                    key={`tr1`}
                                >
                                <TableCell className='td-center' style={{whiteSpace:'nowrap'}}>자망</TableCell>                
                                <TableCell className='td-center' style={{whiteSpace:'nowrap'}}>{row.netReowNm ?? ''}</TableCell>
                                <TableCell className='td-center' style={{whiteSpace:'nowrap'}}>{row.netVhclNo ?? ''}</TableCell>
                                <TableCell className='td-center' style={{whiteSpace:'nowrap'}}>{formBrno(row.netVonrBrno ?? '')}</TableCell>
                                <TableCell className='td-center' style={{whiteSpace:'nowrap'}}>{row.netVonrRrno ?? ''}</TableCell>
                                <TableCell className='td-center' style={{whiteSpace:'nowrap'}}>{row.netKoiNm ?? ''}</TableCell>
                                <TableCell className='td-center' style={{whiteSpace:'nowrap'}}>{row.netVhclTonNm ?? ''}</TableCell>
                                <TableCell className='td-center' style={{whiteSpace:'nowrap'}}>{row.netLocgovCdNm ?? ''}</TableCell>
                                <TableCell className='td-center' style={{whiteSpace:'nowrap'}}>{row.netVhclSttsNm ?? ''}</TableCell>
                                </TableRow>
                            </TableBody> */}
                        </table>
                    </div>
                </div>
            </BlankCard>
            </ThemeProvider >
            {/* ) : 
            (
            <></>
            )
            } */}
    </>
    )
}

export default DetailDataGrid


// { rows.length > 0 ? 
//     (
//         rows.map((row, index) => (
//         <TableRow
//             hover
//             key={`tr${index}`}
//         >
//             <TableCell className='td-center' style={{whiteSpace:'nowrap'}}>{row.gb ?? ''}</TableCell> {/* 역순 번호 */}                    
//             <TableCell className='td-center' style={{whiteSpace:'nowrap'}}>{row.carOwnerBzentyNm ?? ''}</TableCell>
//             <TableCell className='td-center' style={{whiteSpace:'nowrap'}}>{row.vhclNo ?? ''}</TableCell>
//             <TableCell className='td-center' style={{whiteSpace:'nowrap'}}>{formBrno(row.vonrBrno ?? '')}</TableCell>
//             <TableCell className='td-center' style={{whiteSpace:'nowrap'}}>{row.vonrRrno ?? ''}</TableCell>
//             <TableCell className='td-center' style={{whiteSpace:'nowrap'}}>{row.koiNm ?? ''}</TableCell>
//             <TableCell className='td-center' style={{whiteSpace:'nowrap'}}>{row.vhclTonNm ?? ''}</TableCell>
//             <TableCell className='td-center' style={{whiteSpace:'nowrap'}}>{row.locgovNm ?? ''}</TableCell>
//             <TableCell className='td-center' style={{whiteSpace:'nowrap'}}>{row.vhclSttsNm ?? ''}</TableCell>
//         </TableRow>
//         ))
//     ) : (
//         <TableRow>
//         <TableCell colSpan={9} className="td-center">
//             <p>자료가 없습니다. 다른 검색조건을 선택해주세요.</p>
//         </TableCell>
//         </TableRow>
//     )
//     }
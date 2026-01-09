'use client'

import React from 'react'

import BlankCard from '@/components/shared/BlankCard'
import {
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow
} from '@mui/material'
// MUI 그리드 한글화 import
import * as locales from '@mui/material/locale'
import { createTheme, ThemeProvider, useTheme } from '@mui/material/styles'
import { HeadCell } from 'table'
import { Row } from '../page'

type SupportedLocales = keyof typeof locales

// 페이지 정보
type pageable = {
  pageNumber: number
  pageSize: number
  sort: string
}

// 테이블 caption
const tableCaption: string = '전국표준한도관리 목록'

// 테이블 th 정의 기능에 사용하는 props 정의
interface EnhancedTableProps {
  headCells: HeadCell[]
  onRequestSort?: (event: React.MouseEvent<unknown>, property: keyof []) => void
  order: order
  orderBy: string
}

// 테이블 th 정의 기능
function EnhancedTableHead(props: Readonly<EnhancedTableProps>) {
  const { headCells, order, orderBy } = props
  // const createSortHandler =
  //   (property: keyof []) => (event: React.MouseEvent<unknown>) => {
  //     onRequestSort(event, property)
  //   }


  return (
    <TableHead>
      <TableRow key={'thRow'}>
        {headCells.map((headCell) => (
          <React.Fragment key={'th' + headCell.id}>
            {headCell.sortAt ? (
              <TableCell
                align={'left'}
                padding={headCell.disablePadding ? 'none' : 'normal'}
                sortDirection={orderBy === headCell.id ? order : false}
                style={{ whiteSpace: 'nowrap' }}
              >
                {headCell.label.split('\n').map((line, index) => (
                  <div key={index}>{line}</div> // 줄바꿈된 텍스트를 div로 감싸서 표시
                ))}
              </TableCell>
            ) : (
              <TableCell
                align={'left'}
                padding={headCell.disablePadding ? 'none' : 'normal'}
                style={{ whiteSpace: 'nowrap' }}
              >
                {headCell.label.split('\n').map((line, index) => (
                  <div key={index}>{line}</div> // 줄바꿈된 텍스트를 div로 감싸서 표시
                ))}
              </TableCell>
            )}
          </React.Fragment>
        ))}
      </TableRow>
    </TableHead>
  )
}

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

const headCells: HeadCell[] = [
  {
    id: 'cardNm',
    numeric: false,
    disablePadding: false,
    label: '카드사명',
  },
  {
    id: 'cardNumber',
    numeric: false,
    disablePadding: false,
    label: '카드번호',
  },
  {
    id: 'transactionStatus',
    numeric: false,
    disablePadding: false,
    label: '거래구분',
  },
  {
    id: 'transactionDate',
    numeric: false,
    disablePadding: false,
    label: '거래일자',
  },
  {
    id: 'transactionTime',
    numeric: false,
    disablePadding: false,
    label: '거래시각',
  },
  {
    id: 'transactionQueue',
    numeric: false,
    disablePadding: false,
    label: '거래순번',
  },
  {
    id: 'vhclNo',
    numeric: false,
    disablePadding: false,
    label: '차량번호',
  },
  {
    id: 'brno',
    numeric: false,
    disablePadding: false,
    label: '사업자번호',
  },
  {
    id: 'koiCd',
    numeric: false,
    disablePadding: false,
    label: '유종',
  },
  {
    id: 'companyNm',
    numeric: false,
    disablePadding: false,
    label: '업체명',
  },
  {
    id: 'fcNm',
    numeric: false,
    disablePadding: false,
    label: '가맹점명',
  },
  {
    id: 'fcBrno',
    numeric: false,
    disablePadding: false,
    label: '가맹점\n사업자등록번호',
  },
  {
    id: 'fcProvince',
    numeric: false,
    disablePadding: false,
    label: '가맹점\n지역',
  },
  {
    id: 'pricePerUsageType',
    numeric: false,
    disablePadding: false,
    label: '사용량단가구분',
  },
  {
    id: 'pricePerUsage',
    numeric: false,
    disablePadding: false,
    label: '사용량당단가',
  },
  {
    id: 'fcUseAmount',
    numeric: false,
    disablePadding: false,
    label: '가맹점사용량',
  },
  {
    id: 'mlUseAmount',
    numeric: false,
    disablePadding: false,
    label: '국토부사용량',
  },
  {
    id: 'unit',
    numeric: false,
    disablePadding: false,
    label: '단위',
  },
  {
    id: 'apprPrice',
    numeric: false,
    disablePadding: false,
    label: '승인금액',
  },
  {
    id: 'provinceAvgUsagePrice',
    numeric: false,
    disablePadding: false,
    label: '차량등록지\n지역별평균단가',
  },
  {
    id: 'koiTaxIlSubsidyAvgUsagePrice',
    numeric: false,
    disablePadding: false,
    label: '유가연동보조금\n사용량당단가',
  },
  {
    id: 'koiTaxIlSubsidyA',
    numeric: false,
    disablePadding: false,
    label: '유류세\n연동보조금(a)',
  },
  {
    id: 'koiTaxIlSubsidyB',
    numeric: false,
    disablePadding: false,
    label: '유류세\n연동보조금(b)',
  },
  {
    id: 'koiTaxIlSubsidyAB',
    numeric: false,
    disablePadding: false,
    label: '유류세\n연동보조금(a+b)',
  },
  {
    id: 'userPayAmount',
    numeric: false,
    disablePadding: false,
    label: '수급자\n부담금',
  },
  {
    id: 'aprvRtrcnYmd',
    numeric: false,
    disablePadding: false,
    label: '거래취소일자',
  },
  {
    id: 'noDiscountReason',
    numeric: false,
    disablePadding: false,
    label: '미할인사유',
  },
]

// TableDataGrid의 props 정의
interface ServerPaginationGridProps {
  rows: Row[] // 목록 데이터
  loading: boolean // 로딩 여부
  totalRows: number // 전체 검색 결과 수
  onPaginationModelChange: (page: number, pageSize: number) => void // 페이지 변경 핸들러 추가
  onSortModelChange: (sort: string) => void // 정렬 모델 변경 핸들러 추가
  pageable: pageable  // 페이지 정보

}

type order = 'asc' | 'desc'

const TableDataGrid: React.FC<ServerPaginationGridProps> = ({
  rows,
  loading,
  totalRows,
  onPaginationModelChange,
  onSortModelChange,
  pageable,
}) => {
  // 쿼리스트링의 sort 값이 컬럼명,정렬 구조로 되어있어 분해하여 테이블에 적용
  let order : order = 'desc'; 
  let orderBy : string = '';
  if (pageable.sort !== ''){
    let sort = pageable.sort.split(','); 
    orderBy = sort[0];
    order = sort[1] == 'desc'? 'desc' : 'asc';
  }

  // sort 정렬 변경시 정렬 기준으로 데이터 다시 로드
  const handleRequestSort = (event: React.MouseEvent<unknown>, property: keyof []) => {
    const isAsc = orderBy === property && order === 'asc';
    onSortModelChange(String(property)+','+ (isAsc ? 'desc' : 'asc'))
  };

    // 페이지 변경시 사이즈를 유지하고 페이지 이동
    const handleChangePage = (event: unknown, newPage: number) => {
      onPaginationModelChange(newPage,pageable.pageSize)
    };
  
    //페이지 사이즈 변경시 0 페이지로 이동
    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
      onPaginationModelChange(0,Number(event.target.value))
    };

  // MUI 그리드 한글화
  const locale: SupportedLocales = 'koKR'
  const theme = useTheme()
  const themeWithLocale = React.useMemo(
    () => createTheme(theme, locales[locale]),
    [locale, theme],
  )

  return (
    // MUI 한글화 "ThemeProvider"
    <Grid container spacing={2} className="card-container">
      <Grid item xs={12} sm={12} md={12}>
        <BlankCard className="contents-card" title="상세 거래내역">
          <ThemeProvider theme={themeWithLocale}>
            <div className="data-grid-wrapper">
              <TableContainer>
                <Table
                  sx={{ minWidth: 750 }}
                  aria-labelledby="tableTitle"
                  size={'small'}
                >
                  <caption>{tableCaption}</caption>
                  <EnhancedTableHead
                    headCells={headCells}
                    order={order}
                    orderBy={orderBy}
                  />
                  <TableBody>
                    {!loading ? (
                      rows.length > 0 ? (
                        rows.map((row: any, index) => {
                          return (
                            <TableRow key={'tr' + index}>
                              <TableCell className="table-cell-auto">
                                {row.crdcoCd}
                              </TableCell>
                              <TableCell className="table-cell-auto">
                                {row.cardNo}
                              </TableCell>
                              <TableCell className="table-cell-auto">
                                {row.dlngSeCd}
                              </TableCell>
                              <TableCell className="table-cell-auto">
                                {row.trauYmd}
                              </TableCell>
                              <TableCell className="table-cell-auto">
                                {row.dlngTm}
                              </TableCell>
                              <TableCell className="table-cell-auto">
                                {row.dailUseAcmlNmtm}
                              </TableCell>
                              <TableCell className="table-cell-auto">
                                {row.vhclNo}
                              </TableCell>
                              <TableCell className="table-cell-auto">
                                {row.brno}
                              </TableCell>
                              <TableCell className="table-cell-auto">
                                {row.koiCd}
                              </TableCell>
                              <TableCell className="table-cell-auto">
                                {row.bzentyNm}
                              </TableCell>
                              <TableCell className="table-cell-auto">
                                {row.frcsNm}
                              </TableCell>
                              <TableCell className="table-cell-auto">
                                {row.frcsBrno}
                              </TableCell>
                              <TableCell className="table-cell-auto">
                                {row.cdKornNm}
                              </TableCell>
                              <TableCell className="table-cell-auto">
                                {row.literAcctoUntprc}
                              </TableCell>
                              <TableCell className="table-cell-auto">
                                {row.literAcctoUntprcSeCd}
                              </TableCell>
                              <TableCell className="table-cell-auto">
                                {row.useLiter}
                              </TableCell>
                              <TableCell className="table-cell-auto">
                                {row.moliatUseLiter }
                              </TableCell>
                              <TableCell className="table-cell-auto">
                                {row.usageUnit}
                              </TableCell>
                              <TableCell className="table-cell-auto">
                                {row.aprvAmt}
                              </TableCell>
                              <TableCell className="table-cell-auto">
                                {row.vhclPorgnUntprc} 
                              </TableCell>
                              <TableCell className="table-cell-auto">
                                {row.moliatAsstAmt}
                              </TableCell>
                              <TableCell className="table-cell-auto">
                                {row.koiTaxIlSubsidyA}
                              </TableCell>
                              <TableCell className="table-cell-auto">
                                {row.sumNtsRmbrAmt}
                              </TableCell>
                              <TableCell className="table-cell-auto">
                                {row.sumRmbrAmt}
                              </TableCell>
                              <TableCell className="table-cell-auto">
                                {row.pbillAmt}
                              </TableCell>
                              <TableCell className="table-cell-auto">
                                {row.rtrcnDlngDt}
                              </TableCell>
                              <TableCell className="table-cell-auto">
                                {row.noDiscountReason}
                              </TableCell>
                            </TableRow>
                          )
                        })
                      ) : (
                        <TableRow key={'tr0'}>
                          <TableCell colSpan={16} className="td-center">
                            <p>
                              자료가 없습니다. 다른 검색조건을 선택해주세요.
                            </p>
                          </TableCell>
                        </TableRow>
                      )
                    ) : (
                      <TableRow key={'tr0'}>
                        <TableCell colSpan={16} className="td-center">
                          <p> </p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={totalRows }
                rowsPerPage={pageable.pageSize}
                page={pageable.pageNumber }
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />  
            </div>
          </ThemeProvider>
        </BlankCard>
      </Grid>
    </Grid>
  )
}

export default TableDataGrid


import { Button, Dialog, DialogContent, Box, DialogProps } from '@mui/material'
import React, { useContext, useEffect, useState } from 'react'
import { HeadCell } from 'table'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import { TransformRow } from './SearchModal'
import { getToday } from '@/utils/fsms/common/dateUtils'

const chartColor = [
  '#31C09C',
  '#FE7E56',
  '#5F8EE2',
  '#9577D7',
  '#4BB3FD',
  '#E471B8',
  '#FFC72E',
  '#B2C72C',
  '#83C0C9',
  '#A3A3A3',
]

interface StrctStatsRptpModalProps {
  size?: DialogProps['maxWidth'] | 'lg'
  open: boolean
  handleClickClose: () => void
  params: any
  transformRows: TransformRow[]
}

const StrctStatsRptpModal = (props: StrctStatsRptpModalProps) => {
  const { size, open, handleClickClose, params, transformRows } = props
  const [tableRows, setTableRows] = useState<TransformRow[]>([])
  const [cols, setCols] = useState<string[]>([])
  const [headCells, setHeadCells] = useState<HeadCell[]>([])
  const [charts, setCharts] = useState<any[]>([]) //{seNm: string, rows: [crtrMm: string, [crtrYyyy: string]: number]}

  useEffect(() => {
    setCols([])
    setHeadCells([])
    setCharts([])
    setTableRows([])

    if (transformRows.length === 0) return
    setCols(Object.keys(transformRows[0]) as string[])

    const chart = Object.values(
      transformRows.reduce((chart: any, row) => {
        if (!chart[row.seNm]) {
          chart[row.seNm] = { seNm: row.seNm, rows: [] }
        }

        const { seNm, ...rest } = row
        chart[row.seNm].rows.push(rest)

        return chart
      }, {}),
    )
    setCharts(chart)
  }, [transformRows])

  useEffect(() => {
    setTableRows([])
    //구분값별로 합계
    const total: TransformRow[] = []
    charts.forEach((chart, index) => {
      total[index] = { crtrMm: '합계', seNm: chart.seNm }
      Object.keys(chart.rows[0]).forEach((col) => {
        if (col !== 'crtrMm' && col !== 'seNm') {
          const sum = chart.rows.reduce(
            (sum: number, row: { [x: string]: any }) =>
              sum + Number(row[col] === '-' ? 0 : row[col]),
            0,
          )
          total[index][col] = sum === 0 ? '-' : sum
        }
      })
    })

    setTableRows([...transformRows, ...total])
  }, [charts])

  useEffect(() => {
    if (cols.length === 0) return

    const head: HeadCell[] = []
    cols.forEach((col) => {
      if (!(col === 'seNm' && !params.groupSeCd)) {
        const hc = {
          id: col,
          numeric: false,
          disablePadding: false,
          format: col === 'crtrMm' || col === 'seNm' ? '' : 'number',
          align: col === 'crtrMm' || col === 'seNm' ? '' : 'td-right',
          label:
            col === 'seNm'
              ? params.groupSeCd === 'TASK'
                ? '구분'
                : params.groupSeCd === 'KOI'
                  ? '유종'
                  : params.groupSeCd === 'TON'
                    ? '톤수'
                    : params.groupSeCd === 'BZMN'
                      ? '개인/법인'
                      : params.groupSeCd === 'LCNS'
                        ? '면허업종'
                        : params.groupSeCd === 'CRDCO'
                          ? '카드사'
                          : ''
              : col === 'crtrMm'
                ? ''
                : col,
          rowspan: col === 'crtrMm' ? true : false,
        }
        head.push(hc)
      }
    })
    setHeadCells(head)
  }, [cols])

  /* =========================
   * 엑셀 다운로드 (모든 셀 텍스트, 숫자 3자리 콤마)
   *  - 병합(colSpan/rowSpan) 유지
   *  - 모든 값 t='s', z='@'로 설정 → 지수표기 방지
   *  - 숫자처럼 보이는 값은 formatNumeric()로 콤마 삽입
   * ========================= */
  async function downloadPivotAsExcelText(filename?: string) {
    const XLSX: any = await import('xlsx-js-style')

    // 1) 스팬을 실제 격자와 병합정보로 변환
    const headerRows: TransformRow = { crtrMm: '', seNm: '' }

    headCells.forEach((hc, i) => {
      if (!(hc.id === 'seNm' && !params.groupSeCd)) headerRows[hc.id] = hc.label
    })

    const rows: any[] = [headerRows, ...tableRows].map((obj) =>
      Object.entries(obj)
        .filter(([k]) => !(k === 'seNm' && !params.groupSeCd))
        .map(([, v]) => v),
    )

    const grid: string[][] = []
    const merges: any[] = []

    const isFree = (r: number, c: number) => {
      grid[r] = grid[r] || []
      return grid[r][c] === undefined
    }
    const nextFreeCol = (r: number, startCol: number) => {
      let c = startCol
      while (!isFree(r, c)) c++
      return c
    }

    rows.forEach((rowCells, ri) => {
      grid[ri] = grid[ri] || []
      let ci = 0
      ;(rowCells ?? []).forEach((raw: any) => {
        const obj =
          raw && typeof raw === 'object' && 'text' in raw
            ? raw
            : { text: raw, colSpan: 1, rowSpan: 1 }

        const text = obj?.text ?? ''

        ci = nextFreeCol(ri, ci)

        // ✅ 숫자처럼 보이면 3자리 콤마로 포맷한 후 문자열로 저장
        const rawStr = String(text)
        const display = isNumericLike(rawStr)
          ? String(formatNumeric(rawStr))
          : rawStr
        grid[ri][ci] = display
      })
    })

    // 2) 직사각형 패딩
    const maxCols = grid.reduce((m, r) => Math.max(m, r?.length || 0), 0)
    for (let r = 0; r < grid.length; r++) {
      grid[r] = grid[r] || []
      while (grid[r].length < maxCols) grid[r].push('')
    }

    // 3) 시트 생성
    const ws = XLSX.utils.aoa_to_sheet(grid)
    ;(ws as any)['!merges'] = merges

    ws['!merges'] = rowspan(rows, 0, 1)

    // 4) 모든 셀 텍스트 강제 (지수표기 방지 + 표시 그대로 저장)
    const ref = (ws as any)['!ref'] || 'A1'
    const rng = XLSX.utils.decode_range(ref)
    for (let R = rng.s.r; R <= rng.e.r; R++) {
      for (let C = rng.s.c; C <= rng.e.c; C++) {
        const addr = XLSX.utils.encode_cell({ r: R, c: C })
        const cell = (ws as any)[addr]
        if (!cell) continue
        const sv = String(cell.v ?? '')
        cell.t = 's' // string
        cell.z = '@' // text format
        cell.v = sv // 값
        cell.w = sv // 표시문자
        cell.s = {
          font: { name: '맑은 고딕', sz: 10 },
          alignment: {
            horizontal: isNumericLike(sv) ? 'right' : 'center',
            vertical: 'center',
            wrapText: true,
          },
          border: {
            top: { style: 'thin', color: { rgb: '000000' } },
            bottom: { style: 'thin', color: { rgb: '000000' } },
            left: { style: 'thin', color: { rgb: '000000' } },
            right: { style: 'thin', color: { rgb: '000000' } },
          },
        }
      }
    }

    // 5) 헤더 스타일(가운데+Bold)만 적용
    const center = { horizontal: 'center', vertical: 'center', wrapText: true }
    const bold = { bold: true, name: '맑은 고딕', sz: 10 }
    for (let cc = 0; cc < maxCols; cc++) {
      const addr = XLSX.utils.encode_cell({ r: 0, c: cc })
      if ((ws as any)[addr])
        (ws as any)[addr].s = {
          font: bold,
          alignment: center,
          fill: {
            patternType: 'solid',
            fgColor: { rgb: 'E5EBF0' },
          },
          border: {
            top: { style: 'thin', color: { rgb: '000000' } },
            bottom: { style: 'thin', color: { rgb: '000000' } },
            left: { style: 'thin', color: { rgb: '000000' } },
            right: { style: 'thin', color: { rgb: '000000' } },
          },
        }
    }

    // 6) 컬럼 폭 자동 계산
    const colWidths = rows[0].map((col: any, colIndex: string | number) => {
      // 각 열 데이터 길이 중 가장 긴 값 찾기
      const maxLength = rows.reduce((max, row) => {
        const cellValue = row[colIndex] ? row[colIndex].toString() : ''
        return Math.max(max, cellValue.length)
      }, 10) // 최소 폭 10
      return { wch: maxLength + 2 } // 여유 공간 추가
    })

    // 워크시트에 컬럼 폭 설정
    ws['!cols'] = colWidths

    // 7) 저장
    const safe =
      (filename || params?.title || 'pivot')
        .replace(/[\\/:*?"<>|]/g, '')
        .replace(/\s+/g, '_')
        .trim() || 'pivot'

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'sheet')
    XLSX.writeFile(wb, `${safe}_${getToday()}.xlsx`)
  }

  // 연속 동일값 병합 범위 계산 (data는 AOA: 2차원 배열)
  function rowspan(data: any[], colIndex: number, startRow = 1) {
    const merges = []
    let runStart = startRow // 0-based (헤더가 0행이면 1부터)
    let prev = data[startRow]?.[colIndex]

    for (let r = startRow + 1; r <= data.length; r++) {
      const cur = r < data.length ? data[r]?.[colIndex] : Symbol('END')
      if (cur !== prev) {
        if (prev !== undefined && prev !== null && r - 1 > runStart) {
          // ws["!merges"]는 0-based r/c
          merges.push({
            s: { r: runStart, c: colIndex },
            e: { r: r - 1, c: colIndex },
          })
        }
        runStart = r
        prev = cur
      }
    }
    return merges
  }

  /* =========================
   * 숫자 포맷 유틸(화면/엑셀 공통)
   * ========================= */
  const isNumericLike = (v: any) => {
    if (v == null) return false
    if (typeof v === 'number') return Number.isFinite(v)
    if (typeof v !== 'string') return false
    const s = v.trim()
    return s !== '' && /^-?\d+(\.\d+)?$/.test(s.replace(/,/g, ''))
  }

  const formatNumeric = (v: any) => {
    const s = String(v).replace(/,/g, '').trim()
    const m = s.match(/^-?\d+(?:\.\d+)?$/)
    if (!m) return v
    const [intPart, decPart] = s.split('.')
    const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    return decPart ? `${withCommas}.${decPart}` : withCommas
  }

  return (
    <>
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          .print_area {
            overflow: visible !important;
          }
          .print_area,
          .print_area * {
            visibility: visible !important;
          }
          .page-title-4depth,
          .sch-filter-box,
          .data-grid-wrapper
            .MuiTableHead-root
            .MuiTableRow-root
            .MuiTableCell-root {
            -webkit-print-color-adjust: exact;
          }
          .popup_inner_scroll,
          .MuiPaper-root {
            max-height: none !important;
          }
          .charts_area {
            break-inside: avoid !important; /* 표준 */
            page-break-inside: avoid !important; /* 구형/레거시 */
            overflow: visible !important; /* SVG 클리핑 방지 */
          }
          @page {
            size: A4;
            margin: 12mm;
          }
        }
      `}</style>
      <Box>
        <Dialog
          fullWidth={false}
          open={open}
          maxWidth={size || 'lg'}
          onClose={handleClickClose}
        >
          <DialogContent
            style={{
              width:
                params.rptpSeCd && params.rptpSeCd.includes('OPSAMT')
                  ? 1000
                  : 800,
            }}
          >
            <Box className="table-bottom-button-group">
              <div className=" button-right-align">
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => window.print()} // ← 추가
                >
                  출력
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => downloadPivotAsExcelText()}
                >
                  엑셀
                </Button>
                <Button
                  variant="contained"
                  color="dark"
                  onClick={handleClickClose}
                >
                  닫기
                </Button>
              </div>
            </Box>

            <div className="popup_inner_scroll print_area">
              <h2 style={{ marginTop: 10, textAlign: 'center' }}>
                {params?.title}
              </h2>
              {/* 기간 / 관할관청 : 한 줄씩, table 없는 버전 */}
              <div style={{ fontWeight: 'bold' }}>
                {/* 1줄: 기간 */}
                <p style={{ margin: 0, whiteSpace: 'nowrap' }}>
                  <span style={{ display: 'inline-block', minWidth: 80 }}>
                    기간
                  </span>
                  <span>
                    : {params?.bgngDt}년 ~ {params?.endDt}년
                  </span>
                </p>

                {/* 1줄: 관할관청 */}
                <p style={{ margin: '4px 0 0', whiteSpace: 'nowrap' }}>
                  <span style={{ display: 'inline-block', minWidth: 80 }}>
                    관할관청
                  </span>
                  <span>
                    : {params?.locgovNm}
                  </span>
                </p>
              </div>                     
              <Box style={{ marginTop: 20 }}>
                <TableDataGrid
                  headCells={headCells}
                  rows={tableRows}
                  loading={false}
                />
              </Box>
              {charts.map((chart) => (
                <Box className="charts_area" style={{ marginTop: 40 }}>
                  <div className="page-title-4depth">
                    <b>{charts.length === 1 ? params?.title : chart.seNm}</b>
                  </div>
                  <div
                    className="bar_chart_area"
                    style={{ width: '100%', height: 360 }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chart.rows}
                        barGap={5}
                        margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="crtrMm"
                          type="category"
                          tick={{ fontSize: 10 }}
                          allowDuplicatedCategory={true}
                        />
                        <YAxis
                          label={
                            params.rptpSeCd &&
                            params.rptpSeCd.includes('OPSAMT')
                              ? {
                                  value: '단위: 천원',
                                  position: 'bottom',
                                }
                              : {}
                          }
                          width={60}
                          tick={{ fontSize: 12 }}
                          tickFormatter={(v) =>
                            (params.rptpSeCd &&
                            params.rptpSeCd.includes('OPSAMT')
                              ? v / 1000
                              : v
                            ).toLocaleString()
                          }
                        />
                        {cols.map((col, i) =>
                          col !== 'crtrMm' && col !== 'seNm' ? (
                            <Bar
                              dataKey={col}
                              name={col}
                              fill={chartColor[i - 2]}
                            />
                          ) : (
                            ''
                          ),
                        )}
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="legends">
                      {cols.map((col, i) =>
                        col !== 'crtrMm' && col !== 'seNm' ? (
                          <div>
                            <span
                              className="color"
                              style={{
                                border: `6px solid ${chartColor[i - 2]}`,
                              }}
                            ></span>{' '}
                            {col}
                          </div>
                        ) : (
                          ''
                        ),
                      )}
                    </div>
                  </div>
                </Box>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </Box>
    </>
  )
}
export default StrctStatsRptpModal

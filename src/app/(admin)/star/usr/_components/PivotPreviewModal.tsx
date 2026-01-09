'use client'

import React from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import { createTheme, ThemeProvider, useTheme } from '@mui/material/styles'
import * as locales from '@mui/material/locale'
type SupportedLocales = keyof typeof locales

/* =========================
 * 타입
 * ========================= */
export type PivotCell = {
  text: string | number | null
  colSpan?: number
  rowSpan?: number
  isHeader?: boolean
}
export type PivotResponse = {
  headerRows?: PivotCell[][]
  bodyRows: PivotCell[][]
  title?: string
}
export type PivotPreviewParams = {
  title?: string
  bgngDt?: string
  endDt?: string
  locgovNm?: string
  ctpvNm?: string
}
export type PivotPreviewModalProps = {
  open: boolean
  handleClickClose: () => void
  params: PivotPreviewParams
  pivot: PivotResponse | null
}

/* =========================
 * 공통 유틸 (원본 유지)
 * ========================= */
const DISP_DASH = '–'
const isNullishOrDash = (v: any) => {
  if (v == null) return true
  if (typeof v === 'number') return false
  const s = String(v).replace(/[\u00A0\u200B-\u200D\uFEFF]/g, '').trim()
  if (s === '') return true
  return s === '-' || s === '—' || /^(null|undefined|nan)$/i.test(s)
}
function sanitizePivotForView(pivot: PivotResponse | null): PivotResponse | null {
  if (!pivot) return pivot
  const headerRows = Array.isArray(pivot.headerRows) ? pivot.headerRows : []
  const bodyRows = (Array.isArray(pivot.bodyRows) ? pivot.bodyRows : []).map((row) =>
    row.map((cell) => {
      const cs = cell?.colSpan ?? 1
      const rs = cell?.rowSpan ?? 1
      const isHeader = !!cell?.isHeader
      const raw = cell?.text
      if (isHeader) return cell
      const text = isNullishOrDash(raw) ? DISP_DASH : raw
      return { ...cell, text, colSpan: cs, rowSpan: rs }
    }),
  )
  return { ...pivot, headerRows, bodyRows }
}
const isNumericLike = (v: any) => {
  if (v == null) return false
  if (typeof v === 'number') return Number.isFinite(v)
  if (typeof v !== 'string') return false
  const s = v.trim()
  return s !== '' && /^-?\d+(\.\d+)?$/.test(s.replace(/,/g, ''))
}
const formatNumeric = (v: any) => {
  const s = String(v).replace(/,/g, '').trim()
  const m = s.match(/^-?\d+(?:\.\d+)?$/)   // ← 오타 보정
  if (!m) return v
  const [intPart, decPart] = s.split('.')
  const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return decPart ? `${withCommas}.${decPart}` : withCommas
}

/* =========================
 * 엑셀 다운로드 (원본 유지)
 * ========================= */
async function downloadPivotAsExcelText(pivot: PivotResponse, filename?: string) {
  const XLSX: any = await import('xlsx-js-style')
  const headerRows = Array.isArray(pivot?.headerRows) ? pivot.headerRows : []
  const bodyRows = Array.isArray(pivot?.bodyRows) ? pivot.bodyRows : []
  const rows: any[][] = [...headerRows, ...bodyRows]
  const headerRowCount = headerRows.length

  const grid: string[][] = []
  const merges: any[] = []
  const occupy = (r: number, c: number) => { grid[r] = grid[r] || []; if (grid[r][c] === undefined) grid[r][c] = '' }
  const isFree = (r: number, c: number) => { grid[r] = grid[r] || []; return grid[r][c] === undefined }
  const nextFreeCol = (r: number, startCol: number) => { let c = startCol; while (!isFree(r, c)) c++; return c }

  rows.forEach((rowCells, ri) => {
    grid[ri] = grid[ri] || []
    let ci = 0
    ;(rowCells ?? []).forEach((raw: any) => {
      const obj = raw && typeof raw === 'object' && 'text' in raw ? raw : { text: raw, colSpan: 1, rowSpan: 1 }
      const text = obj?.text ?? ''
      const cs = Math.max(1, Number(obj?.colSpan || 1))
      const rs = Math.max(1, Number(obj?.rowSpan || 1))
      ci = nextFreeCol(ri, ci)
      const rawStr = String(text)
      const displayBase = isNullishOrDash(rawStr) ? '-' : rawStr
      const display = isNumericLike(displayBase) ? String(formatNumeric(displayBase)) : displayBase
      grid[ri][ci] = display
      for (let dr = 0; dr < rs; dr++) for (let dc = 0; dc < cs; dc++) if (!(dr === 0 && dc === 0)) occupy(ri + dr, ci + dc)
      if (cs > 1 || rs > 1) merges.push({ s: { r: ri, c: ci }, e: { r: ri + rs - 1, c: ci + cs - 1 } })
      ci += cs
    })
  })

  const maxCols = grid.reduce((m, r) => Math.max(m, r?.length || 0), 0)
  for (let r = 0; r < grid.length; r++) { grid[r] = grid[r] || []; while (grid[r].length < maxCols) grid[r].push('') }

  const ws = XLSX.utils.aoa_to_sheet(grid)
  ;(ws as any)['!merges'] = merges
  const ref = (ws as any)['!ref'] || 'A1'
  const rng = XLSX.utils.decode_range(ref)
  const fullBorder = { top: { style: 'thin', color: { rgb: '000000' } }, bottom: { style: 'thin', color: { rgb: '000000' } }, left: { style: 'thin', color: { rgb: '000000' } }, right: { style: 'thin', color: { rgb: '000000' } } }

  for (let R = rng.s.r; R <= rng.e.r; R++) {
    for (let C = rng.s.c; C <= rng.e.c; C++) {
      const addr = XLSX.utils.encode_cell({ r: R, c: C })
      let cell = (ws as any)[addr]
      if (!cell) { (ws as any)[addr] = { t: 's', v: '' }; cell = (ws as any)[addr] }
      const sv = String(cell.v ?? '')
      cell.t = 's'; cell.z = '@'; cell.v = sv; cell.w = sv
      cell.s = { alignment: { horizontal: isNumericLike(sv) ? 'right' : 'center', vertical: 'center', wrapText: true }, border: fullBorder }
    }
  }
  for (let rr = 0; rr < headerRowCount; rr++) {
    for (let cc = 0; cc < maxCols; cc++) {
      const addr = XLSX.utils.encode_cell({ r: rr, c: cc })
      const cell = (ws as any)[addr]; if (!cell) continue
      const prev = cell.s || {}
      ;(ws as any)[addr].s = { ...prev, font: { bold: true }, alignment: { horizontal: 'center', vertical: 'center', wrapText: true }, fill: { patternType: 'solid', fgColor: { rgb: 'E5EBF0' } }, border: prev.border }
    }
  }
  const colWidths = Array.from({ length: maxCols }).map((_, colIdx) => {
    let maxLen = 0
    for (const row of grid) { const v = (row?.[colIdx] ?? '').toString(); if (v.length > 0) maxLen = Math.max(maxLen, v.length) }
    return { wch: maxLen > 0 ? maxLen + 2 : 2 }
  })
  ;(ws as any)['!cols'] = colWidths

  const mergesAll = (ws as any)['!merges'] || []
  for (const m of mergesAll) {
    const masterAddr = XLSX.utils.encode_cell({ r: m.s.r, c: m.s.c })
    const masterCell = (ws as any)[masterAddr] || ((ws as any)[masterAddr] = { t: 's', v: '' })
    const prev = masterCell.s || {}
    masterCell.s = { ...prev, alignment: { horizontal: (prev.alignment && (prev.alignment as any).horizontal) || 'center', vertical: 'center', wrapText: true }, border: fullBorder }
  }

  const safe = (filename || pivot?.title || 'pivot').replace(/[\\/:*?"<>|]/g, '').replace(/\s+/g, '_').trim() || 'pivot'
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'sheet')
  XLSX.writeFile(wb, `${safe}.xlsx`)
}

/* =========================
 * 화면 렌더 (원본 유지)
 * ========================= */
function RenderPivotTable({ data }: { data: PivotResponse | null }) {
  const locale: SupportedLocales = 'koKR'
  const theme = useTheme()
  const themeWithLocale = React.useMemo(() => createTheme(theme, locales[locale]), [locale, theme])

  if (!data) return <span>표시할 데이터가 없습니다.</span>
  const { headerRows = [], bodyRows = [] } = sanitizePivotForView(data) ?? { headerRows: [], bodyRows: [] }
  if (!headerRows.length && !bodyRows.length) return <span>표시할 데이터가 없습니다.</span>

  return (
    <ThemeProvider theme={themeWithLocale}>
      <div className="data-grid-wrapper">
        <Table
          sx={{ minWidth: 750 }}
          aria-labelledby="tableTitle"
          size="small"
          // 🔹 접근성 도구용 summary (문구는 원하는 대로 조정해도 됨)
          summary="비정형 통계보고서 결과 데이터 표입니다. 행은 기간(연월), 열은 항목별 지급 정보를 나타냅니다."
        >
          {/* 🔹 스크린리더용 caption: 화면에는 안 보이게 처리 */}
          <caption
            style={{
              position: 'absolute',
              width: 1,
              height: 1,
              padding: 0,
              margin: -1,
              overflow: 'hidden',
              clip: 'rect(0, 0, 0, 0)',
              whiteSpace: 'nowrap',
              border: 0,
            }}
          >
            비정형 통계보고서 결과 데이터 표입니다. 행은 기간(연월), 열은 항목별 지급 정보를 나타냅니다.
          </caption>
          <TableHead>
            {headerRows.map((row, i) => (
              <TableRow key={`h-${i}`}>
                {row.map((c, j) => (
                  <TableCell key={`h-${i}-${j}`} component="th" align="center" colSpan={c.colSpan || 1} rowSpan={c.rowSpan || 1} 
                    sx={{ px: 1 ,   py: 0.75, whiteSpace: 'nowrap', wordBreak: 'keep-all' }}>
                    {c.text ?? ''}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody
            sx={{
              '& td': { whiteSpace: 'nowrap', wordBreak: 'keep-all', px: 1, py: 0.75 },
              '& td[data-align="num"]':   { textAlign: 'right !important' },
              '& td[data-align="label"]': { textAlign: 'center !important' },
            }}
          >
          {bodyRows.map((row, i) => (
            <TableRow key={`b-${i}`}>
              {row.map((c, j) => {
                const raw   = c?.text
                const isHdr = !!c?.isHeader

                // 🔹 연도 / 연월(2025, 2025-01)은 숫자처럼 보여도 "라벨"로 취급
                const isYearOrYm =
                  typeof raw === 'string' &&
                  /^\d{4}(-\d{2})?$/.test(raw.trim())

                const isNum =
                  !isHdr &&
                  !isYearOrYm &&
                  (typeof raw === 'number' || isNumericLike(raw))

                const display = isHdr
                  ? (raw ?? '')
                  : (isNum ? formatNumeric(raw) : (raw ?? ''))

                const alignKey = isNum ? 'num' : 'label'

                return (
                  <TableCell
                    key={`b-${i}-${j}`}
                    title={raw == null ? '' : String(raw)}
                    colSpan={c.colSpan || 1}
                    rowSpan={c.rowSpan || 1}
                    data-align={alignKey}
                  >
                    {display}
                  </TableCell>
                )
              })}
            </TableRow>
          ))}

        </TableBody>

        </Table>
      </div>
    </ThemeProvider>
  )
}

/* =========================
 * 모달 본체
 * ========================= */
export default function PivotPreviewModal({ open, handleClickClose, params, pivot }: PivotPreviewModalProps) {

  // ✅ window.print 커스텀: 기존 .print-only 숨김 + body에 임시 DOM만 띄워 인쇄
  React.useEffect(() => {
    const nativePrint = (window.print ? window.print.bind(window) : (() => {})) as () => void
    if (!pivot) return

    const isNumStr = (v:any) => v!=null && /^-?\d+(?:\.\d+)?$/.test(String(v).replace(/,/g,'').trim())
    const isDash = (v:any) => v===DISP_DASH || v==='-' || v==='—'
    const fmt = (v:any) => {
      const s = String(v).replace(/,/g,'').trim()
      const m = s.match(/^-?\d+(?:\.\d+)?$/); if(!m) return v==null?'':String(v)
      const [i,d] = s.split('.'); const w = i.replace(/\B(?=(\d{3})+(?!\d))/g,',')
      return d ? `${w}.${d}` : w
    }

    type A = { text:any; cs:number; rs:number; mr:number; mc:number; isHeader?:boolean }

    const toGrid = (rows: PivotCell[][]) => {
      const R = rows.length
      const g:(A|null)[][] = Array.from({length:R},()=>[])
      let C = 0
      const next = (r:number,c:number)=>{ const row=g[r]||[]; let x=c; while(row[x]) x++; return x }
      for(let r=0;r<R;r++){
        let c = next(r,0)
        for(const raw of (rows[r]||[])){
          const cell = raw && typeof raw==='object' && 'text' in raw ? raw : ({text:raw} as any)
          const cs = Math.max(1, Number(cell.colSpan||1))
          const rs = Math.max(1, Number(cell.rowSpan||1))
          c = next(r,c)
          const a:A = { text:cell.text, cs, rs, mr:r, mc:c, isHeader:!!cell.isHeader }
          for(let dr=0;dr<rs;dr++){
            const rr=r+dr; g[rr]=g[rr]||[]
            for(let dc=0;dc<cs;dc++) g[rr][c+dc]=a
          }
          c += cs
        }
        C = Math.max(C, g[r].length)
      }
      return {grid:g, rows:R, cols:C}
    }

    const styleCell = (el:HTMLElement, asLabel:boolean, right?:boolean) => {
      el.setAttribute('style', [
        'border:1px solid #000', 'padding:4px 6px', 'white-space:nowrap',
        'vertical-align:middle', `text-align:${asLabel?'center':(right?'right':'left')}`
      ].join(';'))
    }

    const sliceRow = (
      g:(A|null)[][], r:number, s:number, e:number, tag:'td'|'th', asLabel:boolean
    )=>{
      const out:HTMLElement[] = []
      let c=s
      while(c<=e){
        const a=g[r]?.[c]||null
        if(!a){ const el=document.createElement(tag); el.textContent=''; styleCell(el,true); out.push(el); c++; continue }
        const top=r-a.mr, left=c-a.mc
        if(top>0){ c++; continue }
        const w=Math.min(a.cs-Math.max(0,left), e-c+1), h=a.rs-Math.max(0,top)
        const el=document.createElement(tag)
        const raw=a.text
        el.textContent = raw=== DISP_DASH ? DISP_DASH : (isNumStr(raw)?fmt(raw):(raw==null?'':String(raw)))
        styleCell(el, asLabel || !!a.isHeader, !asLabel && (isNumStr(raw)||isDash(raw)))
        if(w>1) (el as HTMLTableCellElement).colSpan=w
        if(h>1) (el as HTMLTableCellElement).rowSpan=h
        out.push(el); c+=w
      }
      return out
    }

    // 가장 아래(깊은) 헤더 행 기준으로 그룹 폭 계산
    function buildDataGroups(hGrid: (A | null)[][], labelCols: number, totalCols: number) {
      const H = hGrid.length
      const groups: number[] = []
      if (!H) { for (let c = labelCols; c < totalCols; c++) groups.push(1); return groups }

      let baseRow = -1
      for (let r = H - 1; r >= 0; r--) {
        let found = false
        for (let c = labelCols; c < totalCols; c++) {
          const a = hGrid[r]?.[c]
          if (a && a.mr === r && a.cs > 1) { found = true; break }
        }
        if (found) { baseRow = r; break }
      }
      if (baseRow === -1) { for (let c = labelCols; c < totalCols; c++) groups.push(1); return groups }

      let c = labelCols
      while (c < totalCols) {
        const a = hGrid[baseRow]?.[c]
        let w = 1
        if (a) {
          const leftOff = c - a.mc
          w = Math.max(1, Math.min(a.cs - Math.max(0, leftOff), totalCols - c))
        }
        groups.push(w); c += w
      }
      return groups
    }

    function printNow(){
      const s = sanitizePivotForView(pivot)!
      const h = Array.isArray(s.headerRows)?s.headerRows:[]
      const b = Array.isArray(s.bodyRows)?s.bodyRows:[]

      const {grid:hg, cols:hC} = toGrid(h)
      const {grid:bg, rows:bR, cols:bC} = toGrid(b)
      const totalCols = Math.max(hC, bC)

      // 행라벨 폭
      let labelCols = 0
      for(let r=0;r<bR;r++){
        const row=bg[r]||[]
        let idx=totalCols
        for(let c=0;c<totalCols;c++){ const a=row[c]; if(a && !a.isHeader && (isNumStr(a.text)||isDash(a.text))){ idx=c; break } }
        if(idx>labelCols) labelCols=idx
      }
      if(labelCols<=0 || labelCols>=totalCols) labelCols=Math.min(2, Math.max(1,totalCols-1))

      const dataTotal = Math.max(0,totalCols-labelCols)

      const groups = buildDataGroups(hg, labelCols, totalCols)
      const groupStartsRel: number[] = []; { let acc=0; for(const w of groups){ groupStartsRel.push(acc); acc+=w } }

      // 픽셀 기반 예산
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      ctx.font = '10.5pt system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans KR", Arial'
      const PAD_X = 12
      const measurePx = (v: any) => Math.max(20, ctx.measureText(v == null ? '' : String(v)).width + PAD_X)

      const SAMPLE_ROWS = Math.min(bg.length, 120)
      function estimateColPx(absCol: number) {
        let w = 0
        for (let r = 0; r < hg.length; r++) {
          const a = hg[r]?.[absCol]; if (!a || r !== a.mr) continue
          w = Math.max(w, measurePx(a.text))
        }
        for (let r = 0; r < SAMPLE_ROWS; r++) {
          const a = bg[r]?.[absCol]; if (!a || r !== a.mr) continue
          const raw = a.text
          const disp = raw === DISP_DASH ? DISP_DASH : (isNumStr(raw) ? fmt(raw) : (raw == null ? '' : String(raw)))
          w = Math.max(w, measurePx(disp))
        }
        return Math.min(180, Math.max(60, w))
      }

      let labelPx = 0
      for (let c = 0; c < labelCols; c++) labelPx += estimateColPx(c)

      const groupPx: number[] = []
      { let rel = 0; for (const w of groups) { let s = 0; for (let k = 0; k < w; k++) s += estimateColPx(labelCols + rel + k); groupPx.push(s); rel += w } }

      const rootW = (document.getElementById('pivot-print')?.getBoundingClientRect()?.width) || window.innerWidth
      const usablePx = Math.max(320, rootW - 48)
      const dataBudgetPx = Math.max(160, usablePx - labelPx)

      const ranges: Array<{sRel:number; eRel:number}> = []
      if(dataTotal<=0){
        ranges.push({sRel:0, eRel:-1})
      }else{
        let gi = 0
        while (gi < groups.length) {
          let sum = 0, j = gi
          while (j < groups.length && sum + groupPx[j] <= dataBudgetPx) { sum += groupPx[j]; j++ }
          if (j === gi) j = Math.min(gi + 1, groups.length)
          const sRel = groupStartsRel[gi]
          const last = j - 1
          const eRel = groupStartsRel[last] + groups[last] - 1
          ranges.push({ sRel, eRel })
          gi = j
        }
      }

      const root = document.getElementById('pivot-print')!

      // 기존 .print-only 전부 숨김
      const olds = Array.from(root.querySelectorAll('.print-only')) as HTMLElement[]
      olds.forEach(n => n.classList.add('__hide'))

      // 인쇄 전용 스타일: body에 우리가 만든 DOM만 노출
      const style = document.createElement('style')
      style.textContent = `
        @media print {
          body > *:not(.__pivot_only_print) { display: none !important; }
          .__pivot_only_print { display: block !important; }
          
          /* 페이지 간 간격 */
          .__pivot_only_print .print-page { margin: 0 0 8mm 0 !important; }
          .__pivot_only_print .print-page:last-child { margin-bottom: 0 !important; }

          .__pivot_only_print table { width:100%; border-collapse:collapse; table-layout:auto; }
          .__pivot_only_print thead { display:table-header-group; }
          .__pivot_only_print tr { break-inside:avoid; page-break-inside:avoid; }
          .__pivot_only_print td, .__pivot_only_print th {
            border:1px solid #000; padding:4px 6px; white-space:nowrap; vertical-align:middle;
          }
          @page { size: A4 landscape; margin: 12mm; }
        }
      `
      document.head.appendChild(style)

      // 임시 인쇄 DOM을 body에 부착
      const temp = document.createElement('div')
      temp.className='__pivot_only_print'
      temp.id='pivot-print-temp'

      const title = root.querySelector('.print-title-block')
      if(title) temp.appendChild(title.cloneNode(true))

      ranges.forEach(({sRel,eRel})=>{
        const page = document.createElement('div'); page.className='print-page'
        const table = document.createElement('table')

        const thead = document.createElement('thead')
        if(hg.length){
          for(let r=0;r<hg.length;r++){
            const tr=document.createElement('tr')
            if(labelCols>0) sliceRow(hg,r,0,labelCols-1,'th',true).forEach(x=>tr.appendChild(x))
            if(dataTotal>0){
              const ds=labelCols+Math.max(0,sRel), de=labelCols+Math.max(-1,eRel)
              sliceRow(hg,r,ds,de,'th',true).forEach(x=>tr.appendChild(x))
            }
            thead.appendChild(tr)
          }
        }
        table.appendChild(thead)

        const tbody=document.createElement('tbody')
        for(let r=0;r<bg.length;r++){
          const tr=document.createElement('tr')
          if(labelCols>0) sliceRow(bg,r,0,labelCols-1,'td',true).forEach(x=>tr.appendChild(x))
          if(dataTotal>0){
            const ds=labelCols+Math.max(0,sRel), de=labelCols+Math.max(-1,eRel)
            sliceRow(bg,r,ds,de,'td',false).forEach(x=>tr.appendChild(x))
          }
          tbody.appendChild(tr)
        }
        table.appendChild(tbody)

        page.appendChild(table)
        temp.appendChild(page)
      })

      document.body.appendChild(temp)

      const cleanup = () => {
        try { document.body.removeChild(temp) } catch {}
        olds.forEach(n => n.classList.remove('__hide'))
        if (style.parentNode) style.parentNode.removeChild(style)
        window.removeEventListener('afterprint', cleanup as any)
      }
      window.addEventListener('afterprint', cleanup as any, { once:true })

      requestAnimationFrame(()=>nativePrint())
    }

    const prev = window.print
    // @ts-ignore
    window.print = printNow
    return () => {
      // @ts-ignore
      window.print = prev
    }
  }, [pivot])

  return (
      <Dialog
        open={open}
        onClose={handleClickClose}
        maxWidth="lg"      // 기존 그대로
        fullWidth          // 기존 그대로
        PaperProps={{
          id: 'pivot-print',
          sx: {
            width: '95vw',      // 화면 가로 95%
            maxWidth: '1400px', // 너무 넓어지지 않게 상한
            height: '90vh',     // 화면 세로 90%
            maxHeight: '90vh',
          },
        }}
      >
      <DialogContent>
        {/* 프린트 전용 CSS (원본 유지) */}
        <style>{`
        #pivot-print .print-only  { display: none !important; }
        #pivot-print .screen-only { display: block !important; }
        #pivot-print .print-page  { display: none; }

        @media print {
          #pivot-print #pivot-actions,
          #pivot-print .screen-only { display: none !important; }
          #pivot-print .print-only  { display: block !important; }

          .MuiDialog-container { align-items: flex-start !important; }
          #pivot-print .MuiDialog-paper,
          #pivot-print .MuiPaper-root {
            width: auto !important;  max-width: none !important;
            height: auto !important; max-height: none !important;
            margin: 0 !important;    box-shadow: none !important;
            overflow: visible !important;
          }

          #pivot-print .print-title-block {
            display: block !important;
            break-after: avoid !important;
            page-break-after: avoid !important;
            margin: 0 0 6mm 0 !important;
          }
          #pivot-print .print-title-block .print-title { display: block !important; }
          #pivot-print .print-title-block .print-meta  { display: flex !important; gap: 8mm; font-weight: 700; }

          #pivot-print .print-page {
            display: block !important;
            break-before: auto !important;
            page-break-before: auto !important;
            margin: 0 0 8mm 0 !important;
          }
          #pivot-print .print-page + .print-page {
            break-before: page !important;
            page-break-before: always !important;
          }

          #pivot-print .print-page:last-child { margin-bottom: 0 !important; }

          #pivot-print .print-only table {
            width: 100% !important;
            table-layout: auto !important;
            border-collapse: collapse !important;
          }
          #pivot-print .print-only thead { display: table-header-group !important; }
          #pivot-print .print-only tfoot { display: table-footer-group !important; }
          #pivot-print .print-only tr {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
          #pivot-print .print-only .MuiTableContainer-root {
            overflow: visible !important;
          }
          #pivot-print .print-only .MuiTableCell-root {
            white-space: nowrap !important;
            word-break: keep-all !important;
            overflow: visible !important;
            text-overflow: clip !important;

            font-size: 10.5pt !important;
            line-height: 1.35 !important;
            padding: 4px 6px !important;
            vertical-align: middle !important;
            font-variant-numeric: tabular-nums;
          }

          @page { size: A4 landscape; margin: 12mm; }
        }
        `}</style>

        {/* 액션 버튼 (원본 유지) */}
        <Box id="pivot-actions" className="table-bottom-button-group" sx={{ mb: 1 }}>
          <div className="button-right-align" style={{ display: 'flex', gap: 8 }}>
            <Button variant="contained" color="success" onClick={() => window.print()}>출력</Button>
            <Button
              variant="contained"
              color="success"
              onClick={() => pivot && downloadPivotAsExcelText(pivot, pivot?.title)}
            >
              엑셀
            </Button>
            <Button variant="contained" color="dark" onClick={handleClickClose}>닫기</Button>
          </div>
        </Box>

        {/* 화면용 뷰 (원본 유지) */}
        <div className="screen-only">
          <h2 style={{ marginTop: 10, textAlign: 'center' }}>
            {params?.title ?? pivot?.title ?? '출력 결과'}
          </h2>
            <dl style={{ fontWeight: 'bold' }}>
              <div>
                <dt style={{ display: 'inline-block', width: '70px' }}>기간</dt>
                <dd style={{ display: 'inline-block' }}>
                  : {params?.bgngDt ?? ''} ~ {params?.endDt ?? ''}
                </dd>
              </div>
              {(params?.ctpvNm || params?.locgovNm) && (
                <div>
                  <dt style={{ display: 'inline-block', width: '70px' }}>관할관청</dt>
                  <dd style={{ display: 'inline-block' }}>
                    : {params.ctpvNm && params.locgovNm
                        ? `${params.ctpvNm} ${params.locgovNm}`
                        : (params.ctpvNm || params.locgovNm)}
                  </dd>
                </div>
              )}
            </dl>


          <Box sx={{ mt: 2 }}>
            <RenderPivotTable data={pivot} />
          </Box>
        </div>

        {/* 프린트 전용 뷰: fallback (실제 인쇄는 window.print에서 생성) */}
        <div className="print-only">
          <div className="print-title-block">
            <h2 className="print-title" style={{ marginTop: 0, textAlign: 'center' }}>
              {params?.title ?? pivot?.title ?? '출력 결과'}
            </h2>
            <div className="print-meta" style={{ display:'flex', gap:'8mm', fontWeight:700, margin:'0 0 6mm' }}>
              <div>기간 : {params?.bgngDt ?? ''} ~ {params?.endDt ?? ''}</div>
              {params?.locgovNm && <div>관할관청 : {params.locgovNm}</div>}
            </div>
          </div>

          <div className="print-page">
            <RenderPivotTable data={pivot} />
          </div>
        </div>

      </DialogContent>
    </Dialog>
  )
}

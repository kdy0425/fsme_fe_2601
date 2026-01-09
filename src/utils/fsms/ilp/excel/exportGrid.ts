// utils/fsms/ilp/excel/exportGrid.ts
import * as XLSX from 'xlsx'

export type HeadCell = {
  id: string
  label: string
  group?: string | null         
  [k: string]: any
}

function toPlain(v: any): string {
  if (v == null) return ''
  const t = typeof v
  if (t === 'string' || t === 'number' || t === 'boolean') return String(v)
  if (v?.props?.children != null) return toPlain(v.props.children)
  if (Array.isArray(v)) return v.map(toPlain).join(', ')
  if (v && typeof v === 'object' && 'text' in v) return toPlain((v as any).text)
  return ''
}

export function exportGridToXlsx(params: {
  headCells: HeadCell[]
  rows: any[]
  filename?: string
  sheetName?: string
  groupHeaders?: (string | null | undefined)[]  // 옵션
  titleLines?: string[]                         // 선택: 상단 제목 줄들
}) {
  const {
    headCells,
    rows,
    filename = 'export.xlsx',
    sheetName = 'Sheet1',
    groupHeaders,
    titleLines = [],
  } = params

  const headers = headCells.map(h => toPlain(h.label))
  const keys    = headCells.map(h => h.id)
  const data    = rows.map(r => keys.map(k => toPlain((r as any)[k])))

  const aoa: any[][] = []
  for (const line of titleLines) aoa.push([line])

  const merges: XLSX.Range[] = []

  // 두 줄 헤더 적용 (옵션)
  if (groupHeaders && groupHeaders.length === headers.length) {
    const topRow = groupHeaders.map(g => g ?? '')
    aoa.push(topRow)
    aoa.push(headers)

    // 가로/세로 병합 계산
    let s = 0
    while (s < headers.length) {
      const g = groupHeaders[s] ?? ''
      let e = s
      while (e + 1 < headers.length && (groupHeaders[e + 1] ?? '') === g) e++

      const topR = titleLines.length + 0
      const botR = titleLines.length + 1
      if (g) {
        // 같은 그룹명이 연속된 구간: 가로 병합 (topRow)
        merges.push({ s: { r: topR, c: s }, e: { r: topR, c: e } })
      } else {
        // 그룹 없음(단독 컬럼): 세로 병합 (topRow ↔ headerRow)
        merges.push({ s: { r: topR, c: s }, e: { r: botR, c: s } })
      }
      s = e + 1
    }
  } else {
    // 1줄 헤더
    aoa.push(headers)
  }

  // 데이터
  aoa.push(...data)

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet(aoa)

  if (merges.length) (ws as any)['!merges'] = merges

  // 컬럼 너비 추정
  const colWidths = headers.map((_, ci) => {
    const maxLen = Math.max(
      headers[ci]?.length ?? 10,
      ...data.map(row => (row[ci] ? String(row[ci]).length : 0)),
    )
    return { wch: Math.min(Math.max(maxLen + 2, 8), 60) }
  })
  ;(ws as any)['!cols'] = colWidths

  XLSX.utils.book_append_sheet(wb, ws, sheetName)
  XLSX.writeFile(wb, filename)
}

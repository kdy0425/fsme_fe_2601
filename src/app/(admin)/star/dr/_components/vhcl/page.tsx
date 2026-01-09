'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Button, Box, Typography } from '@mui/material'
import PageContainer from '@/components/container/PageContainer'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { getUserInfo } from '@/utils/fsms/utils'
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
  Legend,
} from 'recharts'

/** API Row */
export interface RptpRow {
  crtrYyyy?: string | null
  crtrMm?: string | null
  crtrYm?: string | null        // YYYYMM
  rptpVl?: string | number | null
  seNm?: string | null          // ✅ 서버 카테고리명 (버스/화물/택시…)
  seCd?: string | null          // 보조
  taskSeCd?: string | null      // 보조
}

interface Params {
  bgngDt: string
  endDt: string
  rptpSeCd: string
  ctpvCd: string
  locgovCd: string
  groupSeCd?: string
}

/** 순서 고정: 화물 → 버스 → 택시 */
const ORDER = ['화물', '버스', '택시'] as const
type Cat = typeof ORDER[number]
const COLOR: Record<Cat, string> = { 화물: '#06B6D4', 버스: '#4F46E5', 택시: '#F59E0B' }

const ymLabel = (ym: string) => `${ym.slice(0, 4)}년 ${ym.slice(4, 6)}월`
const fmtK = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 0 })

/** seNm 우선, 없으면 코드 보조 */
const getCat = (r: RptpRow): Cat | '기타' => {
  const nm = (r.seNm ?? '').replace(/\s+/g, '')
  if (nm.includes('화물')) return '화물'
  if (nm.includes('버스')) return '버스'
  if (nm.includes('택시')) return '택시'
  const cd = (r.taskSeCd || r.seCd || '').toUpperCase()
  if (cd === 'TR') return '화물'
  if (cd === 'BS') return '버스'
  if (cd === 'TX') return '택시'
  return '기타'
}

const toYm = (r: RptpRow) => {
  if (r.crtrYm) return String(r.crtrYm)
  const y = (r.crtrYyyy ?? '').replace(/\D/g, '')
  const m = (r.crtrMm ?? '').replace(/\D/g, '')
  return y && m ? `${y}${m.padStart(2, '0')}` : null
}
/** ✅ 현재월 기준: bgngDt = 현재월-6, endDt = 현재월-1 (둘 다 YYYYMM) */
const getYmRangeForMonths = () => {
  const now = new Date()

  // 종료: 현재월 -1 (지난달 1일 기준)
  const endBase = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endDt =
    String(endBase.getFullYear()) +
    String(endBase.getMonth() + 1).padStart(2, '0')

  // 시작: 현재월 -6 (6개월 전 1일 기준)
  const startBase = new Date(now.getFullYear(), now.getMonth() - 5, 1)
  const bgngDt =
    String(startBase.getFullYear()) +
    String(startBase.getMonth() + 1).padStart(2, '0')

  return { bgngDt, endDt }
}

const VhclComponent = () => {
  const userInfo = getUserInfo()
  const [loading, setLoading] = useState(false)
  const [rows, setRows] = useState<RptpRow[]>([])
  const chartHostRef = useRef<HTMLDivElement>(null)

    // ✅ 현재월-6 ~ 현재월-1 구간 계산
  const { bgngDt, endDt } = getYmRangeForMonths()

  const [params] = useState<Params>({
    bgngDt, // 예: 현재월이 2025-11이면 202505
    endDt,  // 예: 202510
    rptpSeCd: 'VHCL',
    ctpvCd: userInfo.locgovCd || '',
    locgovCd: userInfo.locgovCd || '',
    groupSeCd: 'TASK', // seNm 내려오게
  })

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const endpoint =
          `/fsm/star/ssr/cm/getAllStrctStatsRptp?` +
          `rptpSeCd=${params.rptpSeCd}` +
          `&gubun=Dash` +
          `${params.bgngDt ? '&bgngDt=' + params.bgngDt : ''}` +
          `${params.endDt ? '&endDt=' + params.endDt : ''}` +
          //`${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
          `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
          `${params.groupSeCd ? '&groupSeCd=' + params.groupSeCd : ''}`

        const res = await sendHttpRequest('GET', endpoint, null, true, { cache: 'no-store' })
        const list: RptpRow[] =
          res?.resultType === 'success'
            ? (Array.isArray(res.data) ? res.data : (res.data?.content ?? []))
            : []
        setRows(list ?? [])
      } catch {
        setRows([])
      } finally {
        setLoading(false)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /** 최신 3개월 */
  const last5Yms = useMemo(() => {
    const uniq = Array.from(new Set(rows.map(toYm).filter((v): v is string => !!v))).sort()
    return uniq.slice(-5)
  }, [rows])

  /** 월별 피벗(개)) — ORDER 3키 항상 포함 */
  const data = useMemo(() => {
    if (!last5Yms.length) return []
    const base: Record<Cat, number> = { 화물: 0, 버스: 0, 택시: 0 }
    const acc = new Map<string, Record<Cat, number>>()
    for (const ym of last5Yms) acc.set(ym, { ...base })

    for (const r of rows) {
      const ym = toYm(r)
      if (!ym || !acc.has(ym)) continue
      const cat = getCat(r)
      if (cat === '기타') continue
      const v = Number(r.rptpVl ?? 0)
      if (!Number.isFinite(v)) continue
      acc.get(ym)![cat as Cat] += v 
    }

    return last5Yms.map((ym) => ({ month: ymLabel(ym), ...acc.get(ym)! }))
  }, [rows, last5Yms])

  const rangeLabel =
    last5Yms.length ? `${ymLabel(last5Yms[0])} ~ ${ymLabel(last5Yms[last5Yms.length - 1])}` : ''

  /** ✅ 프린트: SVG→PNG 스냅샷 후 새 창에서 인쇄(잘림 방지) */
  const handlePrint = () => {
    const host = chartHostRef.current
    if (!host) return window.print()
    const svg = host.querySelector('svg') as SVGSVGElement | null
    if (!svg) return window.print()

    const rect = svg.getBoundingClientRect()
    const width = Math.max(1, Math.round(rect.width))
    const height = Math.max(1, Math.round(rect.height))
    const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1))

    const serializer = new XMLSerializer()
    const svgStr = serializer.serializeToString(svg)
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)

    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = width * dpr
      canvas.height = height * dpr
      const ctx = canvas.getContext('2d')!
      ctx.scale(dpr, dpr)
      ctx.drawImage(img, 0, 0, width, height)
      URL.revokeObjectURL(url)

      const pngUrl = canvas.toDataURL('image/png')

      const w = window.open('', '_blank')
      if (!w) return
      w.document.write(`
        <html>
          <head>
            <meta charset="utf-8"/>
            <title>${document.title}</title>
            <style>
              @page { size: A4; margin: 8mm; }
              html, body { height: 100%; margin: 0; }
              body { display: flex; align-items: flex-start; justify-content: center; }
              img { max-width: 194mm; height: auto; }
              .caption { font: 12px/1.4 system-ui, -apple-system, Segoe UI, Roboto, sans-serif; color: #666; margin-top: 6px; text-align: right; }
            </style>
          </head>
          <body>
            <div>
              <img src="${pngUrl}" alt="chart"/>
              <div class="caption">단위: 개</div>
            </div>
            <script>window.onload = () => { window.print(); setTimeout(()=>window.close(), 300); };</script>
          </body>
        </html>
      `)
      w.document.close()
      w.focus()
    }
    img.onerror = () => window.print()
    img.src = url
  }
  const orderIndex = (s: string) => {
    const i = (ORDER as readonly string[]).indexOf(s);
    return i === -1 ? 999 : i;
  };
  return (
    <PageContainer title="대시보드 유가보조금" description="대시보드 유가보조금">
      {/* 상단: 제목/기간 + 출력 */}
      <Box sx={{ mb: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
          <CustomFormLabel sx={{ mb: 0 }}>최근 5개월 집계</CustomFormLabel>
          <Typography variant="body2" color="text.secondary">{rangeLabel}</Typography>
        </Box>
        <Button variant="contained" color="success" onClick={handlePrint}>출력</Button>
      </Box>

      {/* 차트 */}
      <Box id="print-area">
        <Box
          id="chartHost"
          ref={chartHostRef}
          sx={{
            p: 2,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            background:
              'linear-gradient(180deg, rgba(99,102,241,0.04) 0%, rgba(6,182,212,0.04) 100%)',
            height: 420,
          }}
        >
          {loading ? (
            <Box sx={{ p: 2 }}>로딩 중…</Box>
          ) : !data.length ? (
            <Box sx={{ p: 2, color: 'text.secondary' }}>데이터가 없습니다.</Box>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                barGap={6}
                barCategoryGap="28%"
                margin={{ top: 12, right: 64, bottom: 28, left: 64 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} interval={0} />
                <YAxis
                  allowDecimals={false}
                  tickFormatter={(v) => fmtK(Number(v))}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  formatter={(v: number, name: string) => [`${fmtK(v)} 개`, name]}
                  labelFormatter={(label: string) => label}
                  itemSorter={(item: any) => orderIndex(String(item.name))}
                />

                {/* ✅ 범례 순서도 Bar 선언 순서를 그대로 따름(화물→버스→택시) */}
                <Legend
                  verticalAlign="top"
                  align="center"
                  wrapperStyle={{ paddingBottom: 8 }}
                  content={(props) => {
                    const p = (props && Array.isArray((props as any).payload)) ? (props as any).payload : [];
                    const sorted = p.slice().sort((a: any, b: any) =>
                      ORDER.indexOf(String(a.value) as any) - ORDER.indexOf(String(b.value) as any)
                    );
                    return (
                      <ul style={{ display: 'flex', gap: 12, justifyContent: 'center', margin: 0, padding: 0, listStyle: 'none' }}>
                        {sorted.map((it: any) => (
                          <li key={it.value} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ width: 10, height: 10, display: 'inline-block', background: it.color }} />
                            <span>{it.value}</span>
                          </li>
                        ))}
                      </ul>
                    );
                  }}
                />

                {/* ✅ 막대/범례 순서 고정 */}
                {ORDER.map((key) => (
                  <Bar
                    key={key}
                    dataKey={key}
                    name={key}
                    fill={COLOR[key]}
                    radius={[8, 8, 0, 0]}
                    minPointSize={6}
                  >
                    <LabelList
                      position="top"
                      formatter={(label: React.ReactNode) => {
                        const v = typeof label === 'number' ? label : Number(label);
                        return v ? fmtK(v) : '0';
                      }}
                    />
                  </Bar>
                ))}
              </BarChart>
            </ResponsiveContainer>
          )}
        </Box>

        <Typography variant="caption" sx={{ mt: 0.5, display: 'block', color: 'text.secondary' }}>
          단위: 개
        </Typography>
      </Box>
    </PageContainer>
  )
}

export default VhclComponent

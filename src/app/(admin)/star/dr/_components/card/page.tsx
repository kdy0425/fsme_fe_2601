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
  PieChart,
  Pie,
  Cell,
  Label,
} from 'recharts'

/** API Row (클라이언트 내부에서 사용하는 표준 형태) */
export interface RptpRow {
  crtrYyyy?: string | null
  crtrMm?: string | null
  crtrYm?: string | null        // YYYYMM
  rptpVl?: number | string | null
  seNm?: string | null          // 차량군명 (버스/화물/택시)
  seCd?: string | null
  taskSeCd?: string | null
  crdcoCd?: string | null       // 카드사 코드 (KB/WR/…)
  crdNm?: string | null         // 카드사 한글명 (국민/우리/…)
}

/** API 파라미터 */
interface Params {
  bgngDt: string
  endDt: string
  rptpSeCd: string
  ctpvCd: string
  locgovCd: string
  groupSeCd?: string
}

/** 차량군 표시 순서 고정 */
const ORDER = ['화물', '버스', '택시'] as const
type Cat = typeof ORDER[number]

/** 카드사 시리즈 순서 & 색 + '합계' 폴백(코드 기준) */
const CARD_ORDER = ['합계', 'KB', 'WR', 'SH', 'SS', 'HD', 'LT'] as const
const CARD_COLOR: Record<string, string> = {
  합계: '#475569', KB: '#2563EB', WR: '#10B981', SH: '#06B6D4', SS: '#F59E0B', HD: '#EF4444', LT: '#8B5CF6',
}
const cardIndex = (code: string) => {
  const i = (CARD_ORDER as readonly string[]).indexOf(code)
  return i === -1 ? 999 : i
}

/** 유틸 */
const ymLabel = (ym: string) => `${ym.slice(0, 4)}년 ${ym.slice(4, 6)}월`
const fmtK = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 0 })
/*
const seededRand01 = (seed: string) => {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return ((h >>> 0) % 1000) / 1000
}
const jitterInt13 = (key: string, ym: string) =>
  1 + Math.floor(seededRand01(`${key}@${ym}`) * 10) // 1~10 정수
*/
/** 서버 컬럼 정규화 */
const normalizeRow = (r: any): RptpRow => ({
  crtrYm: String(r.crtrYm ?? r.CRTR_YM ?? r.crd_ym ?? r.crtr_ym ?? ''),
  crtrYyyy: r.crtrYyyy ?? r.CRTR_YYYY ?? r.crtr_yyyy ?? null,
  crtrMm: r.crtrMm ?? r.CRTR_MM ?? r.crtr_mm ?? null,
  rptpVl: Number(r.rptpVl ?? r.RPTP_VL ?? r.rptp_vl ?? 0),
  seNm: (r.seNm ?? r.SE_NM ?? r.se_nm ?? null),
  seCd: r.seCd ?? r.SE_CD ?? r.se_cd ?? null,
  taskSeCd: r.taskSeCd ?? r.TASK_SE_CD ?? r.task_se_cd ?? null,
  crdcoCd: r.crdcoCd ?? r.CRDCO_CD ?? r.crdco_cd ?? null,
  crdNm: r.crdNm ?? r.CRD_NM ?? r.crd_nm ?? null,
})

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

/** 월별 × 카드사 피벗 (특정 차량군만) */
const getCardCode = (r: RptpRow | any) => {
  const v = String(r.crdcoCd ?? r.CRDCO_CD ?? r.crdco_cd ?? '').trim()
  return v || '합계'
}
const buildMonthlyByCard = (cat: Cat, rows: RptpRow[], months: string[]) => {
  const seriesSet = new Set<string>()
  const nameMap: Record<string, string> = {} // 코드→한글명
  const acc = new Map<string, Record<string, number>>()
  for (const ym of months) acc.set(ym, {})

  for (const r of rows) {
    const ym = toYm(r)
    if (!ym || !acc.has(ym)) continue
    if (getCat(r) !== cat) continue

    const code = getCardCode(r)
    const name = (String(r.crdNm ?? '').trim()) || (code === '합계' ? '합계' : code)
    const v = Number(r.rptpVl ?? 0)
    if (!Number.isFinite(v)) continue

    const row = acc.get(ym)!
    row[code] = (row[code] ?? 0) + v
    seriesSet.add(code)
    if (!nameMap[code]) nameMap[code] = name
  }

  const series = Array.from(seriesSet).sort(
    (a, b) => cardIndex(a) - cardIndex(b) || a.localeCompare(b),
  )
  const data = months.map((ym) => {
    const row = acc.get(ym)!
    const item: Record<string, number | string> = { ym }
    for (const s of series) {
      const v0 = row[s] ?? 0
      item[s] = v0 
    }
    return item
  })
  return { data, series, nameMap }
}

const CardComponent = () => {
  const userInfo = getUserInfo()


  /** 관리자 판별 (roles, auths, rollYn 모두 커버) */
  const isAdmin = useMemo(() => {
    const roles = (userInfo?.roles ?? []).map((s: any) => String(s).toUpperCase())
    const auths = (userInfo?.auths ?? []).map((s: any) => String(s).toUpperCase())
    return (
      roles.includes('MOLIT') ||
      roles.includes('ADMIN') ||
      userInfo?.rollYn === 'Y'
    )
  }, [userInfo])

  const [loading, setLoading] = useState(false)
  const [rows, setRows] = useState<RptpRow[]>([])
  const chartHostRef = useRef<HTMLDivElement>(null)

  // 차트별(화물/버스/택시) 선택 월 (해제/토글 없음: 다른 월 클릭 시 교체만)
  const [selectedYmByCat, setSelectedYmByCat] = useState<Partial<Record<Cat, string>>>({})

  const rptpSeCd = 'CARD'
  const groupSeCd = 'TASK'
  /*const ctpvCd = isAdmin
    ? (
        String(((userInfo as any)?.ctpvCd ?? (userInfo as any)?.authCtpvCd ?? '')).trim()
        || String(userInfo?.locgovCd ?? '').trim().slice(0, 2) // locgovCd 앞 2자리로 시도코드 대체
      )
    : ''
  const locgovCd = !isAdmin
    ? String(userInfo?.locgovCd ?? '').trim()
    : ''*/
  const ctpvCd = String(userInfo?.locgovCd ?? '').trim(); 
  const locgovCd = String(userInfo?.locgovCd ?? '').trim();
  const bgngDt = ''   // 항상 key 포함해서 전송해야 하므로 기본은 빈 문자열
  const endDt = ''    // 서버에서 기본기간 결정

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        //if (isAdmin && !ctpvCd) return
        //if (!isAdmin && !locgovCd) return

        const endpoint =
          `/fsm/star/ssr/cm/getAllStrctStatsRptp?` +
          `rptpSeCd=${rptpSeCd}` +
          `&gubun=Dash` +
          //(isAdmin ? `&ctpvCd=${ctpvCd}` : `&locgovCd=${locgovCd}`) +
          `&locgovCd=${locgovCd}` +
          `&groupSeCd=${groupSeCd}`+
          `&bgngDt=${bgngDt}` +
          `&endDt=${endDt}` ;

        console.log('[stats-rptp] isAdmin=', isAdmin, 'ctpvCd=', ctpvCd, 'locgovCd=', locgovCd, 'endpoint=', endpoint)

        const res = await sendHttpRequest('GET', endpoint, null, true, { cache: 'no-store' })
        const list =
          res?.resultType === 'success'
            ? (Array.isArray(res.data) ? res.data : (res.data?.content ?? []))
            : []
        setRows((list ?? []).map(normalizeRow))
      } catch {
        setRows([])
      } finally {
        setLoading(false)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, ctpvCd, locgovCd])

  /** 최신 3개월 (데이터에 있는 연월 기준) */
  const last3Yms = useMemo(() => {
    const uniq = Array.from(new Set(rows.map(toYm).filter((v): v is string => !!v))).sort()
    return uniq.slice(-3)
  }, [rows])

// ⬇️ 처음 로드되면 3개월 중 "가장 최근 월"을 기본 선택으로 세팅(누적 대신 단월 표기)
  useEffect(() => {
    if (!last3Yms.length) return
    const latest = last3Yms[last3Yms.length - 1]
    setSelectedYmByCat((prev) => {
      const next = {
        화물: prev.화물 ?? latest,
        버스: prev.버스 ?? latest,
        택시: prev.택시 ?? latest,
      }
      // 변화 없으면 동일 객체 반환(불필요 리렌더 방지)
      if (
        next.화물 === prev.화물 &&
        next.버스 === prev.버스 &&
        next.택시 === prev.택시
      ) return prev
      return next
    })
  }, [last3Yms])

  /** 3개 차트용 데이터 (월별 × 카드사별) */
  const chartCargo = useMemo(() => buildMonthlyByCard('화물', rows, last3Yms), [rows, last3Yms])
  const chartBus   = useMemo(() => buildMonthlyByCard('버스', rows, last3Yms),  [rows, last3Yms])
  const chartTaxi  = useMemo(() => buildMonthlyByCard('택시', rows, last3Yms),  [rows, last3Yms])

  const rangeLabel =
    last3Yms.length ? `${ymLabel(last3Yms[0])} ~ ${ymLabel(last3Yms[last3Yms.length - 1])}` : ''

  /** 출력: (여러 SVG 캡처 지원) 세 차트를 PNG로 스냅샷 후 A4에 배치 */
  const handlePrint = async () => {
    const host = chartHostRef.current
    if (!host) { window.print(); return }

    const cards = Array.from(host.querySelectorAll<HTMLElement>('[data-chart-card]'))
    const items = cards.map((card) => {
      const title = card.getAttribute('data-chart-card') || ''
      const svgs = Array.from(card.querySelectorAll('svg')) as SVGSVGElement[]
      return { title, svgs }
    }).filter((x) => x.svgs.length)

    if (!items.length) { window.print(); return }

    const toPng = (svg: SVGSVGElement) =>
      new Promise<string>((resolve) => {
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
          resolve(canvas.toDataURL('image/png'))
        }
        img.onerror = () => { URL.revokeObjectURL(url); resolve('') }
        img.src = url
      })

    const dataUrlsPerCard = await Promise.all(
      items.map(async ({ svgs }) => Promise.all(svgs.map((s) => toPng(s))))
    )

    const w = window.open('', '_blank')
    if (!w) return
    const blocks = dataUrlsPerCard.map((srcList, i) => {
      const title = items[i].title
      const imgs = srcList.map((src) => `<img src="${src}" alt="${title}" />`).join('')
      return `<div class="block"><div class="title">${title}</div>${imgs}</div>`
    }).join('')

    w.document.write(`
      <html>
        <head>
          <meta charset="utf-8"/>
          <title>${document.title}</title>
          <style>
            @page { size: A4; margin: 8mm; }
            html, body { height: 100%; margin: 0; }
            body { font: 12px/1.4 system-ui, -apple-system, Segoe UI, Roboto, sans-serif; color: #111; }
            .block { break-inside: avoid; page-break-inside: avoid; margin-bottom: 10mm; }
            .title { font-weight: 600; margin: 2mm 0 3mm; }
            img { width: 194mm; max-width: 100%; height: auto; display: block; margin-bottom: 3mm; }
            .caption { color: #666; text-align: right; margin-top: 2mm; }
          </style>
        </head>
        <body>
          ${blocks}
          <div class="caption">단위: 개</div>
          <script>window.onload = () => { window.print(); setTimeout(()=>window.close(), 300); };</script>
        </body>
      </html>
    `)
    w.document.close()
    w.focus()
  }

  return (
    <PageContainer title="대시보드 유가보조금" description="대시보드 유가보조금">
      {/* 상단: 제목/기간 + 출력 */}
      <Box sx={{ mb: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
          <CustomFormLabel sx={{ mb: 0 }}>최근 3개월 집계</CustomFormLabel>
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
            background: 'linear-gradient(180deg, rgba(99,102,241,0.04) 0%, rgba(6,182,212,0.04) 100%)',
            height: 'auto',
          }}
        >
          <style>{`
            #chartHost :focus { outline: none !important; }
            #chartHost .recharts-wrapper,
            #chartHost .recharts-surface,
            #chartHost svg { outline: none !important; }
          `}</style>
          {loading ? (
            <Box sx={{ p: 2 }}>로딩 중…</Box>
          ) : !last3Yms.length ? (
            <Box sx={{ p: 2, color: 'text.secondary' }}>데이터가 없습니다.</Box>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gridAutoRows: 'minmax(280px, auto)', gap: 2 }}>
              {[{ title: '화물', ...chartCargo }, { title: '버스', ...chartBus }, { title: '택시', ...chartTaxi }].map(({ title, data, series, nameMap }) => {
                const cat = title as Cat
                const selectedYm = selectedYmByCat[cat] // 해제 없음

                // 클릭 가능한 X축 Tick 컴포넌트 (ym 전달)
                const ClickableTick = (props: any) => {
                  const { x, y, payload } = props
                  const ym: string = payload?.value
                  return (
                    <g onClick={() => setSelectedYmByCat(s => ({ ...s, [cat]: ym }))} style={{ cursor: 'pointer' }}>
                      <text x={x} y={y + 10} textAnchor="middle" fontSize={12} fill={selectedYm === ym ? '#111' : '#666'}>
                        {ymLabel(ym)}
                      </text>
                    </g>
                  )
                }

                // 원형 데이터: 선택 월 단건 vs 누적
                const calcPieValue = (key: string) => {
                  if (selectedYm) {
                    const row = (data as any[]).find((r) => r.ym === selectedYm)
                    return Number((row as any)?.[key] ?? 0)
                  }
                  return (data as any[]).reduce((sum, row) => sum + Number((row as any)?.[key] ?? 0), 0)
                }

                const pieRaw = series.map((key: string) => ({
                  key,
                  name: nameMap?.[key] || key,
                  value: calcPieValue(key),
                }))
                const pieTotal = pieRaw.reduce((s, d) => s + (Number.isFinite(d.value) ? d.value : 0), 0)
                const pieData =
                  pieTotal === 0
                    ? [{ key: '__empty__', name: '데이터 없음', value: 1 }]
                    : pieRaw.sort((a, b) => cardIndex(a.key) - cardIndex(b.key) || a.name.localeCompare(b.name))

                return (
                  <Box key={title} data-chart-card={title}
                   tabIndex={-1}
                   sx={{
                   p: 1.5,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    background: '#fff',
                    height: '100%',
                    outline: 'none',
                    '&:focus, &:focus-visible': { outline: 'none' },
                  }} >
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>{title}</Typography>
                    {(!series || !series.length) ? (
                      <Box sx={{ p: 2, color: 'text.secondary' }}>데이터가 없습니다.</Box>
                    ) : (
                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr' }, gap: 1.5 }}>
                        {/* 왼쪽: 막대 (X축 라벨 클릭으로 월 선택, hover 박스 제거) */}
                        <ResponsiveContainer width="100%" height={220}>
                          <BarChart
                            data={data}
                            barGap={6}
                            barCategoryGap="28%"
                            margin={{ top: 8, right: 16, bottom: 8, left: 32 }}
                            style={{ outline: 'none', cursor: 'pointer' }}
                            onClick={(state: any) => {
                             // Recharts가 클릭 시 넘겨주는 상태 객체에 activeLabel 넘김
                              const ym = state?.activeLabel;
                              if (ym) setSelectedYmByCat((s) => ({ ...s, [cat]: String(ym) }));
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                              dataKey="ym"
                              interval={0}
                              tickLine={false}
                              tick={<ClickableTick />}
                            />
                            <YAxis
                              allowDecimals={false}
                              tickFormatter={(v) => fmtK(Number(v))}
                              tick={{ fontSize: 12 }}
                              domain={[0, (dataMax: number) => (dataMax === 0 ? 1 : Math.ceil(dataMax))]}
                            />
                            <Tooltip
                              cursor={false}
                              formatter={(v: number, name: string) => [`${fmtK(Number(v))} 개`, name]}
                              labelFormatter={(value: any) => ymLabel(String(value))}
                              itemSorter={(item: any) => cardIndex(String(item?.dataKey || '합계'))}
                            />
                            <Legend
                              verticalAlign="top"
                              align="center"
                              wrapperStyle={{ paddingBottom: 40 }}
                              content={(props) => {
                                const p = Array.isArray((props as any).payload) ? (props as any).payload : []
                                const sorted = p.slice().sort(
                                  (a: any, b: any) => cardIndex(String(a.dataKey)) - cardIndex(String(b.dataKey))
                                )
                                return (
                                  <ul style={{ display: 'flex', gap: 8, justifyContent: 'center', margin: 0, padding: 0, listStyle: 'none' }}>
                                    {sorted.map((it: any) => (
                                      <li key={it.dataKey} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <span style={{ width: 10, height: 10, display: 'inline-block',
                                          background: CARD_COLOR[it.dataKey] || it.color || '#999' }} />
                                        <span>{nameMap?.[it.dataKey] || it.value}</span>
                                      </li>
                                    ))}
                                  </ul>
                                )
                              }}
                            />
                            {series.map((key: string) => (
                              <Bar
                                key={key}
                                dataKey={key}
                                name={nameMap?.[key] || key}
                                fill={CARD_COLOR[key] || '#8884d8'}
                                radius={[8, 8, 0, 0]}
                                minPointSize={6}
                              >
                                <LabelList
                                 
                                  position="top"
                                  formatter={(label: React.ReactNode) => {
                                    const v = Number(label)
                                    return Number.isFinite(v) ? fmtK(v) : '0'
                                  }}
                                />
                              </Bar>
                            ))}
                          </BarChart>
                        </ResponsiveContainer>

                        {/* 오른쪽: 선택 월 단건 or 최근 3개월 누적 도넛 */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                              <Pie
                                data={pieData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius="75%"
                                innerRadius="45%"
                                isAnimationActive
                              >
                                {pieData.map((entry) => (
                                  <Cell
                                    key={entry.key}
                                    fill={entry.key === '__empty__' ? '#e5e7eb' : (CARD_COLOR[entry.key] || '#8884d8')}
                                  />
                                ))}
                                {pieTotal === 0 && <Label value="0" position="center" fill="#64748b" />}
                                {pieTotal > 0 && (
                                  <LabelList
                                    dataKey="value"
                                    position="outside"
                                    formatter={(label: React.ReactNode) => {
                                      const v = Number(label)
                                      return Number.isFinite(v) ? fmtK(v) : '0'
                                    }}
                                  />
                                )}
                              </Pie>
                              {pieTotal > 0 && (
                                <Tooltip cursor={false} formatter={(v: number, name: string) => [`${fmtK(Number(v))} 개`, name]} />
                              )}
                            </PieChart>
                          </ResponsiveContainer>
                          <Typography variant="caption" sx={{ mt: 0.5, color: 'text.secondary', textAlign: 'center' }}>
                            {selectedYmByCat[cat]
                              ? `${ymLabel(selectedYmByCat[cat] as string)} 실적`
                              : `${rangeLabel ? ` · ${rangeLabel}` : ''}`}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </Box>
                )
              })}
            </Box>
          )}
        </Box>

        <Typography variant="caption" sx={{ mt: 0.5, display: 'block', color: 'text.secondary' }}>
          단위: 개 (오른쪽 원형은 선택 월 단건)
        </Typography>
      </Box>
    </PageContainer>
  )
}

export default CardComponent

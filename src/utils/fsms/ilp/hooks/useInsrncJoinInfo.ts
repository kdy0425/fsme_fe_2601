
// src/utils/fsms/ilp/hooks/useInsrncJoinInfo.ts
import { useEffect, useRef, useState, useCallback } from 'react'
import {
  fetchInsrncJoinInfo,
  InsrncJoinInfoParams,
  InsrncJoinInfoRow,
} from '@/utils/fsms/ilp/services/insrncJoinInfo'

type UseInsrncJoinInfoOptions = {
  enabled?: boolean
}

export function useInsrncJoinInfo(
  params?: Partial<InsrncJoinInfoParams>,   // endpoint 포함 가능
  opts: UseInsrncJoinInfoOptions = {}
) {
  const { enabled = true } = opts
  const [rows, setRows] = useState<InsrncJoinInfoRow[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<unknown>(null)

  const seqRef = useRef(0)

  const run = useCallback(async (override?: Partial<InsrncJoinInfoParams>) => {
    const p: Partial<InsrncJoinInfoParams> = { page: 0, size: 10, ...params, ...override }
    if (!p.vhclNo) { setRows([]); setTotal(0); return }

    const mySeq = ++seqRef.current
    setLoading(true)
    setError(null)
    try {
      const { rows, total } = await fetchInsrncJoinInfo({
        endpoint: p.endpoint,    // 가변 엔드포인트 전달
        vhclNo: p.vhclNo!,
        ctpvCd: p.ctpvCd,
        locgovCd: p.locgovCd,
        page: p.page,
        size: p.size,
      })
      if (seqRef.current !== mySeq) return
      setRows(rows)
      setTotal(total)
    } catch (e) {
      if (seqRef.current !== mySeq) return
      setError(e)
      setRows([])
      setTotal(0)
    } finally {
      if (seqRef.current === mySeq) setLoading(false)
    }
  }, [params])

  useEffect(() => {
    if (!enabled) return
    if (!params?.vhclNo) { setRows([]); setTotal(0); return }
    run()
  }, [enabled, params?.vhclNo, params?.ctpvCd, params?.locgovCd, params?.page, params?.size, params?.endpoint, run])

  return { rows, total, loading, error, refetch: run }
}

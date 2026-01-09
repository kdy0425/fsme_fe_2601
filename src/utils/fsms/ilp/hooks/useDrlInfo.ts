
// src/utils/fsms/ilp/hooks/useInsrncJoinInfo.ts
import { useEffect, useRef, useState, useCallback } from 'react'
import {
  fetchDrlInfo,
  DrlInfoParams,
  DrlInfoRow,
} from '@/utils/fsms/ilp/services/drlInfo'

type UseDrlInfoOptions = {
  enabled?: boolean
}

export function useDrlInfo(
  params?: Partial<DrlInfoParams>,   // endpoint 포함 가능
  opts: UseDrlInfoOptions = {}
) {
  const { enabled = true } = opts
  const [rows, setRows] = useState<DrlInfoRow[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<unknown>(null)

  const seqRef = useRef(0)

  const run = useCallback(async (override?: Partial<DrlInfoParams>) => {
    const p: Partial<DrlInfoParams> = { page: 0, size: 10, ...params, ...override }
    if (!p.vonrRrno) { setRows([]); setTotal(0); return }

    const mySeq = ++seqRef.current
    setLoading(true)
    setError(null)
    try {
      const { rows, total } = await fetchDrlInfo({
        endpoint: p.endpoint,    // 가변 엔드포인트 전달
        vonrRrno: p.vonrRrno!,
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
    if (!params?.vonrRrno) { setRows([]); setTotal(0); return }
    run()
  }, [enabled, params?.vonrRrno, params?.ctpvCd, params?.locgovCd, params?.page, params?.size, params?.endpoint, run])

  return { rows, total, loading, error, refetch: run }
}

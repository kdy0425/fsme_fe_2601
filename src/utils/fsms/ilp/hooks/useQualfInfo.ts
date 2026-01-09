
// src/utils/fsms/ilp/hooks/useInsrncJoinInfo.ts
import { useEffect, useRef, useState, useCallback } from 'react'
import {
  fetchQualfInfo,
  QualfInfoParams,
  QualfInfoRow,
} from '@/utils/fsms/ilp/services/qualfInfo'

type UseQualfInfoOptions = {
  enabled?: boolean
}

export function useQualfInfo(
  params?: Partial<QualfInfoParams>,   // endpoint 포함 가능
  opts: UseQualfInfoOptions = {}
) {
  const { enabled = true } = opts
  const [rows, setRows] = useState<QualfInfoRow[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<unknown>(null)

  const seqRef = useRef(0)

  const run = useCallback(async (override?: Partial<QualfInfoParams>) => {
    const p: Partial<QualfInfoParams> = { page: 0, size: 10, ...params, ...override }
    if (!p.vonrRrno) { setRows([]); setTotal(0); return }

    const mySeq = ++seqRef.current
    setLoading(true)
    setError(null)
    try {
      const { rows, total } = await fetchQualfInfo({
        endpoint: p.endpoint,    // 가변 엔드포인트 전달
        vonrRrno: p.vonrRrno!,
        vhclNo:p.vhclNo,
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
  }, [enabled, params?.vonrRrno, params?.vhclNo, params?.ctpvCd, params?.locgovCd, params?.page, params?.size, params?.endpoint, run])

  return { rows, total, loading, error, refetch: run }
}

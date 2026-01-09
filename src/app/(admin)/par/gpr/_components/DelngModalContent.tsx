import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { useEffect, useState } from 'react'
import { parGprDtlTrHeadCells } from '@/utils/fsms/headCells'

interface ModalProps {
  aprvYm: string
  vhclNo: string
}

const DelngModalContent = (props: ModalProps) => {
  const { vhclNo, aprvYm } = props

  const [rows, setRows] = useState<any[]>([]) // 가져온 로우 데이터
  const [loading, setLoading] = useState(false) // 로딩여부

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string = `/fsm/par/gpr/tr/getAllDelngGnrlPapersReqst?vhclNo=${vhclNo}&aprvYm=${aprvYm}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        const responseData = response.data.map((data: any) => {
          return {
            ...data,
            color: data.colorGb === '일반' ? 'black'
            : data.colorGb === '취소' ? 'blue'
            : data.colorGb === '결제' ? 'brown'
            : data.colorGb === '휴지' ? 'forestgreen'
            : data.colorGb === '차감' ? 'magenta'
            : data.colorGb === '탱크' ? 'orange'
            : data.colorGb === '미경과' ? 'orange'
            : 'orange'
          }
        })
        setRows(responseData)
      } else {
        // 데이터가 없거나 실패
        setRows([])
      }
    } catch (error) {
      // 에러시
      console.error('Error fetching data:', error)
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  return <TableDataGrid headCells={parGprDtlTrHeadCells} rows={rows} loading={loading} />
}

export default DelngModalContent

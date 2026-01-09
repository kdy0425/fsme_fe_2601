import FormModal from '@/app/components/popup/FormDialog'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { useEffect, useState } from 'react'
import { Pageable2 } from 'table'
import { parGprCardTrHeadCells } from '@/utils/fsms/headCells'
import { Flag } from '@mui/icons-material'
import { preReleaseLabel } from '@mui/material'

interface ModalProps {
  open: boolean
  onCloseClick: () => void
  vhclNo: string
}

interface Parameters {
  page: number
  size: number
  // vhclNo: string;
}

const CardIssuedHistoryModal = (props: ModalProps) => {
  const { open, onCloseClick, vhclNo } = props
  const [flag, setFlag] = useState<Boolean>(false);
  const [params, setParams] = useState<Parameters>({
    page: 1,
    size: 10,
    // vhclNo: vhclNo ?? ''
  })
  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1,
  })

  const [rows, setRows] = useState<any[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부

  useEffect(() => {
    if (open) {
      //fetchData()
      setFlag(prev => !prev) // 모달이 열릴 때마다 flag 토글하여 데이터 새로고침
    }
  }, [open])

  useEffect(() => {
    if(vhclNo !== ''){
      fetchData();
    }
  }, [flag])

  const handlePaginationModelChange = (page: number, pageSize: number) => {
    setParams((prev) => ({
      ...prev,
      page: page,
      size: pageSize,
    }))
    setFlag(prev => !prev) // 페이지 변경시 데이터 새로고침을 위해 flag 토글
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string = `/fsm/par/gpr/tr/getCardInfo?page=${params.page}&size=${params.size}&vhclNo=${vhclNo}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        setRows(response.data.content)
        setTotalRows(response.data.totalElements)
        setPageable({
          pageNumber: response.data.pageable.pageNumber + 1,
          pageSize: response.data.pageable.pageSize,
          totalPages: response.data.totalPages,
        })
      } else {
        // 데이터가 없거나 실패
        alert(response.message)
        setRows([])
        setTotalRows(0)
        setPageable({
          pageNumber: 1,
          pageSize: 10,
          totalPages: 1,
        })
      }
    } catch (error) {
      // 에러시
      console.error('Error fetching data:', error)
      setRows([])
      setTotalRows(0)
      setPageable({
        pageNumber: 1,
        pageSize: 10,
        totalPages: 1,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <FormModal
      buttonLabel={''}
      title={'카드발급정보'}
      remoteFlag={open}
      closeHandler={onCloseClick}
      size={'xl'}
      submitBtn={false}
    >
      <TableDataGrid
        headCells={parGprCardTrHeadCells}
        rows={rows}
        totalRows={totalRows}
        loading={loading}
        pageable={pageable}
        onPaginationModelChange={handlePaginationModelChange}
      />
    </FormModal>
  )
}

export default CardIssuedHistoryModal

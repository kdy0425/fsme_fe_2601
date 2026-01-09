import {
  CustomFormLabel,
  CustomRadio,
  CustomSelect,
  CustomTextField,
} from '@/utils/fsms/fsm/mui-imports'
import {
  Box,
  Button,
  Dialog,
  DialogContent,

} from '@mui/material'
import React, { useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'


import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'


import { Row } from './Taxi/TaxiPage'
import { HeadCell, Pageable2 } from 'table'
import { Tsunami } from '@mui/icons-material'
import { stnLttmLgovTrnsfrnHstHc } from '@/utils/fsms/headCells'



const BsHistoryHeadCells: HeadCell[] = [
  {
      id: 'hstrySn',
      numeric: false,
      disablePadding: false,
      label: '연번',
  },
  {
      id: 'prcsYmd',
      numeric: false,
      disablePadding: false,
      label: '적용일',
      format: 'yyyymmdd'
  },
  {
      id: 'rprsvRrno',
      numeric: false,
      disablePadding: false,
      label: '주민등록번호',
  },
  {
      id: 'rprsvNm',
      numeric: false,
      disablePadding: false,
      label: '소유자명',
  },
  {
      id: 'brno',
      numeric: false,
      disablePadding: false,
      label: '사업자등록번호',
      format: 'brno'
  },
  {
      id: 'exsLocgovNm',
      numeric: false,
      disablePadding: false,
      label: '이관전 관할관청',
  },
  {
      id: 'chgLocgovNm',
      numeric: false,
      disablePadding: false,
      label: '이관후 관할관청',
  },
]



interface TxBeneInfoModalProps {
  // 추후에 판단후에 필요하다면 헤드셀 따로 받아서 동작하게 만들기
  title: string
  open: boolean
  data: Row
  type: 'bs' | 'tr'
  onCloseClick: () => void
  url: string 
}




// 목록 조회시 필요한 조건
type listSearchObj = {
  page: number
  size: number
  [key: string]: string | number // 인덱스 시그니처 추가
}

export const LocHistoryModal = (props: TxBeneInfoModalProps) => {
  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [Locflag, setLocFlag] = useState<boolean>(false) // 이관 이력 데이터 갱신을 위한 플래그 설정
  const [locRows, setLocRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [locTotalRows, setLocTotalRows] = useState(0) // 총 수
  const [locLoading, setLocLoading] = useState(false) // 
  
  
  
  const { title, open, data ,onCloseClick,url,type } = props
  



  const [params, setParams] = useState<listSearchObj>({
    page:  1, // 페이지 번호는 1부터 시작
    size:  10, // 기본 페이지 사이즈 설정
  })

  // 관할관청 이관이력에 관련된 pageable info
  const [locPageable, setLocPageable] = useState<Pageable2>({
      pageNumber: 1, // 페이지 번호는 1부터 시작
      pageSize: 10, // 기본 페이지 사이즈 설정
      totalPages: 1,
  })
  

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handleModalPaginationModelChange = (page: number, pageSize: number) => {
    setParams((prev) => ({
        ...prev,
        page: page , 
        size: pageSize,
        }))
        setLocFlag((prev) => !prev)
  }

    // 플래그의 변화를 통해 현재 정보를 기준으로 데이터를 가져오기위해 설정
    useEffect(() => {
        if(open){
        fetchLocData()}
    }, [Locflag, open])


    //화물 이관 이력 조회
    const fetchLocData = async () => {
        if(data === undefined){
            alert('조회 할 데이터가 없습니다.')
            return;
        }
        
        setLocLoading(true)
        try {
        // 검색 조건에 맞는 endpoint 생성
        let endpoint: string =
            `${url}?page=${params.page}&size=${params.size}` +
            `${data.vhclNo ? '&vhclNo=' + data.vhclNo : ''}` +
            `${type ==='bs' && data.brno ? '&brno=' + data.brno : ''}`

        const response = await sendHttpRequest('GET', endpoint, null, true, {
            cache: 'no-store',
        })


        if (response && response.resultType === 'success' && response.data) {
            // 데이터 조회 성공시
            setLocRows(response.data.content)
            setLocTotalRows(response.data.totalElements)
            setLocPageable({
                pageNumber: response.data.pageable.pageNumber + 1,
                pageSize: response.data.pageable.pageSize,
                totalPages: response.data.totalPages,
            })
        } else {
            // 데이터가 없거나 실패
            setLocRows([])
            setLocTotalRows(0)
            setLocPageable({
                pageNumber: 1,
                pageSize: 10,
                totalPages: 1,
            })
        }
        } catch (error) {
        // 에러시
        console.error('Error fetching data:', error)
        setLocRows([])
        setLocTotalRows(0)
        setLocPageable({
            pageNumber: 1,
            pageSize: 10,
            totalPages: 1,
        })
        } finally {
        setLocLoading(false)
        }
    }





  return (
    <Box>
      <Dialog
        fullWidth={true}
        maxWidth={'lg'}
        open={open}
        //onClose={onCloseClick}
      >
        <DialogContent>
          <Box className="table-bottom-button-group">
              <CustomFormLabel className="input-label-display">
                <h2 >{title}</h2>
              </CustomFormLabel>
            <div className=" button-right-align">
              <Button
                variant="contained"
                color="dark"
                onClick={onCloseClick}
              >
                취소
              </Button>
            </div>
          </Box>
          {/* 검색영역 시작 */}
          {/* 검색영역 시작 */}

          {/* 테이블영역 시작 */}
          <Box>
                <TableDataGrid 
                    headCells={type ==='bs' ? BsHistoryHeadCells : stnLttmLgovTrnsfrnHstHc} // 테이블 헤더 값
                    rows={locRows} // 목록 데이터
                    totalRows={totalRows} // 총 로우 수
                    loading={locLoading} // 로딩여부
                    pageable={locPageable}
                    onPaginationModelChange={handleModalPaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
                    onRowClick={() =>{}} // 행 클릭 핸들러 추가
                    paging={true}
                    caption={"지자체 이관이력 조회 목록"}
                />    
          </Box>
          {/* 테이블영역 끝 */}
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default LocHistoryModal

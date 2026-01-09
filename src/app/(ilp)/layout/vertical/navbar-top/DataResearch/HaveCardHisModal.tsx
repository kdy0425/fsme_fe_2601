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

import { HeadCell, Pageable2 } from 'table'
import {
  CtpvSelect,
  LocgovSelect,
  CommSelect,
} from '@/app/components/tx/commSelect/CommSelect'
import { Row } from './CarNumberSearchModal'


/**
 *  수급자 정보 (택시)
 */


interface TxBeneInfoModalProps {
  vonrRrno : string
  open: boolean
  onCloseClick: () => void
}

const headCells: HeadCell[] = [
  {
    id: 'vhclNo',
    numeric: false,
    disablePadding: false,
    label: '차량번호 ',
  },
  {
    id: 'vonrNm',
    numeric: false,
    disablePadding: false,
    label: '소유자명',
  },
  {
    id: 'locgovNm',
    numeric: false,
    disablePadding: false,
    label: '관할관청',
  },
  {
    id: 'vhclPsnNm',
    numeric: false,
    disablePadding: false,
    label: '소유구분',
  },
  {
    id: 'vonrRrnoSe',
    numeric: false,
    disablePadding: false,
    label: '주민등록번호',
    format: 'rrno'
  },
  {
    id: 'vonrBrno',
    numeric: false,
    disablePadding: false,
    label: '사업자등록번호',
    format : 'brno'
  },
  {
    id: 'crdcoNm',
    numeric: false,
    disablePadding: false,
    label: '카드사',
  },
  {
    id: 'cardSeNm',
    numeric: false,
    disablePadding: false,
    label: '카드구분',
  },
  {
    id: 'cardSttsNm',
    numeric: false,
    disablePadding: false,
    label: '카드상태',
  },
]



// 목록 조회시 필요한 조건
type listSearchObj = {
  page: number
  size: number
  [key: string]: string | number // 인덱스 시그니처 추가
}

export const HaveCardHisModal = (props: TxBeneInfoModalProps) => {
  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부

  const {  open, vonrRrno ,onCloseClick } = props

  const [params, setParams] = useState<listSearchObj>({
    page: 1, // 페이지 번호는 1부터 시작
    size: 10, // 기본 페이지 사이즈 설정
  })
  //
  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1, // 정렬 기준
  })

  useEffect(() => {
    setRows([])
    if(open == true )
      fetchData();
  }, [open])



  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {

    setLoading(true)
    try {

      ///fsm/stn/vm/tx/getVhcleFlnmMngTx
      let endpoint: string =
        `/fsm/cmm/cmmn/cp/getAllCardList?` +
        `${vonrRrno ? '&vonrRrno=' + vonrRrno: ''}` 
        console.log('소유카드 내역 endpoint ',endpoint)
      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {

        console.log('소유카드내역 검색결과',response.data)
        // 데이터 조회 성공시
        setRows(response.data)
        setTotalRows(response.data.length)
      } else {
        // 데이터가 없거나 실패
        setRows([])
        setTotalRows(0)
      }
    } catch (error) {
      // 에러시
      setRows([])
      setTotalRows(0)

    } finally {
      setLoading(false)
    }
  }



  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handlePaginationModelChange = useCallback(
    (page: number, pageSize: number) => {
      setParams((prev) => ({
        ...prev,
        page: page, // 실제 DB에서 조회시 -1을 하므로 +1 추가해서 넘겨야함. 페이지는 1로 보이지만 DB에선 0으로 조회
        size: pageSize,
      }))
      setFlag((prev) => !prev)
    },
    [],
  )



  return (
    <Box>
      <Dialog
        fullWidth={false}
        maxWidth={'lg'}
        open={open}
        onClose={onCloseClick}
      >
        <DialogContent>
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              <h2 >소유카드 내역</h2>
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
              headCells={headCells} // 테이블 헤더 값
              rows={rows} // 목록 데이터
              loading={loading} // 로딩여부
              onRowClick={() => {}} // 행 클릭 핸들러 추가
              onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
              paging={false}
              cursor={false}
            />
          </Box>
          {/* 테이블영역 끝 */}
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default HaveCardHisModal

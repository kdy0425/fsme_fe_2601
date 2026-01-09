'use client'
import { Box, Button, Dialog, DialogContent } from '@mui/material'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

import PageContainer from '@/components/container/PageContainer'
import { Breadcrumb, CustomFormLabel } from '@/utils/fsms/fsm/mui-imports'
import TxSearchHeaderTab from '@/app/components/tx/txSearchHeaderTab/TxSearchHeaderTab'
import SearchCondition from './_components/SearchCondition'
import { HeadCell, Pageable2 } from 'table'
import { SelectItem } from 'select'
import HeaderTab from '@/components/tables/CommHeaderTab'
import { getUserInfo } from '@/utils/fsms/utils'
import { isArray } from 'lodash'
import CrudButtons from './_components/CrudButtons'
import { toQueryParameter } from '@/utils/fsms/utils'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { getExcelFile, getToday } from '@/utils/fsms/common/comm'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import DetailDataGrid from './_components/DetailDataGrid'
import { StatusType } from '@/types/message'
import { cadcimHeadCellModalCont } from '@/utils/fsms/headCells'
import {
  cadCimHeadCellsBus,
  cadCimHeadCellsTaxi,
} from './_components/HeadCells'
import { IconSearch } from '@tabler/icons-react'

export interface listSearchObj {
  page: number
  size: number
  ctpvCd: string
  locgovCd: string
  vhclNo: string
  flnm: string
  crdcoCd: string
  cardSttsCd: string
  crdtCeckSeCd: string
  koiCd: string
  dscntYn: string
  vonrNm: string
  cardSeCd: string
}

interface Row {
  vhclNo: string
  flnm: string
  vonrNm: string
  crdcoNm: string
  cardSeNm: string
  cardNoSe: string
  stlmCardNoVe: string
  cardSttsCd: string
  custSeNm: string
  dscntNm: string
  koiNm: string
  brno: string
}

export interface DetailRow extends Row {
  cardBid: string
  carBid: string
  chgRsnCn: string
  inputDt: string
  locgovNm: string
  cardSttsNm: string
  agncyDrvBgngYmd: string
  agncyDrvEndYmd: string
  issuSeNm: string
  rgtrId: string
  regDt: string
  mdfrId: string
  mdfcnDt: string
  vhclSttsCd: string
  crdcoCd: string
  cardNo: string
  vonrRrno: string
  rrno: string
  rrnoS: string
  cardNoDe: string
  cardNoS: string
  crdcoSttsNm: string
  rcptYmd: string
  crdtCeckSeNm: string
  stlmCardNo: string
  rcvYn: string
}

interface ModalDetailRow {
  crdcoCd: string
  crdcoNm: string
  cardNo: string
  cardNoSe: string
  cardNoDe: string
  vhclNo: string
  cardSeCd: string
  cardSeNm: string
  cardSttsCd: string
  cardSttsNm: string
  mdfrId: string
  mdfcnDt: string
  vonrNm: string
  chgRsnCn: string
  vonrBrno: string
  dcYnNm: string
  hstrySn: string
  vonrBrnoCard: string
}

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '유류구매카드관리',
  },
  {
    title: '보조금카드관리',
  },
  {
    to: '/cad/cim',
    title: '카드정보관리',
  },
]

const DataList = () => {
  /** 유류구매카드관리 - 보조금카드관리 - 카드정보관리 - 화물 */

  const handleOpen = (row: DetailRow, index: number) => {
    if (index === undefined) {
      return
    }
    setModalParams({
      crdcoCd: row.crdcoCd,
      cardNo: row.cardNo,
    })
    setOpen(true)
  }

  const cadCimHeadCellsCargo: HeadCell[] = [
    {
      id: '',
      numeric: false,
      disablePadding: false,
      label: '상세조회',
      format: 'button',
      button: {
        label: <IconSearch />,
        color: 'primary',
        onClick: handleOpen,
      },
    },
    {
      id: 'vhclNo',
      numeric: false,
      disablePadding: false,
      label: '차량번호',
      rowspan: true,
    },
    {
      id: 'vonrNm',
      numeric: false,
      disablePadding: false,
      label: '소유자명',
      rowspan: true,
    },
    {
      id: 'crdcoNm',
      numeric: false,
      disablePadding: false,
      label: '카드사명',
    },
    {
      id: 'cardSeNm',
      numeric: false,
      disablePadding: false,
      label: '카드구분',
    },
    {
      id: 'cardNoSe',
      numeric: false,
      disablePadding: false,
      label: '카드번호',
      format: 'cardNo',
    },
    {
      id: 'stlmCardNoSe',
      numeric: false,
      disablePadding: false,
      label: '결제카드번호',

      format: 'cardNo',
    },
    {
      id: 'cardStsNm',
      numeric: false,
      disablePadding: false,
      label: '카드상태',
    },
  ]
  const handleClose = () => {
    setOpen(false)
  }

  /* 상태관리 */
  const [tabIndex, setTabIndex] = useState('')
  const [tabList, setTabList] = useState<SelectItem[]>([
    { value: '', label: '' },
  ])

  const [modalParams, setModalParams] = useState({
    crdcoCd: '',
    cardNo: '',
  })
  const [params, setParams] = useState<listSearchObj>({
    page: 1,
    size: 10,
    ctpvCd: '',
    locgovCd: '',
    vhclNo: '',
    flnm: '',
    crdcoCd: '',
    cardSttsCd: '',
    crdtCeckSeCd: '',
    koiCd: '',
    dscntYn: '',
    vonrNm: '',
    cardSeCd: '',
  })

  const [rows, setRows] = useState<Row[]>([])
  const [totalRows, setTotalRows] = useState<number>(0)
  const [rowIndex, setRowIndex] = useState<number>(-1)
  const [detail, setDetail] = useState<DetailRow>({
    vhclNo: '',
    flnm: '',
    vonrNm: '',
    crdcoNm: '',
    cardSeNm: '',
    cardNoSe: '',
    stlmCardNoVe: '',
    cardSttsCd: '',
    custSeNm: '',
    dscntNm: '',
    koiNm: '',
    brno: '',
    cardBid: '',
    carBid: '',
    chgRsnCn: '',
    inputDt: '',
    locgovNm: '',
    cardSttsNm: '',
    agncyDrvBgngYmd: '',
    agncyDrvEndYmd: '',
    issuSeNm: '',
    rgtrId: '',
    regDt: '',
    mdfrId: '',
    mdfcnDt: '',
    vhclSttsCd: '',
    crdcoCd: '',
    cardNo: '',
    vonrRrno: '',
    rrno: '',
    rrnoS: '',
    cardNoDe: '',
    cardNoS: '',
    crdcoSttsNm: '',
    rcptYmd: '',
    crdtCeckSeNm: '',
    stlmCardNo: '',
    rcvYn: '',
  })

  const [searchFlag, setSearchFlag] = useState<boolean | null>(null)
  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1,
    pageSize: 10,
    totalPages: 1,
  })
  const [loading, setLoading] = useState<boolean>(false)

  const [open, setOpen] = useState<boolean>(false)
  const [modalDetailRow, setModalDetailRow] = useState<ModalDetailRow[]>([])

  /* 상태관리 */

  // 업무구분 변경시 상태 초기화
  useEffect(() => {
    resetParams()
    resetSearchResult()
    resetPageObject()
    resetHeadCell()
  }, [tabIndex])

  const userInfo = getUserInfo()

  // 상위 컴포넌트에서 탭 상태 관리

  useEffect(() => {
    if (isArray(userInfo.taskSeCd) && userInfo.taskSeCd.length !== 0) {
      const result: SelectItem[] = []
      userInfo.taskSeCd.map((item) => {
        console.log(item)
        if (item === 'TR') {
          result.push({ value: '0', label: '화물' })
        } else if (item === 'TX') {
          result.push({ value: '1', label: '택시' })
        } else if (item === 'BS') {
          result.push({ value: '2', label: '버스' })
        } else {
        }
      })

      setTabList(result)

      if (result.length > 0) {
        setTabIndex(result[0].value)
      }
    }
  }, [userInfo.taskSeCd])

  // 검색 Flag
  useEffect(() => {
    if (searchFlag != null) {
      getData()
    }
  }, [searchFlag])

  // 조회조건 초기화
  const resetParams = () => {
    setParams({
      page: 1,
      size: 10,
      ctpvCd: params.ctpvCd,
      locgovCd: params.locgovCd,
      vhclNo: '',
      flnm: '',
      crdcoCd: '',
      cardSttsCd: '',
      crdtCeckSeCd: '',
      koiCd: '',
      dscntYn: '',
      vonrNm: '',
      cardSeCd: '',
    })
  }

  // 검색결과 초기화
  const resetSearchResult = () => {
    setRows([])
    setTotalRows(0)
    setRowIndex(-1)
    setDetail({
      vhclNo: '',
      flnm: '',
      vonrNm: '',
      crdcoNm: '',
      cardSeNm: '',
      cardNoSe: '',
      stlmCardNoVe: '',
      cardSttsCd: '',
      custSeNm: '',
      dscntNm: '',
      koiNm: '',
      brno: '',
      cardBid: '',
      carBid: '',
      chgRsnCn: '',
      inputDt: '',
      locgovNm: '',
      cardSttsNm: '',
      agncyDrvBgngYmd: '',
      agncyDrvEndYmd: '',
      issuSeNm: '',
      rgtrId: '',
      regDt: '',
      mdfrId: '',
      mdfcnDt: '',
      vhclSttsCd: '',
      crdcoCd: '',
      cardNo: '',
      vonrRrno: '',
      rrno: '',
      rrnoS: '',
      cardNoDe: '',
      cardNoS: '',
      crdcoSttsNm: '',
      rcptYmd: '',
      crdtCeckSeNm: '',
      stlmCardNo: '',
      rcvYn: '',
    })
    setModalDetailRow([])
  }

  // 페이징 객체 초기화
  const resetPageObject = () => {
    setPageable({ pageNumber: 1, pageSize: 10, totalPages: 1 })
  }

  // HeadCell 초기화
  const resetHeadCell = useCallback(() => {
    if (tabIndex == '0') {
      return cadCimHeadCellsCargo
    } else if (tabIndex == '1') {
      return cadCimHeadCellsTaxi
    } else {
      return cadCimHeadCellsBus
    }
  }, [tabIndex])

  // 조회조건 변경시
  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    setParams((prev) => ({ ...prev, [name]: value }))
  }
  

  useEffect(() => {
    if (modalParams.cardNo) {
      getModalData()
    }
  }, [modalParams])

  // 조회정보 가져오기
  const getData = async () => {
    setRows([])
    if (schValidation()) {
      setLoading(true)

      try {
        const searchObj = {
          ...params,
          page: params.page,
          size: params.size,
        }

        let endpoint = ''

        if (tabIndex == '0') {
          endpoint =
            '/fsm/cad/cim/tr/getAllCardInfoMng' + toQueryParameter(searchObj)
        } else if (tabIndex == '1') {
          endpoint =
            '/fsm/cad/cim/tx/getAllCardInfoMng' + toQueryParameter(searchObj)
        } else if (tabIndex == '2') {
          endpoint =
            '/fsm/cad/cim/bs/getAllCardInfoMng' + toQueryParameter(searchObj)
        }

        const response = await sendHttpRequest('GET', endpoint, null, true, {
          cache: 'no-store',
        })

        if (
          response &&
          response.resultType === 'success' &&
          response.data.content.length != 0
        ) {
          // 데이터 조회 성공시
          setRows(() => {
            return response.data.content
          })
          setTotalRows(response.data.totalElements)
          setPageable({
            pageNumber: response.data.pageable.pageNumber + 1,
            pageSize: response.data.pageable.pageSize,
            totalPages: response.data.totalPages,
          })

          // click event 발생시키기
          handleClick(response.data.content[0], 0)
        } else {
          resetSearchResult()
          resetPageObject()
        }
      } catch (error: StatusType | any) {
        // 에러시
        alert(error.errors?.[0].reason)
        resetSearchResult()
        resetPageObject()
      } finally {
        setLoading(false)
      }
    }
  }

  const schValidation = () => {
    if (tabIndex === '0') {
      if (!params.vhclNo && !params.vonrNm) {
        alert('차량번호 또는 소유자명을 입력해주세요.')
      } else {
        return true
      }
    } else {
      return true
    }

    return false
  }

  const handleClick = useCallback((row: DetailRow, index?: number) => {
    setDetail(row)
    setRowIndex(index ?? -1)
  }, [])

  const handlePaginationModelChange = useCallback(
    (page: number, pageSize: number) => {
      setParams((prev) => ({ ...prev, page: page, size: pageSize }))
      setSearchFlag((prev) => !prev)
    },
    [],
  )

  const handleAdvancedSearch = () => {
    setParams((prev) => ({ ...prev, page: 1, size: 10 }))
    setSearchFlag((prev) => !prev)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      getData()
    }
  }

  const handleExcelDownload = async () => {
    if (rowIndex === -1) {
      alert('조회된 내역이 없습니다.')
      return
    }

    let searchObj = {
      ...params,
      excelYn: 'Y',
    }

    let endpoint = ''
    let title = ''

    if (tabIndex == '0') {
      endpoint =
        '/fsm/cad/cim/tr/cardInfoMngExcel' + toQueryParameter(searchObj)
      title = BCrumb[BCrumb.length - 1].title + '_화물_' + getToday() + '.xlsx'
    } else if (tabIndex == '1') {
      endpoint =
        '/fsm/cad/cim/tx/getExcelCardInfoMng' + toQueryParameter(searchObj)
      title = BCrumb[BCrumb.length - 1].title + '_택시_' + getToday() + '.xlsx'
    } else if (tabIndex == '2') {
      endpoint =
        '/fsm/cad/cim/bs/getExcelCardInfoMng' + toQueryParameter(searchObj)
      title = BCrumb[BCrumb.length - 1].title + '_버스_' + getToday() + '.xlsx'
    }

    console.log(endpoint)
    await getExcelFile(endpoint, title)
  }

  const handleExcelDtlDownload = async () => {
    if (modalDetailRow.length === 0) {
      alert('엑셀파일을 다운로드할 데이터가 없습니다.')
      return
    }

    let endpoint =
      '/fsm/cad/cim/tr/histCardInfoMngExcel?' +
      `${modalParams.crdcoCd ? '&crdcoCd=' + modalParams.crdcoCd : ''}` +
      `${modalParams.cardNo ? '&cardNo=' + modalParams.cardNo : ''}` +
      `&excelYn=Y`

    await getExcelFile(
      endpoint,
      '보조금카드정보_상세내역_화물_' + getToday() + '.xlsx',
    )
  }

  const getModalData = async () => {
    try {
      let endpoint: string =
        `/fsm/cad/cim/tr/getAllHistCardInfoMng?` +
        `${modalParams.crdcoCd ? '&crdcoCd=' + modalParams.crdcoCd : ''}` +
        `${modalParams.cardNo ? '&cardNo=' + modalParams.cardNo : ''}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success' && response.data) {
        setModalDetailRow(response.data.content)
      } else {
        setModalDetailRow([])
      }
    } catch (error: StatusType | any) {
      // 에러시
      alert(error.errors?.[0].reason)
      console.error('Error fetching data:', error)
      setModalDetailRow([])
    }
  }

  return (
    <PageContainer title="카드정보관리" description="카드정보관리">
      {/* breadcrumb */}
      <Breadcrumb title="카드정보관리" items={BCrumb} />
      <HeaderTab tabs={tabList} onChange={setTabIndex} />

      {/* end breadcrumb */}

      {/* 검색영역 시작 */}
      <Box sx={{ mb: 2 }}>
        {/* 조회 조건 */}
        <SearchCondition
          tabIndex={tabIndex}
          params={params}
          handleSearchChange={handleSearchChange}
          handleKeyDown={handleKeyDown}
        />

        {/* CRUD 버튼 */}
        <CrudButtons
          rowIndex={rowIndex}
          tabIndex={tabIndex}
          detailInfo={detail}
          handleAdvancedSearch={handleAdvancedSearch}
          handleExcelDownload={handleExcelDownload}
          getData={getData}
        />
      </Box>
      {/* 검색영역 끝 */}

      {/* 테이블영역 시작 */}
      <Box>
        <TableDataGrid
          headCells={resetHeadCell()}
          rows={rows}
          totalRows={totalRows}
          loading={loading}
          onRowClick={handleClick}
          onPaginationModelChange={handlePaginationModelChange}
          pageable={pageable}
          selectedRowIndex={rowIndex}
          caption={'카드정보관리 목록 조회'}
        />
      </Box>
      {/* 테이블영역 끝 */}

      {/* 상세영역 */}
      {rows && rows.length > 0 && rowIndex != -1 ? (
        <>
          <DetailDataGrid detail={detail} tabIndex={tabIndex} />
        </>
      ) : (
        <></>
      )}

      {/* 상세영역 */}
      {tabIndex !== '2' ? (
        <Dialog fullWidth={false} maxWidth={'xl'} open={open}>
          <DialogContent>
            <Box className="table-bottom-button-group">
              <CustomFormLabel className="input-label-display">
                <h2>보조금카드정보 상세내역</h2>
              </CustomFormLabel>
              <div className="button-right-align">
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleExcelDtlDownload}
                >
                  엑셀
                </Button>
                <Button variant="contained" color="dark" onClick={handleClose}>
                  취소
                </Button>
              </div>
            </Box>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                m: 'auto',
                width: 'full',
              }}
            >
              {/* 보조금카드 목록 조회 내역 */}
              <TableDataGrid
                headCells={cadcimHeadCellModalCont}
                rows={modalDetailRow}
                totalRows={0}
                loading={loading}
                onRowClick={() => {}}
                onPaginationModelChange={() => {}}
                pageable={pageable}
                paging={false}
                caption={'보조금카드정보 내역 조회'}
              />
            </Box>
          </DialogContent>
        </Dialog>
      ) : (
        <></>
      )}
    </PageContainer>
  )
}

export default DataList

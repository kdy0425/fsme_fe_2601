import CustomFormLabel from '@/app/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/app/components/forms/theme-elements/CustomTextField'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import {
  CommSelect,
  CtpvSelect,
  LocgovSelect,
} from '@/app/components/tx/commSelect/CommSelect'
import { CommTextField } from '@/app/components/tx/commTextField/CommTextFiled'
import { StatusType } from '@/types/message'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { getExcelFile, getToday } from '@/utils/fsms/common/comm'

import { getUserInfo, toQueryParameter } from '@/utils/fsms/utils'
import { Box, Button } from '@mui/material'
import { useEffect, useState } from 'react'
import { HeadCell, Pageable2 } from 'table'
import BsDetailDataGrid from './BsDetailDataGrid'

/** 유류구매카드관리 - 보조금카드관리 - 카드정보관리 - 버스 */
const cadCimHeadCellsBus: HeadCell[] = [
  {
    id: 'brno',
    numeric: false,
    disablePadding: false,
    label: '사업자등록번호',
    format: 'brno',
  },
  {
    id: 'vhclNo',
    numeric: false,
    disablePadding: false,
    label: '차량번호',
  },
  {
    id: 'koiNm',
    numeric: false,
    disablePadding: false,
    label: '유종',
  },
  {
    id: 'flnm',
    numeric: false,
    disablePadding: false,
    label: '소유자명',
  },
  {
    id: 'crdcoNm',
    numeric: false,
    disablePadding: false,
    label: '카드사명',
  },
  {
    id: 'crdtCeckSeNm',
    numeric: false,
    disablePadding: false,
    label: '카드구분',
  },
  {
    id: 'cardNoS',
    numeric: false,
    disablePadding: false,
    label: '카드번호',
    format: 'cardNo',
  },
  {
    id: 'cardSttsNm',
    numeric: false,
    disablePadding: false,
    label: '카드상태',
  },
  {
    id: 'dscntNm',
    numeric: false,
    disablePadding: false,
    label: '할인여부',
  },
]

export interface listSearchObj {
  page: number
  size: number
  ctpvCd: string
  locgovCd: string
  brno: string
  vhclNo: string
  flnm: string
  crdcoCd: string
  cardSttsCd: string
  crdtCeckSeCd: string
  koiCd: string
  dscntYn: string
}

interface Row {
  brno: string
  vhclNo: string
  koiNm: string
  flnm: string
  crdcoNm: string
  cardCeckSeNm: string
  cardNoS: string
  dscntNm: string
}

export interface DetailRow extends Row {
  cardBid: string
  carBid: string
  chgRsnCn: string
  inputDt: string
  locgovNm: string
  cardSttsCd: string
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
}

const BsPage = () => {
  const [params, setParams] = useState<listSearchObj>({
    page: 1,
    size: 10,
    ctpvCd: '',
    locgovCd: '',
    brno: '',
    vhclNo: '',
    flnm: '',
    crdcoCd: '',
    cardSttsCd: '',
    crdtCeckSeCd: '',
    koiCd: '',
    dscntYn: '',
  })

  const [rows, setRows] = useState<Row[]>([])
  const [totalRows, setTotalRows] = useState<number>(0)
  const [rowIndex, setRowIndex] = useState<number>(-1)
  const [detail, setDetail] = useState<DetailRow>({
    brno: '',
    vhclNo: '',
    koiNm: '',
    flnm: '',
    crdcoNm: '',
    cardCeckSeNm: '',
    cardNoS: '',
    dscntNm: '',
    cardBid: '',
    carBid: '',
    chgRsnCn: '',
    inputDt: '',
    locgovNm: '',
    cardSttsNm: '',
    cardSttsCd: '',
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
    crdcoSttsNm: '',
    rcptYmd: '',
    crdtCeckSeNm: '',
    stlmCardNo: '',
  })

  const [searchFlag, setSearchFlag] = useState<boolean | null>(null)
  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1,
    pageSize: 10,
    totalPages: 1,
  })
  const [loading, setLoading] = useState<boolean>(false)
  const [loadingBackdrop, setLoadingBackdrop] = useState<boolean>(false)

  const [excelFlag, setExcelFlag] = useState(false)
  const [roles, setRoles] = useState<string>()

  const userInfo = getUserInfo()

  // 검색 Flag
  useEffect(() => {
    if (searchFlag != null) {
      getData()
    }
  }, [searchFlag])

  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    setParams((prev) => ({ ...prev, [name]: value }))
    setExcelFlag(false)
  }

  const getData = async () => {
    setLoading(true)

    try {
      const searchObj = {
        ...params,
        page: params.page,
        size: params.size,
      }

      let endpoint =
        '/fsm/cad/cim/bs/getAllCardInfoMng' + toQueryParameter(searchObj)

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })

      if (
        response &&
        response.resultType === 'success' &&
        response.data.content.length != 0
      ) {
        // 데이터 조회 성공시
        setRows(response.data.content)
        setTotalRows(response.data.totalElements)
        setPageable({
          pageNumber: response.data.pageNumber + 1,
          pageSize: response.data.pageSize,
          totalPages: response.data.totalPages,
        })

        // click event 발생시키기
        handleClick(response.data.content[0], 0)
      } else {
        setRows([])
        setTotalRows(0)
        setPageable({
          pageNumber: 1,
          pageSize: 10,
          totalPages: 1,
        })
      }
    } catch (error: StatusType | any) {
      alert(error.errors?.[0].reason)
      setRows([])
      setTotalRows(0)
      setPageable({
        pageNumber: 1,
        pageSize: 10,
        totalPages: 1,
      })
    } finally {
      setLoading(false)
      setExcelFlag(true)
    }
  }

  const handleClick = (row: DetailRow, index?: number) => {
    setDetail(row)
    setRowIndex(index ?? -1)
    setRoles(userInfo.roles[0])
  }

  const handlePaginationModelChange = (page: number, pageSize: number) => {
    setParams((prev) => ({ ...prev, page: page, size: pageSize }))
    setSearchFlag((prev) => !prev)
  }

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
    if (rows.length === 0) {
      alert('엑셀파일을 다운로드할 데이터가 없습니다.')
      return
    }

    if (!excelFlag) {
      alert('조회조건이 변경되었습니다. 검색 후 다운로드가 가능합니다.')
      return
    }

    let searchObj = {
      ...params,
      excelYn: 'Y',
    }

    let endpoint =
      '/fsm/cad/cim/bs/getExcelCardInfoMng' + toQueryParameter(searchObj)

    await getExcelFile(endpoint, '카드정보관리_버스_' + getToday() + '.xlsx')
  }

  const deletionHandle = async () => {
    if (detail.cardSttsCd === '01') {
      alert('카드상태가 말소인 카드는 말소 시킬 수 없습니다.')
      return
    }

    const userConfirm = confirm('해당카드를 말소 처리하시겠습니까?')

    if (!userConfirm) {
      return
    } else {
      setLoadingBackdrop(true)
      try {
        let endpoint: string =
          `/fsm/cad/cim/bs/erasureCardInfoMng?` +
          `${detail.brno ? '&brno=' + detail.brno : ''}` +
          `${detail.vhclNo ? '&vhclNo=' + detail.vhclNo : ''}` +
          `${detail.rrno ? '&rrno=' + detail.rrno : ''}` +
          `${detail.cardNo ? '&cardNo=' + detail.cardNo : ''}`

        const response = await sendHttpRequest('GET', endpoint, null, true, {
          cache: 'no-store',
        })

        if (response && response.resultType === 'success') {
          alert('말소처리 되었습니다.')
          getData()
        } else {
          alert('실패 :: ' + response.message)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoadingBackdrop(false)
      }
    }
  }

  return (
    <>
      <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
        <Box className="sch-filter-box">
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-ctpv"
              >
                <span className="required-text">*</span>시도명
              </CustomFormLabel>
              <CtpvSelect
                pValue={params.ctpvCd}
                handleChange={handleSearchChange}
                pName="ctpvCd"
                htmlFor={'sch-ctpv'}
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-locgov"
              >
                <span className="required-text">*</span>관할관청
              </CustomFormLabel>
              <LocgovSelect
                ctpvCd={params.ctpvCd}
                pValue={params.locgovCd}
                handleChange={handleSearchChange}
                pName="locgovCd"
                htmlFor={'sch-locgov'}
              />
            </div>
            <CommTextField
              type="brno"
              require={false}
              pValue={params.brno}
              handleChange={handleSearchChange}
              handleKeyDown={handleKeyDown}
            />
            <CommTextField
              type="vhclNo"
              require={false}
              pValue={params.vhclNo}
              handleChange={handleSearchChange}
              handleKeyDown={handleKeyDown}
            />
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-flnm"
              >
                소유자명
              </CustomFormLabel>
              <CustomTextField
                type="text"
                id="sch-flnm"
                name="flnm"
                value={params.flnm}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
              />
            </div>
          </div>
          <hr></hr>
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-crdco"
              >
                카드사
              </CustomFormLabel>
              <CommSelect
                cdGroupNm="543"
                pValue={params.crdcoCd}
                handleChange={handleSearchChange}
                pName="crdcoCd"
                htmlFor={'sch-crdco'}
                addText="전체"
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-cardStts"
              >
                카드상태
              </CustomFormLabel>
              <CommSelect
                cdGroupNm="008"
                pValue={params.cardSttsCd}
                handleChange={handleSearchChange}
                pName="cardSttsCd"
                htmlFor={'sch-cardStts'}
                addText="전체"
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-cardSe"
              >
                카드구분
              </CustomFormLabel>
              <CommSelect
                cdGroupNm="542"
                pValue={params.crdtCeckSeCd}
                handleChange={handleSearchChange}
                pName="cardSeCd"
                htmlFor={'sch-cardSe'}
                addText="전체"
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-koi"
              >
                유종
              </CustomFormLabel>
              <CommSelect
                cdGroupNm="599"
                pValue={params.koiCd}
                handleChange={handleSearchChange}
                pName="koiCd"
                htmlFor={'sch-koi'}
                addText="전체"
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-dscnt"
              >
                할인여부
              </CustomFormLabel>
              <CommSelect
                cdGroupNm="027"
                pValue={params.dscntYn}
                handleChange={handleSearchChange}
                pName="dscntYn"
                htmlFor={'sch-dscntYn'}
                addText="전체"
              />
            </div>
          </div>
        </Box>
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            {/* 조회 */}
            <Button
              variant="contained"
              color="primary"
              onClick={handleAdvancedSearch}
            >
              검색
            </Button>
            {roles === 'ADMIN' ? (
              <>
                <Button
                  variant="contained"
                  color="error"
                  onClick={deletionHandle}
                >
                  말소
                </Button>
              </>
            ) : (
              <></>
            )}
            {/* 엑셀 */}
            <Button
              variant="contained"
              color="success"
              onClick={handleExcelDownload}
            >
              엑셀
            </Button>
          </div>
          <LoadingBackdrop open={loadingBackdrop} />
        </Box>
      </Box>

      {/* 테이블영역 시작 */}
      <Box>
        <TableDataGrid
          headCells={cadCimHeadCellsBus}
          rows={rows}
          totalRows={totalRows}
          loading={loading}
          onRowClick={handleClick}
          onPaginationModelChange={handlePaginationModelChange}
          pageable={pageable}
          selectedRowIndex={rowIndex}
        />
      </Box>
      {/* 테이블영역 끝 */}

      {/* 상세영역 */}
      {rows && rows.length > 0 && rowIndex != -1 ? (
        <>
          <BsDetailDataGrid detail={detail} />
        </>
      ) : (
        <></>
      )}
    </>
  )
}

export default BsPage

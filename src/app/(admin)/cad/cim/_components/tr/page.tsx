import CustomFormLabel from '@/app/components/forms/theme-elements/CustomFormLabel'
import FormDialog from '@/app/components/popup/FormDialog'
import {
  CommSelect,
  CtpvSelect,
  LocgovSelect,
} from '@/app/components/tx/commSelect/CommSelect'
import { CommTextField } from '@/app/components/tx/commTextField/CommTextFiled'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { getExcelFile, getToday } from '@/utils/fsms/common/comm'
import { getUserInfo, toQueryParameter } from '@/utils/fsms/utils'
import { Box, Button, Dialog, DialogContent } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { HeadCell, Pageable2 } from 'table'
import ModalContent from './ModalContent'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import TrDetailDataGrid from './TrDetailDataGrid'
import { StatusType } from '@/types/message'

interface listSearchObj {
  page: number
  size: number
  ctpvCd: string
  locgovCd: string
  crdcoCd: string
  vhclNo: string
  cardSttsCd: string
  dscntYn: string
  vonrNm: string
  cardSeCd: string
}

interface Row {
  vhclNo: string
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

export interface procInterface {
  vhclNo: string
  procGb: string
  vhclSttsCd: string
  crdcoCd: string
  cardNo: string
  chgRsnCn: string
  sendDataYn: string
  vonrRrno: string
}

const TrPage = () => {
  const handleOpen = (row: DetailRow, index?: number) => {
    console.log('handleOpen')
    setDetail(row)
    setRowIndex(index ?? -1)
    setOpen(true)
    getModalData()
  }

  const handleClose = () => {
    setOpen(false)
  }

  /** 유류구매카드관리 - 보조금카드관리 - 카드정보관리 - 화물 */
  const cadCimHeadCellsCargo: HeadCell[] = [
    {
      id: '',
      numeric: false,
      disablePadding: false,
      label: '상세조회',
      format: 'button',
      button: {
        label: '조회',
        color: 'primary',
        onClick: handleOpen,
      },
    },
    {
      id: 'vhclNo',
      numeric: false,
      disablePadding: false,
      label: '차량번호',
    },
    {
      id: 'vonrNm',
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

  const cadcimHeadCellModalCont: HeadCell[] = [
    {
      id: 'hstrySn',
      numeric: false,
      disablePadding: false,
      label: '이력번호',
    },
    {
      id: 'vhclNo',
      numeric: false,
      disablePadding: false,
      label: '차량번호',
    },
    {
      id: 'vonrNm',
      numeric: false,
      disablePadding: false,
      label: '소유자명',
    },
    {
      id: 'dcYnNm',
      numeric: false,
      disablePadding: false,
      label: '할인여부',
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
      id: 'cardStsNm',
      numeric: false,
      disablePadding: false,
      label: '카드상태',
    },
    {
      id: 'vonrBrno',
      numeric: false,
      disablePadding: false,
      label: '차주사업자번호',
      format: 'brno',
    },
    {
      id: 'vonrBrnoCard',
      numeric: false,
      disablePadding: false,
      label: '카드사업자번호',
      format: 'brno',
    },
    {
      id: 'chgRsnCn',
      numeric: false,
      disablePadding: false,
      label: '변경사유',
    },
    {
      id: 'mdfrId',
      numeric: false,
      disablePadding: false,
      label: '수정자아이디',
    },
    {
      id: 'mdfcnDt',
      numeric: false,
      disablePadding: false,
      label: '수정일자',
      format: 'yyyymmdd',
    },
  ]

  const [params, setParams] = useState<listSearchObj>({
    page: 1,
    size: 10,
    ctpvCd: '',
    locgovCd: '',
    crdcoCd: '',
    vhclNo: '',
    cardSttsCd: '',
    dscntYn: '',
    vonrNm: '',
    cardSeCd: '',
  })

  const [rows, setRows] = useState<Row[]>([])
  const [totalRows, setTotalRows] = useState<number>(0)
  const [rowIndex, setRowIndex] = useState<number>(-1)
  const [detail, setDetail] = useState<DetailRow>({
    vhclNo: '',
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
  })

  const [searchFlag, setSearchFlag] = useState<boolean | null>(null)
  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1,
    pageSize: 10,
    totalPages: 1,
  })
  const [loading, setLoading] = useState<boolean>(false)
  const [excelFlag, setExcelFlag] = useState<boolean>(false)

  const [open, setOpen] = useState<boolean>(false)
  const [modalDetailRow, setModalDetailRow] = useState<ModalDetailRow[]>([])
  const [roles, setRoles] = useState<string>()

  const [remoteFlag, setRemoteFlag] = useState<boolean | undefined>()
  const [isDataProcessing, setIsDataProcessing] = useState<boolean>(false)

  const [procData, setProcData] = useState<procInterface>({
    vhclNo: '',
    procGb: '',
    vhclSttsCd: '',
    crdcoCd: '',
    cardNo: '',
    chgRsnCn: '',
    sendDataYn: 'Y',
    vonrRrno: '',
  })

  const userInfo = getUserInfo()

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

  const schValidation = () => {
    if (!params.vhclNo) {
      alert('차량번호를 입력해주세요.')
    } else if (!params.vonrNm) {
      alert('소유자명을 입력해주세요.')
    } else {
      return true
    }
    return false
  }

  const getData = async () => {
    if (schValidation()) {
      setLoading(true)
      try {
        const searchObj = {
          ...params,
          page: params.page,
          size: params.size,
        }

        let endpoint: string =
          '/fsm/cad/cim/tr/getAllCardInfoMng' + toQueryParameter(searchObj)

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
        // 에러시
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
  }

  const handleClick = (row: DetailRow, index?: number) => {
    setDetail(row)
    setRowIndex(index ?? -1)
    setRoles(userInfo.roles[0])
  }

  const handlePaginationModelChange = (page: number, pageSize: number) => {
    setParams((prev) => ({ ...prev, page: page, pageSize: pageSize }))
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
      '/fsm/cad/cim/tr/cardInfoMngExcel' + toQueryParameter(searchObj)
    await getExcelFile(endpoint, '카드정보관리_화물_' + getToday() + '.xlsx')
  }

  const getModalData = async () => {
    const { crdcoCd, cardNo } = detail

    try {
      let endpoint: string =
        `/fsm/cad/cim/tr/getAllHistCardInfoMng?` +
        `${crdcoCd ? '&crdcoCd=' + crdcoCd : ''}` +
        `${cardNo ? '&cardNo=' + cardNo : ''}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success' && response.data) {
        setModalDetailRow(response.data.content)
      } else {
        setModalDetailRow([])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setModalDetailRow([])
    }
  }

  const restoreHandle = (event: React.FormEvent) => {
    event.preventDefault()

    if (
      detail.chgRsnCn.replaceAll(/\n/g, '').replaceAll(/\t/g, '').length > 80
    ) {
      alert('변경사유를 80자리 이하로 입력해주시기 바랍니다.')
      return
    }

    let body = {
      vhclNo: detail.vhclNo,
      procGb: 'R',
      vhclSttsCd: detail.vhclSttsCd,
      crdcoCd: detail.crdcoCd,
      cardNo: detail.cardNo,
      chgRsnCn: procData.chgRsnCn.replaceAll(/\n/g, '').replaceAll(/\t/g, ''),
      sendDataYn: procData.sendDataYn,
    }

    let endpoint: string = '/fsm/cad/cim/tr/restoreCardInfoMng'

    fetchData(endpoint, body)
  }

  const deletionHandle = (event: React.FormEvent) => {
    event.preventDefault()
    if (
      detail.chgRsnCn.replaceAll(/\n/g, '').replaceAll(/\t/g, '').length > 80
    ) {
      alert('변경사유를 80자리 이하로 입력해주시기 바랍니다.')
      return
    }

    let body = {
      vhclNo: detail.vhclNo,
      procGb: 'S',
      vhclSttsCd: detail.vhclSttsCd,
      crdcoCd: detail.crdcoCd,
      cardNo: detail.cardNo,
      chgRsnCn: procData.chgRsnCn.replaceAll(/\n/g, '').replaceAll(/\t/g, ''),
      sendDataYn: procData.sendDataYn,
    }

    let endpoint: string = '/fsm/cad/cim/tr/erasureCardInfoMng'

    fetchData(endpoint, body)
  }

  const fetchData = async (endpoint: string, body: any) => {
    try {
      setIsDataProcessing(true)

      const response = await sendHttpRequest('PUT', endpoint, body, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success') {
        alert(response.message)
        setIsDataProcessing(false)
        setRemoteFlag(false)
        getData()
      } else {
        alert('실패 :: ' + response.message)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsDataProcessing(false)
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
              type="vhclNo"
              pValue={params.vhclNo}
              require
              handleChange={handleSearchChange}
              handleKeyDown={handleKeyDown}
            />
            <CommTextField
              type="vonrNm"
              pValue={params.vonrNm}
              require
              handleChange={handleSearchChange}
              handleKeyDown={handleKeyDown}
            />
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
                cdGroupNm="023"
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
                cdGroupNm="974"
                pValue={params.cardSeCd}
                handleChange={handleSearchChange}
                pName="cardSeCd"
                htmlFor={'sch-cardSe'}
                addText="전체"
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-dscntYn"
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
                <Box component="form" onSubmit={restoreHandle} id="restoreForm">
                  <FormDialog
                    size="lg"
                    buttonLabel="복원"
                    title="유류구매카드 복원 처리"
                    formLabel="저장"
                    formId="restoreForm"
                    remoteFlag={remoteFlag}
                    children={
                      <ModalContent
                        procData={procData}
                        setProcData={setProcData}
                        isDataProcessing={isDataProcessing}
                      />
                    }
                  />
                </Box>
                <Box
                  component="form"
                  onSubmit={deletionHandle}
                  id="deletionForm"
                >
                  <FormDialog
                    size="lg"
                    buttonLabel="말소"
                    title="유류구매카드 말소 처리"
                    formLabel="저장"
                    formId="deletionForm"
                    remoteFlag={remoteFlag}
                    children={
                        <ModalContent
                          procData={procData}
                          setProcData={setProcData}
                          isDataProcessing={isDataProcessing}
                        />
                    }
                  />
                </Box>
              </>
            ) : (
              <></>
            )}
            <Button
              variant="contained"
              color="success"
              onClick={handleExcelDownload}
            >
              엑셀
            </Button>
          </div>
        </Box>
      </Box>

      {/* 테이블영역 시작 */}
      <Box>
        <TableDataGrid
          headCells={cadCimHeadCellsCargo}
          rows={rows}
          totalRows={totalRows}
          loading={loading}
          onRowClick={handleClick}
          onPaginationModelChange={handlePaginationModelChange}
          pageable={pageable}
          selectedRowIndex={rowIndex}
          caption={'화물 카드정보 목록 조회'}
        />
      </Box>
      {/* 테이블영역 끝 */}

      {/* 상세영역 */}
      {rows && rows.length > 0 && rowIndex != -1 ? (
        <>
          <TrDetailDataGrid detail={detail} />
        </>
      ) : (
        <></>
      )}

      <Dialog fullWidth={false} maxWidth={'xl'} open={open} aria-model={false}>
        <DialogContent>
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              <h2>보조금카드정보 상세내역</h2>
            </CustomFormLabel>
            <div className="button-right-align">
              <Button variant="contained" color="success" onClick={() => {}}>
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
            {/* 보조금사용 목록 조회 내역 */}
            <TableDataGrid
              headCells={cadcimHeadCellModalCont}
              rows={modalDetailRow}
              totalRows={0}
              loading={loading}
              onRowClick={() => {}}
              onPaginationModelChange={() => {}}
              pageable={pageable}
              paging={false}
              caption={'보조금사용 목록 조회'}
            />
          </Box>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default TrPage

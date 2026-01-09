import {
  CustomFormLabel,
  CustomRadio,
  CustomSelect,
  CustomTextField,
} from '@/utils/fsms/fsm/mui-imports'
import { Box, Button, Dialog, DialogContent } from '@mui/material'
import React, { useEffect, useState, useCallback } from 'react'

import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'

import { HeadCell, Pageable2 } from 'table'
import { Row } from './BsIfCardReqComponent'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import { brNoFormatter, rrNoFormatter } from '@/utils/fsms/common/util'

interface BsDetailModalProps {
  open: boolean
  handleClickClose: () => void
  data: Row
  reload: () => void
  aprvData: () => void
}

const headCells: HeadCell[] = [
  {
    id: 'flnm',
    numeric: false,
    disablePadding: false,
    label: '수급자명',
  },
  {
    id: 'rrnoS',
    numeric: false,
    disablePadding: false,
    label: '주민등록번호',
    format: 'rrno',
  },
  {
    id: 'crdcoNm',
    numeric: false,
    disablePadding: false,
    label: '카드사',
  },
  {
    id: 'cardNoS',
    numeric: false,
    disablePadding: false,
    label: '카드번호',
    format: 'cardNo',
  },
  {
    id: 'crdtCeckSeCdNm',
    numeric: false,
    disablePadding: false,
    label: '카드구분',
  },
  {
    id: 'dscntYn',
    numeric: false,
    disablePadding: false,
    label: '할인',
  },
  {
    id: 'aprvYmd',
    numeric: false,
    disablePadding: false,
    label: '발급일자',
    format: 'yyyymmdd',
  },
  {
    id: 'cardSttsCdNm',
    numeric: false,
    disablePadding: false,
    label: '카드상태',
  },
]

interface detailData {
  rcptYmd: string //접수일자
  rcptSn: string //접수순번
  nowVhclNo: string //차량번호
  nowFlnm: string //기존-수급자/업체명
  nowBrno: string //기존-사업자등록번호
  nowRprsvRrno: string //기존-주민등록번호
  nowCrno: string //기존-법인등록번호
  nowLocgovNm: string //기존-지자체명
  nowVhclSttsNm: string //기존-면허업종
  nowKoiCdNm: string //기존-유종
  nowBzentyNm: string //기존-업체명
  nowRprsvNm: string //기존-대표자명
  nowVhclScrapNm: string //기존-차량상태/폐차여부
  cofFlnm: string //발급요청-수급자/업체명
  cofBrno: string //발급요청-사업자등록번호
  cofRprsvRrno: string //발급요청-주민등록번호
  cofCrno: string //발급요청-법인등록번호
  cofLocgovNm: string //발급요청-지자체명
  cofVhclSttsNm: string //발급요청-면허업종
  cofKoiCdNm: string //발급요청-유종
  cofBzentyNm: string //발급요청-업체명
  cofRprsvNm: string //발급요청-대표자명
  cofVhclScrapNm: string //발급요청-차량상태/폐차여부
  netFlnm: string //자동차망-수급자/업체명
  netBrno: string //자동차망-사업자등록번호
  netRprsvRrno: string //자동차망-주민등록번호
  netCrno: string //자동차망-법인등록번호
  netLocgovNm: string //자동차망-지자체명
  netVhclSttsNm: string //자동차망-면허업종
  netKoiCdNm: string //자동차망-유종
  netBzentyNm: string //자동차망-업체명
  netRprsvNm: string //자동차망-대표자명
  netVhclScrapNm: string //자동차망-차량상태/폐차여부
}

interface cardRow {
  flnm: string //카드정보-수급자명
  rrnoS: string //카드정보-주민등록번호
  crdcoNm: string //카드정보-카드사
  cardNoS: string //카드정보-카드번호
  crdtCeckSeCdNm: string //카드정보-카드구분
  dscntYn: string //카드정보-할인
  aprvYmd: string //카드정보-발급승인일자
  cardSttsCdNm: string //카드정보-카드상태
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  [key: string]: string | number // 인덱스 시그니처 추가
}

export const BsDetailModal = (props: BsDetailModalProps) => {
  const { open, handleClickClose, data, reload, aprvData } = props

  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<cardRow[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부
  const [loadingBackdrop, setLoadingBackdrop] = useState(false)

  const [params, setParams] = useState<listSearchObj>({
    locgovNm: '',
  })

  const resetData: detailData = {
    rcptYmd: '',
    rcptSn: '',
    nowVhclNo: '',
    nowFlnm: '',
    nowBrno: '',
    nowRprsvRrno: '',
    nowCrno: '',
    nowLocgovNm: '',
    nowVhclSttsNm: '',
    nowKoiCdNm: '',
    nowBzentyNm: '',
    nowRprsvNm: '',
    nowVhclScrapNm: '',
    cofFlnm: '',
    cofBrno: '',
    cofRprsvRrno: '',
    cofCrno: '',
    cofLocgovNm: '',
    cofVhclSttsNm: '',
    cofKoiCdNm: '',
    cofBzentyNm: '',
    cofRprsvNm: '',
    cofVhclScrapNm: '',
    netFlnm: '',
    netBrno: '',
    netRprsvRrno: '',
    netCrno: '',
    netLocgovNm: '',
    netVhclSttsNm: '',
    netKoiCdNm: '',
    netBzentyNm: '',
    netRprsvNm: '',
    netVhclScrapNm: '',
  }
  const [detailData, setDetailData] = useState<detailData>(resetData)

  useEffect(() => {
    setRows([])
    setDetailData(resetData)
  }, [open])

  useEffect(() => {
    if (open) fetchData()
    if (!open) setLoadingBackdrop(false)
  }, [open])

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    setLoading(true)
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/cad/cijm/bs/getOneCardIssuJdgmnMng?` +
        `&rcptYmd=${data.rcptYmd}` +
        `&rcptSn=${data.rcptSn}` +
        `&vhclNo=${data.vhclNo}` +
        `&crdcoCd=${data.crdcoCd}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        setRows(response.data.cardResult)
        setDetailData(response.data.carResult)
        setTotalRows(response.data.cardResult.length)
        //사업자번호 같을시 말소처리 없음
        if(response.data.carResult.nowBrno===response.data.carResult.cofBrno){
          setRows([])  
          setTotalRows(0)
        }
      } else {
        // 데이터가 없거나 실패
        setRows([])
        setTotalRows(0)
        setDetailData(resetData)
      }
    } catch (error) {
      // 에러시
      setRows([])
      setDetailData(resetData)
      setTotalRows(0)
    } finally {
      setLoading(false)
      setFlag(false)
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
      setFlag(true)
    },
    [],
  )

  return (
    <Box>
      <Dialog
        fullWidth={false}
        maxWidth={'lg'}
        open={open}
        onClose={handleClickClose}
        PaperProps={{
          style: {
            width: '1024px',
          },
        }}
      >
        <DialogContent>
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              <h2>버스 유류구매카드 발급심사 상세검토</h2>
            </CustomFormLabel>
            <div className=" button-right-align">
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  setLoadingBackdrop(true)
                  aprvData()
                  setLoadingBackdrop(false)
                }}
              >
                승인
              </Button>
              <Button
                variant="contained"
                color="dark"
                onClick={handleClickClose}
              >
                취소
              </Button>
            </div>
          </Box>
          <Box
            sx={{
              display: 'flex', // Flexbox를 활성화
              justifyContent: 'space-between', // 두 div 사이 간격 조절
              gap: 2, // 간격 조절
              width: '100%', // 전체 너비 사용
            }}
          >
            <div id="alert-dialog-description1" style={{ width: '70%' }}>
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-fname"
              >
                상세검토 내역
              </CustomFormLabel>
            </div>
            <div id="alert-dialog-description1" style={{ width: '28%' }}>
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-fname"
              >
                상세검토 내역
              </CustomFormLabel>
            </div>
          </Box>
          <Box
            sx={{
              display: 'flex', // Flexbox를 활성화
              justifyContent: 'space-between', // 두 div 사이 간격 조절
              gap: 2, // 간격 조절
              width: '100%', // 전체 너비 사용
            }}
          >
            <div id="alert-dialog-description1" style={{ width: '70%' }}>
              {/* 테이블영역 시작 */}
              <div className="table-scrollable">
                <table className="table table-bordered">
                  <caption>차량제원 및 지자체정보검토</caption>
                  <colgroup>
                    <col style={{ width: '25%' }} />
                    <col style={{ width: '25%' }} />
                    <col style={{ width: '25%' }} />
                    <col style={{ width: '25%' }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th>데이터구분</th>
                      <th>기존</th>
                      <th>발급요청</th>
                      <th>자동차망</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th
                        style={{
                          backgroundColor: '#e5ebf0',
                          fontWeight: '500',
                        }}
                      >
                        수급자명/업체명
                      </th>
                      <td
                        style={{
                          textAlign: 'center',
                          verticalAlign: 'middle',
                          backgroundColor:
                            detailData.nowFlnm !== detailData.cofFlnm
                              ? '#FFFFCC'
                              : '',
                        }}
                      >
                        {detailData.nowFlnm}
                      </td>
                      <td
                        style={{
                          textAlign: 'center',
                          verticalAlign: 'middle',
                          backgroundColor:
                            detailData.nowFlnm !== detailData.cofFlnm
                              ? '#FFFFCC'
                              : '',
                        }}
                      >
                        {detailData.cofFlnm}
                      </td>
                      <td
                        style={{ textAlign: 'center', verticalAlign: 'middle' }}
                      >
                        {detailData.netFlnm}
                      </td>
                    </tr>
                    <tr>
                      <th
                        style={{
                          backgroundColor: '#e5ebf0',
                          fontWeight: '500',
                        }}
                      >
                        사업자등록번호
                      </th>
                      <td
                        style={{
                          textAlign: 'center',
                          verticalAlign: 'middle',
                          backgroundColor:
                            detailData.nowBrno !== detailData.cofBrno
                              ? '#FFFFCC'
                              : '',
                        }}
                      >
                        {brNoFormatter(detailData.nowBrno)}
                      </td>
                      <td
                        style={{
                          textAlign: 'center',
                          verticalAlign: 'middle',
                          backgroundColor:
                            detailData.nowBrno !== detailData.cofBrno
                              ? '#FFFFCC'
                              : '',
                        }}
                      >
                        {brNoFormatter(detailData.cofBrno)}
                      </td>
                      <td
                        style={{ textAlign: 'center', verticalAlign: 'middle' }}
                      >
                        {brNoFormatter(detailData.netBrno)}
                      </td>
                    </tr>
                    <tr>
                      <th
                        style={{
                          backgroundColor: '#e5ebf0',
                          fontWeight: '500',
                        }}
                      >
                        주민등록번호
                      </th>
                      <td
                        style={{
                          textAlign: 'center',
                          verticalAlign: 'middle',
                          backgroundColor:
                            detailData.nowRprsvRrno !== detailData.cofRprsvRrno
                              ? '#FFFFCC'
                              : '',
                        }}
                      >
                        {rrNoFormatter(detailData.nowRprsvRrno)}
                      </td>
                      <td
                        style={{
                          textAlign: 'center',
                          verticalAlign: 'middle',
                          backgroundColor:
                            detailData.nowRprsvRrno !== detailData.cofRprsvRrno
                              ? '#FFFFCC'
                              : '',
                        }}
                      >
                        {rrNoFormatter(detailData.cofRprsvRrno)}
                      </td>
                      <td
                        style={{ textAlign: 'center', verticalAlign: 'middle' }}
                      >
                        {rrNoFormatter(detailData.netRprsvRrno)}
                      </td>
                    </tr>
                    <tr>
                      <th
                        style={{
                          backgroundColor: '#e5ebf0',
                          fontWeight: '500',
                        }}
                      >
                        법인등록번호
                      </th>
                      <td
                        style={{
                          textAlign: 'center',
                          verticalAlign: 'middle',
                          backgroundColor:
                            detailData.nowCrno !== detailData.cofCrno
                              ? '#FFFFCC'
                              : '',
                        }}
                      >
                        {rrNoFormatter(detailData.nowCrno)}
                      </td>
                      <td
                        style={{
                          textAlign: 'center',
                          verticalAlign: 'middle',
                          backgroundColor:
                            detailData.nowCrno !== detailData.cofCrno
                              ? '#FFFFCC'
                              : '',
                        }}
                      >
                        {rrNoFormatter(detailData.cofCrno)}
                      </td>
                      <td
                        style={{ textAlign: 'center', verticalAlign: 'middle' }}
                      >
                        {rrNoFormatter(detailData.netCrno)}
                      </td>
                    </tr>
                    <tr>
                      <th
                        style={{
                          backgroundColor: '#e5ebf0',
                          fontWeight: '500',
                        }}
                      >
                        지자체명
                      </th>
                      <td
                        style={{
                          textAlign: 'center',
                          verticalAlign: 'middle',
                          backgroundColor:
                            detailData.nowLocgovNm !== detailData.cofLocgovNm
                              ? '#FFFFCC'
                              : '',
                        }}
                      >
                        {detailData.nowLocgovNm}
                      </td>
                      <td
                        style={{
                          textAlign: 'center',
                          verticalAlign: 'middle',
                          backgroundColor:
                            detailData.nowLocgovNm !== detailData.cofLocgovNm
                              ? '#FFFFCC'
                              : '',
                        }}
                      >
                        {detailData.cofLocgovNm}
                      </td>
                      <td
                        style={{ textAlign: 'center', verticalAlign: 'middle' }}
                      >
                        {detailData.netLocgovNm}
                      </td>
                    </tr>
                    <tr>
                      <th
                        style={{
                          backgroundColor: '#e5ebf0',
                          fontWeight: '500',
                        }}
                      >
                        면허업종
                      </th>
                      <td
                        style={{
                          textAlign: 'center',
                          verticalAlign: 'middle',
                          backgroundColor:
                            detailData.nowVhclSttsNm !==
                            detailData.cofVhclSttsNm
                              ? '#FFFFCC'
                              : '',
                        }}
                      >
                        {detailData.nowVhclSttsNm}
                      </td>
                      <td
                        style={{
                          textAlign: 'center',
                          verticalAlign: 'middle',
                          backgroundColor:
                            detailData.nowVhclSttsNm !==
                            detailData.cofVhclSttsNm
                              ? '#FFFFCC'
                              : '',
                        }}
                      >
                        {detailData.cofVhclSttsNm}
                      </td>
                      <td
                        style={{ textAlign: 'center', verticalAlign: 'middle' }}
                      >
                        {detailData.netVhclSttsNm}
                      </td>
                    </tr>
                    <tr>
                      <th
                        style={{
                          backgroundColor: '#e5ebf0',
                          fontWeight: '500',
                        }}
                      >
                        유종
                      </th>
                      <td
                        style={{
                          textAlign: 'center',
                          verticalAlign: 'middle',
                          backgroundColor:
                            detailData.nowKoiCdNm !== detailData.cofKoiCdNm
                              ? '#FFFFCC'
                              : '',
                        }}
                      >
                        {detailData.nowKoiCdNm}
                      </td>
                      <td
                        style={{
                          textAlign: 'center',
                          verticalAlign: 'middle',
                          backgroundColor:
                            detailData.nowKoiCdNm !== detailData.cofKoiCdNm
                              ? '#FFFFCC'
                              : '',
                        }}
                      >
                        {detailData.cofKoiCdNm}
                      </td>
                      <td
                        style={{ textAlign: 'center', verticalAlign: 'middle' }}
                      >
                        {detailData.netKoiCdNm}
                      </td>
                    </tr>
                    <tr>
                      <th
                        style={{
                          backgroundColor: '#e5ebf0',
                          fontWeight: '500',
                        }}
                      >
                        업체명
                      </th>
                      <td
                        style={{
                          textAlign: 'center',
                          verticalAlign: 'middle',
                          backgroundColor:
                            detailData.nowBzentyNm !== detailData.cofBzentyNm
                              ? '#FFFFCC'
                              : '',
                        }}
                      >
                        {detailData.nowBzentyNm}
                      </td>
                      <td
                        style={{
                          textAlign: 'center',
                          verticalAlign: 'middle',
                          backgroundColor:
                            detailData.nowBzentyNm !== detailData.cofBzentyNm
                              ? '#FFFFCC'
                              : '',
                        }}
                      >
                        {detailData.cofBzentyNm}
                      </td>
                      <td
                        style={{ textAlign: 'center', verticalAlign: 'middle' }}
                      >
                        {detailData.netBzentyNm}
                      </td>
                    </tr>
                    <tr>
                      <th
                        style={{
                          backgroundColor: '#e5ebf0',
                          fontWeight: '500',
                        }}
                      >
                        대표자명
                      </th>
                      <td
                        style={{
                          textAlign: 'center',
                          verticalAlign: 'middle',
                          backgroundColor:
                            detailData.nowRprsvNm !== detailData.cofRprsvNm
                              ? '#FFFFCC'
                              : '',
                        }}
                      >
                        {detailData.nowRprsvNm}
                      </td>
                      <td
                        style={{
                          textAlign: 'center',
                          verticalAlign: 'middle',
                          backgroundColor:
                            detailData.nowRprsvNm !== detailData.cofRprsvNm
                              ? '#FFFFCC'
                              : '',
                        }}
                      >
                        {detailData.cofRprsvNm}
                      </td>
                      <td
                        style={{ textAlign: 'center', verticalAlign: 'middle' }}
                      >
                        {detailData.netRprsvNm}
                      </td>
                    </tr>
                    <tr>
                      <th
                        style={{
                          backgroundColor: '#e5ebf0',
                          fontWeight: '500',
                        }}
                      >
                        차량상태/폐차여부
                      </th>
                      <td
                        style={{ textAlign: 'center', verticalAlign: 'middle' }}
                      >
                        {detailData.nowVhclScrapNm}
                      </td>
                      <td
                        style={{ textAlign: 'center', verticalAlign: 'middle' }}
                      >
                        {detailData.cofVhclScrapNm}
                      </td>
                      <td
                        style={{ textAlign: 'center', verticalAlign: 'middle' }}
                      >
                        {detailData.netVhclScrapNm}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <Box
              sx={{
                width: '28%',
                backgroundColor: '#e5ebf0',
                p: 1,
                whiteSpace: 'pre-line',
                paddingTop: '1vh',
              }}
            >
              {detailData.nowFlnm !== detailData.cofFlnm
                ? ' - 수급자명/업체명 변경\n'
                : ''}
              {detailData.nowBrno !== detailData.cofBrno
                ? ' - 사업자등록번호 변경\n'
                : ''}
              {detailData.nowRprsvRrno !== detailData.cofRprsvRrno
                ? ' - 주민등록번호 변경\n'
                : ''}
              {detailData.nowCrno !== detailData.cofCrno
                ? ' - 법인등록번호 변경\n'
                : ''}
              {detailData.nowLocgovNm !== detailData.cofLocgovNm
                ? ' - 지자체명 변경\n'
                : ''}
              {detailData.nowVhclSttsNm !== detailData.cofVhclSttsNm
                ? ' - 면허업종 변경\n'
                : ''}
              {detailData.nowKoiCdNm !== detailData.cofKoiCdNm
                ? ' - 유종 변경\n'
                : ''}
              {detailData.nowBzentyNm !== detailData.cofBzentyNm
                ? ' - 업체명 변경\n'
                : ''}
              {detailData.nowRprsvNm !== detailData.cofRprsvNm
                ? ' - 대표자명 변경\n'
                : ''}
            </Box>
          </Box>
          <CustomFormLabel className="input-label-display" htmlFor="ft-fname">
            승인처리시 말소대상 카드정보
          </CustomFormLabel>
          {/* 테이블영역 시작 */}
          <Box>
            <TableDataGrid
              headCells={headCells} // 테이블 헤더 값
              rows={rows} // 목록 데이터
              totalRows={totalRows} // 총 로우 수
              loading={loading} // 로딩여부
              caption={"말소대상 카드 정보 목록 조회"}
            />
          </Box>
          {/* 테이블영역 끝 */}
          <LoadingBackdrop open={loadingBackdrop} />
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default BsDetailModal

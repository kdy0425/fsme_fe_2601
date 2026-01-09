import {
  CustomFormLabel,
  CustomTextField,
  CustomRadio,
} from '@/utils/fsms/fsm/mui-imports'
import { Box } from '@mui/material'
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  RadioGroup,
  FormControlLabel,
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import { getFormatToday } from '@/utils/fsms/common/comm'
import { brNoFormatter, rrNoFormatter } from '@/utils/fsms/common/util'
import { Row } from './page'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'

import { HeadCell } from 'table'

const headCells: HeadCell[] = [
  {
    id: 'flnm',
    numeric: false,
    disablePadding: false,
    label: '수급자명',
  },
  {
    id: 'rrno',
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
    id: 'cardNo',
    numeric: false,
    disablePadding: false,
    label: '카드번호',
    format: 'cardNo',
  },
  {
    id: 'crdtCeckSeNm',
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
    id: 'cardSttsNm',
    numeric: false,
    disablePadding: false,
    label: '카드상태',
  },
]

interface cardRow {
  flnm: string // 수급자명
  rrno: string // 주민등록번호
  crdcoNm: string // 카드사
  cardNo: string // 카드번호
  aprvYmd: string // 발급일자
  cardSttsNm: string // 카드상태
}

interface BsDetailModalProps {
  open: boolean
  handleClickClose: () => void
  saveData: () => void
  data: Row
}
const BsDetailModal = (props: BsDetailModalProps) => {
  const { open, handleClickClose, saveData, data } = props
  const [loading, setLoading] = useState(false) // 로딩여부
  const [rows, setRows] = useState<cardRow[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수

  useEffect(() => {
    if (open) fetchData()
  }, [open])

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    setLoading(true)
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/cad/rtjm/bs/getOneRfidTagJdgmnMng?` +
        `&vhclNo=${data.vhclNo}` +
        `&dscntYn=Y` +
        `&cardSttsCd=00`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        setRows(response.data.cardResult)
        setTotalRows(response.data.cardResult.length)
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

  return (
    <Box>
      <Dialog
        fullWidth={false}
        maxWidth={'lg'}
        open={open}
        PaperProps={{
          style: {
            width: '1200px',
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
                  saveData()
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
            <div id="alert-dialog-description1" style={{ width: '48%' }}>
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-fname"
              >
                기존 사업자정보
              </CustomFormLabel>
            </div>
            <div id="alert-dialog-description1" style={{ width: '48%' }}>
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-fname"
              >
                승인요청 사업자정보
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
            <div id="alert-dialog-description1" style={{ width: '50%' }}>
              {/* 테이블영역 시작 */}
              <div className="table-scrollable">
                <table className="table table-bordered">
                  <caption>기존 사업자정보</caption>
                  <colgroup>
                    <col style={{ width: '25%' }} />
                    <col style={{ width: '25%' }} />
                    <col style={{ width: '25%' }} />
                    <col style={{ width: '25%' }} />
                  </colgroup>
                  <tbody>
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
                        colSpan={3}
                        style={{
                          textAlign: 'center',
                          verticalAlign: 'middle',
                        }}
                      >
                        {data.preBzentyNm}
                      </td>
                    </tr>
                    <tr>
                      <th
                        style={{
                          backgroundColor: '#e5ebf0',
                          fontWeight: '500',
                        }}
                      >
                        사업자번호
                      </th>
                      <td
                        style={{
                          textAlign: 'center',
                          verticalAlign: 'middle',
                        }}
                      >
                        {brNoFormatter(data.preBrno)}
                      </td>
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
                        }}
                      >
                        {rrNoFormatter(data.preCrno)}
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
                        }}
                      >
                        {data.preRprsvNm}
                      </td>
                      <th
                        style={{
                          backgroundColor: '#e5ebf0',
                          fontWeight: '500',
                        }}
                      >
                        대표자주민등록번호
                      </th>
                      <td
                        style={{
                          textAlign: 'center',
                          verticalAlign: 'middle',
                        }}
                      >
                        {rrNoFormatter(data.preRprsvRrno)}
                      </td>
                    </tr>
                    <tr>
                      <th
                        style={{
                          backgroundColor: '#e5ebf0',
                          fontWeight: '500',
                        }}
                      >
                        개인법인구분
                      </th>
                      <td
                        colSpan={3}
                        style={{
                          textAlign: 'center',
                          verticalAlign: 'middle',
                        }}
                      >
                        {data.preBzmnSeNm}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div id="alert-dialog-description1" style={{ width: '50%' }}>
              {/* 테이블영역 시작 */}
              <div className="table-scrollable">
                <table className="table table-bordered">
                  <caption>승인요청 사업자정보</caption>
                  <colgroup>
                    <col style={{ width: '25%' }} />
                    <col style={{ width: '25%' }} />
                    <col style={{ width: '25%' }} />
                    <col style={{ width: '25%' }} />
                  </colgroup>
                  <tbody>
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
                        colSpan={3}
                        style={{
                          textAlign: 'center',
                          verticalAlign: 'middle',
                        }}
                      >
                        {data.bzentyNm}
                      </td>
                    </tr>
                    <tr>
                      <th
                        style={{
                          backgroundColor: '#e5ebf0',
                          fontWeight: '500',
                        }}
                      >
                        사업자번호
                      </th>
                      <td
                        style={{
                          textAlign: 'center',
                          verticalAlign: 'middle',
                        }}
                      >
                        {brNoFormatter(data.brno)}
                      </td>
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
                        }}
                      >
                        {rrNoFormatter(data.crno)}
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
                        }}
                      >
                        {data.rprsvNm}
                      </td>
                      <th
                        style={{
                          backgroundColor: '#e5ebf0',
                          fontWeight: '500',
                        }}
                      >
                        대표자주민등록번호
                      </th>
                      <td
                        style={{
                          textAlign: 'center',
                          verticalAlign: 'middle',
                        }}
                      >
                        {rrNoFormatter(data.rprsvRrno)}
                      </td>
                    </tr>
                    <tr>
                      <th
                        style={{
                          backgroundColor: '#e5ebf0',
                          fontWeight: '500',
                        }}
                      >
                        개인법인구분
                      </th>
                      <td
                        colSpan={3}
                        style={{
                          textAlign: 'center',
                          verticalAlign: 'middle',
                        }}
                      >
                        {data.bzmnSeNm}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </Box>
          <div className="box-con-col">
            <div className="contents-explanation">
              <div className="contents-explanation-inner">
                <div className="contents-explanation-text">
                  ※ 승인요청 차량의 유종, 면허업종정보, 수급자주민번호가
                  기존차량과 다를경우, 기존 수급자의 카드가 말소처리 됩니다.
                </div>
              </div>
            </div>
          </div>
          <Box
            sx={{
              display: 'flex', // Flexbox를 활성화
              justifyContent: 'space-between', // 두 div 사이 간격 조절
              gap: 2, // 간격 조절
              width: '100%', // 전체 너비 사용
            }}
          >
            <div id="alert-dialog-description1" style={{ width: '48%' }}>
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-fname"
              >
                기존 차량정보
              </CustomFormLabel>
            </div>
            <div id="alert-dialog-description1" style={{ width: '48%' }}>
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-fname"
              >
                승인요청 차량정보
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
            <div id="alert-dialog-description1" style={{ width: '50%' }}>
              {/* 테이블영역 시작 */}
              <div className="table-scrollable">
                <table className="table table-bordered">
                  <caption>기존 차량정보</caption>
                  <colgroup>
                    <col style={{ width: '25%' }} />
                    <col style={{ width: '25%' }} />
                    <col style={{ width: '25%' }} />
                    <col style={{ width: '25%' }} />
                  </colgroup>
                  <tbody>
                    <tr>
                      <th
                        style={{
                          backgroundColor: '#e5ebf0',
                          fontWeight: '500',
                        }}
                      >
                        차량번호
                      </th>
                      <td
                        style={{
                          textAlign: 'center',
                          verticalAlign: 'middle',
                        }}
                      >
                        {data.preVhclNo}
                      </td>
                      <th
                        style={{
                          backgroundColor: '#e5ebf0',
                          fontWeight: '500',
                        }}
                      >
                        관할관청
                      </th>
                      <td
                        style={{
                          textAlign: 'center',
                          verticalAlign: 'middle',
                        }}
                      >
                        {data.preLocgovNm}
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
                        }}
                      >
                        {data.preKoiNm}
                      </td>
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
                        }}
                      >
                        {rrNoFormatter(data.preRprsvRrno)}
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
                        }}
                      >
                        {data.preVhclSeNm}
                      </td>
                      <th
                        style={{
                          backgroundColor: '#e5ebf0',
                          fontWeight: '500',
                        }}
                      >
                        수급자명
                      </th>
                      <td
                        style={{
                          textAlign: 'center',
                          verticalAlign: 'middle',
                        }}
                      >
                        {data.preRprsvNm}
                      </td>
                    </tr>
                    <tr>
                      <th
                        style={{
                          backgroundColor: '#e5ebf0',
                          fontWeight: '500',
                        }}
                      >
                        할인여부
                      </th>
                      <td
                        style={{
                          textAlign: 'center',
                          verticalAlign: 'middle',
                        }}
                      >
                        {data.preDscntYn === 'Y' ? '할인' : '미할인'}
                      </td>
                      <th
                        style={{
                          backgroundColor: '#e5ebf0',
                          fontWeight: '500',
                        }}
                      >
                        차량상태
                      </th>
                      <td
                        style={{
                          textAlign: 'center',
                          verticalAlign: 'middle',
                        }}
                      >
                        {data.preVhclSttsNm}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div id="alert-dialog-description1" style={{ width: '50%' }}>
              {/* 테이블영역 시작 */}
              <div className="table-scrollable">
                <table className="table table-bordered">
                  <caption>승인요청 차량정보</caption>
                  <colgroup>
                    <col style={{ width: '25%' }} />
                    <col style={{ width: '25%' }} />
                    <col style={{ width: '25%' }} />
                    <col style={{ width: '25%' }} />
                  </colgroup>
                  <tbody>
                    <tr>
                      <th
                        style={{
                          backgroundColor: '#e5ebf0',
                          fontWeight: '500',
                        }}
                      >
                        차량번호
                      </th>
                      <td
                        style={{
                          textAlign: 'center',
                          verticalAlign: 'middle',
                        }}
                      >
                        {data.vhclNo}
                      </td>
                      <th
                        style={{
                          backgroundColor: '#e5ebf0',
                          fontWeight: '500',
                        }}
                      >
                        관할관청
                      </th>
                      <td
                        style={{
                          textAlign: 'center',
                          verticalAlign: 'middle',
                        }}
                      >
                        {data.locgovNm}
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
                        }}
                      >
                        {data.koiNm}
                      </td>
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
                        }}
                      >
                        {rrNoFormatter(data.rprsvRrno)}
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
                        }}
                      >
                        {data.vhclSeNm}
                      </td>
                      <th
                        style={{
                          backgroundColor: '#e5ebf0',
                          fontWeight: '500',
                        }}
                      >
                        수급자명
                      </th>
                      <td
                        style={{
                          textAlign: 'center',
                          verticalAlign: 'middle',
                        }}
                      >
                        {data.flnm}
                      </td>
                    </tr>
                    <tr>
                      <th
                        style={{
                          backgroundColor: '#e5ebf0',
                          fontWeight: '500',
                        }}
                      >
                        할인여부
                      </th>
                      <td
                        colSpan={3}
                        style={{
                          textAlign: 'center',
                          verticalAlign: 'middle',
                        }}
                      >
                        {data.dscntYn === 'Y' ? '할인' : '미할인'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </Box>

          <CustomFormLabel className="input-label-display" htmlFor="ft-fname">
            말소대상 수급자/카드내역
          </CustomFormLabel>
          {/* 테이블영역 시작 */}
          <Box>
            <TableDataGrid
              headCells={headCells} // 테이블 헤더 값
              rows={rows} // 목록 데이터
              totalRows={totalRows} // 총 로우 수
              loading={loading} // 로딩여부
              caption={"말소대상 수급자/카드 내역 조회"}
            />
          </Box>
          {/* 테이블영역 끝 */}
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default BsDetailModal

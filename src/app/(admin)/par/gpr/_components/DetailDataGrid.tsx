import FormModal from '@/app/components/popup/FormDialog'
import BlankCard from '@/app/components/shared/BlankCard'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { getCodesByGroupNm } from '@/utils/fsms/common/code/getCode'
import { formatDate, formatKorYearMonth } from '@/utils/fsms/common/convert'
import { brNoFormatter, rrNoFormatter } from '@/utils/fsms/common/util'
import { Button } from '@mui/material'
import { useEffect, useState } from 'react'
import { SelectItem } from 'select'
import { Row } from '../page'
import AccountModalContent from './AccountModalContent'
import DelngModalContent from './DelngModalContent'

type DetailDataGridProps = {
  detail: Row
  reload: () => void
}

type commonCodeObj = {
  cdExpln: string
  cdGroupNm: string
  cdKornNm: string
  cdNm: string
  cdSeNm: string
  cdSeq: string
  comCdYn: string
  useNm: string
  useYn: string
}
const DetailDataGrid = (props: DetailDataGridProps) => {
  const { detail, reload } = props
  const { prcsSttsCd } = detail // 처리상태

  const [bankCdItems, setBankCdItems] = useState<SelectItem[]>([]) // 은행 코드
  const [accountModalOpen, setAccountModalOpen] = useState<boolean>(false)
  const [delngModalOpen, setDelngModalOpen] = useState<boolean>(false)

  const [isAssessmentVisible, setIsAssessmentVisible] = useState(true); // 정산요청 버튼 깜박임 표시 여부
  const [isConfirmVisible, setIsConfirmVisible] = useState(true); // 지급확정 버튼 깜박임 표시 여부

  const handleCommCd = async () => {
    let bankCdList: Array<commonCodeObj> = await getCodesByGroupNm('973') // 은행코드

    setBankCdItems(
      bankCdList.map((val) => {
        return { label: val.cdKornNm, value: val.cdNm }
      }),
    )
  }

  useEffect(() => {
    handleCommCd()
  }, [])

  // 깜박임 로직
  useEffect(() => {

    let interval: NodeJS.Timeout | null = null;

    // 신규등록 상태일때 정산요청 버튼 깜박임
    if (prcsSttsCd === '01') {
      interval = setInterval(() => {
        setIsAssessmentVisible((prev) => !prev); // 버튼 표시 여부 토글
      }, 500); // 500ms 간격
    } else {
      setIsAssessmentVisible(true); // 깜박임이 꺼져 있을 때 항상 보이게
    }

    // 정산완료 상태일때 지급확정 버튼 깜박임
    if (prcsSttsCd === '04') {
      interval = setInterval(() => {
        setIsConfirmVisible((prev) => !prev); // 버튼 표시 여부 토글
      }, 500); // 500ms 간격
    } else {
      setIsConfirmVisible(true); // 깜박임이 꺼져 있을 때 항상 보이게
    }

    return () => {
      if (interval) clearInterval(interval); // 컴포넌트 언마운트 시 정리
    };
  }, [prcsSttsCd]);

  // 정산요청
  const onClickAssessmentBtn = async () => {
    try {
      if (detail['prcsSttsCd'] !== '01') {
        alert('신규등록 서면신청건만 정산요청 할 수 있습니다.')
        return
      }

      const userConfirm = confirm(`해당 서면신청건을 정산요청을 하시겠습니까?`)
      if (!userConfirm) return

      let body = {
        clclnYm: detail['clclnYm'],
        vhclNo: detail['vhclNo'],
        locgovCd: detail['locgovCd'],
        aplySn: Number(detail['aplySn']),
        prcsSttsCd: detail['prcsSttsCd'],
      }

      let endpoint: string = '/fsm/par/gpr/tr/requestGnrlPapersReqst'

      const response = await sendHttpRequest('PUT', endpoint, body, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success') {
        // 성공
        alert(response.message)
        reload()
      } else {
        // 실패
        alert(response.message)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  // 재정산요청
  const onClickReassessmentBtn = async () => {
    try {
      if (detail['prcsSttsCd'] !== '04') {
        alert('정산완료된 서면신청건만 재정산요청 할 수 있습니다.')
        return
      }

      const userConfirm = confirm(
        `해당 서면신청건을 재정산요청을 하시겠습니까?`,
      )
      if (!userConfirm) return

      let body = {
        clclnYm: detail['clclnYm'],
        vhclNo: detail['vhclNo'],
        locgovCd: detail['locgovCd'],
        aplySn: Number(detail['aplySn']),
        prcsSttsCd: detail['prcsSttsCd'],
      }

      let endpoint: string = '/fsm/par/gpr/tr/reRequestGnrlPapersReqst'

      const response = await sendHttpRequest('PUT', endpoint, body, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success') {
        // 성공
        alert(response.message)
        reload()
      } else {
        // 실패
        alert(response.message)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  // 지급확정
  const onClickAssessmentConfirmBtn = async () => {
    try {
      if (detail['prcsSttsCd'] !== '04') {
        alert('정산완료된 서면신청건만 지급확정 처리할 수 있습니다.')
        return
      }

      const userConfirm = confirm(`해당 서면신청건을 지급확정 하시겠습니까?`)
      if (!userConfirm) return

      let body = {
        clclnYm: detail['clclnYm'],
        vhclNo: detail['vhclNo'],
        locgovCd: detail['locgovCd'],
        aplySn: Number(detail['aplySn']),
        prcsSttsCd: detail['prcsSttsCd'],
      }

      console.log('body ::: ', body)
      let endpoint: string = '/fsm/par/gpr/tr/decisionGnrlPapersReqst'

      const response = await sendHttpRequest('PUT', endpoint, body, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success') {
        // 성공
        alert(response.message)
        reload()
      } else {
        // 실패
        alert(response.message)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const openAccountModal = () => {
    setAccountModalOpen(true)
  }
  const openDelngModal = () => {
    setDelngModalOpen(true)
  }

  const handleReload = () => {
    reload()
    setAccountModalOpen(false)
  }

  return (
    <>
      <BlankCard className="contents-card" title="상세정보">
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: '12px',
          }}
        >
          {prcsSttsCd === '01' ? (
            <Button
              onClick={openAccountModal}
              variant="outlined"
              style={{ marginLeft: '6px' }}
            >
              계좌정보수정
            </Button>
          ) : null}{' '}
          {/** 01 */}
          <Button
            onClick={openDelngModal}
            variant="outlined"
            style={{ marginLeft: '6px' }}
          >
            거래내역조회
          </Button>{' '}
          {/** 01,02,04,05,10 */}
          {prcsSttsCd === '01' ? (
            <Button
              onClick={onClickAssessmentBtn}
              variant="outlined"
              style={{ marginLeft: '6px' }}
              sx={{
                transition: 'opacity 0.3s ease',
                opacity: isAssessmentVisible ? 1 : 0, // 깜박임 상태에 따라 투명도 변경
              }}
            >
              정산요청
            </Button>
          ) : null}{' '}
          {/** 01 */}
          {prcsSttsCd === '04' ? (
            <Button
              onClick={onClickReassessmentBtn}
              variant="outlined"
              style={{ marginLeft: '6px' }}
            >
              재정산요청
            </Button>
          ) : null}
          {/** 04 */}
          {prcsSttsCd === '04' ? (
            <Button
              onClick={onClickAssessmentConfirmBtn}
              variant="outlined"
              style={{ marginLeft: '6px' }}
              sx={{
                transition: 'opacity 0.3s ease',
                opacity: isConfirmVisible ? 1 : 0, // 깜박임 상태에 따라 투명도 변경
              }}
            >
              지급확정
            </Button>
          ) : null}{' '}
          {/** 04 */}
        </div>
        <>
          {/* 테이블영역 시작 */}
          <div className="table-scrollable">
            <table className="table table-bordered">
              <caption>상세정보</caption>
              <colgroup>
                <col style={{ width: '10rem' }} />
                <col style={{ width: 'auto' }} />
                <col style={{ width: '10rem' }} />
                <col style={{ width: 'auto' }} />
                <col style={{ width: '10rem' }} />
                <col style={{ width: 'auto' }} />
                <col style={{ width: '10rem' }} />
                <col style={{ width: 'auto' }} />
              </colgroup>
              <tbody>
                <tr>
                  <th className="td-head" scope="row">
                    차량번호
                  </th>
                  <td>{detail['vhclNo']}</td>
                  <th className="td-head" scope="row">
                    법인등록번호
                  </th>
                  <td>{detail['crno']}</td>
                  <th className="td-head" scope="row">
                    사업자등록번호
                  </th>
                  <td>{brNoFormatter(detail['vonrBrno'])}</td>
                  <th className="td-head" scope="row">
                    주민등록번호
                  </th>
                  <td>{rrNoFormatter(detail['vonrRrnoS'])}</td>
                </tr>
                <tr>
                  <th className="td-head" scope="row">
                    소유자명
                  </th>
                  <td>{detail['vonrNm']}</td>
                  <th className="td-head" scope="row">
                    구분
                  </th>
                  <td>{detail['vhclPsnNm']}</td>
                  <th className="td-head" scope="row">
                    유종
                  </th>
                  <td>{detail['koiNm']}</td>
                  <th className="td-head" scope="row">
                    톤수
                  </th>
                  <td>{detail['vhclTonNm']}</td>
                </tr>
                <tr>
                  <th className="td-head" scope="row">
                    주유월
                  </th>
                  <td>{formatKorYearMonth(detail['clclnYm'])}</td>
                  <th className="td-head" scope="row">
                    유류사용량
                  </th>
                  <td>
                    {Number(detail['useLiter']).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <th className="td-head" scope="row"></th>
                  <td></td>
                  <th className="td-head" scope="row"></th>
                  <td></td>
                </tr>
                <tr>
                  <th className="td-head" scope="row">
                    신청사유
                  </th>
                  <td colSpan={7}>{detail['docmntAplyRsnCn']}</td>
                </tr>
                <tr>
                  <th className="td-head" scope="row">
                    예금주명
                  </th>
                  <td>{detail['dpstrNm']}</td>
                  <th className="td-head" scope="row">
                    금융기관
                  </th>
                  <td colSpan={2}>{detail['bankNm']}</td>
                  <th className="td-head" scope="row">
                    계좌번호
                  </th>
                  <td colSpan={2}>{detail['actno']}</td>
                </tr>
                <tr>
                  <th className="td-head" scope="row">
                    정산리터
                  </th>
                  <td>
                    {Number(detail['tclmLiter']).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <th className="td-head" scope="row">
                    정산금액
                  </th>
                  <td>{Number(detail['tclmAmt']).toLocaleString('ko-KR')}</td>
                  <th className="td-head" scope="row">
                    지급확정일자
                  </th>
                  <td>{formatDate(detail['giveCfmtnYmd'])}</td>
                  <th className="td-head" scope="row"></th>
                  <td></td>
                </tr>
                <tr>
                  <th className="td-head" scope="row">
                    등록자아이디
                  </th>
                  <td>{detail['rgtrId']}</td>
                  <th className="td-head" scope="row">
                    등록일자
                  </th>
                  <td>{formatDate(detail['regDt'])}</td>
                  <th className="td-head" scope="row">
                    수정자아이디
                  </th>
                  <td>{detail['mdfrId']}</td>
                  <th className="td-head" scope="row">
                    수정일자
                  </th>
                  <td>{formatDate(detail['mdfcnDt'])}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      </BlankCard>
      <FormModal
        buttonLabel={''}
        title={'계좌정보 수정'}
        submitBtn={false}
        remoteFlag={accountModalOpen}
        closeHandler={() => setAccountModalOpen(false)}
        size="xl"
        btnSet={
          <>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              form="search-data"
            >
              검색
            </Button>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              form="update-data"
            >
              저장
            </Button>
          </>
        }
      >
        <AccountModalContent
          reload={handleReload}
          locgovCd={detail.locgovCd}
          vhclNo={detail.vhclNo}
          clclnYm={detail.clclnYm}
          aplySn={detail.aplySn}
          dpstrNm={detail.dpstrNm}
          bankCdItems={bankCdItems}
        />
      </FormModal>
      <FormModal
        buttonLabel={''}
        title={'거래내역조회'}
        submitBtn={false}
        remoteFlag={delngModalOpen}
        closeHandler={() => setDelngModalOpen(false)}
        size="xl"
        btnSet={
          <>
            <Button
              variant="contained"
              color="success"
              type="submit"
              form="excel-download"
            >
              엑셀
            </Button>
          </>
        }
      >
        <DelngModalContent aprvYm={detail.clclnYm} vhclNo={detail.vhclNo} />
      </FormModal>
    </>
  )
}

export default DetailDataGrid

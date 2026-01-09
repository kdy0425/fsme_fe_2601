/* React */
import React, { memo, useState, useEffect } from 'react'

/* mui */
import { Grid, Box } from '@mui/material'

/* 공통 component */
import BlankCard from '@/components/shared/BlankCard'
import FormDialog from '@/app/components/popup/FormDialog'

/* 공통 js */
import { getDateTimeString, brNoFormatter } from '@/utils/fsms/common/util'
import { getUserInfo } from '@/utils/fsms/utils'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'

/* 부모 컴포넌트에서 선언한 interface */
import { CardReqstRow } from '../page'

/* 모달 */
import { LocgovModalContent } from './ModalContent'
import { rrNoFormatter, telnoFormatter } from '@/utils/fsms/common/util'

/* interface선언 */
interface DetailDataGridProps {
  detailInfo: CardReqstRow | null
  setReSearchFlag: (flag: any) => void
}

export interface locgovListInterface {
  ctpvCd: string
  ctpvNm: string
  locgovCd: string
  locgovNm: string
  sggCd: string
}

const DetailDataGrid = (props: DetailDataGridProps) => {
  const { detailInfo, setReSearchFlag } = props
  const userInfo = getUserInfo()
  const [remoteFlag, setRmoteFlag] = useState<boolean | undefined>(undefined)
  const [searchFlag, setSearchFlag] = useState<boolean>(false)

  useEffect(() => {
    if (!remoteFlag) {
      setRmoteFlag(undefined)
    }
  }, [remoteFlag])

  // 등록구분코드별 텍스트세팅
  const getText = () => {
    const regSeCd = detailInfo?.regSeCd

    let label = ''
    let bgngLabel = '카드첫사용일'
    let endCol = detailInfo?.cardFrstUseYmd

    if (regSeCd == '0') {
      label = '면허개시일'
    } else if (regSeCd == '1') {
      label = '분실훼손일'
    } else if (regSeCd == '3') {
      label = '카드정지일'
    } else if (regSeCd == '4') {
      label = '압류 시작일'
      bgngLabel = '압류 종료일'
      endCol = detailInfo?.regSeCdAcctoEndYmd
    } else {
      label = '등록구분일자'
    }

    return (
      <>
        <th className="td-head" scope="row">
          {label}
        </th>
        <td>
          {
            getDateTimeString(detailInfo?.regSeCdAcctoYmd ?? '', 'date')
              ?.dateString
          }
        </td>
        <th className="td-head" scope="row">
          {bgngLabel}
        </th>
        <td>{getDateTimeString(endCol ?? '', 'date')?.dateString}</td>
      </>
    )
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    setSearchFlag((prev) => !prev)
  }

  // 지자체변경
  const updateLocgovCd = async (row: locgovListInterface) => {
    if (row.locgovCd == detailInfo?.locgovCd) {
      alert(
        '요청을 변경할 지자체와 우리지자체가 동일합니다. 지자체를 다시 선택해 주십시오.',
      )
      return
    }

    const strQuestion =
      '서면신청관리 거래내역정보를 우리지자체에서 [' +
      row.locgovNm +
      ']로 변경(이관)처리하시겠습니까?'

    if (confirm(strQuestion)) {
      try {
        const endPoint = '/fsm/par/cpr/cm/updateLocgovCardPapersReqst'
        const body = {
          docmntAplyUnqNo: detailInfo?.docmntAplyUnqNo,
          locgovCd: row.locgovCd,
          mdfrId: userInfo.lgnId,
        }

        const response = await sendHttpRequest('PUT', endPoint, body, true, {
          cache: 'no-store',
        })

        if (response && response.resultType === 'success') {
          alert('변경 완료되었습니다.')
          setReSearchFlag((prev: any) => !prev)
          setRmoteFlag(false)
        } else {
          alert('관리자에게 문의부탁드립니다')
          setRmoteFlag(false)
        }
      } catch (error) {
        alert('관리자에게 문의부탁드립니다' + error)
        setRmoteFlag(false)
      }
    }
  }

  return (
    <Grid container spacing={2} className="card-container">
      <Grid item xs={12} sm={12} md={12}>
        <BlankCard className="contents-card" title="서면신청 상세정보">
          <>
            {userInfo.roles[0] == 'ADMIN' && detailInfo ? (
              <div style={{ textAlign: 'right', marginBottom: '10px' }}>
                <Box component="form" onSubmit={handleSubmit} id="modalForm">
                  <FormDialog
                    size="lg"
                    buttonLabel="지자체변경"
                    title="지자체변경"
                    formLabel="조회"
                    formId="modalForm"
                    remoteFlag={remoteFlag}
                    children={
                      <LocgovModalContent
                        searchFlag={searchFlag}
                        updateLocgovCd={updateLocgovCd}
                      />
                    }
                  />
                </Box>
              </div>
            ) : null}
          </>
          {/* 테이블영역 시작 */}
          <div className="table-scrollable">
            <table className="table table-bordered">
              <caption>상세 내용 시작</caption>
              <colgroup>
                <col style={{ width: '10%' }} />
                <col style={{ width: '13%' }} />
                <col style={{ width: '15%' }} />
                <col style={{ width: '14%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '14%' }} />
                <col style={{ width: '11%' }} />
                <col style={{ width: '13%' }} />
              </colgroup>
              <tbody>
                <tr>
                  <th className="td-head" scope="row">
                    상호(성명)
                  </th>
                  <td>{detailInfo?.flnm}</td>
                  <th className="td-head" scope="row">
                    사업자등록번호
                  </th>
                  <td>{brNoFormatter(detailInfo?.brno ?? '')}</td>
                  <th className="td-head" scope="row">
                    주민등록번호
                  </th>
                  <td>{rrNoFormatter(detailInfo?.rrnoS ?? '')}</td>
                  <th className="td-head" scope="row">
                    대리운전여부
                  </th>
                  <td>{detailInfo?.agdrvrYnNm}</td>
                </tr>
                <tr>
                  <th className="td-head" scope="row">
                    대리운전자성명
                  </th>
                  <td>{detailInfo?.agdrvrNm}</td>
                  <th className="td-head" scope="row">
                    대리운전자 주민등록번호
                  </th>
                  <td>{rrNoFormatter(detailInfo?.agdrvrRrnoS ?? '')}</td>
                  <th className="td-head" scope="row">
                    차량번호
                  </th>
                  <td>{detailInfo?.vhclNo}</td>
                  <th className="td-head" scope="row">
                    유종
                  </th>
                  <td>{detailInfo?.koiNm}</td>
                </tr>
                <tr>
                  <th className="td-head" scope="row">
                    주소
                  </th>
                  <td colSpan={5}>{detailInfo?.addr}</td>
                  <th className="td-head" scope="row">
                    연락처
                  </th>
                  <td>{telnoFormatter(detailInfo?.telno ?? '')}</td>
                </tr>
                <tr>
                  <th className="td-head" scope="row">
                    지자체명
                  </th>
                  <td>{detailInfo?.locgovNm}</td>
                  <th className="td-head" scope="row">
                    등록구분
                  </th>
                  <td>{detailInfo?.regSeNm}</td>
                  {getText()}
                </tr>
                <tr>
                  <th className="td-head" scope="row">
                    조합/지부
                  </th>
                  <td>{detailInfo?.pasctNm}</td>
                  <td colSpan={2}>{detailInfo?.casctNm}</td>
                  <th className="td-head" scope="row">
                    신청일자
                  </th>
                  <td>
                    {
                      getDateTimeString(detailInfo?.rcptYmd ?? '', 'date')
                        ?.dateString
                    }
                  </td>
                  <th className="td-head" scope="row">
                    상태
                  </th>
                  <td>{detailInfo?.aprvNm}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </BlankCard>
      </Grid>
    </Grid>
  )
}

export default memo(DetailDataGrid)

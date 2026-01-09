/* React */
import React, { memo, useState } from 'react'

/* mui component */
import { Grid, Button } from '@mui/material'

/* 공통 component */
import BlankCard from '@/components/shared/BlankCard'
import { useDispatch, useSelector } from '@/store/hooks'
import { AppState } from '@/store/store'
import { LocalSearchModal } from '@/components/tr/popup/LocalSearchModal'
import { openLocgovModal } from '@/store/popup/LocgovInfoSlice'
import {
  brNoFormatter,
  rrNoFormatter,
  telnoFormatter,
  cardNoFormatter,
} from '@/utils/fsms/common/util'

import ShowRrnoModal from '@/app/components/popup/ShowRrnoModal'
import { toQueryParameter } from '@/utils/fsms/utils'

interface propsInterface {
  data: any
  openModal?: () => void
}

const DetailComponent = (props: propsInterface) => {
  const { data, openModal, buttonYn } = props

  // 주민번호보기 모달
  const [rrnoModalOpen, setRrnoModalOpen] = useState<boolean>(false)

  const dispatch = useDispatch()
  const locgovInfo = useSelector((state: AppState) => state.locgovInfo)
  return (
    <>
      <Grid container spacing={2} className="card-container">
        <Grid item xs={12} sm={12} md={12}>
          <BlankCard
            className="contents-card"
            title="발급심사 상세정보"
            buttons={
              buttonYn
                ? [
                    {
                      label: '상세검토',
                      onClick: () => openModal('TrDeatailConfirm'),
                      ket: '1',
                      color: 'outlined',
                    },
                  ]
                : undefined
            }
          >
            <>
              {/* 테이블영역 시작 */}
              <div className="table-scrollable">
                <table className="table table-bordered">
                  <caption>상세 내용 시작</caption>
                  <colgroup>
                    <col style={{ width: '9%' }} />
                    <col style={{ width: '15%' }} />
                    <col style={{ width: '5%' }} />
                    <col style={{ width: '15%' }} />
                    <col style={{ width: '6%' }} />
                    <col style={{ width: '11%' }} />
                    <col style={{ width: '7%' }} />
                    <col style={{ width: '15%' }} />
                  </colgroup>
                  <tbody>
                    {/* 스타일 정의 */}
                    <style jsx>{`
                      td {
                        padding: 10px;
                        vertical-align: middle;
                      }

                      .content {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        width: 100%;
                      }

                      .text {
                        text-align: center;
                        flex: 1; /* 남은 공간을 채움 */
                      }

                      .buttons {
                        display: flex;
                        gap: 5px;
                      }

                      /* 버튼이 없을 때 텍스트 전체 가운데 정렬 */
                      .buttons:empty + .text {
                        justify-content: center;
                      }
                    `}</style>
                    <tr>
                      <th className="td-head" scope="row">
                        차량번호
                      </th>
                      <td colSpan={3} style={{ verticalAlign: 'middle' }}>
                        <div
                          className={`content ${buttonYn ? 'with-buttons' : 'no-buttons'}`}
                        >
                          <span className="text td-left">{data?.vhclNo}</span>
                          {buttonYn && (
                            <div className="buttons">
                              <Button
                                variant="contained"
                                color="dark"
                                style={{ marginLeft: '8px' }}
                                onClick={() =>
                                  openModal('CarManageInfoSysModal')
                                }
                              >
                                자동차망조회
                              </Button>
                              <Button
                                variant="contained"
                                color="dark"
                                style={{ marginLeft: '8px' }}
                                onClick={() => openModal('TrCarStopList')}
                              >
                                정지및휴지조회
                              </Button>
                              <Button
                                variant="contained"
                                color="dark"
                                style={{ marginLeft: '8px' }}
                                onClick={() => openModal('TrDrverList')}
                                //onClick={() => openModal('TrDrverRejectList')}
                              >
                                운전자조회
                              </Button>
                            </div>
                          )}
                        </div>
                      </td>
                      <th className="td-head" scope="row">
                        수급자명
                      </th>
                      <td
                        className="td-left"
                        style={{ verticalAlign: 'middle' }}
                      >
                        {data?.vonrNm}
                      </td>
                      <th className="td-head" scope="row">
                        법인등록번호
                      </th>
                      <td
                        className="td-left"
                        style={{ verticalAlign: 'middle' }}
                      >
                        {rrNoFormatter(data?.crnoS)}
                      </td>
                    </tr>
                    <tr>
                      <th className="td-head" scope="row">
                        수급자주민등록번호
                      </th>
                      <td
                        colSpan={3}
                        style={{ textAlign: 'center', verticalAlign: 'middle' }}
                      >
                        <div
                          className={`content ${buttonYn ? 'with-buttons' : 'no-buttons'}`}
                        >
                          <span
                            className="td-left"
                            style={{ verticalAlign: 'middle' }}
                          >
                            <Button
                              variant="outlined"
                              color="primary"
                              fullWidth
                              onClick={() => setRrnoModalOpen(true)}
                            >
                              {rrNoFormatter(data?.vonrRrnoS)}
                            </Button>
                          </span>
                          {buttonYn && (
                            <div className="buttons">
                              <Button
                                variant="contained"
                                color="dark"
                                style={{ marginLeft: '8px' }}
                                onClick={() => openModal('TrCarList')}
                              >
                                개인/지입 차량확인
                              </Button>
                              <Button
                                variant="contained"
                                color="dark"
                                style={{ marginLeft: '8px' }}
                                onClick={() => openModal('TrCardList')}
                              >
                                소유카드
                              </Button>
                            </div>
                          )}
                        </div>
                      </td>
                      <th className="td-head" scope="row">
                        사업자번호
                      </th>
                      <td colSpan={3}>
                        <div
                          className={`content ${buttonYn ? 'with-buttons' : 'no-buttons'}`}
                        >
                          <span
                            className="td-left"
                            style={{ verticalAlign: 'middle' }}
                          >
                            {brNoFormatter(data?.vonrBrno)}
                          </span>
                          {buttonYn && (
                            <Button
                              variant="contained"
                              color="dark"
                              style={{ marginLeft: '8px' }}
                              onClick={() => openModal('TrCrnoChg')}
                            >
                              사업자(지입사)변경
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <th className="td-head" scope="row">
                        지자체명
                      </th>
                      <td colSpan={3}>
                        <div
                          className={`content ${buttonYn ? 'with-buttons' : 'no-buttons'}`}
                        >
                          <span
                            className="td-left"
                            style={{ verticalAlign: 'middle' }}
                          >
                            {data?.locgovNm}
                          </span>
                          {buttonYn && (
                            <Button
                              variant="contained"
                              color="dark"
                              style={{ marginLeft: '8px' }}
                              onClick={() => openModal('LocalTransDialog')}
                            >
                              지자체변경
                            </Button>
                          )}
                        </div>
                      </td>
                      <th className="td-head" scope="row">
                        톤수
                      </th>
                      <td>
                        <div
                          className={`content ${buttonYn ? 'with-buttons' : 'no-buttons'}`}
                        >
                          <span
                            className="td-left"
                            style={{ verticalAlign: 'middle' }}
                          >
                            {data?.vhclTonNm}
                          </span>
                          {buttonYn && (
                            <Button
                              variant="contained"
                              color="dark"
                              style={{ marginLeft: '8px' }}
                              onClick={() => openModal('TrChgTonCd')}
                            >
                              톤수변경
                            </Button>
                          )}
                        </div>
                      </td>
                      <th className="td-head" scope="row">
                        유종
                      </th>
                      <td
                        className="td-left"
                        style={{ verticalAlign: 'middle' }}
                      >
                        {data?.koiNm}
                      </td>
                    </tr>
                    <tr>
                      <th className="td-head" scope="row">
                        업체명
                      </th>
                      <td
                        className="td-left"
                        style={{ verticalAlign: 'middle' }}
                      >
                        {data?.bzentyNm}
                      </td>
                      <th className="td-head" scope="row">
                        대표자명
                      </th>
                      <td
                        className="td-left"
                        style={{ verticalAlign: 'middle' }}
                      >
                        {data?.rprsvNm}
                      </td>
                      <th className="td-head" scope="row">
                        연락처
                      </th>
                      <td
                        className="td-left"
                        style={{ verticalAlign: 'middle' }}
                      >
                        {telnoFormatter(data?.telno)}
                      </td>
                      <th className="td-head" scope="row">
                        차량소유구분
                      </th>
                      <td>
                        <div
                          className={`content ${buttonYn ? 'with-buttons' : 'no-buttons'}`}
                        >
                          <span
                            className="td-left"
                            style={{ verticalAlign: 'middle' }}
                          >
                            {data?.vhclPsnNm}
                          </span>
                          {buttonYn && (
                            <Button
                              variant="contained"
                              color="dark"
                              style={{ marginLeft: '8px' }}
                              onClick={() => openModal('TrCrnoChg')}
                            >
                              차량소유구분변경
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <th className="td-head" scope="row">
                        카드사
                      </th>
                      <td
                        className="td-left"
                        style={{ verticalAlign: 'middle' }}
                      >
                        {data?.crdcoNm}
                      </td>
                      <th className="td-head" scope="row">
                        카드구분
                      </th>
                      <td
                        className="td-left"
                        style={{ verticalAlign: 'middle' }}
                      >
                        {data?.cardSeNm}
                      </td>
                      <th className="td-head" scope="row">
                        카드번호
                      </th>
                      <td
                        className="td-left"
                        style={{ verticalAlign: 'middle' }}
                      >
                        {cardNoFormatter(data?.cardNoD)}
                      </td>
                      <th className="td-head" scope="row">
                        기존카드말소여부
                      </th>
                      <td
                        className="td-left"
                        style={{ verticalAlign: 'middle' }}
                      >
                        {data?.isStopNm}
                      </td>
                    </tr>
                    <tr>
                      <th className="td-head" scope="row">
                        탈락사유
                      </th>
                      <td colSpan={3}>{data?.flRsnCn}</td>
                      <th className="td-head" scope="row">
                        수정자 아이디
                      </th>
                      <td>{data?.mdfrId}</td>
                      <th className="td-head" scope="row">
                        수정 일자
                      </th>
                      <td>{data?.mdfcnDt}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              {/* 테이블영역 끝 */}
            </>
          </BlankCard>
        </Grid>
      </Grid>
      <LocalSearchModal />

      {/* 주민번호보기 모달 */}
      {rrnoModalOpen ? (
        <ShowRrnoModal
          open={rrnoModalOpen}
          setOpen={setRrnoModalOpen}
          procData={{
            rrno: data.vonrRrnoD,
            paramtrInfoCn: toQueryParameter({ vhclNo:data.vhclNo, brno:data.vonrBrno, crdcoCd:data.crdcoCd, rcptSeqNo:data.rcptSeqNo }).replace('?',''),
            defaultValue: '1'
          }}
        />
      ) : null}
    </>
  )
}

export default memo(DetailComponent)

import React, { Children } from 'react'

import { FormControlLabel, Grid, RadioGroup } from '@mui/material'
import { Row } from './TrPage'
import { styled } from '@mui/material/styles'
import Checkbox, { CheckboxProps } from '@mui/material/Checkbox'

import BlankCard from '@/app/components/shared/BlankCard'
import {
  formatDate,
  formBrno,
  getNumtoWon,
  getNumtoWonAndDecimalPoint,
} from '@/utils/fsms/common/convert'
import { CustomRadio } from '@/utils/fsms/fsm/mui-imports'
import { rrNoFormatter } from '@/utils/fsms/common/util'
import CustomCheckbox from '@/app/components/forms/theme-elements/CustomCheckbox'

// TableDataGrid의 props 정의
interface DetailDataGridProps {
  //row?: Row; // row 속성을 선택적 속성으로 변경
  row?: any // row 속성을 선택적 속성으로 변경
}

const TrDetailDataGrid: React.FC<DetailDataGridProps> = ({ row }) => {
  return (
    <Grid container spacing={2} className="card-container">
      <Grid item xs={12} sm={12} md={12}>
        <BlankCard className="contents-card" title="상세 정보">
          <>
            {/* 테이블영역 시작 */}
            <div className="table-scrollable">
              <table className="table table-bordered">
                <caption>상세 내용 시작</caption>
                <colgroup>
                  <col style={{ whiteSpace: 'nowrap', width: '10%' }} />
                  <col style={{ whiteSpace: 'nowrap', width: '18%' }} />
                  <col style={{ whiteSpace: 'nowrap', width: '9%' }} />
                  <col style={{ whiteSpace: 'nowrap', width: '15%' }} />
                  <col style={{ whiteSpace: 'nowrap', width: '9%' }} />
                  <col style={{ whiteSpace: 'nowrap', width: '15%' }} />
                  <col style={{ whiteSpace: 'nowrap', width: '9%' }} />
                  <col style={{ whiteSpace: 'nowrap', width: '15%' }} />
                </colgroup>
                <tbody>
                  <tr>
                    <th
                      className="td-head"
                      scope="row"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      차량번호
                    </th>
                    <td className="td-center">{row?.vhclNo}</td>
                    <th
                      className="td-head"
                      scope="row"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      소유자명
                    </th>
                    <td className="td-center">{row?.vonrNm}</td>
                    <th
                      className="td-head"
                      scope="row"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      주민등록번호
                    </th>
                    <td className="td-center">
                      {rrNoFormatter(row?.vonrRrnoSe)}
                    </td>
                    <th
                      className="td-head"
                      scope="row"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      사업자등록번호
                    </th>
                    <td className="td-center">{formBrno(row?.vonrBrno)}</td>
                  </tr>
                  <tr>
                    <th
                      className="td-head"
                      scope="row"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      당시 유종
                    </th>
                    <td className="td-center">{row?.ttmKoiNm}</td>
                    <th
                      className="td-head"
                      scope="row"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      당시 톤수
                    </th>
                    <td className="td-center">{row?.vhclTonNm}</td>
                    <th
                      className="td-head"
                      scope="row"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      패턴
                    </th>
                    <td className="td-center" colSpan={3}>
                      {row?.instcSpldmdDivNm}
                    </td>
                  </tr>

                  <tr>
                    <th
                      className="td-head"
                      scope="row"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      부정수급 거래 기간
                    </th>
                    <td colSpan={7}>
                      {formatDate(row?.bgngYmd)} {row?.bgngYmd ? '~' : ''}{' '}
                      {formatDate(row?.endYmd)}
                    </td>
                  </tr>

                  <tr>
                    <th
                      className="td-head"
                      scope="row"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      거래건수
                    </th>
                    <td className="td-right">{row?.dlngNocs}</td>
                    <th
                      className="td-head"
                      scope="row"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      거래금액
                    </th>
                    <td className="td-right">
                      {getNumtoWon(row?.totlAprvAmt)}
                    </td>
                    <th
                      className="td-head"
                      scope="row"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      부정수급건수
                    </th>
                    <td className="td-right">{row?.rdmTrgtNocs}</td>
                    <th
                      className="td-head"
                      scope="row"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      부정수급액
                    </th>
                    <td className="td-right">
                      {getNumtoWon(row?.instcSpldmdAmt)}
                    </td>
                  </tr>

                  <tr>
                    <th
                      className="td-head"
                      scope="row"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      유가보조금
                    </th>
                    <td className="td-right">
                      {getNumtoWon(row?.totlAsstAmt)}
                    </td>
                    <th
                      className="td-head"
                      scope="row"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      환수할금액
                    </th>
                    <td className="td-right">{getNumtoWon(row?.rdmActnAmt)}</td>
                    <th
                      className="td-head"
                      scope="row"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      환수한일자
                    </th>
                    <td className="td-center">{formatDate(row?.rdmDt)}</td>
                    <th
                      className="td-head"
                      scope="row"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      환수한금액
                    </th>
                    <td className="td-right">{getNumtoWon(row?.rlRdmAmt)}</td>
                  </tr>
                  <tr>
                    <th
                      className="td-head"
                      scope="row"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      업종
                    </th>
                    <td className="td-center">{row?.tpbizNm}</td>
                    <th
                      className="td-head"
                      scope="row"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      법인/개인
                    </th>
                    <td className="td-center">{row?.bzmnSeNm}</td>
                    <th
                      className="td-head"
                      scope="row"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      직영여부
                    </th>
                    <td className="td-center">{row?.droperYnNm}</td>
                    <th
                      className="td-head"
                      scope="row"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      업종구분
                    </th>
                    <td className="td-center">{row?.tpbizSeNm}</td>
                  </tr>

                  <tr>
                    <th
                      className="td-head"
                      scope="row"
                      style={{ whiteSpace: 'nowrap' }}
                      rowSpan={2}
                    >
                      행정처분
                    </th>
                    <td colSpan={5} style={{ padding: 10 }}>
                      <div style={{ display: 'flex' }}>
                        <RadioImageContent>
                          {row?.pbadmsPrcsSeCd === '' ? (
                            <CheckedRadioImg />
                          ) : (
                            <RadioImg />
                          )}
                          <RadioTxt text="진행중" />
                        </RadioImageContent>
                        <RadioImageContent>
                          {row?.pbadmsPrcsSeCd === 'N' ? (
                            <CheckedRadioImg />
                          ) : (
                            <RadioImg />
                          )}
                          <RadioTxt text="해당없음" />
                        </RadioImageContent>
                        <RadioImageContent>
                          {row?.pbadmsPrcsSeCd === 'Y' ? (
                            <CheckedRadioImg />
                          ) : (
                            <RadioImg />
                          )}
                          <RadioTxt text="행정상재제" />
                        </RadioImageContent>
                      </div>
                    </td>

                    <th
                      className="td-head"
                      scope="row"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      조치일
                    </th>
                    <td className="td-center">{formatDate(row?.dspsDt)}</td>
                  </tr>

                  <tr>
                    <td>
                      <CustomCheckbox checked={row?.rdmYn == 'N'} />
                      <RadioTxt text="환수안함" />
                    </td>
                    <td colSpan={4}>
                      <div style={{ display: 'flex' }}>
                        <RadioImageContent>
                          {row?.admdspSeCd === 'A' ? (
                            <CheckedRadioImg />
                          ) : (
                            <RadioImg />
                          )}
                          <RadioTxt text="환수만" />
                        </RadioImageContent>
                        <RadioImageContent>
                          {row?.admdspSeCd === 'G' ? (
                            <CheckedRadioImg />
                          ) : (
                            <RadioImg />
                          )}
                          <RadioTxt text="처분유예" />
                        </RadioImageContent>
                        <RadioImageContent>
                          {row?.admdspSeCd === 'H' ? (
                            <CheckedRadioImg />
                          ) : (
                            <RadioImg />
                          )}
                          <RadioTxt text="지급정지 6개월" />
                        </RadioImageContent>
                        <RadioImageContent>
                          {row?.admdspSeCd === 'S' ? (
                            <CheckedRadioImg />
                          ) : (
                            <RadioImg />
                          )}
                          <RadioTxt text="지급정지 1년" />
                        </RadioImageContent>
                        <RadioImageContent>
                          {row?.admdspSeCd === 'C' ? (
                            <CheckedRadioImg />
                          ) : (
                            <RadioImg />
                          )}
                          <RadioTxt text="감차" />
                        </RadioImageContent>
                      </div>
                    </td>

                    <th
                      className="td-head"
                      scope="row"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      환수금액
                    </th>
                    <td className="td-right" colSpan={3}>
                      {getNumtoWon(row?.rdmActnAmt)}
                    </td>
                  </tr>

                  <tr>
                    <th
                      className="td-head"
                      scope="row"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      조사내용 및 행정처분사유
                    </th>
                    <td colSpan={7}>{row?.admdspRsnCn}</td>
                  </tr>

                  <tr>
                    <th
                      className="td-head"
                      scope="row"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      행정처분 시작일
                    </th>
                    <td className="td-center">
                      {formatDate(row?.admdspBgngYmd)}
                    </td>
                    <th
                      className="td-head"
                      scope="row"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      행정처분 종료일
                    </th>
                    <td className="td-center">
                      {formatDate(row?.admdspEndYmd)}
                    </td>
                    <th
                      className="td-head"
                      scope="row"
                      style={{ whiteSpace: 'nowrap' }}
                    ></th>
                    <td colSpan={3}></td>
                  </tr>

                  <tr>
                    <th
                      className="td-head"
                      scope="row"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      주유소 공모,가담 여부
                    </th>
                    <td className="td-center">{row?.oltPssrpPrtiYnNm}</td>
                    <th
                      className="td-head"
                      scope="row"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      주유소명
                    </th>
                    <td className="td-center">{row?.oltPssrpPrtiOltNm}</td>
                    <th
                      className="td-head"
                      scope="row"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      사업자등록번호
                    </th>
                    <td className="td-center">{row?.oltPssrpPrtiBrno}</td>
                    <th
                      className="td-head"
                      scope="row"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      불법구조변경여부
                    </th>
                    <td className="td-center">{row?.unlawStrctChgYnNm}</td>
                  </tr>

                  <tr>
                    <th
                      className="td-head"
                      scope="row"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      적발방법
                    </th>
                    <td className="td-center">{row?.dsclMthdNm}</td>
                    <th
                      className="td-head"
                      scope="row"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      기타
                    </th>
                    <td>{row?.dsclMthdEtcMttrCn}</td>
                    <th
                      className="td-head"
                      scope="row"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      규정 위반 조항
                    </th>
                    <td>{row?.ruleVltnCluNm}</td>
                    <th
                      className="td-head"
                      scope="row"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      기타
                    </th>
                    <td>{row?.ruleVltnCluEtcCn}</td>
                  </tr>

                  <tr>
                    <th
                      className="td-head"
                      scope="row"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      합동점검여부
                    </th>
                    <td>
                      <div style={{ display: 'flex' }}>
                        <RadioImageContent>
                          {row?.cpeaChckYn === 'Y' ? (
                            <CheckedRadioImg />
                          ) : (
                            <RadioImg />
                          )}
                          <RadioTxt text="예" />
                        </RadioImageContent>
                        <RadioImageContent>
                          {row?.cpeaChckYn === 'N' ? (
                            <CheckedRadioImg />
                          ) : (
                            <RadioImg />
                          )}
                          <RadioTxt text="아니오" />
                        </RadioImageContent>
                      </div>
                    </td>
                    <th
                      className="td-head"
                      scope="row"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      합동점검차시
                    </th>
                    <td>{row?.cpeaChckCyclVlNm}</td>
                    <th
                      className="td-head"
                      scope="row"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      부정수급유형
                    </th>
                    <td colSpan={3}>{row?.instcSpldmdTypeNm}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            {/* 테이블영역 끝 */}
          </>
        </BlankCard>
      </Grid>
    </Grid>
  )
}

const RadioImageContent = (props: any) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        marginRight: 10,
      }}
    >
      {props.children}
    </div>
  )
}

const RadioImg = () => {
  return (
    <span
      style={{
        border: '1px solid #bbb',
        borderRadius: '50%',
        width: 22,
        height: 22,
        backgroundColor: '#fff',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <span
        style={{
          borderRadius: '50%',
          width: 10,
          height: 10,
          backgroundColor: '#fff',
        }}
      ></span>
    </span>
  )
}

const CheckedRadioImg = () => {
  return (
    <span
      style={{
        border: '1px solid #bbb',
        borderRadius: '50%',
        width: 22,
        height: 22,
        backgroundColor: '#0848ff',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <span
        style={{
          borderRadius: '50%',
          width: 10,
          height: 10,
          backgroundColor: '#fff',
        }}
      ></span>
    </span>
  )
}

const RadioTxt = (props: any) => {
  return (
    <span style={{ fontWeight: '300', fontSize: '0.9em', marginLeft: '10px' }}>
      {props.text}
    </span>
  )
}

export default TrDetailDataGrid

import BlankCard from '@/app/components/shared/BlankCard'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import {
  getExcelFile,
  getToday,
  telnoFormatter,
} from '@/utils/fsms/common/comm'
import { CustomFormLabel, CustomTextField } from '@/utils/fsms/fsm/mui-imports'
import { Button, Grid } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { SelectItem } from 'select'
import {
  brNoFormatter,
  getDateTimeString,
} from '../../../../../utils/fsms/common/util'
import { Row } from '../page'
import AlarmDialog from './AlarmDialog'
import SearchModal, { SearchRow } from './SearchModal'
import SearchModal2 from './SearchModal2'
import { SxProps } from '@mui/system'
import zIndex from '@mui/material/styles/zIndex'
import { CommSelect } from '@/app/components/tx/commSelect/CommSelect'
import { Pageable2 } from 'table'
import { isNumber } from '@/utils/fsms/common/comm'
import CustomCheckbox from '@/app/components/forms/theme-elements/CustomCheckbox'

type DetailDataGridProps = {
  detail: Row
  rejectItems: SelectItem[]
  reload: () => void
}

const DetailDataGrid = (props: DetailDataGridProps) => {
  const { detail, rejectItems, reload } = props

  const [crtrYmd, setCrtrYmd] = useState<string>('') // 탱크용량변경일자
  const [tnkCpcty, setTnkCpcty] = useState<string>('') // 변경 후 탱크용량
  const [flCd, setFlCd] = useState<string>('') // 탈락유형
  const [flRsnCn, setFlRsnCn] = useState<string>('') // 탈락사유

  const [remote, setRemote] = useState<boolean>()

  const [didAlert, setDidAlert] = useState(false)
  const [retroactChk, setRetroactChk] = useState<boolean>(false)

  const handleRetroactChk = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRetroactChk(event.target.checked)
  }

  const handleValueChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target

    if (name === 'crtrYmd') {
      setCrtrYmd(value)
    }

    if (name === 'tnkCpcty') {
      if (isNumber(value)) {
        setTnkCpcty(value.replaceAll('.', '').replaceAll(' ', ''))
      }
    }

    if (name === 'flCd') {
      setFlCd(value)
    }

    if (name === 'flRsnCn') {
      setFlRsnCn(value)
    }
  }

  useEffect(() => {
    setDidAlert(false)
    if (detail['crtrYmd']) {
      setCrtrYmd(
        String(getDateTimeString(detail['crtrYmd'], 'date')?.dateString),
      )
    } else {
      setCrtrYmd('')
    }
    setTnkCpcty(
      Number(detail['tnkCpcty']).toLocaleString(undefined, {
        // minimumFractionDigits: 2,
        // maximumFractionDigits: 2,
      }),
    )
    // setFlCd('')
    // setFlRsnCn('')
    if (detail['vhclNo']) {
      setRetroactChk(false)
    }
    if (detail['prcsSttsCd'] == '01') {
      setRetroactChk(true)
    }
  }, [detail])

  //승인
  const approveChange = async () => {
    if (flCd) {
      return alert('탱크용량 변경 승인 시 탈락유형은 선택할 수 없습니다.')
    }

    if (flRsnCn) {
      return alert('탱크용량 변경 승인 시 탈락사유는 입력할 수 없습니다.')
    }

    if (!crtrYmd) {
      return alert('탱크용량변경일자를 입력해주세요.')
    }

    if (!tnkCpcty) {
      return alert('변경후 탱크용량을 입력해주세요.')
    }

    if (!retroactChk) {
      return alert(
        '탱크용량변경일자부터 승인일자까지의\n자동소급여부를 체크하셔야 승인이 가능합니다.',
      )
    }

    try {
      let endpoint: string = `/fsm/stn/tcc/tr/updateApproveTnkCpcty`

      let body = {
        vhclNo: detail.vhclNo,
        dmndYmd: detail.dmndYmd.replace('-', ''),
        // prcsSttsCd: detail.prcsSttsCd,
        prcsSttsCd: '01',
        crtrYmd: crtrYmd.replaceAll('-', ''),
        tnkCpcty: tnkCpcty,
      }
      const userConfirm = confirm('해당 요청건을 승인하시겠습니까?')
      if (userConfirm) {
        const response = await sendHttpRequest('PUT', endpoint, body, true, {
          cache: 'no-store',
        })
        if (response && response.data) {
          alert(response.data)
          reload()
        } else {
          alert(response.message)

          reload()
        }
      }
    } catch (error) {
      console.error('Error modifying data:', error)
    }
  }

  //거절
  const rejectChange = async () => {
    if (!flCd) {
      return alert('탈락유형을 입력해주세요.')
    }

    if (!flRsnCn.replaceAll(/\n/g, '').replaceAll(/\t/g, '')) {
      alert('탈락사유를 입력해주세요.')
      return
    }

    if (flRsnCn.replaceAll(/\n/g, '').replaceAll(/\t/g, '').length > 30) {
      alert('탈락사유를 30자리 이하로 입력해주시기 바랍니다.')
      return
    }

    try {
      let endpoint: string = `/fsm/stn/tcc/tr/updateApproveTnkCpcty`

      let body = {
        vhclNo: detail.vhclNo,
        prcsSttsCd: '02',
        dmndYmd: detail.dmndYmd.replace('-', ''),
        flCd: flCd,
        flRsnCn: flRsnCn.replaceAll(/\n/g, '').replaceAll(/\t/g, ''),
        tnkCpcty: detail['tnkCpcty'],
      }

      const userConfirm = confirm('해당 요청건을 거절하시겠습니까?')

      if (userConfirm) {
        const response = await sendHttpRequest('PUT', endpoint, body, true, {
          cache: 'no-store',
        })

        if (response && response.data) {
          alert(response.data)
          reload()
        } else {
          alert(response)
          reload()
        }
      }
    } catch (error) {
      console.error('Error :: ', error)
    }
  }

  const onDateClick = (event: React.MouseEvent) => {
    // if(!didAlert) {
    setRemote(true)
    // alert('탱크용량 변경일자부터 승인일자까지 지급거절된 주유내역에 대해 자동소급 지급됩니다')
    // setDidAlert(true);
    // }
  }

  return (
    <Grid container spacing={2} className="card-container">
      <Grid item xs={12}>        
        <BlankCard className="contents-card" title="상세 정보"          
          rightHeader={
             <>
              <SearchModal2
                buttonLabel={'탱크용량변경 심사 통계'}
                size={'lg'}
                title={'탱크용량변경 심사 통계'}
                detail={detail}
              />
	            <SearchModal
                buttonLabel={'모델별 탱크용량 조회'}
                size={'xl'}
                title={'모델별 탱크용량 조회'}
                detail={detail}
              />
              <Button
                variant="outlined"
                style={{ marginLeft: '6px' }}
                onClick={() => approveChange()}
                disabled={detail['prcsSttsCd'] === '00' ? false : true}
              >
                승인
              </Button>
              <Button
                variant="outlined"
                style={{ marginLeft: '6px' }}
                onClick={() => rejectChange()}
                disabled={detail['prcsSttsCd'] === '00' ? false : true}
              >
                거절
              </Button>
            </>
        }>          
          <>
            <AlarmDialog
              buttonLabel={''}
              title={''}
              size={'sm'}
              remote={remote}
              children={
                <div style={{ margin: '1rem 2rem', textAlign: 'center' }}>
                  <h4>탱크용량 변경일자부터 승인일자까지</h4>
                  <h4>지급거절된 주유내역에 대해 자동소급 지급됩니다</h4>
                </div>
              }
            />
            {/* 테이블영역 시작 */}
            <div className="table-scrollable">
              <table className="table table-bordered">
                <caption>상세 내용 시작</caption>
                <colgroup>
                  <col style={{ width: '10%' }} />
                  <col style={{ width: '10%' }} />
                  <col style={{ width: '10%' }} />
                  <col style={{ width: '10%' }} />
                  <col style={{ width: '10%' }} />
                  <col style={{ width: '12%' }} />
                  <col style={{ width: '10%' }} />
                  <col style={{ width: '10%' }} />
                </colgroup>
                <tbody>
                  <tr>
                    <th
                      className="td-head"
                      scope="row"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      처리상태
                    </th>
                    <td>{detail['tankStsNm']}</td>
                    <th
                      className="td-head"
                      scope="row"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      차량번호
                    </th>
                    <td>{detail['vhclNo']}</td>
                    <th
                      className="td-head"
                      scope="row"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      소유자명
                    </th>
                    <td>{detail['vonrNm']}</td>
                    <th
                      className="td-head"
                      scope="row"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      사업자등록번호
                    </th>
                    <td>{brNoFormatter(detail['vonrBrno'])}</td>
                  </tr>
                  <tr>
                    <th
                      className="td-head"
                      scope="row"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      관할관청
                    </th>
                    <td>{detail['locgovNm']}</td>
                    <th
                      className="td-head"
                      scope="row"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      연락처
                    </th>
                    <td>{telnoFormatter(detail['mbtlnum'])}</td>
                    <th
                      className="td-head"
                      scope="row"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      톤수
                    </th>
                    <td>{detail['carTonsNm']}</td>
                    <th
                      className="td-head"
                      scope="row"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      차량형태
                    </th>
                    <td>{detail['carSts']}</td>
                  </tr>
                  <tr>
                    <th
                      className="td-head"
                      scope="row"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      차명
                    </th>
                    <td colSpan={3}>{detail['vhclNm']}</td>
                    <th
                      className="td-head"
                      scope="row"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      요청일자
                    </th>
                    <td>
                      {getDateTimeString(detail['dmndYmd'], 'date')?.dateString}
                    </td>
                    <th className="td-head" scope="row">
                      처리일자
                    </th>
                    <td>
                      {getDateTimeString(detail['prcsYmd'], 'date')?.dateString}
                    </td>
                  </tr>
                  <tr>
                    <th
                      className="td-head"
                      scope="row"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      3개월 최고주유량(ℓ)
                    </th>
                    <td style={{ textAlign: 'right' }}>
                      {Number(detail['aprvLit']).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <th
                      className="td-head"
                      scope="row"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      3개월 두번째주유량(ℓ)
                    </th>
                    <td style={{ textAlign: 'right' }}>
                      {Number(detail['secondLit']).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <th
                      className="td-head"
                      scope="row"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      3개월 평균주유량(ℓ)
                    </th>
                    <td style={{ textAlign: 'right' }}>
                      {Number(detail['aprvAvg']).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <th
                      className="td-head"
                      scope="row"
                      style={{ whiteSpace: 'nowrap' }}
                    ></th>
                    <td />
                  </tr>
                  <tr>
                    <th
                      className="td-head"
                      scope="row"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      탱크용량변경일자
                    </th>
                    <td>
                      {/* {detail['prcsSttsCd'] === '00' ? // '심사요청'인 경우
                        <CustomTextField type="date"  onClick={ onDateClick } id="crtrYmd" name="crtrYmd" value={crtrYmd} onChange={handleValueChange} fullWidth/>
                        : 
                        getDateTimeString(detail['crtrYmd'], "date")?.dateString
                      } */}
                      <CustomFormLabel
                        className="input-label-none"
                        htmlFor="crtrYmd"
                      >
                        탱크용량변경일자
                      </CustomFormLabel>
                      <CustomTextField
                        type="date"
                        // onClick={onDateClick}
                        id="crtrYmd"
                        name="crtrYmd"
                        value={crtrYmd}
                        onChange={handleValueChange}
                        fullWidth
                        inputProps={{
                          disabled: detail['prcsSttsCd'] == '00' ? false : true,
                        }}
                      />
                    </td>
                    <th
                      className="td-head"
                      scope="row"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      변경전 탱크용량(ℓ)
                    </th>
                    <td style={{ textAlign: 'right' }}>
                      {Number(detail['bfchgTnkCpcty']).toLocaleString(
                        undefined,
                        {
                          // minimumFractionDigits: 2,
                          // maximumFractionDigits: 2,
                        },
                      )}
                    </td>
                    <th
                      className="td-head"
                      scope="row"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      변경후 탱크용량(ℓ)
                    </th>
                    <td style={{ textAlign: 'right' }}>
                      {/* { detail['prcsSttsCd'] === '00' ? // '심사요청'인 경우
                        <CustomTextField type="number" name="tnkCpcty" value={tnkCpcty} onChange={handleValueChange} fullWidth/>
                        :
                        Number(detail['tnkCpcty']).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })} */}
                      <CustomFormLabel
                        className="input-label-none"
                        htmlFor="tnkCpcty"
                      >
                        변경후 탱크용량(ℓ)
                      </CustomFormLabel>
                      <CustomTextField
                        type="text"
                        name="tnkCpcty"
                        value={tnkCpcty}
                        id="tnkCpcty"
                        onChange={handleValueChange}
                        fullWidth
                        inputProps={{
                          readOnly: detail['prcsSttsCd'] == '00' ? false : true,
                          maxLength: 5,
                        }}
                      />
                    </td>
                    <th
                      className="td-head"
                      scope="row"
                      style={{ whiteSpace: 'nowrap' }}
                    ></th>
                    <td />
                  </tr>
                  <tr
                    style={{
                      width: '100%',
                    }}
                  >
                    <td
                      style={{ color: 'red', fontWeight: 'bold' }}
                      colSpan={8}
                    >
                      <CustomCheckbox
                        checked={retroactChk}
                        onChange={handleRetroactChk}
                        id="retroactChk"
                      />{' '}
                      탱크용량 변경일자부터 승인일자까지 지급거절된 주유내역에
                      대해 자동소급 지급됨
                      <CustomFormLabel
                        className="input-label-none"
                        htmlFor="retroactChk"
                      >
                        자동소급 확인
                      </CustomFormLabel>                                            
                    </td>
                  </tr>
                  <tr>
                    <th
                      className="td-head"
                      scope="row"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      탱크용량변경사유
                    </th>
                    <td colSpan={3}>{detail['tankRsnNm']}</td>
                    <th
                      className="td-head"
                      scope="row"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      비고
                    </th>
                    <td colSpan={3}>{detail['rmrkCn']}</td>
                  </tr>
                  <tr>
                    <th
                      className="td-head"
                      scope="row"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      탈락유형
                    </th>
                    <td colSpan={3}>
                      {/* {detail['prcsSttsCd'] === '00' ? // '심사요청'인 경우 */}
                      <CustomFormLabel
                        className="input-label-none"
                        htmlFor="sch-flCd"
                      >
                        탈락유형
                      </CustomFormLabel>
                      <CommSelect
                        cdGroupNm="173"
                        pValue={
                          detail['prcsSttsCd'] == '00' ? flCd : detail['flCd']
                        }
                        handleChange={handleValueChange}
                        pName="flCd"
                        htmlFor={'sch-flCd'}
                        addText="- 전체 -"
                        pDisabled={detail['prcsSttsCd'] == '00' ? false : true}
                      />
                      {/* // : 
                        // detail['flCd'] ? rejectItems.find(item => item.value === detail['flCd'])?.label : ''
                        // : <></>
                      //} */}
                    </td>
                    <th
                      className="td-head"
                      scope="row"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      탈락사유
                    </th>
                    <td colSpan={4}>
                      <CustomFormLabel
                        className="input-label-none"
                        htmlFor="flRsnCn"
                      >
                        탈락사유
                      </CustomFormLabel>
                      {detail['prcsSttsCd'] === '00' ? (
                        <CustomTextField
                          id="flRsnCn"
                          name="flRsnCn"
                          value={flRsnCn}
                          onChange={handleValueChange}
                          fullWidth
                          pDisabled={
                            detail['prcsSttsCd'] == '00' ? false : true
                          }
                        />
                      ) : (
                        <CustomTextField
                          id="flRsnCn"
                          name="flRsnCn"
                          value={detail['flRsnCn']}
                          onChange={handleValueChange}
                          fullWidth
                          inputProps={{
                            readOnly:
                              detail['prcsSttsCd'] == '00' ? false : true,
                          }}
                        />
                      )}
                    </td>
                  </tr>
                  <tr>
                    <th
                      className="td-head"
                      scope="row"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      등록자아이디
                    </th>
                    <td>{detail['rgtrId']}</td>
                    <th
                      className="td-head"
                      scope="row"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      등록일자
                    </th>
                    <td>
                      {getDateTimeString(detail['regDt'], 'date')?.dateString}
                    </td>
                    <th
                      className="td-head"
                      scope="row"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      수정자아이디
                    </th>
                    <td>{detail['mdfrId']}</td>
                    <th
                      className="td-head"
                      scope="row"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      수정일자
                    </th>
                    <td>
                      {getDateTimeString(detail['mdfcnDt'], 'date')?.dateString}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        </BlankCard>
      </Grid>
    </Grid>
  )
}

export default DetailDataGrid

import React, { useState } from 'react'
import { Grid, Button } from '@mui/material'
import BlankCard from '@/components/shared/BlankCard'
import { Row } from '../page'
import {
  getLabelFromCode,
  getNumtoWon,
  formatDate,
  formatKorYearMonth,
  formBrno,
  getNumtoWonAndDecimalPoint,
  formatPhoneNumber
} from '@/utils/fsms/common/convert'
import { SelectItem } from 'select';
import HyChDeModal from './HyChDeModal'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import HySubConModal from './HySubConModal'
import {
  rrNoFormatter
} from '@/utils/fsms/common/util'
import { getDateFormatYMD } from '@/utils/fsms/common/dateUtils'



export interface ButtonGroupActionProps {
  onClickModify: (row : Row) => void // 일괄승인 버튼 action
  onClickFileDownload: () => void // 일괄거절 버튼 action
}


// Detail Props 
interface DetailDataGridProps {
  data?: Row
  btnActions: ButtonGroupActionProps   
  bankCdItems?:SelectItem[]
  reload: () => void
}


const DetailDataGrid: React.FC<DetailDataGridProps> = ({
  data,
  btnActions,
  bankCdItems,
  reload
}) => {

  const [openHyChDeModal, setOpenHyChDeModal] = useState<boolean>(false)
  const [openHySubConModal, setOpenHySubConModal] = useState<boolean>(false)



  if(data  === undefined)
    return null;


    // 공통함수를 호출해주는 함수 
    const putData = async (aplySttsCode :number) => {
      if(data === undefined) return // 선택 데이터가 없을 경우 return  
  
      try {
        let endpoint: string = `/fsm/par/hpr/tr/modifyHydroPapersReqst`
        const response = await sendHttpRequest(
          'PUT',
          endpoint,
          {
            vhclNo: data.vhclNo,
            aplySttsCd: aplySttsCode, // 4 : 지급확정, 5 : 반려
            aplyYm: data.aplyYm,
            aplySn: data.aplySn,
            aplySeCd: data.aplySeCd,
          },
          true,
          {
            cache: 'no-store',
          },
        )
        if (response ) {
          return response;
        }
      } catch (error) {
        // console.log('수소 보조금 변경 에러', error)
        alert('요청에 실패했습니다.')
      } finally {
  
      }
    }


  //수소보조금 지급신청 지급확정(온라인),    신청구분이 온라인이고 처리상태가 지급신청일 경우 지급확정 가능
  // const putConfirmOffline = async () => {
  //   if(data === undefined) return

  //   if(!(data.aplySeCd === 'O' &&  data.aplySttsCd === '1')){
  //     alert(`오프라인 처리상태가 정산완료일 경우만 지급확정 가능합니다!`)
  //     console.log(`실패 :  신청상태코드:${data.aplySeCd}(->  P) 신청구분코드:${data.aplySttsCd}(->  3) 를 확인하세요`)
  //     return;
  //   }
  //   if(!confirm('지급확정 하시겠습니까?')){
  //     return
  //   }

  //   const response = await putData(4)

  //   if(response && response.resultType === 'success'){
  //     alert('지급확정 되었습니다.')
  //     console.log('reponse.message :  ' ,response.message)
  //     reload()
  //   }else{
  //     alert('지급확정 실패하였습니다.')
  //   }
  // }

  //수소보조금 반려  (온라인이고 처리상태가 지급신청일 경우만 반려 처리)
  const putRejectOnline = async () => {
    if(data === undefined) return
    if(!(data.aplySeCd === 'O' &&  data.aplySttsCd === '1')){
      alert(`처리상태가 온라인일 경우 지급신청 상태에서만 반려 가능합니다!`)
      return;
    }
    if(!confirm('반려 하시겠습니까?')){
      return
    }
    const response = await putData(5)
    if(response && response.resultType === 'success'){
      alert('반려 되었습니다.')
      reload()
    }else{
      alert('반려에 실패하였습니다.')
    }
  }





    //수소보조금 오프라인 지급확정  (온라인이고 처리상태가 지급신청일 경우만 지급확정 처리 가능 4)
    const putGiveYnOffline = async () => {
      if(data === undefined) return
      if(!(data.aplySeCd === 'P' &&  data.aplySttsCd === '3')){
        alert(`정산완료일 경우 지급확정이 가능합니다.`)
        return;
      }
      if(!confirm('지급확정 하시겠습니까?')){
        return
      }
      const response = await putData(4)
      if(response && response.resultType === 'success'){
        alert('지급확정 처리 되었습니다.')
        reload()
      }else{
        alert('지급확정 처리 중  오류가 발생했습니다.')
      }
    }
    
    // 수소보조금 오프라인 재정산요청
    const putReSettleOffline = async () => {
      if(data === undefined) return
      if(!(data.aplySeCd === 'P' &&  data.aplySttsCd === '3')){
        alert(`정산완료일 경우 재정산요청이 가능합니다.`)
        return;
      }
      if(!confirm('재정산요청 하시겠습니까?')){
        return
      }
      const response = await putData(2)
      if(response && response.resultType === 'success'){
        alert('재정산요청 되었습니다.')
        reload()
      }else{
        alert('재정산요청 중  오류가 발생했습니다.')
      }
    }


    const getButtonProps = (aplySeCd: string, aplySttsCd: string, btnActions: ButtonGroupActionProps): any[] => {
      const buttons: any[] = [];
    
      // 오프라인 - 정산완료
      if (aplySeCd === 'P' && aplySttsCd === '3') {
        buttons.push(
          {
            label: '재정산요청',
            color: 'outlined',
            onClick: () => putReSettleOffline(),
            disabled: false,
          },
          {
            label: '지급확정',
            color: 'outlined',
            onClick: () => putGiveYnOffline(),
            disabled: false,
          }
        );
      }
      
      // if(aplySeCd === 'O'){
      //   buttons.push(
      //   {
      //     label: '증빙자료',
      //     color: 'outlined',
      //     onClick: () => btnActions?.onClickFileDownload(),
      //     disabled: false,
      //   })
      // }

      
      // 온라인 - 지급신청
      if (aplySeCd === 'O' && aplySttsCd === '1') {
        buttons.push(
          {
            label: '수소충전상세내역',
            color: 'outlined',
            onClick: () => setOpenHyChDeModal(true),
            disabled: false,
          },
          {
            label: '증빙자료',
            color: 'outlined',
            onClick: () => btnActions?.onClickFileDownload(),
            disabled: false,
          },
          {
            label: '지급확정',
            color: 'outlined',
            onClick: () => setOpenHySubConModal(true),
            disabled: false,
          },
          {
            label: '반려',
            color: 'outlined',
            onClick: () => putRejectOnline(),
            disabled: false,
          }
        );
      }
    
      // 온라인 - 지급확정, 반려
      if (aplySeCd === 'O' && ['4', '5'].includes(aplySttsCd)) {
        buttons.push(
          {
            label: '수소충전상세내역',
            color: 'outlined',
            onClick: () => setOpenHyChDeModal(true),
            disabled: false,
          },
          {
            label: '증빙자료',
            color: 'outlined',
            onClick: () => btnActions?.onClickFileDownload(),
            disabled: false,
          }
        );
      }
    
      // 온라인 - 부분지급확정
      if (aplySeCd === 'O' && aplySttsCd === '8') {
        buttons.push(
          {
            label: '수소충전상세내역',
            color: 'outlined',
            onClick: () => setOpenHyChDeModal(true),
            disabled: false,
          },
          {
            label: '증빙자료',
            color: 'outlined',
            onClick: () => btnActions?.onClickFileDownload(),
            disabled: false,
          },
          {
            label: '지급확정',
            color: 'outlined',
            onClick: () => setOpenHySubConModal(true),
            disabled: false,
          },
        );
      }
    
      // 온라인 - 정산완료
      if (aplySeCd === 'O' && aplySttsCd === '3') {
        buttons.push(
          {
            label: '수소충전상세내역',
            color: 'outlined',
            onClick: () => setOpenHyChDeModal(true),
            disabled: false,
          },
          {
            label: '증빙자료',
            color: 'outlined',
            onClick: () => btnActions?.onClickFileDownload(),
            disabled: false,
          },
        );
      }
      
      if(aplySeCd === 'O' && aplySttsCd === '2'){
        buttons.push(
          {
            label: '수소충전상세내역',
            color: 'outlined',
            onClick: () => setOpenHyChDeModal(true),
            disabled: false,
          },
          {
            label: '증빙자료',
            color: 'outlined',
            onClick: () => btnActions?.onClickFileDownload(),
            disabled: false,
          },
        )
      }

      return buttons;
    };


  return (
    <Grid container spacing={2} className="card-container">
      <Grid item xs={12}>
        <BlankCard className="contents-card" title="상세 정보"
          buttons={getButtonProps(data.aplySeCd, data.aplySttsCd, btnActions)}
        >
          <>
            {/* 테이블영역 시작 */}
            <div className="table-scrollable">
              <table className="table table-bordered">
                <caption>상세 내용 시작</caption>
                <colgroup>
                  <col style={{ width: '12%' }} />
                  <col style={{ width: '13%' }} />
                  <col style={{ width: '12%' }} />
                  <col style={{ width: '13%' }} />
                  <col style={{ width: '12%' }} />
                  <col style={{ width: '13%' }} />
                  <col style={{ width: '12%' }} />
                  <col style={{ width: '13%' }} />
                </colgroup>
                <tbody>
                  <tr>
                    <th className="td-head" scope="row">
                      소유자명
                    </th>
                    <td>{data?.corpNm ?? ''}</td>
                    <th className="td-head" scope="row">
                      상호(대표자명)
                    </th>
                    <td>
                      {data?.bzentyNm?? ''}
                    </td>
                    <th className="td-head" scope="row">
                      법인등록번호
                    </th>
                    <td>{rrNoFormatter(data?.crnoS ?? '')}</td>
                    <th className="td-head" scope="row">
                      사업자등록번호
                    </th>
                    <td>{formBrno(data?.vonrBrno) ?? ''}</td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">
                      차량번호
                    </th>
                    <td>{formBrno(data?.vhclNo) ?? ''}</td>
                    <th className="td-head" scope="row">
                      주소
                    </th>
                    <td colSpan={5}>{data?.daddr ?? ''}</td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">
                      연락처
                    </th>
                    <td>{data?.telno ?? ''}</td>
                    <th className="td-head" scope="row">
                      휴대전화
                    </th>
                    <td>{formatPhoneNumber(data?.mbtlnum ?? '')}</td>
                    <th className="td-head" scope="row">
                      사업구분
                    </th>
                    <td>{data?.bizSeNm ?? ''}</td>
                    <th className="td-head" scope="row">
                      신청구분
                    </th>
                    <td>{data?.aplySeNm ?? ''}</td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">
                      신청사유
                    </th>
                    <td colSpan={7}>
                      
                    </td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">
                      유종
                    </th>
                    <td>
                      {data?.koiNm ?? ''}
                    </td>
                    <th className="td-head" scope="row">
                      톤수
                    </th>
                    <td>
                      {data?.vhclTonNm ?? ''}
                    </td>
                    <th className="td-head" scope="row">
                      충전량(kg)
                    </th>
                    <td style={{textAlign: "right"}}>
                      {getNumtoWonAndDecimalPoint(data?.useLiter) ?? ''}
                    </td>
                    <th className="td-head" scope="row">
                      신청액(원)
                    </th>
                    <td style={{textAlign: "right"}}>
                      {getNumtoWon(data?.totAsstAmt) ?? ''}
                    </td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">
                      예금주명
                    </th>
                    <td>
                      {data?.dpstrNm ?? ''}
                    </td>
                    <th className="td-head" scope="row">
                      금융기관
                    </th>
                    <td>
                      {data?.bankNm ?? ''}
                    </td>
                    <th className="td-head" scope="row">
                      계좌번호
                    </th>
                    <td>
                      {data?.actno ?? ''}
                    </td>
                    <th className="td-head" scope="row">
                    </th>
                    <td>
                    </td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">
                      등록자아이디
                    </th>
                    <td>
                      {data?.rgtrId ?? ''}
                    </td>
                    <th className="td-head" scope="row">
                      등록일자
                    </th>
                    <td>
                      {getDateFormatYMD(data.regDt??'')}
                    </td>
                    <th className="td-head" scope="row">
                      수정자아이디
                    </th>
                    <td>
                      {data?.mdfrId ?? ''}
                    </td>
                    <th className="td-head" scope="row">
                      수정일자
                    </th>
                    <td>
                      {getDateFormatYMD(data.mdfcnDt??'')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            {/* 테이블영역 끝 */}
          </>
        </BlankCard>
      </Grid>

      <HyChDeModal
        open={openHyChDeModal}
        data={data}
        onCloseClick={() => setOpenHyChDeModal(false)}
      />

      <HySubConModal
        open={openHySubConModal}
        onCloseClick={() => setOpenHySubConModal(false)}
        data={data}
        reload={reload}
      />
    </Grid>
  )
}

export default DetailDataGrid

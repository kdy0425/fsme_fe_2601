import {
  CustomFormLabel,
  CustomTextField,
} from '@/utils/fsms/fsm/mui-imports'
import {
  Box,

} from '@mui/material'
import {
  Button,
  Dialog,
  DialogContent,

} from '@mui/material'
import React, { useContext, useEffect, useState } from 'react'
import { Row } from '../page'
import { VhclSearchModal, VhclRow } from '@/components/tx/popup/VhclSearchModal'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import {
  getForamtAddDay,
  getDateFormatYMD,
  getFormatToday,
} from '@/utils/fsms/common/dateUtils'
import { brNoFormatter } from '@/utils/fsms/common/util'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import { CtpvSelect, LocgovSelect } from '@/app/components/tx/commSelect/CommSelect'
import { DayOffRow } from './DayoffDivModal'
import UserAuthContext, { UserAuthInfo } from '@/app/components/context/UserAuthContext'
import { getUserInfo } from '@/utils/fsms/utils'

interface TxModifyModalProps {
  open: boolean
  handleClickClose: () => void
  row: DayOffRow | null
  type: 'I' | 'U'
  dayoffSeCd: string
  reload: () => void
  authLocalNm : string 
  locgovCd ?: string
}

type data = {
  ctpvCd:string, 
  dayoffLocgovCd?:string,
  dayoffSeCd:string,
  dayoffSeNm:string,
  dayoffSeExpln:string,
  rgtrId:string,
  mdfrId:string,
}

const ModifyDayoffDivModal = (props: TxModifyModalProps) => {
  const { open, handleClickClose, row, type, reload, dayoffSeCd,authLocalNm,locgovCd } = props

  const [loadingBackdrop, setLoadingBackdrop] = useState(false)


  const {authInfo} = useContext(UserAuthContext);
  const [authContext, setAuthContext] = useState<UserAuthInfo | {} >();

  const userInfo = getUserInfo()
  const getResetData = (): data => ({
    ctpvCd: '',
    dayoffLocgovCd: locgovCd ?? '',
    dayoffSeCd: '',
    dayoffSeNm: '',
    dayoffSeExpln: '',
    rgtrId: '',
    mdfrId: '',
  });

  const [data, setData] = useState<data>(getResetData());

  useEffect(() => {

    if (!open) return; // Dialog가 닫혀있으면 실행하지 않음

    if (row && type === 'U') {
      setData({
        ctpvCd: row.dayoffLocgovCd?.substring(0,2) ?? '',
        dayoffLocgovCd:row.dayoffLocgovCd ?? '',
        dayoffSeCd:row.dayoffSeCd ?? '',
        dayoffSeNm:row.dayoffSeNm ?? '',
        dayoffSeExpln:row.dayoffSeExpln ?? '',
        rgtrId:row.rgtrId ?? '',
        mdfrId:row.mdfrId ?? '',
      })
    } else {
      if(locgovCd == '' || !locgovCd){
        alert('지역코드 정보가 없습니다.')
        return 
      }
      setData({
        ctpvCd: locgovCd.substring(0,2) ?? '',
        dayoffLocgovCd: locgovCd ?? '',
        dayoffSeCd: '',
        dayoffSeNm: '',
        dayoffSeExpln: '',
        rgtrId: '',
        mdfrId: '',
      });
    }
  }, [open])





  useEffect(()=>{
    setAuthContext(authInfo)
  },[authInfo])


  const handleParamChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {

    const { name, value } = event.target


    if(name==='locgovCd' && type === 'I'){
      setData((prev) => ({ ...prev, ['dayoffLocgovCd']: value }))
    }
    if(type === 'U'){
      const lo = row?.dayoffLocgovCd ?? ''
      setData((prev) => ({ ...prev, ['ctpvCd']: lo.substring(0,2) }));
      setData((prev) => ({ ...prev, ['dayoffLocgovCd']: row?.dayoffLocgovCd ?? ''}));
    }

    setData((prev) => ({ ...prev, [name]: value }))
  }

  const handleChange = (val:string) => {
    setData((prev) => ({ ...prev, dayoffSeExpln: val }))
  }



  const saveData = async () => {
        
    if (! data.dayoffLocgovCd) {
      alert('관할관청을 선택해주세요.')
      return
    }

    let dayoffLocgovCd = data.dayoffLocgovCd
    if (userInfo.rollYn === '') {
      alert('현재 부제 미사용 지자체입니다. 관리자에게 문의해주세요')
      return
    } else if (userInfo.rollYn === 'N' && userInfo.authLocgovNm) {
      alert(userInfo.authLocgovNm + '만 가능합니다.')
      return
    }else if (userInfo.locgovCd && userInfo.locgovCd.length == 5 
      && dayoffLocgovCd && dayoffLocgovCd.length == 5 //타겟데이터 지자체코드 확인
    ) {
      //타겟정보
      const ctpvCd = dayoffLocgovCd?.substring(0,2)
      //유저정보
      const userCtpvCd = userInfo.locgovCd.substring(0,2)
      const userInstCd = userInfo.locgovCd.substring(2,5)
      
      if( userCtpvCd == '11' &&  (userInstCd == '000' || userInstCd == '001' || userInstCd == '009') ){ //서울 시도 담당자
        if(userCtpvCd != ctpvCd){
          alert(userInfo.authLocgovNm + '만 가능합니다.')
          return
        }
      }else if( userCtpvCd == '11' &&  (userInstCd != '000' && userInstCd != '001' && userInstCd == '009') ){ //서울 시도 담당자 아님
        if(userInfo.locgovCd != dayoffLocgovCd){
          alert('소속 지자체만 등록 가능합니다.')
          return
        }
      }else if(userInstCd == '000' || userInstCd == '001'){ //서울외 시도 담당자
        if(userCtpvCd != ctpvCd){
          alert(userInfo.authLocgovNm + '만 가능합니다.')
          return
        }
      }else if(userInstCd != '000' && userInstCd != '001'){ //서울외 시도 담당자 아님
        if(userInfo.locgovCd != dayoffLocgovCd){
          alert('소속 지자체만 등록 가능합니다.')
          return
        }
      }
    }

    if (! data.dayoffSeNm) {
      alert('부제그룹명를 입력해주세요.')
      return
    }

    if (!(authContext && 'lgnId' in authContext && authContext.lgnId)) {
      alert('로그인 정보가 없습니다. 다시 시도하세요');
      return;
  }

    if (
      !confirm(
        type == 'I'
          ? '부제구분를 등록하시겠습니까?'
          : '부제구분를 수정하시겠습니까?',
      )
    ) {
      return
    }
    let endpoint: string =
      type === 'I'
        ? `/fsm/stn/bdm/tx/createByDayoffSeEstbs`
        : `/fsm/stn/bdm/tx/updateByDayoffSeEstbs`

    let params = {
      dayoffLocgovCd: data.dayoffLocgovCd,
      dayoffSeCd: type === 'U'? data.dayoffSeCd : ''  ,
      dayoffSeNm: data.dayoffSeNm,
      dayoffSeExpln: data.dayoffSeExpln,
      rgtrId:  type === 'U'? data.rgtrId : authContext.lgnId ,
      mdfrId: authContext.lgnId,
    }
    try {
      setLoadingBackdrop(true)
      const response = await sendHttpRequest(
        //파라미터 정의서 상에서 둘다 수정이다.
        type === 'I' ? 'POST' : 'POST',
        endpoint,
        params,
        true,
        {
          cache: 'no-store',
        },
      )

      if (response && response.resultType === 'success') {
        alert(response.message)
        handleClickClose()
        reload()
      } else {
        alert(response.message)
      }
    } catch (error) {
      alert(error)
    } finally {
      setLoadingBackdrop(false)
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
            width: '600px',
          },
        }}
      >
        <DialogContent>
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              <h2>
              부제구분{type === 'U' ? '수정' : '등록'}
              </h2>
            </CustomFormLabel>
            <div className=" button-right-align">
              <Button variant="contained" color="primary" onClick={saveData}>
                저장
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
          {/* 모달팝업 내용 시작 */}
          <div id="alert-dialog-description1">
            {/* 테이블영역 시작 */}
            <div className="table-scrollable">
              <table className="table table-bordered">
                <caption>사업자 정보 테이블 요약</caption>
                <colgroup>
                  <col style={{ width: '25%' }}></col>
                  <col style={{ width: '75%' }}></col>

                </colgroup>
                <tbody>
                  <tr>
                    <th className="td-head" scope="row">
                    <span className="required-text" >*</span>관할관청
                    </th>
                    <td>
                      <div className="form-group" style={{ width: '100%' }}>
                      { type === 'U' &&
                        // <CtpvSelect 추후에 추가될 수 있어서 남겨놈 (화면정의서랑 다르게 수정 요구받아서 남겨놈 지우지 말 것)
                        //     pValue={data.ctpvCd}
                        //     handleChange={handleParamChange}
                        //     htmlFor={'sch-ctpv'}
                        //     pDisabled={type === 'U'}
                        //   />
                        null
                          }
                        <CustomFormLabel className="input-label-none" htmlFor="sch-locgovCd">관할관청</CustomFormLabel>
                        <LocgovSelect
                          ctpvCd={data.ctpvCd}
                          pValue={data?.dayoffLocgovCd ?? ''}     
                          defaultCd={type === 'I' ? locgovCd : ''}
                          handleChange={handleParamChange}
                          htmlFor={'sch-locgovCd'}
                          pDisabled={type==='U' }
                        />
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">
                    <span className="required-text" >*</span>부제구분명
                    </th>
                    <td >
                      <div className="form-group" style={{ width: '100%' }}>
                      <CustomFormLabel className="input-label-none" htmlFor="modal-dayoffSeNm">부제구분명</CustomFormLabel>
                      <CustomTextField
                        type="string"
                        id="modal-dayoffSeNm"
                        name="dayoffSeNm"
                        onChange={handleParamChange}
                        value={data.dayoffSeNm}
                        fullWidth
                    />
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">
                    부제구분설명
                    </th>
                    <td>
                      <div className="form-group" style={{ width: '100%' }}>
                      <CustomFormLabel className="input-label-none" htmlFor="modal-dayoffSeExpln">부제구분설명</CustomFormLabel>
                      <textarea 
                        id="modal-dayoffSeExpln"
                        name="dayoffSeExpln"
                        onChange={(e) => handleChange(e.target.value)}
                        value={data.dayoffSeExpln}
                        style={{ width: '100%', minHeight: '100px', marginTop: 5 }}
                      />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            {/* 테이블영역 끝 */}
          </div>
          {/* 모달팝업 내용 끝 */}
          <LoadingBackdrop open={loadingBackdrop} />
        </DialogContent>
      </Dialog>

    </Box>
  )
}

export default ModifyDayoffDivModal

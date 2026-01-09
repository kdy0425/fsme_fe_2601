import {
  CustomFormLabel,
  CustomSelect,
  CustomTextField,
} from '@/utils/fsms/fsm/mui-imports'
import {
  Box,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import {
  Grid,
  Button,
  Link,
  Dialog,
  DialogContent,
  DialogActions,
  DialogProps,
  Tooltip,
  FormGroup,
  FormControlLabel,
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
import UserAuthContext, { UserAuthInfo } from '@/app/components/context/UserAuthContext'
import { SelectItem } from 'select'

interface TxModifyModalProps {
  open: boolean
  onCloseClick: () => void
  row: Row
  dayoffLocgovCd: string
  reload: () => void
}


const DayoffMemoModal = (props: TxModifyModalProps) => {
  const { open, onCloseClick, row,  reload, dayoffLocgovCd } = props

  const [vhclOpen, setVhclOpen] = useState(false)
  const [loadingBackdrop, setLoadingBackdrop] = useState(false)
  const {authInfo} = useContext(UserAuthContext);
  const [authContext, setAuthContext] = useState<UserAuthInfo | {} >();
  const [groupNmCode, setGroupNmCode ]  = useState<SelectItem[]>([])


  const [data, setData] = useState<Row>({})


  useEffect(()=>{
    setAuthContext(authInfo)
  },[authInfo])


  const handleParamChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {

    const { name, value } = event.target

    setData((prev) => ({ ...prev, [name]: value }))
  }


  useEffect(()=>{
  setData(row)},[row])

  const saveData = async () => {

    
    if (! data.groupId || data.groupId === '') {
      alert('부제그룹을 선택해주세요.')
      return
    }

    if (! data.dayoffMemoCn || data.dayoffMemoCn === '') {
      alert('부제차량메모를 입력해주세요.')
      return
    }

    if (!(authContext && 'lgnId' in authContext && authContext.lgnId)) {
      alert('로그인 정보가 없습니다. 다시 시도하세요');
      return;
  }

    if (
      !confirm(
          '해당차량에 메모를 등록하시겠습니까?'
      )
    ) {
      return
    }
    let endpoint: string =
        `/fsm/stn/bdm/tx/createDayoffVeMemo`

    let params = {
      vhclNo: row.vhclNo,
      dayoffLocgovCd: row.dayoffLocgovCd,
      dayoffSeCd: data.dayoffSeCd,
      dayoffMemoCn: data.dayoffMemoCn,
      rgtrId: authContext.lgnId,
      mdfrId: authContext.lgnId,
    }
    try {
      setLoadingBackdrop(true)
      const response = await sendHttpRequest(
        //파라미터 정의서 상에서 둘다 수정이다.
        'POST' ,
        endpoint,
        params,
        true,
        {
          cache: 'no-store',
        },
      )

      if (response && response.resultType === 'success') {
        alert(response.message)
        onCloseClick()
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


    useEffect(() => { // 시도 코드 변경시 관할관청 재조회
      fetchGroupNm()
    }, [dayoffLocgovCd])



   //부제 그룹 샐랙트를 채우는 API
    const fetchGroupNm = async () => {
    let groupCodes: SelectItem[] = [
        {
        label: '전체',
        value: '',
        },
    ]
    try {
        // 검색 조건에 맞는 endpoint 생성
        let endpoint: string =
            `/fsm/stn/bdm/tx/getAllDayoffVeInfoMemoPartNmList?` +
            `${dayoffLocgovCd ? '&dayoffLocgovCd=' + dayoffLocgovCd : ''}` 
        
        const response = await sendHttpRequest('GET', endpoint, null, true, {
            cache: 'no-store',
        })
        if (response && response.resultType === 'success' && response.data) {
            // setGroupNmCode(response.data)

            response.data.map((code: any)=> { 
            let item : SelectItem = {
                label: code['dayoffSeNm'],
                value: code['dayoffSeCd'],
            }
              groupCodes.push(item)
            })

            setGroupNmCode(groupCodes)

        } else {
          alert(response.message)
        } 
      }catch (error) {
        console.error('Error fetching data:', error)    
      } finally {
    }
  }

  const handleChange = (val:string) => {
    setData((prev) => ({ ...prev, dayoffMemoCn: val }))
  }

  const handleCose = () => {
    setData({})
    onCloseClick();
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
              <h2> 부제메모</h2>
            </CustomFormLabel>
            <div className=" button-right-align">
              <Button variant="contained" color="primary" onClick={saveData}>
                저장
              </Button>
              <Button
                variant="contained"
                color="dark"
                onClick={handleCose}
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
                  <col style={{ width: '24%' }}></col>
                  <col style={{ width: '26%' }}></col>
                  <col style={{ width: '24%' }}></col>
                  <col style={{ width: '26%' }}></col>

                </colgroup>
                <tbody>
                  <tr>
                    <th className="td-head" scope="row">
                    관할관청
                    </th>
                    <td>
                      <div className="form-group" style={{ width: '100%' }}>
                      {row.locgovNm ?? ''}
                      </div>
                    </td>
                    <th className="td-head" scope="row">
                    차량번호
                    </th>
                    <td >
                      <div className="form-group" style={{ width: '100%' }}>
                        {row.vhclNo ?? ''}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">
                    부제구분명
                    </th>
                    <td colSpan={3}>
                      <div className="form-group" style={{ width: '70%' }}>
                      <CustomFormLabel className="input-label-none" htmlFor="ft-dayoffSeCd">부제구분명</CustomFormLabel>
                      <select
                          id="ft-dayoffSeCd"
                          className="custom-default-select"
                          name="dayoffSeCd"
                          value={data.dayoffSeCd}
                          onChange={handleParamChange}
                          style={{ width: '70%' }}
                      >
                          {groupNmCode.map((option) => (
                              <option key={option.value} value={option.value}>
                                  {option.label}
                              </option>
                          ))}
                      </select>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">
                    부제메모
                    </th>
                    <td colSpan={3}>
                      <div className="form-group" style={{ width: '100%' }}>
                      <CustomFormLabel className="input-label-none" htmlFor="modal-dayoffMemoCn">부제메모</CustomFormLabel>
                      <textarea 
                        id="modal-dayoffMemoCn"
                        name="dayoffMemoCn"
                        value={data.dayoffMemoCn}
                        onChange={(e) => handleChange(e.target.value)}
                        style={{ width: '100%', minHeight: '150px', marginTop: 5 }}
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

export default DayoffMemoModal

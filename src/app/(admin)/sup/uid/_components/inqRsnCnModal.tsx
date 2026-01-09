/* React */
import React, { useState, Dispatch, SetStateAction, ChangeEvent } from 'react'

/* mui component */
import { Box, Button, Dialog, DialogContent } from '@mui/material'
import { CustomFormLabel, CustomTextField } from '@/utils/fsms/fsm/mui-imports'

/* 공통 component */
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import { CommSelect } from '@/app/components/tx/commSelect/CommSelect'

/* 공통js */
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'

type propsType = {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  selectedRowData: any
  reload: () => void
}

type paramObj = {
  inqRsnCd: string
  inqRsnCn: string
}

const InqRsnCnModal = (props: propsType) => {

  const { open, setOpen, selectedRowData, reload } = props

  const [params, setParams] = useState<paramObj>({ inqRsnCd: '', inqRsnCn: selectedRowData.inqRsnCn })
  const [loadingBackdrop, setLoadingBackdrop] = useState<boolean>(false)

  const save = async (): Promise<void> => {

    if (!params.inqRsnCd) {
      alert('열람목적을 선텍해 주세요')
      return
    }

    if (!params.inqRsnCn.trim()) {
      alert('열람사유를 입력해 주세요')
      return
    }

    if (confirm('저장 하시겠습니까?')) {

      setLoadingBackdrop(true)

      try {

        const endPoint = '/fsm/sup/uid/cm/updateAllUnqInfoDownload'
        const body = {
          inqYmd: selectedRowData.inqYmd,
          sn: selectedRowData.sn,
          type: selectedRowData.type,
          inqRsnCd: params.inqRsnCd,
          inqRsnCn: params.inqRsnCn,
        }

        const response = await sendHttpRequest('POST', endPoint, body, true, { cache: 'no-store' })

        if (response && response.resultType === 'success') {
          alert('완료되었습니다')
          reload()          
        } else {
          alert('[열람사유 등록 실패] 관리자에게 문의부탁드립니다')
        }
      } catch (error) {
        console.log(error)
        alert('[error] 관리자에게 문의부탁드립니다')
      } finally {
        setLoadingBackdrop(false)
        setOpen(false)
      }
    }
  }

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = event.target
    setParams(prev => ({ ...prev, [name]: value }))
  }

  return (
    <Box>
      <Dialog fullWidth={true} maxWidth={'md'} open={open}>
        <DialogContent>
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              <h2>열람사유 등록</h2>
            </CustomFormLabel>

            {/* 버튼 */}
            <div className=" button-right-align">
              <Button
                variant="contained"
                color="primary"
                onClick={save}
              >
                저장
              </Button>

              <Button
                variant="contained"
                color="dark"
                onClick={() => setOpen(false)}
              >
                닫기
              </Button>
            </div>
          </Box>

          <div id="alert-dialog-description1">
            <div className="table-scrollable">
              <table className="table table-bordered">
                <caption>열람사유 등록</caption>
                <colgroup>
                  <col style={{ width: '25%' }}></col>
                  <col style={{ width: '75%' }}></col>
                </colgroup>
                <tbody>
                  <tr>
                    <th className='td-head' scope='row'>
                      열람목적
                    </th>
                    <td>
                      <div className='form-group' style={{ width: '100%' }}>
                        <CustomFormLabel
                          className='input-label-none'
                          htmlFor='sch-inqRsnCd'
                        >
                          열람목적
                        </CustomFormLabel>
                        <CommSelect
                          cdGroupNm={selectedRowData.type === 'excel' ? '230' : '500'}
                          pValue={params.inqRsnCd}
                          handleChange={handleSearchChange}
                          pName='inqRsnCd'
                          htmlFor={'sch-inqRsnCd'}
                          addText='- 선택 -'
                          defaultValue={selectedRowData.inqRsnCd}
                        />
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">
                      열람사유
                    </th>
                    <td>
                      <CustomFormLabel
                        className="input-label-none"
                        htmlFor="ft-inqRsnCn"
                      >
                        열람사유
                      </CustomFormLabel>
                      <CustomTextField
                        id="ft-inqRsnCn"
                        fullWidth
                        name="inqRsnCn"
                        value={params.inqRsnCn}
                        onChange={handleSearchChange}                        
                      />
                    </td>
                  </tr>                  
                </tbody>
              </table>
            </div>
            {/* 테이블영역 끝 */}
          </div>

          {/* 로딩 */}
          <LoadingBackdrop open={loadingBackdrop} />
        </DialogContent>
      </Dialog>      
    </Box>
  )
}

export default InqRsnCnModal
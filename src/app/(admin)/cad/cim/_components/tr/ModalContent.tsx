import { Box, FormControlLabel, Grid, RadioGroup } from '@mui/material'
import { DetailRow } from '../../page'
import { procInterface } from '../CrudButtons'
import CustomTextField from '@/app/components/forms/theme-elements/CustomTextField'
import CustomRadio from '@/app/components/forms/theme-elements/CustomRadio'
import { useEffect, useState } from 'react'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import CustomFormLabel from '@/app/components/forms/theme-elements/CustomFormLabel'

/* interface, type 선언 */
interface propsInterface {
  procData: procInterface
  setProcData: React.Dispatch<React.SetStateAction<procInterface>>
  isDataProcessing: boolean
}

const ModalContent = (props: propsInterface) => {
  const { procData, setProcData, isDataProcessing } = props
  const [sendGb, setSendGb] = useState<string>(procData.sendDataYn || 'Y')

  useEffect(() => {
    // 모달이 열릴 때마다 sendDataYn을 'Y'로 초기화
    setProcData((prev) => ({ ...prev, sendDataYn: 'Y' }))
    setSendGb('Y') // 라디오 버튼 값도 초기화
  }, []) // 최초 실행 시 1회만 실행

  const handleRadio = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    setSendGb(value)
    setProcData((prev) => ({ ...prev, sendDataYn: value }))
  }

  const handleChange = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
  ) => {
    const { name, value } = event.target
    if (name === 'vonrRrno') {
      setProcData((prev) => ({ ...prev, [name]: value.replace(/[^0-9]/g, '') }))
    } else {
      setProcData((prev) => ({ ...prev, [name]: value }))
    }
  }

  return (
    <Box marginBottom={2} sx={{ minWidth: 1100 }}>
      <div className="table-scrollable">
        <table className="table table-bordered">
          <caption>유류구매카드 말소 및 복원 처리</caption>

          <colgroup>
            <col style={{ width: '10%' }} />
            <col style={{ width: 'auto' }} />
          </colgroup>
          <tbody>
            <tr>
              <th className="td-head" scope="row">
                전송발송여부
              </th>
              <td>
                <div className="form-group" style={{ width: 'inherit' }}>
                  <RadioGroup
                    name="sendGb"
                    onChange={handleRadio}
                    value={sendGb}
                    className="mui-custom-radio-group"
                    row
                  >
                    <FormControlLabel
                      value="Y"
                      control={<CustomRadio />}
                      label="전문발송"
                    />
                    <FormControlLabel
                      value="N"
                      control={<CustomRadio />}
                      label="전문미발송"
                    />
                  </RadioGroup>
                </div>
              </td>
            </tr>
            <tr>
              <th className="td-head" scope="row">
                변경사유
              </th>
              <td>
                <CustomFormLabel
                  className="input-label-none"
                  htmlFor="ft-chgRsnCn"
                >
                  변경사유
                </CustomFormLabel>
                <textarea
                  style={{
                    width: '100%',
                    height: '100px',
                    resize: 'none',
                  }}
                  id="ft-chgRsnCn"
                  name="chgRsnCn"
                  value={procData.chgRsnCn}
                  onChange={handleChange}
                  maxLength={100}
                />
              </td>
            </tr>
            <tr>
              <th className="td-head" scope="row">
                주민등록번호
              </th>
              <td>
                <CustomFormLabel
                  className="input-label-none"
                  htmlFor="ft-vonrRrno"
                >
                  주민등록번호
                </CustomFormLabel>
                <CustomTextField
                  type="text"
                  id="ft-vonrRrno"
                  name="vonrRrno"
                  value={procData.vonrRrno}
                  onChange={handleChange}
                  style={{ width: '75%' }}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <LoadingBackdrop open={isDataProcessing} />
    </Box>
  )
}

export default ModalContent

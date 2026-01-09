import {
  CustomRadio,
  CustomSelect,
  CustomTextField,
} from '@/utils/fsms/fsm/mui-imports'
import {
  Box,
  FormControlLabel,
  MenuItem,
  RadioGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@mui/material'
import { useState } from 'react'
import { SelectItem } from 'select'
import { Row } from '../page'
import SearchModalContent from './SearchModal'

interface ModalContentProps {
  rows?: Row[]
  cityCode: SelectItem[]
}

const ModalContent = (props: ModalContentProps) => {
  const { rows, cityCode } = props

  const [params, setParams] = useState({
    locgovCd: '',
    locgovNm: '',
    ctpvCd: '',
    locgovSeCd: '01',
    clclnLocgovCd: '',
    clclnLocgovNm: '',
  })

  const handleRowClick = (rowData: Row) => {
    setParams((prev) => ({
      ...prev,
      clclnLocgovCd: rowData['clclnLocgovCd'],
      clclnLocgovNm: rowData['clclnLocgovNm'],
    }))
  }

  const handleParamChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target

    setParams((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <Box>
      <TableContainer style={{ margin: '16px 0 2em 0' }}>
        <Table
          sx={{ minWidth: 600 }}
          aria-labelledby="tableTitle"
          size={'small'}
        >
          <TableBody>
            <TableRow>
              <TableCell
                className="table-title-column"
                style={{ width: '150px', backgroundColor: '#f8f8f9' }}
                align={'left'}
              >
                <span className="required-text">*</span>시도명
              </TableCell>
              <TableCell
                style={{ width: '450px', textAlign: 'left' }}
                colSpan={3}
              >
                <CustomSelect
                  id="ft-select-01"
                  name="ctpvCd"
                  className="custom-default-select"
                  value={params.ctpvCd}
                  onChange={handleParamChange}
                  fullWidth
                >
                  {cityCode.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </CustomSelect>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="table-title-column">
                <span className="required-text">*</span>지자체구분
              </TableCell>
              <TableCell colSpan={3}>
                <RadioGroup
                  row
                  id="modal-radio-useYn"
                  name="locgovSeCd"
                  value={params.locgovSeCd}
                  onChange={handleParamChange}
                  className="mui-custom-radio-group"
                >
                  {/* <FormControlLabel
                    control={<CustomRadio id="locgovSeCd_1" name="locgovSeCd" value="1" />}
                    label="시도"
                  /> */}
                  <FormControlLabel
                    control={
                      <CustomRadio
                        id="locgovSeCd_0"
                        name="locgovSeCd"
                        value="01"
                      />
                    }
                    label="관할관청"
                  />
                </RadioGroup>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="table-title-column">
                <span className="required-text">*</span>지자체코드
              </TableCell>
              <TableCell colSpan={3}>
                <CustomTextField
                  type="text"
                  id="modal-locgovCd"
                  name="locgovCd"
                  value={params.locgovCd}
                  onChange={handleParamChange}
                  fullWidth
                />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="table-title-column">
                <span className="required-text">*</span>지자체명
              </TableCell>
              <TableCell colSpan={3}>
                <CustomTextField
                  type="text"
                  id="modal-locgovNm"
                  name="locgovNm"
                  value={params.locgovNm}
                  onChange={handleParamChange}
                  fullWidth
                />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="table-title-column">정산지자체</TableCell>
              <TableCell style={{ padding: '6px 0px 6px 16px', width: '20%' }}>
                <CustomTextField
                  type="text"
                  id="modal-clclnLocgovCd"
                  name="clclnLocgovCd"
                  value={params.clclnLocgovCd}
                  onChange={handleParamChange}
                />
              </TableCell>
              <TableCell style={{ padding: '6px 0' }}>
                <SearchModalContent
                  selectedCtpvCd={params.ctpvCd}
                  handleRowClick={handleRowClick}
                />
              </TableCell>
              <TableCell style={{ padding: '6px 16px 6px 0', width: 'auto' }}>
                <CustomTextField
                  type="text"
                  id="modal-clclnLocgovNm"
                  name="clclnLocgovNm"
                  value={params.clclnLocgovNm}
                  onChange={handleParamChange}
                  inputProps={{
                    readOnly: true,
                    placeholder: '등록지자체가 자동으로 매핑됩니다.',
                  }}
                  fullWidth
                />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export default ModalContent

'use client'
import React, { memo } from 'react'

import { Box, FormControlLabel, RadioGroup } from '@mui/material'

import { listSearchObj } from '../page'
import { CustomFormLabel, CustomRadio, CustomTextField } from '@/utils/fsms/fsm/mui-imports'
import { CommSelect, CtpvSelect, LocgovSelect } from '@/app/components/tx/commSelect/CommSelect'
import { CommTextField } from '@/app/components/tx/commTextField/CommTextFiled'

interface propsInterface {
  tabIndex: string,
  params:listSearchObj,
  handleSearchChange:(event:React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void,
  handleKeyDown:(event:React.KeyboardEvent<HTMLInputElement>) => void,
}

const SearchCondition = (props:propsInterface) => {
  const { params, handleSearchChange, tabIndex, handleKeyDown } = props;
  return (
    <Box className="sch-filter-box">
      <div className="filter-form">
          <>
            <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor="sch-ctpv">
                <span className="required-text">*</span>시도명
              </CustomFormLabel>
              <CtpvSelect
                pValue={params.ctpvCd}
                handleChange={handleSearchChange}
                pName="ctpvCd"
                htmlFor={'sch-ctpv'}
              />
            </div>
            <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor="sch-locgov">
                <span className="required-text">*</span>관할관청
              </CustomFormLabel>
              <LocgovSelect
                ctpvCd={params.ctpvCd}
                pValue={params.locgovCd}
                handleChange={handleSearchChange}
                pName="locgovCd"
                htmlFor={'sch-locgov'}
              />
            </div>
            <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor="sch-cardSe">
                처리상태
              </CustomFormLabel>
              <CommSelect
                cdGroupNm="088"
                pValue={params.locgovAprvYn}
                handleChange={handleSearchChange}
                pName="cardSeCd"
                htmlFor={'sch-cardSe'}
                addText="전체"
              />
            </div>
          </>
      </div><hr></hr>
      <div className="filter-form">
          <>
            <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor="sch-dt">
                <span className="required-text">*</span>기간
              </CustomFormLabel>
              <RadioGroup
                row id="srchDtGb"
                name="srchDtGb"
                className="mui-custom-radio-group"
                onChange={handleSearchChange}
                value={params.srchDtGb || ''}
              >
                <FormControlLabel
                  control={<CustomRadio id="rdo3_1" name="srchDtGb" value="01" />}
                  label="접수일자"
                />
                <FormControlLabel
                  control={<CustomRadio id="rdo3_2" name="srchDtGb" value="02" />}
                  label="처리일자"
                />
              </RadioGroup>
              <CustomTextField
                value={params.bgngDt}
                onChange={handleSearchChange}
                name="bgngDt"
                type="date" id="ft-date-start" fullWidth />
              <CustomTextField
                value={params.endDt}
                name="endDt"
                onChange={handleSearchChange}
                type="date" id="ft-date-end" fullWidth />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-fname"
              >
                차량번호
              </CustomFormLabel>
              <CustomTextField
                id="ft-fname"
                placeholder=""
                fullWidth
                name="vhclNo"
                text={params.vhclNo}
                onChange={handleSearchChange}
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-fname">
                업체명
              </CustomFormLabel>
              <CustomTextField
                id="ft-fname"
                placeholder=""
                fullWidth
                name="brno"
                text={params.bzentyNm}
                onChange={handleSearchChange}
              />
            </div>
          </>

      </div>
    </Box>
  )
}

export default memo(SearchCondition)
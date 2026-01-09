'use client'

/* React */
import React, { memo } from 'react'
import { listSearchObj } from '../page'
import { Box } from '@mui/material'
import CustomFormLabel from '@/app/components/forms/theme-elements/CustomFormLabel'
import { CommSelect, CtpvSelect, LocgovSelect } from '@/app/components/tx/commSelect/CommSelect'
import { CommTextField } from '@/app/components/tx/commTextField/CommTextFiled'
import CustomTextField from '@/app/components/forms/theme-elements/CustomTextField'

/* interface 선언 */
interface propsInterface {
    tabIndex:string,
    params:listSearchObj,
    handleSearchChange:(event:React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void,
    fn:() => void,
}

const SearchConditionBS = (props: propsInterface) => {
  const { params, tabIndex, handleSearchChange, /*handleKeyDown,*/ fn } = props

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') fn()
  }

  return (
    <Box className="sch-filter-box">
      {/* 1열 조회조건 */}
      <div className="filter-form">
        <div className="form-group">
          <CustomFormLabel className="input-label-display" htmlFor="sch-ctpvCd">
            <span className="required-text">*</span>시도명
          </CustomFormLabel>
          <CtpvSelect 
            pValue={params.ctpvCd}
            handleChange={handleSearchChange}
            htmlFor={'sch-ctpvCd'}
          />
        </div>
        <div className="form-group">
          <CustomFormLabel className="input-label-display" htmlFor="sch-locgovCd">
            <span className="required-text">*</span>관할관청
          </CustomFormLabel>
          <LocgovSelect
            ctpvCd={params.ctpvCd} 
            pValue={params.locgovCd}
            handleChange={handleSearchChange}
            htmlFor={'sch-ctpvCd'}
          />
        </div>
        <CommTextField type={'vhclNo'} handleChange={handleSearchChange} handleKeyDown={handleKeyDown} />
        <div className="form-group">
          <CustomFormLabel className="input-label-display" htmlFor="sch-pttrnSeCd">
            패턴구분
          </CustomFormLabel>
          <CommSelect
            cdGroupNm="ILPBDD"
            pValue={params.pttrnSeCd}
            handleChange={handleSearchChange}
            pName="pttrnSeCd"
            htmlFor="sch-pttrnSeCd"
            addText="전체"
          />
        </div>
      </div><hr></hr>
      {/* 2열 조회조건 */}
      <div className="filter-form">
        <div className="form-group">
          <CustomFormLabel className="input-label-display">
            등록일자
          </CustomFormLabel>
          <CustomFormLabel className="input-label-none" htmlFor="sch-bgngRegDt">
            등록일자 시작
          </CustomFormLabel>
          <CustomTextField 
            type="date"
            id="sch-bgngRegDt"
            name="bgngRegDt"
            value={params.bgngRegDt}
            onChange={handleSearchChange}
            fullWidth
          />
          <span>~</span>
          <CustomFormLabel className="input-label-none" htmlFor="sch-endRegDt">
            등록일자 종료
          </CustomFormLabel>
          <CustomTextField 
            type="date"
            id="sch-endRegDt"
            name="endRegDt"
            value={params.endRegDt}
            onChange={handleSearchChange}
            fullWidth
          />
        </div>
        <div className="form-group">
          <CustomFormLabel className="input-label-display" htmlFor="sch-vonrRrno">
            사업자등록번호
          </CustomFormLabel>
          <CustomTextField 
            type="text" 
            id="sch-vonrRrno" 
            name="vonrRrno" 
            value={params.brno} 
            onChange={handleSearchChange} 
            onKeyDown={handleKeyDown} 
            fullWidth 
            inputProps={{maxlength:13}}            
          />
        </div>
      </div>
    </Box>
  )
}

export default memo(SearchConditionBS)
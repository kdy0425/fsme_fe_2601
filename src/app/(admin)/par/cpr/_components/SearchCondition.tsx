'use client'

/* React */
import React, { memo } from 'react'

/* 공통js */
import { getFormatToday } from '@/utils/fsms/common/dateUtils'

/* 공통 component */
import { CtpvSelect, LocgovSelect, CommSelect } from '@/app/components/tx/commSelect/CommSelect';
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'
import { CommTextField } from '@/app/components/tx/commTextField/CommTextFiled';

/* mui component */
import { Box } from '@mui/material'

/* page에서 선언한 type */
import { listSearchObj } from '../page';

/* interface 선언 */
interface propsInterface {
  params:listSearchObj,
  handleSearchChange:(event:React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void,
}

const SearchCondition = (props:propsInterface) => {

  const { params, handleSearchChange } = props;

  return (
    <Box className="sch-filter-box">

      {/* 1열 조회조건 */}
      <div className="filter-form">
        
        {/* 시도 조회조건 */}
        <div className="form-group">
          <CustomFormLabel className="input-label-display" htmlFor="sch-ctpv">
            <span className="required-text">*</span>시도명
          </CustomFormLabel>
          <CtpvSelect
            pValue={params.ctpvCd}
            handleChange={handleSearchChange}
            htmlFor={'sch-ctpv'}
          />
        </div>

        {/* 관할관청 조회조건 */}
        <div className="form-group">
          <CustomFormLabel className="input-label-display" htmlFor="sch-locgov">
            <span className="required-text" >*</span>관할관청
          </CustomFormLabel>              
          <LocgovSelect
            ctpvCd={params.ctpvCd}
            pValue={params.locgovCd}
            handleChange={handleSearchChange}
            htmlFor={'sch-locgov'}
          />
        </div>
        
        {/* 신청일자 조회조건 */}
        <div className="form-group">
          <CustomFormLabel className="input-label-display">
            신청일자
          </CustomFormLabel>
          <CustomFormLabel className="input-label-none" htmlFor="sch-strRcptYmd">
            신청일자 시작
          </CustomFormLabel>
          <CustomTextField
            type="date"
            id="sch-strRcptYmd"
            name="strRcptYmd"
            value={params.strRcptYmd}
            onChange={handleSearchChange}
            fullWidth
          />
          ~
          <CustomFormLabel className="input-label-none" htmlFor="sch-endRcptYmd">
            신청일자 종료
          </CustomFormLabel>
          <CustomTextField
            type="date"
            id="sch-endRcptYmd"
            name="endRcptYmd"
            value={params.endRcptYmd}
            onChange={handleSearchChange}
            fullWidth
          />
        </div>
      </div>

      {/* 2열 조회조건 */}
      <div className="filter-form">
        
        {/* 사업자등록번호 조회조건 */}
        <div className="form-group">
          <CustomFormLabel className="input-label-display" htmlFor="ft-brno">
            사업자번호
          </CustomFormLabel>
          <CustomTextField
            id="ft-brno"
            name="brno"
            value={params.brno}
            onChange={handleSearchChange}
            fullWidth
          />
        </div>

        {/* 주민등록번호 조회조건 */}
        <div className="form-group">
          <CustomFormLabel className="input-label-display" htmlFor="ft-rrno">
            주민등록번호
          </CustomFormLabel>
          <CustomTextField
            id="ft-rrno"
            name="rrno"
            value={params.rrno}
            onChange={handleSearchChange}
            fullWidth
          />
        </div>
        
        {/* 차량번호 조회조건 */}
        <CommTextField
          type={'vhclNo'}
          handleChange={handleSearchChange}
        />
        
        {/* 상태 조회조건 */}
        <div className="form-group">
          <CustomFormLabel className="input-label-display" htmlFor="sch-aprvCd">
            상태
          </CustomFormLabel>
          <CommSelect                
            cdGroupNm='CDS0'
            pValue={params.aprvCd}
            handleChange={handleSearchChange}
            pName='aprvCd'
            htmlFor={'sch-aprvCd'}
            addText='전체'
          />
        </div>
      </div>
    </Box>
  )
}

export default memo(SearchCondition);

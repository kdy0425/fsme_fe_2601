'use client'

/* React */
import React, { memo } from 'react'

/* 공통js */
import { getFormatToday } from '@/utils/fsms/common/dateUtils'

/* 공통 component */
import {
  CtpvSelect,
  LocgovSelect,
  CommSelect,
  LocgovSelectAll,
} from '@/app/components/tx/commSelect/CommSelect'
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'
import { CommTextField } from '@/app/components/tx/commTextField/CommTextFiled'

/* mui component */
import { Box } from '@mui/material'

/* page에서 선언한 interface, type */
import { listSearchObj } from '../page'

/* interface 선언 */
interface propsInterface {
  tabIndex: string
  params: listSearchObj
  handleSearchChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void
  onkeyChange: (event: React.KeyboardEvent<HTMLInputElement>) => void
}

const SearchCondition = (props: propsInterface) => {
  const { params, handleSearchChange, tabIndex, onkeyChange } = props

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
            <span className="required-text">*</span>관할관청
          </CustomFormLabel>
            <LocgovSelect
              ctpvCd={params.ctpvCd}
              pValue={params.locgovCd}
              handleChange={handleSearchChange}
              htmlFor={'sch-locgov'}
            />
        </div>

        {/* 차량번호 조회조건 */}
        <CommTextField
          type={'vhclNo'}
          handleChange={handleSearchChange}
          handleKeyDown={onkeyChange}
          pValue={params.vhclNo}
        />

        {/* 소유자명 조회조건 */}
        <CommTextField
          type={'vonrNm'}
          handleChange={handleSearchChange}
          handleKeyDown={onkeyChange}
          pValue={params.vonrNm}
        />
      </div><hr></hr>

      {/* 2열 조회조건 */}
      <div className="filter-form">
        {/* 신청일자 조회조건 */}
        <div className="form-group">
          <CustomFormLabel className="input-label-display">
            거절일자
          </CustomFormLabel>
          <CustomFormLabel className="input-label-none" htmlFor="sch-bgngYmd">
            거절일자 시작
          </CustomFormLabel>
          <CustomTextField
            type="date"
            id="sch-bgngYmd"
            name="bgngYmd"
            value={params.bgngYmd}
            onChange={handleSearchChange}
            onKeyDown={onkeyChange}
            fullWidth
          />
          ~
          <CustomFormLabel className="input-label-none" htmlFor="sch-endYmd">
            거절일자 종료
          </CustomFormLabel>
          <CustomTextField
            type="date"
            id="sch-endYmd"
            name="endYmd"
            value={params.endYmd}
            onChange={handleSearchChange}
            onKeyDown={onkeyChange}
            fullWidth
          />
        </div>

        {/* 주민등록번호 조회조건 */}
        <CommTextField
          type={'vonrRrno'}
          handleChange={handleSearchChange}
          handleKeyDown={onkeyChange}
          pValue={params.vonrRrno}
        />

        {/* 상태 조회조건 ** 화물만 해당 */}
        {tabIndex == '0' ? (
          <div className="form-group">
            <CustomFormLabel
              className="input-label-display"
              htmlFor="sch-setYn"
            >
              진행상태
            </CustomFormLabel>
            <CommSelect
              cdGroupNm="SRPC"
              pValue={params.setYn}
              handleChange={handleSearchChange}
              pName="setYn"
              htmlFor={'sch-setYn'}
              addText="전체"
            />
          </div>
        ) : null}
      </div>
    </Box>
  )
}

export default memo(SearchCondition)

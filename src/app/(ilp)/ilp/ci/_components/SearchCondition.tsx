'use client'
import React, { memo } from 'react'

import { Box } from '@mui/material'

import { listSearchObj } from '../page'
import { CustomFormLabel, CustomTextField } from '@/utils/fsms/fsm/mui-imports'
import {
  CommSelect,
  CtpvSelect,
  LocgovSelect,
} from '@/app/components/tx/commSelect/CommSelect'
import { CommTextField } from '@/app/components/tx/commTextField/CommTextFiled'

interface propsInterface {
  tabIndex: string
  params: listSearchObj
  handleSearchChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void
  handleKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void
}

const SearchCondition = (props: propsInterface) => {
  const { params, handleSearchChange, tabIndex, handleKeyDown } = props

  return (
    <Box className="sch-filter-box">
      <div className="filter-form">
        {tabIndex == '0' ? (
          <>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-ctpv"
              >
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
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-locgov"
              >
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
            <CommTextField
              type="vhclNo"
              require
              handleChange={handleSearchChange}
              handleKeyDown={handleKeyDown}
            />
            <CommTextField
              type="vonrNm"
              require
              handleChange={handleSearchChange}
              handleKeyDown={handleKeyDown}
            />
          </>
        ) : null}
        {tabIndex == '1' ? (
          <>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-ctpv"
              >
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
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-locgov"
              >
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
            <CommTextField
              type="brno"
              require={false}
              handleChange={handleSearchChange}
              handleKeyDown={handleKeyDown}
            />
            <CommTextField
              type="vhclNo"
              require={false}
              handleChange={handleSearchChange}
              handleKeyDown={handleKeyDown}
            />
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-flnm"
              >
                소유자명
              </CustomFormLabel>
              <CustomTextField
                type="text"
                id="sch-flnm"
                name="flnm"
                value={params.flnm}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
              />
            </div>
          </>
        ) : null}
        {tabIndex == '2' ? (
          <>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-ctpv"
              >
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
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-locgov"
              >
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
            <CommTextField
              type="brno"
              require={false}
              handleChange={handleSearchChange}
              handleKeyDown={handleKeyDown}
            />
            <CommTextField
              type="vhclNo"
              require={false}
              handleChange={handleSearchChange}
              handleKeyDown={handleKeyDown}
            />
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-flnm"
              >
                소유자명
              </CustomFormLabel>
              <CustomTextField
                type="text"
                id="sch-flnm"
                name="flnm"
                value={params.flnm}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
              />
            </div>
          </>
        ) : null}
      </div>
      <hr></hr>
      
        {tabIndex == '0' ? (
          <div className="filter-form" key={tabIndex}>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-crdco"
              >
                카드사
              </CustomFormLabel>
              <CommSelect
                cdGroupNm="023"
                pValue={params.crdcoCd}
                handleChange={handleSearchChange}
                pName="crdcoCd"
                htmlFor={'sch-crdco'}
                addText="전체"
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-cardStts"
              >
                카드상태
              </CustomFormLabel>
              <CommSelect
                cdGroupNm="008"
                pValue={params.cardSttsCd}
                handleChange={handleSearchChange}
                pName="cardSttsCd"
                htmlFor={'sch-cardStts'}
                addText="전체"
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-cardSe"
              >
                카드구분
              </CustomFormLabel>
              <CommSelect
                cdGroupNm="974"
                pValue={params.cardSeCd}
                handleChange={handleSearchChange}
                pName="cardSeCd"
                htmlFor={'sch-cardSe'}
                addText="전체"
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-dscntYn"
              >
                할인여부
              </CustomFormLabel>
              <CommSelect
                cdGroupNm="027"
                pValue={params.dscntYn}
                handleChange={handleSearchChange}
                pName="dscntYn"
                htmlFor={'sch-dscntYn'}
                addText="전체"
              />
            </div>
          </div>
        ) : (
          <>
            {tabIndex == '1' ? (
              <div className="filter-form" key={tabIndex}>
                <div className="form-group">
                  <CustomFormLabel
                    className="input-label-display"
                    htmlFor="sch-crdco"
                  >
                    카드사
                  </CustomFormLabel>
                  <CommSelect
                    cdGroupNm="CCGC"
                    pValue={params.crdcoCd}
                    handleChange={handleSearchChange}
                    pName="crdcoCd"
                    htmlFor={'sch-crdco'}
                    addText="전체"
                  />
                </div>
                <div className="form-group">
                  <CustomFormLabel
                    className="input-label-display"
                    htmlFor="sch-cardStts"
                  >
                    카드상태
                  </CustomFormLabel>
                  <CommSelect
                    cdGroupNm="CCS0"
                    pValue={params.cardSttsCd}
                    handleChange={handleSearchChange}
                    pName="cardSttsCd"
                    htmlFor={'sch-cardStts'}
                    addText="전체"
                  />
                </div>
                <div className="form-group">
                  <CustomFormLabel
                    className="input-label-display"
                    htmlFor="sch-cardSe"
                  >
                    카드구분
                  </CustomFormLabel>
                  <CommSelect
                    cdGroupNm="CCG0"
                    pValue={params.cardSeCd}
                    handleChange={handleSearchChange}
                    pName="cardSeCd"
                    htmlFor={'sch-cardSe'}
                    addText="전체"
                  />
                </div>
                <div className="form-group">
                  <CustomFormLabel
                    className="input-label-display"
                    htmlFor="sch-dscntYn"
                  >
                    할인여부
                  </CustomFormLabel>
                  <CommSelect
                    cdGroupNm="027"
                    pValue={params.dscntYn}
                    handleChange={handleSearchChange}
                    pName="dscntYn"
                    htmlFor={'sch-dscntYn'}
                    addText="전체"
                  />
                </div>
              </div>
            ) : (
              <div className="filter-form" key={tabIndex}>
                <div className="form-group">
                  <CustomFormLabel
                    className="input-label-display"
                    htmlFor="sch-crdco"
                  >
                    카드사
                  </CustomFormLabel>
                  <CommSelect
                    cdGroupNm="543"
                    pValue={params.crdcoCd}
                    handleChange={handleSearchChange}
                    pName="crdcoCd"
                    htmlFor={'sch-crdco'}
                    addText="전체"
                  />
                </div>
                <div className="form-group">
                  <CustomFormLabel
                    className="input-label-display"
                    htmlFor="sch-cardStts"
                  >
                    카드상태
                  </CustomFormLabel>
                  <CommSelect
                    cdGroupNm="008"
                    pValue={params.cardSttsCd}
                    handleChange={handleSearchChange}
                    pName="cardSttsCd"
                    htmlFor={'sch-cardStts'}
                    addText="전체"
                  />
                </div>
                <div className="form-group">
                  <CustomFormLabel
                    className="input-label-display"
                    htmlFor="sch-cardSe"
                  >
                    카드구분
                  </CustomFormLabel>
                  <CommSelect
                    cdGroupNm="542"
                    pValue={params.cardSeCd}
                    handleChange={handleSearchChange}
                    pName="cardSeCd"
                    htmlFor={'sch-cardSe'}
                    addText="전체"
                  />
                </div>
                <div className="form-group">
                  <CustomFormLabel
                    className="input-label-display"
                    htmlFor="sch-koi"
                  >
                    유종
                  </CustomFormLabel>
                  <CommSelect
                    cdGroupNm="599"
                    pValue={params.koiCd}
                    handleChange={handleSearchChange}
                    pName="koiCd"
                    htmlFor={'sch-koi'}
                    addText="전체"
                  />
                </div>
                <div className="form-group">
                  <CustomFormLabel
                    className="input-label-display"
                    htmlFor="sch-dscntYn"
                  >
                    할인여부
                  </CustomFormLabel>
                  <CommSelect
                    cdGroupNm="027"
                    pValue={params.dscntYn}
                    handleChange={handleSearchChange}
                    pName="dscntYn"
                    htmlFor={'sch-dscntYn'}
                    addText="전체"
                  />
                </div>
              </div>
            )}
          </>
        )}
    </Box>
  )
}

export default memo(SearchCondition)

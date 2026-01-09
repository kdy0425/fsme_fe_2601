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

/* page에서 선언한 interface, type */
import { listSearchObj } from '../page';

/* interface 선언 */
interface propsInterface {
  tabIndex:string,
  params:listSearchObj,
  handleSearchChange:(event:React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void,
  handleKeyDown:(event:React.KeyboardEvent<HTMLInputElement>) => void,
}

const SearchCondition = (props:propsInterface) => {

  const { params, handleSearchChange, tabIndex, handleKeyDown } = props;

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
            청구년월
          </CustomFormLabel>
          <CustomFormLabel className="input-label-none" htmlFor="sch-bgngDt">
            청구년월 시작
          </CustomFormLabel>
          <CustomTextField
            type="month"
            id="sch-bgngDt"
            name="bgngDt"
            value={params.bgngDt}
            onChange={handleSearchChange}
            fullWidth
          />
          ~
          <CustomFormLabel className="input-label-none" htmlFor="sch-endDt">
            청구년월 종료
          </CustomFormLabel>
          <CustomTextField
            type="month"
            id="sch-endDt"
            name="endDt"
            value={params.endDt}
            onChange={handleSearchChange}
            fullWidth
          />
        </div>

        <div className="form-group">
            <CustomFormLabel
            className="input-label-display"
            htmlFor="sch-crdcoCd"
            >
            {tabIndex === '1' ? (
                <>
                <span className="required-text">*</span>
                </>
            ) : (
                ''
            )}
            카드사 구분
            </CustomFormLabel>
            <CommSelect
            cdGroupNm="CCGC" // 필수 O, 가져올 코드 그룹명
            pValue={params.crdcoCd} // 필수 O, 화면 조회조건의 상태관리 변수를 기재해주시면 됩니다
            handleChange={handleSearchChange} // 필수 O, 화면 내부 공통으로 사용중인 조회조건 함수를 기재해주시면 됩니다
            pName="crdcoCd" // 필수 O, 공통코드같은 경우는 필히 name값을 기재해주셔야합니다
            /* width */ // 필수 X, default 100% ** 특정 width 값이 필요하신 경우 기재해주시면 됩니다
            htmlFor={'sch-crdcoCd'} // 필수 X, 조회조건으로 사용시 focus를 위해 htmlFor의 값을 기재해주시면 됩니다
            addText="전체" // 필수 X, 조회조건 제일 최상단에 배치할 값
            />
        </div>
      </div>

      {/* 2열 조회조건 */}
      <div className="filter-form">
        
        {tabIndex === '0' ? (
          <>
            {/* 사업자등록번호 조회조건 */}
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-brno"
              >
                사업자등록번호
              </CustomFormLabel>
              <CustomTextField type="text" id="sch-brno" name="brno" value={params.brno} onChange={handleSearchChange} onKeyDown={handleKeyDown} fullWidth />
            </div>
          </>
        ) : (
          <>
            {/* 차량번호 조회조건 */}
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-vhclNo"
              >
                차량번호
              </CustomFormLabel>
              <CustomTextField type="text" id="sch-vhclNo" name="vhclNo" value={params.vhclNo} onChange={handleSearchChange} onKeyDown={handleKeyDown} fullWidth />
            </div>

            {/* 청구승인부분분 조회조건 */}
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-clmAprvYn"
              >
                청구승인부분
              </CustomFormLabel>
              <CommSelect
                cdGroupNm="CUGU" // 필수 O, 가져올 코드 그룹명
                pValue={params.clmAprvYn} // 필수 O, 화면 조회조건의 상태관리 변수를 기재해주시면 됩니다
                handleChange={handleSearchChange} // 필수 O, 화면 내부 공통으로 사용중인 조회조건 함수를 기재해주시면 됩니다
                pName="clmAprvYn" // 필수 O, 공통코드같은 경우는 필히 name값을 기재해주셔야합니다
                /* width */ // 필수 X, default 100% ** 특정 width 값이 필요하신 경우 기재해주시면 됩니다
                htmlFor={'sch-clmAprvYn'} // 필수 X, 조회조건으로 사용시 focus를 위해 htmlFor의 값을 기재해주시면 됩니다
                addText="전체" // 필수 X, 조회조건 제일 최상단에 배치할 값
              />
            </div>
          </>
        )}

        {/* 유종 조회조건 */}
        <div className="form-group">
          <CustomFormLabel
            className="input-label-display"
            htmlFor="sch-koiCd"
          >
            유종
          </CustomFormLabel>
          <CommSelect
            cdGroupNm="KOI3" // 필수 O, 가져올 코드 그룹명
            pValue={params.koiCd} // 필수 O, 화면 조회조건의 상태관리 변수를 기재해주시면 됩니다
            handleChange={handleSearchChange} // 필수 O, 화면 내부 공통으로 사용중인 조회조건 함수를 기재해주시면 됩니다
            pName="koiCd" // 필수 O, 공통코드같은 경우는 필히 name값을 기재해주셔야합니다
            /* width */ // 필수 X, default 100% ** 특정 width 값이 필요하신 경우 기재해주시면 됩니다
            htmlFor={'sch-koiCd'} // 필수 X, 조회조건으로 사용시 focus를 위해 htmlFor의 값을 기재해주시면 됩니다
            addText="전체" // 필수 X, 조회조건 제일 최상단에 배치할 값
          />
        </div>

        {/* 거래구분 조회조건 */}
        <div className="form-group">
          <CustomFormLabel
            className="input-label-display"
            htmlFor="sch-clclnSeCd"
          >
          거래구분
          </CustomFormLabel>
          <CommSelect
            cdGroupNm="IQG0" // 필수 O, 가져올 코드 그룹명
            pValue={params.clclnSeCd} // 필수 O, 화면 조회조건의 상태관리 변수를 기재해주시면 됩니다
            handleChange={handleSearchChange} // 필수 O, 화면 내부 공통으로 사용중인 조회조건 함수를 기재해주시면 됩니다
            pName="clclnSeCd" // 필수 O, 공통코드같은 경우는 필히 name값을 기재해주셔야합니다
            /* width */ // 필수 X, default 100% ** 특정 width 값이 필요하신 경우 기재해주시면 됩니다
            htmlFor={'sch-clclnSeCd'} // 필수 X, 조회조건으로 사용시 focus를 위해 htmlFor의 값을 기재해주시면 됩니다
            addText="전체" // 필수 X, 조회조건 제일 최상단에 배치할 값
          />
        </div>

        {/* 지급확정구분 조회조건 */}
        <div className="form-group">
          <CustomFormLabel
            className="input-label-display"
            htmlFor="sch-ddlnYn"
          >
            지급확정구분
          </CustomFormLabel>
          <CommSelect
            cdGroupNm="IGG0" // 필수 O, 가져올 코드 그룹명
            pValue={params.ddlnYn} // 필수 O, 화면 조회조건의 상태관리 변수를 기재해주시면 됩니다
            handleChange={handleSearchChange} // 필수 O, 화면 내부 공통으로 사용중인 조회조건 함수를 기재해주시면 됩니다
            pName="ddlnYn" // 필수 O, 공통코드같은 경우는 필히 name값을 기재해주셔야합니다
            /* width */ // 필수 X, default 100% ** 특정 width 값이 필요하신 경우 기재해주시면 됩니다
            htmlFor={'sch-ddlnYn'} // 필수 X, 조회조건으로 사용시 focus를 위해 htmlFor의 값을 기재해주시면 됩니다
            addText="전체" // 필수 X, 조회조건 제일 최상단에 배치할 값
          />
        </div> 
      </div>
    </Box>
  );
};

export default memo(SearchCondition);

/* React */
import React from 'react'

/* 공통 component */
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'
import { CommSelect, CtpvSelect, LocgovSelect } from '@/app/components/tx/commSelect/CommSelect'

/* mui component */
import { Box } from '@mui/material'

/* 부모 컴포넌트에서 선언한 interface */
import { listSearchObj } from './TxPage'

/* interface 선언 */
interface propsInterface {
  params:listSearchObj
  setParams:React.Dispatch<React.SetStateAction<listSearchObj>>,
  fn:() => void,
}

const TxSearchCondition = (props:propsInterface) => {
  
  const { params, setParams, fn } = props;
   
  // 조회조건 세팅
  const handleSearchChange = ( event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> ) => {  
    const { name, value } = event.target;
    setParams((prev) => ({ ...prev, [name]: value }));
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') fn()
  }

  return (    
    <Box className='sch-filter-box'>
      <div className='filter-form'>
        <div className='form-group'>
          <CustomFormLabel
            className='input-label-display'
            htmlFor='sch-ctpvCd'
            required
          >
            시도명
          </CustomFormLabel>
          <CtpvSelect
            pValue={params.ctpvCd}
            handleChange={handleSearchChange}
            htmlFor='sch-ctpvCd'
          />
        </div>
        <div className='form-group'>
          <CustomFormLabel
            className='input-label-display'
            htmlFor='sch-locgovCd'
            required
          >
            관할관청
          </CustomFormLabel>
          <LocgovSelect
            ctpvCd={params.ctpvCd}
            pValue={params.locgovCd}
            handleChange={handleSearchChange}
            htmlFor='sch-locgovCd'
          />
        </div>
        <div className='form-group'>
          <CustomFormLabel
            className='input-label-display'
            htmlFor='sch-vhclNo'
          >
            차량번호
          </CustomFormLabel>
          <CustomTextField
            name='vhclNo'
            value={params.vhclNo}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            id='sch-vhclNo'
            fullWidth
          />
        </div>
        <div className='form-group'>
          <CustomFormLabel
            className='input-label-display'
            htmlFor='sch-vonrNm'
          >
            소유자명
          </CustomFormLabel>
          <CustomTextField
            name='vonrNm'
            value={params.vonrNm}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            id='sch-vonrNm'
            fullWidth
          />
        </div>
      </div>
      <hr></hr>
      <div className='filter-form'>
        <div className='form-group'>
          <CustomFormLabel className='input-label-display'>
            등록기간
          </CustomFormLabel>
          <CustomFormLabel
            className='input-label-none'
            htmlFor='sch-strFromYM'
          >
            등록기간 시작일
          </CustomFormLabel>
          <CustomTextField
            type='month'
            name='strFromYM'
            value={params.strFromYM}
            onChange={handleSearchChange}
            id='sch-strFromYM'
            fullWidth
          />
          ~
          <CustomFormLabel
            className='input-label-none'
            htmlFor="sch-strToYM"
          >
            등록기간 종료일
          </CustomFormLabel>
          <CustomTextField
            type='month'
            name='strToYM'
            value={params.strToYM}
            onChange={handleSearchChange}
            id='sch-strToYM'
            fullWidth
          />
        </div>
        <div className='form-group'>
          <CustomFormLabel
            className='input-label-display'
            htmlFor="sch-instcSpldmdTypeCd"
          >
            부정수급유형
          </CustomFormLabel>
          <CommSelect
            cdGroupNm={'363'}
            pName='instcSpldmdTypeCd'
            pValue={params.instcSpldmdTypeCd}
            handleChange={handleSearchChange}
            addText='전체'
            htmlFor={'sch-instcSpldmdTypeCd'}
          />
        </div>
      </div>
      <hr></hr>
      <div className='filter-form'>
        <div className='form-group'>
          <CustomFormLabel
            className='input-label-display'
            htmlFor="sch-admdspSeCd"
          >
            행정처분유형
          </CustomFormLabel>
          <CommSelect
            cdGroupNm={'367'}
            pName='admdspSeCd'
            pValue={params.admdspSeCd}
            handleChange={handleSearchChange}
            addText='전체'
            htmlFor={'sch-admdspSeCd'}
          />
        </div>
        <div className='form-group'>
          <CustomFormLabel
            className='input-label-display'
            htmlFor="sch-delYn"
          >
            삭제여부
          </CustomFormLabel>
          <CommSelect
            cdGroupNm={'030'}
            pName='delYn'
            pValue={params.delYn}
            handleChange={handleSearchChange}
            addText='전체'
            htmlFor={'sch-delYn'}
          />
        </div>
      </div>
    </Box>
  );
};

export default TxSearchCondition

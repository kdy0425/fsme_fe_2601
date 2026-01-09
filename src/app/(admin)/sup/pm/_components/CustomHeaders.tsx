/* mui component */
import { TableHead, TableRow, TableCell, Box, InputBase, Button } from '@mui/material'

/* redux-toolkit */
import { useDispatch, useSelector } from 'react-redux'
import { AppState } from '@/store/store'
import { rateObjType, buttons, handleSetCreateRate, handleIsChage } from '@/store/popup/PrdvMngSlice'

/* 공통js */
import { isNumber } from '@/utils/fsms/common/comm'

/* prdvJs */
import { handleClick } from '../prdvJs'
import { ReactNode } from 'react'

const dateChange = (date: string): string => {
  const year = date.substring(2, 4)
  const month = Number(date.substring(4, 6))
  return year + '.' + month + '월'
}

const CustomTextField = ({ propName }: { propName: keyof rateObjType }): ReactNode => {

  // redux-toolkit
  const { createRateObj } = useSelector((state: AppState) => state.PrdvMng)
  const dispatch = useDispatch()

  // 숫자일경우만 세팅
  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    if (isNumber(e.target.value)) {
      dispatch(handleSetCreateRate({ name: propName, value: Number(e.target.value).toString() }))
      // 비율이 수정될경우 수정변동여부 세팅
      dispatch(handleIsChage({ name: 'rateIsChange', value: true }))
    }
  }

  return (
    <Box>
      <InputBase
        name={propName}
        value={createRateObj[propName]}
        type='text'
        onChange={(e) => handleOnChange(e)}
        sx={{
          width: '60px',
          height: '25px',
          border: '1px solid',
          backgroundColor: '#fff',
          borderRadius: 0.7,
        }}
        inputProps={{ maxLength: 3 }}
      />
      <span style={{ fontSize: 13, paddingLeft: 3 }}>
        %
      </span>
    </Box>
  )
}

const CustomButton = ({ propName }: { propName: buttons }): ReactNode => {

  const buttonName = propName === 'hcfhNeedRate' ? '등록하기' : propName === 'ajmtPrdvRate' ? '계산하기' : '불러오기'

  return (
    <Box>
      <Button
        variant='contained'
        color='primary'
        onClick={() => handleClick(propName)}
        sx={{ mt: 1 }}
      >
        {buttonName}
      </Button>
    </Box>
  )
}

// 하반기 커스텀 헤더
export const SecondHalfHeader = (type: 'view' | 'create'): ReactNode => {

  const { viewImplDateObj, viewRateObj } = useSelector((state: AppState) => state.PrdvMng)

  return (
    <TableHead>
      <TableRow>
        <TableCell style={{ whiteSpace: 'nowrap' }} rowSpan={2}>
          시군별
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} colSpan={4}>
          기지급액
          {type === 'view' ? (
            <>({dateChange(viewImplDateObj.implBgngYm)} ~ {dateChange(viewImplDateObj.implEndYm)})</>
          ) : null}
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} colSpan={4}>
          향후 지급예상액
          {type === 'view' ? (
            <>({dateChange(viewImplDateObj.implBgngYm)} ~ {dateChange(viewImplDateObj.implEndYm)})</>
          ) : null}
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} rowSpan={2}>
          기존 안분율<br />
          {type === 'view' ? (
            <>{`(${viewRateObj.prdvRate}%)`}</>
          ) : (
            <>
              <CustomTextField propName='prdvRate' />
              <CustomButton propName='prdvRate' />
            </>
          )}
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} rowSpan={2}>
          최근 4년간 집행실적<br />
          {type === 'view' ? (
            <>{`(${viewRateObj.rcntImplPrfmnc}%)`}</>
          ) : (
            <>
              <CustomTextField propName='rcntImplPrfmnc' />
              <CustomButton propName='rcntImplPrfmnc' />
            </>
          )}
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} rowSpan={2}>
          상반기 집행률<br />
          {type === 'view' ? (
            <>{`(${viewRateObj.frstHalfImplRate}%)`}</>
          ) : (
            <>
              <CustomTextField propName='frstHalfImplRate' />
              <CustomButton propName='frstHalfImplRate' />
            </>
          )}
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} rowSpan={2}>
          향후 요구율<br />
          {type === 'view' ? (
            <>{`(${viewRateObj.hcfhNeedRate}%)`}</>
          ) : (
            <>
              <CustomTextField propName='hcfhNeedRate' />
              <CustomButton propName='hcfhNeedRate' />
            </>
          )}
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} rowSpan={2}>
          조정안분율
          {type === 'create' ? (
            <CustomButton propName='ajmtPrdvRate' />
          ) : null}
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} rowSpan={2}>
          안분율 증감
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ whiteSpace: 'nowrap' }}>계</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>버스</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>택시</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>화물</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>계</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>버스</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>택시</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>화물</TableCell>
      </TableRow>
    </TableHead>
  )
}

// 상반기 커스텀 헤더
export const FirstHalfHeader = (type: 'view' | 'create'): ReactNode => {

  const { viewImplDateObj, viewRateObj } = useSelector((state: AppState) => state.PrdvMng)

  return (
    <TableHead>
      <TableRow>
        <TableCell style={{ whiteSpace: 'nowrap' }} rowSpan={2}>
          시군별
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} colSpan={4}>
          향후 지급예상액
          {type === 'view' ? (
            <>({dateChange(viewImplDateObj.implBgngYm)} ~ {dateChange(viewImplDateObj.implEndYm)})</>
          ) : null}
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} rowSpan={2}>
          기존 안분율<br />
          {type === 'view' ? (
            <>{`(${viewRateObj.prdvRate}%)`}</>
          ) : (
            <>
              <CustomTextField propName='prdvRate' />
              <CustomButton propName='prdvRate' />
            </>
          )}
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} rowSpan={2}>
          최근 4년간 집행실적<br />
          {type === 'view' ? (
            <>{`(${viewRateObj.rcntImplPrfmnc}%)`}</>
          ) : (
            <>
              <CustomTextField propName='rcntImplPrfmnc' />
              <CustomButton propName='rcntImplPrfmnc' />
            </>
          )}
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} rowSpan={2}>
          향후 요구율<br />
          {type === 'view' ? (
            <>{`(${viewRateObj.hcfhNeedRate}%)`}</>
          ) : (
            <>
              <CustomTextField propName='hcfhNeedRate' />
              <CustomButton propName='hcfhNeedRate' />
            </>
          )}
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} rowSpan={2}>
          조정안분율
          {type === 'create' ? (
            <CustomButton propName='ajmtPrdvRate' />
          ) : null}
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} rowSpan={2}>
          안분율 증감
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ whiteSpace: 'nowrap' }}>계</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>버스</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>택시</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>화물</TableCell>
      </TableRow>
    </TableHead>
  )
}

// 최근 4년간 집행실적 커스텀 헤더
export const RcntImplPrfmncHeader = (): ReactNode => {
  const year = (new Date).getFullYear()
  return (
    <TableHead>
      <TableRow>
        <TableCell style={{ whiteSpace: 'nowrap' }} rowSpan={2}>시군별</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>{`${year - 4}년`}</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>{`${year - 3}년`}</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>{`${year - 2}년`}</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>{`${year - 1}년`}</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>누계</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} rowSpan={2}>4년간 집행률</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ whiteSpace: 'nowrap' }}>집행액</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>집행액</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>집행액</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>집행액</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>집행액</TableCell>
      </TableRow>
    </TableHead>
  )
}

// 송금액 및 집행실적 커스텀 헤더
export const RmtAmtHeader = (year: number): ReactNode => {
  return (
    <TableHead>
      <TableRow>
        <TableCell style={{ whiteSpace: 'nowrap' }} rowSpan={2}>시군별</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} colSpan={2}>{`${year - 4}년`}</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} colSpan={2}>{`${year - 3}년`}</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} colSpan={2}>{`${year - 2}년`}</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} colSpan={2}>{`${year - 1}년`}</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} colSpan={3}>누계</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} rowSpan={2}>4년간 집행률</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ whiteSpace: 'nowrap' }}>송금액</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>집행액</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>송금액</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>집행액</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>송금액</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>집행액</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>송금액</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>집행액</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>송금액</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>집행액</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>차액</TableCell>
      </TableRow>
    </TableHead>
  )
}
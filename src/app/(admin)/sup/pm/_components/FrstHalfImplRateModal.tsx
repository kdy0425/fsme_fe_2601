/* React */
import React, { useCallback, useEffect, useState } from 'react'

/* mui component */
import { Box, Button, Dialog, DialogContent } from '@mui/material'
import { CustomTextField, CustomFormLabel } from '@/utils/fsms/fsm/mui-imports'

/* 공통 component */
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

/* 공통js */
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { toQueryParameter } from '@/utils/fsms/utils'
import _ from 'lodash'

/* redux-toolkit */
import { useDispatch, useSelector } from 'react-redux'
import { AppState } from '@/store/store'
import { handleRateModal, handleSetList, handleSetImplDate, implDateObjType, resultList } from '@/store/popup/PrdvMngSlice'

/* prdvJs */
import { excelPrecision, isSumLocgovCd } from '../prdvJs'

const FrstHalfImplRateModal = () => {

  // redux-toolkit
  const { frstHalfImplRateOpen } = useSelector((state: AppState) => state.PrdvMng)
  const dispatch = useDispatch()

  const [params, setParams] = useState<implDateObjType>({
    implBgngYm: '',
    implEndYm: '',
  })
  const [loadingBackdrop, setLoadingBackdrop] = useState<boolean>(false) // 저장시 로딩상태

  // 모달오픈시 날짜세팅
  useEffect(() => {
    if (frstHalfImplRateOpen) {
      const year = (new Date()).getFullYear()
      setParams({
        implBgngYm: `${year}-01`,
        implEndYm: `${year}-09`,
      })
    }
  }, [frstHalfImplRateOpen])

  // 등록
  const handleSelect = (): void => {
    if (!params.implBgngYm) {
      alert('시작년월을 입력해 주세요.')
    } else if (!params.implEndYm) {
      alert('종료년월을 입력해 주세요.')
    } else if (params.implBgngYm > params.implEndYm) {
      alert('시작년월이 종료년월보다 큽니다.')
    } else {
      fetchData()
    }
  }

  // 모달 close
  const handleClose = (): void => {
    dispatch(handleRateModal({ name: 'frstHalfImplRateOpen', open: false }))
  }

  // 검색조건 변경
  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = event.target
    setParams((prev) => ({ ...prev, [name]: value }))
  }, [])

  // 상반기 집행률 리스트 조회
  const fetchData = async (): Promise<void> => {

    try {

      setLoadingBackdrop(true)

      const searchObj: implDateObjType = {
        implBgngYm: params.implBgngYm.replaceAll('-', ''),
        implEndYm: params.implEndYm.replaceAll('-', ''),
      }
      const endpoint = '/fsm/sup/pm/cm/getFrstHalfImplRateList' + toQueryParameter(searchObj)
      const response = await sendHttpRequest('GET', endpoint, null, true, { cache: 'no-store' })

      if (response && response.resultType === 'success' && response.data) {
        const temp: resultList[] = _.cloneDeep(response.data)
        // 누계 집행액
        const total = temp[0].totExsGiveAmt
        temp.map(item => {
          // 비율 계산
          const rate = item.totExsGiveAmt / total
          item.dbFrstHalfImplRate = excelPrecision(rate)
          if (isSumLocgovCd(item.locgovCd)) {
            item.backgroundColor = 'lightgrey'
            item.frstHalfImplRate = (rate * 100).toFixed(2)
          } else {
            item.frstHalfImplRate = (rate * 100).toFixed(5)
          }
        })
        // 리스트 세팅
        dispatch(handleSetList({ name: 'frstHalfImplRateList', list: temp }))
        // 집행일자세팅   
        dispatch(handleSetImplDate({
          name: 'create',
          value: searchObj,
        }))
        handleClose()
      } else {
        alert(response.message)
      }
    } catch (error) {
      console.log('fetchData error : ' + error)
    } finally {
      setLoadingBackdrop(false)
    }
  }

  return (
    <Box>
      <Dialog
        fullWidth={true}
        maxWidth={'sm'}
        open={frstHalfImplRateOpen}
      >
        <DialogContent>
          <Box className='table-bottom-button-group'>
            <CustomFormLabel className='input-label-display'>
              <h2 className='popup-title'>
                상반기 집행률 등록
              </h2>
            </CustomFormLabel>
            <div className='button-right-align'>
              <Button
                variant='contained'
                color='primary'
                onClick={handleSelect}
              >
                등록
              </Button>
              <Button
                variant='contained'
                color='dark'
                onClick={handleClose}
              >
                닫기
              </Button>
            </div>
          </Box>
          <Box className='sch-filter-box'>
            <div className='filter-form'>
              <div className='form-group'>
                <CustomFormLabel className='input-label-display' required>
                  기간
                </CustomFormLabel>
                <CustomFormLabel
                  className='input-label-none'
                  htmlFor='ft-date-start'
                >
                  기간 시작년월
                </CustomFormLabel>
                <CustomTextField
                  type='month'
                  id='ft-date-start'
                  name='implBgngYm'
                  value={params.implBgngYm}
                  onChange={handleSearchChange}
                  fullWidth
                />
                ~
                <CustomFormLabel
                  className='input-label-none'
                  htmlFor='ft-date-end'
                >
                  기간 종료년월
                </CustomFormLabel>
                <CustomTextField
                  type='month'
                  id='ft-date-end'
                  name='implEndYm'
                  value={params.implEndYm}
                  onChange={handleSearchChange}
                  fullWidth
                />
              </div>
            </div>
          </Box>

          {/* 로딩 */}
          {loadingBackdrop && (
            <LoadingBackdrop open={loadingBackdrop} />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default FrstHalfImplRateModal
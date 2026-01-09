/* React */
import React, { useEffect, useState } from 'react'

/* mui component */
import { Box, Button, Dialog, DialogContent } from '@mui/material'
import { CustomFormLabel, CustomTextField } from '@/utils/fsms/fsm/mui-imports'

/* 공통 component */
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { CommSelect } from '@/app/components/tx/commSelect/CommSelect'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

/* 공통js */
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { isNumber, getDateRange } from '@/utils/fsms/common/comm'
import _ from 'lodash'

/* _components */
import { FirstHalfHeader, SecondHalfHeader } from './CustomHeaders'
import RcntImplPrfmncModal from './RcntImplPrfmncModal'
import FrstHalfImplRateModal from './FrstHalfImplRateModal'
import HcfhNeedRateModal from './HcfhNeedRateModal'

/* redux-toolkit */
import { useDispatch, useSelector } from 'react-redux'
import { AppState } from '@/store/store'
import { setPrdvYearData, handleSetCreateRate, handleCreateModalClose, handleSetPrdvRows, prdvRow, handleLoadingBackdrop, handleIsChage } from '@/store/popup/PrdvMngSlice'

/* prdvJs */
import { useCustomRateHook, isSumLocgovCd, getHeadCell } from '../prdvJs'

const CreateModal = ({ reload }: { reload: () => void }) => {

  // redux-toolkit
  const {
    createModalOpen,
    loadingBackdrop,
    rcntImplPrfmncOpen,
    frstHalfImplRateOpen,
    hcfhNeedRateOpen,
    prdvRows,
    changeObj,
    prdvYearData,
    createRateObj,
    createImplDateObj,
  } = useSelector((state: AppState) => state.PrdvMng)
  const dispatch = useDispatch()

  const [loading, setLoading] = useState<boolean>(false)

  // 모달오픈시 저장로우 set 및 년도 세팅
  useEffect(() => {
    if (createModalOpen) {
      fetchData()
      const dateRange = getDateRange('y', 1)
      dispatch(setPrdvYearData({
        ...prdvYearData,
        crtrYear: dateRange.endDate,
      }))
    }
  }, [createModalOpen])

  // 반기가 바뀔떄마다 각 비율 조정
  useEffect(() => {
    if (prdvYearData.halfYear === '1') {
      dispatch(handleSetCreateRate({ name: 'prdvRate', value: '30' }))
      dispatch(handleSetCreateRate({ name: 'rcntImplPrfmnc', value: '30' }))
      dispatch(handleSetCreateRate({ name: 'frstHalfImplRate', value: '0' }))
      dispatch(handleSetCreateRate({ name: 'hcfhNeedRate', value: '40' }))
    } else {
      dispatch(handleSetCreateRate({ name: 'prdvRate', value: '30' }))
      dispatch(handleSetCreateRate({ name: 'rcntImplPrfmnc', value: '30' }))
      dispatch(handleSetCreateRate({ name: 'frstHalfImplRate', value: '30' }))
      dispatch(handleSetCreateRate({ name: 'hcfhNeedRate', value: '10' }))
    }
    // 반기가 바뀔때마다 반기 변동여부 세팅
    dispatch(handleIsChage({ name: 'halfYearIsChange', value: true }))
  }, [prdvYearData.halfYear])

  // 기존안분율 불러오기시
  useCustomRateHook('prdvRateList')

  // 최근4년 집행실적 불러오기시
  useCustomRateHook('rcntImplPrfmncList')

  // 상반기 집행률 불러오기시
  useCustomRateHook('frstHalfImplRateList')

  // 향후 요구율 불러오기시
  useCustomRateHook('hcfhNeedRateList')

  // 모달 close
  const handleClose = (): void => {
    dispatch(handleCreateModalClose())
  }

  // 등록 틀 조회
  const fetchData = async (): Promise<void> => {

    try {

      setLoading(true)

      const endpoint = '/fsm/sup/pm/cm/getCreateBaseRow'
      const response = await sendHttpRequest('GET', endpoint, null, true, { cache: 'no-store' })

      if (response && response.resultType === 'success' && response.data) {
        const temp: prdvRow[] = response.data
        temp.map(item => {
          if (isSumLocgovCd(item.locgovCd)) {
            item.backgroundColor = 'lightgrey'
          }
        })
        dispatch(handleSetPrdvRows(temp))
      } else {
        alert('관리자에게 문의 부탁드립니다.')
      }
    } catch (error) {
      console.log('fetchData error : ' + error)
    } finally {
      setLoading(false)
    }
  }

  // 검색조건 변경
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = event.target
    // 년도 입력시
    if (name === 'crtrYear') {
      if (isNumber(value)) {
        dispatch(setPrdvYearData({ ...prdvYearData, crtrYear: value }))
      }
    } else {
      dispatch(setPrdvYearData({ ...prdvYearData, halfYear: value }))
    }
  }

  const saveValidation = (): boolean => {
    if (changeObj.rateIsChange) {
      alert('비율이 수정되었습니다.\n조정안분율을 재계산 해주세요.')
    } else if (changeObj.halfYearIsChange) {
      alert('반기구분이 수정되었습니다.\n조정안분율을 재계산 해주세요.')
    } else {
      return true
    }
    return false
  }

  // 저장
  const saveData = async (): Promise<void> => {

    if (saveValidation()) {

      if (confirm('저장 하시겠습니까?')) {

        try {

          dispatch(handleLoadingBackdrop(true))

          const temp = _.cloneDeep(prdvRows)
          const saveList = temp.filter(item => item.locgovCd !== '00000')
          saveList.map(item => {
            item.prdvRate = item.dbPrdvRate
            item.rcntImplPrfmnc = item.dbRcntImplPrfmnc
            item.hcfhNeedRate = item.dbHcfhNeedRate
            item.ajmtPrdvRate = item.dbAjmtPrdvRate
            item.prdvRateIcdc = item.dbPrdvRateIcdc
            // 상반기일경우 기지급금액, 상반기 집행률 세팅
            if (prdvYearData.halfYear !== '1') {
              item.frstHalfImplRate = item.dbFrstHalfImplRate
            }
          })

          const body = {
            crtrYear: prdvYearData.crtrYear,
            halfYear: prdvYearData.halfYear,
            prdvRate: createRateObj.prdvRate,
            rcntImplPrfmnc: createRateObj.rcntImplPrfmnc,
            frstHalfImplRate: createRateObj.frstHalfImplRate,
            hcfhNeedRate: createRateObj.hcfhNeedRate,
            // 상반기일 경우 상반기 집행일자 저장하지 않음
            implBgngYm: prdvYearData.halfYear === '1' ? '' : createImplDateObj.implBgngYm,
            implEndYm: prdvYearData.halfYear === '1' ? '' : createImplDateObj.implEndYm,
            saveList: saveList,
          }
          const endpoint = '/fsm/sup/pm/cm/saveData'
          const response = await sendHttpRequest('POST', endpoint, body, true, { cache: 'no-store' })

          if (response && response.resultType === 'success') {
            alert('등록 되었습니다.')
            handleClose()
            reload()
          } else {
            alert(response.message)
          }
        } catch (error) {
          console.log('fetchData error : ' + error)
        } finally {
          dispatch(handleLoadingBackdrop(false))
        }
      }
    }
  }

  return (
    <Box>
      <Dialog
        fullWidth={true}
        maxWidth={'xl'}
        open={createModalOpen}
      >
        <DialogContent>
          <Box className='table-bottom-button-group'>
            <CustomFormLabel className='input-label-display'>
              <h2 className='popup-title'>
                안분등록
              </h2>
            </CustomFormLabel>

            <div className='button-right-align'>
              <Button
                variant='contained'
                color='primary'
                onClick={saveData}
              >
                저장
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
                <CustomFormLabel
                  className='input-label-display'
                  required
                >
                  년도
                </CustomFormLabel>
                <CustomTextField
                  type='year'
                  id='ft-date-start'
                  name='crtrYear'
                  value={prdvYearData.crtrYear}
                  onChange={handleSearchChange}
                  inputProps={{
                    maxLength: 4,
                  }}
                />
                <CustomFormLabel
                  className='input-label-display'
                  required
                  htmlFor='sch-halfYear'
                >
                  반기
                </CustomFormLabel>
                <CommSelect
                  cdGroupNm='PMHY'
                  pValue={prdvYearData.halfYear}
                  handleChange={handleSearchChange}
                  pName='halfYear'
                  htmlFor={'sch-halfYear'}
                />
              </div>
            </div>
          </Box>

          {/* 테이블영역 시작 */}
          {Array.isArray(prdvRows) && prdvRows.length ? (
            <Box mt={3}>
              <TableDataGrid
                headCells={getHeadCell(prdvYearData.halfYear)}
                rows={prdvRows}
                loading={loading}
                customHeader={() => prdvYearData.halfYear === '1' ? FirstHalfHeader('create') : SecondHalfHeader('create')}
              />
            </Box>
          ) : null}

          {/* 로딩 */}
          {loadingBackdrop && (
            <LoadingBackdrop open={loadingBackdrop} />
          )}

          {/* 최근 4년간 집행실적 */}
          {rcntImplPrfmncOpen && (
            <RcntImplPrfmncModal />
          )}

          {/* 상반기 집행률 */}
          {frstHalfImplRateOpen && (
            <FrstHalfImplRateModal />
          )}

          {/* 향후 요구율 */}
          {hcfhNeedRateOpen && (
            <HcfhNeedRateModal />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default CreateModal
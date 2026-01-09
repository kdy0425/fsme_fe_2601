/* redux-toolkit */
import {
  buttons,
  prdvActionsType,
  handleLoadingBackdrop,
  handleSetList,
  handleRateModal,
  handleSetPrdvRows,
  rateListType,
  handleIsChage,
  prdvRow,
  resultList,
} from '@/store/popup/PrdvMngSlice'
import { store } from '@/store/store'
import { initialStateType } from '@/store/popup/PrdvMngSlice'

/* 공통js */
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { toQueryParameter } from '@/utils/fsms/utils'
import _ from 'lodash'

/* type */
import { HeadCell } from 'table'
import { supPmDetailHC } from '@/utils/fsms/headCells'

/* react */
import { useEffect } from 'react'

// js에서 사용을 위해 선언
const useCustomSelector = (): initialStateType => {
  const state = store.getState()
  return state.PrdvMng
}

// js에서 사용을 위해 선언
const useCustomDispatch = (func: prdvActionsType): void => {
  store.dispatch(func)
}

// 등록 모달에서 비율아래버튼 클릭이벤트 처리
export const handleClick = (name: buttons): void => {
  if (name === 'prdvRate') {
    getPrevPrdvRateList()
  } else if (name === 'rcntImplPrfmnc' || name === 'frstHalfImplRate' || name === 'hcfhNeedRate') {
    useCustomDispatch(handleRateModal({ name: `${name}Open`, open: true }))
  } else {
    handleAjmtPrdvRateList()
  }
}

// 기존 안분율 불러오기
const getPrevPrdvRateList = async (): Promise<void> => {

  const { prdvYearData } = useCustomSelector()

  if (!prdvYearData.crtrYear.trim()) {
    alert('년도를 입력해 주세요.')
    return
  }

  if (prdvYearData.crtrYear.length !== 4) {
    alert('년도가 올바르지 않습니다.')
    return
  }

  useCustomDispatch(handleLoadingBackdrop(true))

  try {

    const endPoint = '/fsm/sup/pm/cm/getPrevPrdvRateList' + toQueryParameter(prdvYearData)
    const response = await sendHttpRequest('GET', endPoint, null, true, { cache: 'no-store' })

    if (response && response.resultType === 'success' && response.data) {
      if (Array.isArray(response.data.resultList) && response.data.resultList.length) {
        const temp: resultList[] = _.cloneDeep(response.data.resultList)
        temp.map(item => {
          item.dbPrdvRate = excelPrecision(Number(item.prdvRate)) // db값 넘어온 그대로 세팅, type : string
          item.prdvRate = (Number(item.prdvRate) * 100).toFixed(2)
        })
        useCustomDispatch(handleSetList({ name: 'prdvRateList', list: temp }))
        alert(`${response.data.crtrYear}년 ${response.data.halfYear} 안분율을 불러왔습니다.`)
      } else {
        throw new Error
      }
    } else {
      alert(response.message)
    }
  } catch (error) {
    console.log(error)
    alert('[error] 관리자에게 문의부탁드립니다')
  } finally {
    useCustomDispatch(handleLoadingBackdrop(false))
  }
}

// 분기별 헤드셀 리턴
export const getHeadCell = (halfYear: string): HeadCell[] => {
  // 반기구분이 상반기일경우 상반기집행률 및 기지금액 제거
  if (halfYear === '1') {
    return supPmDetailHC.filter(item =>
      item.id !== 'totExsGiveAmt' &&
      item.id !== 'bsExsGiveAmt' &&
      item.id !== 'txExsGiveAmt' &&
      item.id !== 'trExsGiveAmt' &&
      item.id !== 'frstHalfImplRate'
    )
  } else {
    return supPmDetailHC
  }
}

// 각 버튼 이벤트 처리이후 로우 세팅
export const useCustomRateHook = (name: rateListType): void => {

  const { prdvRows } = useCustomSelector()
  const list = useCustomSelector()[name]

  useEffect(() => {
    if (Array.isArray(list) && list.length) {
      const listMap = new Map(list.map(item => [item.locgovCd, item]))
      const copy = _.cloneDeep(prdvRows)
      copy.map(item => {
        if (listMap.has(item.locgovCd)) {
          const listData = listMap.get(item.locgovCd)
          if (listData) {
            if (name === 'prdvRateList') {
              item.dbPrdvRate = listData.dbPrdvRate
              item.prdvRate = listData.prdvRate
            } else if (name === 'rcntImplPrfmncList') {
              item.rcntImplPrfmnc = listData.rcntImplPrfmnc
              item.dbRcntImplPrfmnc = listData.dbRcntImplPrfmnc
            } else if (name === 'frstHalfImplRateList') {
              item.totExsGiveAmt = listData.totExsGiveAmt
              item.bsExsGiveAmt = listData.bsExsGiveAmt
              item.txExsGiveAmt = listData.txExsGiveAmt
              item.trExsGiveAmt = listData.trExsGiveAmt
              item.frstHalfImplRate = listData.frstHalfImplRate
              item.dbFrstHalfImplRate = listData.dbFrstHalfImplRate
            } else if (name === 'hcfhNeedRateList') {
              item.totHcfhGiveExpcAmt = listData.totHcfhGiveExpcAmt
              item.bsHcfhGiveExpcAmt = listData.bsHcfhGiveExpcAmt
              item.txHcfhGiveExpcAmt = listData.txHcfhGiveExpcAmt
              item.trHcfhGiveExpcAmt = listData.trHcfhGiveExpcAmt
              item.hcfhNeedRate = listData.hcfhNeedRate
              item.dbHcfhNeedRate = listData.dbHcfhNeedRate
            }
          }
        }
      })
      useCustomDispatch(handleSetPrdvRows(copy))
    }
  }, [list])
}

// 조정안분율 계산시 값 검증
const createRateValidation = (): boolean => {
  const { createRateObj } = useCustomSelector()
  if (!createRateObj.prdvRate) {
    alert('기존 안분율의 비율을 입력해 주세요.')
  } else if (!createRateObj.rcntImplPrfmnc) {
    alert('최근 4년간 집행실적의 비율을 입력해 주세요.')
  } else if (!createRateObj.frstHalfImplRate) {
    alert('상반기 집행률의 비율을 입력해 주세요.')
  } else if (!createRateObj.hcfhNeedRate) {
    alert('향후 요구율의 비율을 입력해 주세요.')
  } else if (Number(createRateObj.prdvRate) + Number(createRateObj.rcntImplPrfmnc) + Number(createRateObj.frstHalfImplRate) + Number(createRateObj.hcfhNeedRate) !== 100) {
    alert('비율의 합이 100% 가 아닙니다.')
  } else {
    return true
  }
  return false
}

// 조정안분율 & 안분율증감 계산하기
const handleAjmtPrdvRateList = (): void => {
  const { prdvRows } = useCustomSelector()
  if (createRateValidation()) {
    // 조정안분율 계산시 비율 및 반기 변동여부 false로 설정하여 저장 벨리데이션 통과
    useCustomDispatch(handleIsChage({ name: 'rateIsChange', value: false }))
    useCustomDispatch(handleIsChage({ name: 'halfYearIsChange', value: false }))
    const temp = _.cloneDeep(prdvRows)
    // 비율 계산
    temp.map(item => {
      // 조정안분률      
      const ajmtPrdvRate = getAjmtPrdvRate(item)
      item.dbAjmtPrdvRate = excelPrecision(ajmtPrdvRate)
      item.ajmtPrdvRate = (ajmtPrdvRate * 100).toFixed(5)
      // 안분률증감
      const prdvRateIcdc = ajmtPrdvRate - Number(item.dbPrdvRate)
      item.dbPrdvRateIcdc = excelPrecision(prdvRateIcdc)
      item.prdvRateIcdc = prdvRateIcdc.toFixed(7)
    })
    // 안분율 증감의 첫 총계 행은 합계가 아닌 하이픈으로 표시
    temp[0].prdvRateIcdc = '-'
    useCustomDispatch(handleSetPrdvRows(temp))
  }
}

/**
 * 로우별 조정안분율 계산
 * 각 총계의 비율 * 각 설정한 % 값
 */
const getAjmtPrdvRate = (item: prdvRow): number => {
  const { createRateObj, prdvYearData } = useCustomSelector()

  let result = 0
  const prdvRate = Number(item.dbPrdvRate) * Number(createRateObj['prdvRate']) * 0.01
  const rcntImplPrfmnc = Number(item.dbRcntImplPrfmnc) * Number(createRateObj['rcntImplPrfmnc']) * 0.01
  const frstHalfImplRate = Number(item.dbFrstHalfImplRate) * Number(createRateObj['frstHalfImplRate']) * 0.01
  const hcfhNeedRate = Number(item.dbHcfhNeedRate) * Number(createRateObj['hcfhNeedRate']) * 0.01

  // 조정안분율 계산시 상반기를 선택했을경우 상반기 집행률은 계산하지 않도록 함
  if (prdvYearData.halfYear === '1') {
    result = prdvRate + rcntImplPrfmnc + hcfhNeedRate
  } else {
    result = prdvRate + rcntImplPrfmnc + frstHalfImplRate + hcfhNeedRate
  }

  return result
}

// 합계 지자체인지 판별
export const isSumLocgovCd = (locgovCd: string): boolean => {
  const lastCd = locgovCd.substring(2, 5)
  return lastCd === '000' ? true : false
}

// 엑셀과 동일한 유효소수 계산
export const excelPrecision = (value: number | string): string => {
  const numValue = Number(value)
  const result = numValue.toPrecision(15)
  return result.replace(/\.?0+$/, '')
}
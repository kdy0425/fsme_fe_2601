import { useCallback } from 'react'
import { SelectItem } from 'select'
import { dateToString, getDateFormatYMD } from './dateUtils'

export const getDateTimeString = (
  DtString: string,
  target?: 'date' | 'time' | 'mon',
) => {
  // yyyymmddhhmmss 형식을 yyyy-mm-dd / hh:mm:ss 형식으로 각각 반환함
  if (DtString && DtString.trim().length > 0) {
    if (DtString.length == 14) {
      let year = DtString.substring(0, 4)
      let month = DtString.substring(4, 6)
      let day = DtString.substring(6, 8)

      let hour = DtString.substring(8, 10)
      let minute = DtString.substring(10, 12)
      let seconds = DtString.substring(12, 14)

      let dateString = year + '-' + month + '-' + day
      let timeString = hour + ':' + minute + ':' + seconds

      return { dateString: dateString, timeString: timeString }
    } else if (target == 'mon') {
      let year = DtString.substring(0, 4)
      let month = DtString.substring(4, 6).padStart(2, '0')

      let dateString = year + '-' + month

      return { dateString: dateString, timeString: '' }
    } else if (target == 'date') {
      let year = DtString.substring(0, 4)
      let month = DtString.substring(4, 6)
      let day = DtString.substring(6, 8)

      let dateString = year + '-' + month + '-' + day

      return { dateString: dateString, timeString: '' }
    } else if (target == 'time') {
      let hour = DtString.substring(0, 2)
      let minute = DtString.substring(2, 4)
      let seconds = DtString.substring(4, 6)

      let timeString = hour + ':' + minute + ':' + seconds

      return { dateString: '', timeString: timeString }
    }
  } else {
    return { dateString: '', timeString: '' }
  }
}

export const dateTimeFormatter = (dateString: string) => {
  if (!dateString) return ''
  const paresedDate = getDateTimeString(dateString)

  return paresedDate?.dateString + '\n' + paresedDate?.timeString
}

// 사업자번호 "-" 삽입
export const brNoFormatter = (brNo: string) => {
  if (brNo && brNo.length == 10) {
    const brNo1 = brNo.substring(0, 3)
    const brNo2 = brNo.substring(3, 5)
    const brNo3 = brNo.substring(5, 10)

    return `${brNo1}-${brNo2}-${brNo3}`
  }
}

// 주민등록번호 "-" 삽입
export const rrNoFormatter = (rrNo: string) => {
  if (rrNo) {
    // '-'가 있을 경우 호환을 위해 제거
    rrNo = rrNo.replaceAll('-', '')

    const rrNo1 = rrNo.substring(0, 6)
    const rrNo2 = rrNo.substring(6, 13)

    return `${rrNo1}-${rrNo2}`
  }
}

// 카드번호 - 삽입
export const cardNoFormatter = (cardNo: string) => {
  if (cardNo && cardNo.length == 16) {
    const cardNo1 = cardNo.substring(0, 4)
    const cardNo2 = cardNo.substring(4, 8)
    const cardNo3 = cardNo.substring(8, 12)
    const cardNo4 = cardNo.substring(12, 16)

    return `${cardNo1}-${cardNo2}-${cardNo3}-${cardNo4}`
  }else if(cardNo && cardNo.length == 15){
    const cardNo1 = cardNo.substring(0, 4)
    const cardNo2 = cardNo.substring(4, 8)
    const cardNo3 = cardNo.substring(8, 12)
    const cardNo4 = cardNo.substring(12, 15)

    return `${cardNo1}-${cardNo2}-${cardNo3}-${cardNo4}`
  }
}

export const phoneNoFormatter = (phoneNo: string) => {
  if (phoneNo.length == 11) {
    return `${phoneNo.substring(0, 3)}-${phoneNo.substring(3, 7)}-${phoneNo.substring(7, 11)}`
  } else if (phoneNo.length == 10) {
    return `${phoneNo.substring(0, 3)}-${phoneNo.substring(3, 6)}-${phoneNo.substring(6, 10)}`
  }
}

export const telnoFormatter = (value?: string) => {
  if (!value) {
    return ''
  }
  value.replaceAll('-', '')

  value = value.replace(/[^0-9]/g, '')

  let result = []
  let restNumber = ''

  // 지역번호와 나머지 번호로 나누기
  if (value.startsWith('02')) {
    // 서울 02 지역번호
    result.push(value.substr(0, 2))
    restNumber = value.substring(2)
  } else if (value.startsWith('1')) {
    // 지역 번호가 없는 경우
    // 1xxx-yyyy
    restNumber = value
  } else {
    // 나머지 3자리 지역번호
    // 0xx-yyyy-zzzz
    result.push(value.substr(0, 3))
    restNumber = value.substring(3)
  }

  if (restNumber.length === 7) {
    // 7자리만 남았을 때는 xxx-yyyy
    result.push(restNumber.substring(0, 3))
    result.push(restNumber.substring(3))
  } else {
    result.push(restNumber.substring(0, 4))
    result.push(restNumber.substring(4))
  }

  return result.filter((val) => val).join('-')
}

export const getDateRange = (
  format: 'date' | 'month',
  // days: 30 | 60 | 90 | 180 | 365,
  days: number,
) => {
  // 기본 검색 날짜 범위 설정 (30일)
  const today = new Date()
  const beforeDate = new Date()

  if (format === 'date') {
    beforeDate.setDate(today.getDate() - days)
  } else if (format === 'month') {
    beforeDate.setMonth(today.getMonth() - days / 30)
  }

  let stYear: string = String(beforeDate.getFullYear())
  let stMonth: string = String(beforeDate.getMonth() + 1).padStart(2, '0')
  let stDate: string = String(beforeDate.getDate()).padStart(2, '0')
  let edYear = String(today.getFullYear())
  let edMonth = String(today.getMonth() + 1).padStart(2, '0')
  let edDate = String(today.getDate()).padStart(2, '0')

  let startDate: string = ''
  let endDate: string = ''

  if (format === 'date') {
    startDate = stYear + '-' + stMonth + '-' + stDate
    endDate = edYear + '-' + edMonth + '-' + edDate
  } else if (format === 'month') {
    startDate = stYear + '-' + stMonth
    endDate = edYear + '-' + edMonth
  }

  return {
    startDate: startDate,
    endDate: endDate,
  }
}

export const getCommaNumber = (number: number | string) => {
  if (number === '-') {
    return '-'
  }
  return Number(number)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// 202406 -> 2024년 06월
export const formatKorYearMonth = (dateString: string | undefined): string => {
  if (undefined == dateString) {
    return ''
  }
  let result: string = dateString
  if (result.length !== 6) {
    return result
  }
  const year = dateString.slice(0, 4)
  const month = dateString.slice(4, 6)
  return `${year}년 ${month}월`
}

// 20240612 -> 2024-06-12
export const formatDay = (dateString: string | undefined): string => {
  if (undefined == dateString) {
    return ''
  }
  let result: string = dateString
  if (result.length !== 8) {
    return result
  }
  const year = dateString.slice(0, 4)
  const month = dateString.slice(4, 6)
  const day = dateString.slice(6, 8)
  return `${year}-${month}-${day}`
}

// 123050 -> 12:30:50
export const formatTm = (dateString: string | undefined): string => {
  if (undefined == dateString) {
    return ''
  }
  let result: string = dateString
  if (result.length !== 6) {
    return result
  }
  const hour = dateString.slice(0, 2)
  const min = dateString.slice(2, 4)
  const sec = dateString.slice(4, 6)
  return `${hour}:${min}:${sec}`
}

export const getCookie = (name: string) => {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) {
    return JSON.parse(decodeURIComponent(parts.pop()?.split(';').shift() || ''))
  }
  return null
}

export const setCookie = (name: string, value: object, days: number) => {
  const expires = new Date()
  expires.setDate(expires.getDate() + days)

  const jsonValue = JSON.stringify(value)

  document.cookie = `${name}=${encodeURIComponent(jsonValue)}; expires=${expires.toUTCString()}; path=/`
}

export const handleKeyDown = (
  event: React.KeyboardEvent<HTMLInputElement>,
  callbackFn: () => void,
) => {
  let { key } = event
  if (key === 'Enter') {
    callbackFn()
  }
}

export function diffDate(startDate: string, endDate: string, diff: number) {
  const start = new Date(startDate + "-01")
  const end = new Date(endDate + "-01")

  const yearDiff = end.getFullYear() - start.getFullYear()
  const monthDiff = end.getMonth() - start.getMonth()

  let differ = (yearDiff * 12) + monthDiff

  if (differ > diff) return false

  return true
}

export function diffYYYYMMDD(endDt:string, bgngDt:string, diff:number) {

  const vEndDt = endDt.replaceAll('-','');
  const vBgngDt = bgngDt.replaceAll('-','');

  if (diff <= 0) {
    alert('양수만 입력 가능합니다');
    return false;
  }

  const tempDate = new Date(getDateFormatYMD(vEndDt));      
  const dateDiff = dateToString(new Date(tempDate.setMonth(tempDate.getMonth() - diff)));

  if (dateDiff < vBgngDt) {
    return true;
  } else {
    alert(diff + '개월 초과 데이터는 조회가 불가능합니다.')
    return false;
  }
}
import { SelectItem } from 'select'

// 숫자, 문자를 입력받아서   천 단위 구분 기호(Thousands Separator)변환
export const getNumtoWon = (amount: string | number | undefined): string => {
  if (undefined == amount) {
    return ''
  }
  // 이미 숫자인 경우
  if (typeof amount === 'number') {
    return amount.toLocaleString('ko-KR')
  }
  const sanitizedAmount = amount.replace(/원/g, '').trim()
  // 문자열을 숫자로 변환
  const number = parseInt(sanitizedAmount.replace(/,/g, ''), 10)
  if (isNaN(number)) {
    return '' // 숫자가 아닌 경우 빈 문자열 반환
  }
  // 최종적으로 콤마를 포함한 문자열 반환
  return number.toLocaleString('ko-KR')
}

// 숫자 or 숫자문자열  -> 천 단위 구분 기호(Thousands Separator)변환 + 소수점
export const getNumtoWonAndDecimalPoint = (
  value: number | string | undefined,
): string => {
  if (value === undefined || value === null) {
    return ''
  }

  // 문자열로 변환 후 모든 쉼표 제거
  const cleanedValueStr =
    typeof value === 'string' ? value.replace(/,/g, '') : value.toString()

  // 숫자가 아닌 값이 포함되어 있으면 그대로 반환
  if (!/^\d+$/.test(cleanedValueStr)) {
    return typeof value === 'string' ? value : value.toString()
  }

  // 마지막 두 자리를 소수점 이하로 취급
  const integerPart = cleanedValueStr.slice(0, -2) || '0' // 정수 부분
  const decimalPart = cleanedValueStr.slice(-2).padEnd(2, '0') // 소수점 이하 두 자리

  // 정수 부분에 천 단위 구분 기호 추가
  const formattedInteger = parseInt(integerPart, 10).toLocaleString()

  // 최종 포맷팅
  return `${formattedInteger}.${decimalPart}`
}

// 처음에 SelectItem[]을 넣으면  ->  value를 받으면 label를 반환하는 함수를 반환해준다. 참고로 '' -> '' (빈 문자열은 빈문자열!)
export const getLabelFromCode =
  (data: SelectItem[]) =>
  (value: string): string => {
    if (value === '') return '' // 빈 문자열 그냥 리턴
    // SelectItem의 value와 일치하는 라벨을 찾으면 그 값을 리턴한다.
    const item = data.find((item: SelectItem) => item.value === value)
    return item ? item.label : ''
  }

export const formatDate = (dateStr: string | undefined): string => {
  if (
    dateStr?.trim() === '' ||
    dateStr == undefined ||
    dateStr.length === undefined
  )
    return '' // 빈 문자열 처리

  // YYYYMMDD~YYYYMMDD 또는 YYYYMMDD ~ YYYYMMDD -> YYYY-MM-DD ~ YYYY-MM-DD
  if (dateStr.includes('~')) {
    const [start, end] = dateStr.split('~').map((part) => part.trim())
    if (start.length === 8 && end.length === 8) {
      return `${start.slice(0, 4)}-${start.slice(4, 6)}-${start.slice(6)} ~ ${end.slice(0, 4)}-${end.slice(4, 6)}-${end.slice(6)}`
    }
  }

  if (dateStr.length === 8) {
    // YYYYMMDD -> YYYY-MM-DD
    return `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6)}`
  } else if (dateStr.length === 6) {
    // YYYYMM -> YYYY-MM
    return `${dateStr.slice(0, 4)}-${dateStr.slice(4)}`
  } else if (dateStr.length === 14) {
    // YYYYMMDDHHMMSS -> YYYY-MM-DD HH:MM:SS
    return (
      `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)} ` +
      `${dateStr.slice(8, 10)}:${dateStr.slice(10, 12)}:${dateStr.slice(12)}`
    )
  }

  // 알 수 없는 형식의 경우 그대로 반환
  return dateStr
}

// 2010-11-30 22:18:41.000 -> 2010-11-30
export const formatMinDate = (dateStr: string | undefined): string => {
  if (dateStr === '' || dateStr == undefined || dateStr.length === undefined)
    return '' // 빈 문자열 처리

  // 2010-11-30 22:18:41.000 -> 2010-11-30
  if (dateStr.length === 23) {
    return `${dateStr.slice(0, 10)}`
  }
  // 알 수 없는 형식의 경우 그대로 반환
  return dateStr
}

export const formatDateDecimal = (dateStr: string | undefined): string => {
  if (dateStr === '' || dateStr == undefined || dateStr.length === undefined)
    return '' // 빈 문자열 처리

  if (dateStr.length === 8) {
    // YYYYMMDD -> YYYY.MM.DD
    return `${dateStr.slice(0, 4)}.${dateStr.slice(4, 6)}.${dateStr.slice(6)}`
  }

  // 알 수 없는 형식의 경우 그대로 반환
  return dateStr
}

// 사업자 번호를 사업자번호 양식으로 바꿔준다.  1232512345 -> 123-25-12345
export const formBrno = (input: string | number | undefined): string => {
  if (undefined == input) {
    return ''
  }
  const str = String(input) // 입력값을 문자열로 변환
  if (/^\d{10}$/.test(str)) {
    return `${str.slice(0, 3)}-${str.slice(3, 5)}-${str.slice(5)}`
  }
  return str // 형식이 다르면 그대로 반환
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

//  123 -> 1.23    56456 -> 564.56
export const formatToTwoDecimalPlaces = (
  value: number | string | undefined,
): string => {
  if (value === undefined || value === null) {
    return ''
  }

  // 문자열로 변환 후 쉼표 제거
  const cleanedValueStr =
    typeof value === 'string' ? value.replace(/,/g, '') : value.toString()

  // 숫자 형식이 아닌 경우 그대로 반환
  if (
    isNaN(Number(cleanedValueStr)) ||
    !/^-?\d*\.?\d*$/.test(cleanedValueStr)
  ) {
    return typeof value === 'string' ? value : value.toString()
  }

  const numberValue = parseFloat(cleanedValueStr)

  // 세 자리 이상의 정수는 두 자리 소수점으로 변환
  if (Number.isInteger(numberValue) && numberValue >= 100) {
    return (numberValue / 100).toFixed(2)
  }

  // 소수점 이하 두 자리 이하로 입력된 경우 그대로 반환
  return numberValue.toFixed(2)
}

// 전화번호 형식으로 바꿔주는 함수 01077887788 ->  010-7788-7788
export function formatPhoneNumber(phoneNumber: string | undefined): string {
  if (phoneNumber === undefined || phoneNumber === null) {
    return ''
  }

  // 숫자만 남기기
  const cleanNumber = phoneNumber.replace(/\D/g, '')

  // 전화번호가 11자리인지 확인
  if (cleanNumber.length !== 11) {
    return phoneNumber
  }

  // Format the number
  const formatted = `${cleanNumber.slice(0, 3)}-${cleanNumber.slice(3, 7)}-${cleanNumber.slice(7)}`

  return formatted
}

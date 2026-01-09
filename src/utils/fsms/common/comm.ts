import { sendHttpRequest } from './apiUtils'
import { SelectItem } from 'select'
import axios from 'axios'
import { addDays, addMonths, addYears, format, lastDayOfMonth } from 'date-fns'
import { excelRsnModalOpen } from '@/app/app'
import { Menu } from '@/app/(admin)/layout/vertical/sidebar/SidebarItems' 
import { layoutKeyType } from './useTabHistory'
import { toQueryParameter } from '../utils'

export const getCtpvCd = async (ctpvCd?: string, first?: string) => {
  // 시도 조회

  let itemArr: SelectItem[] = []
  if (first) {
    let item: SelectItem = {
      label: first,
      value: '',
    }
    itemArr.push(item)
  }

  try {
    let endpoint: string =
      `/fsm/cmm/cmmn/cm/getAllLocgovCd?locgovSeCd=0` +
      `${ctpvCd ? '&ctpvCd=' + ctpvCd : ''}` +
      '&page=1&size=2000'

    const response = await sendHttpRequest('GET', endpoint, null, false)

    if (response && response.resultType === 'success' && response.data) {
      if (response.data.content) {
        response.data.content.map((code: any) => {
          let item: SelectItem = {
            label: code['ctpvNm'],
            value: code['ctpvCd'],
          }
          itemArr.push(item)
        })
      }
    }
  } catch (error) {
    console.error('Error get City Code data:', error)
  }
  return itemArr
}

export const getLocGovCd = async (
  ctpvCd?: string | number,
  locgovCd?: string,
  first?: string,
) => {
  // 관할관청 코드 조회

  let itemArr: SelectItem[] = []
  if (first) {
    let item: SelectItem = {
      label: first,
      value: '',
    }
    itemArr.push(item)
  }
  try {
    let endpoint: string =
      `/fsm/cmm/cmmn/cm/getAllLocgovCd?locgovSeCd=1` +
      `${ctpvCd ? '&ctpvCd=' + ctpvCd : ''}` +
      `${locgovCd ? '&locgovCd=' + locgovCd : ''}` +
      '&page=1&size=2000'

    const response = await sendHttpRequest('GET', endpoint, null, false)

    if (response && response.resultType === 'success' && response.data) {
      if (response.data.content) {
        response.data.content.map((code: any) => {
          let item: SelectItem = {
            label: code['locgovNm'],
            value: code['locgovCd'],
          }
          itemArr.push(item)
        })
      }
    }
  } catch (error) {
    console.error('Error get Local Gov Code data:', error)
  }
  return itemArr
}

export const getCommCd = async (cdGroupNm: string, first?: string) => {
  let itemArr: SelectItem[] = []
  if (first) {
    let item: SelectItem = {
      label: first,
      value: '',
    }
    itemArr.push(item)
  }
  try {
    let endpoint: string = `/fsm/cmm/cmmn/cm/getAllCmmnCd?cdGroupNm=${cdGroupNm}&page=1&size=2000`

    const response = await sendHttpRequest('GET', endpoint, null, false)

    if (response && response.resultType === 'success' && response.data) {
      if (response.data.content) {
        response.data.content.map((code: any) => {
          let item: SelectItem = {
            label: code['cdKornNm'],
            value: code['cdNm'],
          }
          itemArr.push(item)
        })
      }
    }
  } catch (error) {
    console.error('Error get Code Group Data: ', error)
  }
  return itemArr
}

// response.data.content에 요소들이 있는 경우가 있음
export const getCommCdContent = async (cdGroupNm: string, first?: string) => {
  let itemArr: SelectItem[] = []
  if (first) {
    let item: SelectItem = {
      label: first,
      value: '',
    }
    itemArr.push(item)
  }
  try {
    let endpoint: string = `/fsm/cmm/cmmn/cm/getAllCmmnCd?cdGroupNm=${cdGroupNm}&page=1&size=2000`

    const response = await sendHttpRequest('GET', endpoint, null, false)

    if (response && response.resultType === 'success' && response.data) {
      if (response.data.content) {
        response.data.content.map((code: any) => {
          let item: SelectItem = {
            label: code['cdKornNm'],
            value: code['cdNm'],
          }
          itemArr.push(item)
        })
      }
    }
  } catch (error) {
    console.error('Error get Code Group Data: ', error)
  }
  return itemArr
}

export const getYear = async (number: number, first?: string) => {
  let year = Number(new Date().getFullYear())
  let itemArr: SelectItem[] = []
  if (first) {
    let item: SelectItem = {
      label: first,
      value: '',
    }
    itemArr.push(item)
  }
  if (number > 0) {
    for (let i = year; i < year + number; i++) {
      let item: SelectItem = {
        label: i + '년',
        value: i + '',
      }
      itemArr.push(item)
    }
  } else {
    for (let i = year; i > year + number; i--) {
      let item: SelectItem = {
        label: i + '년',
        value: i + '',
      }
      itemArr.push(item)
    }
  }
  return itemArr
}

// 기본 검색 날짜 범위 설정
export const getDateRange = (se: string, diff: number) => {
  const today = new Date()
  const diffDate = new Date()
  if (se === 'd') {
    diffDate.setDate(today.getDate() - diff)
  } else if (se === 'm') {
    diffDate.setMonth(today.getMonth() - diff)
  } else if (se === 'sm') {
    diffDate.setMonth(today.getMonth() - diff)
  } else {
    diffDate.setFullYear(today.getFullYear() - diff)
  }

  let stYear: string = String(diffDate.getFullYear())
  let stMonth: string = String(diffDate.getMonth() + 1).padStart(2, '0')
  let stDate: string = String(diffDate.getDate()).padStart(2, '0')

  let edYear: string = String(today.getFullYear())
  let edMonth: string = String(today.getMonth() + 1).padStart(2, '0')
  let edDate: string = String(today.getDate()).padStart(2, '0')

  let startDate = stYear
  let endDate = edYear
  if (se === 'm') {
    startDate += '-' + stMonth
    endDate += '-' + edMonth
  } else if (se === 'd') {
    startDate += '-' + stMonth + '-' + stDate
    endDate += '-' + edMonth + '-' + edDate
  } else if (se === 'sm') {
    startDate += '-' + stMonth + '-' + '01'
    endDate += '-' + edMonth + '-' + edDate
  }

  return {
    startDate: startDate,
    endDate: endDate,
  }
}

// 오늘일자조회
export const getToday = () => {
  const today = new Date()
  return (
    today.getFullYear() +
    String(today.getMonth() + 1).padStart(2, '0') +
    String(today.getDate()).padStart(2, '0')
  )
}

export const getMonth = () => {
  const today = new Date()
  return today.getFullYear() + String(today.getMonth() + 1).padStart(2, '0')
}

export const getTomorrow = () => {
  const today = new Date()
  today.setDate(today.getDate() + 1) // 하루를 더해줍니다.

  return (
    today.getFullYear() +
    String(today.getMonth() + 1).padStart(2, '0') +
    String(today.getDate()).padStart(2, '0')
  )
}

export const getDateYYYYMMDD = (dateString: string) => {
  let year = dateString.substring(0, 4)
  let month = dateString.substring(4, 6)
  let day = dateString.substring(6, 8)

  return year + '-' + month + '-' + day
}

export const getDateYYYYMM = (dateString: string) => {
  let year = dateString.substring(0, 4)
  let month = dateString.substring(4, 6)

  return year + '-' + month
}

export const getFormatToday = () => {
  return getDateYYYYMMDD(getToday())
}

export const getFormatTomorrow = () => {
  return getDateYYYYMMDD(getTomorrow())
}

export const getFormatMonth = () => {
  return getDateYYYYMM(getMonth())
}

// 시작일과 종료일 비교
export const isValidDateRange = (
  changedField: string,
  changedValue: string,
  otherValue: string | undefined,
): boolean => {
  if (!otherValue) return true

  const changedDate = new Date(changedValue)
  const otherDate = new Date(otherValue)

  if (changedField === 'searchStDate') {
    return changedDate <= otherDate
  } else {
    return changedDate >= otherDate
  }
}

// 조건 검색 변환 매칭
export const sortChange = (sort: String): String => {
  if (sort && sort != '') {
    let [field, sortOrder] = sort.split(',') // field와 sortOrder 분리하여 매칭
    if (field === 'regYmd') field = 'regDt' // DB -> regDt // DTO -> regYmd ==> 매칭 작업
    return field + ',' + sortOrder
  }
  return ''
}

//엑셀다운로드
export const getExcelFile = async (endpoint: string, name: string) => {
  excelRsnModalOpen({ endpoint: endpoint, name: name })
}

//엑셀다운로드
export const getFileDown = async (url: string, name: string) => {
  try {
    const response = await axios({
      url: url,
      method: 'GET',
      responseType: 'blob',
    })

    const downloadUrl = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)
  } catch (error) {
    console.error('다운로드 실패:', error)
  }
}

// 전화번호 '-' 자동삽입 함수
export const telnoFormatter = (value: string) => {
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

// 입력받은 value가 숫자인지(허용하는 문자열이 있다면 해당문자열도)판별
export const isNumber = (value: string, allowChar?: string[]) => {
  let resultFlag: boolean = false

  const regex = /^[0-9]*$/ // 숫자만 체크
  resultFlag = regex.test(value)

  if (allowChar) {
    let tempRegExp = ''

    allowChar.map((item) => {
      tempRegExp = tempRegExp + item
    })

    tempRegExp = `^[0-9${tempRegExp}]*$`
    const regExp = new RegExp(tempRegExp, 'g')

    resultFlag = regExp.test(value)
  }

  return resultFlag
}

// 입력받은 value가 숫자인지(허용하는 문자열이 있다면 해당문자열도)판별
export const isNumberRequiredItems = (value: string, allowChar: string) => {
  const valiArr = ['', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']

  if (
    valiArr.includes(value.charAt(value.length - 1)) &&
    value.indexOf(allowChar) > 0
  ) {
    return true
  } else {
    return false
  }
}

// 파일 이름, URI에 한글이 포함되어 디코딩이 필요할 때 사용 가능
export const openReport = (crfName: string = '', crfData: string = '') => {
  const popup = window.open(
    `${process.env.NEXT_PUBLIC_API_DOMAIN}/ClipReport5/report.jsp`,
    'report',
    'width=900,height=700',
  )

  const form = document.createElement('form')
  form.method = 'POST'
  form.action = `${process.env.NEXT_PUBLIC_API_DOMAIN}/ClipReport5/report.jsp`
  form.target = 'report'

  const params: Record<string, string> = {
    crfName: crfName,
    crfData: crfData,
  }

  Object.keys(params).forEach((key) => {
    const input = document.createElement('input')
    input.type = 'hidden'
    input.name = key
    input.value = params[key] // 여기서 오류 해결
    form.appendChild(input)
  })
  document.body.appendChild(form)
  form.submit()
  document.body.removeChild(form)
}

export const getCheckUserBookmark = async (url: string) => {
  try {
    let endpoint: string =
      `/fsm/cmm/cmmn/cm/getUserCheckBookmark` +
      `${url ? '?urlAddr=' + url : ''}`

    const response = await sendHttpRequest('GET', endpoint, null, true)

    if (response && response.resultType === 'success' && response.data) {
      return response.data
    }
  } catch (error) {
    console.error('Error get Code Group Data: ', error)
  }
}

export const calYearsDate = (baseDate: Date, yearsToAdd: number) => {
  let calDate = addYears(baseDate, yearsToAdd)

  if (baseDate.getDate() === 1) {
    // 1일일때 월의 마지막날짜
    calDate = lastDayOfMonth(addMonths(calDate, -1))
  }

  return format(calDate, 'yyyy-MM-dd')
}

export const calMonthsDate = (baseDate: Date, monthsToAdd: number) => {
  let calDate = addMonths(baseDate, monthsToAdd)

  if (baseDate.getDate() === 1) {
    // 1일일때 월의 마지막날짜
    calDate = lastDayOfMonth(addMonths(calDate, -1))
  }

  return format(calDate, 'yyyy-MM-dd')
}

export const calDaysDate = (baseDate: Date, daysToAdd: number) => {
  return format(addDays(baseDate, daysToAdd), 'yyyy-MM-dd')
}

export const nowDate = () => {
  return format(new Date(), 'yyyy-MM-dd')
}
/*
  서버시간에 따른 편집기능 제어
  * 신규추가 가이드
  1. key = 각각 업무에 맞는 key값 이름부여 ( | card )
  2. 관리시간 추가 (cardIssueTime = '190000')
  3. dayoff 객체에 time, msg 정보 부여
  4. 호출하고자 하는 컴포넌트에서 사용
      if (!(await serverCheckTime('card'))) {
        return
      }
*/

type objType = {
  time: string
  msg: string
}

type key = 'dayoff'
//type key = 'dayoff' | 'card'

const dayoffTime = '190000' //오후 7시까지만 작업가능
//const cardIssueTime = '190000'

const editObj: Record<key, objType> = {
  dayoff: {
    time: dayoffTime,
    msg:
      '부제의 경우 매일 ' +
      dayoffTime.substring(0, 2) +
      ':' +
      dayoffTime.substring(2, 4) +
      ' 이후 전문작업으로 인해 작업이 불가능합니다\n 익일 작업 부탁드리겠습니다. 이용에 불편을 드려 죄송합니다.',
  },

  /*
  card: {
    time: '180000',
    msg: '카드발급 경우 매일 18 : 00시 이후 전문작업으로 인해 편집이 불가능합니다\n 익일 작업 부탁드리겠습니다. 이용에 불편을 드려 죄송합니다.',
  },
  */
}

export const serverCheckTime = async (key: key): Promise<boolean> => {
  let result = false

  try {
    const endpoint =
      '/fsm/stn/tdgm/tx/serverCheckTime?crtrYmd=' + editObj[key].time
    const response = await sendHttpRequest('GET', endpoint, null, true)

    if (response && response.resultType === 'success' && response.data) {
      if (response.data.rollYn === 'Y') {
        alert(editObj[key].msg)
      } else {
        result = true
      }
    } else {
      alert(
        '시스템에 문제가 발생했습니다. \n 재로그인 후 시도하거나 관리자에게 문의하세요.',
      )
    }
  } catch (error) {
    console.error('Error get Code Group Data: ', error)
  }

  return result
}

export const getMenuList = async (layoutKeyType: layoutKeyType): Promise<Menu[]> => {
  let result: Menu[] = []

  try {

    const endpoint = `/fsm/cmm/cmmn/cm/getUserMenuUrlList` + toQueryParameter({ sysSeCd: layoutKeyType })
    const response = await sendHttpRequest('GET', endpoint, null, true, { cache: 'no-store' })

    if (response && response.resultType === 'success' && response.data) {
      result = response.data
    }
  } catch (error) {
    console.error('Error fetching data:', error)
  }

  return result
}

// 영문 및 숫자만 허용
export const isAlphaNum = (s: string, isAllowSpace?: boolean): boolean => {
  // 공백허용시
  if (isAllowSpace) {
    return /^[A-Za-z0-9]*$/.test(s);
  } else {
    return /^[A-Za-z0-9]+$/.test(s);
  }  
}
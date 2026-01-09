declare module 'table' {
  // id : 속성명
  // numeric : 숫자여부
  // disablePadding : padding 삭제 여부
  // label : 테이블 컬럼명 th 값
  // sortAt : 정렬 기능 on / off
  export interface HeadCell {
    disablePadding: boolean
    id: any
    label: string
    numeric: boolean
    sortAt?: boolean
    format?: string
    align?: string
    color?: boolean
    rowspan?: boolean
    coupleRowspan?: string // 통계테이블에서 같이 동시에 rowspan 검증을 해야하는 컬럼의 ID를 명시한다.
    button?: CustomButtonProps
    groupHeader?: boolean | false
    groupId?: string
    style?: object
    isCol?: boolean
  }

  export type Pageable = {
    pageNumber: number
    pageSize: number
    sort: string
  }

  export type Pageable2 = {
    pageNumber: number //페이지번호
    pageSize: number //1페이지 row의 수
    totalPages: number //총 페이지 수
  }

  export interface ButtonProps {
    label: string
    color: string
    onClick: Function
  }
}

/* 검색조건 */
export interface listSearchObj {
    page:number
    size:number  
    vhclNo:string
}

/* 차량목록 */
export interface vhclRow {
  locgovNm:string  
  vhclNo:string
  rprsvNm?:string
  brno:string
  rprsvRrno?:string
  koiNm?:string
  dscntNm:string
  sttsNm:string
}

/* 수급자 변경이력 */
export interface flnmRow {
  regDt:string
  bzmnSeNm?:string
  flnm?:string
  brno?:string
  rrno?:string
}

/* 유종 변경이력 */
export interface koiRow {
  mdfcnDt:string
  koiNm?:string
}

/* 지급정지 등록이력 */
export interface stopRow {
  regDt?:string
  stopBgngYmd?:string
  stopEndYmd?:string
  vhclRestrtYmd?:string
  mdfcnDt?:string
}

/* 차량휴지 등록이력 */
export interface pauseRow {
  regDt:string
  pauseBgngYmd:string
  pauseEndYmd:string
  vhclRestrtYmd?:string
  mdfcnDt:string
}

/* 지자체 변경이력 */
export interface locgovRow {
  regYmd?:string
  exsLocgovNm:string
  chgLocgovNm:string
}

/* 차량말소 등록이력 */
export interface ersrRow {
  ersrYmd?:string
  brno:string
  koiNm?:string
  ersrRsnNm?:string
  locgovNm:string
}
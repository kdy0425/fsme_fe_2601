/* 공통 type, interface */
import { HeadCell } from 'table'

/* 차량목록 */
export const vhclHeadCells:HeadCell[] = [
  {
    id:'locgovNm',
    numeric:false,
    disablePadding:false,
    label:'지자체명',
  },
  {
    id:'vhclNo',
    numeric:false,
    disablePadding:false,
    label:'차량번호',
  },
  {
    id:'rprsvNm',
    numeric:false,
    disablePadding:false,
    label:'차주성명',
  },
  {
    id:'brno',
    numeric:false,
    disablePadding:false,
    label:'사업자번호',
    format:'brno'
  },
  {
    id:'rprsvRrno',
    numeric:false,
    disablePadding:false,
    label:'주민등록번호',
    format:'rrno'
  },	
  {
    id:'koiNm',
    numeric:false,
    disablePadding:false,
    label:'유종',
  },
  {
    id:'dscntNm',
    numeric:false,
    disablePadding:false,
    label:'할인상태',
  },
  {
    id:'sttsNm',
    numeric:false,
    disablePadding:false,
    label:'차량상태',
  },  
];

/* 수급자 변경이력 */
export const flnmHeadCells:HeadCell[] = [
  {
    id:'regDt',
    numeric:false,
    disablePadding:false,
    label:'변경일',
    format:'yyyymmdd'
  },
  {
    id:'bzmnSeNm',
    numeric:false,
    disablePadding:false,
    label:'구분',
  },
  {
    id:'flnm',
    numeric:false,
    disablePadding:false,
    label:'이전차주명',
  },
  {
    id:'brno',
    numeric:false,
    disablePadding:false,
    label:'이전 사업자번호',
    format:'brno'
  },
  {
    id:'rrno',
    numeric:false,
    disablePadding:false,
    label:'이전 주민등록번호',
    format:'rrno'
  },  
];

/* 유종 변경이력 */
export const koiHeadCells:HeadCell[] = [
  {
    id:'mdfcnDt',
    numeric:false,
    disablePadding:false,
    label:'변경일',
    format:'yyyymmdd'
  },
  {
    id:'koiNm',
    numeric:false,
    disablePadding:false,
    label:'이전유종',
  },
];

/* 지급정지 등록이력 */
export const stopHeadCells:HeadCell[] = [
  {
    id:'regDt',
    numeric:false,
    disablePadding:false,
    label:'등록일',
    format:'yyyymmdd'
  },
  {
    id:'stopBgngYmd',
    numeric:false,
    disablePadding:false,
    label:'정지시작일',
    format:'yyyymmdd'
  },
  {
    id:'stopEndYmd',
    numeric:false,
    disablePadding:false,
    label:'정지종료일',
    format:'yyyymmdd'
  },
  {
    id:'vhclRestrtYmd',
    numeric:false,
    disablePadding:false,
    label:'운행게시일',
    format:'yyyymmdd'
  },
  {
    id:'mdfcnDt',
    numeric:false,
    disablePadding:false,
    label:'최종변경일',
    format:'yyyymmdd'
  },
];

/* 차량휴지 등록이력 */
export const pauseHeadCells:HeadCell[] = [
  {
    id:'regDt',
    numeric:false,
    disablePadding:false,
    label:'등록일',
    format:'yyyymmdd'
  },
  {
    id:'pauseBgngYmd',
    numeric:false,
    disablePadding:false,
    label:'휴지시작일',
    format:'yyyymmdd'
  },
  {
    id:'pauseEndYmd',
    numeric:false,
    disablePadding:false,
    label:'휴지종료일',
    format:'yyyymmdd'
  },
  {
    id:'vhclRestrtYmd',
    numeric:false,
    disablePadding:false,
    label:'운행게시일',
    format:'yyyymmdd'
  },
  {
    id:'mdfcnDt',
    numeric:false,
    disablePadding:false,
    label:'최종변경일',
    format:'yyyymmdd'
  },
];

/* 지자체 변경이력 */
export const locgovHeadCells:HeadCell[] = [
  {
    id:'regYmd',
    numeric:false,
    disablePadding:false,
    label:'변경일자',
    format:'yyyymmdd'
  },
  {
    id:'exsLocgovNm',
    numeric:false,
    disablePadding:false,
    label:'이전지자체',
  },
  {
    id:'chgLocgovNm',
    numeric:false,
    disablePadding:false,
    label:'현재지자체',
  },
];

/* 차량말소 등록이력 */
export const ersrHeadCells:HeadCell[] = [
  {
    id:'ersrYmd',
    numeric:false,
    disablePadding:false,
    label:'말소일자',
    format:'yyyymmdd'
  },
  {
    id:'brno',
    numeric:false,
    disablePadding:false,
    label:'사업자번호',
    format:'brno'
  },
  {
    id:'koiNm',
    numeric:false,
    disablePadding:false,
    label:'유종',
  },
  {
    id:'ersrRsnNm',
    numeric:false,
    disablePadding:false,
    label:'말소사유',
  },
  {
    id:'locgovNm',
    numeric:false,
    disablePadding:false,
    label:'담당지자체',    
  },
];
import { HeadCell } from 'table'

/** 기준관리 - 자격관리 - 운수종사자격정보 택시메인 (stn/dqi)*/
export const stnDqiTxHc: HeadCell[] = [
  {
    id: 'vhclNo',
    numeric: false,
    disablePadding: false,
    label: '차량번호',
  },
  {
    id: 'vonrRrnoS',
    numeric: false,
    disablePadding: false,
    label: '주민등록번호',
    format: 'rrno',
  },
  {
    id: 'vonrNm',
    numeric: false,
    disablePadding: false,
    label: '소유자명',
  },
  {
    id: 'vhclPsnNm',
    numeric: false,
    disablePadding: false,
    label: '소유구분',
  },
  {
    id: 'vhclSttsNm',
    numeric: false,
    disablePadding: false,
    label: '차량상태',
  },
  {
    id: 'carRegDt',
    numeric: false,
    disablePadding: false,
    label: '차량등록일자',
    format: 'yyyymmdd',
  },

  {
    id: 'taxiQlfcNo',
    numeric: false,
    disablePadding: false,
    label: '택시자격번호',
  },
  {
    id: 'taxiQlfcSttsNm',
    numeric: false,
    disablePadding: false,
    label: '자격보유여부',
  },
  {
    id: 'taxiQlfcAcqsYmd',
    numeric: false,
    disablePadding: false,
    label: '택시자격취득일자',
    format: 'yyyymmdd',
  },
  {
    id: 'taxiQlfcRtrcnYmd',
    numeric: false,
    disablePadding: false,
    label: '택시자격취소일자',
    format: 'yyyymmdd',
  },
  {
    id: 'kotsaRegDt',
    numeric: false,
    disablePadding: false,
    label: '등록일자',
    format: 'yyyymmdd',
  },
  {
    id: 'kotsaMdfcnDt',
    numeric: false,
    disablePadding: false,
    label: '수정일자',
    format: 'yyyymmdd',
  },
]

/** 기준관리 - 자격관리 - 운수종사자격이력정보 택시메인 (stn/dqi)*/
export const stnDqiHisTxHc: HeadCell[] = [
  {
    id: 'hstrySn',
    numeric: false,
    disablePadding: false,
    label: '순번',
  },
  {
    id: 'vonrRrnoS',
    numeric: false,
    disablePadding: false,
    label: '주민등록번호',
    format: 'rrno',
  },
  {
    id: 'taxiQlfcNo',
    numeric: false,
    disablePadding: false,
    label: '택시자격번호',
  },
  {
    id: 'taxiQlfcSttsNm',
    numeric: false,
    disablePadding: false,
    label: '자격보유여부',
  },
  {
    id: 'taxiQlfcAcqsYmd',
    numeric: false,
    disablePadding: false,
    label: '택시자격취득일자',
    format: 'yyyymmdd',
  },
  {
    id: 'taxiQlfcRtrcnYmd',
    numeric: false,
    disablePadding: false,
    label: '택시자격취소일자',
    format: 'yyyymmdd',
  },
  {
    id: 'kotsaRegDt',
    numeric: false,
    disablePadding: false,
    label: '등록일자',
    format: 'yyyymmdd',
  },
  {
    id: 'kotsaMdfcnDt',
    numeric: false,
    disablePadding: false,
    label: '수정일자',
    format: 'yyyymmdd',
  },
]

/** 기준관리 - 자격관리 - 운수종사자격정보 버스메인 (stn/dqi)*/
export const stnDqiBsHc: HeadCell[] = [
  {
    id: 'vhclNo',
    numeric: false,
    disablePadding: false,
    label: '차량번호',
  },
  {
    id: 'vonrRrnoS',
    numeric: false,
    disablePadding: false,
    label: '주민등록번호',
    format: 'rrno',
  },
  {
    id: 'vonrNm',
    numeric: false,
    disablePadding: false,
    label: '소유자명',
  },
  {
    id: 'vhclPsnNm',
    numeric: false,
    disablePadding: false,
    label: '소유구분',
  },
  {
    id: 'vhclSttsNm',
    numeric: false,
    disablePadding: false,
    label: '차량상태',
  },
  {
    id: 'carRegDt',
    numeric: false,
    disablePadding: false,
    label: '차량등록일자',
    format: 'yyyymmdd',
  },

  {
    id: 'busQlfcNo',
    numeric: false,
    disablePadding: false,
    label: '버스자격번호',
  },
  {
    id: 'busQlfcSttsNm',
    numeric: false,
    disablePadding: false,
    label: '자격보유여부',
  },
  {
    id: 'busQlfcAcqsYmd',
    numeric: false,
    disablePadding: false,
    label: '버스자격취득일자',
    format: 'yyyymmdd',
  },
  {
    id: 'busQlfcRtrcnYmd',
    numeric: false,
    disablePadding: false,
    label: '버스자격취소일자',
    format: 'yyyymmdd',
  },
  {
    id: 'kotsaRegDt',
    numeric: false,
    disablePadding: false,
    label: '등록일자',
    format: 'yyyymmdd',
  },
  {
    id: 'kotsaMdfcnDt',
    numeric: false,
    disablePadding: false,
    label: '수정일자',
    format: 'yyyymmdd',
  },
]

/** 기준관리 - 자격관리 - 운수종사자격이력정보 버스메인 (stn/dqi)*/
export const stnDqiHisBsHc: HeadCell[] = [
  {
    id: 'hstrySn',
    numeric: false,
    disablePadding: false,
    label: '순번',
  },
  {
    id: 'vonrRrnoS',
    numeric: false,
    disablePadding: false,
    label: '주민등록번호',
    format: 'rrno',
  },
  {
    id: 'busQlfcNo',
    numeric: false,
    disablePadding: false,
    label: '버스자격번호',
  },
  {
    id: 'busQlfcSttsNm',
    numeric: false,
    disablePadding: false,
    label: '자격보유여부',
  },
  {
    id: 'busQlfcAcqsYmd',
    numeric: false,
    disablePadding: false,
    label: '버스자격취득일자',
    format: 'yyyymmdd',
  },
  {
    id: 'busQlfcRtrcnYmd',
    numeric: false,
    disablePadding: false,
    label: '버스자격취소일자',
    format: 'yyyymmdd',
  },
  {
    id: 'kotsaRegDt',
    numeric: false,
    disablePadding: false,
    label: '등록일자',
    format: 'yyyymmdd',
  },
  {
    id: 'kotsaMdfcnDt',
    numeric: false,
    disablePadding: false,
    label: '수정일자',
    format: 'yyyymmdd',
  },
]

/* 통계보고서 > 코드관리  > 분류코드 관리(/star/cm) - 분류코드 조회*/
export const starCmHc: HeadCell[] = [
  {
    id: 'clsfCd',
    numeric: false,
    disablePadding: false,
    label: '분류코드',
  },
  {
    id: 'clsfCdNm',
    numeric: false,
    disablePadding: false,
    label: '분류코드명',
  },
  {
    id: 'clsfPrntNm',
    numeric: false,
    disablePadding: false,
    label: '분류부모코드',
  },
  {
    id: 'sortSeq',
    numeric: false,
    disablePadding: false,
    label: '정렬순서',
  },
  {
    id: 'useNm',
    numeric: false,
    disablePadding: false,
    label: '사용여부(한글)',
  },
  {
    id: 'edit',
    label: '수정',
    format: 'button', // ← 반드시 추가!
    button: {
      label: '수정',
      color: 'primary',
    },
    disablePadding: false, // ← 추가
    numeric: false, // ← 추가
  },
]

/** 기준관리 - 자격관리 - 주행거리정보 화물메인 (stn/ddi)*/
export const stnDdiTrHc: HeadCell[] = [
  {
    id: 'locgovNm',
    numeric: false,
    disablePadding: false,
    label: '관할관청',
  },
  {
    id: 'vhclNo',
    numeric: false,
    disablePadding: false,
    label: '차량번호',
  },
  {
    id: 'brno',
    numeric: false,
    disablePadding: false,
    label: '차주사업자등록번호',
    format: 'brno',
  },
  {
    id: 'vonrNm',
    numeric: false,
    disablePadding: false,
    label: '차주명',
  },
  {
    id: 'koiNm',
    numeric: false,
    disablePadding: false,
    label: '유종',
  },
  {
    id: 'vhclTonNm',
    numeric: false,
    disablePadding: false,
    label: '톤수구분',
  },
  {
    id: 'regYmd',
    numeric: false,
    disablePadding: false,
    label: '등록일자',
    format: 'yyyymmdd',
  },
  {
    id: 'drvngDstnc',
    numeric: false,
    disablePadding: false,
    label: '주행거리',
    format: 'number',
    align: 'td-right',
  },
  {
    id: 'mileg',
    numeric: false,
    disablePadding: false,
    label: '제조사연비',
    format: 'lit',
    align: 'td-right',
  },
]

/** 기준관리 - 자격관리 - 주행거리정보 택시메인 (stn/ddi)*/
export const stnDdiTxHc: HeadCell[] = [
  {
    id: 'locgovNm',
    numeric: false,
    disablePadding: false,
    label: '관할관청',
  },
  {
    id: 'vhclNo',
    numeric: false,
    disablePadding: false,
    label: '차량번호',
  },
  {
    id: 'brno',
    numeric: false,
    disablePadding: false,
    label: '사업자등록번호',
    format: 'brno',
  },
  {
    id: 'bzentyNm',
    numeric: false,
    disablePadding: false,
    label: '업체명',
  },
  {
    id: 'koiNm',
    numeric: false,
    disablePadding: false,
    label: '유종',
  },
  {
    id: 'bzmnSeNm',
    numeric: false,
    disablePadding: false,
    label: '개인법인구분',
  },
  {
    id: 'regYmd',
    numeric: false,
    disablePadding: false,
    label: '등록일자',
    format: 'yyyymmdd',
  },
  {
    id: 'drvngDstnc',
    numeric: false,
    disablePadding: false,
    label: '주행거리',
    format: 'number',
    align: 'td-right',
  },
  {
    id: 'mileg',
    numeric: false,
    disablePadding: false,
    label: '제조사연비',
    format: 'lit',
    align: 'td-right',
  },
]

/** 기준관리 - 자격관리 - 주행거리정보 버스메인 (stn/ddi)*/
export const stnDdiBsHc: HeadCell[] = [
  {
    id: 'locgovNm',
    numeric: false,
    disablePadding: false,
    label: '관할관청',
  },
  {
    id: 'vhclNo',
    numeric: false,
    disablePadding: false,
    label: '차량번호',
  },
  {
    id: 'brno',
    numeric: false,
    disablePadding: false,
    label: '사업자등록번호',
    format: 'brno',
  },
  {
    id: 'bzentyNm',
    numeric: false,
    disablePadding: false,
    label: '업체명',
  },
  {
    id: 'koiNm',
    numeric: false,
    disablePadding: false,
    label: '유종',
  },
  {
    id: 'lcnsTpbizNm',
    numeric: false,
    disablePadding: false,
    label: '면허업종',
  },
  {
    id: 'regYmd',
    numeric: false,
    disablePadding: false,
    label: '등록일자',
    format: 'yyyymmdd',
  },
  {
    id: 'drvngDstnc',
    numeric: false,
    disablePadding: false,
    label: '주행거리',
    format: 'number',
    align: 'td-right',
  },
  {
    id: 'mileg',
    numeric: false,
    disablePadding: false,
    label: '제조사연비',
    format: 'lit',
    align: 'td-right',
  },
]

/* 통계보고서 > 비정형통계보고서  > 비정형통계보고서 조회*/
export const starUserHc: HeadCell[] = [
  {
    id: 'rptpSn',
    numeric: false,
    disablePadding: false,
    label: '보고서순번',
  },
  {
    id: 'ctpvNm',
    numeric: false,
    disablePadding: false,
    label: '시도명',
  },
  {
    id: 'locgovNm',
    numeric: false,
    disablePadding: false,
    label: '관할관청',
  },
  {
    id: 'rptpNm',
    numeric: false,
    disablePadding: false,
    label: '보고서명',
  },
  {
    id: 'x',
    numeric: false,
    disablePadding: false,
    label: '가로축',
  },
  {
    id: 'y',
    numeric: false,
    disablePadding: false,
    label: '세로축',
  },
  {
    id: 'm',
    numeric: false,
    disablePadding: false,
    label: '측정값',
  },
  {
    id: 'print',
    numeric: false,
    disablePadding: false,
    label: '출력',
    format: 'button',
    button: { label: '출력', color: 'success' },
  },
  {
    id: 'edit',
    numeric: false,
    disablePadding: false,
    label: '수정',
    format: 'button',
    button: { label: '수정', color: 'success' },
  },
]

/* 시스템관리 > 시스템관리 > 코드관리 (/ilp/cm) - 코드그룹 조회*/
export const ilpCmGroupHC: HeadCell[] = [
  {
    id: 'cdGroupNm',
    numeric: false,
    disablePadding: false,
    label: '코드그룹명',
  },
  {
    id: 'cdKornNm',
    numeric: false,
    disablePadding: false,
    label: '코드그룹한글명',
  },
  {
    id: 'cdSeNm',
    numeric: false,
    disablePadding: false,
    label: '코드구분명',
  },
  {
    id: 'cdExpln',
    numeric: false,
    disablePadding: false,
    label: '코드설명',
  },
  {
    id: 'useNm',
    numeric: false,
    disablePadding: false,
    label: '사용여부',
  },
  {
    id: 'comCdYn',
    numeric: false,
    disablePadding: false,
    label: '공통코드여부',
  },
  {
    id: 'edit',
    numeric: false,
    disablePadding: false,
    label: '수정',
    format: 'button',
    button: {
      label: '수정',
    },
  },
]

/* 시스템관리 > 시스템관리 > 코드관리 (/ilp/cm) - 공통코드 조회*/
export const ilpCmCmmnHC: HeadCell[] = [
  {
    id: 'cdGroupNm',
    numeric: false,
    disablePadding: false,
    label: '코드그룹명',
  },
  {
    id: 'cdNm',
    numeric: false,
    disablePadding: false,
    label: '코드명',
  },
  {
    id: 'cdKornNm',
    numeric: false,
    disablePadding: false,
    label: '코드한글명',
  },
  {
    id: 'cdExpln',
    numeric: false,
    disablePadding: false,
    label: '코드설명',
  },
  {
    id: 'cdSeq',
    numeric: false,
    disablePadding: false,
    label: '코드순서',
  },
  {
    id: 'useYn',
    numeric: false,
    disablePadding: false,
    label: '사용여부',
  },
  {
    id: 'edit',
    numeric: false,
    disablePadding: false,
    label: '수정',
    format: 'button',
    button: {
      label: '수정',
    },
  },
]

/* 통계보고서 > 정형통계보고서  > 정형통계보고서 (star/ssr)*/
export const starSsrHc: HeadCell[] = [
  {
    id: 'sn',
    numeric: false,
    disablePadding: false,
    label: '순번',
  },
  {
    id: 'rptpNm',
    numeric: false,
    disablePadding: false,
    label: '보고서명',
  },
  {
    id: 'print',
    numeric: false,
    disablePadding: false,
    label: '출력',
    format: 'button',
    button: { label: '출력', color: 'success' },
  },
]

/* 커뮤니티 > 커뮤니티 > 부정수급 사례 공유 (/ilp/iscs) */
export const ilpIscsHC: HeadCell[] = [
  {
    id: 'bbscttSn',
    numeric: false,
    disablePadding: false,
    label: '번호',
  },
  {
    id: 'ttl',
    numeric: false,
    disablePadding: false,
    label: '제목',
  },
  {
    id: 'roleNm',
    numeric: false,
    disablePadding: false,
    label: '소속',
  },
  {
    id: 'userNm',
    numeric: false,
    disablePadding: false,
    label: '작성자',
  },
  {
    id: 'inqCnt',
    numeric: false,
    disablePadding: false,
    label: '조회',
    format: 'number',
  },
  {
    id: 'regDt',
    numeric: false,
    disablePadding: false,
    label: '작성일',
    format: 'yyyymmdd',
  },
]

export const ilpNoticeHc: HeadCell[] = [
  {
    id: 'bbscttSn',
    numeric: false,
    disablePadding: false,
    label: '번호',
  },
  {
    id: 'oriTtl',
    numeric: false,
    disablePadding: false,
    label: '제목',
  },
  {
    id: 'inqCnt',
    numeric: false,
    disablePadding: false,
    label: '조회',
  },
  {
    id: 'regDt',
    numeric: false,
    disablePadding: false,
    label: '등록일',
    format: 'yyyymmdd',
  },
]

export const ilpFaqeHc: HeadCell[] = [
  {
    id: 'bbscttSn',
    numeric: false,
    disablePadding: false,
    label: '번호',
  },
  {
    id: 'oriTtl',
    numeric: false,
    disablePadding: false,
    label: '제목',
  },
  {
    id: 'inqCnt',
    numeric: false,
    disablePadding: false,
    label: '조회',
  },
  {
    id: 'regDt',
    numeric: false,
    disablePadding: false,
    label: '등록일',
    format: 'yyyymmdd',
  },
]

export const ilpQnaHc: HeadCell[] = [
  {
    id: 'bbscttSn',
    numeric: false,
    disablePadding: false,
    label: '번호',
  },
  {
    id: 'locgovNm',
    numeric: false,
    disablePadding: false,
    label: '지자체',
  },
  {
    id: 'oriTtl',
    numeric: false,
    disablePadding: false,
    label: '제목',
  },
  {
    id: 'inqCnt',
    numeric: false,
    disablePadding: false,
    label: '조회',
  },
  {
    id: 'regDt',
    numeric: false,
    disablePadding: false,
    label: '등록일',
    format: 'yyyymmdd',
  },
]

/* 통계보고서 > 코드관리  > 항목코드 관리(/star/acm) */
export const starAcmHc: HeadCell[] = [
  {
    id: 'clsfCd',
    numeric: false,
    disablePadding: false,
    label: '항목코드',
  },
  {
    id: 'clsfCdNm',
    numeric: false,
    disablePadding: false,
    label: '항목코드명',
  },
  {
    id: 'clsfPrntNm',
    numeric: false,
    disablePadding: false,
    label: '항목부모코드',
  },
  {
    id: 'sortSeq',
    numeric: false,
    disablePadding: false,
    label: '정렬순서',
  },
  {
    id: 'useNm',
    numeric: false,
    disablePadding: false,
    label: '사용여부(한글)',
  },
  {
    id: 'edit',
    label: '수정',
    format: 'button', // ← 반드시 추가!
    button: {
      label: '수정',
      color: 'primary',
    },
    disablePadding: false, // ← 추가
    numeric: false, // ← 추가
  },
]

/* 통계보고서 > 코드관리  > 단위코드 관리(/star/acm) */
export const starUcmHc: HeadCell[] = [
  {
    id: 'clsfCd',
    numeric: false,
    disablePadding: false,
    label: '단위코드',
  },
  {
    id: 'clsfCdNm',
    numeric: false,
    disablePadding: false,
    label: '단위코드명',
  },
  {
    id: 'clsfPrntNm',
    numeric: false,
    disablePadding: false,
    label: '단위부모코드',
  },
  {
    id: 'sortSeq',
    numeric: false,
    disablePadding: false,
    label: '정렬순서',
  },
  {
    id: 'useNm',
    numeric: false,
    disablePadding: false,
    label: '사용여부(한글)',
  },
  {
    id: 'edit',
    label: '수정',
    format: 'button', // ← 반드시 추가!
    button: {
      label: '수정',
      color: 'primary',
    },
    disablePadding: false, // ← 추가
    numeric: false, // ← 추가
  },
]

/* 기준관리 > 자격관리  > 버스운행정보(/stn/boi) */
export const stnBoiHc: HeadCell[] = [
  {
    id: 'locgovNm',
    numeric: false,
    disablePadding: false,
    label: '관할관청',
  },
  {
    id: 'vhclNo',
    numeric: false,
    disablePadding: false,
    label: '차량번호',
  },
  {
    id: 'brno',
    numeric: false,
    disablePadding: false,
    label: '사업자등록번호',
    format: 'brno',
  },
  {
    id: 'bzentyNm',
    numeric: false,
    disablePadding: false,
    label: '업체명',
  },
  {
    id: 'oprYmd',
    numeric: false,
    disablePadding: false,
    label: '운행일자',
    format: 'yyyymmdd',
  },
  {
    id: 'oprDstnc',
    numeric: false,
    disablePadding: false,
    label: '운행거리',
    format: 'lit',
    align: 'td-right',
  },
  {
    id: 'oprMnCnt',
    numeric: false,
    disablePadding: false,
    label: '운행시간(분)',
  },
  {
    id: 'sbmsnYmd',
    numeric: false,
    disablePadding: false,
    label: '제출일자',
    format: 'yyyymmdd',
  },
]

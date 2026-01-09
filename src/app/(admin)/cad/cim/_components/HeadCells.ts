import { HeadCell } from 'table'
/**
 * 충돌 방지를 위해 분리하여 관리
 * 추후에 기존 공통 파일에 합쳐야 함
 */

/** 유류구매카드관리 - 보조금카드관리 - 카드정보관리 - 화물 */
export const cadCimHeadCellsCargo: HeadCell[] = [
  {
    id: '',
    numeric: false,
    disablePadding: false,
    label: '상세조회',
    format: 'button',
    button: {
      label: '조회',
      color: 'primary',
      onClick: () => {},
    },
  },
  {
    id: 'vhclNo',
    numeric: false,
    disablePadding: false,
    label: '차량번호',
  },
  {
    id: 'vonrNm',
    numeric: false,
    disablePadding: false,
    label: '소유자명',
  },
  {
    id: 'crdcoNm',
    numeric: false,
    disablePadding: false,
    label: '카드사명',
  },
  {
    id: 'cardSeNm',
    numeric: false,
    disablePadding: false,
    label: '카드구분',
  },
  {
    id: 'cardNoSe',
    numeric: false,
    disablePadding: false,
    label: '카드번호',
  },
  {
    id: 'stlmCardNoVe',
    numeric: false,
    disablePadding: false,
    label: '결제카드번호',
  },
  {
    id: 'cardSttsNm',
    numeric: false,
    disablePadding: false,
    label: '카드상태',
  },
]

/** 유류구매카드관리 - 보조금카드관리 - 카드정보관리 - 택시 */
export const cadCimHeadCellsTaxi: HeadCell[] = [
  {
    id: 'rcptYmd',
    numeric: false,
    disablePadding: false,
    label: '접수일자',
    format: 'yyyymmdd',
  },
  {
    id: 'brno',
    numeric: false,
    disablePadding: false,
    label: '사업자등록번호',
    format: 'brno',
  },
  {
    id: 'vhclNo',
    numeric: false,
    disablePadding: false,
    label: '차량번호',
  },
  {
    id: 'custSeNm',
    numeric: false,
    disablePadding: false,
    label: '고객구분',
  },
  {
    id: 'flnm',
    numeric: false,
    disablePadding: false,
    label: '소유자명',
  },
  {
    id: 'crdcoNm',
    numeric: false,
    disablePadding: false,
    label: '카드사명',
  },
  {
    id: 'cardSeNm',
    numeric: false,
    disablePadding: false,
    label: '카드구분',
  },
  {
    id: 'cardNoS',
    numeric: false,
    disablePadding: false,
    label: '카드번호',
    format: 'cardNo',
  },
  {
    id: 'crdcoSttsNm',
    numeric: false,
    disablePadding: false,
    label: '카드상태',
  },
  {
    id: 'dscntNm',
    numeric: false,
    disablePadding: false,
    label: '차량할인여부',
  },
]

/** 유류구매카드관리 - 보조금카드관리 - 카드정보관리 - 버스 */
export const cadCimHeadCellsBus: HeadCell[] = [
  {
    id: 'brno',
    numeric: false,
    disablePadding: false,
    label: '사업자등록번호',
    format: 'brno',
  },
  {
    id: 'vhclNo',
    numeric: false,
    disablePadding: false,
    label: '차량번호',
  },
  {
    id: 'koiNm',
    numeric: false,
    disablePadding: false,
    label: '유종',
  },
  {
    id: 'flnm',
    numeric: false,
    disablePadding: false,
    label: '소유자명',
  },
  {
    id: 'crdcoNm',
    numeric: false,
    disablePadding: false,
    label: '카드사명',
  },
  {
    id: 'crdtCeckSeNm',
    numeric: false,
    disablePadding: false,
    label: '카드구분',
  },
  {
    id: 'cardNoS',
    numeric: false,
    disablePadding: false,
    label: '카드번호',
  },
  {
    id: 'cardSttsNm',
    numeric: false,
    disablePadding: false,
    label: '카드상태',
  },
  {
    id: 'dscntNm',
    numeric: false,
    disablePadding: false,
    label: '할인여부',
  },
]

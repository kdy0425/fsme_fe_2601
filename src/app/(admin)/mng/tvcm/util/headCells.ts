import { HeadCell } from 'table'

/* 차량목록 */
export const vhclHeadCells: HeadCell[] = [
	{
		id: 'locgovNm',
		numeric: false,
		disablePadding: false,
		label: '지자체',
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
		label: '사업자번호',
        format: 'brno'
  	},	
	{
		id: 'koiNm',
		numeric: false,
		disablePadding: false,
		label: '유종',
  	},
	{
		id: 'dscntNm',
		numeric: false,
		disablePadding: false,
		label: '차량할인여부',
  	},
	{
		id: 'sttsNm',
		numeric: false,
		disablePadding: false,
		label: '차량상태',
  	},
	{
		id: 'ersrYmd',
		numeric: false,
		disablePadding: false,
		label: '말소일자',
        format:'yyyymmdd',
  	},
	{
		id: 'ersrRsnNm',
		numeric: false,
		disablePadding: false,
		label: '말소사유',        
  	},
	{
		id: 'rgtrId',
		numeric: false,
		disablePadding: false,
		label: '입력ID',
  	},
	{
		id: 'regDt',
		numeric: false,
		disablePadding: false,
		label: '입력일자',
        format:'yyyymmddhh24miss',
  	},
	{
		id: 'mdfrId',
		numeric: false,
		disablePadding: false,
		label: '수정ID',
  	},
	{
		id: 'mdfcnDt',
		numeric: false,
		disablePadding: false,
		label: '수정일자',
        format:'yyyymmddhh24miss',
  	},	
];

/* 차량정지이력목록 */
export const vhclStopHeadCells: HeadCell[] = [
	{
		id: 'stopType',
		numeric: false,
		disablePadding: false,
		label: '정지구분',
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
		label: '사업자번호',
        format:'brno'
    },
    {
		id: 'hstrySn',
		numeric: false,
		disablePadding: false,
		label: '순번',
        format: 'number'
    },
    {
		id: 'bgngYmd',
		numeric: false,
		disablePadding: false,
		label: '정지시작일',
        format:'yyyymmdd'
    },
    {
		id: 'endYmd',
		numeric: false,
		disablePadding: false,
		label: '정지종료일',
        format:'yyyymmdd'
    },
    {
		id: 'delYnNm',
		numeric: false,
		disablePadding: false,
		label: '삭제여부',
    },
    {
		id: 'rgtrId',
		numeric: false,
		disablePadding: false,
		label: '입력ID',
    },
    {
		id: 'regDt',
		numeric: false,
		disablePadding: false,
		label: '입력일자',
        format:'yyyymmddhh24miss'
    },
    {
		id: 'mdfrId',
		numeric: false,
		disablePadding: false,
		label: '수정ID',
    },
    {
		id: 'mdfcnDt',
		numeric: false,
		disablePadding: false,
		label: '수정일자',
        format:'yyyymmddhh24miss'
    },
    {
		id: 'vhclRestrtYmd',
		numeric: false,
		disablePadding: false,
		label: '영업개시일',
        format:'yyyymmdd'
    },
];

/* 사업자목록 */
export const bsnesHeadCells: HeadCell[] = [
	{
		id: 'brno',
		numeric: false,
		disablePadding: false,
		label: '사업자번호',
        format:'brno',
  	},
    {
		id: 'bzentyNm',
		numeric: false,
		disablePadding: false,
		label: '업체명',
  	},
	{
		id: 'sttsNm',
		numeric: false,
		disablePadding: false,
		label: '사업자상태',
  	},	
	{
		id: 'txtnTypeNm',
		numeric: false,
		disablePadding: false,
		label: '과세유형',
  	},
	{
		id: 'ntsChgYmd',
		numeric: false,
		disablePadding: false,
		label: '국세청 변경일자',
        format:'yyyymmdd'
  	},
	{
		id: 'ntsDclrYmd',
		numeric: false,
		disablePadding: false,
		label: '국세청 신고일자',
        format:'yyyymmdd'
  	},
	{
		id: 'crno',
		numeric: false,
		disablePadding: false,
		label: '법인번호',
        format:'rrno'
  	},
	{
		id: 'bzmnSeNm',
		numeric: false,
		disablePadding: false,
		label: '법인구분',        
  	},
	{
		id: 'rprsvNm',
		numeric: false,
		disablePadding: false,
		label: '대표자명',
  	},
	{
		id: 'rprsvRrnoS',
		numeric: false,
		disablePadding: false,
		label: '대표 주민번호',
        format:'rrno'
  	},
    {
		id: 'telno',
		numeric: false,
		disablePadding: false,
		label: '전화번호',
        format:'telno'
  	},
	{
		id: 'rgtrId',
		numeric: false,
		disablePadding: false,
		label: '입력ID',
  	},
	{
		id: 'regDt',
		numeric: false,
		disablePadding: false,
		label: '입력일자',
        format:'yyyymmddhh24miss'
  	},
    {
		id: 'mdfrId',
		numeric: false,
		disablePadding: false,
		label: '수정ID',
  	},
	{
		id: 'mdfcnDt',
		numeric: false,
		disablePadding: false,
		label: '수정일자',
        format:'yyyymmddhh24miss'
  	},
];

/* 카드목록 */
export const cardHeadCells: HeadCell[] = [
	{
		id: 'crdcoNm',
		numeric: false,
		disablePadding: false,
		label: '카드사명',
  	},
    {
		id: 'cardNoD',
		numeric: false,
		disablePadding: false,
		label: '카드번호',
        format:'cardNo'
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
		label: '사업자번호',
        format:'brno'
  	},
	{
		id: 'flnm',
		numeric: false,
		disablePadding: false,
		label: '수급자명',
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
		label: '할인여부',
  	},
	{
		id: 'koiNm',
		numeric: false,
		disablePadding: false,
		label: '유종',        
  	},
	{
		id: 'rcptYmd',
		numeric: false,
		disablePadding: false,
		label: '접수일자',
        format:'yyyymmdd'
  	},
	{
		id: 'rcptSeqNo',
		numeric: false,
		disablePadding: false,
		label: '접수번호',
  	},
    {
		id: 'issuSeNm',
		numeric: false,
		disablePadding: false,
		label: '발급구분',
  	},
	{
		id: 'cardSeNm',
		numeric: false,
		disablePadding: false,
		label: '카드구분',
  	},
	{
		id: 'custSeNm',
		numeric: false,
		disablePadding: false,
		label: '고객구분',
  	},
    {
		id: 'custNo',
		numeric: false,
		disablePadding: false,
		label: '고객번호',
  	},
	{
		id: 'crno',
		numeric: false,
		disablePadding: false,
		label: '법인번호',
        format:'rrno'
  	},
    {
		id: 'rrnoS',
		numeric: false,
		disablePadding: false,
		label: '주민번호',
        format:'rrno'
  	},
    {
		id: 'agncyDrvBgngYmd',
		numeric: false,
		disablePadding: false,
		label: '대리운전시작일',
        format:'yyyymmdd'
  	},
    {
		id: 'agncyDrvEndYmd',
		numeric: false,
		disablePadding: false,
		label: '대리운전종료일',
        format:'yyyymmdd'
  	},
    {
		id: 'rgtrId',
		numeric: false,
		disablePadding: false,
		label: '입력ID',
  	},
    {
		id: 'regDt',
		numeric: false,
		disablePadding: false,
		label: '입력일자',
        format:'yyyymmddhh24miss'
  	},
    {
		id: 'mdfrId',
		numeric: false,
		disablePadding: false,
		label: '수정ID',
  	},
    {
		id: 'mdfcnDt',
		numeric: false,
		disablePadding: false,
		label: '수정일자',
        format:'yyyymmddhh24miss'
  	},
    {
		id: 'dscntChgAplcnDscntNm',
		numeric: false,
		disablePadding: false,
		label: '할인변경예정',
  	},
    {
		id: 'dscntChgAplcnYmd',
		numeric: false,
		disablePadding: false,
		label: '할인변경예정일자',
        format:'yyyymmdd'
  	},
];
// 메인화면 게시판 을 조회
// fsm/mai/main/getNtcMttr      []
export interface Notice {
  ttl?: string //제목
  cn?: string //내용
  regDt?: string //등록일자
  userNm?: string //작성자
  popupNtcYn?: string //팝업표시여부
  bbscttSn?: string // 게시글번호
}

// 나의 할일 - 카드발급요청을 조회
// fsm/mai/main/getMyJobCrdIssuDmnd     1
export interface CardIssueRequest {
  cardDmndTrCnt?: number //화물카드 발급 요청건수
  cardDmndBsCnt?: number //버스카드 발급 요청건수
  cardDmndTxCnt?: number //택시카드 바급 요청건수
  cardTrAuth?: boolean //화물카드발급 권한여부
  cardTxAuth?: boolean //택시카드발급 권한여부
  cardBsAuth?: boolean //버스카드발급 권한여부
}

// 나의 할일 - RFID발급요청을 조회
// /fsm/mai/main/getMyJobRfidIssuDmnd       1
export interface RfidIssueRequest {
  rfidDmndTrCnt?: number //화물RFID발급요청건수
  rfidDmndTxCnt?: number //택시RFID발급요청건수
  rfidDmndBsCnt?: number //버스RFID발급요청건수
  rfidTrAuth?: boolean //화물RFID발급 권한여부
  rfidTxAuth?: boolean //택시RFID발급 권한여부
  rfidBsAuth?: boolean //버스RFID발급 권한여부
}

// 나의 할일 - 서면신청을 조회
// /fsm/mai/main/getMyJobDocmntAply     1
export interface WrittenApplication {
  docmntAplyTrCnt?: number //화물서면신청요청건수
  docmntAplyTxCnt?: number //택시서면신청요청건수
  docmntAplyBsCnt?: number //버스서면신청요청건수
  docmntTrAuth?: boolean //화물서면신청 권한여부
  docmntTxAuth?: boolean //택시서면신청 권한여부
  docmntBsAuth?: boolean //버스서면신청 권한여부
}

// 나의 할일 - 청구확정을 조회              1
// /fsm/mai/main/getMyJobClnCfmtn
export interface ClaimConfirmation {
  clnCfmtnTrCnt?: number //화물청구확정건수
  clnCfmtnTxCnt?: number //택시청구확정건수
  clnCfmtnBsCnt?: number //버스청구확정건수
  clnCfmtnTrAuth?: boolean //화물청구확정 권한여부
  clnCfmtnTxAuth?: boolean //택시청구확정 권한여부
  clnCfmtnBsAuth?: boolean //버스청구확정 권한여부
}

// 나의 할일 - 의심거래를 조회
// /fsm/mai/main/getMyJobDoubtDelng         1
export interface SuspiciousTransaction {
  doubtDelngTrCnt?: number //화물의심거래미처리건수
  doubtDelngTrUrl?: number //화물의심거래메뉴링크
  doubtDelngTxCnt?: number //택시의심거래미처리건수
  doubtDelngTxUrl?: number //화물의심거래메뉴링크
  doubtDelngBsCnt?: number //버스의심거래미처리건수
  doubtDelngTrAuth?: boolean //화물의심거래 권한여부
  doubtDelngTxAuth?: boolean //택시의심거래 권한여부
  doubtDelngBsAuth?: boolean //버스의심거래 권한여부
}

// 나의 할일 - 탱크용량을 조회
// /fsm/mai/main/getMyJobTnkCpcty           1
export interface TankCapacity {
  tnkCpctyTrCnt?: number //화물탱크용량심사요청건수
  tnkCpctyTxCnt?: number //택시탱크용량심사요청건수
  tnkCpctyBsCnt?: number //버스탱크용량심사요청건수
  tnkCpctyTrAuth?: boolean //화물탱크용량심사 권한여부
  tnkCpctyTxAuth?: boolean //택시탱크용량심사 권한여부
  tnkCpctyBsAuth?: boolean //버스탱크용량심사 권한여부
}

// 나의 할일 - 전입요청을 조회
// /fsm/mai/main/getMyJobLgovTrnsfrnRequst  1
export interface LgovTrnsfrnRequst {
  lgovTrnsfrnRequstTrCnt?: number //화물전입요청건수
  lgovTrnsfrnRequstTxCnt?: number //택시전입요청건수
  lgovTrnsfrnRequstBsCnt?: number //버스전입요청건수
  lgovTrnsfrnRequstTrAuth?: boolean //화물전입요청 권한여부
  lgovTrnsfrnRequstTxAuth?: boolean //택시전입요청 권한여부
  lgovTrnsfrnRequstBsAuth?: boolean //버스전입요청권한여부
}

// 나의 할일 - 전출요청을 조회
// /fsm/mai/main/getMyJobLgovMvtRequst      1
export interface LgovMvtRequst {
  lgovMvtRequstTrCnt?: number //화물전출요청건수
  lgovMvtRequstTxCnt?: number //택시전출요청건수
  lgovMvtRequstBsCnt?: number //버스전출요청건수
  lgovMvtRequstTrAuth?: boolean //화물전출요청 권한여부
  lgovMvtRequstTxAuth?: boolean //택시전출요청 권한여부
  lgovMvtRequstBsAuth?: boolean //버스전출요청 권한여부
}

// 나의 할일 - 부정수급방지시스템 의심거래적발건수 조회
// /fsm/mai/main/getMyJobDdppDoubtDlng      1
export interface DdppDoubtDlng {
  ddppDoubtDlngCnt?: number //의심거래적발건수
  ddppDoubtDlngAuth?: boolean //의심거래적발건수 권한여부
}

// 나의 할일 - 부정수급방지시스템 조사대상건수 조회
// /fsm/mai/main/getMyJobDoubtExamTarget      1
export interface DoubtExamTarget {
  doubtExamTargetCnt?: number //조사대상건수
  doubtExamTargetAuth?: boolean //조사대상건수 권한여부
}

// 나의 할일 - 부정수급방지시스템 조사결과등록건수 조회
// /fsm/mai/main/getMyJobExamResult      1
export interface ExamResult {
  examResultCnt?: number //조사결과등록건수
  examResultAuth?: boolean //조사결과등록건수 권한여부
}

// 나의 할일 - 부정수급방지시스템 행정처분등록건수 조회
// /fsm/mai/main/getMyJobDoubtAdminProcess      1
export interface DoubtAdminProcess {
  doubtAdminProcessCnt?: number //행정처분등록건수
  doubtAdminProcessAuth?: boolean //행정처분등록건수 권한여부
}

// 나의 할일 - 부정수급방지시스템 소명자료요청건수 조회
// /fsm/mai/main/getMyJobVndcReq      1
export interface VndcReq {
  vndcReqCnt?: number //소명자료요청건수
  vndcReqAuth?: boolean //소명자료요청건수 권한여부
}

// 나의 할일 - 부정수급방지시스템 환수등록건수 조회
// /fsm/mai/main/getMyJobRdmAmtMngp      1
export interface RdmAmtMngp {
  rdmAmtMngpCnt?: number //환수등록건수
  rdmAmtMngpAuth?: boolean //환수등록건수 권한여부
}

// 나의 할일 - 권한별 화면url을 조회
export interface urls {
  urlAddr: string //화면 url
  userTypeCd: string //사용자권한코드
}

// 유가보조금 단가를 조회
// /fsm/mai/main/getUnitPrc                 1
export interface FuelSubsidyRate {
  today?: string //오늘 일자
  koiD?: string //경유
  koiC?: string //CNG
  koiL?: string //LPG
  koiH?: string //수소
  koiC13?: string //CNG전세버스
  koiD10?: string //경유고속우등버스
  koiHtr?: string
  koiHtx?: string
  koiHbs?: string
}

// 화물 일별 신청현황을 조회
// /fsm/mai/main/tr/getCardCnt                  []
export interface FreightDailyApplicationStatus {
  today: string //오늘일자
  cardRCnt: string //카드발급- 신청
  cardYCnt: string //카드발급- 승인
  cardNCnt: string //카드발급- 거절
  rfidRCnt: string //RFID발급- 신청
  rfidYCnt: string //RFID발급- 승인
  rfidNCnt: string //RFID발급- 거절
}

// 버스 카드 일별 신청현황을 조회
// /fsm/mai/main/bs/getCardRqstDt               []
export interface BusCardDailyApplicationStatus {
  today: string //오늘일자
  cardRCnt: string //카드발급- 신청
  cardYCnt: string //카드발급- 승인
  cardNCnt: string //카드발급- 거절
}

// 버스 RFID 일별 신청현황을 조회
// /fsm/mai/main/bs/getRfidRqstDt               []
export interface BusRfidDailyApplicationStatus {
  today: string //오늘일자
  rfidRCnt: string //RFID발급- 신청
  rfidYCnt: string //RFID발급- 승인
  rfidNCnt: string //RFID발급- 거절
}

// 택시 카드 일별 신청현황을 조회
// /fsm/mai/main/tx/getCardCnt                  []
export interface TaxiCardDailyApplicationStatus {
  today: string //오늘일자
  cardRCnt: string //카드발급- 신청
  cardYCnt: string //카드발급- 승인
  cardNCnt: string //카드발급- 거절
}

// 화물 유가보조금 청구현황을 조회
// /fsm/mai/main/tr/getftxAsst                  []
export interface FreightFuelSubsidyClaimStatus {
  clclnYm?: string //청구월
  cnt1?: string //거래건수
  cnt2?: string //주유량
  cnt3?: string //총거래금액
  cnt4?: string //유가보조금
}

// 버스 유가보조금 청구현황을 조회
// /fsm/mai/main/bs/getftxAsst                  []
export interface BusFuelSubsidyClaimStatus {
  clclnYm?: string //청구월
  cnt1?: string //거래건수
  cnt2?: string //주유량
  cnt3?: string //총거래금액
  cnt4?: string //유가보조금
}

// 택시 유가보조금 청구현황을 조회          []
// /fsm/mai/main/tx/getftxAsst    보류 미확실  파리미터 ex clclnYm:202302
export interface TaxiFuelSubsidyClaimStatus {
  clclnYm?: string //청구월
  cnt1?: string //거래건수
  cnt2?: string //주유량
  cnt3?: string //총거래금액
  cnt4?: string //유가보조금
}

// 화물 월별 보조금 지급현황을 조회            []
// /fsm/mai/main/tr/monAsstGiveCusTr 파리미터 ex year: 2024
export interface FreightMonthlySubsidyPaymentStatus {
  type: 'freight'
  year?: string // 청구월
  opsAmt: string // 지급금액
  crtrYm: string //청구년월
}

// 버스 월별 보조금 지급현황을 조회             [] 페이징
//  /fsm/mai/main/bs/getOpsMth      파라미터 ex year : 2024
export interface BusMonthlySubsidyPaymentStatus {
  type: 'bus'
  year?: string // 청구월
  opsAmt: string // 지급금액
  crtrYm: string //청구년월
}

// 택시 월별 보조금 지급현황을 조회                 [] 페이징
// /fsm/mai/main/tx/getOpsMthTx     파라미터 ex year 2024
export interface TaxiMonthlySubsidyPaymentStatus {
  type: 'taxi'
  year?: string // 청구월
  opsAmt: string // 지급금액
  crtrYm: string //청구년월
}

// 화물 의심거래 적발현황을 조회                []
// /fsm/mai/main/tr/getInstDoubt    파라미터 ex gubun:TR
export interface FreightSuspiciousTransactionDetection {
  gubun?: string //업무구분 화물 <- TR
  gbNm?: string //업무구분이름
  patternNm?: string //구분
  cnt?: string // 건수
}

// 택시 의심거래 적발현황을 조회                []
// /fsm/mai/main/tr/getInstDoubt    파라미터 ex gubun:TX
export interface TaxiSuspiciousTransactionDetection {
  gubun?: string //업무구분 택시 <- TX

  gbNm?: string //업무구분이름
  patternNm?: string //구분
  cnt?: string // 건수
}

// 메인화면 게시판 을 조회
// /ilp/iscs/getAllInstcSpldmdCaseShrn
export interface Notice {
  ttl?: string //제목
  cn?: string //내용
  regDt?: string //등록일자
  userNm?: string //작성자
  popupNtcYn?: string //팝업표시여부
  bbscttSn?: string // 게시글번호
}
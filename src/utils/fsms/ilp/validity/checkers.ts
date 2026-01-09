/* ───────────────────────────── 분석 유효성 체크 ───────────────────────────── */
import { toYmd8, cmp, inPeriodStrict, between, notWithin } from './dateUtils';

export type AnyRow = Record<string, any>;

export type DateMode = 'REG_ONLY' | 'START_TO_REG'; 
// REG_ONLY: 등록일(regDt)만 본다
// START_TO_REG: 시작일자(era/bgn) ≤ d8 ≤ 등록일(regDt) 로 포함 여부 판단

/* ───────── 공통 게이트 ───────── */
const regOK = (d8: string, reg?: unknown) => {
  const r8 = toYmd8(reg);
  return !!r8 && cmp(r8, d8) <= 0;
};
const startToRegOK = (d8: string, start?: unknown, reg?: unknown) => {
  const r8 = toYmd8(reg);
  if (!r8) return false;
  return between(d8, start, r8);
};

const to8 = (v?: unknown) => toYmd8(v) ?? null;
const norm8 = (d: string) => d.replace(/\D/g, '').slice(0, 8);

// from~to 모두 포함, 시작/종료 없으면 오픈엔드
const inRange8 = (d8: string, from?: unknown, to?: unknown) => {
  const f = to8(from) ?? '00000101';
  const t = to8(to)   ?? '99991231';
  return cmp(f, d8) <= 0 && cmp(d8, t) <= 0;
};

// regDt 키 추출(레거시 호환)
const getReg8 = (r: AnyRow) => {
  const reg = to8(r?.regDt) ?? to8(r?.kidiRegDt) ?? null;
  return reg;
};

const isUnreceived = (v?: unknown) => {
  const s = String(v ?? '').trim();
  if (!s) return false;
  const U = s.toUpperCase();
  return (
    s === '미수신' ||
    //U === 'UNRECEIVED' ||
    //U === 'N' ||
    //U === 'NO' ||
    U === '0'
  );
};

const receivedOK = (r: AnyRow) => !isUnreceived(r?.insrncSttsCd);

/* ───────── 의무보험 ───────── */
// 🔧 핵심: 여러 행의 담보를 "합집합"으로 판단 + regDt ≤ d8 게이트(포함)
export function evaluateInsuranceOnDate(
  d8raw: string,
  rows: AnyRow[],
  mode: DateMode = 'START_TO_REG',
): { t1OK: boolean; t2OK: boolean; sOK: boolean; isValid: boolean; unreceived: boolean } {
  const d8 = norm8(d8raw);
  if (!d8) return { t1OK: false, t2OK: false, sOK: false, isValid: false, unreceived: false};

  const regEligible = (rows ?? []).filter((r) => {
    const reg8 = getReg8(r);
    if (!reg8) return false;
    return mode === 'REG_ONLY' ? reg8 === d8 : cmp(reg8, d8) <= 0; // ≤ 포함
  });

  // 2) 그 중에서 '미수신' 존재 여부를 별도 플래그로 기록
  const unreceived = regEligible.some(r => !receivedOK(r));

  // 3) 실제 유효성 판단에는 '수신 정상'만 사용
  const eligible = regEligible.filter(receivedOK);

  // 담보별로 "어느 행이든" d8이 포함되면 OK (합집합)
  const t1OK = eligible.some((r) => inRange8(d8, r?.twdpsn1EraYmd, r?.twdpsn1EotYmd));
  const t2OK = eligible.some((r) => inRange8(d8, r?.twdpsn2EraYmd, r?.twdpsn2EotYmd));
  const sOK  = eligible.some((r) => inRange8(d8, r?.sbsttEraYmd,   r?.sbsttEotYmd));

  return { t1OK, t2OK, sOK, isValid: t1OK && t2OK && sOK, unreceived };
}

// 상세행 플래그(표시용). 개별 행 기준으로 무엇이 부족한지 마킹하고 싶을 때 사용.
export function markInsuranceFlagsForRow(
  d8raw: string,
  r: AnyRow,
  mode: DateMode = 'START_TO_REG',
) {
  const d8 = norm8(d8raw);
  const reg8 = getReg8(r);
  const unrecv = !receivedOK(r);                // ★ 추가: 미수신 여부
  const regGate =
    !!reg8 &&
    (mode === 'REG_ONLY' ? reg8 === d8 : cmp(reg8, d8) <= 0) &&
    !unrecv; 

  const t1OK = inRange8(d8, r?.twdpsn1EraYmd, r?.twdpsn1EotYmd);
  const t2OK = inRange8(d8, r?.twdpsn2EraYmd, r?.twdpsn2EotYmd);
  const sOK  = inRange8(d8, r?.sbsttEraYmd,   r?.sbsttEotYmd);

  return {
    ...r,
    __ins_unrecv: unrecv,
    __ins_reg: !regGate,   // 등록일 게이트 미달
    __ins_t1:  !t1OK,      // 대인1 미포함
    __ins_t2:  !t2OK,      // 대인2 미포함
    __ins_s:   !sOK,       // 대물   미포함
  };
}

/* ───────── 운수종사자(자격) ─────────
 * freight: frghtQlfc*, taxi: taxiQlfc* 처럼 필드가 다르므로 accessor 전달
 */
export type QualAccessors = {
  regKey: string;      // kotsaRegDt
  acqKey: string;      // *AcqsYmd
  rtrKey: string;      // *RtrcnYmd
  statKey: string;     // *SttsNm (취득)
  acquiredValue?: string; // 기본 '취득'
};
const defaultAcquired = '취득';

export function evaluateQualOnDate(
  d8: string,
  rows: AnyRow[],
  acc: QualAccessors
) {
  const acquiredVal = acc.acquiredValue ?? defaultAcquired;
  return (rows ?? []).some(r => {
    const k8 = toYmd8(r[acc.regKey]);
    const a8 = toYmd8(r[acc.acqKey]);
    const z8 = toYmd8(r[acc.rtrKey]) ?? '99991231';
    const okStat = String(r?.[acc.statKey] ?? '').trim() === acquiredVal;
    return !!k8 && cmp(k8, d8) <= 0 && !!a8 && cmp(a8, d8) <= 0 && cmp(d8, z8) <= 0 && okStat;
  });
}

/* ───────── 사업자 ───────── */
// 개업일 게이트: opbizYmd ≤ d8
const openOK = (d8: string, open?: unknown) => {
  const o8 = toYmd8(open);
  return !!o8 && cmp(o8, d8) <= 0;
};

export function evaluateBizOnDate(
  d8: string,
  rows: AnyRow[],
  mode: DateMode = 'REG_ONLY'
) {
  const list = rows ?? [];
  if (list.length === 0) return false;

  return list.some((r) => {
    const statusOK = String(r?.bzmnSttsCdNm ?? '').trim() === '정상';
    const restOK   = notWithin(d8, r.restBgngYmd, r.restEndYmd);

    if (mode === 'REG_ONLY') {
      // 등록일만 본다: regDt ≤ d8 + 상태/휴업 체크
      return regOK(d8, r.regDt) && statusOK && restOK;
    }

    // START_TO_REG: "개업일자 이상이면 유효"
    //  → opbizYmd ≤ d8 + 상태/휴업 체크
    const opened = openOK(d8, r.opbizYmd);
    return opened && statusOK && restOK;
  });
}

export function markBizFlagsForRow(
  d8: string,
  r: AnyRow,
  mode: DateMode = 'REG_ONLY'
) {
  const statusBad = String(r?.bzmnSttsCdNm ?? '').trim() !== '정상';

  // 공통 플래그
  const reg8 = toYmd8(r.regDt);
  const __bz_reg  = !(reg8 && cmp(reg8, d8) <= 0);
  const __bz_rest = !notWithin(d8, r.restBgngYmd, r.restEndYmd);

  if (mode === 'REG_ONLY') {
    // 등록일 기준만 봄: 개업일 컬럼은 항상 정상으로 둔다
    return { ...r, __bz_sts: statusBad, __bz_reg, __bz_open: false, __bz_rest };
  }

  // START_TO_REG: 개업일자 이상이면 OK
  const __bz_open = !openOK(d8, r.opbizYmd);
  return { ...r, __bz_sts: statusBad, __bz_reg, __bz_open, __bz_rest };
}

/* ───────── 운전면허 ───────── */
export function evaluateLicenseOnDate(d8: string, rows: AnyRow[]) {
  const eligible = (rows ?? []).filter(r => regOK(d8, r.knpaRegDt));
  if (eligible.length === 0) return false;
  return eligible.some(r => {
    const statusOK = String(r?.psnSeNm ?? '').trim() === '유효';
    const notStopped = notWithin(d8, r.stopBgngYmd, r.stopEndYmd);
    return statusOK && notStopped;
  });
}

export function markLicenseFlagsForRow(d8: string, r: AnyRow) {
  const r8 = toYmd8(r.knpaRegDt);
  const __lc_reg  = !(r8 && cmp(r8, d8) <= 0);
  const __lc_sts  = String(r?.psnSeNm ?? '').trim() !== '유효';
  const __lc_stop = !notWithin(d8, r.stopBgngYmd, r.stopEndYmd);
  return { ...r, __lc_reg, __lc_sts, __lc_stop };
}

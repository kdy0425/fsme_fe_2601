/* ───────────────────────────── 분석 ───────────────────────────── */
import { listDays, toYmd8 } from './dateUtils';
import {
  DateMode, AnyRow,
  evaluateInsuranceOnDate, markInsuranceFlagsForRow,
  evaluateBizOnDate,       markBizFlagsForRow,
  evaluateLicenseOnDate,   markLicenseFlagsForRow,
  evaluateQualOnDate,      QualAccessors,
} from './checkers';

export type EnabledChecks = {
  insurance?: boolean;
  biz?: boolean;
  license?: boolean;
  qual?: boolean;
};

export type DateModes = {
  insurance?: DateMode; // 기본 'START_TO_REG'
  biz?: DateMode;       // 기본 'START_TO_REG'
  // license는 등록일+정지기간만 사용
  // qual은 취득~취소 + kotsaRegDt 게이트
};

const Blue = (txt: string) => `<span style="color:#1976d2;font-weight:600">${txt}</span>`;
const Red  = (txt: string) => `<span style="color:#d32f2f;font-weight:600">${txt}</span>`;

export function markDetailsOnDate(
  d8: string,
  detail: { ins?: AnyRow[]; biz?: AnyRow[]; lic?: AnyRow[]; qual?: AnyRow[] },
  modes: DateModes
) {
  const ins = (detail.ins ?? []).map(r => markInsuranceFlagsForRow(d8, r, modes.insurance ?? 'START_TO_REG'));
  const biz = (detail.biz ?? []).map(r => markBizFlagsForRow(d8, r, modes.biz ?? 'START_TO_REG'));
  const lic = (detail.lic ?? []).map(r => markLicenseFlagsForRow(d8, r));
  const q   = detail.qual ?? [];
  return { ins, biz, lic, qual: q };
}

export function computeMainFieldsOnDate(
  d8: string,
  row: Record<string, any>,
  detail: { ins?: AnyRow[]; biz?: AnyRow[]; lic?: AnyRow[]; qual?: AnyRow[] },
  enabled: EnabledChecks,
  modes: DateModes,
  qualAcc: QualAccessors
) {
  const out: Record<string, any> = {};

  if (enabled.insurance) {
    const ins = evaluateInsuranceOnDate(d8, detail.ins ?? [], modes.insurance ?? 'START_TO_REG');
    out.twdpsn1SeNmAnls = ins.t1OK ? Blue('유효') : Red('미유효');
    out.twdpsn2SeNmAnls = ins.t2OK ? Blue('유효') : Red('미유효');
    out.sbsttNmAnls     = ins.sOK  ? Blue('유효') : Red('미유효');
  }

  if (enabled.qual) {
    const ok = evaluateQualOnDate(d8, detail.qual ?? [], qualAcc);
    out[qualAcc.statKey + 'Anls'] = ok ? Blue('유효') : Red('미유효');
  }

  if (enabled.biz) {
    const ok = evaluateBizOnDate(d8, detail.biz ?? [], modes.biz ?? 'START_TO_REG');
    out.bzmnSttsCdNmAnls = ok ? Blue('유효') : Red('미유효');
  }

  if (enabled.license) {
    const ok = evaluateLicenseOnDate(d8, detail.lic ?? []);
    out.psnSeNmAnls = ok ? Blue('유효') : Red('미유효');
  }

  return out;
}

export function calcInvalidDaysForPeriodComposed(
  from8: string,
  to8: string,
  row: Record<string, any>,
  detail: { ins?: AnyRow[]; biz?: AnyRow[]; lic?: AnyRow[]; qual?: AnyRow[] },
  enabled: EnabledChecks,
  modes: DateModes,
  qualAcc: QualAccessors
) {
  const days = listDays(from8, to8);
  const vehOK = String(row.vhclSttsCdNm ?? row.vhclSttsNm ?? '').trim() === '정상';

  return days.filter(ymd => {
    const d8 = ymd.replaceAll('-', '');
    if (!vehOK) return true;

    const insOK = enabled.insurance
      ? evaluateInsuranceOnDate(d8, detail.ins ?? [], modes.insurance ?? 'START_TO_REG').isValid
      : true;

    const bizOK = enabled.biz
      ? evaluateBizOnDate(d8, detail.biz ?? [], modes.biz ?? 'START_TO_REG')
      : true;

    const licOK = enabled.license
      ? evaluateLicenseOnDate(d8, detail.lic ?? [])
      : true;

    const qOK = enabled.qual
      ? evaluateQualOnDate(d8, detail.qual ?? [], qualAcc)
      : true;

    return !(insOK && bizOK && licOK && qOK);
  });
}

/* 보조: 동일 차량의 최신행 선택 (hstrySn/sn 사용) */
export const pickLatestSamePlate = (rows: any[], plate: string) => {
  const norm = (v?: string) => (!v ? '' : String(v).replace(/[\s-]/g, '').toUpperCase());
  const same = rows
    .map((r, idx) => ({ r, idx }))
    .filter(x => norm(x.r.vhclNo) === norm(plate))
    .sort((a, b) => Number((a.r.hstrySn ?? a.r.sn ?? 0)) - Number((b.r.hstrySn ?? b.r.sn ?? 0)));
  return same.length ? same[same.length - 1] : null;
};

export function calcInvalidByDateComposed(
  from8: string,
  to8: string,
  row: Record<string, any>,
  detail: { ins?: AnyRow[]; biz?: AnyRow[]; lic?: AnyRow[]; qual?: AnyRow[] },
  enabled: { insurance?: boolean; biz?: boolean; license?: boolean; qual?: boolean },
  modes: { insurance?: DateMode; biz?: DateMode },
  qualAcc: QualAccessors
) {
  const dates = listDays(from8, to8); // ['YYYY-MM-DD', ...]
  const invalidReasons: Record<string, string[]> = {};
  const invalidDays: string[] = [];

  for (const ymd of dates) {
    const d8 = ymd.replaceAll('-', '');

    const reasons: string[] = [];

    if (enabled.insurance) {
      const ins = evaluateInsuranceOnDate(d8, detail.ins ?? [], modes.insurance ?? 'START_TO_REG');
      if (!ins.isValid) reasons.push('의무보험 미유효');
    }
    if (enabled.qual) {
      const ok = evaluateQualOnDate(d8, detail.qual ?? [], qualAcc);
      if (!ok) reasons.push('운수종사자격 미유효');
    }
    if (enabled.biz) {
      const ok = evaluateBizOnDate(d8, detail.biz ?? [], modes.biz ?? 'START_TO_REG');
      if (!ok) reasons.push('사업자정보 미유효');
    }
    if (enabled.license) {
      const ok = evaluateLicenseOnDate(d8, detail.lic ?? []);
      if (!ok) reasons.push('면허정보 미유효');
    }

    if (reasons.length > 0) {
      invalidDays.push(ymd);
      invalidReasons[ymd] = reasons;
    }
  }

  return { invalidDays, invalidReasons };
}

/* ───────────────────────────── 분석 유효성 체크 Utils ───────────────────────────── */
export const toYmd8 = (d?: unknown): string | null => {
  if (d == null) return null;
  const digits = String(d).replace(/[^\d]/g, '');
  return digits.length >= 8 ? digits.slice(0, 8) : null;
};

export const cmp = (a: string, b: string) => (a === b ? 0 : a < b ? -1 : 1);

export const between = (d8: string, from8?: unknown, to8?: unknown) => {
  if (!d8) return false;
  const f = toYmd8(from8) ?? '00000101';
  const t = toYmd8(to8) ?? '99991231';
  return cmp(f, d8) <= 0 && cmp(d8, t) <= 0;
};

// 시작일이 없으면 포함 아님(false)
export const inPeriodStrict = (d8: string, from8?: unknown, to8?: unknown) => {
  const f = toYmd8(from8);
  if (!f) return false;
  const t = toYmd8(to8) ?? '99991231';
  return cmp(f, d8) <= 0 && cmp(d8, t) <= 0;
};

export const notWithin = (d8: string, from8?: unknown, to8?: unknown) => {
  const f = toYmd8(from8) ?? '99991231';
  const t = toYmd8(to8) ?? '99991231';
  return !(cmp(f, d8) <= 0 && cmp(d8, t) <= 0);
};

export const listDays = (from8: string, to8: string) => {
  const s = new Date(+from8.slice(0, 4), +from8.slice(4, 6) - 1, +from8.slice(6, 8));
  const e = new Date(+to8.slice(0, 4), +to8.slice(4, 6) - 1, +to8.slice(6, 8));
  const out: string[] = [];
  for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    out.push(`${y}-${m}-${day}`);
  }
  return out;
};

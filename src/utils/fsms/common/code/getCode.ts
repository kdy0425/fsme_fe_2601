import { sendHttpRequest } from "../apiUtils";

/* ------------------------ 공통: 타입 ------------------------ */
export type CodeOption = { code: string; label: string };

type SortBy = "sortSeq" | "code" | "label" | "parentChild";
type SortOrder = "asc" | "desc";

export type GetStatsClsfArgs = {
  /** A: 분류코드, B: 항목코드, C: 단위코드 */
  clsfSeCd: "A" | "B" | "C";
  useYn?: "Y" | "N";
  /** 부모 필터(없으면 전체) */
  parent?:
    | { type: "root" }     // 루트만 (A.CLSF_PRNT_CD IS NULL)
    | { code: string }     // 특정 부모
    | { codes: string[] }; // 여러 부모(클라에서 병합)
  /** 코드/명 LIKE 검색 (옵션) */
  search?: { code?: string; nameLike?: string };
  /** 페이징(기본 page=1, size=2000) */
  page?: number;
  size?: number;
  /**
   * 정렬(기본: sortSeq ASC)
   * - by: 'parentChild' → 부모→자식 계층 정렬
   * - parentBy/childBy: 부모/자식 그룹 각각의 정렬 기준(기본 sortSeq)
   */
  sort?: {
    by: SortBy;
    order?: SortOrder;              // parentChild에서도 부모/자식 모두 이 order 사용(기본 asc)
    locale?: string;
    numeric?: boolean;
    parentBy?: "sortSeq" | "code" | "label";
    childBy?: "sortSeq" | "code" | "label";
  };
};


export const getCityCodes = async (ctpvCd?: string) => { // 시도 조회
  try {
    let endpoint: string = `/fsm/cmm/cmmn/cm/getAllLocgovCd?locgovSeCd=0` 
                          + `${ctpvCd ? '&ctpvCd=' + ctpvCd : ''}`
                          +'&page=1&size=2000';

    const response = await sendHttpRequest('GET', endpoint, null, false);

    if (response && response.resultType === 'success' && response.data) {
      return response.data.content;
    }
  }catch(error) {
    console.error('Error get City Code data:', error);
  }
}

export const getLocalGovCodes = async (ctpvCd?: string | number, locgovCd?: string) => { // 관할관청 코드 조회
  try {
    let endpoint: string = `/fsm/cmm/cmmn/cm/getAllLocgovCd?locgovSeCd=1` 
                          + `${ctpvCd ? '&ctpvCd=' + ctpvCd : ''}`
                          + `${locgovCd ? '&locgovCd=' + locgovCd : ''}`
                          +'&page=1&size=2000';

    const response = await sendHttpRequest('GET', endpoint, null, false);

    if (response && response.resultType === 'success' && response.data) {
      return response.data.content;
    }
  }catch(error) {
    console.error('Error get Local Gov Code data:', error);
  }
} 

export const getCodesByGroupNm = async (cdGroupNm: string) => {
  try {
    let endpoint: string = `/fsm/cmm/cmmn/cm/getAllCmmnCd?cdGroupNm=${cdGroupNm}&page=1&size=2000`

    const response = await sendHttpRequest('GET', endpoint, null, false);

    if (response && response.resultType === 'success' && response.data) {
      return response.data;
    }

  }catch(error) {
    console.error('Error get Code Group Data: ', error);
  }

    
}

export const getGroupCodeOptions = async (cdGroupNm: string, includeAll?: string): Promise<CodeOption[]> => {
  const list = await getCodesByGroupNm(cdGroupNm);
  const opts: CodeOption[] = (Array.isArray(list) ? list : []).map((row: any) => ({
    code: row.cdNm ?? row.code ?? row.cd ?? "",
    label: row.cdKornNm ?? row.label ?? row.cdNm ?? "",
  })).filter(o => o.code && o.label);

  // code 기준 중복 제거
  const uniq = Array.from(new Map(opts.map(o => [o.code, o])).values());
  if (includeAll) uniq.unshift({ code: "", label: includeAll });
  return uniq;
};

/* ------------------------ 분류코드 APIs (DW_STATS_CLSF_CODE) ------------------------ */

const toNum = (v: unknown): number => {
  if (v == null) return Number.POSITIVE_INFINITY;
  const n = Number(String(v).replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : Number.POSITIVE_INFINITY;
};
const cmpStr = (a: string, b: string, locale?: string, numeric?: boolean) =>
  String(a).localeCompare(String(b), locale, { numeric });

const normParent = (v: any) => {
  if (v == null) return null;
  const s = String(v).trim();
  return s === '' ? null : s;
};

/** 내부: MyBatis(getAllStatsClsfCd) 단일 호출 */
async function fetchStatsClsfOnce(params: {
  clsfSeCd: "A" | "B" | "C";
  useYn?: "Y" | "N";
  clsfCdNm?: string;
  clsfCd?: string;
  /** 'NULL' 문자열 → 서버에서 IS NULL 처리 */
  clsfPrntCd?: string | "NULL";
  page?: number;
  size?: number;
}) {
  const qs = new URLSearchParams();
  qs.set("clsfSeCd", params.clsfSeCd);
  if (params.useYn) qs.set("useYn", params.useYn);
  if (params.clsfCdNm) qs.set("clsfCdNm", params.clsfCdNm);
  if (params.clsfCd) qs.set("clsfCd", params.clsfCd);
  if (params.clsfPrntCd !== undefined) qs.set("clsfPrntCd", params.clsfPrntCd);
  qs.set("page", String(params.page ?? 1));
  qs.set("size", String(params.size ?? 2000));

  const endpoint = `/fsm/star/cm/cm/getAllStatsClsfCd?${qs.toString()}`;
  const res = await sendHttpRequest("GET", endpoint, null, true, { cache: "no-store" });

  const content: any[] = res?.data?.content ?? res?.data ?? [];
  return content.map((row) => ({
    code: row.clsfCd ?? row.CLSF_CD,
    label: row.clsfCdNm ?? row.CLSF_CD_NM,
    parent: normParent(row.clsfPrntCd ?? row.CLSF_PRNT_CD),
    sortSeq: row.sortSeq ?? row.SORT_SEQ,
  }));
}

/** 공개: 분류코드 가져오기(부모/정렬/검색 지원) */
export async function getStatsClsfOptions(args: GetStatsClsfArgs): Promise<CodeOption[]> {
  const {
    clsfSeCd,
    useYn = "Y",
    parent,
    search,
    page = 1,
    size = 2000,
    sort = { by: "sortSeq", order: "asc" },
  } = args;

  // 여러 부모 코드 → 병렬 호출 후 병합
  if (parent && "codes" in parent) {
    const chunks = await Promise.all(
      (parent.codes ?? []).map((code) =>
        fetchStatsClsfOnce({
          clsfSeCd,
          useYn,
          clsfCdNm: search?.nameLike,
          clsfCd: search?.code,
          clsfPrntCd: code,
          page,
          size,
        })
      )
    );
    const merged = chunks.flat();
    return sortAndPack(merged, sort);
  }

  // 단일(루트/특정/전체)
  const rows = await fetchStatsClsfOnce({
    clsfSeCd,
    useYn,
    clsfCdNm: search?.nameLike,
    clsfCd: search?.code,
    clsfPrntCd:
     parent && 'type' in parent && parent.type === 'root' ? "NULL" : parent && "code" in parent ? parent.code : undefined,
    page,
    size,
  });

  return sortAndPack(rows, sort);
}

/** 내부: 정렬 + {code,label} 변환 + 중복 제거 */
function sortAndPack(
  rows: Array<{ code: string; label: string; parent: string | null; sortSeq: any }>,
  sort: {
    by: SortBy;
    order?: SortOrder;
    locale?: string;
    numeric?: boolean;
    parentBy?: "sortSeq" | "code" | "label";
    childBy?: "sortSeq" | "code" | "label";
  }
): CodeOption[] {
  const {
    by = "sortSeq",
    order = "asc",
    locale,
    numeric,
    parentBy = "sortSeq",
    childBy = "sortSeq",
  } = sort;

  // code → row 인덱스 (부모 정보 조회용)
  const index = new Map(rows.map((r) => [r.code, r]));
  const sign = order === "desc" ? -1 : 1;

  const getKey = (r: any, key: "sortSeq" | "code" | "label") => {
    if (key === "sortSeq") return toNum(r.sortSeq);
    if (key === "code") return r.code;
    return r.label;
  };

  const compareParent = (aParentCode: string, bParentCode: string) => {
    const pa = index.get(aParentCode);
    const pb = index.get(bParentCode);
    // 부모 row가 리스트에 없으면 코드 문자열 비교(폴백)
    if (!pa || !pb) return cmpStr(aParentCode, bParentCode, locale, numeric);
    const ka = getKey(pa, parentBy);
    const kb = getKey(pb, parentBy);
    if (parentBy === "sortSeq") return sign * (toNum(ka) - toNum(kb));
    return sign * cmpStr(String(ka), String(kb), locale, numeric);
  };

  const hierCmp = (a: any, b: any) => {
    const aGroup = a.parent ?? a.code; // 부모 코드 또는 자기 자신(루트)
    const bGroup = b.parent ?? b.code;

    // 1) 그룹(부모)끼리 우선 비교
    if (aGroup !== bGroup) {
      return compareParent(aGroup, bGroup);
    }

    // 2) 같은 그룹이면 부모가 먼저
    const aIsParent = a.parent == null ? 0 : 1;
    const bIsParent = b.parent == null ? 0 : 1;
    if (aIsParent !== bIsParent) return aIsParent - bIsParent;

    // 3) 자식 간(또는 부모 간) 내부 정렬
    const ka = getKey(a, childBy);
    const kb = getKey(b, childBy);
    if (childBy === "sortSeq") return sign * (toNum(ka) - toNum(kb));
    return sign * cmpStr(String(ka), String(kb), locale, numeric);
  };

  const basicCmp = (a: any, b: any) => {
    if (by === "sortSeq") return sign * (toNum(a.sortSeq) - toNum(b.sortSeq));
    if (by === "code") return sign * cmpStr(a.code, b.code, locale, numeric);
    return sign * cmpStr(a.label, b.label, locale, numeric);
  };

  const sorted =
    by === "parentChild" ? [...rows].sort(hierCmp) : [...rows].sort(basicCmp);

  // code 기준 중복 제거 후 {code,label}
  return Array.from(new Map(sorted.map((o) => [o.code, { code: o.code, label: o.label }])).values());
}

/** 가독성용 별칭: 기본 계층 정렬 */
export async function getStatsClsfOptionsHier(args: Omit<GetStatsClsfArgs, "sort">) {
  return getStatsClsfOptions({
    ...args,
    sort: { by: "parentChild" },
  });
}

/** 1) 루트(부모) 코드: 전부 긁어와서(UseYn 무시) 클라에서 루트 산출
 *  - parent == null 이거나, ''(빈문자/공백)도 루트로 간주
 *  - 자식이 없어도 루트는 모두 포함
 */
export async function getStatsClsfRootsMerged(
  args: Omit<GetStatsClsfArgs, "parent" | "sort" | "useYn"> & { size?: number }
): Promise<CodeOption[]> {
  const { clsfSeCd, size = 9999 } = args;

  // ✅ 서버에 루트 조건 안 걸고 "전체"를 받아온 뒤, 클라에서 루트 판정
  const rows = await fetchStatsClsfOnce({ clsfSeCd, size });

  // 🔎 parent == null OR ''(trim 후 공백 포함) → 루트 취급
  const isNullOrEmpty = (v: unknown) =>
    v == null || (typeof v === 'string' && v.trim() === '');

  const roots = rows.filter(r => isNullOrEmpty(r.parent));

  // 중복 제거(code) + 정렬(sortSeq → label)
  const uniq = Array.from(new Map(roots.map(r => [r.code, r])).values());
  uniq.sort((a, b) => {
    const toNum = (v: unknown) => {
      if (v == null) return Number.POSITIVE_INFINITY;
      const n = Number(String(v).replace(/[^\d.-]/g, ""));
      return Number.isFinite(n) ? n : Number.POSITIVE_INFINITY;
    };
    const sa = toNum(a.sortSeq), sb = toNum(b.sortSeq);
    if (sa !== sb) return sa - sb;
    return String(a.label).localeCompare(String(b.label), undefined, { numeric: true });
  });

  return uniq.map(r => ({ code: r.code, label: r.label }));
}

/** 2) 전체 옵션(라벨→코드 매핑/폴백 용) */
export async function getStatsClsfAllOptionsSimple(
  clsfSeCd: "A" | "B" | "C",
  size = 9999
): Promise<CodeOption[]> {
  return getStatsClsfOptions({ clsfSeCd, sort: { by: "sortSeq" }, size });
}

/** 3) 단일 코드의 부모코드 조회(자동 펼침 용) */
export async function getStatsClsfParentCode(
  clsfSeCd: "A" | "B" | "C",
  code: string
): Promise<string | null> {
  const qs = new URLSearchParams();
  qs.set("clsfSeCd", clsfSeCd);
  qs.set("clsfCd", code);
  qs.set("page", "1");
  qs.set("size", "1");

  const endpoint = `/fsm/star/cm/cm/getAllStatsClsfCd?${qs.toString()}`;
  const res = await sendHttpRequest("GET", endpoint, null, true, { cache: "no-store" });
  const row = (res?.data?.content ?? res?.data ?? [])[0];
  const parent = row?.clsfPrntCd ?? row?.CLSF_PRNT_CD ?? null;
  return parent ?? null;
}

/** 4) 모달용 한 번에 로드: 부모 합본 + 전체 + flatMode 판정 */
export async function loadStatsClsfForModal(
  clsfSeCd: "A" | "B" | "C"
): Promise<{ parents: CodeOption[]; all: CodeOption[]; flatMode: boolean }> {
  const [parentsMerged, all] = await Promise.all([
    getStatsClsfRootsMerged({ clsfSeCd }),
    getStatsClsfAllOptionsSimple(clsfSeCd),
  ]);
  const flatMode = parentsMerged.length === 0;
  return { parents: flatMode ? all : parentsMerged, all, flatMode };
}

export async function getStatsClsfChildren(
  clsfSeCd: 'A' | 'B' | 'C',
  parentCode: string,
  size = 9999
) {
  return getStatsClsfOptions({
    clsfSeCd,
    parent: { code: parentCode },
    sort: { by: 'sortSeq' },
    size,
  });
}

export async function getStatsClsfHasChildrenSet(
  clsfSeCd: 'A' | 'B' | 'C',
  size = 9999
): Promise<Set<string>> {
  const rows = await fetchStatsClsfOnce({ clsfSeCd, size }); // parent 필드 포함
  const set = new Set<string>();
  rows.forEach(r => { if (r.parent) set.add(r.parent); });
  return set; // 자식을 가진 부모 코드들
}
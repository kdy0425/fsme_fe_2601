export interface UnifySearch {
    searchWord?: string    // 키워드
    preSearchWord?: string // 재검색 키워드
    reSearchYn?: string    // 재검색
    searchOption?: string  // 검색 방법
    searchSort?: string    // 정렬
    searchRange?: string   // 검색범위
    currentPage?: number   // 페이지 번호
    displaySize?: number   // 페이지 사이즈
    userCd?: string        // User tid
    startDate?: string     // 시작일자
    endDate?: string       // 종료일자
    searchMenu?: string    // 카테고리
}

export interface SearchResponse {
  error?: string
  reponseTime?: string
  resultSet?: ResultSet
  returnCode?: number
  status?: number
  version?: number
}

export interface ResultSet {
  errorCode: number
  result: Result[]
}

export interface Result {
  resultDocuments: ResultDocument[]
  totalSize: number 
}

export interface ResultDocument {
  BBSCTTSN: string
  BBSSN: string
  CN: string
  DQ_ID: string
  INCLLOCGOVCD: string
  INQCNT: string
  LEADCNCD: string
  LOCGOVNM: string
  LTRCN: string
  LTRTRSMYN: string
  LTRTTL: string
  MDFCNDT: string
  MDFRID: string
  MSGSENDORDER: string
  ORIINQCNT: string
  ORITTL: string
  POPUPBGNGYMD: string
  POPUPENDYMD: string
  POPUPNTCYN: string
  REGDT: string
  RELATETASKSECD: string
  RGTRID: string
  TTL: string
  URL: string
  USERINFO: string
  USERNM: string
  USEYN: string
  MENU_NM: string
  RTROACTDMNDNM: string
  RTROACTDMNDCN: string
  REGYMD: string
  TASKSECDNM: string
  PRCSSTTSCDNM: string
  RTROACTDMNDTSID: string
}

export const SearchType = {
  notice: 'notice',
  ref: 'ref',
  faq: 'faq',
  qna: 'qna',
  compl: 'compl',
  law: 'law',
  work: 'work',
  menu: 'menu',
  ret: 'ret'
}

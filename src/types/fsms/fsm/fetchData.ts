export interface FetchListData {
  resultType: string
  status: number
  message: string
  data: {
    pageSize: number
    totalPages: number
    totalElements: number
    size: number
    content: []
    number: number
    sort: {
      empty: boolean
      sorted: boolean
      unsorted: boolean
    }
    first: boolean
    last: boolean
    numberOfElements: number
    pageable: {
      pageNumber: number
      pageSize: number
      sort: {
        empty: boolean
        sorted: boolean
        unsorted: boolean
      }
      offset: number
      paged: boolean
      unpaged: boolean
    }
    empty: boolean
  }
}

export interface ListData {
  pageSize: number
  totalPages: number
  totalElements: number
  size: number
  content: []
  number: number
  sort: {
    empty: boolean
    sorted: boolean
    unsorted: boolean
  }
  first: boolean
  last: boolean
  numberOfElements: number
  pageable: {
    pageNumber: number
    pageSize: number
    sort: {
      empty: boolean
      sorted: boolean
      unsorted: boolean
    }
    offset: number
    paged: boolean
    unpaged: boolean
  }
  empty: boolean
}

// 게시글 상세조회 응답 타입 정의
export type FetchOneData = {
  data?: PostData
  message: string
  resultType: string
  status: number
}

// 게시글 타입에 포함된 data 프로퍼티 타입 정의
export type PostData = {
  ttl: string
  cn: string
  postTsid: string
  telgmLen: number
  regYmd: string
  sbmsnYn: string
  rgtrNm: string
  files: FileInfo[]
}

// 게시글 타입에 포함된 파일 정보 정의
export type FileInfo = {
  fileTsid: string
  fileNm: string
  fileClsfNm: string
  fileSeq: number
  fileExtnNm: string
  fileSize: number
  fileSyncCd: string
  downloadUrl?: string
}

export interface PostObj {
  url: string
  postTsid: string
  query?: string
  [k: string]: string | number | undefined
}

export interface FileSearchObj {
  fileGroupNm: string
  rfrncTsid: string
  fileClsfNm?: string
}

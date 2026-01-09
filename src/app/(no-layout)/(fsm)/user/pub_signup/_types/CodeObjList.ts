// 공통으로 빼야함
export interface CodeObjList {
  resultType: string,
  status: number,
  message: string,
  data: CodeObj[]
}

export interface CodeObj {
  cdGroupNm: string,
  cdNm: string,
  cdKornNm: string,
  upCdNm: string,
  cdSeq: number,
  cdExpln: string,
}
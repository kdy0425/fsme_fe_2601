export type listParamObj = {
  //prevUrl - 이전 url
  //sort - 컬럼,정렬
  //page - 페이지번호
  //size - 페이지 사이즈
  // searchValue - 검색어
  // searchSelect - 검색종류
  // searchPage - 현재페이지
  // searchSize - 현재사이즈
  // searchStDate - 시작일
  // searchEdDate - 종료일
  // searchCtpvCd - 시도
  // searchLocgovCd - 지자체
  prevUrl? : string,
  sort? : string,
  page? : number,
  size? : number,
  searchValue? : string,
  searchSelect? : string,
  searchPage? : number,
  searchSize? : number
  searchCtpvCd? : string,
  searchLocgovCd? : string,
  searchStDate? : string,
  searchEdDate? : string,
  searchBrno? : string
  searchVhclNo? : string
  searchBzmnSeCd? : string
  searchExmnNo? : string
  trnsfRsnCn? : string
  status? : string 
  sttsCd? : string
  [k: string]: string | undefined | number;
}
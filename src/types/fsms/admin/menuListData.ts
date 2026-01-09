export interface MenuListData {
  resultType: string,
  status: number,
  message: string,
  data: CdData[] | MenuData[];
}

export interface CdData {
    cdNm: string,
    cdGroupNm: string,
    upCdNm: string,
    cdKornNm: string,
    cdSeq: number,
    cdExpln: string,
    useYn: string,
    regYmd: string,
}

export interface MenuData {
    menuTsid?: string,
    menuSeq: string,
    menuNm: string,
    menuExpln: string,
    httpDmndMethNm: string,
    menuAcsAuthrtCd: string,
    urlAddr: string,
    npagYn: string,
    menuTypeCd: string,
    menuGroupCd: string,
    menuAuthrts?: MenuAuthrt[],
    userTypeCds?: string[],
}

export interface MenuAuthrt {
  menuTsid: string;
  menuGroupCd: string;
  userTypeCd?: string;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
}

export interface MenuObj {
  url: string,
  menuTsid: string,
  query?:string,
  [k:string] : string | number | undefined
}

export interface MenuOneData {
  data: MenuData[]
  message: string,
  resultType: string,
  status: number,
}

/* 검색조건 */
export interface listSearchObj {
    page:number
    size:number  
    vhclNo:string
    brno:string
}

/* 차량목록 */
export interface vhclRow {
    vhclNo:string
    brno:string
    koiCd?:string
    locgovCd:string
    dscntYn:string
    sttsCd:string
    ersrYmd?:string
    ersrRsnCd?:string
    dayoffUseYn?:string
    dayoffKndCd?:string
    dayoffSn?:string
    rgtrId?:string
    regDt:string
    mdfrId?:string
    mdfcnDt:string
    vertifyMdfcnDt:string
    locgovNm:string
    dscntNm:string
    sttsNm:string
    koiNm?:string
    ersrRsnNm?:string
}

export interface vhclStopRow {
    stopType:string
    vhclNo:string
    brno:string
    hstrySn:string
    bgngYmd:string
    endYmd:string
    delYnNm:string
    rgtrId:string
    regDt:string
    mdfrId:string
    mdfcnDt:string
    vhclRestrtYmd:string
}

/* 사업자목록 */
export interface bsnesRow {
    brno:string
    crno?:string
    bzmnSeCd?:string
    bzentyNm?:string
    rprsvNm?:string
    rprsvRrnoS?:string
    telno?:string
    sttsCd?:string
    txtnTypeCd?:string
    ntsChgYmd?:string
    ntsDclrYmd?:string
    rgtrId?:string
    regDt:string
    mdfrId?:string
    mdfcnDt:string
    bzmnSeNm?:string
    sttsNm?:string
    txtnTypeNm?:string
}

/* 카드목록 */
export interface cardRow {
    crdcoCd:string
    cardNo:string
    cardNoD:string
    vhclNo:string
    brno:string
    rcptYmd?:string
    rcptSeqNo?:string
    issuSeCd:string
    cardSeCd:string
    custSeCd?:string
    custNo?:string
    crno?:string
    rrnoS?:string
    flnm:string
    crdcoSttsCd?:string
    agncyDrvBgngYmd?:string
    agncyDrvEndYmd?:string
    dscntYn?:string
    dscntChgAplcnDscntYn?:string
    dscntChgAplcnYmd?:string
    koiCd?:string
    rgtrId?:string
    regDt:string
    mdfrId?:string
    mdfcnDt:string
    crdcoNm:string
    issuSeNm:string
    cardSeNm:string
    custSeNm?:string
    koiNm?:string
    crdcoSttsNm?:string
    dscntNm?:string
    dscntChgAplcnDscntNm?:string
}

export type hstryModalDatatype = {
    [key:string]:string
}

export interface HstryModalProps {
    open:boolean
    setOpen:React.Dispatch<React.SetStateAction<boolean>>
    hstryModalData:hstryModalDatatype
    hstryType:string
}

export interface vhclHstryRow extends vhclRow {
    hstrySn:number
    chgRsnNm:string
}

export interface bsnesHstryRow extends bsnesRow {
    hstrySn:number
    chgRsnNm:string
}

export interface cardHstryRow extends cardRow {
    hstrySn:number
    chgRsnNm:string
}

export interface procDataInterface {
    endPoint:string
    body:object
}

export interface AagncyDrvYmdModalInterface {
    open:boolean
    setOpen:React.Dispatch<React.SetStateAction<boolean>>
    processData:(procData:procDataInterface) => void
    selectedCardRows:cardRow|null
}

export interface agncyDrvYmdInterface {
    agncyDrvBgngYmd:string
    agncyDrvEndYmd:string
}

export interface PaperFileUploadModalProps {
    open: boolean
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
}
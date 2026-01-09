
    'use client'
import React, { useContext, useEffect, useState, useCallback } from 'react'
import { Box, Grid, Button, MenuItem, Stack, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, TableContainer, TableBody, TableRow, TableHead, TableSortLabel } from '@mui/material'
import { Label } from '@mui/icons-material'

import { BlankCard, Breadcrumb } from '@/utils/fsms/fsm/mui-imports'
import PageContainer from '@/components/container/PageContainer'
import { useRouter, useSearchParams } from 'next/navigation'
import { visuallyHidden } from '@mui/utils';

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'

import DetailDialog from '@/app/components/popup/DetailDialog';

// types
import FormDialog from '@/app/components/popup/FormDialog'
import { listParamObj } from '@/types/fsms/fsm/listParamObj'
import { HeadCell, Pageable2 } from 'table'
import { SelectItem } from 'select'
import { getCityCodes, getCodesByGroupNm, getLocalGovCodes } from '@/utils/fsms/common/code/getCode'
import { toQueryString } from '@/utils/fsms/utils'
import { sendHttpFileRequest, sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import DetailDataGrid from './DetailDataGrid'
import FormModal from './FormModal'
import { Table } from '@mui/material'
import { TableCell } from '@mui/material'
import { getCtpvCd, getExcelFile, getToday } from '@/utils/fsms/common/comm'
import { CommSelect, CtpvSelect, LocgovSelect } from '@/app/components/tx/commSelect/CommSelect'
import { LocHistoryModal } from '../LocHistoryModal'
import UserAuthContext from '@/app/components/context/UserAuthContext'
import { getDateRange } from '@/utils/fsms/common/util'
import CustomTableDataGrid2 from './CustomTableDataGrid2'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import {
    getAuthInfo,
    AuthInfo,
  } from '@/utils/fsms/fsm/utils-imports'
import { stnLtmmLgovMvtTr } from '@/utils/fsms/headCells'

    const BCrumb = [
    {
        to: '/',
        title: 'Home',
    },
    {
        title: '기준관리',
    },
    {
        title: '자격관리',
    },
    {
        to: '/stn/ltmm',
        title: '지자체이관전출관리',
    },
    ]



export  interface Row {
    prcsYmd?: string  // 요청일자 
    chk? : string // 체크박스 
    aplySn? : string 

    locgovCd?: string; // 관할관청 코드
    locgovNm?: string; // 관할관청 명
    vonrNm?: string; // 차량소유자명
    vhclNo?: string; // 차량번호
    koiCd?: string; // 유종코드
    koiCdNm?: string; // 유종
    koiNm?:string //유종
    vhclTonCd?: string; // 톤수코드
    vhclTonCdNm?: string; // 톤수
    CRNO?: string; // 법인등록번호 (원본)
    crnoS?: string; // 법인등록번호 (복호화)
    vonrRrno?: string; // 주민등록번호 (원본)
    vonrRrnoS?: string; // 주민등록번호 (복호화)
    vonrRrnoSecure?: string; // 주민등록번호 (별표)
    lcnsTpbizCd?: string; // 업종코드
    vhclSeCd?: string; // 차량구분코드
    vhclRegYmd?: string; // 차량등록일자
    yridnw?: string; // 연식
    len?: string; // 길이
    bt?: string; // 너비
    maxLoadQty?: string; // 최대적재수량
    vhclSttsCd?: string; // 차량상태코드
    vonrBrno?: string; // 차주사업자등록번호
    vhclPsnCd?: string; // 소유구분코드
    delYn?: string; // 삭제여부
    dscntYn?: string; // 할인여부
    souSourcSeCd?: string; // 원천소스구분코드
    bscInfoChgYn?: string; // 기본정보변경여부
    locgovAprvYn?: string; // 지자체승인여부
    rgtrId?: string; // 등록자아이디
    regDt?: string; // 등록일시
    mdfrId?: string; // 수정자아이디
    mdfcnDt?: string; // 수정일시
    prcsSttsCd?: string; // 처리상태코드
    prcsSttsCdDtlNm?: string; // 처리상태 상세
    prcsSttsCdNm?: string; // 처리상태명
    handleDt?: string; // 처리일자
    rfslRsnCn?: string; // 거절사유
    reqDt?: string; // 등록일자
    dmndSeCd?: string; // 요청구분코드
    carLocgovCd?: string; // 차량의 지자체코드
    carLocgovNm?: string; // 차량의 지자체명
    crnoSecure?: string; // 법인등록번호 (별표)
    vhclTonNm?: string; // 톤수명
    lcnsTpbizNm?: string; // 면허업종명
    vhclSttsNm?: string; // 차량최종상태명
    vhclPsnNm?: string; // 차량소유구분명
    exsLocgovCd?: string; // 기존지자체코드
    exsLocgovNm?: string; // 기존지자체명
    chgLocgovCd?: string; // 변경지자체코드
    chgLocgovNm?: string; // 변경지자체명
    bzentyNm?: string; // 업체명
    processStatus?: string; // 처리상태
    ftxAsstAmt?: string; // 유류세연동보조금
    opisAmt?: string; // 유가연동보조금
    aprvAmt?: string; // 승인금액
    fuelQty?: string; // 연료량

    aplcnYmd?: string;      // 적용일자
    hstrySn?: string;       // 이력일련번호
    trsmYn?: string;        // 전송여부
    trsmDt?: string;        // 전송일시 

}
    const headCells: HeadCell[] = [
    {
        id: 'check',
        numeric: false,
        disablePadding: false,
        label: '',
        format: 'checkbox',
    },
    {
        id: 'regDt',
        numeric: false,
        disablePadding: false,
        label: '요청일자',
        format: 'yyyymmdd'
    },
    {
        id: 'vonrBrno',
        numeric: false,
        disablePadding: false,
        label: '주민사업자번호',
    },
    {
        id: 'bzentyNm',
        numeric: false,
        disablePadding: false,
        label: '업체명',
    },
    {
        id: 'vhclNo',
        numeric: false,
        disablePadding: false,
        label: '차량번호',
    },
    {
        id: 'exsLocgovNm',
        numeric: false,
        disablePadding: false,
        label: '전출관청',
    },
    {
        id: 'chgLocgovNm',
        numeric: false,
        disablePadding: false,
        label: '전입관청',
    },
    {
        id: 'prcsSttsCdDtlNm',
        numeric: false,
        disablePadding: false,
        label: '처리상태',
    },
    ]

export interface ButtonGroupActionProps {
    onClickApporveAllBtn: (rows : Row[]) => void // 일괄승인 버튼 action
    onClickDeclineAllBtn: (rows : Row[]) => void // 일괄거절 버튼 action
    onClickApproveBtn: (row : Row) => void // 승인 버튼 action
    onClickDeclineBtn: (row : Row) => void // 거절 버튼 action
    onClickCancelBtn: (row : Row) => void  // 취소 버튼 action
    onClickCheckMoveCenterHistoryBtn: (row: Row) => void // 관할관청 이관이력 버튼 action
    }
const checkAllEffectiveness = (rows :Row[], userLocgov: string):boolean => {
    return rows.filter((row) => {
        return userLocgov === row.exsLocgovCd // 사용자 관할관청과 전출관청이 같은지 확인
        &&  row?.dmndSeCd === '02' && row?.prcsSttsCd  === '01'  ; // 요청수신인지 확인
    }).length == rows.length && rows.length > 0;
}

const checkEffectiveness = (row: Row, userLocgov: string ): boolean => {
    return (
        userLocgov === row.exsLocgovCd  // 사용자 관할관청과 전출관청이 같은지 확인
        &&  row?.dmndSeCd === '02' && row?.prcsSttsCd  === '01'           // 요청수신인지 확인
    );
};

const checkCalcelEffectiveness = (row: Row, userLocgov: string): boolean => {
    return (
        userLocgov === row.exsLocgovCd && // 사용자 관할관청과 전출관청이 같은지 확인
        row?.dmndSeCd === '01' && row?.prcsSttsCd === '01'          // 요청발신인지 확인 
    );
};
    
    // 목록 조회시 필요한 조건
// 목록 조회시 필요한 조건
type listSearchObj = {
    page: number
    size: number
    searchValue: string
    searchSelect: string
    bgngDt: string
    endDt: string
    [key: string]: string | number // 인덱스 시그니처 추가
  }


    const rowData: Row[] = []


    const FreightPage = () => {

    const router = useRouter() // 화면이동을 위한객체
    const querys = useSearchParams() // 쿼리스트링을 가져옴
    const allParams: listParamObj = Object.fromEntries(querys.entries()) // 쿼리스트링 값을 오브젝트 형식으로 담음
    

    const [flag, setFlag] = useState<boolean|null>(null) // 데이터 갱신을 위한 플래그 설정

    const [confirmOpen, setConfirmOpen] = useState(false) // 다이얼로그 상태
    const [dialogContent, setDialogContent] = useState<string>('') // 다이얼로그 내용
    const [dialogActionType, setDialogActionType] = useState<string>('') // 다이얼로그 액션 타입


    const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
    const [totalRows, setTotalRows] = useState(0) // 총 수
    const [loading, setLoading] = useState(false) // 로딩여부

    const [selectedIndex, setSelectedIndex] = useState<number>(-1)
    const [selectedRows, setSelectedRows] = useState<string[]>([]) // 체크 로우 데이터

    const [locOpen, setLocOpen] = useState(false) // 이관이력 Dialog 상태 
    const [selectedRow, setSelectedRow] = useState<Row | undefined>() // 선택된 Row를 저장할 state

    const [excelFlag, setExcelFlag] = useState<boolean>(false) // 조회조건 변경 시 엑셀기능 동작여부
    const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 로딩상태

    const [open, setOpen] = useState<boolean>(false);

    const [localGovCode, setLocalGovCode] = useState<SelectItem[]>([]) // 관할관청 코드
    const [locgovNm, setLocgvNm] = useState<string>() // 사용자 코드 
    const [curSearchLocgCd, setCurSearchLocgCd] = useState<string>('') // 현재 검색된 지역코드 
    const [isCurrSamelocgov,setIsCurrSameLocgov] = useState<boolean>(false)
    const [authInfo, setAuthInfo] = useState<AuthInfo>()
    
    // 초기 데이터 로드
    useEffect(() => {
        async function loadFuntion() {
            setAuthInfo(await getAuthInfo())
        }
        loadFuntion()
        const dateRange = getDateRange('date', 30);

        let startDate = dateRange.startDate;
        let endDate = dateRange.endDate;

        setParams((prev) => ({...prev, 
            bgngDt: startDate,
            endDt: endDate
        }))

    }, [])
        
    useEffect(() => {
        //첫행조회
        if (rows.length > 0) {
        handleRowClick(rows[0], 0)
        }
    }, [rows])

    useEffect(() => {
        let locgovCodes: SelectItem[] = [
        ]

        // 관할관청 select item setting
        getLocalGovCodes().then((res) => {
            if (res) {
                res.map((code: any) => {
                    let item: SelectItem = {
                        label: code['locgovNm'],
                        value: code['locgovCd'],
                    }
                    locgovCodes.push(item)
                })
            }
            setLocalGovCode(locgovCodes)
        })

    }, [])

    useEffect(() => {
        //if (localGovCode.length > 0 && 'locgovCd' in authInfo && authInfo.locgovCd) {
        if (localGovCode.length > 0 && authInfo && authInfo?.authSttus?.locgovCd) {
            const matchedItem = localGovCode.find(
                //(item) => item.value === authInfo.locgovCd
                (item) => item.value === authInfo?.authSttus?.locgovCd
            );
            if (matchedItem) {
                setLocgvNm(matchedItem.label); // Assuming `setLocgvNm` sets the label of the matched item
            }
        }
    }, [authInfo,localGovCode])

    useEffect(() => {
        //if (localGovCode.length > 0 && authInfo && 'locgovCd' in authInfo && authInfo.locgovCd && curSearchLocgCd !== '') {
        if (localGovCode.length > 0 && authInfo && authInfo?.authSttus?.locgovCd) {
            setIsCurrSameLocgov(authInfo?.authSttus?.locgovCd === curSearchLocgCd)
        }else{
            setIsCurrSameLocgov(false)
        }
    }, [authInfo,localGovCode, curSearchLocgCd ])


    // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
    const [params, setParams] = useState<listSearchObj>({
        page: Number(allParams.page ?? 1), // 페이지 번호는 1부터 시작
        size: Number(allParams.size ?? 10), // 기본 페이지 사이즈 설정
        searchValue: allParams.searchValue ?? '', // 검색어
        searchSelect: allParams.searchSelect ?? 'ttl', // 종류
        bgngDt: String(allParams.bgngDt ?? ''), // 시작일
        endDt: String(allParams.endDt ?? ''), // 종료일
    })
    //
    const [pageable, setPageable] = useState<Pageable2>({
        pageNumber: 1, // 페이지 번호는 1부터 시작
        pageSize: 10, // 기본 페이지 사이즈 설정
        totalPages: 1,
    })



    // 플래그의 변화를 통해 현재 정보를 기준으로 데이터를 가져오기위해 설정
    useEffect(() => {
        if(flag != null){
        fetchData()
        }
    }, [flag])
    

    // 행 클릭 시 호출되는 함수
    const handleRowClick = (selectedRow: Row, index?: number) => {
        setSelectedRow(selectedRow);
        setSelectedIndex(index?? -1);
    }


    
    // 검색 조건을 쿼리스트링으로 변환하기 위한 객체
    const [qString, setQString] = useState<string>('')

    // 검색 조건이 변경되면 자동으로 쿼리스트링 변경
    useEffect(() => {
        setQString(toQueryString(params))
    }, [params])

    const handleCheckChange = (selected: string[]) => {
        setSelectedRows(selected)
    }

    // 검색시 검색 조건에 맞는 데이터 갱신 및 1페이지로 이동
    const handleAdvancedSearch = (event: React.FormEvent) => {
        event.preventDefault()
        setParams((prev) => ({ ...prev, page:1, size: 10 })) // 첫 페이지로 이동
        setFlag(prev => !prev)
    }

    // 페이지 번호와 페이지 사이즈를 params에 업데이트
    const handlePaginationModelChange = useCallback(
        (page: number, pageSize: number) => {
        setParams((prev) => ({
            ...prev,
            page: page, // 실제 DB에서 조회시 -1을 하므로 +1 추가해서 넘겨야함. 페이지는 1로 보이지만 DB에선 0으로 조회
            size: pageSize,
        }))
        setFlag((prev) => !prev)
        },
        [],
    )
    
    // 시작일과 종료일 비교 후 일자 변경
    const handleSearchChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
        const { name, value } = event.target
        const regex = /[\-~`!@#$%^&*()_+={}[\]|\\:;"'<>,.?/]/g
        if(name == 'vhclNo'){
            setParams((prev) => ({ ...prev, page: 1, [name]: value.replaceAll(' ', '').replaceAll(regex, '') }))
        }else{
            setParams((prev) => ({ ...prev, page: 1, [name]: value}))
        }
        setExcelFlag(false)
    }

    
 // Fetch를 통해 데이터 갱신
    const fetchData = async () => {
        setLoading(true)
        setSelectedIndex(-1)
        setSelectedRow(undefined)
        setSelectedRows([])
        setExcelFlag(true) // 엑셀기능 동작여부
        setCurSearchLocgCd(params.locgovCd+'')

    try {
    // 검색 조건에 맞는 endpoint 생성
    let endpoint: string =
        `/fsm/stn/ltmm/tr/getAllLgovMvtRequst?page=${params.page}&size=${params.size}` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
        `${params.bgngDt ? '&bgngDt=' + (params.bgngDt+'').replace(/-/g, ""): ''}` +
        `${params.endDt ? '&endDt=' + (params.endDt+'').replace(/-/g, ""):''}` +
        `${params.prcsSttsCd ? '&prcsSttsCd=' + params.prcsSttsCd : ''}` 

    const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
    })
    if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시

        setRows(response.data.content)
        setTotalRows(response.data.totalElements)
        setPageable({
            pageNumber: response.data.pageable.pageNumber + 1,
            pageSize: response.data.pageable.pageSize,
            totalPages: response.data.totalPages,
        })
    } else {
        // 데이터가 없거나 실패
        setRows([])
        setTotalRows(0)
        setPageable({
            pageNumber: 1,
            pageSize: 10,
            totalPages: 1,
        })
    }
    } catch (error) {
    // 에러시
    console.error('Error fetching data:', error)
    setRows(rowData)
    setTotalRows(rowData.length)
    setPageable({
        pageNumber: 1,
        pageSize: 10,
        totalPages: 1,
    })
    } finally {
    setLoading(false)
    }
    }



     // 데이터 수정하는 메서드
    const putData = async (row : Row, sttCode : string) => {

        if(row.rfslRsnCn && row.rfslRsnCn.replaceAll(/\n/g, '').replaceAll(/\t/g, '').length > 30){
        alert('거절사유를 30자리 이하로 입력해주시기 바랍니다.')
        return
        }

        //setLoading(true)
        setSelectedRow(undefined)
        try {
        // 검색 조건에 맞는 endpoint 생성
        let endpoint: string =
            `/fsm/stn/ltmm/tr/updateLgovMvtRequst`
        const response = await sendHttpRequest('PUT', endpoint, {
            vhclNo: row.vhclNo,
            exsLocgovCd: row.exsLocgovCd,
            chgLocgovCd: row.chgLocgovCd,
            aplySn: row.aplySn,
            prcsSttsCd: sttCode,
            rfslRsnCn: row.rfslRsnCn?.replaceAll(/\n/g, '').replaceAll(/\t/g, '')
        }, true, {
            cache: 'no-store',
        })
        if (response && response.resultType === 'success') {
            // 데이터 조회 성공시
            return 'success'

        } else {
            // 데이터가 없거나 실패
            return 'failed'
        }
        } catch (error) {
        // 에러시
        console.error('Error fetching data:', error)
        return 'failed'
        } finally {
        //setLoading(false)
        }
    }

        // 데이터 수정하는 메서드
        const putDataList = async (row : any[]) => {
        //setLoading(true)
        try {
        // 검색 조건에 맞는 endpoint 생성
        let endpoint: string =
            `/fsm/stn/ltmm/tr/updateLgovMvtRequstList`
        const response = await sendHttpRequest('PUT', endpoint, row, true, {
            cache: 'no-store',
        })
        if (response && response.resultType === 'success') {
            // 데이터 조회 성공시
            alert(response.message)
            return 'success'
        } else {
            // 데이터가 없거나 실패
            alert(response.message)
            return 'failed'
        }
        } catch (error) {
            alert('오류가 발생했습니다.')
        // 에러시
        console.error('Error fetching data:', error)
        return 'failed'
        } finally {
        //setLoading(false)
        }
    }
    

    // 승인/거절/취소 버튼 클릭 시 다이얼로그 오픈
    const handleActionClick = (row: Row, actionType: string) => {
        setSelectedRow(row) // 선택한 Row 설정
        setDialogActionType(actionType)

        // 다이얼로그에 표시할 내용을 설정합니다.
        switch (actionType) {
        case 'approve':
            setDialogContent('관할관청 이관을 승인 하시겠습니까?')
            break
        case 'decline':
            setDialogContent('관할관청 이관을 거절 하시겠습니까?')
            break
        case 'cancel':
            setDialogContent('관할관청 전출요청을 취소 하시겠습니까??')
            break
        default:
            break
        }
        setConfirmOpen(true) // 다이얼로그 오픈
    }

    const handleCloseLocDialog = () =>{
        setLocOpen(false)
    }

    // 확인 다이얼로그에서 확인 버튼을 누를 때 승인 요청 처리
    // 확인 다이얼로그에서 확인 버튼을 누를 때 데이터 수정 처리
    const handleConfirm = async () => {
        setConfirmOpen(false)
        if (!selectedRow) return
        let sttCode = ''
        switch (dialogActionType) {
        case 'approve':
            sttCode = '02' // 승인 코드
            break
        case 'decline':
            sttCode = '03' // 거절 코드
            break
        case 'cancel':
            sttCode = '04' // 취소 코드
            break
        default:
            break
        }

        // 승인(02) 거절(03) 이면서 요청수신(01) 이 아닐 경우 
        // 취소(04) 이면서 요청발신(02) 이 아닐 경우 
        if(!(((sttCode ==='02' ||sttCode ==='03') && selectedRow.dmndSeCd === '02') || (sttCode ==='04' 
        && selectedRow.dmndSeCd === '01'))){
            alert('올바른 요청이 아닙니다.')
            return;
        }


        //setLoading(true)
        try {
            const result = await putData(selectedRow, sttCode)

        if (result === 'success') {
            alert('요청이 성공적으로 처리되었습니다.')
            setFlag((prev) => !prev) // 데이터 갱신을 위한 플래그 토글
        } else {
            alert('요청 처리에 실패했습니다.')
        }

        } catch (error) {
        console.error('Error processing data:', error)
        alert('요청 중 오류가 발생했습니다.')
        } finally {
        //setLoading(false)
        //setConfirmOpen(false) // 다이얼로그 닫기
        }
    }



    // 상세정보에 있는 Button actions
    const buttonGroupActions: ButtonGroupActionProps = {

        // 체크 박스 선택된 행 전체 승인
        onClickApporveAllBtn: async function (rows : Row[]): Promise<void> {

            if(!confirm('선택된 지자체이관전출을 일괄 승인 하시겠습니까?')){
                return
            }

            if(rows.length == 0) {
                alert('선택된 항목이 없습니다.')
                return;
            }

            //01 == 요청  / 요청이 아닌 경우가 있을 때 필터링
            const invalidRows = rows.filter(row => row.dmndSeCd !== '02');
            
            //승인 요청 취소
            if (invalidRows.length > 0) {
                alert('승인할 수 없는 항목이 포함되어 있습니다. \n 요청수신 상태만 승인 일괄요청 가능합니다.');
                return;
            }

            let data =  rows.map((row) =>  ({ 
                vhclNo: row.vhclNo,
                aplySn: row.aplySn,
                exsLocgovCd:row.exsLocgovCd,
                chgLocgovCd:row.chgLocgovCd,
                prcsSttsCd:"02",
                rfslRsnCn:row.rfslRsnCn?.replaceAll(/\n/g, '').replaceAll(/\t/g, ''),
            }))


            const result = await putDataList(data)
            if(result == 'success'){
                setFlag((prev) => !prev)
            }
        },

        // 체크 박스 선택된 행 전체 거절 
        onClickDeclineAllBtn: async function (rows : Row[]): Promise<void> {

            if(!confirm('선택된 지자체이관전출을 일괄 거절 하시겠습니까?')){
                return
            }

            if(rows.length == 0) {
                alert('선택된 항목이 없습니다.')
                return;
            }

            //01 == 요청  / 요청이 아닌 경우가 있을 때 필터링
            const invalidRows = rows.filter(row => row.dmndSeCd !== '02');
            
            //거절 요청 취소
            if (invalidRows.length > 0) {
                alert('거절할 수 없는 항목이 포함되어 있습니다. \n 요청수신 상태만 거절 일괄요청 가능합니다. ');
                return;
            }
            let data = rows.map((row) =>  ({ 
                vhclNo: row.vhclNo,
                aplySn: row.aplySn,
                exsLocgovCd:row.exsLocgovCd,
                chgLocgovCd:row.chgLocgovCd,
                prcsSttsCd:"03",
                rfslRsnCn:row.rfslRsnCn?.replaceAll(/\n/g, '').replaceAll(/\t/g, ''),
            }))

            const result = await putDataList(data)
            if(result == 'success'){
                setFlag((prev) => !prev)
            }
        },

        // 승인 버튼 클릭 시 다이얼로그 오픈
        onClickApproveBtn: async function (row: Row): Promise<void> {
            handleActionClick(row, 'approve')
        },

        // 거절 버튼 클릭 시 다이얼로그 오픈
        onClickDeclineBtn: async function (row: Row): Promise<void>  {
            handleActionClick(row, 'decline')
        },
        // 취소 버튼 클릭 시 다이얼로그 오픈
        onClickCancelBtn: async function (row: Row): Promise<void>  {
            handleActionClick(row, 'cancel')
        },
        onClickCheckMoveCenterHistoryBtn: function (row: Row): void {
            setSelectedRow(row)
            setLocOpen(true)
        },
    }

    const handleCloseConfirm = () => {
        setConfirmOpen(false);
    };

    const excelDownload = async () => {

        if(rows.length == 0){
            alert('엑셀파일을 다운로드할 데이터가 없습니다.')
            return;
        }
    
        if(!excelFlag){
            alert('조회조건이 변경되었습니다. 검색 후 다운로드가 가능합니다.')
            return
        }
        
            try{
                setLoadingBackdrop(true)
            
            let endpoint: string =
            `/fsm/stn/ltmm/tr/getExcelLgovMvtRequst?` +
            `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
            `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
            `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
            `${params.bgngDt ? '&bgngDt=' + (params.bgngDt +'').replaceAll('-','') as string : ''}` +
            `${params.endDt ? '&endDt=' + (params.endDt +'').replaceAll('-','') as string: ''}` +
            `${params.prcsSttsCd ? '&prcsSttsCd=' + params.prcsSttsCd : ''}` 

        await getExcelFile(endpoint, BCrumb[BCrumb.length-1].title + '_'+getToday()+'.xlsx')
        }catch(error){
            console.error("ERROR :: ", error)
        }finally{
            setLoadingBackdrop(false)
        }
    }





    return (
        <PageContainer
        title="지자체이관전출관리" description="지자체이관전출관리 페이지">

         {/* 검색영역 시작 */}
        <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
            <Box className="sch-filter-box">
                <div className="filter-form">
                <div className="form-group">
                        <CustomFormLabel
                        className="input-label-display"
                        htmlFor="sch-ctpv"
                        >
                        <span className="required-text">*</span>시도명
                        </CustomFormLabel>
                        <CtpvSelect
                        pValue={params.ctpvCd}
                        handleChange={handleSearchChange}
                        htmlFor={'sch-ctpv'}
                        />
                    </div>
                    <div className="form-group">
                        <CustomFormLabel
                        className="input-label-display"
                        htmlFor="sch-locgov"
                        >
                        <span className="required-text">*</span>관할관청
                        </CustomFormLabel>
                        <LocgovSelect
                        ctpvCd={params.ctpvCd}
                        pValue={params.locgovCd}
                        handleChange={handleSearchChange}
                        htmlFor={'sch-locgov'}
                        />
                    </div>
                    <div className="form-group">
                    <CustomFormLabel
                        className="input-label-display"
                        htmlFor="ft-vhclNo"
                    >
                        차량번호
                    </CustomFormLabel>
                    <CustomTextField  
                        name="vhclNo"               
                        style={{ width: '50%' }}
                        value={params.vhclNo ?? ''}
                        onChange={handleSearchChange}  type="text" id="ft-vhclNo" fullWidth />
                    </div>
                </div>
                <hr></hr> 
                {/* 신청일자 datePicker */}
                <div className="filter-form">
                <div className="form-group">
                        <CustomFormLabel className="input-label-display">
                        신청일자
                        </CustomFormLabel>
                        <CustomFormLabel className="input-label-none" htmlFor="ft-date-start">신청 시작일</CustomFormLabel>
                        <CustomTextField  type="date" id="ft-date-start" name="bgngDt" value={params.bgngDt} onChange={handleSearchChange} fullWidth 
                        inputProps={{ max: params.endDt }}
                        />
                        ~ 
                        <CustomFormLabel className="input-label-none" htmlFor="ft-date-end">신청종료일</CustomFormLabel>
                        <CustomTextField type="date" id="ft-date-end" name="endDt" value={params.endDt} onChange={handleSearchChange} fullWidth 
                        inputProps={{ min: params.bgngDt }}
                        />
                    </div>
                    <div className="form-group">
                        <CustomFormLabel className="input-label-display" htmlFor="sch-prcsSttsCd">
                        처리상태
                        </CustomFormLabel>
                        <CommSelect                
                        cdGroupNm='038'                   
                        pValue={params.prcsSttsCd}          
                        handleChange={handleSearchChange} 
                        pName='prcsSttsCd'                                      
                        htmlFor={'sch-prcsSttsCd'}       
                        addText='전체'                    
                        />
                    </div>
                </div>
            </Box>
                <Box className="table-bottom-button-group">
                    <div className="button-right-align">
                        <LoadingBackdrop open={loadingBackdrop} />
                        <Button type="submit" variant="contained" color="primary">
                            검색
                        </Button>
                        <FormModal
                            size={'lg'}
                            buttonLabel="등록"
                            title="전출등록"
                            isOpen={open}
                            setOpen={setOpen}
                            reload={()=> fetchData()}
                            />
                        <Button
                        onClick={() => excelDownload()} 
                        variant="contained" color="success">
                            엑셀
                        </Button>
                    </div>
                </Box>
            </Box>

        <LocHistoryModal 
            title= '관할관청 이관 이력'
            open={locOpen}
            onCloseClick={handleCloseLocDialog}
            data={selectedRow as {}}
            url={'/fsm/stn/ltmm/tr/getAllLgovMvtHst'}
            type={'tr'}
        />

        {/* 확인 다이얼로그 */}
        <Dialog open={confirmOpen} 
        //</PageContainer>onClose={handleCloseConfirm}
        >
            <DialogTitle>관할관청 이관</DialogTitle>
            <DialogContent>
                <DialogContentText>{dialogContent}</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCloseConfirm} color="primary">
                취소
                </Button>
                <Button onClick={handleConfirm} color="primary">
                확인
                </Button>
            </DialogActions>
        </Dialog>
        {/* 테이블영역 시작 */}
        <Box>
        <CustomTableDataGrid2
            headCells={stnLtmmLgovMvtTr} // 테이블 헤더 값
            rows={rows} // 목록 데이터
            totalRows={totalRows} // 총 로우 수
            loading={loading} // 로딩여부
            onRowClick={handleRowClick} // 행 클릭 핸들러 추가
            selectedRowIndex={selectedIndex}
            onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
            pageable={pageable} // 현재 페이지 / 사이즈 정보
            paging={true}
            cursor={true}
            onCheckChange={handleCheckChange}
            caption={"화물 지자체이관전출관리 조회 목록"}
        />
        </Box>
        {/* 테이블영역 끝 */}

        
        <>
        {selectedRow &&
            <BlankCard 
                className="contents-card" 
                title="상세 정보"
                buttons={[
                    {
                        label: '일괄승인',
                        disabled: !(isCurrSamelocgov && checkAllEffectiveness(selectedRows.map(id => (rows[Number(id.replace('tr', ''))])
                    ), authInfo?.authSttus?.locgovCd ?? '')),
                        onClick: () => buttonGroupActions.onClickApporveAllBtn(selectedRows.map(id => (rows[Number(id.replace('tr', ''))])
                    )),
                        color: 'outlined',
                    },
                    {
                        label: '일괄거절',
                        disabled: !(isCurrSamelocgov && checkAllEffectiveness(selectedRows.map(id => (rows[Number(id.replace('tr', ''))])
                    ), authInfo?.authSttus?.locgovCd ?? '')),
                        onClick: () => buttonGroupActions.onClickDeclineAllBtn(selectedRows.map(id => (rows[Number(id.replace('tr', ''))])
                    )),
                        color: 'outlined',
                    },
                    {
                        label: '승인',
                        disabled: !(isCurrSamelocgov && checkEffectiveness(selectedRow, authInfo?.authSttus?.locgovCd ?? '')),
                        onClick: () => buttonGroupActions.onClickApproveBtn(selectedRow),
                        color: 'outlined',
                    },
                    {
                        label: '거절',
                        disabled: !(isCurrSamelocgov && checkEffectiveness(selectedRow, authInfo?.authSttus?.locgovCd ?? '')),
                        onClick: () => buttonGroupActions.onClickDeclineBtn(selectedRow),
                        color: 'outlined',
                    },
                    {
                        label: '취소',
                        disabled: !(isCurrSamelocgov && checkCalcelEffectiveness(selectedRow, authInfo?.authSttus?.locgovCd ?? '')),
                        onClick: () => buttonGroupActions.onClickCancelBtn(selectedRow),
                        color: 'outlined',
                    },
                    {
                        label: '관할관청 이관이력',
                        onClick: () => buttonGroupActions.onClickCheckMoveCenterHistoryBtn(selectedRow),
                        color: 'outlined',
                    }
                ]}
            >
            <Box>
                <DetailDataGrid 
                    data={selectedRow}
                />
            </Box>
            </BlankCard>
            }
            </>

        </PageContainer>
    )
    }

    export default FreightPage

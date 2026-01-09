'use client'
import {
  Box,
  Button,
  Table,
  TableContainer,
  TableBody,
  TableRow,
  TableCell,
  RadioGroup,
  FormControlLabel,
} from '@mui/material'

import React, { useEffect, useState } from 'react';
import Dialog, { DialogProps } from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import ExamResultDialog from './ExamResultDialog'

import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import BlankCard from '@/app/components/shared/BlankCard'

import { CustomFormLabel, CustomRadio, CustomTextField } from '@/utils/fsms/fsm/mui-imports';
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils';
import { CommSelect } from '@/app/components/tx/commSelect/CommSelect';
import { getCodesByGroupNm, getLocalGovCodes } from '@/utils/fsms/common/code/getCode'
import { getToday, getDateFormatYMD } from '@/utils/fsms/common/dateUtils';

import { Row } from '../page';
import { SelectItem } from 'select'

import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import { getUserInfo } from '@/utils/fsms/utils';   // 로그인 유저 정보
import { ilpCommGrndExamResultPopHC } from '@/utils/fsms/ilp/headCells'   // 조사결과 등록HeadCell
import AddrSearchModal, { AddrRow } from '@/app/components/popup/AddrSearchModal'
import UserSearchModal, { UserRow } from '@/app/components/ilp/popup/UserSearchModal'

const normDate = (d: string | null | undefined) =>
  d ? d.replace(/-/g, '') : null;          // 문자열만 변환, 아니면 null

const normYN = (v: any) =>
  v === 'Y' || v === true || v === 'true' || v === 1 ? 'Y' : 'N';

interface GrndExamResultDialogProps {
    title: string;
    
    size?: DialogProps['maxWidth'] | 'lg';
    open: boolean;
    selectedRows: Row[];
    reloadFunc: () => void;
    closeGrndExamResultModal: (saveFlag: boolean) => void;
    mode?: 'create' | 'edit'
}

export interface areaAvgVolExElctcReqstInfo {
    chk: string // 체크여부
    exmnNo: string // 조사번호 연변
    locgovCd: string //  지자체코드
    locgovNm: string //  지자체명
    vhclNo: string // 차량번호    
    bzentyNm: string // 수급자명           
    mdfrId: string // 수정자아이디
    dlngNocs: string // 거래건수
    totlAprvAmt: string // 거래금액pu
    totlAsstAmt: string // 유가보조금
    rdmActnAmt: string // 환수조치액

    // 현장조사계획 필드
    grndsExmnYn: string
    grndsExmnYmd: string
    grndsExmnAddr: string
    grndsExmnDaddr: string
    grndsExmnRsltCn: string
    grndsExmnCfmtnYn: string
    exmnRegInptId: string
  }

export default function GrndExamResultDialog(props: GrndExamResultDialogProps) {
    const { title, 
        //children
        size, open, selectedRows, closeGrndExamResultModal, reloadFunc, mode = 'create' } = props;
    const isEdit = mode === 'edit';

    const [isEditMode, setIsEditMode] = useState<boolean>(false); // 등록 수정 모드 상태 관리
    
    const [loading, setLoading] = useState(false) // 로딩여부
    const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 저장시 로딩상태

    const [rows, setRows] = useState<Row[]>(selectedRows) // 가져온 로우 데이터
    const [checkedRows, setCheckedRows] = useState<Row[]>([]) // 팝업 목록에서 선택된 행 

    const [disabled, setDisabled] = useState<boolean>(true) // 데이터 입력 위한 플래그 설정

    const [rdmActnAmt, setRdmActnAmt] = useState<string>("");   // 환수조치액
  
    const [bzmnSeCdItems, setBzmnSeCdItems] = useState<SelectItem[]>([]);   // 사업자 구분

    const [checkArray, setCheckArray] = useState<string[]>([]);       // 체크된 아이디(인덱스) 배열

    const userInfo = getUserInfo(); // 로그인 유저 정보 조회
    const userLoginId = userInfo.lgnId;

    const [adminProcessModalFlag, setAdminProcessModalFlag] = useState(false);  // 행정처분 등록 모달
    const [examResultModalFlag, setExamResultModalFlag] = useState(false);  // 조사결과 등록 모달
    const [addrModalOpen, setAddrModalOpen] = useState<boolean>(false) //주소검색
    const [userModalOpen, setUserModalOpen] = useState<boolean>(false) //사용자검색

    const [resultDel, setResultDel] = useState<boolean>(false); // 현장조사결과 삭제 플래그

    // 저장될 데이터를 관리하는 상태
    const [formData, setFormData] = useState<areaAvgVolExElctcReqstInfo>({
        chk: '', // 체크여부
        exmnNo: '', // 조사번호 연변
        locgovCd: '', //  지자체코드
        locgovNm: '', //  지자체명
        vhclNo: '', // 차량번호    
        bzentyNm: '', // 수급자명           
        mdfrId: '', // 수정자아이디
        dlngNocs: '', // 거래건수
        totlAprvAmt: '', // 거래금액
        totlAsstAmt: '', // 유가보조금
        rdmActnAmt: '', // 환수조치액

        // 현장조사계획 필드
        grndsExmnYn: '',
        grndsExmnYmd: '',
        grndsExmnAddr: '',
        grndsExmnDaddr: '',
        grndsExmnRsltCn:'',
        grndsExmnCfmtnYn: '02',
        exmnRegInptId: '',
    })

    // 코드 파싱을 위한 item 세팅
    useEffect(() => {
        // 개인법인구분(택시) 706
        getCodesByGroupNm('706').then((res) => {
          let itemArr:SelectItem[] = []
          if(res) {
            res.map((code: any) => {
              let item: SelectItem = {
                label: code['cdKornNm'],
                value: code['cdNm'],
              }
    
              itemArr.push(item)
            })
          }
          setBzmnSeCdItems(itemArr);
        });
    }, [])

    // 검색 조건이 변경되면 자동으로 쿼리스트링 변경
    useEffect(() => {
        rowChangeMap(formData)
    }, [formData])
    
    // 체크된 항목만 담기
    useEffect(() => {
        setRows(rows)

        const checkRows = rows.filter(row => {
            return row.chk === '1'
        })
        setCheckedRows(checkRows);
    }, [rows])

    // 다이얼로그 닫기 핸들러
    const handleCloseModal = () => {
        setIsEditMode(false);              // 닫을 때 수정 모드 초기화
        closeGrndExamResultModal(true);    // 닫을 때 재조회 방지
    };

    // 조사결과 등록 모달 열기
    const openExamResultModal = async () => {
        checkedRows.map((row) => {row.chk = '0'})   // 조사결과 등록 화면 이동시 체크 해제
        setCheckedRows(checkedRows)

        setExamResultModalFlag(true)
    }

    // 조사결과 등록 모달 닫기
    const closeExamResultModal = async (saveFlag: boolean) => {
        setExamResultModalFlag((prev) => false)
        if (saveFlag) {
            setIsEditMode(false);   // 닫을 때 수정 모드 초기화
            closeGrndExamResultModal(true)  // 닫을 때 재조회 처리
        } else {
            checkedRows.map((row) => {row.chk = '1'})   // 행정처분 등록 화면 취소시 체크 복원
            setCheckedRows(checkedRows)
        }
    }

    // 모달 새고로침
    const handleModalReload = () => {
        // setParams((prev) => ({ ...prev, page: 1 })) // 첫 페이지로 이동
    }

    // 데이터 변경 핸들러
    const handleFormDataChange = (name: string, value: string) => {    
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleParamChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
      ) => {
        const { name, value } = event.target

        // 1) 라디오(등록/미등록) → Y/N 강제
        if (name === 'grndsExmnYn') {
            const yn = value === 'Y' ? 'Y' : 'N';
            setFormData((prev) => ({ ...prev, grndsExmnYn: yn }));
            return;
        }

        // 2) 셀렉트(확정/미확정/기타코드) → Y / N / 원코드
        if (name === 'grndsExmnCfmtnYn') {
            // CommSelect가 라벨 그대로 주는 경우를 대비
            const mapped =
            value === '확정' ? 'Y' :
            value === '미확정' ? 'N' :
            value; // 기타코드는 그대로 유지
            setFormData((prev) => ({ ...prev, grndsExmnCfmtnYn: mapped }));
            return;
        }

        setFormData((prev) => ({ ...prev, [name]: value }));
    }

    //체크 항목을 저장 rows 에 담음
    const handleCheckChange = (selected:string[]) => {
        if (selected.length > checkArray.length) {
            setDisabled(false)
            bindFormData(rows[Number(selected[selected.length - 1].replace('tr', ''))])
        } else {
            setDisabled(true)
            setRdmActnAmt('')
            initFormData()
        }

        setCheckArray(selected)

        let checkRows:Row[] = [];
        
        for (var i = 0; i < rows.length; i++) {
            let isCheck = false;
            for (var j = 0; j < selected.length; j++) {
                if (Number(selected[j].replace('tr', '')) === i) {
                    isCheck = true;
                }    
            }

            if (isCheck) {
                rows[i].chk = '1';
            } else {
                rows[i].chk = '0';
            }
            
            checkRows.push(rows[i]);
        }

        setRows(checkRows)
    }

    // 입력 폼 데이터 초기화
    const initFormData = async() =>{
        formData.chk = '' // 체크유무
        formData.exmnNo = '' // 조사번호 연변
        formData.locgovCd = '' //  지자체코드
        formData.locgovNm = '' //  지자체명
        formData.vhclNo = '' // 차량번호    
        formData.bzentyNm = '' // 수급자명           
        formData.dlngNocs = '' // 거래건수
        formData.totlAprvAmt = '' // 거래금액
        formData.totlAsstAmt = '' // 유가보조금
        formData.rdmActnAmt = '' // 환수조치액

        // 현장조사계획 필드
        formData.grndsExmnYn = ''
        formData.grndsExmnYmd = ''
        formData.grndsExmnAddr = ''
        formData.grndsExmnDaddr = ''
        formData.grndsExmnRsltCn = ''
        formData.grndsExmnCfmtnYn = '02'
        formData.exmnRegInptId = ''

        setFormData((prev) => ({ ...prev}))
    }

    // 입력 폼 데이터 초기화
    const bindFormData = async(selectedRow: Row) => {
        // 환수조치액 설정 및 제거 처리
        if(selectedRow.rdmActnAmt !== '' 
        && selectedRow.rdmActnAmt !== null
        && selectedRow.rdmActnAmt !== undefined) {
            setRdmActnAmt(selectedRow.rdmActnAmt);
        } else {
            setRdmActnAmt('0');
        }
        
        //선택된 행을 담음
        formData.chk = selectedRow.chk // 체크유무
        formData.exmnNo = selectedRow.exmnNo // 조사번호 연변
        formData.locgovCd = selectedRow.locgovCd //  지자체코드
        formData.locgovNm = '' //  지자체명
        formData.vhclNo = selectedRow.vhclNo // 차량번호    
        formData.bzentyNm = selectedRow.bzentyNm // 수급자명           
        formData.dlngNocs = selectedRow.dlngNocs // 거래건수
        formData.totlAprvAmt = selectedRow.totlAprvAmt // 거래금액
        formData.totlAsstAmt = selectedRow.totlAsstAmt // 유가보조금
        formData.rdmActnAmt = selectedRow.rdmActnAmt // 환수조치액

        // 현장조사계획 필드
        formData.grndsExmnYn = selectedRow.grndsExmnYn ?? 'Y'
        formData.grndsExmnYmd = getDateFormatYMD(selectedRow.grndsExmnYmd ?? getToday())
        formData.grndsExmnAddr = selectedRow.grndsExmnAddr
        formData.grndsExmnDaddr = selectedRow.grndsExmnDaddr
        formData.grndsExmnRsltCn = selectedRow.grndsExmnRsltCn
        formData.grndsExmnCfmtnYn = selectedRow.grndsExmnCfmtnYn ?? '02'
        formData.exmnRegInptId = selectedRow.exmnRegInptId


        setFormData((prev) => ({ ...prev}));
    }

    // 행 클릭 시 호출되는 함수
    const handleRowClick = (selectedRow: Row) => {

    }

    // 변경된 formData를 rows 에 반영
    const rowChangeMap = (changeRow: areaAvgVolExElctcReqstInfo) => {
        if(rows && changeRow){
            const tempRows = rows.map(map =>
                {
                    if(map.exmnNo == changeRow.exmnNo){
                        return {
                            ...map,
                            grndsExmnYn:changeRow.grndsExmnYn,
                            grndsExmnYmd:changeRow.grndsExmnYmd,
                            grndsExmnAddr:changeRow.grndsExmnAddr,
                            grndsExmnDaddr:changeRow.grndsExmnDaddr,
                            grndsExmnRsltCn:changeRow.grndsExmnRsltCn, 
                            grndsExmnCfmtnYn:changeRow.grndsExmnCfmtnYn,
                            exmnRegInptId:changeRow.exmnRegInptId,
                        }
                    }else{
                        return {...map}
                    }
                }
            )
            setRows(tempRows)
        }
    }

    // 유효성 검사
    function checkValidation() {
        let isCheck = false;
        let isNotAmt = false;
        let isNotBzmn = false;

        let checkRows: any[] = []
        rows.map(row => {
            if (row.chk === '1') {
                isCheck = true;
                 checkRows.push(row);
            }
        })

        if (!isCheck) {
            alert("선택된 현장조사계획 등록정보가 없습니다.");
            return [];
        }

        // 2) 조사주소 필수 체크 (추가 부분)
        const invalidAddrRow = checkRows.find((row) => {
            const addr = String(row.grndsExmnAddr ?? '').trim();
            return addr === '';
        });

        if (invalidAddrRow) {
            alert(`조사주소는 필수입니다. [연번: ${invalidAddrRow.exmnNo || ''}]`);
            return [];
        }
        
        setCheckedRows(checkRows);

        return checkRows;
    }

    // 확정여부 저장값 정규화
    const normalizeCfmtnYnForSave = (v: any) => {
        if (!v) return 'N';            // 값이 없으면 기본값 = 미확정

        // 이미 Y/N이면 그대로 사용
        if (v === 'Y' || v === 'N') return v;

        // 혹시 라벨이 그대로 들어와 있을 경우 대비
        if (v === '확정') return 'Y';
        if (v === '미확정') return 'N';

        // 코드값(예: '01', '02')일 가능성까지 고려
        if (v === '01') return 'Y';
        if (v === '02') return 'N';

        return 'N';
    };

    // 현장조사계획 등록 처리
    const updateDoubtInvestigationResult = async () => {
        const checkRows: any[] = checkValidation()  // 유효성 검사

        if (checkRows.length < 1) return

        const cancelConfirm: boolean = confirm(
            isEdit ? '현장조사계획을 수정하시겠습니까?' : '현장조사계획을 등록하시겠습니까?'
        );
        
        if (!cancelConfirm) return

        try {
            setLoadingBackdrop(true)
    
            let param: any[] = []
            checkRows.map((row) => {
            param.push({
                exmnNo      : row.exmnNo,
                locgovCd    : row.locgovCd,
                locgovNm    : row.locgovNm,
                vhclNo      : row.vhclNo,
                // 현장조사계획 필드
                grndsExmnYn     : normYN(row.grndsExmnYn),
                grndsExmnYmd    : normDate(row.grndsExmnYmd),
                grndsExmnAddr   : row.grndsExmnAddr,
                grndsExmnDaddr  : row.grndsExmnDaddr,
                grndsExmnRsltCn : row.grndsExmnRsltCn,
                grndsExmnCfmtnYn: normalizeCfmtnYnForSave(row.grndsExmnCfmtnYn),
                exmnRegInptId   : row.exmnRegInptId,

                mdfrId      : userLoginId,
            })
            })
            
            const body = { ddppDoubtDlngPbadmsPrcsReqstDto : param }
        
            const endpoint: string = `/ilp/ddpp/bs/updateGrndsExmnPlan`
            const response = await sendHttpRequest('PUT', endpoint, body, true, {cache: 'no-store'})
    
            if (response && response.data > 0) {
                alert(isEdit ? '현장조사계획 수정이 완료되었습니다.' : '현장조사계획 등록이 완료되었습니다.');
            } else {
                alert('현장조사계획 처리 내역이 없습니다.');
            }
        } catch(error) {           
            alert(isEdit ? '현장조사계획 수정에 실패하였습니다.' : '현장조사계획 등록에 실패하였습니다.');
            console.error("ERROR POST DATA : ", error)
        } finally {
            setLoadingBackdrop(false)
            setIsEditMode(false);   // 닫을 때 수정 모드 초기화
            if (isEdit) {
              closeGrndExamResultModal(true)  // 닫을 때 재조회 처리
            }
        }
    }

    // 조사결과 등록 팝업으로 이동
    const handleNextPopup = async () => {
        // 1) 체크된 행만 수집 (validation/checkValidation 호출 X)
        const checkRows: Row[] = (rows || []).filter(r => r.chk === '1');

        if (checkRows.length < 1) {
            alert('선택된 현장조사계획 등록정보가 없습니다.');
            return;
        }

        // 2) checkedRows 갱신
        setCheckedRows(checkRows);

        // 기존 로직 유지: "확정인데 결과가 없으면 먼저 결과 등록" 안내
        const needResultFirst = checkRows.some((row) => {
            const cfmYn = String(row.grndsExmnCfmtnYn ?? '').trim();
            const rslt  = String(row.grndsExmnRsltCn ?? '').trim();

            const isConfirmed = ['Y', '확정', '01'].includes(cfmYn);
            const noResult    = !rslt;

            return isConfirmed && noResult;
        });

        // 저장 여부 확인
        const wantSave = confirm('조사결과등록 전에 현장조사계획을 저장하시겠습니까?')

        if (wantSave) {
            // 저장 버튼 누르도록 안내
            alert('먼저 [저장] 버튼을 눌러 저장한 뒤, 다시 [조사결과등록]을 눌러 진행해 주세요.')
            return
        }

        openExamResultModal()
    }

    // 현장조사계획 등록
    const handleResultSave = async () => {
        updateDoubtInvestigationResult();
    }

    const handleClickAddr = (row: AddrRow) => {
        setFormData((prev) => ({
            ...prev,
            grndsExmnAddr: row.roadAddr,          
        }));
        setAddrModalOpen(false)
    }

    const handleClickUser = (row: UserRow) => {
        setFormData((prev) => ({
            ...prev,
            exmnRegInptId: row.lgnId,          
        }));
        setUserModalOpen(false)
    }

    const handleBulkApplyPlan = () => {
        // 1) 체크된 행 존재 여부
        const hasChecked = Array.isArray(rows) && rows.some(r => r.chk === '1');
        if (!hasChecked) {
            alert('적용할 행을 먼저 선택해 주세요.');
            return;
        }

        // 2) formData에서 현재 입력값 확보 (YN/날짜/코드 포함)
        const {
            grndsExmnYn = '',
            grndsExmnYmd = '',
            grndsExmnAddr = '',
            grndsExmnDaddr = '',
            grndsExmnRsltCn = '',
            grndsExmnCfmtnYn = '',
            exmnRegInptId = '',
        } = formData;

        // 3) rows에 체크된 행만 일괄 반영
        setRows(prev =>
            prev.map(r =>
            r.chk === '1'
                ? {
                    ...r,
                    grndsExmnYn,
                    grndsExmnYmd,     // 화면 표시는 YYYY-MM-DD 유지, 전송 시 normDate로 포맷됨
                    grndsExmnAddr,
                    grndsExmnDaddr,
                    grndsExmnRsltCn,
                    grndsExmnCfmtnYn, // CommSelect에서 코드가 바로 formData에 저장되도록 처리되어 있음
                    exmnRegInptId,
                }
                : r
            )
        );

        // 4) checkedRows도 동기화
        setCheckedRows(prev =>
            prev.map(r => ({
            ...r,
            grndsExmnYn,
            grndsExmnYmd,
            grndsExmnAddr,
            grndsExmnDaddr,
            grndsExmnRsltCn,
            grndsExmnCfmtnYn,
            exmnRegInptId,
            }))
        );

        alert('현장조사계획 값이 체크된 행에 일괄 적용되었습니다.');
    };

    // 현장조사결과 단건 삭제 (현재 폼에 보이는 행 기준)
    const deleteGrndsExmnResult = async () => {
        const {
            exmnNo,
            locgovCd,
            locgovNm,
            vhclNo,
        } = formData;

        // 1) 선택된 행(폼 바인딩)이 없는 경우 방어
        if (!exmnNo) {
            alert('삭제할 현장조사계획이 선택되지 않았습니다.');
            return;
        }

        const confirmDel = confirm('현재 선택된 건의 현장조사 결과를 삭제하시겠습니까?');
        if (!confirmDel) return;

        try {
            setLoadingBackdrop(true);

            // 2) 백엔드로 보낼 파라미터 (단건)
            const param: any[] = [
                {
                    exmnNo,
                    locgovCd,
                    locgovNm,
                    vhclNo,
                    // 결과내용을 공백으로
                    grndsExmnRsltCn: '',
                    // 필요하면 확정여부도 초기화
                    // grndsExmnCfmtnYn: '02',
                    mdfrId: userLoginId,
                },
            ];

            const body = { ddppDoubtDlngPbadmsPrcsReqstDto: param };

            // 삭제용 엔드포인트
            const endpoint = '/ilp/ddpp/bs/updateGrndsExmnRsltCn';
            const response = await sendHttpRequest('PUT', endpoint, body, true, { cache: 'no-store' });

            if (response && response.data > 0) {
                alert('현장조사 결과가 삭제되었습니다.');

                // 3) 테이블 rows에서도 해당 exmnNo만 결과 삭제
                setRows((prev) =>
                    prev.map((r) =>
                        r.exmnNo === exmnNo
                            ? {
                                ...r,
                                grndsExmnRsltCn: '',
                                // grndsExmnCfmtnYn: '02', // 필요 시 같이 초기화
                            }
                            : r
                    )
                );

                // 4) 폼 데이터도 결과내용 비우기
                setFormData((prev) => ({
                    ...prev,
                    grndsExmnRsltCn: '',
                    // grndsExmnCfmtnYn: '02',
                }));
                 // 5) 삭제까지 끝나면 모달도 종료
                handleCloseModal();
            } else {
                alert('삭제 처리된 현장조사 결과가 없습니다.');
            }
        } catch (error) {
            console.error('ERROR DELETE DATA : ', error);
            alert('현장조사 결과 삭제에 실패하였습니다.');
        } finally {
            setLoadingBackdrop(false);
        }
    };

    useEffect(() => {
        if (!resultDel) return;

        deleteGrndsExmnResult().finally(() => {
            setResultDel(false); // 한 번 실행 후 플래그 초기화
        });
    }, [resultDel]);

    return (
        <React.Fragment>
        <Dialog
            fullWidth={false}
            maxWidth={size}
            open={open}
            onClose={handleCloseModal}
        >
            <DialogContent>
            <Box className='table-bottom-button-group'>
                <CustomFormLabel className="input-label-display">
                    <h2>{isEdit ? '현장조사계획 수정' : '현장조사계획 등록'}</h2>
                </CustomFormLabel>
                <div className="button-right-align">
                    <LoadingBackdrop open={loadingBackdrop} />
                    {!isEdit && (
                        <Button variant="outlined" color="primary" onClick={handleNextPopup}>조사결과등록</Button>
                    )}
                    <Button variant="contained" color="primary" onClick={handleResultSave}>
                        저장
                    </Button>
                    <Button variant="outlined" color="primary" onClick={handleCloseModal}>
                        
                        {isEdit ? '닫기' : '취소'}
                    </Button>
                </div>
            </Box>
            <BlankCard className="contents-card" title={isEdit ? '현장조사계획 수정' : '현장조사계획 등록'}>
                <TableContainer style={{ maxHeight:"286px" }}>
                    <TableDataGrid
                        headCells={ilpCommGrndExamResultPopHC} // 테이블 헤더 값
                        rows={rows} // 목록 데이터
                        loading={loading} // 로딩여부
                        onRowClick={handleRowClick} // 행 클릭 핸들러 추가
                        checkAndRowClick={true} // 행클릭 시 체크 기능 추가
                        paging={false}
                        onCheckChange={handleCheckChange}
                    />
                </TableContainer>
            </BlankCard>
            <Box
                id='form-modal'
                component='form'
                onSubmit={(e) => {
                e.preventDefault();
                setIsEditMode(false);
                alert('Form Submitted'); // 실제 제출 로직 추가
                }}
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    m: 'auto',
                    width: 'full',
                }}
            >
                <BlankCard className="contents-card" title="현장조사계획정보"buttons={[
                    {
                    label: '일괄적용',
                    onClick: () => handleBulkApplyPlan(),
                    color: 'outlined',
                    },
                    ]}
                >
                    {/* <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
                        <Button
                            variant="outlined"
                            color="primary"
                            style={{ marginLeft: '30px' }}
                            onClick={handleBulkApplyPlan} 
                        >
                            일괄적용
                        </Button>
                    </div> */}
                    <Box sx={{ maxWidth: 'fullWidth', margin: '0 auto' }}>
                    <TableContainer style={{ margin: '0 0 0 0' }}>
                        <Table
                        className="table table-bordered"
                        aria-labelledby="tableTitle"
                        style={{ tableLayout: 'fixed', width: '100%' }}
                        >
                        <TableBody>
                            {/* 현장조사계획여부 */}
                            <TableRow>
                            <TableCell className="td-head" style={{ width: '140px', verticalAlign: 'middle' }}>
                                계획여부
                            </TableCell>
                            <TableCell colSpan={7}>
                                {/* 현장조사 계획여부 등록/미등록 라디오 */}
                                <RadioGroup row
                                id="grndsExmnYn"
                                name="grndsExmnYn"
                                className="mui-custom-radio-group"
                                onChange={handleParamChange}
                                value={formData.grndsExmnYn}
                                >
                                <FormControlLabel
                                    control={
                                    <CustomRadio id="rdo3_1" name="grndsExmnYn" value="Y" />
                                    }
                                    label="등록"
                                />
                                <FormControlLabel
                                    control={
                                    <CustomRadio id="rdo3_2" name="grndsExmnYn" value="N" />
                                    }
                                    label="미등록"
                                />
                                </RadioGroup>
                            </TableCell>
                            </TableRow>
                            {/* 현장조사계획일자 */}
                            <TableRow>
                            <TableCell className="td-head" style={{ width: '140px', verticalAlign: 'middle' }} id="lbl-grndsExmnYmd">
                                계획일자
                            </TableCell>
                            <TableCell colSpan={7}>
                                <CustomTextField type="date" id="grndsExmnYmd" name="grndsExmnYmd" value={formData.grndsExmnYmd} onChange={handleParamChange} />
                            </TableCell>
                            </TableRow>
                            {/* 현장조사 주소 */}
                            <TableRow>
                            <TableCell className="td-head" style={{ width: '140px', verticalAlign: 'middle' }}>
                                <span className="required-text">*</span>조사주소
                            </TableCell>
                            <TableCell colSpan={6}>
                                <CustomTextField id="grndsExmnAddr" name="grndsExmnAddr" value={formData.grndsExmnAddr} onChange={handleParamChange} fullWidth />
                            </TableCell>
                            <TableCell>
                                <Button variant="outlined" onClick={() => setAddrModalOpen(true)}>도로명주소검색</Button>
                            </TableCell>
                            </TableRow>
                            {/* 현장조사 상세주소 */}
                            <TableRow>
                            <TableCell className="td-head" style={{ width: '140px', verticalAlign: 'middle' }}>
                                상세주소
                            </TableCell>
                            <TableCell colSpan={7}>
                                <CustomTextField id="grndsExmnDaddr" name="grndsExmnDaddr" value={formData.grndsExmnDaddr} onChange={handleParamChange} fullWidth />
                            </TableCell>
                            </TableRow>
                            {/* 현장조사 확정여부 */}
                            <TableRow>
                            <TableCell className="td-head" style={{ width: '140px', verticalAlign: 'middle' }}>
                                {/* 시각적으로 숨기는 라벨 (스크린리더용) */}
                                <label htmlFor="sch-grndsExmnCfmtnYn" className="sr-only">확정여부</label>
                                
                            </TableCell>
                            <TableCell colSpan={7}>
                                <CommSelect
                                cdGroupNm={'IGG0'}
                                pValue={formData.grndsExmnCfmtnYn}
                                pName={'grndsExmnCfmtnYn'}
                                handleChange={handleParamChange}
                                //pDisabled={disableAll}
                                //addText="선택"
                                htmlFor={'sch-grndsExmnCfmtnYn'}
                                width={'20%'}
                                />
                            </TableCell>
                            </TableRow>
                            {/* 현장조사 결과 */}
                            <TableRow>
                            <TableCell className="td-head" style={{ width: '140px', verticalAlign: 'middle' }}>
                                조사결과
                            </TableCell>
                            <TableCell colSpan={6}>
                                <CustomTextField id="grndsExmnRsltCn" name="grndsExmnRsltCn" value={formData.grndsExmnRsltCn} onChange={handleParamChange} fullWidth />
                            </TableCell>
                            <TableCell>
                                <Button variant="outlined" onClick={() => setResultDel(true)}>조사결과삭제</Button>
                            </TableCell>
                            </TableRow>
                            {/* 현장조사 담당자 */}
                            <TableRow>
                            <TableCell className="td-head" style={{ width: '140px', verticalAlign: 'middle' }}>
                                담당자
                            </TableCell>
                            <TableCell colSpan={6}>
                                <CustomTextField id="exmnRegInptId" name="exmnRegInptId" value={formData.exmnRegInptId} onChange={handleParamChange} />
                            </TableCell>
                            <TableCell>
                                <Button variant="outlined"onClick={() => setUserModalOpen(true)}>사용자검색</Button>
                            </TableCell>
                            </TableRow>
                        </TableBody> 
                        </Table>
                    </TableContainer>
                    </Box>
                </BlankCard>
             </Box>
            </DialogContent>
        </Dialog>
        <AddrSearchModal
            open={addrModalOpen}
            onRowClick={handleClickAddr}
            onCloseClick={() => setAddrModalOpen(false)}
        />
        <UserSearchModal
            open={userModalOpen}
            onRowClick={handleClickUser}
            onCloseClick={() => setUserModalOpen(false)}
        />
        {/* 조사결과 등록 모달 */}
        <div>
            {examResultModalFlag && (
                <ExamResultDialog
                size="lg"
                title="조사결과 등록"
                reloadFunc={handleModalReload}
                closeExamResultModal={closeExamResultModal}
                selectedRows={checkedRows}
                open={examResultModalFlag}
                ></ExamResultDialog>
            )}
        </div>
        </React.Fragment>
    );
}
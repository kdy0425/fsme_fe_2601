'use client'
import {
    Box,
    Button,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
} from '@mui/material';

import React, { useEffect, useState } from 'react';

import Dialog, { DialogProps } from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { Row } from '../page'

import { CustomFormLabel, CustomTextField } from '@/utils/fsms/fsm/mui-imports';
import { sendHttpFileRequest, sendHttpRequest, sendMultipartFormDataRequest } from '@/utils/fsms/common/apiUtils';

import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

interface IllegalReportDialogProps {
    title: string;
    size?: DialogProps['maxWidth'] | 'lg';
    open: boolean;
    selectedRows: Row[];
    reloadFunc: () => void;
    closeIllegalReportModal: (saveFlag: boolean) => void;
}

interface fileList {
    fileTsid: string      
    fileNm: string    
    rfncTsid: string    
    fileClsfNm: string    
    strgFileNm: string         
    fileStrgPath: string         
}

export interface illegalReportInfo {
    instcSpldmdCvlcptRpotTsid: string   // 부정수급민원제보식별번호
    sbmsnDt: string                     // 제출일시
    locgovNm: string                    // 지자체코드
    prcsSttsCd: string                  // 처리상태코드
    prcsSttsNm: string                  // 처리상태
    instcSpldmdRpotDclrTypeNm: string   // 부정수급제보신고유형      
    vhclKndNm: string                   // 차량종류명
    vhclNo: string                      // 차량번호
    koiNm: string                       // 유종명
    instcSpldmdNocsNm: string           // 부정수급건수     
    instcSpldmdYmd: string              // 부정수급 행위일자
    instcSpldmdDclrDtlCn: string        // 부정수급신고상세내용
    dclNm: string                       // 신고자명
    dclTelno: string                    // 신고자 전화번호
    dclMbtlnum: string                  // 신고자 휴대폰번호
    dclEmlAddr: string                  // 신고자 이메일주소
    dclAddr: string                     // 신고자 주소
    picNm: string                       // 담당자명
    cvlcptRcptDt: string                // 민원접수일시
    prcsDt: string                      // 처리일시
    fileList:  fileList[]               // 첨부파일
}

export interface dialogInfo {
    prcsSttsCd: string  // 처리상태코드
    confirmMsg: string  // 확인 팝업 문구
    completeMsg: string // 완료 팝업 문구
}

export interface CustomFile {
    fileTsid?: string; // 참조식별번호
    fileSize?: string; // 파일용량
    lgcFileNm?: string; // 논리파일명
    mdfcnDt?: string; // 수정일시
    mdfrId?: string; // 수정자아이디
    physFileNm?: string; // 물리파일명
    regDt?: string; // 등록일시
    rgtrId?: string;  // 등록자아이디
}

export default function IllegalReportDialog(props: IllegalReportDialogProps) {
    const { title, 
        //children
        size, open, selectedRows, closeIllegalReportModal, reloadFunc } = props;
    
    const [loading, setLoading] = useState(false) // 로딩여부
    const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 저장시 로딩상태

    const [submitFlag, setSubmitFlag] = useState(true) // 접수, 취하, 반려 버튼 히든 처리 플래그 (제출 상태)
    const [receiptFlag, setReceiptFlag] = useState(true) // 승인, 기각 버튼 히든 처리 플래그 (접수 상태)
    const [approvalFlag, setApprovalFlag] = useState(true) // 취소 제외 전체 버튼 히든 처리 플래그 (승인 상태)
    const [downloadFlag, setDownloadFlag] = useState(true) // 다운로드 버튼 비활성화 처리 플래그

    // 저장될 데이터를 관리하는 상태
    const [formData, setFormData] = useState<illegalReportInfo> ({
        instcSpldmdCvlcptRpotTsid:'',    // 부정수급민원제보식별번호
        sbmsnDt: '',                     // 제출일시
        locgovNm: '',                    // 지자체코드
        prcsSttsCd: '',                  // 처리상태코드
        prcsSttsNm: '',                  // 처리상태
        instcSpldmdRpotDclrTypeNm: '',   // 부정수급제보신고유형      
        vhclKndNm: '',                   // 차량종류명
        vhclNo: '',                      // 차량번호
        koiNm: '',                       // 유종명
        instcSpldmdNocsNm: '',           // 부정수급건수     
        instcSpldmdYmd: '',              // 부정수급 행위일자
        instcSpldmdDclrDtlCn: '',        // 부정수급신고상세내용
        dclNm: '',                       // 신고자명
        dclTelno: '',                    // 신고자 전화번호
        dclMbtlnum: '',                  // 신고자 휴대폰번호
        dclEmlAddr: '',                  // 신고자 이메일주소
        dclAddr: '',                     // 신고자 주소
        picNm: '',                       // 담당자명
        cvlcptRcptDt: '',                // 민원접수일시
        prcsDt: '',                      // 처리일시
        fileList:  []                    // 첨부파일
    })

    // 등록 모달 창 관리 
    const [modalInfo, setModalInfo] = useState<dialogInfo> ({
        prcsSttsCd: '', // 처리상태코드
        confirmMsg: '',  // 확인 팝업 문구
        completeMsg: '', // 완료 팝업 문구
    })

    // 코드 파싱을 위한 item 세팅
    useEffect(() => {
        fetchData() // 부정수급제보 상세 조회
    }, [])   

    // 다이얼로그 닫기 핸들러
    const handleCloseModal = async () => {
        closeIllegalReportModal(false)
    };

    // 모달 우측 상단 버튼 클릭 이벤트
    const clickButton = async (num: number) => {
            // 클릭한 버튼에 따라 모달창 내용을 변경 처리
            switch (num){
                case 0:     // 접수
                    modalInfo.prcsSttsCd    = 'PSC004'  // 처리상태코드
                    modalInfo.confirmMsg    = '부정수급제보을 접수하시겠습니까?' // 확인 팝업 문구
                    modalInfo.completeMsg   = '부정수급제보가 접수되었습니다.' // 완료 팝업 문구
                    break
                case 1:     // 취하
                    modalInfo.prcsSttsCd    = 'PSC009'  // 처리상태코드
                    modalInfo.confirmMsg    = '부정수급제보를 취하하시겠습니까?' // 확인 팝업 문구
                    modalInfo.completeMsg   = '부정수급제보가 취하되었습니다.”' // 완료 팝업 문구
                    break
                case 2:     // 반려
                    modalInfo.prcsSttsCd    = 'PSC010'  // 처리상태코드
                    modalInfo.confirmMsg    = '부정수급제보를 반려하시겠습니까?' // 확인 팝업 문구
                    modalInfo.completeMsg   = '부정수급제보가 반려되었습니다.”'  // 완료 팝업 문구 
                    break
                case 3:     // 기각
                    modalInfo.prcsSttsCd    = 'PSC011'  // 처리상태코드
                    modalInfo.confirmMsg    = '부정수급제보를 기각하시겠습니까?' // 확인 팝업 문구
                    modalInfo.completeMsg   = '부정수급제보가 기각되었습니다.'  // 완료 팝업 문구 
                    break
                case 4:     // 승인
                    modalInfo.prcsSttsCd    = 'PSC012'  // 처리상태코드
                    modalInfo.confirmMsg    = '부정수급제보를 승인하시겠습니까?' // 확인 팝업 문구
                    modalInfo.completeMsg   = '부정수급제보가 승인되었습니다.'  // 완료 팝업 문구 
                    break
                default:
                    break
            }
    
            setModalInfo((prev) => ({ ...prev}));

            updateIllegalReport()   // 업데이트로 바로 이동
    }

    // 부정수급제보 상세 조회
    const fetchData = async () => {
        setLoading(true)
        try {
            const endpoint: string =
                `/fsm/ilg/iscrm/cm/getOneInstcSpldmdCvlcptRpotMng?` +
                `${selectedRows[0].instcSpldmdCvlcptRpotTsid ? '&instcSpldmdCvlcptRpotTsid=' + selectedRows[0].instcSpldmdCvlcptRpotTsid : ''}`

            const response = await sendHttpRequest('GET', endpoint, null, true, {
                cache: 'no-store',
            })

            if (response && response.resultType === 'success' && response.data) {
                // 입력 폼 데이터에 설정
                if (!isNull(response.data.result[0])) {
                    setFetchData(response.data.result[0])
                }
            } else {
                // 데이터가 없거나 실패
            }      
        } catch (error) {
            // 에러시
            console.error('Error fetching data:', error)
        } finally {
            setLoading(false)
        }
    }

    // 빈 값 체크 return : boolean
    function isNull(str: String) {
        if (str === '' || str === null || str === undefined) {
            return true
        } else {
            return false
        }
    }

    // 전화번호 '-' 표시 추가
    function convertTelno (telno: String) {
        if (isNull(telno)) { return '' }

        let convTelno = ''
        if (telno?.substring(0,2) === '02') {
            if (telno?.length === 9) {
                convTelno = telno?.substring(0,2) + "-" + telno?.substring(2,5) + "-" + telno?.substring(5,9)
            } else if (telno?.length === 10) {
                convTelno = telno?.substring(0,2) + "-" + telno?.substring(2,6) + "-" + telno?.substring(6,10) 
            }
        } else {
            if (telno?.length === 10) {
                convTelno = telno?.substring(0,3) + "-" + telno?.substring(3,6) + "-" + telno?.substring(6,10)
            } else if (telno?.length === 11) {
                convTelno = telno?.substring(0,3) + "-" + telno?.substring(3,7) + "-" + telno?.substring(7,11) 
            }
        }
        
        return convTelno
    }

    // 년월일자 '-' 표시 추가
    function convertDate (date: String) {
        if (isNull(date)) { return '' }
        return date?.substring(0,4) + "-" + date?.substring(4,6) + "-" + date?.substring(6,8)
    }

    // 년월일자 및 기간 '년월일' 한글 표시 처리 변환
    function convertDatePeriod (date: String) {
        if (isNull(date)) { return '' }
        return date?.substring(0,4) + "년 " 
        + (date[4] === '0' ? date?.substring(5,6) : date?.substring(4,6)) + "월 " 
        + (date[6] === '0' ? date?.substring(7,8) : date?.substring(6,8)) + "일 "
        +  date?.substring(8,15) + "년 " 
        + (date[15] === '0' ? date?.substring(16,17) : date?.substring(15,17)) + "월 " 
        + (date[17] === '0' ? date?.substring(18,19) : date?.substring(17,19)) + "일 "
    }

    // 부정수급제보 상세 설정
    const setFetchData = async (row: illegalReportInfo) => {
        // 불필요한 버튼 히든 처리
        if (row.prcsSttsCd === 'PSC003') {
            setSubmitFlag(false)
            setReceiptFlag(true)
            setApprovalFlag(false)
        } else if (row.prcsSttsCd === 'PSC004') {
            setSubmitFlag(true)
            setReceiptFlag(false)
            setApprovalFlag(false)
        } else if (row.prcsSttsCd === 'PSC012') {
            setSubmitFlag(true)
            setReceiptFlag(true)
            setApprovalFlag(true)
        } 
        
        // 다운로드 버튼 활성화 처리
        if (row.fileList?.length > 0) {
            setDownloadFlag(false)
        }

        //선택된 행을 담음
        formData.instcSpldmdCvlcptRpotTsid = row.instcSpldmdCvlcptRpotTsid  // 부정수급민원제보식별번호
        formData.sbmsnDt = row.sbmsnDt                                      // 제출일시
        formData.locgovNm = row.locgovNm                                    // 지자체코드
        formData.prcsSttsCd = row.prcsSttsCd                                // 처리상태코드
        formData.prcsSttsNm = row.prcsSttsNm                                // 처리상태
        formData.instcSpldmdRpotDclrTypeNm = row.instcSpldmdRpotDclrTypeNm  // 부정수급제보신고유형      
        formData.vhclKndNm = row.vhclKndNm                                  // 차량종류명
        formData.vhclNo = row.vhclNo                                        // 차량번호
        formData.koiNm = row.koiNm                                          // 유종명
        formData.instcSpldmdNocsNm = row.instcSpldmdNocsNm                  // 부정수급건수     
        formData.instcSpldmdYmd = convertDatePeriod(row.instcSpldmdYmd)     // 부정수급 행위일자
        formData.instcSpldmdDclrDtlCn = row.instcSpldmdDclrDtlCn            // 부정수급신고상세내용
        formData.dclNm = row.dclNm                                          // 신고자명
        formData.dclTelno = convertTelno(row.dclTelno)                      // 신고자 전화번호
        formData.dclMbtlnum = convertTelno(row.dclMbtlnum)                  // 신고자 휴대폰번호
        formData.dclEmlAddr = row.dclEmlAddr                                // 신고자 이메일주소
        formData.dclAddr = row.dclAddr                                      // 신고자 주소
        formData.picNm = row.picNm                                          // 담당자명
        formData.cvlcptRcptDt = convertDate(row.cvlcptRcptDt)               // 민원접수일시
        formData.prcsDt = convertDate(row.prcsDt)                           // 처리일시
        formData.fileList = row.fileList                                    // 첨부파일

        setFormData((prev) => ({ ...prev}));
    }

    // 보완요청 내용등록
    const updateIllegalReport = async () => {
        const cancelConfirm: boolean = confirm(modalInfo.confirmMsg)
        if (!cancelConfirm) return

        try {
            setLoadingBackdrop(true)
    
            let param : any = { 
                prcsSttsCd  : modalInfo.prcsSttsCd,  
                instcSpldmdCvlcptRpotTsid : selectedRows[0].instcSpldmdCvlcptRpotTsid,
            }    

            const endpoint: string = `/fsm/ilg/iscrm/cm/updateInstcSpldmdCvlcptRpotStatus`
            const response = await sendHttpRequest('PUT', endpoint, param, true, { cache: 'no-store' })

            if (response && response.data > 0) {
                alert(modalInfo.completeMsg)
            } else {
                alert('처리된 내역이 없습니다.')
            }
        } catch(error) {
            alert(`요청 처리에 실패하였습니다.`)
            console.error("ERROR POST DATA : ", error)
        } finally {
            setLoadingBackdrop(false)
            closeIllegalReportModal(true)  // 상세 모달 닫기 (저장 후 재조회)
        }
    }

    // 파일 다운로드
    const onFileDown = async (num: number) => {
        try {
            let endpoint: string = 
            `/fsm/ilg/iscrm/cm/getDownloadInstcSpldmdCvlcptRpotFile/` + formData.fileList[num]?.fileTsid
            const response = await sendHttpFileRequest('GET', endpoint, null, true, { cache: 'no-store' })
            
            const url = window.URL.createObjectURL(new Blob([response]));
            const link = document.createElement('a');

            link.href = url;
            link.setAttribute('download', formData.fileList[num]?.fileNm as string);
            document.body.appendChild(link);
            link.click();
        } catch (error) {
            // 에러시
            console.error('Error fetching data:', error)
        }
    }

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
                    <h2>부정수급제보 상세</h2>
                </CustomFormLabel>
                <div className="button-right-align">
                    <LoadingBackdrop open={loadingBackdrop} />
                    <Button variant="contained" color="primary" onClick={() => clickButton(0)} style={{ display: submitFlag ?  'none' : 'block' }}>접수</Button>
                    <Button variant="outlined" color="primary" onClick={() => clickButton(1)} style={{ display: submitFlag ?  'none' : 'block' }}>취하</Button>
                    <Button variant="outlined" color="primary" onClick={() => clickButton(2)} style={{ display: submitFlag ?  'none' : 'block' }}>반려</Button>
                    <Button variant="contained" color="primary" onClick={() => clickButton(4)} style={{ display: receiptFlag ? 'none' : 'block' }}>승인</Button>
                    <Button variant="outlined" color="primary" onClick={() => clickButton(3)} style={{ display: receiptFlag ? 'none' : 'block' }}>기각</Button>

                    <Button variant="outlined" color="primary" onClick={handleCloseModal}>취소</Button>
                </div>
            </Box>
            <Box
                id='form-modal'
                component='form'
                onSubmit={(e) => {
                    e.preventDefault()
                }}
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    m: 'auto',
                    width: '960px',
                }}
            >
                <Box sx={{ maxWidth: 'fullWidth', margin: '0 auto' }}>
                    <TableContainer style={{ margin: '0 0 0 0' }}>
                        <Table className="table table-bordered" aria-labelledby="tableTitle" style={{ tableLayout: 'fixed', width: '100%' }}>
                            <TableBody>
                                <TableRow>
                                    <TableCell className="td-head" style={{ width: '180px', textAlign: 'left', paddingLeft: '20px' }}>
                                        처리기관
                                    </TableCell>
                                    <TableCell colSpan={3}>
                                        <Typography 
                                            variant="body1" 
                                            fontWeight={300}
                                            style={{ paddingLeft: '10px' }}
                                            >
                                            {formData.locgovNm}
                                        </Typography>
                                    </TableCell>
                                    <TableCell className="td-head" style={{ width: '180px', textAlign: 'left', paddingLeft: '20px' }}>
                                        처리상태
                                    </TableCell>
                                    <TableCell colSpan={3}>
                                        <Typography 
                                            variant="body1" 
                                            fontWeight={300}
                                            style={{ paddingLeft: '10px' }}
                                            >
                                            {formData.prcsSttsNm}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="td-head" style={{ width: '180px', textAlign: 'left', paddingLeft: '20px' }}>
                                        신고자 성명
                                    </TableCell>
                                    <TableCell colSpan={3}>
                                        <Typography 
                                            variant="body1" 
                                            fontWeight={300}
                                            style={{ paddingLeft: '10px' }}
                                            >
                                            {formData.dclNm}
                                        </Typography>
                                    </TableCell>
                                    <TableCell className="td-head" style={{ width: '180px', textAlign: 'left', paddingLeft: '20px' }}>
                                        신고자 전화번호
                                    </TableCell>
                                    <TableCell colSpan={3}>
                                        <Typography 
                                            variant="body1" 
                                            fontWeight={300}
                                            style={{ paddingLeft: '10px' }}
                                            >
                                            {formData.dclTelno}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="td-head" style={{ width: '180px', textAlign: 'left', paddingLeft: '20px' }}>
                                        신고자 휴대전화
                                    </TableCell>
                                    <TableCell colSpan={3}>
                                        <Typography 
                                            variant="body1" 
                                            fontWeight={300}
                                            style={{ paddingLeft: '10px' }}
                                            >
                                            {formData.dclMbtlnum}
                                        </Typography>
                                    </TableCell>
                                    <TableCell className="td-head" style={{ width: '180px', textAlign: 'left', paddingLeft: '20px' }}>
                                        신고자 이메일주소
                                    </TableCell>
                                    <TableCell colSpan={3}>
                                        <Typography 
                                            variant="body1" 
                                            fontWeight={300}
                                            style={{ paddingLeft: '10px' }}
                                            >
                                            {formData.dclEmlAddr}
                                        </Typography>
                                    </TableCell>   
                                </TableRow>
                                <TableRow>
                                    <TableCell className="td-head" style={{ width: '180px', textAlign: 'left', paddingLeft: '20px' }}>
                                        신고자 주소
                                    </TableCell>
                                    <TableCell colSpan={7}>
                                        <Typography 
                                            variant="body1" 
                                            fontWeight={300}
                                            style={{ paddingLeft: '10px' }}
                                            >
                                            {formData.dclAddr}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="td-head" style={{ width: '180px', textAlign: 'left', paddingLeft: '20px' }}>
                                          신고인 구분
                                    </TableCell>
                                    <TableCell colSpan={3}>
                                        <Typography 
                                            variant="body1" 
                                            fontWeight={300}
                                            style={{ paddingLeft: '10px' }}
                                            >
                                            {formData.instcSpldmdRpotDclrTypeNm}
                                        </Typography>
                                    </TableCell>
                                    <TableCell className="td-head" style={{ width: '180px', textAlign: 'left', paddingLeft: '20px' }}>
                                         차량유형
                                    </TableCell>
                                    <TableCell colSpan={3}>
                                        <Typography 
                                            variant="body1" 
                                            fontWeight={300}
                                            style={{ paddingLeft: '10px' }}
                                            >
                                            {formData.vhclKndNm}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="td-head" style={{ width: '180px', textAlign: 'left', paddingLeft: '20px' }}>
                                          차량번호
                                    </TableCell>
                                    <TableCell colSpan={3}>
                                        <Typography 
                                            variant="body1" 
                                            fontWeight={300}
                                            style={{ paddingLeft: '10px' }}
                                            >
                                            {formData.vhclNo}
                                        </Typography>
                                    </TableCell>
                                    <TableCell className="td-head" style={{ width: '180px', textAlign: 'left', paddingLeft: '20px' }}>
                                         유종명
                                    </TableCell>
                                    <TableCell colSpan={3}>
                                        <Typography 
                                            variant="body1" 
                                            fontWeight={300}
                                            style={{ paddingLeft: '10px' }}
                                            >
                                            {formData.koiNm}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="td-head" style={{ width: '180px', textAlign: 'left', paddingLeft: '20px' }}>
                                        부정수급건수
                                    </TableCell>
                                    <TableCell colSpan={7}>
                                        <Typography 
                                            variant="body1" 
                                            fontWeight={300}
                                            style={{ paddingLeft: '10px' }}
                                            >
                                            {formData.instcSpldmdNocsNm}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="td-head" style={{ width: '180px', textAlign: 'left', paddingLeft: '20px' }}>
                                        부정수급행위일자
                                    </TableCell>
                                    <TableCell colSpan={7}>
                                        <Typography 
                                            variant="body1" 
                                            fontWeight={300}
                                            style={{ paddingLeft: '10px' }}
                                            >
                                            {formData.instcSpldmdYmd}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="td-head" style={{ width: '180px', textAlign: 'left', paddingLeft: '20px' }}>
                                        부정수급행위 상세내용
                                    </TableCell>
                                    <TableCell colSpan={7}>
                                        <Typography 
                                            variant="body1" 
                                            fontWeight={300}
                                            style={{ paddingLeft: '10px' }}
                                            >
                                            {formData.instcSpldmdDclrDtlCn}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="td-head" style={{ width: '180px', textAlign: 'left', paddingLeft: '20px' }}>
                                        증빙서류
                                    </TableCell>
                                    <TableCell colSpan={7}>
                                        <Box sx={{ mt: 1 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px', border: '1px solid #ddd', marginBottom: '4px', borderRadius: '4px' }}>
                                                <div className="form-group" style={{ paddingLeft: '8px' }}>
                                                    <Typography 
                                                        variant="body1" 
                                                        fontWeight={300}
                                                        >
                                                        {formData.fileList?.length > 0
                                                        ? formData.fileList[0].fileNm  : ''}
                                                    </Typography>
                                                </div>
                                                <div className="button-right-align">
                                                    <Button variant="contained" color="primary" size="small" onClick={() => onFileDown(0)} disabled={downloadFlag}>
                                                        다운로드
                                                    </Button>
                                                </div>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                                <TableRow style={{ display: approvalFlag ? 'table-row' : 'none' }}>
                                    <TableCell className="td-head" style={{ width: '180px', textAlign: 'left', paddingLeft: '20px' }}>
                                          담당자
                                    </TableCell>
                                    <TableCell colSpan={3}>
                                        <Typography 
                                            variant="body1" 
                                            fontWeight={300}
                                            style={{ paddingLeft: '10px' }}
                                            >
                                            {formData.picNm}
                                        </Typography>
                                    </TableCell>
                                    <TableCell className="td-head" style={{ width: '180px', textAlign: 'left', paddingLeft: '20px' }}>
                                         접수일시
                                    </TableCell>
                                    <TableCell colSpan={3}>
                                        <Typography 
                                            variant="body1" 
                                            fontWeight={300}
                                            style={{ paddingLeft: '10px' }}
                                            >
                                            {formData.cvlcptRcptDt}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                                <TableRow style={{ display: approvalFlag ? 'table-row' : 'none' }}>
                                    <TableCell className="td-head" style={{ width: '180px', textAlign: 'left', paddingLeft: '20px' }}>
                                          처리자
                                    </TableCell>
                                    <TableCell colSpan={3}>
                                        <Typography 
                                            variant="body1" 
                                            fontWeight={300}
                                            style={{ paddingLeft: '10px' }}
                                            >
                                            {formData.picNm}
                                        </Typography>
                                    </TableCell>
                                    <TableCell className="td-head" style={{ width: '180px', textAlign: 'left', paddingLeft: '20px' }}>
                                         처리일시
                                    </TableCell>
                                    <TableCell colSpan={3}>
                                        <Typography 
                                            variant="body1" 
                                            fontWeight={300}
                                            style={{ paddingLeft: '10px' }}
                                            >
                                            {formData.prcsDt}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>                
            </Box>
            </DialogContent>
        </Dialog>
        </React.Fragment>
    );
}
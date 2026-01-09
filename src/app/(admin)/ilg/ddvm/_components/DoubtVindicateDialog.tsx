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

interface DoubtVindicateDialogProps {
    title: string;
    size?: DialogProps['maxWidth'] | 'lg';
    open: boolean;
    selectedRows: Row[];
    reloadFunc: () => void;
    closeDoubtVindicateModal: (saveFlag: boolean) => void;
}

interface fileList {
    fileTsid: string      
    fileNm: string    
    rfncTsid: string    
    fileClsfNm: string    
    strgFileNm: string         
    fileStrgPath: string         
}

export interface doubtVindicateInfo {
    doubtDlngVndcTsid: string   // 의심거래소명식별번호
    sbmsnDt: string             // 제출일시
    locgovNm: string            // 지자체코드
    docNm: string               // 문서명
    docNo: string               // 문서번호
    admdspNm: string            // 행정처분명           
    wrtrNm: string              // 작성자명
    mbtlnum: string             // 작성자전화번호
    wrtrAddr: string            // 작성자주소
    trprNm: string              // 대상자명        
    trprTelno: string           // 대상자전화번호
    trprAddr: string            // 대상자주소
    opnnCn: string              // 의견내용
    etcRsn: string              // 기타사유
    picNm: string               // 담당자명
    cvlcptRcptDt: string        // 민원접수일시
    prcsDt: string              // 처리일시
    splmntDmndCn: string        // 보완요청내용
    prcsSttsCd: string          // 처리상태코드
    prcsSttsNm: string          // 처리상태명칭
    fileList: fileList[]        // 첨부파일
}

export interface dialogInfo {
    prcsSttsCd: string  // 처리상태코드
    confirmMsg: string  // 확인 팝업 문구
    completeMsg: string // 완료 팝업 문구
}

export interface CustomFile {
    atchSn?: string;  //첨부일련번호
    bbscttSn?: string; //게시글일련번호
    fileSize?: string; //파일용량
    lgcFileNm?: string; //논리파일명
    mdfcnDt?: string; //수정일시
    mdfrId?: string; //수정자아이디
    physFileNm?: string; // 물리파일명
    regDt?: string; // 등록일시
    rgtrId?: string;  // 등록자아이디
}

export default function DoubtVindicateDialog(props: DoubtVindicateDialogProps) {
    const { title, 
        //children
        size, open, selectedRows, closeDoubtVindicateModal, reloadFunc } = props;
    
    const [loading, setLoading] = useState(false) // 로딩여부
    const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 저장시 로딩상태

    const [registerModalFlag, setRegisterModalFlag] = useState(false) // 보완요청 내용등록 모달 플래그
    const [submitFlag, setSubmitFlag] = useState(true) // 접수 버튼 히든 처리 플래그
    const [completeFlag, setCompleteFlag] = useState(true) // 처리완료 버튼 히든 처리 플래그
    const [requestFlag, setRequestFlag] = useState(true) // 보완요청 버튼 히든 처리 플래그
    const [downloadFlag, setDownloadFlag] = useState(true) // 다운로드 버튼 비활성화 처리 플래그

    // 저장될 데이터를 관리하는 상태
    const [formData, setFormData] = useState<doubtVindicateInfo> ({
        doubtDlngVndcTsid:  '',     // 의심거래소명식별번호
        sbmsnDt:            '',     // 제출일시
        locgovNm:           '',     // 지자체코드
        docNm:              '',     // 문서명
        docNo:              '',     // 문서번호
        admdspNm:           '',     // 행정처분명           
        wrtrNm:             '',     // 작성자명
        mbtlnum:            '',     // 작성자전화번호
        wrtrAddr:           '',     // 작성자주소
        trprNm:             '',     // 대상자명        
        trprTelno:          '',     // 대상자전화번호
        trprAddr:           '',     // 대상자주소
        opnnCn:             '',     // 의견내용
        etcRsn:             '',     // 기타사유
        picNm:              '',     // 담당자명
        cvlcptRcptDt:       '',     // 민원접수일시
        prcsDt:             '',     // 처리일시
        splmntDmndCn:       '',     // 보완요청내용
        prcsSttsCd:         '',     // 처리상태코드
        prcsSttsNm:         '',     // 처리상태먕칭
        fileList:           []      // 첨부파일
    })

    // 등록 모달 창 관리 
    const [modalInfo, setModalInfo] = useState<dialogInfo> ({
        prcsSttsCd: '', // 처리상태코드
        confirmMsg: '',  // 확인 팝업 문구
        completeMsg: '', // 완료 팝업 문구
    })

    // 코드 파싱을 위한 item 세팅
    useEffect(() => {
        fetchData() // 의심거래 운수종사자 소명 상세 조회
    }, [])   

    // 다이얼로그 닫기 핸들러
    const handleCloseModal = async () => {
        closeDoubtVindicateModal(false)
    };

    // 모달 우측 상단 버튼 클릭 이벤트
    const clickButton = async (num: number) => {
            // 클릭한 버튼에 따라 모달창 내용을 변경 처리
            switch (num){
                case 0:     // 접수
                    modalInfo.prcsSttsCd    = 'PSC006'  // 처리상태코드
                    modalInfo.confirmMsg    = '의심거래 운수종사자 소명을 접수하시겠습니까?' // 확인 팝업 문구
                    modalInfo.completeMsg   = '의심거래 운수종사자 소명이 접수되었습니다.\n의심거래 소명이 완료되면 처리완료를 진행해 주시길 바랍니다.' // 완료 팝업 문구
                    break
                
                case 1:     // 처리완료
                    modalInfo.prcsSttsCd    = 'PSC007'  // 처리상태코드
                    modalInfo.confirmMsg    = '의심거래 운수종사자 소명을 처리완료하시겠습니까?' // 확인 팝업 문구
                    modalInfo.completeMsg   = '의심거래 운수종사자 소명이 처리완료되었습니다.'  // 완료 팝업 문구 
                    break
                case 2:     // 보완요청
                    modalInfo.prcsSttsCd    = 'PSC008'  // 처리상태코드
                    modalInfo.confirmMsg    = '보완요청을 하시겠습니까?' // 확인 팝업 문구
                    modalInfo.completeMsg   = '보완요청이 처리되었습니다.' // 완료 팝업 문구
                    break
                default:
                    break
            }
    
            setModalInfo((prev) => ({ ...prev}));
    
            if (num === 2) {
                setRegisterModalFlag(true)  // 보완요청 내용등록 모달 열기        
            } else {
                updateDoubtVindicate()   // 업데이트로 바로 이동
            }
    }

    const handleParamChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
      ) => {
        const { name, value } = event.target
        setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // 의심거래 운수종사자 소명 상세 조회
    const fetchData = async () => {
        setLoading(true)
        try {
            const endpoint: string =
                `/fsm/ilg/ddvm/cm/getOneDoubtDlngVndcMng?` +
                `${selectedRows[0].doubtDlngVndcTsid ? '&doubtDlngVndcTsid=' + selectedRows[0].doubtDlngVndcTsid : ''}`

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
    function isNull(obj: any) {
        if (obj === '' || obj === null || obj === undefined) {
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

    // 의심거래 운수종사자 소명 상세 설정
    const setFetchData = async (row: doubtVindicateInfo) => {
        // 불필요한 버튼 히든 처리
        if (row.prcsSttsCd === 'PSC003') {
            setSubmitFlag(false)
            setCompleteFlag(true)
            setRequestFlag(false)
        } else if (row.prcsSttsCd === 'PSC006') {
            setSubmitFlag(true)
            setCompleteFlag(false)
            setRequestFlag(false)
        } 
        
        // 다운로드 버튼 활성화 처리
        if (row.fileList?.length > 0) {
            setDownloadFlag(false)
        }

        //선택된 행을 담음
        formData.doubtDlngVndcTsid  = row.doubtDlngVndcTsid         // 의심거래소명식별번호
        formData.sbmsnDt            = row.sbmsnDt                   // 제출일시
        formData.locgovNm           = row.locgovNm                  // 지자체코드
        formData.docNm              = row.docNm                     // 문서명
        formData.docNo              = row.docNo                     // 문서번호
        formData.admdspNm           = row.admdspNm                  // 행정처분명           
        formData.wrtrNm             = row.wrtrNm                    // 작성자명
        formData.mbtlnum            = convertTelno(row.mbtlnum)
        formData.wrtrAddr           = row.wrtrAddr                  // 작성자주소
        formData.trprNm             = row.trprNm                    // 대상자명        
        formData.trprTelno          = convertTelno(row.trprTelno)   // 대상자전화번호
        formData.trprAddr           = row.trprAddr                  // 대상자주소
        formData.opnnCn             = row.opnnCn                    // 의견내용
        formData.etcRsn             = row.etcRsn                    // 기타사유
        formData.picNm              = row.picNm                     // 담당자명
        formData.cvlcptRcptDt       = convertDate(row.cvlcptRcptDt) // 민원접수일시
        formData.prcsDt             = convertDate(row.prcsDt)       // 처리일시
        formData.splmntDmndCn       = row.splmntDmndCn              // 보완요청내용
        formData.prcsSttsCd         = row.prcsSttsCd                // 처리상태코드
        formData.prcsSttsNm         = row.prcsSttsNm                // 처리상태명칭
        formData.fileList           = row.fileList                  // 첨부파일

        setFormData((prev) => ({ ...prev}));
    }

    // 보완요청 내용등록
    const updateDoubtVindicate = async () => {

        if (modalInfo.prcsSttsCd === 'PSC008' && formData.splmntDmndCn.length < 1) {
            alert("보완요청내용을 입력하세요.")
            return
        }

        const cancelConfirm: boolean = confirm(modalInfo.confirmMsg)
        if (!cancelConfirm) return

        try {
            setLoadingBackdrop(true)
    
            let param : any = { 
                prcsSttsCd  : modalInfo.prcsSttsCd,  
                splmntDmndCn : formData.splmntDmndCn,
                doubtDlngVndcTsid : formData.doubtDlngVndcTsid,
            }            

            const endpoint: string = `/fsm/ilg/ddvm/cm/updateDoubtDlngVndcStatus`
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
            closeDoubtVindicateModal(true)  // 상세 모달 닫기 (저장 후 재조회)
        }
    }

    // 보완요청 내용등록 모달 닫기
    const closeRegisterModal = () => {
        setRegisterModalFlag((prev) => false)
    }

    // 파일 다운로드
    const onFileDown = async (num: number) => {
        try {
            let endpoint: string = 
            `/fsm/ilg/ddvm/cm/getDownloadDoubtDlngVndcFile/` + formData.fileList[num]?.fileTsid
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
                    <h2>의심거래 운수종사자 소명 상세</h2>
                </CustomFormLabel>
                <div className="button-right-align">
                    <LoadingBackdrop open={loadingBackdrop} />
                    <Button variant="contained" color="primary" onClick={() => clickButton(0)} style={{ display: submitFlag ?  'none' : 'block' }}>접수</Button>
                    <Button variant="contained" color="primary" onClick={() => clickButton(1)} style={{ display: completeFlag ? 'none' : 'block' }}>처리완료</Button>
                    <Button variant="outlined" color="primary" onClick={() => clickButton(2)} style={{ display: requestFlag ? 'none' : 'block' }}>보완요청</Button>

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
                                    <TableCell className="td-head" style={{ width: '160px', textAlign: 'left', paddingLeft: '8px' }}>
                                        <span className="required-text" >*</span> 처리기관
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
                                    <TableCell className="td-head" style={{ width: '160px', textAlign: 'left', paddingLeft: '19px' }}>
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
                                    <TableCell className="td-head" style={{ width: '160px', textAlign: 'left', paddingLeft: '19px' }}>
                                        문서명
                                    </TableCell>
                                    <TableCell colSpan={3}>
                                        <Typography 
                                            variant="body1" 
                                            fontWeight={300}
                                            style={{ paddingLeft: '10px' }}
                                            >
                                            {formData.docNm}
                                        </Typography>
                                    </TableCell>
                                    <TableCell className="td-head" style={{ width: '160px', textAlign: 'left', paddingLeft: '19px' }}>
                                        문서번호
                                    </TableCell>
                                    <TableCell colSpan={3}>
                                        <Typography 
                                            variant="body1" 
                                            fontWeight={300}
                                            style={{ paddingLeft: '10px' }}
                                            >
                                            {formData.docNo}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="td-head" style={{ width: '160px', textAlign: 'left', paddingLeft: '19px' }}>
                                          제출인명
                                    </TableCell>
                                    <TableCell colSpan={3}>
                                        <Typography 
                                            variant="body1" 
                                            fontWeight={300}
                                            style={{ paddingLeft: '10px' }}
                                            >
                                            {formData.wrtrNm}
                                        </Typography>
                                    </TableCell>
                                    <TableCell className="td-head" style={{ width: '160px', textAlign: 'left', paddingLeft: '19px' }}>
                                         제출인 전화번호
                                    </TableCell>
                                    <TableCell colSpan={3}>
                                        <Typography 
                                            variant="body1" 
                                            fontWeight={300}
                                            style={{ paddingLeft: '10px' }}
                                            >
                                            {formData.mbtlnum}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="td-head" style={{ width: '160px', textAlign: 'left', paddingLeft: '19px' }}>
                                        제출인 주소
                                    </TableCell>
                                    <TableCell colSpan={7}>
                                        <Typography 
                                            variant="body1" 
                                            fontWeight={300}
                                            style={{ paddingLeft: '10px' }}
                                            >
                                            {formData.wrtrAddr}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="td-head" style={{ width: '160px', textAlign: 'left', paddingLeft: '19px' }}>
                                          당사자명
                                    </TableCell>
                                    <TableCell colSpan={3}>
                                        <Typography 
                                            variant="body1" 
                                            fontWeight={300}
                                            style={{ paddingLeft: '10px' }}
                                            >
                                            {formData.trprNm}
                                        </Typography>
                                    </TableCell>
                                    <TableCell className="td-head" style={{ width: '160px', textAlign: 'left', paddingLeft: '19px' }}>
                                         당사자 전화번호
                                    </TableCell>
                                    <TableCell colSpan={3}>
                                        <Typography 
                                            variant="body1" 
                                            fontWeight={300}
                                            style={{ paddingLeft: '10px' }}
                                            >
                                            {formData.trprTelno}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="td-head" style={{ width: '160px', textAlign: 'left', paddingLeft: '19px' }}>
                                        당사자 주소
                                    </TableCell>
                                    <TableCell colSpan={7}>
                                        <Typography 
                                            variant="body1" 
                                            fontWeight={300}
                                            style={{ paddingLeft: '10px' }}
                                            >
                                            {formData.trprAddr}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="td-head" style={{ width: '160px', textAlign: 'left', paddingLeft: '19px' }}>
                                          신고자명
                                    </TableCell>
                                    <TableCell colSpan={3}>
                                        <Typography 
                                            variant="body1" 
                                            fontWeight={300}
                                            style={{ paddingLeft: '10px' }}
                                            >
                                            {formData.wrtrNm}
                                        </Typography>
                                    </TableCell>
                                    <TableCell className="td-head" style={{ width: '160px', textAlign: 'left', paddingLeft: '19px' }}>
                                         연락처
                                    </TableCell>
                                    <TableCell colSpan={3}>
                                        <Typography 
                                            variant="body1" 
                                            fontWeight={300}
                                            style={{ paddingLeft: '10px' }}
                                            >
                                            {formData.mbtlnum}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="td-head" style={{ width: '160px', textAlign: 'left', paddingLeft: '19px' }}>
                                        처분제목
                                    </TableCell>
                                    <TableCell colSpan={7}>
                                        <Typography 
                                            variant="body1" 
                                            fontWeight={300}
                                            style={{ paddingLeft: '10px' }}
                                            >
                                            {formData.admdspNm}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="td-head" style={{ width: '160px', textAlign: 'left', paddingLeft: '19px' }}>
                                        소명내용
                                    </TableCell>
                                    <TableCell colSpan={7}>
                                        <CustomFormLabel className="input-label-none" htmlFor="modal-opnnCn">내용</CustomFormLabel>
                                        <textarea className="MuiTextArea-custom"
                                            id="modal-opnnCn"
                                            // multiline
                                            rows={4}
                                            // fontWeight={300}
                                            // variant="outlined"
                                            // fullWidth
                                            disabled={true}
                                            value={formData.opnnCn}
                                        />
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="td-head" style={{ width: '160px', textAlign: 'left', paddingLeft: '19px' }}>
                                        기타
                                    </TableCell>
                                    <TableCell colSpan={7}>
                                        <CustomFormLabel className="input-label-none" htmlFor="modal-etcRsn">내용</CustomFormLabel>
                                        <textarea className="MuiTextArea-custom"
                                            id="modal-etcRsn"
                                            // multiline
                                            rows={4}
                                            // fontWeight={300}
                                            // variant="outlined"
                                            // fullWidth
                                            disabled={true}
                                            value={formData.etcRsn}
                                        />
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="td-head" style={{ width: '160px', textAlign: 'left', paddingLeft: '19px' }}>
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
                                <TableRow style={{ display: requestFlag ? 'table-row' : 'none' }}>
                                    <TableCell className="td-head" style={{ width: '160px', textAlign: 'left', paddingLeft: '19px' }}>
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
                                    <TableCell className="td-head" style={{ width: '160px', textAlign: 'left', paddingLeft: '19px' }}>
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
                                <TableRow style={{ display: requestFlag ? 'table-row' : 'none' }}>
                                    <TableCell className="td-head" style={{ width: '160px', textAlign: 'left', paddingLeft: '19px' }}>
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
                                    <TableCell className="td-head" style={{ width: '160px', textAlign: 'left', paddingLeft: '19px' }}>
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
                                <TableRow style={{ display: requestFlag ? 'table-row' : 'none' }}>
                                    <TableCell className="td-head"  style={{ width: '160px', textAlign: 'left', paddingLeft: '19px' }}>
                                        보완요청내용
                                    </TableCell>
                                    <TableCell colSpan={7}>
                                        <Typography 
                                            variant="body1" 
                                            fontWeight={300}
                                            style={{ paddingLeft: '10px' }}
                                            >
                                            {formData.splmntDmndCn}
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
        {/* 등록 모달 */}
        <div>
            {registerModalFlag && (
            <Dialog
                fullWidth={false}
                maxWidth={'sm'}
                open={registerModalFlag}
                onClose={closeRegisterModal}
            >
                <DialogContent>
                <Box className="table-bottom-button-group">
                    <CustomFormLabel className="input-label-display">
                    <h2>보완요청 내용등록</h2>
                    </CustomFormLabel>
                    <div className="button-right-align">
                    <Button
                        variant="contained"
                        onClick={() => updateDoubtVindicate()}
                        color="primary"
                    >
                        보완요청
                    </Button>
                    <Button
                        variant="outlined"
                        color="primary"
                        onClick={closeRegisterModal}
                    >
                        취소
                    </Button>
                    </div>
                </Box>
                <Box
                    id="form-modal"
                    component="form"
                    onSubmit={(e) => {
                    e.preventDefault()
                    }}
                    sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    m: 'auto',
                    width: 'auto',
                    }}
                >
                    <Box sx={{ maxWidth: 'fullWidth', margin: '0 auto' }}>
                    <TableContainer style={{ margin: '0px 0px 0px 0px' }}>
                        <Table
                        className="table table-bordered"
                        aria-labelledby="tableTitle"
                        style={{ tableLayout: 'fixed', width: '100%' }}
                        >
                        <TableBody>
                            <TableRow>
                            <TableCell
                                className="td-head"
                                style={{ width: '120px', verticalAlign: 'middle' }}
                            >
                                <span className="required-text">*</span>보완요청내용
                            </TableCell>
                            <TableCell style={{ textAlign: 'left' }}>
                            <CustomFormLabel className="input-label-none" htmlFor="modal-splmntDmndCn">보완요청내용</CustomFormLabel>
                                <textarea className="MuiTextArea-custom"
                                    id="modal-splmntDmndCn"
                                    name="splmntDmndCn"
                                    // multiline
                                    rows={4}
                                    value={formData.splmntDmndCn}
                                    placeholder={'보완요청내용을 입력하세요.'}
                                    // variant="outlined"
                                    style={{
                                        marginLeft: '0px',
                                        width: '100%',
                                        height: '100%',
                                    }}
                                    onChange={handleParamChange}
                                    />
                            </TableCell>
                            </TableRow>
                        </TableBody>
                        </Table>
                    </TableContainer>
                    </Box>
                </Box>
                </DialogContent>
            </Dialog>
            )}
        </div>
        </React.Fragment>
    );
}
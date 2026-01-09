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
    TableHead,
} from '@mui/material';

import React, { useEffect, useState } from 'react';

import Dialog, { DialogProps } from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { Row } from '../page'

import { CustomFormLabel, CustomTextField } from '@/utils/fsms/fsm/mui-imports';
import { sendHttpFileRequest, sendHttpRequest, sendMultipartFormDataRequest } from '@/utils/fsms/common/apiUtils';

import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import { object } from '@amcharts/amcharts4/core';

interface PosDetailDialogProps {
    title: string;
    size?: DialogProps['maxWidth'] | 'lg';
    open: boolean;
    selectedRows: Row[];
    reloadFunc: () => void;
    closePosDetailModal: (saveFlag: boolean) => void;
}

interface fileList {
    fileTsid: string      
    fileNm: string    
    rfncTsid: string    
    fileClsfNm: string    
    strgFileNm: string         
    fileStrgPath: string         
}

export interface posDetailInfo {
    posDclrTsid: string     // POS신고식별번호
    instlYmd: string        // 설치일자
    posDclrCnCd: string     // POS신고내용코드
    posDclrCnNm: string     // POS신고내용
    prcsSttsCd: string      // 처리상태코드
    prcsSttsNm: string      // 처리상태명칭           
    brno: string            // 사업자등록번호
    dclNm: string           // 신고자명
    ornCmpnyNm: string      // 정유사코드
    cttpcTelno: string      // 연락처전화번호        
    bfchgCn: string         // 변경전내용
    aftchCn: string         // 변경후내용
    rprsvNm: string         // 대표자명
    oltNm: string           // 주유소명
    daddr: string           // 주유소주소
    locgovNm: string        // 처리가관
    splmntDmndCn: string    // 등록내용
    picNm: string           // 담당자명   
    prcsDt: string          // 처리일시
    fileList:  fileList[]   // 첨부파일    
}

export interface dialogInfo {
    prcsSttsCd: string  // 처리상태코드
    prcsSttsNm: string  // 처리상태명칭
    columnName: string  // 입력컬럼명칭
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

export default function PosDetailDialog(props: PosDetailDialogProps) {
    const { title, 
        //children
        size, open, selectedRows, closePosDetailModal, reloadFunc } = props;
    
    const [loading, setLoading] = useState(false) // 로딩여부
    const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 저장시 로딩상태

    const [registerModalFlag, setRegisterModalFlag] = useState(false) // 내용, 사유 등록 모달 플래그
    const [submitFlag, setSubmitFlag] = useState(true) // 접수 버튼 히든 처리 플래그
    const [completeFlag, setCompleteFlag] = useState(true) // 처리완료 버튼 히든 처리 플래그
    const [requestFlag, setRequestFlag] = useState(true) // 보완요청 버튼 히든 처리 플래그
    const [downloadFlag1, setDownloadFlag1] = useState(true) // 다운로드 버튼 비활성화 처리 플래그
    const [downloadFlag2, setDownloadFlag2] = useState(true) // 다운로드 버튼 비활성화 처리 플래그
    const [downloadFlag3, setDownloadFlag3] = useState(true) // 다운로드 버튼 비활성화 처리 플래그

    // 저장될 데이터를 관리하는 상태
    const [formData, setFormData] = useState<posDetailInfo> ({
        posDclrTsid:    '',     // POS신고식별번호
        instlYmd:       '',     // 설치일자
        posDclrCnCd:    '',     // POS신고내용코드
        posDclrCnNm:    '',     // POS신고내용
        prcsSttsCd:     '',     // 처리상태코드
        prcsSttsNm:     '',     // 처리상태명칭           
        brno:           '',     // 사업자등록번호
        dclNm:          '',     // 신고자명
        ornCmpnyNm:     '',     // 정유사코드
        cttpcTelno:     '',     // 연락처전화번호        
        bfchgCn:        '',     // 변경전내용
        aftchCn:        '',     // 변경후내용
        rprsvNm:        '',     // 대표자명
        oltNm:          '',     // 주유소명
        daddr:          '',     // 주유소주소
        locgovNm:       '',     // 처리가관
        splmntDmndCn:   '',     // 보완요청내용
        picNm:          '',     // 담당자명   
        prcsDt:         '',     // 처리일시
        fileList:       []      // 첨부파일
    })

    // 등록 모달 창 관리 
    const [modalInfo, setModalInfo] = useState<dialogInfo> ({
        prcsSttsCd:  '', // 처리상태코드
        prcsSttsNm:  '', // 처리상태명칭
        columnName:  '', // 입력컬럼명칭
        confirmMsg:  '', // 확인 팝업 문구
        completeMsg: '', // 완료 팝업 문구
    })

    // 코드 파싱을 위한 item 세팅
    useEffect(() => {
        fetchData() // POS신고 상세 조회
    }, [])   

    // 다이얼로그 닫기 핸들러
    const handleCloseModal = () => {
        closePosDetailModal(false);
    };

    const handleParamChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
      ) => {
        const { name, value } = event.target
        setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // POS신고 상세 조회
    const fetchData = async () => {
        setLoading(true)
        try {
            
        const endpoint: string =
            `/fsm/apv/rpdm/tr/getOneReportPosDclrMng?` +
            `${selectedRows[0].posDclrTsid ? '&posDclrTsid=' + selectedRows[0].posDclrTsid : ''}`

        const response = await sendHttpRequest('GET', endpoint, null, true, {
            cache: 'no-store',
        })

        if (response && response.resultType === 'success' && response.data) {
            // 입력 폼 데이터에 설정
            setFetchData(response.data.result[0])
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

    // 년월일자 '-' 표시 추가
    function convertDate (date: String) {
        if (isNull(date)) { return '' }
        return date?.substring(0,4) + "-" + date?.substring(4,6) + "-" + date?.substring(6,8)
    }

    // 사업자번호 '-' 표시 추가
    function convertBrno (brno: String) {
        if (isNull(brno)) { return '' }
        return brno?.substring(0,3) + "-" + brno?.substring(3,5) + "-" + brno?.substring(5,10)
    }

    // POS신고 상세 설정
    const setFetchData = async (row: posDetailInfo) => {
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
            setDownloadFlag1(false)
        } 
        
        if (row.fileList?.length > 1) {
            setDownloadFlag2(false)
        } 
        
        if (row.fileList?.length > 2) {
            setDownloadFlag3(false)
        }

        //선택된 행을 담음
        formData.posDclrTsid    = row.posDclrTsid               // POS신고식별번호
        formData.instlYmd       = convertDate(row.instlYmd)     // 설치년월일
        formData.posDclrCnCd    = row.posDclrCnCd               // POS신고내용코드
        formData.posDclrCnNm    = row.posDclrCnNm               // POS신고내용
        formData.prcsSttsCd     = row.prcsSttsCd                // 처리상태코드
        formData.prcsSttsNm     = row.prcsSttsNm                // 처리상태           
        formData.brno           = convertBrno(row.brno)         // 사업자등록번호
        formData.dclNm          = row.dclNm                     // 신고자명
        formData.ornCmpnyNm     = row.ornCmpnyNm                // 정유사코드
        formData.cttpcTelno     = row.cttpcTelno                // 연락처전화번호        
        formData.bfchgCn        = row.bfchgCn                   // 변경전내용
        formData.aftchCn        = row.aftchCn                   // 변경후내용
        formData.rprsvNm        = row.rprsvNm                   // 대표자명
        formData.oltNm          = row.oltNm                     // 주유소명
        formData.daddr          = row.daddr                     // 주유소주소
        formData.locgovNm       = row.locgovNm                  // 처리가관
        formData.picNm          = row.picNm                     // 담당자명   
        formData.prcsDt         = row.prcsDt?.substring(0,10)   // 처리일시
        formData.splmntDmndCn   = row.splmntDmndCn              // 등록내용
        formData.fileList       = row.fileList                  // 첨부파일

        setFormData((prev) => ({ ...prev}));
    }

    // 보완요청 내용등록
    const updatePosDetail = async () => {
        if (modalInfo.prcsSttsCd !== 'PSC007' && modalInfo.prcsSttsCd !== 'PSC006' && formData.splmntDmndCn.length < 1) {
        //if (modalInfo.prcsSttsCd !== 'PSC007' && modalInfo.prcsSttsCd !== 'PSC006' && formData.splmntDmndCn.length < 1) {
            alert(`${modalInfo.prcsSttsNm}내용을 입력하세요.`)
            return
        }

        const cancelConfirm: boolean = confirm(modalInfo.confirmMsg)
        if (!cancelConfirm) return

        try {
            setLoadingBackdrop(true)
    
            let param : any = { 
                prcsSttsCd  : modalInfo.prcsSttsCd,
                posDclrTsid : formData.posDclrTsid,               
                splmntDmndCn : formData.splmntDmndCn
            }            

            const endpoint: string = `/fsm/apv/rpdm/tr/updateReportPosDclrStatus`
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
            closePosDetailModal(true)   // 상세 모달 닫기 (저장 후 재조회)
        }
    }

    // 내용 또는 사유 등록 모달 열기
    const clickButton = async (num: number) => {
        // 클릭한 버튼에 따라 모달창 내용을 변경 처리
        switch (num){
            case 0:     // 접수
                modalInfo.prcsSttsCd    = 'PSC006' // 처리상태코드
                modalInfo.prcsSttsNm    = '접수' // 처리상태명칭
                modalInfo.columnName    = '접수' // 입력컬럼명칭
                modalInfo.confirmMsg    = 'POS신고서를 접수하시겠습니까?\nPOS시스템설치 관리에서 등록 후\n처리완료 처리를 진행해 주시길 바랍니다.' // 확인 팝업 문구
                modalInfo.completeMsg   = 'POS신고서가 접수되었습니다.\nPOS시스템설치 관리에서 등록 후\n처리완료 처리를 진행해 주시길 바랍니다.' // 완료 팝업 문구
                break
            case 1:     // 처리완료
                modalInfo.prcsSttsCd    = 'PSC007' // 처리상태코드
                modalInfo.prcsSttsNm    = '처리완료' // 처리상태명칭
                modalInfo.columnName    = '처리완료' // 입력컬럼명칭
                modalInfo.confirmMsg    = 'POS신고서를 처리완료하시겠습니까?' // 확인 팝업 문구
                modalInfo.completeMsg   = 'POS신고서가 처리완료되었습니다.' // 완료 팝업 문구
                break
            case 2:     // 보완요청
                modalInfo.prcsSttsCd    = 'PSC008' // 처리상태코드
                modalInfo.prcsSttsNm    = '보완요청' // 처리상태명칭
                modalInfo.columnName    = '보완요청' // 입력컬럼명칭
                modalInfo.confirmMsg    = '보완요청을 하시겠습니까?' // 확인 팝업 문구
                modalInfo.completeMsg   = '보완요청이 처리되었습니다.' // 확인 팝업 문구
                break
            case 3:     // 취하
                modalInfo.prcsSttsCd    = 'PSC009' // 처리상태코드
                modalInfo.prcsSttsNm    = '취하' // 처리상태명칭
                modalInfo.columnName    = '취하사유' // 입력컬럼명칭
                modalInfo.confirmMsg    = '취하를 하시겠습니까?' // 확인 팝업 문구
                modalInfo.completeMsg   = '취하가 처리되었습니다.' // 확인 팝업 문구
                break
            case 4:     // 반려
                modalInfo.prcsSttsCd    = 'PSC010'   // 처리상태코드
                modalInfo.prcsSttsNm    = '반려'     // 처리상태명칭
                modalInfo.columnName    = '반려사유' // 입력컬럼명칭
                modalInfo.confirmMsg    = '반려를 하시겠습니까?' // 확인 팝업 문구
                modalInfo.completeMsg   = '반려가 처리되었습니다.' // 완료 팝업 문구
                break
            default:
                break
        }

        setModalInfo((prev) => ({ ...prev}));

        if (num === 0 || num === 1) {
            updatePosDetail()   // 확인창으로 바로 이동
        } else {
            setRegisterModalFlag(true)  // 내용 등록 모달 열기  
        }
    }

    // 내용 또는 사유 등록 모달 닫기
    const closeRegisterModal = () => {
        setRegisterModalFlag((prev) => false)
    }

    // 파일 다운로드
    const onFileDown = async (num: number) => {
        try {
            let endpoint: string =
            `/fsm/apv/rpdm/tr/getDownloadReportPosDclrFile/` + formData.fileList[num]?.fileTsid;
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
                    <h2>POS신고 상세</h2>
                </CustomFormLabel>
                <div className="button-right-align">
                    <LoadingBackdrop open={loadingBackdrop} />
                    <Button variant="contained" color="primary" onClick={() => clickButton(0)} style={{ display: submitFlag ?  'none' : 'block' }}>접수</Button>
                    <Button variant="contained" color="primary" onClick={() => clickButton(1)} style={{ display: completeFlag ?  'none' : 'block' }}>처리완료</Button>
                    <Button variant="contained" color="primary" onClick={() => clickButton(2)} style={{ display: requestFlag ?  'none' : 'block' }}>보완요청</Button>
                    <Button variant="contained" color="primary" onClick={() => clickButton(3)} style={{ display: requestFlag ?  'none' : 'block' }}>취하</Button>
                    <Button variant="contained" color="primary" onClick={() => clickButton(4)} style={{ display: requestFlag ?  'none' : 'block' }}>반려</Button>
                    <Button variant="contained" color="dark" onClick={handleCloseModal}>취소</Button>
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
                            <caption>POS 상세 내용 테이블</caption>
                            <TableHead style={{display:'none'}}>
                                <TableRow>
                                    <TableCell></TableCell>
                                    <TableCell></TableCell>
                                    <TableCell></TableCell>
                                    <TableCell></TableCell>
                                    <TableCell></TableCell>
                                    <TableCell></TableCell>
                                    <TableCell></TableCell>
                                    <TableCell></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow>
                                    <TableCell className="td-head" style={{ width: '180px', textAlign: 'left', paddingLeft: '8px' }}>
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
                                    <TableCell className="td-head" style={{ width: '180px', textAlign: 'left', paddingLeft: '8px' }}>
                                        <span className="required-text" >*</span> 신고구분
                                    </TableCell>
                                    <TableCell colSpan={3}>
                                        <Typography 
                                            variant="body1" 
                                            fontWeight={300}
                                            style={{ paddingLeft: '10px' }}
                                            >
                                            {formData.posDclrCnNm}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="td-head" style={{ width: '180px', textAlign: 'left', paddingLeft: '8px' }}>
                                        <span className="required-text" >*</span> 처리상태
                                    </TableCell>
                                    <TableCell colSpan={7}>
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
                                    <TableCell className="td-head" style={{ width: '180px', textAlign: 'left', paddingLeft: '19px' }}>
                                          주유소명
                                    </TableCell>
                                    <TableCell colSpan={3}>
                                        <Typography 
                                            variant="body1" 
                                            fontWeight={300}
                                            style={{ paddingLeft: '10px' }}
                                            >
                                            {formData.oltNm}
                                        </Typography>
                                    </TableCell>
                                    <TableCell className="td-head" style={{ width: '180px', textAlign: 'left', paddingLeft: '19px' }}>
                                         사업자등록번호
                                    </TableCell>
                                    <TableCell colSpan={3}>
                                        <Typography 
                                            variant="body1" 
                                            fontWeight={300}
                                            style={{ paddingLeft: '10px' }}
                                            >
                                            {formData.brno}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="td-head" style={{ width: '180px', textAlign: 'left', paddingLeft: '8px' }}>
                                        <span className="required-text" >*</span> 주소
                                    </TableCell>
                                    <TableCell colSpan={7}>
                                        <Typography 
                                            variant="body1" 
                                            fontWeight={300}
                                            style={{ paddingLeft: '10px' }}
                                            >
                                            {formData.daddr}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="td-head" style={{ width: '180px', textAlign: 'left', paddingLeft: '19px' }}>
                                          신고자명
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
                                    <TableCell className="td-head" style={{ width: '180px', textAlign: 'left', paddingLeft: '19px' }}>
                                         연락처
                                    </TableCell>
                                    <TableCell colSpan={3}>
                                        <Typography 
                                            variant="body1" 
                                            fontWeight={300}
                                            style={{ paddingLeft: '10px' }}
                                            >
                                            {formData.cttpcTelno}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="td-head" style={{ width: '180px', textAlign: 'left', paddingLeft: '8px' }}>
                                        <span className="required-text" >*</span> 설치년월일
                                    </TableCell>
                                    <TableCell colSpan={7}>
                                        <Typography 
                                            variant="body1" 
                                            fontWeight={300}
                                            style={{ paddingLeft: '10px' }}
                                            >
                                            {formData.instlYmd}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="td-head" style={{ width: '180px', textAlign: 'left', paddingLeft: '19px' }}>
                                        신고내용
                                    </TableCell>
                                    <TableCell colSpan={7}>
                                        <CustomFormLabel className="input-label-none" htmlFor="outlined-multiline-static">신고내용</CustomFormLabel>
                                        <textarea className="MuiTextArea-custom"
                                            id="outlined-multiline-static"
                                            // multiline
                                            rows={4}
                                            // fontWeight={300}
                                            // variant="outlined"
                                            // fullWidth
                                            disabled={true}
                                            value={formData.posDclrCnNm}
                                        />
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="td-head" style={{ width: '180px', textAlign: 'left', paddingLeft: '19px' }}>
                                        POS설치계약증명서류
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
                                                    <Button variant="contained" color="primary" size="small" onClick={() => onFileDown(0)} disabled={downloadFlag1}>
                                                        다운로드
                                                    </Button>
                                                </div>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="td-head" style={{ width: '180px', textAlign: 'left', paddingLeft: '19px' }}>
                                        POS설치모니터사진
                                    </TableCell>
                                    <TableCell colSpan={7}>
                                        <Box sx={{ mt: 1 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px', border: '1px solid #ddd', marginBottom: '4px', borderRadius: '4px' }}>
                                                <div className="form-group" style={{ paddingLeft: '8px' }}>
                                                    <Typography 
                                                        variant="body1" 
                                                        fontWeight={300}
                                                        >
                                                        {formData.fileList?.length > 1
                                                        ? formData.fileList[1].fileNm  : ''}
                                                    </Typography>
                                                </div>
                                                <div className="button-right-align">
                                                    <Button variant="contained" color="primary" size="small" onClick={() => onFileDown(1)} disabled={downloadFlag2}>
                                                        다운로드
                                                    </Button>
                                                </div>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="td-head" style={{ width: '180px', textAlign: 'left', paddingLeft: '19px' }}>
                                        사업자등록증
                                    </TableCell>
                                    <TableCell colSpan={7}>
                                        <Box sx={{ mt: 1 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px', border: '1px solid #ddd', marginBottom: '4px', borderRadius: '4px' }}>
                                                <div className="form-group" style={{ paddingLeft: '8px' }}>
                                                    <Typography 
                                                        variant="body1" 
                                                        fontWeight={300}
                                                        >
                                                        {formData.fileList?.length > 2
                                                        ? formData.fileList[2].fileNm  : ''}
                                                    </Typography>
                                                </div>
                                                <div className="button-right-align">
                                                    <Button variant="contained" color="primary" size="small" onClick={() => onFileDown(2)} disabled={downloadFlag3}>
                                                        다운로드
                                                    </Button>
                                                </div>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                                <TableRow style={{ display: requestFlag ? 'table-row' : 'none' }}>
                                    <TableCell className="td-head" style={{ width: '180px', textAlign: 'left', paddingLeft: '19px' }}>
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
                                    <TableCell className="td-head" style={{ width: '180px', textAlign: 'left', paddingLeft: '19px' }}>
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
                                <TableRow  style={{ display: requestFlag ? 'table-row' : 'none' }}>
                                    <TableCell className="td-head" style={{ width: '180px', textAlign: 'left', paddingLeft: '19px' }} >
                                        <div style={{ display: 'block' }}>보완요청내용</div>
                                        <div style={{ display: 'block' }}>취하사유내용</div>
                                        <div style={{ display: 'block' }}>반려사유내용</div>
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
                    <h2>{`${modalInfo.prcsSttsNm} 등록`}</h2>
                    </CustomFormLabel>
                    <div className="button-right-align">
                    <Button
                        variant="contained"
                        onClick={() => updatePosDetail()}
                        color="primary"
                    >
                        {modalInfo.prcsSttsNm}
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
                        <caption>{`${modalInfo.columnName} 내용 작성 테이블`}</caption>
                        <TableHead style={{display:'none'}}>
                            <TableRow>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow>
                            <TableCell
                                className="td-head"
                                style={{ width: '120px', verticalAlign: 'middle' }}
                            >
                                <span className="required-text">*</span> {`${modalInfo.columnName}내용`}
                            </TableCell>
                            <TableCell style={{ textAlign: 'left' }}>
                                <CustomFormLabel className="input-label-none" htmlFor="splmntDmndCn">사유</CustomFormLabel>
                                <textarea className="MuiTextArea-custom"
                                    // type="text"
                                    id="splmntDmndCn"
                                    name="splmntDmndCn"
                                    // multiline
                                    rows={4}
                                    value={formData.splmntDmndCn}
                                    placeholder={`${modalInfo.columnName}내용을 입력하세요.`}
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
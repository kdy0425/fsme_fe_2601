'use client'
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog, { DialogProps } from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import React, { ReactNode, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation'
import { CustomFormLabel } from '@/utils/fsms/fsm/mui-imports';
import { sendHttpFileRequest, sendHttpRequest, sendMultipartFormDataRequest } from '@/utils/fsms/common/apiUtils';
import NoticeDetailDialog from './NoticeDetailDialog';
import {
    dateTimeFormatter,
    getDateTimeString,
    brNoFormatter,
    getCommaNumber,
  } from '@/utils/fsms/common/util'
import Image from "next/image";
import Link from "next/link";
import { styled } from '@mui/material/styles'

interface NtcnDialogProps {
    title: string;
    // children: React.ReactElement<ModalFormProps>; // ModalFormProps 타입의 ReactElement
    size?: DialogProps['maxWidth'] | 'md';
    open: boolean;
    ntcnRows: NtcnRow[];
    reloadFunc: () => void;
    handleDetailCloseModal: () => void;
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
export interface NoticeRow {
    bbsSn?: string; // 게시판일련번호
    bbscttSn?: string; // 게시글일련번호
    relateTaskSeCd?: string; // 관련업무구분코드
    leadCnCd?: string; // 머릿글내용코드    // 공지사항 코드임.
    inclLocgovCd?: string; // 포함지자체코드
    locgovNm?: string; // 포함지자체명
    userNm?: string; // 작성자명
    userInfo?: string; // 지자체명_작성자명
    oriTtl?: string; // 게시글제목
    ttl?: string; // 분류_게시글제목
    cn?: string; // 게시글내용
    popupNtcYn?: string; // 팝업공지여부
    popupBgngYmd?: string; // 팝업시작일자
    popupEndYmd?: string; // 팝업종료일자
    oriInqCnt?: number; // 실제조회수
    fileCount?: string;
    inqCnt?: number; // 조회수
    useYn?: string; // 사용여부
    ltrTrsmYn?: string; // 문자전송여부
    ltrCn?: string; // 문자내용
    ltrTtl?: string; // 문자제목
    msgSendOrder?: string; // 문자전송요청여부
    rgtrId?: string; // 등록자아이디
    regDt?: string; // 등록일시
    mdfrId?: string; // 수정자아이디
    mdfcnDt?: string; // 수정일시\
    //신규 등록시 
    fileList? : [CustomFile] | [] // 첨부파일 
    files?: [File] | [];
}

export interface NtcnRow {
    ntcnRegYmd: string;  //게시일자
    ntcnUrl: string; //이동 URL (공지사항 이외 구분 필요)
    ntcnTtl: string; //업무구분명
    ntcnCn: string; //제목
    ntcnSn: string; //알림일련번호
    delYn?: string; //삭제여부 전달용
} 

export default function NtcnDialog(props: NtcnDialogProps) {
    const { title, 
        //children
        size, open, ntcnRows, handleDetailCloseModal,reloadFunc } = props;
    const [isEditMode, setIsEditMode] = useState<boolean>(false); // 수정 모드 상태 관리
    const [rows, setRows] = useState<NtcnRow[]>(ntcnRows) // 가져온 로우 데이터
    const [selectedRow, setSelectedRow] = useState<NoticeRow>()  //선택된 Row를 담음 
    const [detailMoalFlag ,setDetailModalFlag] = useState(false);
    const [loading, setLoading] = useState(false) // 로딩여부

    const router = useRouter()
    
    const handleReload = () => {
        setSelectedRow(undefined)
        fetchData()
        reloadFunc()
    }


    // Fetch를 통해 데이터 갱신
    const fetchData = async () => {
        setLoading(true)
        try {
        // 검색 조건에 맞는 endpoint 생성
        let endpoint: string =
            `/fsm/mai/ntcn/getAllRtroact`

            const response = await sendHttpRequest('GET', endpoint, null, true, {
            cache: 'no-store',
        })
        if (response && response.resultType === 'success' && response.data) {
            // 데이터 조회 성공시
            setRows(response.data)
        } else {
            // 데이터가 없거나 실패
            setRows([])
            alert(response.message)
        }
        } catch (error) {
        // 에러시
        console.error('Error fetching data:', error)
        setRows([])
        } finally {
        setLoading(false)
        }
    }

    // Fetch를 통해 데이터 갱신
    const fetchDetailData = async (row : NtcnRow) => {
        try {
        // 검색 조건에 맞는 endpoint 생성
        // let endpoint: string = '';
        // if(row.ntcnTtl == '공지사항'){
        //     endpoint = `/fsm/sup/brd/dtl/1/` + row?.ntcnUrl // /fsm/sup/brd/dtl/1/11 공지사항 

        //     const response = await sendHttpRequest('GET', endpoint, null, true, {
        //         cache: 'no-store',
        //     })
        //     if (response && response.resultType === 'success' && response.data) {
        //         // 데이터 조회 성공시
        //         setSelectedRow(response.data)
            
        //     } else {
        //         // 데이터가 없거나 실패
        //         console.log('선택된 데이터가 없습니다. ',response)

        //     }
        // }else{
        //     router.push(row?.ntcnUrl)
        //     handleClose
        // }
        // 알림 삭제처리 이후 이동
        deleteDetailData(row, false)
        // 공지사항도 이동처리로 수정 
        router.push(row?.ntcnUrl)
        handleClose()
        } catch (error) {
        // 에러시
        console.error('Error fetching data:', error)

        } finally {
        }
    }

    const deleteDetailData = async (row : NtcnRow, chk : boolean) => {
        try {
        // 검색 조건에 맞는 endpoint 생성
        let endpoint: string = `/fsm/mai/ntcn/confirmOneRtroact`
        // +`delYn=Y`  +
        // `${row.ntcnSn ? '&ntcnSn=' + row.ntcnSn : ''}` ; 

        const jsonData = {
            delYn: 'Y',
            ntcnSn: row.ntcnSn
        }

        const response = await sendHttpRequest('POST', endpoint, jsonData, true, {
            cache: 'no-store',
        })
        if (response && response.resultType === 'success' ) {
            // 데이터 삭제 성공시
            if(chk){
                alert('선택된 데이터가 삭제되었습니다. ')
                handleReload()
            }else{
                alert('해당 페이지로 이동합니다. ')
                handleReload()
            }
            
        
        } else {
            // 데이터가 없거나 실패
            alert('알림 삭제시 오류가 발생했습니다.')
        }
  
        } catch (error) {
        // 에러시
        console.error('Error fetching data:', error)

        } finally {
        }
    }

    const deleteDetailDataAll = async () => {
        try {
            // 검색 조건에 맞는 endpoint 생성
            let endpoint: string = '/fsm/mai/ntcn/confirmAllRtroact';
            const response = await sendHttpRequest('POST', endpoint, null, true, {
                cache: 'no-store',
            })
            if (response && response.resultType === 'success') {
                // 데이터 삭제 성공시
                
                alert('선택된 데이터가 삭제되었습니다. ')
                handleReload()
            
            } else {
                // 데이터가 없거나 실패
                alert(response.message)
            }
        } catch (error) {
        // 에러시
        console.error('Error fetching data:', error)

        } finally {
        }
    }


    // 다이얼로그 닫기 핸들러
    const handleClose = () => {
        handleDetailCloseModal();
        // setIsEditMode(false); // 닫을 때 수정 모드 초기화
        // setNewFiles([]); // 다이얼로그 닫을 때 파일 초기화
    };

    const LinkStyled = styled(Link)(() => ({
        overflow: "hidden",
        display: "block",
      }));

    // 데이터 변경 핸들러
    // const handleFormDataChange = (name: string, value: string) => {
    //     setFormData((prev) => ({ ...prev, [name]: value }));
    // };
    // const handleFileChange = (files: File[]) => {
    //     setNewFiles(files); // 자식으로부터 받은 파일들 업데이트
    // };

    return (
        <React.Fragment>
        <Dialog
            fullWidth={true}
            maxWidth={size}
            open={open}
            onClose={handleClose}
        >
            <DialogContent>
            <Box className='table-bottom-button-group'>
                <CustomFormLabel className="input-label-display">
                <h2>{title}{isEditMode ? '수정' : null}</h2>
                </CustomFormLabel>
                <div className="button-right-align">
                <Button onClick={deleteDetailDataAll} color='error'>전체삭제</Button>
                <Button onClick={handleClose} variant="contained" color="dark" >취소</Button>
                </div>
            </Box>
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
                <div className="main-contents">
                    <div className="main-contents-box" >
                        {/* <h1 className="contents-box-title">
                        알림내역
                        <div className="main-title-option">
                            <button
                            className="main-info-board-more-btn"
                            onClick={() => deleteDetailDataAll()}
                            title="전체 삭제"
                            ></button>
                        </div>
                        </h1> */}
                        <div className="contents-box-con">
                        <ul className="main-info-board-list" style={{height:'320px',overflowY:'auto'}}>
                            {rows && rows.length > 0 ? (
                            rows.map((row, index) => {
                                if (row) {
                                return (
                                    <li key={index}>
                                    <div style={{display: 'flex'}}>
                                    <div
                                        className="main-info-board-inner"
                                        style={{ cursor: 'pointer', width: '85%' }}
                                        onClick={() => fetchDetailData(row)} // 수정된 부분
                                    >
                                        <span className="main-notice-link-title">
                                            {row.ntcnCn}
                                        </span>
                                        <p className="main-notice-link-date">
                                        <span className="info-month-date">
                                            {row.ntcnTtl}
                                        </span>  
                                        |
                                        <span className="info-month-date">
                                            {getDateTimeString( row.ntcnRegYmd , 'date')?.dateString}
                                        </span>
                                        </p>
                                    </div>
                                    <div style={{ cursor: 'pointer', width: '15%',
                                        textAlign: 'center', paddingTop: '1rem'
                                      }} onClick={() => deleteDetailData(row, true)} >
                                        <Image
                                            src="/images/media/icon_popup_close.png"
                                            alt="logo"
                                            height={20}
                                            width={20}
                                            
                                            priority
                                        />
                                    </div>
                                    </div>
                                    </li>
                                )
                                }
                                return null // notice가 null 또는 undefined인 경우
                            })
                            ) : (
                            <>
                                <li>
                                <div className="main-info-board-inner">
                                    <a href="#" className="main-info-link">
                                    <span className="main-notice-link-title">
                                        알림이 없습니다.{' '}
                                    </span>
                                    </a>
                                    <p className="main-notice-link-date">
                                    <span className="info-month-date"></span>
                                    </p>
                                </div>
                                </li>
                            </>
                            )}
                        </ul>
                        </div>
                    </div>
                </div>
                {/* 수정 모드 전달 */}
                {detailMoalFlag && selectedRow && (
                <NoticeDetailDialog
                    size="lg"
                    title="공지사항"
                    handleDetailCloseModal={handleDetailCloseModal}
                    selectedRow={selectedRow}
                    open={detailMoalFlag}
                />
                )}
            </Box>
            </DialogContent>
        </Dialog>
        </React.Fragment>
    );
}
import React, { useContext, useEffect, useState } from "react";
import { Button, Box } from "@mui/material";
import { CustomFormLabel } from "@/utils/fsms/fsm/mui-imports";
import { sendHttpFileRequest, sendHttpRequest, sendSingleMultipartFormDataRequest } from "@/utils/fsms/common/apiUtils";
import { getExcelFile, getToday } from "@/utils/fsms/common/comm";
import { Row } from "./FreightPage";
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { HeadCell } from 'table'
import { string } from "@amcharts/amcharts4/core";
import UserAuthContext from "@/app/components/context/UserAuthContext";
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

export interface ExcelRow {
    vhclNo?: string; // 차량번호
    dmndSeCD?: string; // 등록요청구분코드
    bfLocgovNm?: string; // 전출지자체
    bfLocgovCd?: string; // 전출지자체코드
    afLocgovNm?: string; // 전입지자체
    afLocgovCd?: string; // 전입지자체코드
    gb?: string; // 등록코드
    gbNm?: string; // 등록상태
    rsnCn?: string; // 오류사유
}

const headCells: HeadCell[] = [
    {
        id: 'vhclNo',
        numeric: false,
        disablePadding: false,
        label: '차량번호',
    },
    {
        id: 'bfLocgovNm',
        numeric: false,
        disablePadding: false,
        label: '전출관청',
    },
    {
        id: 'afLocgovNm',
        numeric: false,
        disablePadding: false,
        label: '전입관청',
    },
    {
        id: 'gbNm',
        numeric: false,
        disablePadding: false,
        label: '등록상태',
    },
    {
        id: 'rsnCn',
        numeric: false,
        disablePadding: false,
        label: '오류사유',
    },
]




interface BuTrRegisModal {
    handleClose: () => void;
    reload: () => void
}

export default function BuTrRegisModal(props: BuTrRegisModal) {
    const { handleClose,reload } = props;

    const [uploadedFileName, setUploadedFileName] = useState<string>(""); // 업로드된 파일 이름 상태
    const [selectedFile, setSelectedFile] = useState<File | null>(null); // 업로드된 파일 상태
    const [rows, setRows] = useState<ExcelRow[]>([]); // 업로드된 파일 상태
    const  [loading, setLoading] = useState<boolean>(false);
    const {authInfo} = useContext(UserAuthContext);
    const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 로딩상태
    const createExcelFileToRow =  async () => {
        if (!selectedFile) {
            alert("파일을 선택해주세요.");
            return;
        }

        if(!('locgovCd' in authInfo && authInfo.locgovCd)){
            alert('로그인 유저의 지자체 정보가 없습니다.')
            return 
        }

        try {
            setLoading(true)
            const locgovCd = 'locgovCd' in authInfo && authInfo.locgovCd;
            const endpoint = `/fsm/stn/lttm/tr/getInsertExcelLgovTrnsfrnRequst`; // 서버의 파일 업로드 엔드포인트
            const response = await sendSingleMultipartFormDataRequest(
                'POST',
                endpoint,
                {locgovCd},
                selectedFile, 
                true
            );
            
            if (response && response.resultType === 'success' && response.data) {
                setRows(response.data)
            }else {
                alert("등록에 실패했습니다. 다시 시도하세요.");
                setSelectedFile(null)
                setUploadedFileName("")
            }
            } catch (error) {
            console.error("Error uploading file:", error);
            alert("파일 업로드 중 오류가 발생했습니다.");
            setSelectedFile(null)
            setUploadedFileName("")
            }finally{
                setLoading(false)
            }
    };


    const createTrnsBatchfrnRequ = async () => {
        
        if(!confirm('지자체이관전입 일괄등록 하시겠습니까?')){
            return;
        }

        try {
            let endpoint: string = `/fsm/stn/lttm/tr/createLgovTrnsfrnRequst`;
            if(!('locgovCd' in authInfo && authInfo.locgovCd)){
                alert('로그인 유저의 지자체 정보가 없습니다.')
                return 
            }
            
            if (rows.length <= 0) {
                alert('입력될 정보가 없습니다. 엑셀 파일을 업로드 하세요');
                return;
            } else {
                // rows 배열을 기반으로 주석과 같은 구조의 데이터를 생성
                const list = rows.map((row: ExcelRow) => ({
                    vhclNo: row.vhclNo || '', // 차량번호
                    exsLocgovCd: row.bfLocgovCd || '', // 전출지자체코드
                    chgLocgovCd: row.afLocgovCd || '', // 전입지자체코드
                    gb: row.gb || '' // 등록코드
                }));
    
                // 생성한 배열을 body에 할당
                let body = {
                    list: list,
                    locgovCd :authInfo.locgovCd
                        
                };
    
                // HTTP 요청 전송
                const response = await sendHttpRequest('POST', endpoint, body, true, {
                    cache: 'no-store'
                });
    
                // 응답 처리
                if (response && response.resultType === 'success') {
                    alert(response.message);
                    reload();
                    setRows([])
                    handleCloseClick();
                }else{
                    alert(response.message )
                }
            }
        } catch (error) {
            console.error("ERROR :: ", error);
        }
    };


    const excelDownload = async () => {
        const endpoint = `/fsm/stn/lttm/tr/getExcelLgovTrnsfrnSample`;
    setLoadingBackdrop(true);
    await  getExcelFile(endpoint, `샘플파일_${getToday()}.xlsx`);
    setLoadingBackdrop(false)
    };


    useEffect(()=>{
        // 선택된 파일이 있을 경우 실행되는 명령이다.
        if (!selectedFile) {
            return;
        }
        createExcelFileToRow()
    },[selectedFile])



    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
        alert("파일을 선택해주세요.");
        return;
        }

        setUploadedFileName(file.name); // 파일 이름 업데이트
        setSelectedFile(file); // 파일 객체 저장

        // 파일 선택 초기화 (같은 파일 재선택 가능하도록)
        event.target.value = "";
    };


    const handleCloseClick = ()=>{
        setSelectedFile(null)
        setUploadedFileName("")
        setRows([])
        handleClose();
    }
    return (
        <>
        <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
            <h2>전입일괄등록</h2>
            </CustomFormLabel>
            <div className="button-right-align">
            <LoadingBackdrop open={loadingBackdrop} />
            <Button variant="contained" type="button" color="success" onClick={excelDownload}>
                샘플파일 다운로드
            </Button>
            <label htmlFor="file-upload" style={{ margin: "0 8px" }}>
                <input
                id="file-upload"
                type="file"
                accept=".xls, .xlsx"
                style={{ display: "none" }}
                onChange={handleFileChange}
                />
                <Button variant="contained" component="span" color="success">
                엑셀 업로드
                </Button>
            </label>
            <Button
                variant="contained"
                type="button"
                color="primary"
                onClick={createTrnsBatchfrnRequ}
            >
                저장
            </Button>
            <Button variant="contained" color="dark" onClick={handleClose}>취소</Button>
            </div>
            </Box>
            <Box>
                {uploadedFileName && (
                    <p>업로드된 파일: <strong>{uploadedFileName}</strong></p>
                )}
            </Box>

        <Box>
            <TableDataGrid
              headCells={headCells} // 테이블 헤더 값
              rows={rows} // 목록 데이터
              totalRows={rows.length} // 총 로우 수
              loading={loading} // 로딩여부
                paging={false}
                caption={"전입일괄등록 조회 목록"}
            />
        </Box>


        </>
    );
}

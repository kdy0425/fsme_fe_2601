/* React */
import React, { useEffect, useState, useCallback } from 'react';

/* mui component */
import { Box, Button, Dialog, DialogContent, DialogTitle, MenuItem } from '@mui/material';
import { BlankCard, CustomSelect, CustomTextField } from '@/utils/fsms/fsm/mui-imports';

/* 공통 component */
//import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import TableDataGrid from './HySubConDataGrid';
import { CommSelect } from '@/app/components/tx/commSelect/CommSelect';

/* 공통js */
import { getToday, getForamtAddDay } from '@/utils/fsms/common/dateUtils'
import { isNumber } from '@/utils/fsms/common/comm';
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils';

/* 공통 type, interface */
import { SelectItem } from 'select'
import { HeadCell, Pageable2 } from 'table'

/* 부모 컴포넌트에서 선언한 interface */
import { Row } from '../page';
import { getUserInfo } from '@/utils/fsms/utils';
import {
    rrNoFormatter
  } from '@/utils/fsms/common/util'
import {parHprHydroPaperReqDtlHC}  from '@/utils/fsms/headCells'



interface HySubConModalProps {
    open: boolean,
    onCloseClick: () => void;
    data: Row;
    reload: () => void;
}


// 목록 조회시 필요한 조건
type listSearchObj = {
    page: number
    size: number
    [key: string]: string | number // 인덱스 시그니처 추가
}

export const HySubConModal = (props:HySubConModalProps) => {

    const {  open,  onCloseClick,data, reload } = props;

    const userInfo = getUserInfo();
    const [loading, setLoading] = useState(false) // 로딩여부
    const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
    const [selectedRows, setSelectedRows] = useState<string[]>([]) // 체크 로우 데이터
    const [totalRows, setTotalRows] = useState(0) // 총 수
    const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
    

    // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
    const [params, setParams] = useState<listSearchObj>({
    page:  1, // 페이지 번호는 1부터 시작
    size:  10, // 기본 페이지 사이즈 설정
    })
    //


    // 조회하여 가져온 정보를 Table에 넘기는 객체
    const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1, 
    })

    // 페이지 번호와 페이지 사이즈를 params에 업데이트
    const handlePaginationModelChange = useCallback((page: number, pageSize: number) => {
    setParams((prev) => ({
        ...prev,
        page: page,
        size: pageSize,
    }))
    setFlag((prev) => !prev)
    },[]
    )
    
    useEffect(() => {
       if(open){
        fetchData()
       }
    },[open])

    useEffect(() => {
        fetchData()
    }, [flag])

    const handleCloseClick  = () => {
        setRows([])
        setSelectedRows([])
        onCloseClick();
    }



    // Fetch를 통해 데이터 갱신, 템플릿을 가져온다
    const fetchData = async () => {
        setLoading(true);
        setSelectedRows([]);
        try {
            // 검색 조건에 맞는 endpoint 생성
            const endpoint = `/fsm/par/hpr/tr/getHydroPaperReqDtl?page=${params.page}&size=${params.size}` +
            `${data.vhclNo ? '&vhclNo=' + data.vhclNo : ''}` +
            `${data.aplyYm ? '&aplyYm=' + data.aplyYm : ''}` +
            `${data.aplySn ? '&aplySn=' + data.aplySn : ''}` 
            const response = await sendHttpRequest('GET', endpoint, null, true, { cache: 'no-store' });
            
            if (response && response.resultType === 'success' && response.data) {
                // 데이터 조회 성공시
                setRows(response.data.content)
                setTotalRows(response.data.totalElements)
                setPageable({
                    pageNumber : response.data.pageable.pageNumber+1,
                    //pageNumber : number,
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
            setRows([])
            setTotalRows(0)
            setPageable({
                pageNumber: 1,
                pageSize: 10,
                totalPages: 1,
            })
        } finally {
            setLoading(false)
        }
    }


    // 체크박스 변경시
    const handleCheckChange = (selected:string[]) => {
        // for (let i=0; i<selectedRows.length; i++) {
        //     const row = rows[Number(selectedRows[i].replace('tr', ''))];  
        // }
        setSelectedRows(selected)
    };

    // 수소보조금 온라인 지급신청 
    const putConfirmOnline = async () => {
        let putflag = true;
        const reqList:any = [];
        for (let i=0; i<selectedRows.length; i++) {
            const row = rows[Number(selectedRows[i].replace('tr', ''))];    
            reqList.push({
                vhclNo: row.vhclNo,
                aplyYm: row.aplyYm,
                aplySeCd: 'O',
                aplySn: row.aplySn,
                elctcSn: row.elctcSn,
                giveYn : row.giveYn
            });                    
        }

        const list = reqList.filter((row: any) => row.giveYn !== 'Y')
        
        if(list.length === 0) {
            alert('최소 1개 이상의 지급확정건을 체크해주세요.');
            return;
        }

        if (putflag && confirm('수소보조금 지급확정 하시겠습니까?')) {
            const endPoint = '/fsm/par/hpr/tr/modifyHydroPapersReqst';
            const body = {
                vhclNo: data.vhclNo,
                aplyYm: data.aplyYm,
                aplySn: data.aplySn,
                aplySttsCd: 4,
                aplySeCd: 'O',
                useLitYm:list,
            };
            try {
                const method = 'PUT';
                const response = await sendHttpRequest(method, endPoint, body, true, { cache: 'no-store' });
                
                if (response && response.resultType === 'success') {                    
                    alert('수소보조금 지급확정 되었습니다');
                    setRows([])
                    setSelectedRows([])
                    onCloseClick();
                    reload();
                } else {
                    alert(response.message);
                }
            } catch (error) {
                console.log('error', 'error');
            }
        }
    };
    return (
        <Box>
            <Dialog
                fullWidth={true}
                maxWidth={'lg'}
                open={open}
            >
                <DialogContent>
                    <Box className='table-bottom-button-group' >
                        <DialogTitle id="alert-dialog-title1">
                            <span className="popup-title">
                                {'수소보조금 지급확정'}
                            </span>
                        </DialogTitle>
                        
                        <div className=" button-right-align">
                            <Button variant="contained" color="primary" onClick={(putConfirmOnline)}>저장</Button>
                            <Button variant="contained" color="dark" onClick={(handleCloseClick)}>닫기</Button>
                        </div>
                    </Box>

                    {/* 테이블영역 시작 */}

                    <Box sx={{mb:5}}>
                        <div className="table-scrollable" >
                            <table className="table table-bordered">
                                <caption>사업자 정보 테이블 요약</caption>
                                <colgroup>
                                    <col style={{ width: '16%' }}></col>
                                    <col style={{ width: '17%' }}></col>
                                    <col style={{ width: '16%' }}></col>
                                    <col style={{ width: '17%' }}></col>
                                    <col style={{ width: '16%' }}></col>
                                    <col style={{ width: '17%' }}></col>
                                </colgroup>
                                <tbody>
                                    <tr>
                                        <th className="td-head" scope="row">
                                            소유자명
                                        </th>
                                        <td>
                                            {data.corpNm}
                                        </td>
                                        <th className="td-head" scope="row">
                                            법인등록번호
                                        </th>
                                        <td>
                                            {rrNoFormatter(data.crnoS??'')}
                                        </td>
                                        <th className="td-head" scope="row"></th>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <th className="td-head" scope="row">
                                            차량번호
                                        </th>
                                        <td>
                                            {data.vhclNo}                                  
                                        </td>
                                        <th className="td-head" scope="row">
                                            유종                                        
                                        </th>
                                        <td>
                                            {data.koiNm} 
                                        </td>
                                        <th className="td-head" scope="row">
                                        톤수
                                        </th>
                                        <td>
                                            {data.vhclTonNm} 
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </Box>
                    {/* 테이블영역 시작 */}
                    <Box>
                        <TableDataGrid
                            headCells={parHprHydroPaperReqDtlHC} // 테이블 헤더 값
                            rows={rows} // 목록 데이터
                            totalRows={totalRows} // 총 로우 수
                            loading={loading} // 로딩여부
                            onPaginationModelChange={handlePaginationModelChange}
                            pageable={pageable} // 현재 페이지 / 사이즈 정보
                            paging={true}
                            cursor={true}
                            onCheckChange={handleCheckChange}
                            caption={"수소 보조금 지급 내역 목록 조회"}
                        />
                    </Box>
                </DialogContent>
            </Dialog>
        </Box>
    );
}

export default HySubConModal;
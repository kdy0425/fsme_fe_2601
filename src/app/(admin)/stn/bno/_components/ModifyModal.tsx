import { BlankCard, CustomFormLabel, CustomRadio, CustomSelect, CustomTextField } from '@/utils/fsms/fsm/mui-imports';
import { Box, Button, Dialog, DialogContent, FormControlLabel, MenuItem, RadioGroup, Table, TableBody, TableCell, TableContainer, TableRow } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation'

import PageContainer from '@/components/container/PageContainer'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils';

import { listParamObj } from '@/types/fsms/fsm/listParamObj'
import { HeadCell, Pageable, Pageable2  } from 'table'
import { getFormatTomorrow} from '@/utils/fsms/common/comm'
import { SelectItem } from 'select'
import { set } from 'lodash';
import UserAuthContext, { UserAuthInfo } from '@/app/components/context/UserAuthContext';
import { Row } from '../page';
import { getDateFormatYMD } from '@/utils/fsms/common/dateUtils';
import { stnbnoModifyModalHeadCells } from '@/utils/fsms/headCells';



export interface RegData  {
        index?: number,
        ancmntOilprcAmt?: string,
        aplcnBgngYmd?: string,
        koiNm?: string,
        koiCd?: string,
        rgnCd?: string,
        rgnNm?: string,
        transSts?: string,
}

// 목록 조회시 필요한 조건
type listSearchObj = {
    sort: string
    page: number
    size: number
    [key: string]: string | number // 인덱스 시그니처 추가
}


interface RegisterModal {
    title: string;
    open: boolean;
    rows: Row[];
    onCloseClick: () => void;
    reload: () => void;
}

export const ModifyModal = (props: RegisterModal) => {
    const router = useRouter() // 화면이동을 위한객체
    const querys = useSearchParams() // 쿼리스트링을 가져옴

    const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정


    const [rows,setRows] = useState<RegData[]>([]) // 가져온 로우 데이터

    const [selectedRow, setSelectedRow] = useState<RegData>() // 선택된 행 

    const {authInfo} = useContext(UserAuthContext);
    const [authContext, setAuthContext] = useState<UserAuthInfo | {} >();

    const [totalRows, setTotalRows] = useState(0) // 총 수
    const [loading, setLoading] = useState(false) // 로딩여부


    //초기 데이터 세팅 
    const [data, setData] = useState<RegData>({
        index : -1,
        rgnCd : '',
        rgnNm : '',
        koiCd : '',
        koiNm : '',
        aplcnBgngYmd : '',
        ancmntOilprcAmt : '',
        transSts: '',
    })


    // 
    const handleDataChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
    const { name, value } = event.target


    if (name === 'ancmntOilprcAmt') {
        if (/[^0-9.]/.test(value)) {
        // 숫자 또는 소수점 이외의 값이 포함된 경우 경고창 표시
        alert('숫자와 소수점만 입력 가능합니다.');
        }
    
        // 정규식을 사용하여 숫자와 소수점만 필터링
        let numericValue = value.replace(/[^0-9.]/g, '');
    
        // 소수점이 여러 개 입력되는 경우 첫 번째만 유지
        const parts = numericValue.split('.');
        if (parts.length > 2) {
        numericValue = parts[0] + '.' + parts[1];
        }
    
        setData((prev) => ({ ...prev, [name]: numericValue }));
    } else {
        // 숫자 외 입력 필터링이 필요 없는 경우
        setData((prev) => ({ ...prev, [name]: value }));
    }

    }

    


    const {title, open , onCloseClick, reload} = props;

    //
    const [pageable, setPageable] = useState<Pageable2>({
        pageNumber: 1, // 페이지 번호는 1부터 시작
        pageSize: 10, // 기본 페이지 사이즈 설정
        totalPages: 1,
    })



    
    useEffect(()=>{
        setAuthContext(authInfo)
    },[authInfo])


    useEffect(() => {
        // rows 배열을 RegData 형식으로 바인딩하여 새로운 배열을 생성
        const updatedRows: RegData[] = props.rows.map((row) => ({
            ancmntOilprcAmt: row.ancmntOilprcAmt,
            aplcnBgngYmd: row.aplcnBgngYmd,
            koiNm: row.koiNm,
            koiCd: row.koiCd,
            rgnCd: row.rgnCd,
            rgnNm: row.rgnNm,
            transSts: row.transSts,
        }));
    
        // 필요한 경우 상태 설정 혹은 데이터 처리
        setRows(updatedRows)
    }, [props.rows]);



    //저장 버튼이 클릭되고 모든 정보를 일괄등록 해야한다. 
    const handleClickStore = async () => {

        alert('저장 버튼이 클릭되었습니다.')
        await saveData()
        setTotalRows(0);
        handleClickClose();
        onCloseClick();
        reload();
    };


    const handleRowClick = (row: RegData, index?: number) => {
        setSelectedRow({ ...row, index }); // 인덱스를 추가하여 선택된 행 데이터 설정
        setData({ ...row, index });
    };
    
    const handleClickClose = () => {
        setData({
            index : -1,
            rgnCd : '',
            rgnNm : '',
            koiCd : '',
            koiNm : '',
            aplcnBgngYmd : '',
            ancmntOilprcAmt : '',
            transSts: '',
        })
        onCloseClick();
    }
    


    // 선택된 행만 수정 (등록)
    const handleRegister = () => {

        // if((!data.aplcnBgngYmd || data.aplcnBgngYmd === '')){
        //     alert('고시기준일 입력은 필수입니다.')
        //     return 
        // }
        if (selectedRow && selectedRow.index !== undefined) {
            const updatedRows = rows.map((row, idx) => 
                idx === selectedRow.index ? { ...row, ...data } : row
            );
            setRows(updatedRows);
            alert('선택된 행이 등록되었습니다.');

            //선택된 내용을 초기화
            setData({
                index : -1,
                rgnCd : '',
                rgnNm : '',
                koiCd : '',
                koiNm : '',
                aplcnBgngYmd : '',
                ancmntOilprcAmt : '',
                transSts: '',
            })
        } else {
            alert('선택된 행이 없습니다.');
        }
    };






    const saveData = async () => {
        if (!confirm('지역별 고시유가를 등록하시겠습니까?')) return;
        let endpoint: string = `/fsm/stn/bno/cm/updateByegNtfcOilprc`;
    
        if (!(authContext && 'lgnId' in authContext && authContext.lgnId)) {
            alert('로그인 정보가 없습니다. 다시 시도하세요');
            return;
        }
        
        // index 필드를 제외하고 aplcnBgngYmd에서 '-'를 제거한 reqList 생성
        let reqList = rows.map(({ index, aplcnBgngYmd, ...rest }) => ({
            ...rest,
            aplcnBgngYmd: aplcnBgngYmd ? aplcnBgngYmd.replace(/-/g, '') : undefined,
        }));
    
        let body = {
            mdfrId: authContext.lgnId,
            reqList: reqList
        };
    
        try {
            const response = await sendHttpRequest('PUT', endpoint, body, true, {
                cache: 'no-store',
            });
            if (response && response.resultType === 'success') {
                alert(response.message);

            } else {
                alert(response.message);
            }
        } catch (error) {
            alert(error);
        }finally{
            setRows([])
        }
    };

return (
        <Box>
        <Dialog
            fullWidth={true}
            maxWidth={'lg'}
            open={open}
            //onClose={onCloseClick}
        >
        <DialogContent>
            <Box className='table-bottom-button-group'>
                <CustomFormLabel className="input-label-display">
                
                <h2>
                    {title}
                </h2>
                </CustomFormLabel>
                <div className=" button-right-align">
                    <Button variant="contained" color="primary" onClick={(handleClickStore)}>저장</Button>
                    <Button variant="contained" color="dark" onClick={(onCloseClick)}>취소</Button>
                </div>
            </Box>
            {/* 테이블영역 시작 */}
            <Box style={{ maxHeight: '60vh', overflow: 'auto' }}>
            <TableDataGrid
                headCells={stnbnoModifyModalHeadCells} // 테이블 헤더 값
                rows={rows} // 목록 데이터
                totalRows={totalRows} // 총 로우 수
                loading={loading} // 로딩여부
                onRowClick={handleRowClick} // 행 클릭 핸들러 추가
                onPaginationModelChange={() => {}} // 페이지 , 사이즈 변경 핸들러 추가
                pageable={pageable} // 현재 페이지 / 사이즈 정보
                paging={false}
                cursor={true}
            />
            </Box>
            {/* 테이블영역 시작 */}
            <BlankCard className="contents-card" title="수정정보">

            <Box className='table-bottom-button-group' sx={{ mb: 2 }}>                
                <div className=" button-right-align">
                    <Button variant="contained" color="primary" onClick={(handleRegister)}>등록</Button>
                </div>
            </Box>

            <div className="table-scrollable">
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
                        고시기준일
                        </th>
                        <td>
                        <div className="form-group" style={{ width: '100%' }}>
                            {data.aplcnBgngYmd ? getDateFormatYMD(data.aplcnBgngYmd ) : ''}
                        </div>
                        </td>

                        <th className="td-head" scope="row">
                            고시단가(원)
                        </th>
                        <td>
                        <div className="form-group" style={{ width: '100%' }}>
                            <CustomTextField
                                type="text"
                                name="ancmntOilprcAmt"
                                value={data.ancmntOilprcAmt ?? ''}
                                onChange={handleDataChange}
                                fullWidth
                            />
                        </div>
                        </td>
                        <th className="td-head" scope="row">
                            {/*  */}
                        </th>
                        <td>
                        <div className="form-group" style={{ width: '100%' }}>
                            {/* 

                            /> */}
                        </div>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
            </BlankCard>

            {/* 테이블영역 끝 */}
        </DialogContent>
        </Dialog>
    </Box>
    );
}

export default ModifyModal;
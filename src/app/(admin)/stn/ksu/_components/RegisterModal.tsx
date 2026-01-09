import { BlankCard, CustomFormLabel, CustomRadio, CustomSelect, CustomTextField } from '@/utils/fsms/fsm/mui-imports';
import { Box, Button, Dialog, DialogContent, FormControlLabel, MenuItem, RadioGroup, Table, TableBody, TableCell, TableContainer, TableRow } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation'

import PageContainer from '@/components/container/PageContainer'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils';

import { listParamObj } from '@/types/fsms/fsm/listParamObj'
import { HeadCell, Pageable, Pageable2  } from 'table'
import { getFormatTomorrow, getToday} from '@/utils/fsms/common/comm'
import { SelectItem } from 'select'
import { set } from 'lodash';
import UserAuthContext, { UserAuthInfo } from '@/app/components/context/UserAuthContext';
import { Row } from '../page';
import { formatDate } from '@/utils/fsms/common/convert';
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import { stnksuRegisheadCells } from '@/utils/fsms/headCells';


export interface RegData  {
        index?: number,
        lcnsTpbizCd?: string,
        lcnsTpbizNm?: string,
        koiCd?: string,
        koiNm?: string,
        aplcnYmd?: string,
        oilUntprc?: string,
}

interface RegisterModal {
    title: string;
    open: boolean
    type:'new'|'update'
    pRows:Row[],
    onCloseClick: () => void;
    reload: () => void;
}

export const RegisterModal = (props: RegisterModal) => {

    const { title, open, type, pRows, onCloseClick, reload } = props;

    const router = useRouter() // 화면이동을 위한객체
    const querys = useSearchParams() // 쿼리스트링을 가져옴
    
    const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
    const [rows,setRows] = useState<RegData[]>([]) // 가져온 로우 데이터

    const [selectedRow, setSelectedRow] = useState<RegData>() // 선택된 행 

    const [selectedRows, setSelectedRows] = useState<string[]>([]) // 체크 로우 데이터

    const {authInfo} = useContext(UserAuthContext);
    const [authContext, setAuthContext] = useState<UserAuthInfo | {} >();

    const [totalRows, setTotalRows] = useState(0) // 총 수
    const [loading, setLoading] = useState(false) // 로딩여부

    const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 로딩상태

    //초기 데이터 세팅 
    const [data, setData] = useState<RegData>({
        index : -1,
        lcnsTpbizCd : '',
        lcnsTpbizNm : '',
        koiCd : '',
        koiNm : '',
        aplcnYmd : '',
        oilUntprc : '',
    })


    const handleDataChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
    const { name, value } = event.target;
    // 숫자와 소수점만 허용
    if (name === 'oilUntprc') {

        if (value === '.') {
            return;
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
    };


        useEffect(() => {
            if(open) {
                settingRows();
                setSelectedRows([]);
                setData({
                    index : -1,
                    lcnsTpbizCd : '',
                    lcnsTpbizNm : '',
                    koiCd : '',
                    koiNm : '',
                    aplcnYmd : '',
                    oilUntprc : '',
                });            
            }
        }, [open]);
    

    
    useEffect(()=>{
        setAuthContext(authInfo)
    },[authInfo])




    const settingRows = () => {

        // 신규일경우 등록템플릿을 통해 등록가능
        if(type == 'new') {
            fetchData();
        } else {
            
            const result:Row[] = [];
            
            pRows.map((item) => {
                
                const crtrAplcnYmd = item.aplcnYmd?.replaceAll('-', '');

                // 고시기준일이 금일보다 크고, 미적용일경우에만 수정가능
                if(Number(crtrAplcnYmd) > Number(getToday()) ) {
                    result.push({...item});
                }
            });

            if(result.length == 0) {
                alert('수정가능한 데이터가 존재하지 않습니다\n** 조건 - 고시기준일 : 금일 이후');
                onCloseClick();
            } else {
                setRows(result);
            }            
        }
    };
    

    // Fetch를 통해 데이터 갱신, 템플릿을 가져온다
    const fetchData = async () => {
        setLoading(true)
        try {
        // 검색 조건에 맞는 endpoint 생성
        let endpoint: string =
            `/fsm/stn/ksu/cm/getKoiSbsidyUntpcTemplete`
        const response = await sendHttpRequest('GET', endpoint, null, true, {
            cache: 'no-store',
        })
        if (response && response.resultType === 'success' && response.data) {

            // 데이터 조회 성공시
            setRows(response.data)
            setTotalRows(response.data.length)
            // reload();
        } else {
        // 데이터가 없거나 실패
        setRows([])
        setTotalRows(0)
        }
        } catch (error) {
        // 에러시
        setRows([])
        setTotalRows(0)
        } finally {
        setLoading(false)
        }
    }

    
    const handleCheckChange = (selected:string[]) => {
        setSelectedRows(selected)
    }


    const handleRowClick = (row: RegData, index?: number) => {
        setSelectedRow({ ...row, index }); // 인덱스를 추가하여 선택된 행 데이터 설정
        setData({ ...row, index });
    };
    


    const handleClickClose = () => {
        setData({
            index : -1,
            lcnsTpbizCd : '',
            lcnsTpbizNm : '',
            koiCd : '',
            koiNm : '',
            aplcnYmd : '',
            oilUntprc : '',
        })
        onCloseClick();
    }



    // 체크박스에 선택된 행들만 일괄적으로 등록
    const handleAllRegister = () => {
        if ((!data.aplcnYmd || data.aplcnYmd === '') && type == 'new') {
            alert('고시기준일 입력은 필수입니다.');
            return;
        }


        if (selectedRows.length === 0) {
            alert('선택된 항목이 없습니다.');
            return;
        }

        // // 선택된 행들만 업데이트
        const updatedRows = rows.map((row, index) => {
            const rowIndex = `tr${index}`; // 생성된 row ID
            if (selectedRows.includes(rowIndex)) {
                return {
                    ...row,
                    aplcnYmd: type == 'new' ? data.aplcnYmd?.replaceAll('-','') : row.aplcnYmd, // 날짜 업데이트
                    oilUntprc: data.oilUntprc, // 가격 업데이트
                };
            }
            return row; // 선택되지 않은 행은 그대로 유지
        });
        setRows(updatedRows);
        // 선택된 내용을 초기화
        setData({
            index: -1,
            lcnsTpbizCd: '',
            lcnsTpbizNm: '',
            koiCd: '',
            koiNm: '',
            aplcnYmd: '',
            oilUntprc: '',
        });

        setSelectedRows([]);
    };


        const regValidation = (valiData:Row) => {
            
            if (type == 'new' && valiData.aplcnYmd == '') {
                alert('고시기준일은 필수입력입니다.');
            } else if (!valiData.oilUntprc) {
                alert('단가는 입력은 필수입니다.');
            } else {
                return true;
            }
    
            return false;
        };



    // 모든행을 저장한다. 
    const saveData = async () => {

        if(selectedRows.length === 0) {
            alert('선택된 항목이 없습니다.');
            return;
        }

        let flag = true;
        let reqList: any[] = [];
        
        for (let i=0; i<selectedRows.length; i++) {

            const row = rows[Number(selectedRows[i].replace('tr', ''))]


            if(!regValidation(row)) {
                flag = false;
                break;
            }

            reqList.push({
                lcnsTpbizCd: row.lcnsTpbizCd,
                koiCd: row.koiCd,
                aplcnYmd: row.aplcnYmd ? row.aplcnYmd.replace(/-/g, '') : '',
                oilUntprc : row.oilUntprc
            })
        }

        const msg = type == 'new' ? '등록' : '수정';

        if (flag && confirm('유종별 보조금단가를 ' + msg + '하시겠습니까?')) {
        

        const endpoint = type == 'new' ? '/fsm/stn/ksu/cm/createKoiSbsidyUntpc' 
        : '/fsm/stn/ksu/cm/updateKoiSbsidyUntpc';


    
        if (!(authContext && 'lgnId' in authContext && authContext.lgnId)) {
            alert('로그인 정보가 없습니다. 다시 시도하세요');
            return;
        }
            let body = {
                rgtrId: authContext.lgnId,
                mdfrId: authContext.lgnId,
                reqList: reqList
            };

            try {
                setLoadingBackdrop(true);
                const method = type == 'new' ? 'POST' : 'PUT';

                const response = await sendHttpRequest(method, endpoint, body, true, {
                    cache: 'no-store',
                });
                if (response && response.resultType === 'success') {
                    alert(msg + ' 되었습니다');
                    onCloseClick();
                    reload();
                } else {
                    alert(response.message);
                    onCloseClick();
                    reload();
                }
            } catch (error) {
                console.error('Error modifying data:', error)
            }finally{
                setLoadingBackdrop(false);
                setLoading(false);
            }
        
    };
}

return (
        <Box>
        <Dialog
            fullWidth={true}
            maxWidth={'lg'}
            open={open}
        >
        <DialogContent>

            <Box className='table-bottom-button-group'>
                <CustomFormLabel className="input-label-display">
                <h2>
                    {title}
                </h2>
                </CustomFormLabel>

                
                <div className=" button-right-align">
                    <Button variant="contained" color="primary" onClick={(saveData)}>저장</Button>
                    <Button variant="contained" color="dark" onClick={(onCloseClick)}>취소</Button>
                </div>
            </Box>
            
            {/* 테이블영역 시작 */}
            <Box style={{ maxHeight: '60vh', overflow: 'auto' }}>
            <TableDataGrid
                headCells={stnksuRegisheadCells} // 테이블 헤더 값
                rows={rows} // 목록 데이터
                totalRows={totalRows} // 총 로우 수
                loading={loading} // 로딩여부
                onRowClick={handleRowClick} // 행 클릭 핸들러 추가
                onPaginationModelChange={() => {}} // 페이지 , 사이즈 변경 핸들러 추가
                paging={false}
                cursor={true}
                onCheckChange={handleCheckChange}
                caption={"상세 목록 조회"}
            />
            </Box>

            {/* 테이블영역 시작 */}
            <BlankCard className="contents-card" title="등록정보">

            <Box className='table-bottom-button-group' sx={{ mb: 2 }}>                
                <div className=" button-right-align">
                    {/* <Button variant="contained" color="primary" onClick={(handleRegister)}>등록</Button> */}
                    <Button variant="contained" color="primary" onClick={(handleAllRegister)}>일괄등록</Button>
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
                    </colgroup>
                    <tbody>                    
                        {type === 'new' ? (                            
                            <tr>
                                <th className="td-head" scope="row">
                                    고시기준일
                                </th>
                                <td>
                                    <div className="form-group" style={{ width: '100%' }}>
                                        <CustomFormLabel className="input-label-none" htmlFor="ft-date-start">고시기준일</CustomFormLabel>                                
                                        <CustomTextField
                                            type="date"
                                            id="ft-date-start"
                                            name="aplcnYmd"
                                            value={data.aplcnYmd ?? ''}
                                            inputProps={{
                                                min: getFormatTomorrow(),
                                            }}
                                            onChange={handleDataChange}
                                            fullWidth
                                        />
                                    </div>
                                </td>

                                <th className="td-head" scope="row">
                                    단가(원)
                                </th>
                                <td>
                                    <div className="form-group" style={{ width: '100%',  verticalAlign: 'middle' }} >
                                        <CustomFormLabel className="input-label-none" htmlFor="ft-oilUntprc">단가(원)</CustomFormLabel>
                                        <CustomTextField
                                            type="text"
                                            id="ft-oilUntprc"
                                            name="oilUntprc"
                                            value={data.oilUntprc ?? ''}
                                            onChange={handleDataChange}
                                            fullWidth
                                            inputProps={{
                                                maxLength:'10'
                                            }}
                                        />
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            <tr>
                                <th className="td-head" scope="row">
                                    단가(원)
                                </th>
                                <td>
                                    <div className="form-group" style={{ width: '100%',  verticalAlign: 'middle' }} >
                                        <CustomFormLabel className="input-label-none" htmlFor="ft-oilUntprc">단가(원)</CustomFormLabel>
                                        <CustomTextField
                                            type="text"
                                            id="ft-oilUntprc"
                                            name="oilUntprc"
                                            value={data.oilUntprc ?? ''}
                                            onChange={handleDataChange}
                                            fullWidth
                                            inputProps={{
                                                maxLength:'10'
                                            }}
                                        />
                                    </div>
                                </td>
                            </tr>
                        )}                        
                    </tbody>
                </table>
            </div>
            </BlankCard>

            {/* 로딩 */}
            <LoadingBackdrop open={loadingBackdrop} />
        </DialogContent>
        </Dialog>
    </Box>
    );
}

export default RegisterModal;
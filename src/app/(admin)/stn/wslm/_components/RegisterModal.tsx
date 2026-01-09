/* React */
import React, { useEffect, useState, useCallback } from 'react';

/* mui component */
import { Box, Button, Dialog, DialogContent, MenuItem } from '@mui/material';
import { BlankCard, CustomFormLabel, CustomSelect, CustomTextField } from '@/utils/fsms/fsm/mui-imports';

/* 공통 component */
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { CommSelect } from '@/app/components/tx/commSelect/CommSelect';
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

/* 공통js */
import { getToday, getForamtAddDay } from '@/utils/fsms/common/dateUtils'
import { isNumber } from '@/utils/fsms/common/comm';
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils';

/* 공통 type, interface */
import { SelectItem } from 'select'
import { HeadCell } from 'table'

/* 부모 컴포넌트에서 선언한 interface */
import { Row } from '../page';
import { getUserInfo } from '@/utils/fsms/utils';

const headCells: HeadCell[] = [
    
    {
        id: 'check',
        numeric: false,
        disablePadding: false,
        label: '',
        format: 'checkbox',
    },
    {
        id: 'vhclTonNm',
        numeric: false,
        disablePadding: false,
        label: '톤수',
    },
    {
        id: 'koiNm',
        numeric: false,
        disablePadding: false,
        label: '유종',
    },
    {
        id: 'crtrAplcnYmd',
        numeric: false,
        disablePadding: false,
        label: '고시기준일',
        format: 'yyyymmdd'
    },
    {
        id: 'crtrYear',
        numeric: false,
        disablePadding: false,
        label: '기준년도',
    },
    {
        id: 'avgUseLiter',
        numeric: false,
        disablePadding: false,
        label: '월지급기준량(ℓ)',
        format: 'lit',
        align : 'td-right'
    },
    {
        id: 'limUseRt',
        numeric: false,
        disablePadding: false,
        label: '한도비율(%)',
        align : 'td-right'
    },
    {
        id: 'crtrLimLiter',
        numeric: false,
        disablePadding: false,
        label: '한도리터(ℓ)',
        format: 'lit',
        align : 'td-right'
    },
]

interface RegisterModal {
    title: string,
    open: boolean,
    type:'new'|'update'
    pRows:Row[],
    onCloseClick: () => void;
    reload: () => void;
}

interface RegData  {    
    crtrAplcnYmd:string, //고시기준일
    crtrYear:string, //기준년도
    limUseRt:string, //한도비율
    crtrLimLiter:string, //한도리터
    avgUseLiter:string, //월지급량기준량
    aplcnYn:'N'|'Y', // 적용여부
}

export const RegisterModal = (props:RegisterModal) => {

    const { title, open, type, pRows, onCloseClick, reload } = props;

    const userInfo = getUserInfo();
    const [yearList, setYearList] = useState<SelectItem[]>([]); // 기준년도 selectbox
    const [loading, setLoading] = useState(false) // 로딩여부
    const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
    const [selectedRows, setSelectedRows] = useState<string[]>([]) // 체크 로우 데이터
    const [data, setData] = useState<RegData>({ crtrAplcnYmd: '', crtrYear: '', limUseRt: '', crtrLimLiter: '', avgUseLiter: '', aplcnYn: 'N' })
    const [headerCell, setHeaderCell] = useState<HeadCell[]>([]);
    const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 저장시 로딩상태

    useEffect(() => {
        if(open) {
            settingRows();
            settingHeaderCell();
            generateYearOptions();
            setSelectedRows([]);
            setData({
                crtrAplcnYmd: '',
                crtrYear: new Date().getFullYear().toString(),
                limUseRt: '',
                crtrLimLiter: '',
                avgUseLiter: '',
                aplcnYn: 'N',
            });            
        }
    }, [open]);

    // 의존성 배열 걸어서 한도리터 변경 
    useEffect(() => {
        
        if (data.limUseRt && data.avgUseLiter) {

            const limUseRtNumber = parseFloat(data.limUseRt); // 문자열을 숫자로 변환
            const avgUseLiterNumber = parseFloat(data.avgUseLiter); // 문자열을 숫자로 변환
            
            // 계산: 한도 비율(%)과 월 지급 기준량을 곱한 값을 리터로 계산
            const calculatedValue = (limUseRtNumber / 100) * avgUseLiterNumber;
    
            // 계산 결과를 crtrLimLiter에 반영
            setData((prev) => ({
                ...prev,
                crtrLimLiter: calculatedValue.toFixed(0), // 소수점 둘째 자리까지 유지
            }));

        } else {
            // limUseRt나 avgUseLiter 값이 없을 경우 초기화
            setData((prev) => ({
                ...prev,
                crtrLimLiter: '',
            }));
        }
    }, [data.avgUseLiter, data.limUseRt]);

    // 현재 연도를 기준으로 ±5년 목록 생성 함수
    const generateYearOptions = () => {

        const currentYear = new Date().getFullYear(); // 현재 연도
        const startYear = currentYear - 5; // 시작 연도
        const endYear = currentYear + 5; // 종료 연도

        // 연도 배열 생성
        const yearOptions:SelectItem[] = [];

        for (let year=startYear; year<=endYear; year++) {
            yearOptions.push({ value:year.toString(), label:year.toString() });
        }

        setYearList(yearOptions);
    };

    const settingRows = () => {

        // 신규일경우 등록템플릿을 통해 등록가능
        if(type == 'new') {
            fetchData();
        } else {
            
            const result:Row[] = [];
            
            pRows.map((item) => {
                
                const crtrAplcnYmd = item.crtrAplcnYmd.replaceAll('-', '');

                // 고시기준일이 금일보다 크고, 미적용일경우에만 수정가능
                if(Number(crtrAplcnYmd) > Number(getToday()) && item.aplcnYn == 'N') {
                    result.push({...item});
                }
            });

            if(result.length == 0) {
                alert('수정가능한 데이터가 존재하지 않습니다\n** 조건 - 고시기준일 : 금일 이후, 적용여부 : 미적용');
                onCloseClick();
            } else {
                setRows(result);
            }            
        }
    };

    const settingHeaderCell = () => {
        
        const result:HeadCell[] = headCells.slice();

        if(type == 'update') {
            result.push({
                id: 'aplcnNm',
                numeric: false,
                disablePadding: false,
                label: '적용여부',
            })
        }
        
        setHeaderCell(result);
    }

    // Fetch를 통해 데이터 갱신, 템플릿을 가져온다
    const fetchData = async () => {
        
        setLoading(true);
        setSelectedRows([]);
        
        try {
        
            // 검색 조건에 맞는 endpoint 생성
            const endpoint = '/fsm/stn/wslm/cm/getWntyStdLmtMngTemplete';
            const response = await sendHttpRequest('GET', endpoint, null, true, { cache: 'no-store' });

            if (response && response.resultType === 'success' && response.data) {
                // 데이터 조회 성공시
                setRows(response.data)
            } else {
                // 데이터가 없거나 실패
                setRows([])
            }
        } catch (error) {
            // 에러시            
            setRows([])
        } finally {
            setLoading(false)
        }
    }

    // 체크박스 변경시
    const handleCheckChange = useCallback((selected:string[]) => {
        setSelectedRows(selected)
    }, []);
    
    // 데이터 변경과 데이터 검증을 담당하는 메서드 
    const handleDataChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        
        const { name, value } = event.target;
    
        // 정수만 허용
        if (name === 'avgUseLiter' || name === 'limUseRt') {
            if (isNumber(value)) {
                setData((prev) => ({ ...prev, [name]:Number(value) }));
            }
        } else {
            // 숫자 외 입력 필터링이 필요 없는 경우
            setData((prev) => ({ ...prev, [name]:value }));
        }
    };

    // 체크박스에 선택된 행들만 일괄적으로 등록
    const handleAllRegister = () => {

        if(selectedRows.length === 0) {
            alert('선택된 항목이 없습니다.');
            return;
        }

        const result:Row[] = [];

        rows.map((item:Row, index:number) => {
            
            const rowIndex = `tr${index}`; // 생성된 row ID
            
            if (selectedRows.includes(rowIndex)) {
                
                const crtrAplcnYmd = type == 'new' ? data.crtrAplcnYmd : item.crtrAplcnYmd;

                result.push({
                    ...item,
                    crtrAplcnYmd: crtrAplcnYmd.replaceAll('-', ''), // 고시기준일 
                    crtrYear: data.crtrYear, // 고시기준년도                         
                    avgUseLiter: Number(data.avgUseLiter), // 월지급기준량
                    limUseRt: Number(data.limUseRt), // 한도비율
                    crtrLimLiter: Number(data.crtrLimLiter), // 한도 리터
                    aplcnYn: data.aplcnYn, // 적용여부
                    aplcnNm: data.aplcnYn == 'N' ? '미적용' : '적용',
                });
                
            } else {
                result.push({
                    ...item,
                    crtrAplcnYmd: item.crtrAplcnYmd.replaceAll('-', ''), // 고시기준일 
                });
            }
        });

        setRows(result);

        // 선택된 내용을 초기화
        setData({
            crtrAplcnYmd: '',
            crtrYear: new Date().getFullYear().toString(),
            limUseRt: '',
            crtrLimLiter: '',
            avgUseLiter: '',
            aplcnYn: 'N',
        });

        setSelectedRows([]);
    };

    const regValidation = (valiData:Row) => {
        
        if (type == 'new' && valiData.crtrAplcnYmd == '') {
            alert('고시기준일은 필수입력입니다.');
        } else if (!valiData.crtrYear) {
            alert('기준년도는 입력은 필수입니다.');
        } else if (!valiData.avgUseLiter) {
            alert('월지급량기준량은 입력은 필수입니다.');
        } else if (!valiData.crtrLimLiter) {
            alert('한도리터는 입력은 필수입니다.');
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
        const reqList:any = [];

        for (let i=0; i<selectedRows.length; i++) {
            
            const row = rows[Number(selectedRows[i].replace('tr', ''))];

            if(!regValidation(row)) {
                flag = false;
                break;
            }
            
            reqList.push({
                koiCd: row.koiCd,
                vhclTonCd: row.vhclTonCd,
                crtrAplcnYmd: row.crtrAplcnYmd.replaceAll('-', ''),
                crtrYear: row.crtrYear,
                limUseRt : row.limUseRt,
                crtrLimLiter: parseFloat(row.crtrLimLiter.toString()),
                avgUseLiter : row.avgUseLiter,
                aplcnYn: row.aplcnYn, // 적용여부(수정시에만 해당)
            });                    
        }

        const msg = type == 'new' ? '등록' : '수정';

        if (flag && confirm('전국표준한도를 ' + msg + '하시겠습니까?')) {

            const endPoint = type == 'new' ? '/fsm/stn/wslm/cm/createWntyStdLmtMng' : '/fsm/stn/wslm/cm/updateWntyStdLmtMng';
            const body = {
                reqList:reqList,
                rgtrId:userInfo.lgnId,
                mdfrId:userInfo.lgnId,
            };

            try {
                
                setLoadingBackdrop(true);
                const method = type == 'new' ? 'POST' : 'PUT';
                const response = await sendHttpRequest(method, endPoint, body, true, { cache: 'no-store' });
                
                if (response && response.resultType === 'success') {                    
                    alert(msg + ' 되었습니다');
                    onCloseClick();
                    reload();
                } else {
                    alert(response.message);
                    reload();
                }
            } catch (error) {
                console.error('Error modifying data:', error);
            } finally {
                setLoadingBackdrop(false);
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
                    <Box className='table-bottom-button-group'>
                        <CustomFormLabel className="input-label-display">
                            <h2 className="popup-title">
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
                            headCells={headerCell} // 테이블 헤더 값
                            rows={rows} // 목록 데이터
                            loading={loading} // 로딩여부
                            onCheckChange={handleCheckChange}
                            caption={"상세 목록 조회"}
                        />
                    </Box>

                    {/* 테이블영역 시작 */}
                    <BlankCard className="contents-card" title="등록정보">

                        <Box className='table-bottom-button-group' sx={{ mb: 2 }}>
                            <div className=" button-right-align">
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={(handleAllRegister)}
                                >
                                    일괄등록
                                </Button>
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
                                            {type == 'new' ? '고시기준일' : '적용여부'}
                                        </th>
                                        <td>
                                            <div className="form-group" style={{ width: '100%' }}>
                                                {type == 'new' ? (
                                                    <>
                                                        <CustomFormLabel className="input-label-none" htmlFor="ft-date-start">고시기준일</CustomFormLabel>
                                                        <CustomTextField
                                                            type="date"
                                                            id="ft-date-start"
                                                            name="crtrAplcnYmd"
                                                            value={data.crtrAplcnYmd}
                                                            inputProps={{
                                                                min: getForamtAddDay(1),
                                                            }}
                                                            onChange={handleDataChange}
                                                            fullWidth
                                                        />
                                                    </>
                                                ) : (
                                                    <>
                                                        <CustomFormLabel className="input-label-none" htmlFor="sch-aplcnYn">적용여부</CustomFormLabel>
                                                        <CommSelect
                                                            cdGroupNm="APYN"
                                                            pValue={data.aplcnYn}
                                                            handleChange={handleDataChange}
                                                            pName="aplcnYn"
                                                            htmlFor={"sch-aplcnYn"}
                                                        />
                                                    </>
                                                )}                                                
                                            </div>
                                        </td>
                                        <th className="td-head" scope="row">
                                            기준년도
                                        </th>
                                        <td>
                                            <CustomFormLabel className="input-label-none" htmlFor="searchSelect">기준년도</CustomFormLabel>
                                            <CustomSelect
                                                id="searchSelect"
                                                name="crtrYear"
                                                value={data.crtrYear}
                                                onChange={handleDataChange}
                                                fullWidth
                                                variant="outlined"
                                                title="종류"
                                                >
                                                {yearList.map((option) => (
                                                    <MenuItem key={option.value} value={option.value}>
                                                    {option.label}
                                                    </MenuItem>
                                                ))}
                                            </CustomSelect>
                                        </td>
                                        <th className="td-head" scope="row"></th>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <th className="td-head" scope="row">
                                            월지급기준량(ℓ)
                                        </th>
                                        <td>
                                            <div className="form-group" style={{ width: '100%' }}>
                                                <CustomFormLabel className="input-label-none" htmlFor="ft-avgUseLiter">월지급기준량(ℓ)</CustomFormLabel>
                                                <CustomTextField
                                                    type="text"
                                                    id="ft-avgUseLiter"
                                                    name="avgUseLiter"
                                                    value={data.avgUseLiter}
                                                    onChange={handleDataChange}
                                                    fullWidth
                                                    inputProps={{
                                                        maxLength:'5'
                                                    }}
                                                />
                                            </div>
                                        </td>
                                        <th className="td-head" scope="row">
                                            한도비율(%)
                                        </th>
                                        <td>
                                            <div className="form-group" style={{ width: '100%' }}>
                                                <CustomFormLabel className="input-label-none" htmlFor="ft-limUseRt">한도비율(%)</CustomFormLabel>
                                                <CustomTextField
                                                    type="text"
                                                    id="ft-limUseRt"
                                                    name="limUseRt"
                                                    value={data.limUseRt}
                                                    onChange={handleDataChange}
                                                    fullWidth
                                                    inputProps={{
                                                        maxLength:'3'
                                                    }}
                                                />
                                            </div>
                                        </td>
                                        <th className="td-head" scope="row">
                                            한도리터(ℓ)
                                        </th>
                                        <td>
                                            <div className="form-group" style={{ width: '100%' }}>
                                                {data.crtrLimLiter}
                                            </div>
                                        </td>
                                    </tr>
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
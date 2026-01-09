import { BlankCard, CustomFormLabel, CustomRadio, CustomSelect, CustomTextField } from '@/utils/fsms/fsm/mui-imports';
import { Box, Button, Dialog, DialogContent, FormControlLabel, MenuItem, RadioGroup, Table, TableBody, TableCell, TableContainer, TableRow } from '@mui/material';
import React, { useCallback, useContext, useEffect, useState } from 'react';
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
import { CtpvSelect, LocgovSelect } from '@/app/components/tx/commSelect/CommSelect';
import CustomCheckbox from '@/app/components/forms/theme-elements/CustomCheckbox';
import { Row } from './TaxiPage';
import { formBrno } from '@/utils/fsms/common/convert';
import { stncncCarReviveModalheadCells } from '@/utils/fsms/headCells';
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

// 목록 조회시 필요한 조건
type listSearchObj = {
    page: number
    size: number
    [key: string]: string | number // 인덱스 시그니처 추가
}


interface RegisterModal {
    title: string;
    open: boolean
    data: Row
    onCloseClick: () => void;
    reload: () => void;
}

export const CarReviveModal = (props: RegisterModal) => {
    const router = useRouter() // 화면이동을 위한객체
    const querys = useSearchParams() // 쿼리스트링을 가져옴


    const [rows, setRows] = useState<Row[]>([])


    const [selectedRows, setSelectedRows] = useState<string[]>([]) // 체크 로우 데이터

    const {authInfo} = useContext(UserAuthContext);
    const [authContext, setAuthContext] = useState<UserAuthInfo | {} >();
    const [selectedIndex, setSelectedIndex] = useState<number>(-1);

    const [totalRows, setTotalRows] = useState(0) // 총 수
    const [loading, setLoading] = useState(false) // 로딩여부


    const [params, setParams] = useState<listSearchObj>({
        page: 1, // 페이지 번호는 1부터 시작
        size: 10, // 기본 페이지 사이즈 설정
    })
    const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 저장시 로딩상태
    const {title, open , onCloseClick, reload, data } = props;


    useEffect(() =>{
        if(open && data){
            fetchData()
            fetchCarData()
        }
    },[open,data])

    
    useEffect(()=>{
        setAuthContext(authInfo)
    },[authInfo])


    
    // Fetch를 통해 데이터 갱신, 템플릿을 가져온다
    const fetchData = async () => {
        setLoading(true)
        try {
            // 검색 조건에 맞는 endpoint 생성
            let endpoint: string =
                `/fsm/stn/cnc/tx/getCmprCardNoList?` +
                `${data.vhclNo ? '&vhclNo=' + data.vhclNo : ''}` +
                `${data.carBrno ? '&brno=' + data.carBrno : ''}` 
            const response = await sendHttpRequest('GET', endpoint, null, true, {
                cache: 'no-store',
            })
            if (response && response.resultType === 'success' && response.data) {
                setRows(response.data)
                setTotalRows(response.data.totalElements)
            } else {
                // 데이터가 없거나 실패
                setRows([])
                setTotalRows(0)
                setSelectedRows([]);
            }
        } catch (error) {
            setRows([])
            setTotalRows(0)
        } finally {
            setSelectedRows([]);
            setLoading(false)
        }
    }


        // Fetch를 통해 데이터 갱신, 템플릿을 가져온다
        const fetchCarData = async () => {
            setLoading(true)
            try {
                // 검색 조건에 맞는 endpoint 생성
                let endpoint: string =
                    `/fsm/stn/cnc/tx/getCmprVhclNoList?` +
                    `${data.vhclNo ? '&vhclNo=' + data.vhclNo : ''}` +
                    `${data.carBrno ? '&brno=' + data.carBrno : ''}` 
                const response = await sendHttpRequest('GET', endpoint, null, true, {
                    cache: 'no-store',
                })
                if (response && response.resultType === 'success' && response.data) {
                    if(response.data.length > 0){
                        // 데이터가 있을 경우 경고만함.
                        alert(`차량번호 : ${response.data[0].vhclNo }  지역 : ${response.data[0].locgovNm} 중복여부 체크 문구추출용 데이터가 존재합니다.`)
                    }else{
                         console.log('중복 문구 추출용 데이터가 없습니다.') // 임시 콘솔
                    }

                } else {
                    alert(response.message) 

                    // 데이터가 없거나 실패
                    // setRows([])
                    // setTotalRows(0)
                    // setSelectedRows([]);
                }
            } catch (error) {
                console.error('Error fetching data:', error)
            } finally {
                // setSelectedRows([]);
                // setLoading(false)
            }
        }







    
    const handleCheckChange = (selected:string[]) => {
        setSelectedRows(selected)
    }



    const handleClickClose = () => {
        setRows([])
        onCloseClick();
        reload();
    }





    // 차량말소복원
    const fetchCarNetCmprErsr = async () => {

        if (selectedRows.length > 0) {
            alert("카드가 선택되어 있습니다.\n\n차량말소복원을 원하시면 카드를 선택하지 마시고,\n카드할인복원을 원하시면 [차량 및 카드할인복원] 버튼을 클릭하세요.");
            return
        }

        if(data.mdfcnDt ?? '' === getToday()){
            alert(`오늘 수정된 차량(${data.vhclNo})은 말소할 수 없습니다. \n 다시 요청해주세요`);
            return
        }

        if (!confirm('차량말소복원 하시겠습니까?')) return;        
    
        if (!(authContext && 'lgnId' in authContext && authContext.lgnId)) {
            alert('로그인 정보가 없습니다. 다시 시도하세요');
            return;
        }

        const endpoint: string = `/fsm/stn/cnc/tx/updateCarNetCmprErsrReviv`;
        const body = {
            vhclNo: data.vhclNo,
            brno: data.carBrno,
            koiCd: data.carKoiCd,               // 최초 넘어오는 차량 데이터를 전송함.
            locgovCd: data.carLocgovCd,
            chgRsnCd: "010",
            mdfrId : authContext.lgnId,
        };
        
        try {

            setLoadingBackdrop(true);
            const response = await sendHttpRequest('PUT', endpoint, body, true, { cache: 'no-store' });
            
            if (response && response.resultType === 'success') {
                alert('차량말소복원했습니다.')
                fetchData();
                handleClickClose();
            } else {
                alert(response.message);
            }
        } catch (error) {
            console.error('Error fetching data:', error)
        }finally{
            setSelectedRows([])
            setRows([])
            setLoadingBackdrop(false);
        }
    };


    // 차량 및 카드할인복원
    const fetchCarNetCmprVhcleCrdErsrReviv = async () => {
        if (selectedRows.length < 1) {
            alert('선택항목이 없습니다.')
            return
        }

        if (!confirm('차량 및 카드할인복원 하시겠습니까?')) return;
        let endpoint: string = `/fsm/stn/cnc/tx/updateCarNetCmprVhcleCrdErsrReviv`;
    
        if (!(authContext && 'lgnId' in authContext && authContext.lgnId)) {
            alert('로그인 정보가 없습니다. 다시 시도하세요');
            return;
        }

        // {"vhclNo":"서울31바2061","brno":"1043526740","koiCd":"L","locgovCd":"11305","chgRsnCd":"010","mdfrId":"TRIONSOFT"}

        //선택된 행을 저장하는 방식 
        let param: any[] = []
        selectedRows.forEach((id)=>{
            const row = rows[Number(id.replace('tr', ''))]
            
            if (row.mdfcnDt?.replaceAll('-','').substring(0,8)  === getToday()) {
                alert(`오늘 수정된 차량(${row.vhclNo})은 말소할 수 없습니다. \n 다시 요청해주세요`);
                throw Error
                return; // 현재 반복만 건너뛴다.
            }
            param.push({
                vhclNo: row.vhclNo,
                brno: row.brno,
                koiCd: data.carKoiCd,               // 최초 넘어오는 차량 데이터를 전송함.
                locgovCd: data.carLocgovCd,
                chgRsnCd: "010",
                mdfrId : authContext.lgnId,
                crdcoCd : row.crdcoCd,
                cardNo : row.cardNo,
            })
        })


        if(params.length === 0){
            alert('모두 오늘 수정되서 요청할 수 없습니다.')
            return;
        }

        let body = {
            vhcleErsrMngReqstDto : param
        };
        try {
            setLoadingBackdrop(true);
            const response = await sendHttpRequest('PUT', endpoint, body, true, {
                cache: 'no-store',
            });
            if (response && response.resultType === 'success') {
                alert('차량 및 카드할인복원했습니다.')
                fetchData();
                handleClickClose();
            } else {
                alert(response.message);
                
            }
        } catch (error) {
            console.error('Error fetching data:', error)
        }finally{
            setSelectedRows([])
            setRows([])
            setLoadingBackdrop(false);
        }
    };




    const handleClose = ()=>{
        setRows([])
        setSelectedRows([])
        setSelectedIndex(-1)
        setParams({
            page: 1, // 페이지 번호는 1부터 시작
            size: 10, // 기본 페이지 사이즈 설정
        })
        onCloseClick();
    }

return (
    <>
        <Box>
        <Dialog
            fullWidth={true}
            maxWidth={'md'}
            open={open}
            //onClose={onCloseClick}
        >
        <DialogContent>
                <Box className='table-bottom-button-group'>
                    <CustomFormLabel className="input-label-display">
                        <h2 >
                            {title}
                        </h2>
                    </CustomFormLabel>     
                <div className=" button-right-align">
                    <Button variant="contained" color="dark" onClick={(onCloseClick)}>취소</Button>
                </div>
            </Box>

        <Box  sx={{ mb: 3}} style={{ width: '70%' }}>
        <table className="table table-bordered"  >
                <caption>사업자 정보 테이블 요약</caption>
                <colgroup>
                    <col style={{ width: '13%' }}></col>
                    <col style={{ width: '14%' }}></col>
                    <col style={{ width: '13%' }}></col>
                    <col style={{ width: '14%' }}></col>
                </colgroup>
            <tbody>
                <tr>
                    <th className="td-head" scope="row" style={{ whiteSpace:'nowrap', textAlign:'center'}}  >
                        차량번호
                    </th>
                    <td colSpan={2}>
                        <div className="form-group" style={{ whiteSpace:'nowrap', textAlign:'center'}}>
                            {data.vhclNo ?? ''}
                        </div>
                    </td>
                    <th className="td-head" scope="row" style={{ whiteSpace:'nowrap', textAlign:'center'}} >
                        사업자등록번호
                    </th>
                    <td colSpan={2}>
                        <div className="form-group" style={{ whiteSpace:'nowrap', textAlign:'center'}} >
                            {formBrno( data.carBrno ?? '')}
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
        </Box>

        <p style={{color: 'red'}}>
        ※ 대차된 차량(차량번호는 동일, 차량만 교체)의 경우에 한하여 카드할인 복원이 가능합니다.<br/><br/>

        ※ 각 카드사별로 1개씩 최대 3개의 정상 카드에 대해 카드 할인 복원이 가능합니다.<br/><br/>

        ※ 카드 할인 복원 시 복수 카드가 존재하면 카드사접수일을 참고하시기 바랍니다.<br/><br/>

        ※ 소급이 필요한 경우 각 카드사로 문의하시기 바랍니다.
        </p>


            <Box className='table-bottom-button-group' sx={{ mb: 1}}>
                <div className=" button-right-align">
                    <Button variant="contained" color="primary" onClick={fetchCarNetCmprErsr}>차량말소복원</Button>
                    <Button variant="contained" color="primary" onClick={fetchCarNetCmprVhcleCrdErsrReviv}>차량 및 카드할인복원</Button>
                </div>
            </Box>


            {/* 테이블영역 시작 */}
            <Box sx={{ mb: 5}}>
                <TableDataGrid
                    headCells={stncncCarReviveModalheadCells} // 테이블 헤더 값
                    rows={rows} // 목록 데이터
                    totalRows={totalRows} // 총 로우 수
                    loading={loading} // 로딩여부
                    onRowClick={() => {}} // 행 클릭 핸들러 추가
                    selectedRowIndex={selectedIndex}
                    //pageable={pageable} 
                    paging={false}
                    cursor={true}
                    onCheckChange={handleCheckChange}
                    caption={"차량복원 목록 조회"}
                />
            </Box>

            {/* 테이블영역 끝 */}

            {/* 로딩 */}
            <LoadingBackdrop open={loadingBackdrop} />

        </DialogContent>
        </Dialog>
    </Box>
    </>
    );
    
}
export default CarReviveModal;
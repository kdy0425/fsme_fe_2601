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
import ModifyDayoffDivModal from './ModifyDayoffDivModal';
import { PanoramaSharp } from '@mui/icons-material';
import { stabdmDayoffDivModalHeadCells } from '@/utils/fsms/headCells';
import { getUserInfo } from '@/utils/fsms/utils';




export interface DayOffRow {
    index?: number;
    dayoffLocgovCd?: string; // 부제 지자체 코드
    locgovNm?: string; // 지자체명
    dayoffSeCd?: string; // 부제 구분 코드 이게 따로 필요한 상황 
    dayoffSeNm?: string; // 부제 구분 명
    dayoffSeExpln?: string; // 부제 구분 설명
    rgtrId?: string; // 등록자 ID
    regDt?: string; // 등록 일자
    mdfrId?: string; // 수정자 ID
    mdfcnDt?: string; // 수정 일자
}

interface RegisterModal {
    title: string;
    open: boolean
    onCloseClick: () => void;
    authLocalNm: string
    dayoffSeCd: string;
    dayoffLocgovCd: string;
    reload: () => void;
}

export const DayoffDivModal = (props: RegisterModal) => {
    const router = useRouter() // 화면이동을 위한객체
    const querys = useSearchParams() // 쿼리스트링을 가져옴

    const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
    const [rows,setRows] = useState<DayOffRow[]>([]) // 가져온 로우 데이터

    const [selectedRow, setSelectedRow] = useState<DayOffRow | null>(null);
    const [selectedIndex, setSelectedIndex] = useState<number>(-1);

    const [modalType, setModalType] = useState<'I' | 'U'>('I')

    const [modifyOpen, setModifyOpen] = useState<boolean>(false);
    const [locgovCd, setLocgovCd] = useState<string>('');
    const userInfo = getUserInfo()

    const {authInfo} = useContext(UserAuthContext);
    const [authContext, setAuthContext] = useState<UserAuthInfo | {} >();

    const [totalRows, setTotalRows] = useState(0) // 총 수
    const [loading, setLoading] = useState(false) // 로딩여부



    //초기 데이터 세팅 
    const [data, setData] = useState<DayOffRow>({
        dayoffLocgovCd: '', // 부제 지자체 코드
        locgovNm: '', // 지자체명
        dayoffSeCd: '', // 부제 구분 코드
        dayoffSeNm: '', // 부제 구분 명
        dayoffSeExpln: '', // 부제 구분 설명
        rgtrId: '', // 등록자 ID
        regDt: '', // 등록 일자
        mdfrId: '', // 수정자 ID
        mdfcnDt: '',// 수정 일자
    })


    
    const handleDataChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
        ) => {
        const { name, value } = event.target
        setData((prev) => ({ ...prev, [name]: value }));
    }
    

    const {open ,dayoffLocgovCd,dayoffSeCd, onCloseClick, reload,authLocalNm} = props;


    



    
    useEffect(()=>{
        setAuthContext(authInfo)
    },[authInfo])


        
        
    useEffect(() => {
        if (open) {
            if(dayoffLocgovCd && dayoffLocgovCd !== '' ){
                setLocgovCd(dayoffLocgovCd)
            }
            fetchData(); // Dialog가 열릴 때만 데이터 로드
        } else {
            setSelectedRow(null);
            setLocgovCd('')
            setSelectedIndex(-1);
        }
    }, [open]);
    
    useEffect(() => {
    if (dayoffLocgovCd && dayoffLocgovCd !== '') {
        fetchData();
    }
    }, [dayoffLocgovCd, dayoffSeCd]);


    //부제구분 조회 데이터를 가져온다. 
    const fetchData = async () => {
        setSelectedIndex(-1)
        setLoading(true)
            if(!dayoffLocgovCd || dayoffLocgovCd === ''){
                setRows([])
                setLoading(false)
                return ;
            }
        try {
        // 검색 조건에 맞는 endpoint 생성
        let endpoint: string =
            `/fsm/stn/bdm/tx/getAllDayoffPartList?`+
            `${dayoffLocgovCd ? '&dayoffLocgovCd=' + dayoffLocgovCd : ''}` 

        const response = await sendHttpRequest('GET', endpoint, null, true, {
            cache: 'no-store',
        })
        if (response && response.resultType === 'success' && response.data) {

            // 데이터 조회 성공시
            setRows(response.data)
            setTotalRows(response.data.length)
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

    const deleteData = async () => {
        try {
            if(!selectedRow) {
                alert('선택된 행이 없습니다.')
                return;
            }
            if (userInfo.rollYn === '') {
                alert('현재 부제 미사용 지자체입니다. 관리자에게 문의해주세요')
                return
            } else if (userInfo.rollYn === 'N' && userInfo.authLocgovNm) {
                alert(userInfo.authLocgovNm + '만 가능합니다.')
                return
            } else if (userInfo.locgovCd && userInfo.locgovCd.length == 5 
                && selectedRow.dayoffLocgovCd && selectedRow.dayoffLocgovCd.length == 5 //타겟데이터 지자체코드 확인
              ) {
                //타겟정보
                const ctpvCd = selectedRow.dayoffLocgovCd?.substring(0,2)
                //유저정보
                const userCtpvCd = userInfo.locgovCd.substring(0,2)
                const userInstCd = userInfo.locgovCd.substring(2,5)
                
                if( userCtpvCd == '11' &&  (userInstCd == '000' || userInstCd == '001' || userInstCd == '009') ){ //서울 시도 담당자
                  if(userCtpvCd != ctpvCd){
                    alert(userInfo.authLocgovNm + '만 가능합니다.')
                    return
                  }
                }else if( userCtpvCd == '11' &&  (userInstCd != '000' && userInstCd != '001' && userInstCd == '009') ){ //서울 시도 담당자 아님
                  if(userInfo.locgovCd != selectedRow.dayoffLocgovCd){
                    alert('소속 지자체만 삭제 가능합니다.')
                    return
                  }
                }else if(userInstCd == '000' || userInstCd == '001'){ //서울외 시도 담당자
                  if(userCtpvCd != ctpvCd){
                    alert(userInfo.authLocgovNm + '만 가능합니다.')
                    return
                  }
                }else if(userInstCd != '000' && userInstCd != '001'){ //서울외 시도 담당자 아님
                  if(userInfo.locgovCd != selectedRow.dayoffLocgovCd){
                    alert('소속 지자체만 삭제 가능합니다.')
                    return
                  }
                }
              }

            if (!(authContext && 'lgnId' in authContext && authContext.lgnId)) {
                alert('로그인 정보가 없습니다. 다시 시도하세요');
                return;
            }
            let endpoint: string = `/fsm/stn/bdm/tx/deleteByDayoffSeEstbs`
            let body = {
                dayoffLocgovCd: selectedRow?.dayoffLocgovCd,
                dayoffSeCd: selectedRow?.dayoffSeCd,
                mdfrId: authContext?.lgnId
            }
        
            const userConfirm = confirm(`부제구분명 : ${selectedRow.dayoffSeNm ?? ''}\n해당 부제구분정보를 삭제하시겠습니까?`);
        
            if(userConfirm) {
                const response = await sendHttpRequest('PUT', endpoint, body, true, {
                cache: 'no-store'
                })
        
                if(response && response.resultType == 'success') {
                alert(response.message);
                fetchData();
                }else {
                    alert(response.message)
                }
            }else {
                return;
            }
            }catch(error) {
                console.log('Error modifying data:', error);
            }
        }


    // const handleRowClick = (row: DayOffRow, index?: number) => {
    //     setSelectedRow({ ...row, index }); // 인덱스를 추가하여 선택된 행 데이터 설정
    //     setData({ ...row, index });
    // };
    // 행 클릭 시 호출되는 함수
    const handleRowClick = (row: DayOffRow, index?: number) => {
        if(index === selectedIndex) {
            setSelectedRow(null);
            setSelectedIndex(-1);
        }else {
            setSelectedRow(row);
            setSelectedIndex(index?? -1);
        }
    }

    const handleClickModify = () => {
        if (userInfo.rollYn === '') {
            alert('현재 부제 미사용 지자체입니다. 관리자에게 문의해주세요')
            return
        } else if (userInfo.rollYn === 'N' && userInfo.authLocgovNm) {
            alert(userInfo.authLocgovNm + '만 가능합니다.')
            return
        }
        if (selectedIndex < 0) {
            alert('선택된 휴지정보가 없습니다.')
            return
        }
        setModalType('U');
        setModifyOpen(true)
    }
    

    const handleClickClose = () => {
        // 모든 데이터를 초기호하한다.
        onCloseClick();
    }


return (
        <React.Fragment>
        <Dialog
            fullWidth={true}
            maxWidth={'lg'}
            open={open}
            //onClose={onCloseClick}
        >

            <DialogContent>
                <Box className="table-bottom-button-group">
                    <CustomFormLabel className="input-label-display">
                        <h2>부제구분 조회</h2>
                    </CustomFormLabel>
                        <div className=" button-right-align">
                            <Button variant="contained" color="primary" onClick={() => { 
                            if (userInfo.rollYn === '') {
                                alert('현재 부제 미사용 지자체입니다. 관리자에게 문의해주세요')
                                return
                            } else if (userInfo.rollYn === 'N' && userInfo.authLocgovNm) {
                                alert(userInfo.authLocgovNm + '만 가능합니다.')
                                return
                            }
                            setModalType('I'); setModifyOpen(true)}}>
                                부제구분등록
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() =>{
                                    if (userInfo.rollYn === '') {
                                        alert('현재 부제 미사용 지자체입니다. 관리자에게 문의해주세요')
                                        return
                                    } else if (userInfo.rollYn === 'N' && userInfo.authLocgovNm) {
                                        alert(userInfo.authLocgovNm + '만 가능합니다.')
                                        return
                                    }
                                    handleClickModify(); }}
                                >
                                부제구분수정
                            </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => {
                                if (userInfo.rollYn === '') {
                                    alert('현재 부제 미사용 지자체입니다. 관리자에게 문의해주세요')
                                    return
                                } else if (userInfo.rollYn === 'N' && userInfo.authLocgovNm) {
                                    alert(userInfo.authLocgovNm + '만 가능합니다.')
                                    return
                                }
                                deleteData()}}
                            >
                            부제구분삭제
                        </Button>
                        <Button variant="contained" color="dark" onClick={() => handleClickClose()}>
                            취소
                        </Button>
                        </div>
                </Box>

                {/* 테이블영역 시작 */}
                <Box style={{ maxHeight: '60vh', overflow: 'auto' }}>
                <TableDataGrid
                    headCells={stabdmDayoffDivModalHeadCells} // 테이블 헤더 값
                    rows={rows} // 목록 데이터
                    totalRows={totalRows} // 총 로우 수
                    loading={loading} // 로딩여부
                    selectedRowIndex={selectedIndex}
                    onRowClick={handleRowClick} // 행 클릭 핸들러 추가
                    onPaginationModelChange={() => {}} // 페이지 , 사이즈 변경 핸들러 추가
                    // pageable={pageable} // 현재 페이지 / 사이즈 정보
                    paging={false}
                    cursor={true}
                    caption={"부제구분 조회 목록"}
                />
                </Box>
            </DialogContent>
        </Dialog>

        <ModifyDayoffDivModal
            open={modifyOpen}
            row={rows[selectedIndex]}
            authLocalNm={authLocalNm}
            handleClickClose={() => setModifyOpen(false)}
            dayoffSeCd={dayoffSeCd}
            type={modalType}
            locgovCd={locgovCd}
            reload={() => {fetchData();} }
        />
    </React.Fragment>
    );
}

export default DayoffDivModal;
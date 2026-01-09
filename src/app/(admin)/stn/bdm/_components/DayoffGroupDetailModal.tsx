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
import { stabdmDayoffGroupDetailModalHeadCell } from '@/utils/fsms/headCells';




export interface DayOffRow {
    index?: number;
    dayoffLocgovCd?: string; // 부제 지자체 코드
    locgovNm?: string; // 부제 지자체 코드
    dayoffNo?: string; // 부제 지자체 코드
    sn?: string; // 부제 지자체 코드
    dayoffSeCd?: string; // 부제 지자체 코드
    dayoffNm?: string; // 부제 지자체 코드
    indctNm?: string; // 부제 지자체 코드
    dayoffTypeCd?: string; // 부제 지자체 코드
    crtrYmd?: string; // 부제 지자체 코드

    prkCd?: string; // 부제 지자체 코드
    dowCd?: string; // 부제 지자체 코드
    endHrNxtyYn?: string; // 부제 지자체 코드
    dayoffStand?: string; // 부제 지자체 코드
    dayoffTm?: string; // 부제 지자체 코드

}

interface RegisterModal {
    title: string;
    open: boolean
    onCloseClick: () => void;
    groupId: string;
    reload: () => void;
}

export const DayoffGroupDetailModal = (props: RegisterModal) => {
    const router = useRouter() // 화면이동을 위한객체
    const querys = useSearchParams() // 쿼리스트링을 가져옴

    const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
    const [rows,setRows] = useState<DayOffRow[]>([]) // 가져온 로우 데이터

    const [selectedIndex, setSelectedIndex] = useState<number>(-1);

    const {authInfo} = useContext(UserAuthContext);
    const [authContext, setAuthContext] = useState<UserAuthInfo | {} >();

    const [totalRows, setTotalRows] = useState(0) // 총 수
    const [loading, setLoading] = useState(false) // 로딩여부




    const {title, open ,groupId, onCloseClick, reload} = props;


    



    
    useEffect(()=>{
        setAuthContext(authInfo)
    },[authInfo])


        
    useEffect(()=>{

        if(!open){
            return 
        }
        fetchData()
    },[groupId,open])
    


    //부제구분 조회 데이터를 가져온다. 
    const fetchData = async () => {
        setSelectedIndex(-1)


        setLoading(true)
        if(!groupId || groupId === ''){
            setRows([])
            setLoading(false)
            return ;
        }

        try {
        // 검색 조건에 맞는 endpoint 생성
        let endpoint: string =
            `/fsm/stn/bdm/tx/getAllDayoffGroupInfoDtlList?`+
            `${groupId ? '&groupId=' + groupId : ''}` 

        const response = await sendHttpRequest('GET', endpoint, null, true, {
            cache: 'no-store',
        })
        if (response && response.resultType === 'success' && response.data) {

            setRows(response.data)
            setTotalRows(response.data.length)
            setLoading(false)

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





    const handleClickClose = () => {
        // 모든 데이터를 초기호하한다.
        onCloseClick();
    }


return (
        <Box>
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

                        <Button
                variant="contained"
                color="dark"
                onClick={handleClickClose}
                >
                취소
                </Button>
                    </div>
                    </Box>
                    {/* 테이블영역 시작 */}
                    <Box style={{ maxHeight: '60vh', overflow: 'auto' }}>
                    <TableDataGrid
                        headCells={stabdmDayoffGroupDetailModalHeadCell} // 테이블 헤더 값
                        rows={rows} // 목록 데이터
                        totalRows={totalRows} // 총 로우 수
                        loading={loading} // 로딩여부
                        selectedRowIndex={selectedIndex}
                        onRowClick={() => {}} // 행 클릭 핸들러 추가
                        onPaginationModelChange={() => {}} // 페이지 , 사이즈 변경 핸들러 추가
                        // pageable={pageable} // 현재 페이지 / 사이즈 정보
                        paging={false}
                        cursor={false}
                        caption={"부제구분 목록 조회"}
                    />
                    </Box>
                </DialogContent>
        </Dialog>
    </Box>
    );
}

export default DayoffGroupDetailModal;
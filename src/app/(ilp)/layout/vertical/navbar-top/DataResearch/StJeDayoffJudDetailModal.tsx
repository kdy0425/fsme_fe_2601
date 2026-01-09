'use client'

import { Button, Dialog, DialogContent, DialogProps } from "@mui/material";
import React, { useEffect, useState } from "react";
import { sendHttpRequest } from "@/utils/fsms/common/apiUtils";
import { Box } from "@mui/material";
import { Row } from "./CarNumberSearchModal";
import { formBrno,formatDate } from "@/utils/fsms/common/convert";
import { CustomFormLabel } from "@/utils/fsms/fsm/mui-imports";
import {
    rrNoFormatter
  } from '@/utils/fsms/common/util'
  
        // vhclNo:인천85아5970
        // aplcnYmd:20200311
        // hstrySn:06_0000001149
        // chgSeCd:G


export interface params   {
    vhclNo?: string;
    aplcnYmd?: string;
    hstrySn?: string;
    chgSeCd?: string;
}


const getTodayDate = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};



interface FormModalProps {
    size?: DialogProps['maxWidth'] | 'lg';
    params: Row;
    open: boolean
    setClose: () => void;
}

function StJeDayoffJudDetailModal(props : FormModalProps) {
    const {params,size, open, setClose} = props;
    const [row, setRow] = useState<Row>()


    useEffect(() => {
        if(params && open === true){
            fetchData();
        }
    }, [open])



    // Fetch를 통해 데이터 갱신
    const fetchData = async () => {
    try {
        // 검색 조건에 맞는 endpoint 생성
        let endpoint: string = `/fsm/cmm/cmmn/cp/getOneCarGiveStpHisDtl?` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
        `${params.aplcnYmd ? '&aplcnYmd=' + params.aplcnYmd : ''}` +
        `${params.hstrySn ? '&hstrySn=' + params.hstrySn : ''}` +
        `${params.chgSeCd ? '&chgSeCd=' + params.chgSeCd : ''}`

        console.log('stJeDayoff Endpoint' , endpoint)

        const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
        })
        if (response && response.resultType === 'success' && response.data) {

            console.log(response.data)
        /**
         * 데이터 어떻게 들어오는지 확인하고  setRow해야함
         * 
         */
        setRow(response.data)
        } else {
        // 데이터가 없거나 실패
        setRow({})
        }
    } catch (error) {
        // 에러시
        console.error('Error fetching data:', error)
        setRow({})
    }
    }





    return (
        <Box>
        <Dialog 
            fullWidth={false}
            maxWidth="lg" // 두 번째 모달은 더 큰 크기로 설정
            open={open}
            PaperProps={{
                style: {
                width: '1100px',
                },
            }}
            onClose={setClose}
            >
            <DialogContent>
                <Box className="table-bottom-button-group">
                        <CustomFormLabel className="input-label-display">
                            <h2>
                            지급정지/거절/휴지/처분유예 상세내역
                            </h2>
                        </CustomFormLabel>

                    <div className="button-right-align">
                        <Button variant="contained" color="dark" onClick={setClose}>
                            취소
                        </Button>
                    </div>
                </Box>

            
                {/* 모달팝업 내용 시작 */}
                <div id="alert-dialog-description1">
                    {/* 테이블영역 시작 */}
                    <div className="table-scrollable">
                        <table className="table table-bordered">
                            <caption>상세 내용 시작</caption>
                            <colgroup>
                                <col style={{ width: '10%' }}></col>
                                <col style={{ width: '13%' }}></col>
                                <col style={{ width: '10%' }}></col>
                                <col style={{ width: '13%' }}></col>
                                <col style={{ width: '11%' }}></col>
                                <col style={{ width: '15%' }}></col>
                                <col style={{ width: '10%' }}></col>
                                <col style={{ width: '15%' }}></col>
                            </colgroup>
                        <tbody>
                            <tr>
                                <th className="td-head" scope="row">
                                    차량번호
                                </th>
                                <td>
                                <div className="form-group" style={{ width: '100%' }}>
                                    {row?.vhclNo}
                                </div>
                                </td>
                                <th className="td-head" scope="row">
                                소유자명
                                </th>
                                <td>
                                    {row?.vonrNm}
                                </td>
                                <th className="td-head" scope="row">
                                사업자등록번호
                                </th>
                                <td>{ formBrno( row?.vonrBrno ?? '')}
                                </td>
                                <th className="td-head" scope="row">
                                주민등록번호
                                </th>
                                <td>{rrNoFormatter(row?.vonrRrnoSe?? '')}
                                </td>
                            </tr>

                            <tr>
                                <th className="td-head" scope="row">
                                시작일 
                                </th>
                                <td>{formatDate(row?.bgngYmd ?? '')}
                                </td>
                                <th className="td-head" scope="row">
                                종료일
                                </th>
                                <td>{formatDate(row?.endYmd??'')}
                                </td>
                                <th className="td-head" scope="row">
                                
                                </th>
                                <td>{}
                                </td>
                                <th className="td-head" scope="row">
                                </th>
                                <td>{}
                                </td>
                            </tr>
                            <tr>
                                <th className="td-head" scope="row">
                                    사유
                                </th>
                                <td colSpan={7}>{row?.chgRsnCn}
                                </td>
                            </tr>
                            <tr>
                                <th className="td-head" scope="row">
                                등록자아이디
                                </th>
                                <td>{row?.rgtrId}
                                </td>
                                <th className="td-head" scope="row">
                                등록일자
                                </th>
                                <td>{formatDate(row?.regDt??'')}
                                </td>
                                <th className="td-head" scope="row">
                                수정자아이디
                                </th>
                                <td>{row?.mdfrId}
                                </td>
                                <th className="td-head" scope="row">
                                수정일자
                                </th>
                                <td>{formatDate(row?.mdfcnDt??'')}
                                </td>
                            </tr>
                        </tbody>
                        </table>
                    </div>
                    {/* 테이블영역 끝 */}
                </div>
                {/* 모달팝업 내용 끝 */}

            </DialogContent>
        </Dialog>
        </Box>

    );
}

export default StJeDayoffJudDetailModal
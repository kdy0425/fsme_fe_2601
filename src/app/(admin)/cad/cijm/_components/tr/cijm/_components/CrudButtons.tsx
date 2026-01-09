import { Box, Button } from "@mui/material";
import { DetailRow } from "../page";
import { useEffect, useState } from "react";
import FormDialog from "@/app/components/popup/FormDialog";
import ModalContent from "./TrModalContent";
import { sendHttpRequest } from "@/utils/fsms/common/apiUtils";
import { getUserInfo } from "@/utils/fsms/utils";

interface propsInterface {
    rowIndex: number,
    tabIndex: string,
    detailInfo: DetailRow,
    handleAdvancedSearch: () => void,
    handleExcelDownload: () => void,
}

export interface procInterface {
    vhclNo:string,
    procGb:string,
    vhclSttsCd:string,
    crdcoCd:string,
    cardNo:string,
    chgRsnCn:string,
    sendDataYn:string,
    vonrRrno:string,
}

const CrudButtons = (props: propsInterface) => {
    const { rowIndex, tabIndex, detailInfo, handleAdvancedSearch, handleExcelDownload } = props;

    const userInfo = getUserInfo();

    const [remoteFlag, setRemoteFlag] = useState<boolean|undefined>();
    const [procData, setProcData] = useState<procInterface>({
        vhclNo:'',
        procGb:'',
        vhclSttsCd:'',
        crdcoCd:'',
        cardNo:'',
        chgRsnCn:'',
        sendDataYn:'',
        vonrRrno:'',
    })

    const [roles, setRoles] = useState<string>();

    useEffect(() => {
        setRemoteFlag(undefined);
        setRoles(userInfo.roles[0]);
    }, [rowIndex])


    // 말소(버스)
    const deletionHandleForBus = async () => {
        if (detailInfo.cardSttsCd === '01') {
            alert("카드상태가 말소인 카드는 말소 시킬 수 없습니다.");
            return
        }

        const userConfirm = confirm('해당카드를 말소 처리하시겠습니까?')

        if (!userConfirm) {
            return;
        } else {
            try {
                let endpoint: string = 
                    `/fsm/cad/cim/bs/erasureCardInfoMng` + 
                    `${detailInfo.brno ? '&brno=' + detailInfo.brno : ''}` + 
                    `${detailInfo.vhclNo ? '&vhclNo=' + detailInfo.vhclNo : ''}` + 
                    `${detailInfo.rrno ? '&rrno=' + detailInfo.rrno : ''}` + 
                    `${detailInfo.cardNo ? '&cardNo=' + detailInfo.cardNo : ''}`

                const response = await sendHttpRequest('GET', endpoint, null, true, {
                    cache: 'no-store'
                })

                if (response && response.resultType === 'success') {
                    alert(response.message)
                } else {
                    alert("실패 :: " + response.message)
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }
    }

    const fetchData = async (endpoint: string, body: any) => {
        try {
            const response = await sendHttpRequest('PUT', endpoint, body, true, {
                cache:'no-store'
            })

            if (response && response.resultType === 'success') {
                alert(response.message)
            } else {
                alert("실패 :: " + response.message)
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    return (
        <Box className="table-bottom-button-group">
            <div className="button-right-align">
                {/* 조회 */}
                <Button variant="contained" color="primary" onClick={handleAdvancedSearch}>검색</Button>
                <Button variant="contained" color="primary" onClick={handleAdvancedSearch}>탈락</Button>
                <Button variant="contained" color="primary" onClick={handleAdvancedSearch}>승인</Button>
                {/* 조건부 렌더링 */}
                {tabIndex === 'TR' ? (
                <>
                    {roles === 'ADMIN' ? (
                    <>
                    </>
                    ) : (
                    <>
                    </>
                    )}
                    
                </>
                ) : (
                    <>
                    {tabIndex === 'Tx' ? (
                        <>
                        </>
                    ) : (
                        <>
                        {roles === 'ADMIN' ? (
                        <>
                            <Button variant="contained" color="primary" onClick={(deletionHandleForBus)}>말소</Button>
                        </>
                        ) : (
                        <>
                        </>
                        )}
                        </>
                    )}
                    </>
                )}
                {/* 엑셀 */}
                <Button variant="contained" color="success" onClick={handleExcelDownload}>엑셀</Button>
            </div>
        </Box>
    )
}

export default CrudButtons
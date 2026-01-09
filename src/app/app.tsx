"use client";
import React, { useEffect, useState } from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeSettings } from "@/utils/theme/Theme";
import { useSelector } from 'react-redux';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import { AppState } from "@/store/store";
import "@/utils/i18n";
import "@/app/api/index";
import "@/app/assets/css/app.css";
import UserAuthContext from "./components/context/UserAuthContext";
import { favoriteListType } from "./components/context/UserAuthContext";
import ExcelRsnModal from "./components/popup/ExcelRsnModal";

/* 엑셀다운로드 사유작성 모달 기능이 context 사용불가로 인하여 우회함수 사용함 */
export type excelRsnModalInfoType = { endpoint: string, 
                                      name: string, 
                                      mode?: 'server' | 'client';           // 기본은 'server' 로 보고 처리
                                      onConfirm?: (reason: string) => void; // client 처리용 함수
                                      privacyObj?: privacyObjType           // client 처리 시 개인정보 포함여부
                                    }
type privacyObjType = {
    rrnoInclYn: 'N' | 'Y' 	 // 주민번호 포함여부
    cardNoInclYn: 'N' | 'Y'	 // 카드번호 포함여부
    vhclNoInclYn: 'N' | 'Y'	 // 차량번호 포함여부
    flnmInclYn: 'N' | 'Y' 	 // 성명 포함여부
    actnoInclYn: 'N' | 'Y' 	 // 계좌번호 포함여부
    brnoInclYn: 'N' | 'Y' 	 // 사업자번호 포함여부
    telnoInclYn: 'N' | 'Y' 	 // 전화번호 포함여부
    addrInclYn: 'N' | 'Y' 	 // 주소 포함여부
    emlAddrInclYn: 'N' | 'Y' // 이메일 포함여부
    ipAddrInclYn: 'N' | 'Y'  // 아이피 포함여부
}
export let excelRsnModalOpen = (info: excelRsnModalInfoType) => {}
export let excelRsnModalClose = () => {}

const MyApp = ({ children }: { children: React.ReactNode }) => {
    const theme = ThemeSettings();
    const customizer = useSelector((state: AppState) => state.customizer);
    const [authInfo, setAuthInfo] = useState({})
    const [contextFavoriteList, setContextFavoriteList] = useState<favoriteListType[]>([]);
    
    const setUserAuthInfo = (auth: any) => {
        setAuthInfo(auth);
    }

    const resetAuthInfo = () => {
        setAuthInfo({});
    }

    /**
     * 엑셀다운로드시 사유작성이 추가됨에 따라 글로벌 모달이 필요하나,
     * 엑셀다운로드를 comm.ts에서 호출하여 context를 사용하지 못하기에, 우회하는 방식으로 개발
     */
    const [rsnModalOpen, setRsnModalOpen] = useState<boolean>(false)
    const [rsnModalInfo, setRsnModalInfo] = useState<excelRsnModalInfoType | null>(null)

    /* mount시 엑셀다운로드 사유작성 모달 함수 재정의 */
    useEffect(() => {
        excelRsnModalOpen = (info: excelRsnModalInfoType) => {
            setRsnModalInfo(info)
            setRsnModalOpen(true)
        }
        excelRsnModalClose = () => {
            setRsnModalInfo(null)
            setRsnModalOpen(false)
        }
    }, [])
    
    return (
        <>
            <UserAuthContext.Provider value={ {authInfo, setUserAuthInfo, resetAuthInfo, contextFavoriteList, setContextFavoriteList }}>
            <AppRouterCacheProvider options={{ enableCssLayer: true }}>
                <ThemeProvider theme={theme}>
                    <CssBaseline />
                    {children}     
                    {rsnModalOpen && rsnModalInfo ? (
                        <ExcelRsnModal
                            open={rsnModalOpen}
                            close={excelRsnModalClose}
                            excelRsnModalInfo={rsnModalInfo}
                        />  
                    ) : null}                                 
                </ThemeProvider>
            </AppRouterCacheProvider>
            </UserAuthContext.Provider>
        </>
    );
};

export default MyApp;

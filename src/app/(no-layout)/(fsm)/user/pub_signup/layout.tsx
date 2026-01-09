"use client";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { styled, useTheme } from "@mui/material/styles";
import React, { useState } from "react";
import Header from "@/app/(admin)/layout/vertical/header/Header";
import Footer from "@/app/(admin)//layout/vertical/footer/Footer";
//import Navigation from "@/ptl/layout/vertical/navbar/Navigation"; // 트리메뉴 방식
import Navigation from "@/app/(admin)/layout/vertical/navbar-top/Navigation"; // 전체메뉴 방식
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { useEffect } from "react";
// 포털시스템 스타일
import "@/app/assets/css/layoutFsm.css";
import { useRouter } from "next/router";
import { usePathname } from "next/navigation";

const BodyContainerWrapper = styled("div")(() => ({
  display: "flex",
  minHeight: "100vh",
  width: "100%",
}));

const BodyContainerInner = styled("div")(() => ({
  display: "flex",
  flexGrow: 1,
  flexDirection: "column",
  zIndex: 1,
  width: "100%",
  backgroundColor: "transparent",
}));

const BodyContent = styled("div")(() => ({
  
}));

interface Props {
  children: React.ReactNode;
}

export default function RootLayout({ children }: Props) {
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();
  const pathname = usePathname(); // usePathname 사용하여 경로 가져오기
  const isIndexPage = pathname === "/" || pathname === "/pub_main";

  return (
    <BodyContainerWrapper   className={`body-container-wrapper page-fsm-wrapper ${
      isIndexPage ? "page-fsm-main" : ""
    }`}>      
      {/* ------------------------------------------- */}
      {/* Body Wrapper */}
      {/* ------------------------------------------- */}
      <BodyContainerInner className="body-container-inner">
        {/* ------------------------------------------- */}
        {/* Header */}
        {/* ------------------------------------------- */}
        <Header hideLogin={true} />
        <BodyContent className="join-content">
            {children}
        </BodyContent>
      </BodyContainerInner>
    </BodyContainerWrapper>
  );
}

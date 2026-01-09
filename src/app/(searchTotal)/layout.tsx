"use client";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { styled, useTheme } from "@mui/material/styles";
import React from "react";
import Header from "@/app/(admin)/layout/vertical/header/Header";
import Footer from "@/app/(admin)//layout/vertical/footer/Footer";
import Navigation from "@/app/(admin)/layout/vertical/navbar-top/Navigation"; // 전체메뉴 방식
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";

// 포털시스템 스타일
import "@/app/assets/css/layoutPtl.css";
import "@/app/assets/css/layoutSearch.css";

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

  return (
    <BodyContainerWrapper   className="body-container-wrapper page-portal-wrapper page-search">      
      {/* ------------------------------------------- */}
      {/* Body Wrapper */}
      {/* ------------------------------------------- */}
      <BodyContainerInner className="body-container-inner">
        {/* ------------------------------------------- */}
        {/* Header */}
        {/* ------------------------------------------- */}
        <Header />

        {/* ------------------------------------------- */}
        {/* Navigation */}
        {/* ------------------------------------------- */}
        <Navigation />

          {/* 인덱스 페이지가 아닌 경우에만 Navigation을 표시 */}
          <BodyContent className="body-content">
          {/* ------------------------------------------- */}
          {/* Sidebar */}
          {/* ------------------------------------------- */}
          {/* PageContent */}
          <Container className="page-content-wrapper">
            {/* ------------------------------------------- */}
            {/* PageContent */}
            {/* ------------------------------------------- */}

            <Box className="page-content-inner">
              {/* <Outlet /> */}
              {children}
              {/* <Index /> */}
            </Box>

            {/* ------------------------------------------- */}
            {/* End Page */}
            {/* ------------------------------------------- */}
          </Container>
        </BodyContent>
        <Footer />
      </BodyContainerInner>
    </BodyContainerWrapper>
  );
}

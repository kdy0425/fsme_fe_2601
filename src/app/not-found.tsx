"use client"
import { Box, Container, Typography, Button } from "@mui/material";
import Image from "next/image";
import Link from "next/link";

const NotFound = () => (
  <Box
    display="flex"
    flexDirection="column"
    height="100vh"
    textAlign="center"
    justifyContent="center"
  >
    <Container maxWidth="md">
      <Image
        src={"/images/backgrounds/errorimg.svg"}
        alt="에러이미지" width={200} height={200}
        style={{ width: "100%", maxWidth: "200px",  maxHeight: '200px' }}
      />
      <Typography align="center" variant="h1" mb={4}>
        404 에러입니다.
      </Typography>
      <Typography align="center" variant="h4" mb={4}>
        찾으시는 페이지를 찾을 수 없습니다.
      </Typography>
      <Button
        color="primary"
        variant="contained"
        component={Link}
        href="/"
        disableElevation
      >
        홈으로 돌아가기
      </Button>
    </Container>
  </Box>
);

export default NotFound;

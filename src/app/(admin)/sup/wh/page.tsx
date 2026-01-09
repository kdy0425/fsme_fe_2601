'use client'
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogProps,
  FormControlLabel,
  MenuItem,
  RadioGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@mui/material'
import BlankCard from '@/app/components/shared/BlankCard'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React, { useContext, useEffect, useState } from 'react'

import PageContainer from '@/components/container/PageContainer'
import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'

// utils
import {
  sendHttpFileRequest,
  sendHttpRequest,
} from '@/utils/fsms/common/apiUtils'

import UserAuthContext, {
  UserAuthInfo,
} from '@/app/components/context/UserAuthContext'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '업무지원',
  },
  {
    title: '업무일반',
  },
  {
    to: '/sup/wh',
    title: '업무도우미',
  },
]

type fileTsidInfo = {
  fileTsid: string
  fileSeq: string
  strgFileNm: string
  fileExtnNm: string
}

const DataList = () => {
  const router = useRouter() // 화면이동을 위한객체
  const pathname = usePathname()

  const { authInfo } = useContext(UserAuthContext)
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null) // null 초기값 설정
  const [fileTsidList, setFileTsidList] = useState<fileTsidInfo[]>([])
  const [isDownloading, setIsDownloading] = useState<boolean>(false)

  useEffect(() => {
    // authInfo에서 roles의 첫 번째 값이 "Admin"인지 확인
    if ('roles' in authInfo && Array.isArray(authInfo.roles)) {
      setIsAdmin(authInfo.roles[0] === 'ADMIN')
    }
  }, [authInfo])

  // 초기 데이터 로드
  useEffect(() => {
    getFileTsidList()
  }, [])

  const getFileTsidList = async () => {
    try {
      let endpoint: string = `/fsm${pathname}/setInitial`
      const response = await sendHttpRequest('GET', endpoint, undefined, true, {
        cache: 'no-store',
      })
      console.log(response)

      const { data, resultType, message } = response

      if (resultType !== 'success') {
        alert(message)
        return
      }

      setFileTsidList(
        data.map((value: any, index: number) => {
          return {
            fileTsid: value.fileTsid,
            fileSeq: value.fileSeq,
            strgFileNm: value.strgFileNm,
            fileExtnNm: value.fileExtnNm,
          }
        }),
      )
    } catch (error) {
      // 에러시
      console.error('Error fetching data:', error)
    } finally {
    }
  }

  // 파일다운로드 //
  const handleFileDown = async (seq: string) => {
    if (fileTsidList.length === 0) {
      alert('파일일련번호가 존재하지 않습니다.')
      return
    }

    const findIdx: number = fileTsidList.findIndex(
      (value: fileTsidInfo, index: number) => value.fileSeq === seq,
    )
    const { fileSeq, fileTsid, strgFileNm, fileExtnNm } = fileTsidList[findIdx]

    setIsDownloading(true)

    try {
      let endpoint: string = `/fsm${pathname}/getManual?fileTsid=${fileTsid}`
      const response = await sendHttpFileRequest(
        'GET',
        endpoint,
        undefined,
        true,
      )

      const url = window.URL.createObjectURL(response)
      const link = document.createElement('a')

      link.href = url
      link.setAttribute('download', `${strgFileNm}.${fileExtnNm}`)
      document.body.appendChild(link)
      link.click()

      window.URL.revokeObjectURL(url)
    } catch (error) {
      // 에러시
      console.error('Error fetching data:', error)
    } finally {
      setIsDownloading(false)
    }
  }

  // 페이지 이동 //
  const handleCartPubClick = (url: string) => {
    // useEffect 안에서 라우팅 기능을 실행
    router.push(url)
  }

  return (
    <PageContainer title="업무도우미" description="업무도우미">
      {/* breadcrumb */}
      <Breadcrumb title="업무도우미" items={BCrumb} />
      {/* end breadcrumb */}

      {/* 지침/규정/매뉴얼/교육자료 */}
      <BlankCard
        className="contents-card fit"
        title="지침/규정/매뉴얼/교육자료"
        sx={{ padding: '20px' }}
      >
        <TableContainer>
          <Table
            className="table table-bordered"
            style={{ tableLayout: 'fixed', width: '100%' }}
          >
            <TableBody>
              <TableRow>
                <TableCell
                  className="td-head"
                  style={{ width: '120px', verticalAlign: 'middle' }}
                >
                  버스
                </TableCell>
                <TableCell style={{ textAlign: 'left' }}>
                  <div style={{ display: 'inline-flex', gap: '20px' }}>
                    <Button
                      variant="outlined"
                      style={{ width: '120px' }}
                      onClick={() => handleFileDown('bs1')}
                    >
                      지급 지침
                    </Button>
                    <Button
                      variant="outlined"
                      style={{ width: '150px' }}
                      onClick={() => handleFileDown('bs2')}
                    >
                      교육 자료(25년 상반기)
                    </Button>
                    {/* <Button
                      variant="outlined"
                      style={{ width: '120px' }}
                      onClick={() => handleFileDown('bs2')}
                    >
                      시스템 매뉴얼
                    </Button>
                    <Button
                      variant="outlined"
                      style={{ width: '120px' }}
                      onClick={() => handleFileDown('bs3')}
                    >
                      제도 교육자료
                    </Button>
                    <Button
                      variant="outlined"
                      style={{ width: '120px' }}
                      onClick={() => handleFileDown('bs4')}
                    >
                      시스템 교육자료
                    </Button> */}
                  </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell
                  className="td-head"
                  style={{ width: '120px', verticalAlign: 'middle' }}
                >
                  택시
                </TableCell>
                <TableCell style={{ textAlign: 'left' }}>
                  <div style={{ display: 'inline-flex', gap: '20px' }}>
                    <Button
                      variant="outlined"
                      style={{ width: '120px' }}
                      onClick={() => handleFileDown('tx1')}
                    >
                      지급 지침
                    </Button>
                    <Button
                      variant="outlined"
                      style={{ width: '150px' }}
                      onClick={() => handleFileDown('tx2')}
                    >
                      교육 자료(25년 상반기)
                    </Button>
                    {/* <Button
                      variant="outlined"
                      style={{ width: '120px' }}
                      onClick={() => handleFileDown('tx2')}
                    >
                      시스템 매뉴얼
                    </Button>
                    <Button
                      variant="outlined"
                      style={{ width: '120px' }}
                      onClick={() => handleFileDown('tx3')}
                    >
                      제도 교육자료
                    </Button>
                    <Button
                      variant="outlined"
                      style={{ width: '120px' }}
                      onClick={() => handleFileDown('tx4')}
                    >
                      시스템 교육자료
                    </Button> */}
                  </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell
                  className="td-head"
                  style={{ width: '120px', verticalAlign: 'middle' }}
                >
                  화물
                </TableCell>
                <TableCell style={{ textAlign: 'left' }}>
                  <div style={{ display: 'inline-flex', gap: '20px' }}>
                    <Button
                      variant="outlined"
                      style={{ width: '120px' }}
                      onClick={() => handleFileDown('tr1')}
                    >
                      관리 규정
                    </Button>
                    <Button
                      variant="outlined"
                      style={{ width: '150px' }}
                      onClick={() => handleFileDown('tr2')}
                    >
                      교육 자료(25년 상반기)
                    </Button>
                    {/*
                    <Button
                      variant="outlined"
                      style={{ width: '120px' }}
                      onClick={() => handleFileDown('tr3')}
                    >
                      제도 교육자료
                    </Button>
                    <Button
                      variant="outlined"
                      style={{ width: '120px' }}
                      onClick={() => handleFileDown('tr4')}
                    >
                      시스템 교육자료
                    </Button> */}
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </BlankCard>

      {/* FAQ/Q&A 바로가기 */}
      <BlankCard className="contents-card fit" title="FAQ/Q&A 바로가기">
        <TableContainer>
          <Table
            className="table table-bordered"
            style={{ tableLayout: 'fixed', width: '100%' }}
          >
            <TableBody>
              <TableRow>
                <TableCell style={{ textAlign: 'left', padding: '20px' }}>
                  <div style={{ display: 'inline-flex', gap: '30px' }}>
                    <Button
                      variant="outlined"
                      style={{ width: '120px' }}
                      onClick={() => handleCartPubClick('./faq')}
                    >
                      FAQ
                    </Button>
                    <Button
                      variant="outlined"
                      style={{ width: '120px' }}
                      onClick={() => handleCartPubClick('./qna')}
                    >
                      Q&A
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </BlankCard>

      {/* 민원 및 시스템 문의 담당자 */}
      <BlankCard
        className="contents-card fit"
        title="민원 및 시스템 문의 담당자"
        sx={{ padding: '20px' }}
      >
        <TableContainer>
          <Table
            className="table table-bordered"
            style={{ tableLayout: 'fixed', width: '100%' }}
          >
            <TableBody>
              <TableRow>
                <TableCell
                  className="td-head"
                  style={{ width: '25%', verticalAlign: 'middle' }}
                ></TableCell>
                <TableCell
                  className="td-head"
                  style={{ width: '25%', verticalAlign: 'middle' }}
                >
                  버스
                </TableCell>
                <TableCell
                  className="td-head"
                  style={{ width: '25%', verticalAlign: 'middle' }}
                >
                  택시
                </TableCell>
                <TableCell
                  className="td-head"
                  style={{ width: '25%', verticalAlign: 'middle' }}
                >
                  화물
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell style={{ width: '25%', textAlign: 'center' }}>
                  민원 및 시스템 문의
                </TableCell>
                <TableCell style={{ width: '25%', paddingLeft: '10px' }}>
                  044-201-3831
                </TableCell>
                <TableCell style={{ width: '25%', paddingLeft: '10px' }}>
                  044-201-3831 <br></br>1833-6739
                </TableCell>
                <TableCell style={{ width: '25%', paddingLeft: '10px' }}>
                  1833-8236
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell style={{ width: '25%', textAlign: 'center' }}>
                  버스 RFID 및 시스템 문의
                </TableCell>
                <TableCell style={{ width: '25%', paddingLeft: '10px' }}>
                  070-7464-1357
                </TableCell>
                <TableCell
                  style={{ width: '25%', paddingLeft: '10px' }}
                ></TableCell>
                <TableCell
                  style={{ width: '25%', paddingLeft: '10px' }}
                ></TableCell>
              </TableRow>
              <TableRow>
                <TableCell style={{ width: '25%', textAlign: 'center' }}>
                  차주, 업체, 주유소 담당 콜센터
                </TableCell>
                <TableCell style={{ width: '25%', paddingLeft: '10px' }}>
                  1644-8487
                </TableCell>
                <TableCell style={{ width: '25%', paddingLeft: '10px' }}>
                  1566-8467
                </TableCell>
                <TableCell style={{ width: '25%', paddingLeft: '10px' }}>
                  1588-8713
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell style={{ width: '25%', textAlign: 'center' }}>
                  팩스
                </TableCell>
                <TableCell
                  colSpan={3}
                  style={{
                    width: '25%',
                    paddingLeft: '10px',
                    textAlign: 'center',
                  }}
                >
                  02-3444-6329
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </BlankCard>

      {/* 카드사 담당자 */}
      <BlankCard
        className="contents-card fit"
        title="카드사 담당자"
        sx={{ padding: '20px' }}
      >
        <TableContainer style={{ marginBottom: '1rem' }}>
          <Table
            className="table table-bordered"
            style={{ tableLayout: 'fixed', width: '100%' }}
          >
            <TableBody>
              <TableRow>
                <TableCell
                  rowSpan={2}
                  className="td-head"
                  style={{ width: '15%', verticalAlign: 'middle' }}
                ></TableCell>
                <TableCell
                  colSpan={4}
                  className="td-head"
                  style={{
                    width: '88%',
                    verticalAlign: 'middle',
                    fontWeight: '600',
                  }}
                >
                  버스
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell
                  className="td-head"
                  style={{ width: '12%', verticalAlign: 'middle' }}
                >
                  담당자
                </TableCell>
                <TableCell
                  className="td-head"
                  style={{ width: '22%', verticalAlign: 'middle' }}
                >
                  번호
                </TableCell>
                <TableCell
                  className="td-head"
                  style={{ width: '22%', verticalAlign: 'middle' }}
                >
                  팩스
                </TableCell>
                <TableCell
                  className="td-head"
                  style={{ width: '22%', verticalAlign: 'middle' }}
                >
                  콜센터
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell style={{ width: '12%', textAlign: 'center' }}>
                  KB국민카드
                </TableCell>
                <TableCell style={{ width: '22%', paddingLeft: '25px' }}>
                  최정미
                </TableCell>
                <TableCell style={{ width: '22%', paddingLeft: '25px' }}>
                  02-6936-2567
                </TableCell>
                <TableCell
                  style={{ width: '22%', paddingLeft: '25px' }}
                ></TableCell>
                <TableCell
                  style={{ width: '22%', paddingLeft: '25px' }}
                ></TableCell>
              </TableRow>
              <TableRow>
                <TableCell style={{ width: '12%', textAlign: 'center' }}>
                  우리카드
                </TableCell>
                <TableCell style={{ width: '22%', paddingLeft: '25px' }}>
                  김지영
                </TableCell>
                <TableCell style={{ width: '22%', paddingLeft: '25px' }}>
                  02-6968-3028
                </TableCell>
                <TableCell
                  style={{ width: '22%', paddingLeft: '25px' }}
                ></TableCell>
                <TableCell
                  style={{ width: '22%', paddingLeft: '25px' }}
                ></TableCell>
              </TableRow>
              <TableRow>
                <TableCell style={{ width: '12%', textAlign: 'center' }}>
                  신한카드
                </TableCell>
                <TableCell style={{ width: '22%', paddingLeft: '25px' }}>
                  유니
                </TableCell>
                <TableCell style={{ width: '22%', paddingLeft: '25px' }}>
                  02-6950-7826
                </TableCell>
                <TableCell
                  style={{ width: '22%', paddingLeft: '25px' }}
                ></TableCell>
                <TableCell
                  style={{ width: '22%', paddingLeft: '25px' }}
                ></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        <TableContainer style={{ marginBottom: '1rem' }}>
          <Table
            className="table table-bordered"
            style={{ tableLayout: 'fixed', width: '100%' }}
          >
            <TableBody>
              <TableRow>
                <TableCell
                  rowSpan={2}
                  className="td-head"
                  style={{ width: '15%', verticalAlign: 'middle' }}
                ></TableCell>
                <TableCell
                  colSpan={4}
                  className="td-head"
                  style={{
                    width: '88%',
                    verticalAlign: 'middle',
                    fontWeight: '600',
                  }}
                >
                  택시
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell
                  className="td-head"
                  style={{ width: '12%', verticalAlign: 'middle' }}
                >
                  담당자
                </TableCell>
                <TableCell
                  className="td-head"
                  style={{ width: '22%', verticalAlign: 'middle' }}
                >
                  번호
                </TableCell>
                <TableCell
                  className="td-head"
                  style={{ width: '22%', verticalAlign: 'middle' }}
                >
                  팩스
                </TableCell>
                <TableCell
                  className="td-head"
                  style={{ width: '22%', verticalAlign: 'middle' }}
                >
                  콜센터
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell style={{ width: '12%', textAlign: 'center' }}>
                  롯데카드
                </TableCell>
                <TableCell style={{ width: '22%', paddingLeft: '25px' }}>
                  손성실(개인)
                  <br />
                  김명근(법인)
                </TableCell>
                <TableCell style={{ width: '22%', paddingLeft: '25px' }}>
                  02-2050-1962
                  <br />
                  02-2050-1958
                </TableCell>
                <TableCell style={{ width: '22%', paddingLeft: '25px' }}>
                  02-2050-1074
                </TableCell>
                <TableCell
                  style={{ width: '22%', paddingLeft: '25px' }}
                ></TableCell>
              </TableRow>
              <TableRow>
                <TableCell style={{ width: '12%', textAlign: 'center' }}>
                  신한카드
                </TableCell>
                <TableCell style={{ width: '22%', paddingLeft: '25px' }}>
                  김세정(개인)<br></br>유니(법인)
                </TableCell>
                <TableCell style={{ width: '22%', paddingLeft: '25px' }}>
                  02-6950-1063<br></br>02-6950-7826
                </TableCell>
                <TableCell style={{ width: '22%', paddingLeft: '25px' }}>
                  02-6717-8316<br></br>0505-159-0535
                </TableCell>
                <TableCell
                  style={{ width: '22%', paddingLeft: '25px' }}
                ></TableCell>
              </TableRow>
              <TableRow>
                <TableCell style={{ width: '12%', textAlign: 'center' }}>
                  현대카드
                </TableCell>
                <TableCell style={{ width: '22%', paddingLeft: '25px' }}>
                  권효진<br></br>홍유진<br></br>제다솜(정산)
                </TableCell>
                <TableCell style={{ width: '22%', paddingLeft: '25px' }}>
                  02-2167-6753(권효진)<br></br>02-2167-8083(홍유진)<br></br>
                  02-2167-7629(제다솜)
                </TableCell>
                <TableCell style={{ width: '22%', paddingLeft: '25px' }}>
                  0505-127-3137
                </TableCell>
                <TableCell
                  style={{ width: '22%', paddingLeft: '25px' }}
                ></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        <TableContainer style={{ marginBottom: '1rem' }}>
          <Table
            className="table table-bordered"
            style={{ tableLayout: 'fixed', width: '100%' }}
          >
            <TableBody>
              <TableRow>
                <TableCell
                  rowSpan={2}
                  className="td-head"
                  style={{ width: '15%', verticalAlign: 'middle' }}
                ></TableCell>
                <TableCell
                  colSpan={4}
                  className="td-head"
                  style={{
                    width: '88%',
                    verticalAlign: 'middle',
                    fontWeight: '600',
                  }}
                >
                  화물
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell
                  className="td-head"
                  style={{ width: '12%', verticalAlign: 'middle' }}
                >
                  담당자
                </TableCell>
                <TableCell
                  className="td-head"
                  style={{ width: '22%', verticalAlign: 'middle' }}
                >
                  번호
                </TableCell>
                <TableCell
                  className="td-head"
                  style={{ width: '22%', verticalAlign: 'middle' }}
                >
                  팩스
                </TableCell>
                <TableCell
                  className="td-head"
                  style={{ width: '22%', verticalAlign: 'middle' }}
                >
                  콜센터
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell style={{ width: '12%', textAlign: 'center' }}>
                  KB국민카드
                </TableCell>
                <TableCell style={{ width: '22%', paddingLeft: '25px' }}>
                  최정미
                </TableCell>
                <TableCell style={{ width: '22%', paddingLeft: '25px' }}>
                  02-6936-2567
                </TableCell>
                <TableCell style={{ width: '22%', paddingLeft: '25px' }}>
                  02-6936-3437
                </TableCell>
                <TableCell style={{ width: '22%', paddingLeft: '25px' }}>
                  1599-7900
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell style={{ width: '12%', textAlign: 'center' }}>
                  우리카드
                </TableCell>
                <TableCell style={{ width: '22%', paddingLeft: '25px' }}>
                  정은경(소급)<br></br>고나연
                </TableCell>
                <TableCell style={{ width: '22%', paddingLeft: '25px' }}>
                  02-6968-3122(정은경)<br></br>
                  02-6968-3459(고나연)
                </TableCell>
                <TableCell style={{ width: '22%', paddingLeft: '25px' }}>
                  0505-001-8786
                </TableCell>
                <TableCell style={{ width: '22%', paddingLeft: '25px' }}>
                  1588-9955
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell style={{ width: '12%', textAlign: 'center' }}>
                  삼성카드
                </TableCell>
                <TableCell style={{ width: '22%', paddingLeft: '25px' }}>
                  김주영
                </TableCell>
                <TableCell style={{ width: '22%', paddingLeft: '25px' }}>
                  02-2172-8362
                </TableCell>
                <TableCell style={{ width: '22%', paddingLeft: '25px' }}>
                  02-2172-8032
                </TableCell>
                <TableCell style={{ width: '22%', paddingLeft: '25px' }}>
                  1588-8700
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell style={{ width: '12%', textAlign: 'center' }}>
                  신한카드
                </TableCell>
                <TableCell style={{ width: '22%', paddingLeft: '25px' }}>
                  김세정
                </TableCell>
                <TableCell style={{ width: '22%', paddingLeft: '25px' }}>
                  02-6950-1063
                </TableCell>
                <TableCell style={{ width: '22%', paddingLeft: '25px' }}>
                  02-6717-8316
                </TableCell>
                <TableCell style={{ width: '22%', paddingLeft: '25px' }}>
                  1544-7000
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell style={{ width: '12%', textAlign: 'center' }}>
                  현대카드
                </TableCell>
                <TableCell style={{ width: '22%', paddingLeft: '25px' }}>
                  권효진<br></br>
                  홍유진<br></br>
                  제다솜(정산)
                </TableCell>
                <TableCell style={{ width: '22%', paddingLeft: '25px' }}>
                  02-2167-6753(권효진)<br></br>
                  02-2167-8083(홍유진)<br></br>
                  02-2167-7629(제다솜)
                </TableCell>
                <TableCell style={{ width: '22%', paddingLeft: '25px' }}>
                  02-2172-8362
                </TableCell>
                <TableCell
                  style={{ width: '22%', paddingLeft: '25px' }}
                ></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </BlankCard>
      <LoadingBackdrop open={isDownloading} />
    </PageContainer>
  )
}

export default DataList

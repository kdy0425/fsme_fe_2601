"use client"
import {useState, useEffect, useRef} from "react"
import { isEmpty } from "lodash"
import { useDispatch       } from "@/store/hooks"
import { useSearchParams   } from "next/navigation"
import { useMessageActions } from "@/store/MessageContext"

import { sendHttpRequest, sendSearchHttpRequest } from "@/utils/fsms/common/apiUtils"
import { setSearchCategoryCount                 } from "@/store/search/SearchSlice"
import { getAuthInfo                            } from "@/utils/fsms/fsm/utils-imports"

import PageContainer         from "@/components/container/PageContainer"
import Loading               from "@/app/loading"
import NoticeSection         from "./_components/NoticeSection"
import DataSection           from "./_components/DataSection"
import FaqSection            from "./_components/FaqSection"
import QnaSection            from "./_components/QnaSection"
import ComplSection          from "./_components/ComplSection"
import LawSection            from "./_components/LawSection"
import WorkSection           from "./_components/WorkSection"
import MenuSection           from "./_components/MenuSection"

import RetSection            from "./_components/RetSection"
import NoticeModifyDialog    from "@/app/(admin)/sup/notice/_components/ModifyDialog"
import RecroomModifyDialog   from "@/app/(admin)/sup/recroom/_components/ModifyDialog"
import FaqModifyDialog       from "@/app/(admin)/sup/faq/_components/ModifyDialog"
import QnaModifyDialog       from "@/app/(admin)/sup/qna/_components/ModifyDialog"
import ComplModifyDialog     from "@/app/(admin)/sup/cc/_components/ModifyDialog"
import LawModifyDialog       from "@/app/(admin)/sup/lrc/_components/ModifyDialog"
import WorkModifyDialog      from "@/app/(admin)/sup/jr/_components/ModifyDialog"
import RetModifyDialog       from "@/app/(admin)/sup/rr/_components/ModifyDialog"

import SearchCategorySection from "../_components/SearchCategorySection"
import NoData                from "../_components/NoData"
import NoSearchWord          from "../_components/NoSearchWord"

import { Row                            } from "@/app/(admin)/sup/rr/page"
import { Notice                         } from "@/types/main/main"
import { ResultDocument, SearchResponse } from "@/types/unify/unify"
import { SearchType, UnifySearch        } from "@/types/unify/unify"

interface UserData {
  userTsid: string
  locgovCd: string
  userAuths: UserType[]
}
interface UserType {
  userTypeCd: string
}

const getUserData = async (lgnId: string) => {
  try {
    let endpoint: string = `/fsm/cmm/cmmn/cm/getOneUser?lgnId=${lgnId}`

    const response = await sendHttpRequest('GET', endpoint, null, true, {
      cache: 'no-store',
    })

    if (response && response.resultType === 'success' && response.data) {
      return response.data
    }
  } catch (error) {
    console.error('ERROR ::: ', error)
  }
}

export default function Main() {
  const dispatch = useDispatch()
  const querys = useSearchParams()
  const section: any = useRef(null);
  const { setMessage } = useMessageActions()
  const allParams: UnifySearch = Object.fromEntries(querys.entries())

  const [loading, setLoading]                        = useState(false)
  const [bbscttSn, setBbscttSn]                      = useState(0)
  const [type, setType]                              = useState('')
  const [rtroactDmndTsid, setRtroactDmndTsid]        = useState('')
  const [totalCount, setTotalCount]                  = useState(-1)
  const [detailMoalFlag, setDetailModalFlag]         = useState(false)
  const [selectedNoticeData, setSelectedNoticeData] = useState<Notice | null>(null)
  const [selectedRefData, setSelectedRefData]        = useState<Notice| null>(null)
  const [selectedFaqData, setSelectedFaqData]        = useState<Notice| null>(null)
  const [selectedQnaData, setSelectedQnaData]        = useState<Notice| null>(null)
  const [selectedComplData, setSelectedComplData]    = useState<Notice| null>(null)
  const [selectedLawData, setSelectedLawData]        = useState<Notice| null>(null)
  const [selectedWorkData, setSelectedWorkData]      = useState<Notice| null>(null)
  const [selectedRetData, setSelectedRetData]        = useState<Row| null>(null)
  const [notice,  setNotice ]                        = useState<ResultDocument[]>([]);
  const [refData, setRefData]                        = useState<ResultDocument[]>([]);
  const [faq,     setFaq    ]                        = useState<ResultDocument[]>([]);
  const [qna,     setQna    ]                        = useState<ResultDocument[]>([]);
  const [compl,   setCompl  ]                        = useState<ResultDocument[]>([]);
  const [law,     setLaw    ]                        = useState<ResultDocument[]>([]);
  const [work,    setWork   ]                        = useState<ResultDocument[]>([]);
  const [menu,    setMenu   ]                        = useState<ResultDocument[]>([]);
  const [ret,     setRet    ]                        = useState<ResultDocument[]>([]);
  const [queryString, setQueryString]                = useState("")

  useEffect(() => {
    const filteredElements = Array.from(section.current.children).filter((item: any) => {
      return item.classList.contains('search-section'); // 조건 반환
    });
    
    const element:HTMLDivElement = filteredElements[0] as HTMLDivElement
    
    if(!isEmpty(element)) {
      element.style.border = "none"
      element.style.paddingTop = "0"
    }        
  }, [totalCount])

  useEffect(() => {    
    const queryString = new URLSearchParams(allParams as Record<string, string>).toString();
    setQueryString(queryString);
    fecthSearchData(queryString)
  }, [querys])

  const handleDetailCloseModal = () => {
    setDetailModalFlag((prev) => false)
    handleDetailDataReset()
  }

  const handleDetailDataReset = () => {
    setSelectedNoticeData(null)
    setSelectedRefData(null)
    setSelectedFaqData(null)
    setSelectedQnaData(null)
    setSelectedComplData(null)
    setSelectedLawData(null)
    setSelectedWorkData(null)
    setSelectedRetData(null)
  }

  const handleSelected = (bbscttsn: string, type: string) => {
    fetchDetailData(Number(bbscttsn), type)
  }

  const handleRetSelected = (rtroactDmndTsid: string) => {
    fetchRetDetailData(rtroactDmndTsid)
  }

  const handleReload = () => {
    fetchDetailData(Number(bbscttSn), type)
  }

  const handleRetReload = () => {
    fetchRetDetailData(rtroactDmndTsid)
  }

  const fecthSearchData = async (queryString: string) => {
    if(!isEmpty(allParams.searchWord)) {
      const authInfo = await getAuthInfo()
      const userData: UserData = await getUserData(authInfo.authSttus.lgnId)
      const menuCd = userData.userAuths.map((item) => item.userTypeCd).join("|")
      try {
        setLoading(true)
        let endpoint: string = `/extensions/TotalSearch?${queryString}&userCd=${userData?.userTsid}&menuCd=${menuCd}&locgovCd=${userData?.locgovCd}`;
        const response: SearchResponse = await sendSearchHttpRequest('GET', endpoint, null, {
          cache: 'no-stroe'
        })
      
        setNotice(response.resultSet?.result[0]?.resultDocuments || []);
        setRefData(response.resultSet?.result[1]?.resultDocuments || []);
        setFaq(response.resultSet?.result[2]?.resultDocuments || []);
        setQna(response.resultSet?.result[3]?.resultDocuments || [])
        setCompl(response.resultSet?.result[4]?.resultDocuments || []);
        setLaw(response.resultSet?.result[5]?.resultDocuments || []);
        setWork(response.resultSet?.result[6]?.resultDocuments || []);
        setMenu(response.resultSet?.result[7]?.resultDocuments || []);
        setRet(response.resultSet?.result[8]?.resultDocuments || []);

        const categoryCount = {
          noticeTotalCount: response.resultSet?.result[0].totalSize,
          refTotalCount: response.resultSet?.result[1].totalSize,
          faqTotalCount: response.resultSet?.result[2].totalSize,
          qnaTotalCount: response.resultSet?.result[3].totalSize,
          complTotalCount: response.resultSet?.result[4].totalSize,
          lawTotalCount: response.resultSet?.result[5].totalSize,
          workTotalCount: response.resultSet?.result[6].totalSize,
          menuTotalCount: response.resultSet?.result[7].totalSize,
          retTotalCount: response.resultSet?.result[8].totalSize
        }
        dispatch(setSearchCategoryCount({
          ...categoryCount
        }))

        const categoryCountSum =  () => {
          return Number(Object.values(categoryCount).reduce((sum, value) => Number(sum) + Number(value), 0));
      }
        setTotalCount(categoryCountSum())
      } catch(error: any) {
          if(error.status === 500) {
            setMessage({
              resultType: 'error',
              status: error.status,
              message: error?.message,
            })
          } else {
            setMessage({
              resultType: 'error',
              status: 500,
              message: '시스템 관리자에게 문의 하세요.',
            })
          }
      } finally {
        setLoading(false)
      }
    }
  }

  const fetchDetailData = async (bbscttSn: number, type: string) => {
    try {
      setBbscttSn(bbscttSn)
      setType(type)
      let boardType: string = ''
      switch(type) {
        case SearchType.notice: boardType = 'notice'
        break
        case SearchType.ref: boardType = 'recroom'
        break;
        case SearchType.faq: boardType = 'faq'
        break;
        case SearchType.qna: boardType = 'qna'
        break;
        case SearchType.compl: boardType = 'cc'
        break;
        case SearchType.law: boardType = 'lrc'
        break;
        case SearchType.work: boardType = 'jr'
        break;
      }

      let endpoint: string = `/fsm/sup/${boardType}/${bbscttSn}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        const data:Notice = response.data
        switch(type) {
          case SearchType.notice: setSelectedNoticeData(data)
          break;
          case SearchType.ref: setSelectedRefData(data)
          break;
          case SearchType.faq: setSelectedFaqData(data)
          break;
          case SearchType.qna: setSelectedQnaData(data)
          break;
          case SearchType.compl: setSelectedComplData(data)
          break;
          case SearchType.law: setSelectedLawData(data)
          break;
          case SearchType.work: setSelectedWorkData(data)
          break;
        }
        setDetailModalFlag(true)
      } else {
        console.log('선택된 데이터가 없습니다. ',response)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
    }
  }

  const fetchRetDetailData = async (rtroactDmndTsid: string) => {
    try {
      setRtroactDmndTsid(rtroactDmndTsid)
      let endpoint: string = `/fsm/sup/rr/getAllRtroactReq/${rtroactDmndTsid}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        const data:Row = response.data
        setSelectedRetData(data)
        setDetailModalFlag(true)
      } else {
        console.log('선택된 데이터가 없습니다. ',response)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
    }
  }

  return (
    <PageContainer title="Main" description="메인페이지">

      <div className="search-total-wrapper">

        {/* 내용 시작 */}
        <div className="content-wrapper" ref={section}>
          <SearchCategorySection/>
          {!loading ? (
          <>
            { isEmpty(allParams.searchWord)  && totalCount === -1 && <NoSearchWord/>}
            {totalCount == 0 && !isEmpty(allParams.searchWord) && <NoData/>}
            {totalCount > 0 && (
            <>
              {notice.length > 0 && <NoticeSection queryString={queryString} notice={notice} handleSelected={handleSelected}/>}

              {refData.length > 0 && <DataSection queryString={queryString} refData={refData} handleSelected={handleSelected}/>}
              
              {faq.length > 0 && <FaqSection queryString={queryString} faq={faq} handleSelected={handleSelected}/>}

              {qna.length > 0 && <QnaSection queryString={queryString} qna={qna} handleSelected={handleSelected}/>}

              {compl.length > 0 && <ComplSection queryString={queryString} compl={compl} handleSelected={handleSelected}/>}

              {law.length > 0 && <LawSection queryString={queryString} law={law} handleSelected={handleSelected}/>}

              {work.length > 0 && <WorkSection queryString={queryString} work={work} handleSelected={handleSelected}/>}

              {menu.length > 0 && <MenuSection queryString={queryString} menu={menu}/>}

              {ret.length > 0 && <RetSection queryString={queryString} ret={ret} handleRetSelected={handleRetSelected}/>}
            </>
            )}
          </>
          ) :  <Loading/>}
        </div>
        {/* 내용 끝 */}

        {detailMoalFlag && selectedNoticeData && (
          <NoticeModifyDialog
            size="lg"
            title="공지사항"
            reloadFunc={handleReload}
            handleDetailCloseModal={handleDetailCloseModal}
            selectedRow={selectedNoticeData}
            open={detailMoalFlag}
          ></NoticeModifyDialog>
        )}{' '}

        {detailMoalFlag && selectedRefData && (
          <RecroomModifyDialog
            size="lg"
            title="자료실"
            reloadFunc={handleReload}
            handleDetailCloseModal={handleDetailCloseModal}
            selectedRow={selectedRefData}
            open={detailMoalFlag}
          ></RecroomModifyDialog>
        )}{' '}

        {detailMoalFlag && selectedFaqData && (
          <FaqModifyDialog
            size="lg"
            title="자주하는 질문"
            reloadFunc={handleReload}
            handleDetailCloseModal={handleDetailCloseModal}
            selectedRow={selectedFaqData}
            open={detailMoalFlag}
          ></FaqModifyDialog>
        )}{' '}

        {detailMoalFlag && selectedQnaData && (
          <QnaModifyDialog
            size="lg"
            title="Q & A"
            reloadFunc={handleReload}
            handleDetailCloseModal={handleDetailCloseModal}
            selectedRow={selectedQnaData}
            open={detailMoalFlag}
          ></QnaModifyDialog>
        )}{' '}

        {detailMoalFlag && selectedComplData && (
          <ComplModifyDialog
            size="lg"
            title="민원처리 사례"
            reloadFunc={handleReload}
            handleDetailCloseModal={handleDetailCloseModal}
            selectedRow={selectedComplData}
            open={detailMoalFlag}
          ></ComplModifyDialog>
        )}{' '}

        {detailMoalFlag && selectedLawData && (
          <LawModifyDialog
            size="lg"
            title="소송/심판 사례"
            reloadFunc={handleReload}
            handleDetailCloseModal={handleDetailCloseModal}
            selectedRow={selectedLawData}
            open={detailMoalFlag}
          ></LawModifyDialog>
        )}{' '}

        {detailMoalFlag && selectedWorkData && (
          <WorkModifyDialog
            size="lg"
            title="업무요청"
            reloadFunc={handleReload}
            handleDetailCloseModal={handleDetailCloseModal}
            selectedRow={selectedWorkData}
            open={detailMoalFlag}
          ></WorkModifyDialog>
        )}{' '}

        {detailMoalFlag && selectedRetData && (
          <RetModifyDialog
            size="lg"
            title="소급요청"
            reloadFunc={handleRetReload}
            handleDetailCloseModal={handleDetailCloseModal}
            selectedRow={selectedRetData}
            open={detailMoalFlag}
          ></RetModifyDialog>
        )}{' '}

      </div>
    </PageContainer>
  );
}
"use client"
import { useState, useEffect          } from "react"
import { isEmpty                      } from "lodash"
import { useDispatch, useSelector     } from "@/store/hooks"
import { AppState                     } from "@/store/store"
import { useSearchParams, useRouter   } from "next/navigation"
import { useMessageActions            } from "@/store/MessageContext"

import { sendHttpRequest, sendSearchHttpRequest } from "@/utils/fsms/common/apiUtils"
import { setSearchCategoryCount                 } from "@/store/search/SearchSlice"
import { getAuthInfo                            } from "@/utils/fsms/fsm/utils-imports"

import PageContainer         from "@/components/container/PageContainer"
import { Pagination }        from "@mui/material"
import NoticeModifyDialog    from "@/app/(admin)/sup/notice/_components/ModifyDialog"
import RecroomModifyDialog   from "@/app/(admin)/sup/recroom/_components/ModifyDialog"
import FaqModifyDialog       from "@/app/(admin)/sup/faq/_components/ModifyDialog"
import QnaModifyDialog       from "@/app/(admin)/sup/qna/_components/ModifyDialog"
import ComplModifyDialog     from "@/app/(admin)/sup/cc/_components/ModifyDialog"
import LawModifyDialog       from "@/app/(admin)/sup/lrc/_components/ModifyDialog"
import WorkModifyDialog      from "@/app/(admin)/sup/jr/_components/ModifyDialog"
import RetModifyDialog       from "@/app/(admin)/sup/rr/_components/ModifyDialog"

import SearchCategorySection from "../_components/SearchCategorySection"
import NoticeList            from "./_components/NoticeList"
import DataList              from "./_components/DataList"
import FaqList               from "./_components/FaqList"
import QnaList               from "./_components/QnaList"
import ComplList             from "./_components/ComplList"
import LawList               from "./_components/LawList"
import WorkList              from "./_components/WorkList"
import MenuList              from "./_components/MenuList"
import RetList               from "./_components/RetList"
import NoData                from "../_components/NoData"
import NoSearchWord          from "../_components/NoSearchWord"

import { Row                                                     } from "@/app/(admin)/sup/rr/page"
import { Notice                                                  } from "@/types/main/main"
import { ResultDocument, SearchResponse, SearchType, UnifySearch } from "@/types/unify/unify"

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
  const querys         = useSearchParams()
  const router         = useRouter()
  const dispatch       = useDispatch()
  const { setMessage } = useMessageActions()
  const searchCategory = useSelector((state: AppState) => state.searchCategory)
  const allParams: UnifySearch = Object.fromEntries(querys.entries())
  
  const [params, setParams] = useState<UnifySearch>({
      searchWord: allParams.searchWord ?? '',
      currentPage: allParams.currentPage ?? 1
  })

  const [loading, setLoading  ]                     = useState(false)
  const [bbscttSn, setBbscttSn]                     = useState(0)
  const [type, setType]                             = useState('')
  const [rtroactDmndTsid, setRtroactDmndTsid]       = useState('')
  const [totalPageSize, setTotalPageSize]           = useState(0)
  const [totalCount, setTotalCount]                 = useState(-1)
  const [detailMoalFlag, setDetailModalFlag]        = useState(false)
  const [selectedNoticeData, setSelectedNoticeData] = useState<Notice | null>(null)
  const [selectedRefData, setSelectedRefData]       = useState<Notice| null>(null)
  const [selectedFaqData, setSelectedFaqData]       = useState<Notice| null>(null)
  const [selectedQnaData, setSelectedQnaData]       = useState<Notice| null>(null)
  const [selectedComplData, setSelectedComplData]   = useState<Notice| null>(null)
  const [selectedLawData, setSelectedLawData]       = useState<Notice| null>(null)
  const [selectedWorkData, setSelectedWorkData]     = useState<Notice| null>(null)
  const [selectedRetData, setSelectedRetData]       = useState<Row| null>(null)
  const [notice,  setNotice ]                       = useState<ResultDocument[]>([])
  const [refData, setRefData]                       = useState<ResultDocument[]>([])
  const [faq,     setFaq    ]                       = useState<ResultDocument[]>([])
  const [qna,     setQna    ]                       = useState<ResultDocument[]>([])
  const [compl,   setCompl  ]                       = useState<ResultDocument[]>([])
  const [law,     setLaw    ]                       = useState<ResultDocument[]>([])
  const [work,    setWork   ]                       = useState<ResultDocument[]>([])
  const [menu,    setMenu   ]                       = useState<ResultDocument[]>([])
  const [ret,     setRet    ]                       = useState<ResultDocument[]>([])
  
  useEffect(() => {
    const queryString = new URLSearchParams(allParams as Record<string, string>).toString();
    setParams((prev) => ({
        ...prev,
        currentPage: allParams.currentPage ?? 1
    }))
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

  const handleSelected = (bbscttSn: string, type: string) => {
      fetchDetailData( Number(bbscttSn), type)
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
      const userData:UserData = await getUserData(authInfo.authSttus.lgnId)
      const menuCd = userData.userAuths.map((item) => item.userTypeCd).join("|")
      
      try {
        setLoading(true)
        console.log(encodeURIComponent(queryString));
        
        let endpoint: string = `/extensions/TotalSearch?${queryString}&userCd=${userData?.userTsid}&menuCd=${menuCd}&locgovCd=${userData?.locgovCd}`;
        const response: SearchResponse = await sendSearchHttpRequest('GET', endpoint, null, {
          cache: 'no-stroe'
        })
        console.dir(response)
        switch(allParams.searchMenu) {
          case (SearchType.notice): setNotice(response.resultSet?.result[0]?.resultDocuments || []);
          dispatch(setSearchCategoryCount({
            ...searchCategory,                                         
            noticeTotalCount: response.resultSet?.result[0].totalSize,
          }))
          break
          case (SearchType.ref): setRefData(response.resultSet?.result[0]?.resultDocuments || []);
          dispatch(setSearchCategoryCount({
            ...searchCategory,                                         
            refTotalCount: response.resultSet?.result[0].totalSize,
          }))
          break
          case (SearchType.faq): setFaq(response.resultSet?.result[0]?.resultDocuments || []);
          dispatch(setSearchCategoryCount({
            ...searchCategory,                                         
            faqTotalCount: response.resultSet?.result[0].totalSize,
          }))
          break
          case (SearchType.qna): setQna(response.resultSet?.result[0]?.resultDocuments || []);
          dispatch(setSearchCategoryCount({
            ...searchCategory,                                         
            qnaTotalCount: response.resultSet?.result[0].totalSize,
          }))
          break
          case (SearchType.compl): setCompl(response.resultSet?.result[0]?.resultDocuments || []);
          dispatch(setSearchCategoryCount({
            ...searchCategory,                                         
            complTotalCount: response.resultSet?.result[0].totalSize,
          }))
          break
          case (SearchType.law): setLaw(response.resultSet?.result[0]?.resultDocuments || []);
          dispatch(setSearchCategoryCount({
            ...searchCategory,                                         
            lawTotalCount: response.resultSet?.result[0].totalSize,
          }))
          break
          case (SearchType.work): setWork(response.resultSet?.result[0]?.resultDocuments || []);
          dispatch(setSearchCategoryCount({
            ...searchCategory,                                         
            workTotalCount: response.resultSet?.result[0].totalSize,
          }))
          break
          case (SearchType.menu): setMenu(response.resultSet?.result[0]?.resultDocuments || []);
          dispatch(setSearchCategoryCount({
            ...searchCategory,                                         
            menuTotalCount: response.resultSet?.result[0].totalSize,
          }))
          break
          case (SearchType.ret): setRet(response.resultSet?.result[0]?.resultDocuments || []);
          dispatch(setSearchCategoryCount({
            ...searchCategory,                                         
            retTotalCount: response.resultSet?.result[0].totalSize,
          }))
          break
        }
        setTotalCount(Number(response.resultSet?.result[0].totalSize))
        const totalPageSize = Math.ceil(Number(response.resultSet?.result[0].totalSize) / 10);
        setTotalPageSize(totalPageSize)
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
    }
  }

  const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
    const searchParams = new URLSearchParams(allParams as Record<string, string>)
    searchParams.set("currentPage", value.toString())
    setParams((prev) => ({...prev, currentPage: value}));
    router.push(`/unify/searchList?${searchParams.toString()}`)
  }

  return (
    <PageContainer title="Main" description="메인페이지">

      <div className="search-total-wrapper">

        <div className="content-wrapper">
          <>
            <SearchCategorySection/>
            { isEmpty(allParams.searchWord)  && totalCount === -1 && <NoSearchWord/>}
            { !isEmpty(allParams.searchWord)  && totalCount === 0 && <NoData/>}
            {
              totalCount > 0 && (
                <>
                  {allParams.searchMenu === SearchType.notice && <NoticeList notice={notice} loading={loading} handleSelected={handleSelected} />}
                  {allParams.searchMenu === SearchType.ref    && <DataList refData={refData} loading={loading} handleSelected={handleSelected} />}
                  {allParams.searchMenu === SearchType.faq    && <FaqList faq={faq} loading={loading} handleSelected={handleSelected} />}
                  {allParams.searchMenu === SearchType.qna    && <QnaList qna={qna} loading={loading} handleSelected={handleSelected} />}
                  {allParams.searchMenu === SearchType.compl  && <ComplList compl={compl} loading={loading} handleSelected={handleSelected} />}
                  {allParams.searchMenu === SearchType.law    && <LawList law={law} loading={loading} handleSelected={handleSelected} />}
                  {allParams.searchMenu === SearchType.work   && <WorkList work={work} loading={loading} handleSelected={handleSelected} />}
                  {allParams.searchMenu === SearchType.menu   && <MenuList menu={menu} loading={loading} />}
                  {allParams.searchMenu === SearchType.ret    && <RetList ret={ret} loading={loading} handleRetSelected={handleRetSelected} />}
                  {totalCount >  0 &&
                  <div className="pagination-wrapper">
                    <Pagination  variant="outlined" showFirstButton showLastButton page={Number(params.currentPage)} onChange={handleChange} count={totalPageSize}/>
                  </div>
                  }
                </>
              )}
          </>
        </div>
        {detailMoalFlag && selectedNoticeData && (
          <NoticeModifyDialog
            size="lg"
            title="공지사항"
            reloadFunc={handleReload}
            handleDetailCloseModal={handleDetailCloseModal}
            selectedRow={selectedNoticeData}
            open={detailMoalFlag}
          ></NoticeModifyDialog>
        )}

        {detailMoalFlag && selectedRefData && (
          <RecroomModifyDialog
            size="lg"
            title="자료실"
            reloadFunc={handleReload}
            handleDetailCloseModal={handleDetailCloseModal}
            selectedRow={selectedRefData}
            open={detailMoalFlag}
          ></RecroomModifyDialog>
        )}

        {detailMoalFlag && selectedFaqData && (
          <FaqModifyDialog
            size="lg"
            title="자주하는 질문"
            reloadFunc={handleReload}
            handleDetailCloseModal={handleDetailCloseModal}
            selectedRow={selectedFaqData}
            open={detailMoalFlag}
          ></FaqModifyDialog>
        )}

        {detailMoalFlag && selectedQnaData && (
          <QnaModifyDialog
            size="lg"
            title="Q & A"
            reloadFunc={handleReload}
            handleDetailCloseModal={handleDetailCloseModal}
            selectedRow={selectedQnaData}
            open={detailMoalFlag}
          ></QnaModifyDialog>
        )}

        {detailMoalFlag && selectedComplData && (
          <ComplModifyDialog
            size="lg"
            title="민원처리 사례"
            reloadFunc={handleReload}
            handleDetailCloseModal={handleDetailCloseModal}
            selectedRow={selectedComplData}
            open={detailMoalFlag}
          ></ComplModifyDialog>
        )}

        {detailMoalFlag && selectedLawData && (
          <LawModifyDialog
            size="lg"
            title="소송/심판 사례"
            reloadFunc={handleReload}
            handleDetailCloseModal={handleDetailCloseModal}
            selectedRow={selectedLawData}
            open={detailMoalFlag}
          ></LawModifyDialog>
        )}

        {detailMoalFlag && selectedWorkData && (
          <WorkModifyDialog
            size="lg"
            title="업무요청"
            reloadFunc={handleReload}
            handleDetailCloseModal={handleDetailCloseModal}
            selectedRow={selectedWorkData}
            open={detailMoalFlag}
          ></WorkModifyDialog>
        )}

        {detailMoalFlag && selectedRetData && (
          <RetModifyDialog
            size="lg"
            title="소급요청"
            reloadFunc={handleRetReload}
            handleDetailCloseModal={handleDetailCloseModal}
            selectedRow={selectedRetData}
            open={detailMoalFlag}
          ></RetModifyDialog>
        )}
      </div>
    </PageContainer>
  );
}
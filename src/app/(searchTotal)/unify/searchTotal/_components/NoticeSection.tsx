import DOMPurify                      from "dompurify"
import { useSelector }                from "react-redux"
import { AppState }                   from "@/store/store"
import Link                           from "next/link"
import { ResultDocument, SearchType } from "@/types/unify/unify"
import { getCommaNumber }             from "@/utils/fsms/common/util"

interface Props {
    queryString: string
    notice: ResultDocument[]
    handleSelected: (bbscttsn: string, type: string) => void
}

const NoticeSection = ({queryString, notice, handleSelected}: Props) => {
    const searchCategory = useSelector((state: AppState) => state.searchCategory)

    return (
        <div className="search-section">
            <div className="section-title">
            <h1 className="page-title">공지사항<span className="result-total">[검색결과 {getCommaNumber(searchCategory.noticeTotalCount)}건]</span></h1>
            </div>
            <div className="section-list">
            <ul>
                {notice.map(item => (
                    <li key={item.DQ_ID}>
                    <dl>
                        <dt>
                        <a href="#" onClick={(e) => {e.preventDefault(); handleSelected(item.BBSCTTSN, SearchType.notice)}} title="모달 열림"><span dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(item.TTL)}}/></a>
                        </dt>
                        <dd>
                        <span dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(item.CN)}}/>
                        </dd>
                    </dl>
                </li>
                ))
                }
            </ul>
            {searchCategory.noticeTotalCount > 4 && (
            <div className="result-more">
                <Link href={`/unify/searchList?${queryString}&searchMenu=notice`}>검색결과 더 보기</Link>
            </div>
            )}
            </div>
        </div>
    )
}

export default NoticeSection
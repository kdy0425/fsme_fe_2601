import DOMPurify                      from "dompurify"
import { useSelector }                from "react-redux"
import { AppState }                   from "@/store/store"
import { ResultDocument, SearchType } from "@/types/unify/unify"
import { getCommaNumber }             from "@/utils/fsms/common/util"
import Loading                        from "../../_components/loading"

interface Props {
    law: ResultDocument[]
    loading: boolean
    handleSelected: (bbscttsn: string, type: string) => void
}

const LawList = ({law, loading, handleSelected}: Props) => {
    const searchCategory = useSelector((state: AppState) => state.searchCategory)

    return (
        <div className="search-section" style={{border: "none", paddingTop: 0}}>
            <div className="section-title">
                <h1 className="page-title">소송, 심판사례<span className="result-total">[검색결과 {getCommaNumber(searchCategory.lawTotalCount)}건]</span></h1>
            </div>
            {!loading ? (
            <div className="section-list">
                <ul>
                    {law.map(item => (
                        <li key={item.DQ_ID}>
                        <dl>
                            <dt>
                            <a href="#" onClick={(e) => {e.preventDefault(); handleSelected(item.BBSCTTSN, SearchType.law)}} title="모달 열림"><span dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(item.TTL)}}/></a>
                            </dt>
                            <dd>
                            <span dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(item.CN)}}/>
                            </dd>
                        </dl>
                    </li>
                    ))
                    }
                </ul>
            </div>
            ) : <Loading/> }
        </div>
    )
}

export default LawList
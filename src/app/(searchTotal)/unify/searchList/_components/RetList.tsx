import DOMPurify          from "dompurify"
import { useSelector }    from "react-redux"
import { AppState }       from "@/store/store"
import { ResultDocument } from "@/types/unify/unify"
import { getCommaNumber } from "@/utils/fsms/common/util"
import Loading            from "../../_components/loading"

interface Props {
    ret: ResultDocument[]
    loading: boolean
    handleRetSelected: (rtroactDmndTsid: string) => void
}

const RetList = ({ret, loading, handleRetSelected}: Props) => {
    const searchCategory = useSelector((state: AppState) => state.searchCategory)

    return (
        <div className="search-section" style={{border: "none", paddingTop: 0}}>
            <div className="section-title">
                <h1 className="page-title">소급요청<span className="result-total">[검색결과 {getCommaNumber(searchCategory.retTotalCount)}건]</span></h1>
            </div>
            {!loading ? (
            <div className="section-list">
                <ul>
                    {ret.map(item => (
                        <li key={item.DQ_ID}>
                        <dl>
                            <dt>
                            <a href="#" onClick={(e) => {e.preventDefault(); handleRetSelected(item.RTROACTDMNDTSID)}} title="모달 열림">[{item.REGYMD}][{item.TASKSECDNM}][{item.PRCSSTTSCDNM}] <span dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(item.RTROACTDMNDNM)}}/></a>
                            </dt>
                            <dd>
                            <span dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(item.RTROACTDMNDCN)}}/>
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

export default RetList
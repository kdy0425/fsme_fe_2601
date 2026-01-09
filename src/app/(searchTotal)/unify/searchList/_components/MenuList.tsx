import Link               from "next/link"
import DOMPurify          from "dompurify"
import { useSelector }    from "react-redux"
import { AppState }       from "@/store/store"
import { ResultDocument } from "@/types/unify/unify"
import { getCommaNumber } from "@/utils/fsms/common/util"
import Loading            from "../../_components/loading"

interface Props {
    menu: ResultDocument[]
    loading: boolean
}

const MenuList = ({menu, loading}: Props) => {
    const searchCategory = useSelector((state: AppState) => state.searchCategory)

    return (
        <div className="search-section" style={{border: "none", paddingTop: 0}}>
            <div className="section-title">
                <h1 className="page-title">메뉴 검색<span className="result-total">[검색결과 {getCommaNumber(searchCategory.menuTotalCount)}건]</span></h1>
            </div>
            {!loading ? (
            <div className="section-list">
                <ul>
                    {menu.map((item, index) => (
                        <li key={index}>
                    <dl>
                            <dt>
                            <Link href={item.URL} title="새창에서 열림"><span dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(item?.MENU_NM)}}/></Link>
                            </dt>
                            <dd className="site-url">
                            <Link href={item.URL} title="새창에서 열림">{item.URL}</Link>
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

export default MenuList
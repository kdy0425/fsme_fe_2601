import DOMPurify          from "dompurify"
import { useSelector }    from "react-redux"
import { AppState }       from "@/store/store"
import Link               from "next/link"
import { ResultDocument } from "@/types/unify/unify"
import { getCommaNumber } from "@/utils/fsms/common/util"

interface Props {
    queryString: string
    menu: ResultDocument[]
}

const MenuSection  = ({queryString, menu}: Props) => {
    const searchCategory = useSelector((state: AppState) => state.searchCategory)

    return (
        <div className="search-section">
            <div className="section-title">
            <h1 className="page-title">메뉴 검색<span className="result-total">[검색결과 {getCommaNumber(searchCategory.menuTotalCount)}건]</span></h1>
            </div>
            <div className="section-list">
            <ul>
                {menu.map((item, index) => (
                    <li key={index}>
                    <dl>
                        <dt>
                        <Link href={item?.URL ?? ""} title="새창에서 열림"><span dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(item?.MENU_NM)}}/></Link>
                        </dt>
                        <dd className="site-url">
                        <Link href={item?.URL ?? ""} title="새창에서 열림">{item.URL}</Link>
                        </dd>
                    </dl>
                </li>
                ))
                }
            </ul>
            {searchCategory.menuTotalCount > 4 && (
            <div className="result-more">
                <Link href={`/unify/searchList?${queryString}&searchMenu=menu`}>검색결과 더 보기</Link>
            </div>
            )}
            </div>
        </div>
    )
}

export default MenuSection
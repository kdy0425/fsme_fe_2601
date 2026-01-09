
/* React */
import { memo } from 'react'

/* 공통 component */
import BlankCard from '@/components/shared/BlankCard'

/* 공통 js */
import { brNoFormatter, telnoFormatter } from '@/utils/fsms/common/util'

/* type */
import { Row } from '@/app/(admin)/apv/fgsm/page'

type propsInterface = {
  issueDetailInfo: Row | null
}

const DetailComponent = (props: propsInterface) => {
  
  const { issueDetailInfo } = props

  return (
    <BlankCard className="contents-card" title="가맹점 상세정보" >
      <div className="table-scrollable">
        <table className="table table-bordered">
          <caption>가맹점 상세정보</caption>
          <colgroup>
            <col style={{ width: '12%' }} />
            <col style={{ width: '38%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '38%' }} />            
          </colgroup>
          <tbody>
            <tr>
              <th className="td-head" scope="row">
                사업자번호
              </th>
              <td>
                {brNoFormatter(issueDetailInfo?.frcsBrno ?? '')}
              </td>
              <th className="td-head" scope="row">
                가맹점명
              </th>
              <td>
                {issueDetailInfo?.frcsNm}
              </td>
            </tr>
            <tr>
              <th className="td-head" scope="row">
                주소(소재지)
              </th>
              <td>
                {issueDetailInfo?.frcsAddr}
              </td>
              <th className="td-head" scope="row">
                가맹점 전화번호
              </th>
              <td>
                {telnoFormatter(issueDetailInfo?.frcsTelno ?? '')}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </BlankCard>
  )
}

export default memo(DetailComponent)

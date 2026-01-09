/* React */
import { useState, memo } from "react"

/* 공통 component */
import BlankCard from "@/app/components/shared/BlankCard"

/* ./ component */
import InqRsnCnModal from "../../uid/_components/inqRsnCnModal"

/* type */
import { Row } from "../page"

/* 공통 js */
import { formatDate } from "@/utils/fsms/common/convert"
import { getUserInfo } from "@/utils/fsms/utils"

type propsType = {
  selectedRowData: Row
  reload: () => void
}

const DetailDataGrid = (props: propsType) => {

  const { selectedRowData, reload } = props

  const userInfo = getUserInfo()

  const [open, setOpen] = useState<boolean>(false)

  return (
    <>
      <BlankCard
        className="contents-card"
        title="개인정보 열람 상세정보"
        buttons={[
          {
            label: '열람사유 등록',
            disabled: userInfo.lgnId !== selectedRowData.rgtrId || selectedRowData.inclNm === '해당없음',
            onClick: () => setOpen(true),
            color: 'outlined',
          },
        ]}
      >
        {/* 테이블영역 시작 */}
        <div className="table-scrollable">
          <table className="table table-bordered">
            <caption>상세 내용 시작</caption>
            <colgroup>
              <col style={{ width: '10%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '15%' }} />
            </colgroup>
            <tbody>
              <tr>
                <th className="td-head" scope="row">
                  개인정보유형
                </th>
                <td colSpan={3}>{selectedRowData?.inclNm}</td>
                <th className="td-head" scope="row">
                  메뉴명
                </th>
                <td colSpan={3}>{selectedRowData?.menuNm}</td>
              </tr>
              <tr>
                <th className="td-head" scope="row">
                  열람목적
                </th>
                <td colSpan={3}>{selectedRowData?.inqRsnNm}</td>
                <th className="td-head" scope="row">
                  열람사유
                </th>
                <td colSpan={3}>{selectedRowData?.inqRsnCn}</td>
              </tr>
              <tr>
                <th className="td-head" scope="row">
                  조회건수
                </th>
                <td>{selectedRowData?.inqNocs}</td>
                <th className="td-head" scope="row">
                  열람일자
                </th>
                <td>{formatDate(selectedRowData?.inqYmd)}</td>
                <th className="td-head" scope="row">
                  관할관청
                </th>
                <td>{selectedRowData?.locgovNm}</td>
                <th className="td-head" scope="row">
                  담당자명
                </th>
                <td>{selectedRowData?.userNm}</td>
              </tr>
              <tr>
                <th className="td-head" scope="row">
                  확인여부
                </th>
                <td>{selectedRowData?.actnNm}</td>
                <th className="td-head" scope="row">
                  조치결과
                </th>
                <td>{selectedRowData?.actnRsltCn}</td>
                <th className="td-head" scope="row">
                  변경ID
                </th>
                <td>{selectedRowData?.mdfrId}</td>
                <th className="td-head" scope="row">
                  변경일자
                </th>
                <td>{formatDate(selectedRowData?.mdfcnDt)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        {/* 테이블영역 끝 */}
      </BlankCard>

      {open ? (
        <InqRsnCnModal
          open={open}
          setOpen={setOpen}
          selectedRowData={selectedRowData}
          reload={reload}
        />
      ) : null}
    </>
  )
}

export default memo(DetailDataGrid)
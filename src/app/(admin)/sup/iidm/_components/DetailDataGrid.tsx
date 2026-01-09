/* React */
import React, { memo } from 'react';

/* 공통 component */
import BlankCard from '@/app/components/shared/BlankCard';

/* type */
import { Row } from '../page';

/* 공통 js */
import { formatDate } from "@/utils/fsms/common/convert"

type DetailDataGridProps = {
  selectedRow: Row
}

const DetailDataGrid = (props: DetailDataGridProps) => {

  const { selectedRow } = props;

  return (
    <BlankCard className="contents-card" title="상세 정보">
      <>
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
                <td colSpan={3}>{selectedRow?.inclNm}</td>
                <th className="td-head" scope="row">
                  메뉴명
                </th>
                <td colSpan={3}>{selectedRow?.menuNm}</td>
              </tr>
              <tr>
                <th className="td-head" scope="row">
                  열람목적
                </th>
                <td colSpan={3}>{selectedRow?.inqRsnNm}</td>
                <th className="td-head" scope="row">
                  열람사유
                </th>
                <td colSpan={3}>{selectedRow?.inqRsnCn}</td>
              </tr>
              <tr>
                <th className="td-head" scope="row">
                  조회건수
                </th>
                <td>{selectedRow?.inqNocs}</td>
                <th className="td-head" scope="row">
                  열람일자
                </th>
                <td>{formatDate(selectedRow?.inqYmd)}</td>
                <th className="td-head" scope="row">
                  관할관청
                </th>
                <td>{selectedRow?.locgovNm}</td>
                <th className="td-head" scope="row">
                  담당자명
                </th>
                <td>{selectedRow?.userNm}</td>
              </tr>
              <tr>
                <th className="td-head" scope="row">
                  확인여부
                </th>
                <td>{selectedRow?.actnNm}</td>
                <th className="td-head" scope="row">
                  조치결과
                </th>
                <td>{selectedRow?.actnRsltCn}</td>
                <th className="td-head" scope="row">
                  변경ID
                </th>
                <td>{selectedRow?.mdfrId}</td>
                <th className="td-head" scope="row">
                  변경일자
                </th>
                <td>{formatDate(selectedRow?.mdfcnDt)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        {/* 테이블영역 끝 */}
      </>
    </BlankCard>
  );
};

export default memo(DetailDataGrid)

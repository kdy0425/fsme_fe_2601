/* React */
import { memo, useEffect, useState } from 'react'

/* mui component */
import { Grid, Button } from '@mui/material'

/* 공통 component */
import BlankCard from '@/components/shared/BlankCard'
import { CommSelect } from '@/app/components/tx/commSelect/CommSelect'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

/* 공통 js */
import { getDateTimeString, brNoFormatter, rrNoFormatter, cardNoFormatter } from '@/utils/fsms/common/util'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { toQueryParameter } from '@/utils/fsms/utils'

/* 부모 페이지에서 선언한 interface */
import { issueDetailInfoInterface } from './TxIfCardReqComponent'

/* 지자체변경 모달 */
import TxLocalSearchModal from '@/app/components/tx/popup/TxLocalSearchModal'
import { LocalSearchRow } from '@/app/components/tx/popup/TxLocalSearchModal'

/* 상세검토 모달 */
import VhclDetailReviewModal from './VhclDetailReviewModal'

/* 대리운전카드 모달 */
import AgncyCardModal from './AgncyCardModal'

/* 자동차망 모달 */
import CarManageInfoSysModal from '@/app/(admin)/layout/vertical/navbar-top/DataResearch/CarManageInfoSysModal'

/* // 택시 차량, 사업자 검토내역 모달 */
import VhclBsnesReviewModal from './VhclBsnesReviewModal'
import CustomFormLabel from '@/app/components/forms/theme-elements/CustomFormLabel'

/* 주민번호보기 모달 */
import ShowRrnoModal from '@/app/components/popup/ShowRrnoModal'

interface propsInterface {
  issueDetailInfo: issueDetailInfoInterface | null
  handleApply: () => void
  processing: any
  handleAdvancedSearch:() => void
}

const DetailComponent = (props: propsInterface) => {
  
  const { issueDetailInfo, handleApply, processing, handleAdvancedSearch } = props

  // 상세검토 모달 상태관리
  const [vhclDetailReviewOpen, setVhclDetailReviewOpen] = useState<boolean>(false)
  const [detailResult, setDetailResult] = useState<boolean>(false) // 상세검토 모달에서 승인시 차량 또는 사업자상태가 정상이 아닐경우 '택시 차량, 사업자 검토내역' 모달을 호출하는 플래그

  // 대리운전카드 모달 상태관리
  const [agncyCardOpen, setAgncyCardOpen] = useState<boolean>(false)

  // 자동차망 상세조회 모달 상태관리
  const [carnetInfoOpen, setCarnetInfoOpen] = useState<boolean>(false)

  // 택시 차량, 사업자 검토내역 모달 상태관리 변수
  const [vhclBsnesReviewOpen, setVhclBsnesReviewOpen] = useState<boolean>(false)

  // 로딩
  const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 저장시 로딩상태

  // 주민번호보기 모달
  const [rrnoModalOpen, setRrnoModalOpen] = useState<boolean>(false);

  // 지자체변경 모달 상태관리 변수
  const [locModalOpen, setLocModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (detailResult) {
      handleApplyAfterVhclDetail()
      setDetailResult(false)
    }
  }, [detailResult])

  // 지자체 변경값 선택시 ( ** 미선택시에는 빈값 json 리턴 )
  const locgovModalRowClick = (row:LocalSearchRow) => {
    
    if (issueDetailInfo?.locgovCd === row.locgovCd || row?.locgovCd?.length !== 5) {
      alert('요청을 변경할 지자체와 우리지자체가 동일하거나 잘못된 지자체정보입니다. 지자체를 다시 선택해 주십시오.')
    } else if (issueDetailInfo?.locgovCd.substring(0, 2) !== row.ctpvCd) {
      alert('요청을 변경할 지자체와 우리지자체의 시도가 다릅니다. 동일 시도 내에서만 지자체변경이 가능합니다.')
    } else if (row.sggCd === '000' || row.sggCd === '001' || row.sggCd === '009') {
      alert('시도로 지자체변경이 불가능합니다.\n시군구로 지자체를 다시 선택해 주십시오.')
    } else {
      
      const msg = '유류구매카드 발급요청정보를 우리지자체에서 [' + row.ctpvNm + ' ' + row.locgovNm + ']로 변경(이관)처리하시겠습니까?';

      if (confirm(msg)) {
        locgovChangeProc(row.locgovCd)
        return true;
      }
    }

    return false;
  };

  // 지자체변경처리
  const locgovChangeProc = async (pLocgovCd:string) => {

    setLoadingBackdrop(true)

    try {
      
      const endPoint = '/fsm/cad/cijm/tx/updateLocgovCardIssuJdgmnMng'
      const body = {
        crdcoCd: issueDetailInfo?.crdcoCd,
        rcptYmd: issueDetailInfo?.rcptYmd,
        rcptSeqNo: issueDetailInfo?.rcptSeqNo,
        seqNo: issueDetailInfo?.seqNo,
        locgovCd: pLocgovCd
      }

      const response = await sendHttpRequest('PUT', endPoint, body, true, { cache: 'no-store' })

      if (response && response.resultType === 'success') {
        alert('완료되었습니다')
        handleAdvancedSearch();
      } else {
        alert(response.message)
      }
    } catch (error) {
      alert(error)
    } finally {
      setLoadingBackdrop(false)
    }
  }

  // 지자체변경 모달 오픈
  const locgovChangeHandle = () => {

    if (issueDetailInfo?.moliatAprvYn !== 'X') {
      alert('미승인시에만 지자체변경 가능합니다.')
      return
    }

    setLocModalOpen(true);
  }

  // 상세검토 모달 오픈
  const detailInfoHandle = () => {
    if (!(issueDetailInfo?.moliatAprvYn === 'X' && issueDetailInfo?.confTyp !== '000')) {
      alert('미승인건 중 검토유형이 정상이 아닌경우 확인 가능합니다.')
      return
    }

    setVhclDetailReviewOpen(true)
  }

  // 대리운전카드 모달 오픈
  const agncyCardHandle = () => {
    if (!(issueDetailInfo?.moliatAprvYn === 'X' && issueDetailInfo?.custSeCd === '3')) {
      alert('미승인건 중 대리운전자일경우에만 확인 가능합니다.')
      return
    }

    setAgncyCardOpen(true)
  }

  // 자동차망 상세조회 모달 오픈
  const carnetInfoHandle = () => {
    setCarnetInfoOpen(true)
  }

  // 상세검토 모달에서 승인시
  const handleApplyAfterVhclDetail = () => {
    setVhclBsnesReviewOpen(true)
  }

  return (
    <>
      <Grid container spacing={2} className="card-container">
        <Grid item xs={12} sm={12} md={12}>
          <BlankCard className="contents-card" title="발급심사 상세정보">
            {/* 테이블영역 시작 */}
            <div className="table-scrollable">
              <table className="table table-bordered">
                <caption>상세 내용 시작</caption>
                <colgroup>
                  <col style={{ width: '11%' }} />
                  <col style={{ width: '14%' }} />
                  <col style={{ width: '11%' }} />
                  <col style={{ width: '14%' }} />
                  <col style={{ width: '11%' }} />
                  <col style={{ width: '14%' }} />
                  <col style={{ width: '11%' }} />
                  <col style={{ width: '14%' }} />
                </colgroup>
                <tbody>                
                  <tr>
                    <th className="td-head" scope="row">
                      차량번호
                    </th>
                    <td colSpan={3}>
                      <span>
                        {issueDetailInfo?.vhclNo}
                      </span>
                      <Button
                        variant="contained"
                        color="dark"
                        onClick={carnetInfoHandle}
                        style={{marginLeft:'10px'}}
                      >
                        자동차망 상세조회
                      </Button>
                    </td>
                    <th className="td-head" scope="row">
                      사업자등록번호
                    </th>
                    <td colSpan={3}>
                      {brNoFormatter(issueDetailInfo?.brno ?? '')}
                      <Button
                        variant="contained"
                        color="dark"
                        onClick={detailInfoHandle}
                        style={{marginLeft:'10px'}}
                      >
                        상세검토
                      </Button>
                    </td>
                  </tr>

                  <tr>
                    <th className="td-head" scope="row">
                      대리운전자여부
                    </th>
                    <td colSpan={3}>
                      {issueDetailInfo?.custSeNm}
                      <Button
                        variant="contained"
                        color="dark"
                        onClick={agncyCardHandle}
                        style={{marginLeft:'10px'}}
                      >
                        대리운전 카드발급
                      </Button>
                    </td>
                    <th className="td-head" scope="row">
                      지자체명
                    </th>
                    <td colSpan={3}>
                      {issueDetailInfo?.locgovNm}
                      <Button
                        variant="contained"
                        color="dark"
                        onClick={locgovChangeHandle}
                        style={{marginLeft:'10px'}}
                      >
                        지자체변경
                      </Button>
                    </td>  
                  </tr>

                  <tr>   
                    <th className="td-head" scope="row">
                      대리운전시작일
                    </th>
                    <td>
                      {getDateTimeString(issueDetailInfo?.agncyDrvBgngYmd ?? '', 'date')?.dateString}
                    </td>
                    <th className="td-head" scope="row">
                      대리운전종료일
                    </th>
                    <td>
                      {getDateTimeString(issueDetailInfo?.agncyDrvEndYmd ?? '', 'date')?.dateString}
                    </td>                                                       
                    <th className="td-head" scope="row">
                      {issueDetailInfo?.bzmnSeCd === '0' ? '대표자명' : '수급자명'}
                    </th>
                    <td>
                      {issueDetailInfo?.bzmnSeCd === '0' ? issueDetailInfo?.rprsvNm : issueDetailInfo?.flnm}
                    </td>
                    <th className="td-head" scope="row">
                      {issueDetailInfo?.bzmnSeCd === '0' ? '법인번호' : '수급자주민번호'}
                    </th>
                    <td>
                      <Button
                        variant="outlined"
                        color="primary"
                        fullWidth
                        onClick={() => setRrnoModalOpen(true)}
                      >
                        {issueDetailInfo?.bzmnSeCd === '0' ? issueDetailInfo?.crno : rrNoFormatter(issueDetailInfo?.pidS ?? '')}                                            
                      </Button>
                    </td>
                  </tr>

                  <tr>                    
                    <th className="td-head" scope="row">
                      유종
                    </th>
                    <td>{issueDetailInfo?.koiNm}</td>
                    <th className="td-head" scope="row">
                      개인법인구분
                    </th>
                    <td>{issueDetailInfo?.bzmnSeNm}</td>
                    <th className="td-head" scope="row">
                      업체명
                    </th>
                    <td colSpan={3}>{issueDetailInfo?.bzentyNm}</td>                    
                  </tr>
                  
                  <tr>
                    <th className="td-head" scope="row">
                      카드구분
                    </th>
                    <td>{issueDetailInfo?.cardSeNm}</td>
                    <th className="td-head" scope="row">
                      발급구분
                    </th>
                    <td>{issueDetailInfo?.issuSeNm}</td>                                        
                    <th className="td-head" scope="row">
                      카드번호
                    </th>
                    <td colSpan={3}>
                      {cardNoFormatter(issueDetailInfo?.cardNo ?? '')}
                    </td>
                  </tr>

                  <tr> 
                    <th className="td-head" scope="row">
                      처리상태
                    </th>
                    <td>{issueDetailInfo?.moliatAprvYnNm}</td>
                    <th className="td-head" scope="row">
                      처리일자
                    </th>
                    <td>
                      {getDateTimeString(issueDetailInfo?.moliatAprvDt ?? '', 'date')?.dateString}
                    </td>
                    <th className="td-head" scope="row">
                      탈락사유코드
                    </th>
                    <td colSpan={3}>
                      <CustomFormLabel className="input-label-none" htmlFor="sch-flRsnCd">탈락사유코드</CustomFormLabel>
                      <CommSelect
                        cdGroupNm="IUE0"
                        pValue={issueDetailInfo?.flRsnCd ?? ''}
                        handleChange={() => null}
                        pName="flRsnCd"
                        pDisabled={true}
                        reloadFlag={true}
                        htmlFor={"sch-flRsnCd"}
                      />
                    </td>
                  </tr>

                  <tr> 
                    <th className="td-head" scope="row">
                      탈락사유
                    </th>
                    <td colSpan={7}>{issueDetailInfo?.flRsnCn}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            {/* 테이블영역 끝 */}
          </BlankCard>
        </Grid>
      </Grid>

      {/* 로딩 */}
      <LoadingBackdrop open={loadingBackdrop} />

      {/* 지자체 변경 모달 */}
      {locModalOpen ? (
        <TxLocalSearchModal
          open={locModalOpen}
          setOpen={setLocModalOpen}
          rowClick={locgovModalRowClick}
        />
      ) : null}      

      {/* 상세검토 모달 */}
      {vhclDetailReviewOpen ? (
        <VhclDetailReviewModal
          issueDetailInfo={issueDetailInfo}
          open={vhclDetailReviewOpen}
          setOpen={setVhclDetailReviewOpen}
          pHandleApply={handleApply}
          setDetailResult={setDetailResult}
        />
      ) : null}

      {/* 대리운전카드 모달 */}
      {agncyCardOpen ? (
        <AgncyCardModal
          issueDetailInfo={issueDetailInfo}
          open={agncyCardOpen}
          setOpen={setAgncyCardOpen}
          pHandleApply={handleApply}
        />
      ) : null}

      {/* 자동차망 상세조회 */}
      {carnetInfoOpen ? (
        <CarManageInfoSysModal
          open={carnetInfoOpen}
          onCloseClick={() => setCarnetInfoOpen(false)}
          vhclNo={issueDetailInfo?.vhclNo}
        />
      ) : null}

      {/* 택시 차량, 사업자 검토내역 */}
      {vhclBsnesReviewOpen ? (
        <VhclBsnesReviewModal
          issueDetailInfo={issueDetailInfo}
          open={vhclBsnesReviewOpen}
          setOpen={setVhclBsnesReviewOpen}
          pHandleApply={() => processing('Y')}
        />
      ) : null}

      {/* 주민번호보기 모달 */}
      {rrnoModalOpen ? (
        <ShowRrnoModal
          open={rrnoModalOpen}
          setOpen={setRrnoModalOpen}
          procData={{
            rrno: issueDetailInfo?.rrno ?? '',
            paramtrInfoCn: toQueryParameter({ vhclNo:issueDetailInfo?.vhclNo, brno:issueDetailInfo?.brno, crdcoCd:issueDetailInfo?.crdcoCd, rcptSeqNo:issueDetailInfo?.rcptSeqNo }).replace('?',''),
            defaultValue: '1'
          }}
        />
      ) : null}
    </>
  )
}

export default memo(DetailComponent)

/* React */
import React, { useState } from 'react'

/* mui component */
import { Box, Button } from '@mui/material'

/* 공통 js */
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { getToday } from '@/utils/fsms/common/comm'

/* 공통 component */
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

/* _component */
import ModalContent from './ModalContent'

/* 부모 컴포넌트에서 선언한 interface */
import { detailInfoInterface } from '../page'

/* interface, type 선언 */
interface propsInterface {
  rowIndex: number
  tabIndex: string
  detailInfo: detailInfoInterface
  handleAdvancedSearch: () => void
  handleExcelDownLoad: () => void
}

export interface procInterface {
  vhclNo: string // 차량번호
  vonrNm: string // 소유자명
  vonrBrno: string // 사업자등록번호
  vonrRrno: string // 주민등록번호
  vonrRrnoS: string // 주민등록번호
  bgngYmd: string // 시작일
  endYmd: string // 종료일
  chgRsnCn: string // 지급거절사유
  hstrySn: string // 이력번호
  delYn: string // 삭제여부
  locgovCd: string // 지자체코드
  koiCd: string // 유종
  brno: string // 사업자등록번호 ** 택시만해당
  crno: string // 법인번호 ** 화물만 해당
  vhclTonCd: string // 톤수코드 ** 화물만 해당
  vhclPsnCd: string // 차량코드 ** 화물만 해당
  vonrRrnoSe: string
}

const CrudButtons = (props: propsInterface) => {
  
  const { rowIndex, tabIndex, detailInfo, handleAdvancedSearch, handleExcelDownLoad } = props

  const [procType, setProcType] = useState<string>('')
  const [open, setOpen] = useState<boolean>(false);
  const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 저장시 로딩상태

  // 보조금지급거절 삭제
  const deleteData = async () => {
    if (rowIndex == -1) {
      alert('선택된 항목이 없습니다')
      return
    }

    if (detailInfo.bgngYmd <= getToday()) {
      alert('지급 거절시작 된 건은 삭제가 불가능합니다. 종료일을 변경해주시길 바랍니다.')
      return
    }

    if (!confirm('정말 삭제하시겠습니까?')) {
      return
    }

    setLoadingBackdrop(true);

    try {
      const endPoint = '/fsm/ilg/srp/tx/deleteSbsidyRejectPymntTx'
      const body = {
        vhclNo: detailInfo.vhclNo,
        hstrySn: detailInfo.hstrySn,
        brno: detailInfo.brno,
      }

      const response = await sendHttpRequest('DELETE', endPoint, body, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success') {
        // 재조회
        alert('삭제 완료되었습니다.')
        handleAdvancedSearch() // 재조회
      } else {
        alert(response.message)
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingBackdrop(false);
    }
  }

  const openHandler = (type: string) => {

    if (type === 'update' && rowIndex === -1) {
      alert('선택된 내역이 없습니다.');
      return;
    }

    if (type === 'update' && detailInfo.delYn === 'Y') {
      alert('삭제된건은 수정 불가합니다');
      return;
    }
    
    setOpen(true);
    setProcType(type)    
  }

  return (
    <Box className="table-bottom-button-group">
      <div className="button-right-align">
        {/* 조회 */}
        <Button
          variant="contained"
          color="primary"
          onClick={handleAdvancedSearch}
        >
          검색
        </Button>

        {/* 신규 */}
        <Button
          variant="contained"
          color="primary"
          onClick={() => openHandler('insert')}
        >
          등록
        </Button>

        {/* 수정 */}        
        <Button
          variant="contained"
          color="primary"
          onClick={() => openHandler('update')}
        >
          수정
        </Button>

        {/* 엑셀 */}
        <Button
          variant="contained"
          color="success"
          onClick={handleExcelDownLoad}
        >
          엑셀
        </Button>

        {/* 삭제 ** 택시만해당 */}
        {tabIndex == '1' ? (
          <Button
            variant='contained'
            color='error'
            onClick={deleteData}
          >
            삭제
          </Button>
        ) : null}
      </div>

      {open ? (
        <ModalContent
          open={open}
          setOpen={setOpen}
          tabIndex={tabIndex}
          procType={procType}
          detailInfo={detailInfo}
          handleAdvancedSearch={handleAdvancedSearch}
        />
      ) : null}
      
      {/* 로딩 */}
      <LoadingBackdrop open={loadingBackdrop} />
    </Box>
  )
}

export default CrudButtons



/* React */
import React, { useCallback, useEffect, useMemo, useState } from 'react';

/* mui component */
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import { Box, Button } from '@mui/material';
import { CustomTextField } from '@/utils/fsms/fsm/mui-imports';

/* 공통 component */
import CustomFormLabel from '@/app/components/forms/theme-elements/CustomFormLabel';
import BlankCard from '@/app/components/shared/BlankCard';
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { IconSearch } from '@tabler/icons-react';
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

/* type */
import { HeadCell, Pageable2 } from 'table';
import { Row } from '../page';

/* 공통 js */
import { getUserInfo, toQueryParameter } from '@/utils/fsms/utils';
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils';
import { isNumber } from '@/utils/fsms/common/comm';
import { getDateFormatYMD } from '@/utils/fsms/common/dateUtils';

const headCells: HeadCell[] = [
  {
    id: 'frcsBrno',
    numeric: false,
    disablePadding: false,
    label: '사업자번호',
  },
  {
    id: 'frcsNo',
    numeric: false,
    disablePadding: false,
    label: '가맹점번호',
  },
  {
    id: 'frcsNm',
    numeric: false,
    disablePadding: false,
    label: '가맹점명',
  },
  {
    id: 'frcsTelno',
    numeric: false,
    disablePadding: false,
    label: '전화번호',
  },
  {
    id: 'frcsAddr',
    numeric: false,
    disablePadding: false,
    label: '주소',
  },
]

type propsType = {
  open: boolean,
  type: 'new' | 'update'
  mrchnetDetailInfo: Row | null
  onCloseClick: () => void;
  reload: () => void;
}

type reqListType = {
  frcsBrno: string
  frcsNo: string
}

type editListType = reqListType & {
  sttsCd?: string
  hstrySn?: number
}

interface RegistRow {
  frcsBrno: string	// 가맹점 사업자 등록 번호
  frcsNo: string // 가맹점 번호
  frcsNm?: string 		// 가맹점명
  frcsTelno?: string // 가맹점 전화번호
  frcsAddr?: string 	// 가맹점 주소

  /* hidden */
  LocGovCd?: string
  RgtrId?: string
  MdfrId?: string

  /* edit */
  sttsCd?: string
  hstrySn?: number
}

/* 검색조건 */
type listSearchObj = {
  page: number
  size: number
  frcsBrno: string
}

/* 등록 */
type stopInfo = {
  stopBgngYmd: string 	// 정지 시작 일자
  stopEndYmd: string 	  // 정지 종료 일자 
  stopRsnCn: string	// 정지 사유 내용
}

type disabledObjType = {
  frcsBrno: boolean
  stopBgngYmd: boolean
  stopRsnCn: boolean
}

export const MrchRegisterModal = (props: propsType) => {

  const { open, type, mrchnetDetailInfo, onCloseClick, reload } = props;

  const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 저장시 로딩상태

  const userInfo = getUserInfo()

  /* 조회 상태관리 */
  const [params, setParams] = useState<listSearchObj>({ page: 1, size: 10, frcsBrno: '' })

  /* 등록 상태관리 */
  const [stopInfo, setStopInfo] = useState<stopInfo>({
    stopBgngYmd: '',
    stopEndYmd: '',
    stopRsnCn: '',
  })

  const [rows, setRows] = useState<RegistRow[]>([]) // 가져온 로우 데이터
  const [loading, setLoading] = useState(false) // 로딩여부
  const [searchFlag, setSearchFlag] = useState<boolean | null>(null) // 검색 flag
  const [totalRows, setTotalRows] = useState<number>(0) // 조회결과 갯수
  const [pageable, setPageable] = useState<Pageable2 | undefined>({ pageNumber: 1, pageSize: 10, totalPages: 1 }) // 페이징객체
  const [checkedRows, setCheckedRows] = useState<string[]>([]) // 체크 로우 데이터

  /* disabled 상태관리 */
  const [disabledObj, setdisabledObj] = useState<disabledObjType>({
    frcsBrno: false,
    stopBgngYmd: false,
    stopRsnCn: false,
  })

  useEffect(() => {
    if (searchFlag != null) {
      fetchData()
    }
  }, [searchFlag])

  useEffect(() => {

    /* 수정시 값 세팅 */
    settingData()

    /* disabled 처리 => 수정 시 사업자 번호, 지급정지 시작일, 사유*/
    settingDisabled()
  }, []);

  const settingData = (): void => {
    if (type === 'update') {

      /* 등록 상태관리 */
      setStopInfo({
        stopBgngYmd: getDateFormatYMD(mrchnetDetailInfo?.stopBgngYmd ?? ''),
        stopEndYmd: getDateFormatYMD(mrchnetDetailInfo?.stopEndYmd ?? ''),
        stopRsnCn: mrchnetDetailInfo?.stopRsnCn ?? ''
      })

      /* 조회 상태관리 */
      setParams((prev) => ({
        ...prev,
        frcsBrno: mrchnetDetailInfo?.frcsBrno ?? ''
      }))

      const rowArr = {
        frcsBrno: mrchnetDetailInfo?.frcsBrno ?? '',
        frcsNo: mrchnetDetailInfo?.frcsNo ?? '',
        frcsNm: mrchnetDetailInfo?.frcsNm,
        frcsTelno: mrchnetDetailInfo?.frcsTelno,
        frcsAddr: mrchnetDetailInfo?.frcsAddr,
        sttsCd: mrchnetDetailInfo?.sttsCd,
        hstrySn: mrchnetDetailInfo?.hstrySn
      }

      setRows([rowArr])
    }
  }

  const handlePaginationModelChange = useCallback((page: number, pageSize: number) => {
    setParams((prev) => ({ ...prev, page: page, size: pageSize }))
    setSearchFlag((prev) => !prev)
  }, [])

  // new 일 때만 check 박스 표시
  const displayHeadCells: HeadCell[] = useMemo(() => {
    if (type === 'new') {
      return [{ id: 'check', label: '', numeric: false, disablePadding: false, format: 'checkbox', }, ...headCells]
    } else {
      return headCells
    }
  }, [type])

  // 조회조건 변경시
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target
    if (name === 'frcsBrno') {
      if (isNumber(value)) {
        setParams((prev) => ({ ...prev, [name]: value }))
      }
    } else {
      setParams((prev) => ({ ...prev, [name]: value }))
    }
  };

  // 조회클릭시
  const handleAdvancedSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setParams((prev) => ({ ...prev, page: 1, size: 10 }))
    setSearchFlag((prev) => !prev)
  }

  /* 함수 선언 */
  const settingDisabled = (): void => {
    if (type === 'update') {
      setdisabledObj({
        frcsBrno: true,
        stopBgngYmd: mrchnetDetailInfo?.sttsCd === '10' ? true : false,
        stopRsnCn: mrchnetDetailInfo?.sttsCd === '10' ? true : false,
      })
    }
  }

  // 인풋 값 변경시
  const handleParamsChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target
    setStopInfo(prev => ({ ...prev, [name]: value }));
  }

  const inputDate = new Date(stopInfo.stopBgngYmd); // 사용자가 입력한 날짜
  const today = new Date();

  const minDate = new Date(today);
  minDate.setDate(today.getDate() + 1); // 오늘 +2일 부터 가능하도록


  const saveValidation = () => {
    if (type === 'new' && checkedRows.length === 0) {
      alert('선택된 항목이 없습니다.');
    } else if (!stopInfo.stopBgngYmd) { // 시작 일자 입력 안한 경우
      alert('시작일자를 입력 해주세요')
    } else if (!disabledObj.stopBgngYmd && inputDate < minDate) { // 시작 일자는 무조건 오늘 기점 +2일
      alert('지급정지 시작일은 +2일 부터 등록 가능합니다.')
    } else if (!stopInfo.stopEndYmd) { // 종료 일자 입력 안한 경우
      alert('종료일자를 입력 해주세요')
    } else if (stopInfo.stopBgngYmd > stopInfo.stopEndYmd) { // 종료일자가 시작일자보다 큰 경우
      alert('시작일자가 종료일자보다 큽니다.\n다시 확인해주세요.')
    } else {
      return true
    }
    return false
  }

  const searchValidation = () => {
    if (!params.frcsBrno) {
      alert("가맹점사업자번호는 필수값입니다.");
    } else {
      return true
    }
    return false
  }

  // 체크박스 변경시
  const handleCheckChange = useCallback((selected: string[]) => {
    setCheckedRows(selected)
  }, []);

  const saveData = async () => {

    if (saveValidation()) {
      const msg = type == 'new' ? '등록' : '수정';

      const reqList: reqListType[] = checkedRows.map(rowId => {
        const index = Number(rowId.replace('tr', ''));
        const result = {
          frcsBrno: rows[index].frcsBrno,
          frcsNo: rows[index].frcsNo,
        }
        return result;
      });

      const editReqList: editListType[] =
        [{
          frcsBrno: rows[0].frcsBrno,
          frcsNo: rows[0].frcsNo,
          sttsCd: rows[0].sttsCd,
          hstrySn: Number(rows[0].hstrySn)
        }];


      const body = {
        stopBgngYmd: stopInfo.stopBgngYmd.replaceAll('-', ''),
        stopEndYmd: stopInfo.stopEndYmd.replaceAll('-', ''),
        stopRsnCn: stopInfo.stopRsnCn.trim(),
        locgovCd: userInfo.locgovCd,
        reqList: type == 'new' ? reqList : editReqList
      }

      if (confirm('지금 정지 가맹점을 ' + msg + '하시겠습니까?')) {
        setLoadingBackdrop(true)
        const endpoint: string = type === 'new' ? '/fsm/apv/fgsm/cm/createAllFrcsGiveStopMng' : '/fsm/apv/fgsm/cm/updateFrcsGiveStopMng';

        try {

          const method = type == 'new' ? 'POST' : 'PUT';
          const response = await sendHttpRequest(method, endpoint, body, true, { cache: 'no-store' });

          if (response && response.resultType === 'success') {
            alert(msg + ' 되었습니다');
            onCloseClick();
            reload();
          } else {
            alert(response.message)
          }
        } catch (error) {
          console.error('Error ::: ', error)
        } finally {
          setLoadingBackdrop(false)
        }
      }
    }

  };

  const fetchData = async () => {
    if (searchValidation()) {
      setRows([])
      setTotalRows(0)
      setPageable({ pageNumber: 1, pageSize: 10, totalPages: 1 })
      setLoading(true)

      try {

        const endpoint = '/fsm/apv/fgsm/cm/getAllFrcsInfo' + toQueryParameter(params)
        const response = await sendHttpRequest('GET', endpoint, null, true, { cache: 'no-store' })

        if (response && response.resultType === 'success' && response.data.content.length != 0) {
          setRows(response.data.content)
          setTotalRows(response.data.totalElements)
          setPageable({
            pageNumber: response.data.pageable.pageNumber + 1,
            pageSize: response.data.pageable.pageSize,
            totalPages: response.data.totalPages,
          })
        }
      } catch (error) {
        // 에러시
        console.log(error)
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <Dialog
      fullWidth={true}
      maxWidth={'lg'}
      open={open}
    >
      <DialogContent>
        <Box className='table-bottom-button-group'>
          <CustomFormLabel className="input-label-display">
            <h2 className="popup-title">
              {type === 'update' ? '가맹점 지급 정지 수정' : '가맹점 지급 정지 등록'}
            </h2>
          </CustomFormLabel>

          <div className=" button-right-align">
            <Button variant="contained" color="primary" onClick={(saveData)}>저장</Button>
            <Button variant="contained" color="dark" onClick={(onCloseClick)}>취소</Button>
          </div>
        </Box>

        {/* 테이블영역 시작 */}
        <BlankCard className="contents-card" title="등록정보">
          <div className="table-scrollable">
            <table className="table table-bordered">
              <caption>가맹접 지급 정지 테이블 요약</caption>
              <colgroup>
                <col style={{ width: '13%' }}></col>
                <col style={{ width: '20%' }}></col>
                <col style={{ width: '13%' }}></col>
                <col style={{ width: '20%' }}></col>
                <col style={{ width: '13%' }}></col>
                <col style={{ width: '20%' }}></col>
              </colgroup>
              <tbody>
                <tr>
                  <th className="td-head" scope="row">
                    사업자번호
                  </th>
                  <td>
                    <div className="form-group" style={{ width: '100%' }}>
                      <CustomFormLabel className="input-label-none" htmlFor="ft-frcsBrno">사업자번호</CustomFormLabel>
                      <CustomTextField
                        id="ft-frcsBrno"
                        name="frcsBrno"
                        value={params.frcsBrno}
                        onChange={handleSearchChange}
                        fullWidth
                        disabled={disabledObj.frcsBrno}
                        inputProps={{
                          maxLength: '10'
                        }}
                      />
                      {type != 'update' ? (
                        <form onSubmit={handleAdvancedSearch}>
                          <Button
                            variant='contained'
                            color='dark'
                            type="submit" // form 제출을 위한 버튼
                          >
                            <IconSearch size={20} />
                          </Button>
                        </form>
                      ) : null}
                    </div>
                  </td>
                  <th className="td-head" scope="row">
                    지급정지 시작일
                  </th>
                  <td>
                    <CustomFormLabel className="input-label-none" htmlFor="ft-date-start">지급정지시작일</CustomFormLabel>
                    <CustomTextField
                      type="date"
                      id="stopBgngYmd"
                      name='stopBgngYmd'
                      value={stopInfo.stopBgngYmd}
                      // inputProps={{
                      //   min: getForamtAddDay(1),
                      // }}
                      onChange={handleParamsChange}
                      fullWidth
                      disabled={disabledObj.stopBgngYmd}
                    />
                  </td>
                  <th className="td-head" scope="row">
                    지급정지 종료일
                  </th>
                  <td>
                    <CustomFormLabel className="input-label-none" htmlFor="searchSelect">지급정지종료일</CustomFormLabel>
                    <CustomTextField
                      type="date"
                      id="stopEndYmd"
                      name='stopEndYmd'
                      value={stopInfo.stopEndYmd}
                      // inputProps={{
                      //   min: getForamtAddDay(1),
                      // }}
                      onChange={handleParamsChange}
                      fullWidth
                    >
                    </CustomTextField>
                  </td>
                </tr>
                <tr>
                  <th className="td-head" scope="row">
                    지급정지사유
                  </th>
                  <td colSpan={5}>
                    <CustomFormLabel className="input-label-none" htmlFor="ft-limUseRt">지급정지사유</CustomFormLabel>
                    <CustomTextField
                      id="stopRsnCn"
                      name='stopRsnCn'
                      value={stopInfo.stopRsnCn}
                      onChange={handleParamsChange}
                      // multiline                        
                      fullWidth
                      disabled={disabledObj.stopRsnCn}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </BlankCard>

        {/* 테이블영역 시작 */}
        <Box mt={2}>
          <BlankCard className="contents-card" title="가맹점 정보">
            <Box style={{ maxHeight: '60vh', overflow: 'auto' }}>
              <TableDataGrid
                headCells={displayHeadCells}
                rows={rows} // 목록 데이터
                totalRows={totalRows} // 총 로우 수 => new 일 때는 totalRows 처리
                loading={loading} // 로딩여부
                onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
                pageable={pageable} // 현재 페이지  사이즈 정보 => new 일때만 pageable 처리
                onCheckChange={handleCheckChange}
                caption={"상세 목록 조회"}
              />
            </Box>
          </BlankCard>
        </Box>
      </DialogContent>

      {/* 로딩 */}
      <LoadingBackdrop open={loadingBackdrop} />
    </Dialog>
  )

}

export default MrchRegisterModal;
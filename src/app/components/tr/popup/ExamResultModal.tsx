import { useDispatch, useSelector } from '@/store/hooks'
import { closeExamResultModal } from '@/store/popup/ExamResultSlice'
import { AppState } from '@/store/store'
import {
  Dialog,
  DialogContent,
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material'
import CustomFormLabel from '../../forms/theme-elements/CustomFormLabel'
import { Button } from '@mui/material'
import CustomTextField from '../../forms/theme-elements/CustomTextField'
import { TableContainer } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { HeadCell } from 'table'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { ilgCommExamResultPopHC } from '@/utils/fsms/headCells'
import BlankCard from '@/app/components/shared/BlankCard'
import { CommSelect } from '../../tx/commSelect/CommSelect'
import { Row } from '@/app/(admin)/ilg/lpav/page'
import { getCommaNumber } from '@/utils/fsms/common/util'
import {
  clearNextProp,
  openExaathrModal,
  setNextProp,
} from '@/store/popup/ExaathrSlice'
import { usePathname } from 'next/navigation'
import {
  commClearReduxData,
  commSetExamResultData,
  useIlgSelectors,
} from '@/types/fsms/common/ilgData'

interface manipulateObj {
  chk: string
  locgovCd: string
  locgovNm: string
  exmnNo: string //연번
  vhclNo: string //차량번호
  vonrNm: string //소유주명
  dlngNocs: string //거래건수
  aprvAmt: string //거래금액
  asstAmt: string //유가보조금
  rdmActnAmt: number //환수조치액
  bzmnSeNm: string //개인/법인
  bzmnSeCd: string
  tpbizNm: string //업종
  tpbizCd: string
  droperYnNm: string //직영여부
  droperYnCd: string
  tpbizSeNm: string //업종구분
  tpbizSeCd: string
  exmnRsltCn: string
  subsChangeVhclNo: string | null
  hstrySn: string | number | null
  chgRsnCn: string | number | null
  bgngYmd: string | number | null
  endYmd: string | number | null
  subsChangeRest: string | number | null
  subsChangeReject: string | number | null
  [key: string]: string | number | null // 인덱스 시그니처 추가
}

/**모달 메인 컴포넌트 */
const ExamResultModal = () => {
  const pathname = usePathname()
  const dispatch = useDispatch()
  const examResultInfo = useSelector((state: AppState) => state.ExamResultInfo)

  const [selectedIndex, setSelectedIndex] = useState<number>(-1)
  const [manipulatedData, setManipulatedData] = useState<any[]>([])

  const pageUrl = pathname.split('/')[2]

  const {
    lpavInfo,
    shlInfo,
    dmalInfo,
    tcelInfo,
    taavelInfo,
    dvhalInfo,
    nblInfo,
    ddalInfo,
  } = useIlgSelectors()

  /** 입력값 세팅을 위한 변수 */
  const [targetInfo, setTargetInfo] = useState({
    dlngNocs: 0,
    aprvAmt: 0,
    asstAmt: 0,
    bzmnSeCd: '',
    bzmnSeNm: '',
    tpbizCd: '1',
    tpbizNm: '운송',
    droperYnCd: '',
    droperYnNm: '',
    tpbizSeCd: '',
    tpbizSeNm: '',
    rdmActnAmt: 0,
    exmnRsltCn: '',
  })

  useEffect(() => {
    if (examResultInfo.erModalOpen) {
      // console.log(lpavSelectedData)
      setSelectedIndex(-1)
      onCalcProperties()
    }
  }, [examResultInfo.erModalOpen])

  // 라디오박스, 체크박스, 인풋박스 등 입력값 변경 시
  useEffect(() => {
    setManipulatedData((prevRows) => {
      const newRows = [...prevRows]
      // console.log(newRows)
      newRows[selectedIndex] = {
        ...newRows[selectedIndex],
        // [name]: value,
        ...targetInfo,
      }
      return newRows
    })
  }, [targetInfo])

  useEffect(() => {
    dispatch(clearNextProp())
  }, [])

  const getHandleDataByUrl = (): any[] => {
    const url = pageUrl //lpav, shl, dmal...
    switch (url) {
      case 'lpav':
        return lpavInfo.lpavSelectedData
      case 'shl':
        return shlInfo.shlSelectedData
      case 'dmal':
        return dmalInfo.dmalSelectedData
      case 'tcel':
        return tcelInfo.tcelSelectedData
      case 'taavel':
        return taavelInfo.taavelSelectedData
      case 'dvhal':
        return dvhalInfo.dvhalSelectedData
      case 'nbl':
        return nblInfo.nblSelectedData
      case 'ddal':
        return ddalInfo.ddalSelectedData
      default:
        return []
    }
  }

  /**
   * 연번 별로 거래건수, 승인금액, 보조금액, 환수건수의 합산을 구한다.
   */
  const onCalcProperties = () => {
    /**
     * 1. 각 연번 별로 기본 값을 가지는 객체 배열을 만든다.
     * [{ 연번 : '0x_000231...', 승인금액 : value.aprvAmt(금액), 보조금액 : value.asstAmt(금액), 환수건수 : 1  }]
     */
    const totalProperties = getHandleDataByUrl().map(
      (value: Row, index: number) => {
        return {
          exmnNo: value.exmnNo,
          aprvAmt: Number(value.aprvAmt),
          asstAmt: Number(value.asstAmt),
          dlngNocs: 1,
        }
      },
    )
    /**
     * 2. 만들어진 배열을 사용해서, 연번별로 승인금액, 보조금액, 환수건수의 합산 값을 구한다.
     */
    const retMap = new Map()

    totalProperties.forEach((value: any, index: number) => {
      if (!retMap.get(value.exmnNo)) {
        //map에 없는 경우 새로 등록한다.
        retMap.set(value.exmnNo, value)
      } else {
        //map에 있는 경우 꺼내와서 금액과, 건수를 합산하고 다시 map에 세팅한다.
        const befObj = retMap.get(value.exmnNo)
        befObj.dlngNocs += 1
        befObj.aprvAmt += value.aprvAmt
        befObj.asstAmt += value.asstAmt
        retMap.set(value.exmnNo, befObj)
      }
    })

    // console.log(retMap)

    /**
     * 3. 부모창에서 선택한 값에서 retMap과 연변을 비교하여 retMap에 값을 세팅한다.
     *
     * 연번 묶음으로 값을 구하기 위해서
     *  1) 2번에서 구한 map의 key값을 참조하여 "부모창에서 선택한 배열의 연번"값이 같은 index를 구한다.
     *  2) 찾은 index로 부모창에서 선택한 정보들의 차량번호, 소유주명 등의 정보를 가져온다.
     *  3) 가져온 값들을 화면에 보여주기 위해서 반환 배열에 세팅한다.
     *
     */
    const iterator = retMap.entries()
    let result = iterator.next()

    const retArr: manipulateObj[] = []
    while (!result.done) {
      const [key, value] = result.value
      // retArr.push({ exmnNo : value.exmnNo, vhclNo :  })
      const findIdx: number = getHandleDataByUrl().findIndex(
        (value: Row, index: number) => value.exmnNo === key,
      )
      retArr.push({
        chk: '0',
        exmnNo: key, //연번
        locgovCd: getHandleDataByUrl()[findIdx].locgovCd,
        locgovNm: getHandleDataByUrl()[findIdx].locgovNm,
        vhclNo: getHandleDataByUrl()[findIdx].vhclNo, //차량번호
        vonrNm: getHandleDataByUrl()[findIdx].vonrNm, //소유주명
        dlngNocs: value.dlngNocs, //거래건수
        aprvAmt: value.aprvAmt, //거래금액
        asstAmt: value.asstAmt, //유가보조금
        rdmActnAmt: 0, //환수조치액
        bzmnSeNm: '', //개인/법인
        bzmnSeCd: '',
        tpbizNm: '운송', //업종
        tpbizCd: '1',
        droperYnNm: '', //직영여부
        droperYnCd: '',
        tpbizSeNm: '', //업종구분
        tpbizSeCd: '',
        exmnRsltCn: '',
        rdmTrgtNocs: 0, //조사등록건수
        /**현재 진행중인 지급정지정보가 있는지 확인 */
        subsChangeVhclNo: getHandleDataByUrl()[findIdx].subsChangeVhclNo ?? '',
        hstrySn: getHandleDataByUrl()[findIdx].hstrySn ?? 0,
        bgngYmd: getHandleDataByUrl()[findIdx].bgngYmd ?? '',
        endYmd: getHandleDataByUrl()[findIdx].endYmd ?? '',
        chgRsnCn: getHandleDataByUrl()[findIdx].chgRsnCn ?? '',
        subsChangeRest: getHandleDataByUrl()[findIdx].subsChangeRest ?? '',
        subsChangeReject: getHandleDataByUrl()[findIdx].subsChangeReject ?? '',
        instcSpldmdTypeCd:
          getHandleDataByUrl()[findIdx].instcSpldmdTypeCd ?? '',
      })

      result = iterator.next()
    }
    // console.log(retArr)
    setManipulatedData(retArr)
  }

  /**
   * 모달 창 닫기
   */
  const handleClose = () => {
    commClearReduxData(pageUrl, dispatch)
    dispatch(closeExamResultModal())
  }

  /**
   * 행 선택 이벤트
   * @param row
   * @param rowIndex
   */
  const onRowClick = (row: any, rowIndex?: number) => {
    const idx = rowIndex ? rowIndex : 0
    // 선택한 행의 색깔 처리를 위함
    setSelectedIndex(idx)

    // 이전에 선택했던 값을 표시해주기 위함
    setTargetInfo({ ...manipulatedData[idx] })
  }

  /**
   * 체크박스 선택 이벤트
   * @param IDs
   */
  const onCheckChange = (IDs: string[]) => {
    /** 체크한 행의 row객체의 chk값을 변경한다.  */
    setManipulatedData((prevRows) => {
      const rows: manipulateObj[] = [...prevRows]
      const newRows = rows.map((value: manipulateObj, index: number) => {
        if (IDs.includes('tr' + index)) return { ...value, chk: '1' }
        else return { ...value, chk: '0' }
      })
      return newRows
    })
  }

  /**
   * 콤보박스 변경 이벤트
   * @param event
   * @returns
   */
  const handleSelectChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const selectElement = event.target as HTMLSelectElement // <select> 요소로 캐스팅
    if (!selectElement.selectedIndex) {
      return
    }
    const selectedOption = selectElement.options[selectElement.selectedIndex] // 선택된 <option>
    const displayedText = selectedOption.textContent // 화면에 보이는 텍스트 가져오기

    const { name, value } = event.target

    /** 화면의 콤보박스 값 설정 */
    setTargetInfo((prev) => ({
      ...prev,
      [name]: value,
      ...(name.includes('Cd')
        ? { [`${name.substring(0, name.length - 2)}Nm`]: displayedText }
        : { [`${name}Nm`]: displayedText }),
    }))
    //컴포넌트의 name값이 Cd가 있는 경우 Cd를 제거하고 Nm을 입력
    //컴포넌트의 name값이 Cd가 없는 경우 Nm을 추가
  }

  /**
   * 텍스트필드 입력 이벤트
   * @param event
   */
  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    /** 화면의 콤보박스 값 설정 */
    setTargetInfo((prev) => ({ ...prev, [name]: value }))
  }

  /**
   * 일괄버튼 이벤트
   * @returns
   */
  const handleAllSetting = () => {
    if (selectedIndex < 0) {
      alert('적용기준이 되는 행을 선택해주세요')
      return
    }

    // 1. 적용기준이 되는 행의 값을 가져온다.
    const stdObj: manipulateObj = manipulatedData[selectedIndex]
    const {
      rdmActnAmt,
      bzmnSeCd,
      bzmnSeNm,
      droperYnCd,
      droperYnNm,
      tpbizSeCd,
      tpbizSeNm,
    } = stdObj

    // 2. 1에서 가져온 인덱스 행의 값들로 세팅한다.
    setManipulatedData((prevRows) => {
      const newRows: manipulateObj[] = [...prevRows]
      manipulatedData.forEach((value: any, index: number) => {
        if (newRows[index].chk === '1') {
          newRows[index].rdmActnAmt = rdmActnAmt
          newRows[index].bzmnSeCd = bzmnSeCd
          newRows[index].bzmnSeNm = bzmnSeNm
          newRows[index].droperYnCd = droperYnCd
          newRows[index].droperYnNm = droperYnNm
          newRows[index].tpbizSeCd = tpbizSeCd
          newRows[index].tpbizSeNm = tpbizSeNm
        }
      })
      return newRows
    })
  }

  /**
   * 유효성 검사
   * @returns boolean
   */
  const validation = () => {
    const headCellIds: { id: string; label: string }[] =
      ilgCommExamResultPopHC.map((value, index) => {
        return { id: value.id, label: value.label }
      })
    // console.log(headCellIds)
    for (let row = 0; row < manipulatedData.length; row++) {
      const examResultData: manipulateObj = manipulatedData[row]
      for (let id = 0; id < headCellIds.length; id++) {
        if (headCellIds[id].id === 'rdmActnAmt') {
          continue
        }

        if (!examResultData[`${headCellIds[id].id}`]) {
          alert(`입력하지 않은 ${headCellIds[id].label} 정보가 있습니다.`)
          return false
        }
      }

      const { asstAmt, rdmActnAmt, exmnRsltCn } = examResultData

      if (Number(asstAmt) < Number(rdmActnAmt)) {
        alert('환수조치액은 유가보조금액 이상 입력할 수 없습니다.')
        return false
      }

      if (exmnRsltCn.length >= 200) {
        alert('조사결과 내용은 200자 미만으로 입력해주시기 바랍니다.')
        return
      }
    }
    return true
  }

  /**
   * 다음버튼 이벤트 ( 조사결과 등록 팝업 close, 행정처분 등록 팝업 open )
   * @returns
   */
  const goNextStep = () => {
    if (!validation()) {
      return
    }

    commSetExamResultData(pageUrl, dispatch, manipulatedData)
    dispatch(closeExamResultModal())
    dispatch(openExaathrModal())
    dispatch(setNextProp())
  }

  return (
    <Box>
      <Dialog
        fullWidth={false}
        maxWidth={'lg'}
        open={examResultInfo.erModalOpen}
        disableEscapeKeyDown
        onClose={(event, reason) => {
          if (reason === 'backdropClick') {
            return
          }
        }}
      >
        <DialogContent>
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              <h2>조사결과 등록</h2>
            </CustomFormLabel>
            <div className="button-right-align">
              <Button variant="contained" color="primary" onClick={goNextStep}>
                다음
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleAllSetting}
              >
                일괄
              </Button>
              <Button variant="contained" color="dark" onClick={handleClose}>
                닫기
              </Button>
            </div>
          </Box>
          <Box>
            {/* <TableDataGrid
              rows={[]}
              headCells={ilgCommExamResultPopHC}
              checkBoxClick={() => {}}
              handleSelectAllClick={() => {}}
            /> */}
            <TableDataGrid
              headCells={ilgCommExamResultPopHC} // 테이블 헤더 값
              rows={manipulatedData} // 목록 데이터
              // totalRows={rows.length} // 총 로우 수
              onRowClick={(row: any, rowIndex?: number) =>
                onRowClick(row, rowIndex)
              } // 행 클릭 핸들러 추가
              selectedRowIndex={selectedIndex}
              //onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
              // pageable={tapPageable} // 현재 페이지 / 사이즈 정보
              onCheckChange={onCheckChange}
              loading={false}
            />
            <BlankCard>
              <Box sx={{ maxWidth: 'fullWidth', margin: '0 auto' }}>
                <TableContainer style={{ margin: '0 0 0 0' }}>
                  <Table
                    className="table table-bordered"
                    aria-labelledby="tableTitle"
                    style={{ tableLayout: 'fixed', width: '100%' }}
                  >
                    <TableBody>
                      <TableRow>
                        <TableCell
                          className="td-head"
                          style={style.tableHeaderStyle}
                        >
                          거래건수
                        </TableCell>
                        <TableCell className="td-right">
                          {targetInfo.dlngNocs}
                        </TableCell>
                        <TableCell
                          className="td-head"
                          style={style.tableHeaderStyle}
                        >
                          거래금액
                        </TableCell>
                        <TableCell className="td-right">
                          {getCommaNumber(targetInfo.aprvAmt)}
                        </TableCell>
                        <TableCell
                          className="td-head"
                          style={style.tableHeaderStyle}
                        >
                          유가보조금
                        </TableCell>
                        <TableCell className="td-right">
                          {getCommaNumber(targetInfo.asstAmt)}
                        </TableCell>
                        <TableCell
                          className="td-head"
                          style={style.tableHeaderStyle}
                        >
                          환수조치액
                        </TableCell>
                        <TableCell>
                          <CustomTextField
                            sx={{ '& input': { textAlign: 'right' } }}
                            type="number"
                            id="rdmActnAmt"
                            name="rdmActnAmt"
                            value={targetInfo.rdmActnAmt}
                            onChange={handleChange}
                            disabled={selectedIndex < 0}
                            fullWidth
                          />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell
                          className="td-head"
                          style={style.tableHeaderStyle}
                        >
                          법인/개인
                        </TableCell>
                        <TableCell>
                          <CustomFormLabel
                            className="input-label-none"
                            htmlFor="sch-bzmnSeCd"
                          >
                            법인/개인
                          </CustomFormLabel>
                          <CommSelect
                            cdGroupNm="152" // 필수 O, 가져올 코드 그룹명
                            pValue={targetInfo.bzmnSeCd} // 필수 O, 화면 조회조건의 상태관리 변수를 기재해주시면 됩니다
                            handleChange={handleSelectChange} // 필수 O, 화면 내부 공통으로 사용중인 조회조건 함수를 기재해주시면 됩니다
                            pName="bzmnSeCd" // 필수 O, 공통코드같은 경우는 필히 name값을 기재해주셔야합니다
                            /* width */ // 필수 X, default 100% ** 특정 width 값이 필요하신 경우 기재해주시면 됩니다
                            htmlFor={'sch-bzmnSeCd'} // 필수 X, 조회조건으로 사용시 focus를 위해 htmlFor의 값을 기재해주시면 됩니다
                            pDisabled={selectedIndex < 0}
                            addText="전체" // 필수 X, 조회조건 제일 최상단에 배치할 값
                          />
                        </TableCell>
                        <TableCell
                          className="td-head"
                          style={style.tableHeaderStyle}
                        >
                          업종
                        </TableCell>
                        <TableCell className="td-center">
                          {targetInfo.tpbizNm}
                        </TableCell>
                        <TableCell
                          className="td-head"
                          style={style.tableHeaderStyle}
                        >
                          직영여부
                        </TableCell>
                        <TableCell>
                          <CustomFormLabel
                            className="input-label-none"
                            htmlFor="sch-droperYnCd"
                          >
                            직영여부
                          </CustomFormLabel>
                          <CommSelect
                            cdGroupNm="154" // 필수 O, 가져올 코드 그룹명
                            pValue={targetInfo.droperYnCd} // 필수 O, 화면 조회조건의 상태관리 변수를 기재해주시면 됩니다
                            handleChange={handleSelectChange} // 필수 O, 화면 내부 공통으로 사용중인 조회조건 함수를 기재해주시면 됩니다
                            pName="droperYnCd" // 필수 O, 공통코드같은 경우는 필히 name값을 기재해주셔야합니다
                            /* width */ // 필수 X, default 100% ** 특정 width 값이 필요하신 경우 기재해주시면 됩니다
                            htmlFor={'sch-droperYnCd'} // 필수 X, 조회조건으로 사용시 focus를 위해 htmlFor의 값을 기재해주시면 됩니다
                            pDisabled={selectedIndex < 0}
                            addText="전체" // 필수 X, 조회조건 제일 최상단에 배치할 값
                          />
                        </TableCell>
                        <TableCell
                          className="td-head"
                          style={style.tableHeaderStyle}
                        >
                          업종구분
                        </TableCell>
                        <TableCell>
                          <CustomFormLabel
                            className="input-label-none"
                            htmlFor="sch-tpbizSeCd"
                          >
                            업종구분
                          </CustomFormLabel>
                          <CommSelect
                            cdGroupNm="153" // 필수 O, 가져올 코드 그룹명
                            pValue={targetInfo.tpbizSeCd} // 필수 O, 화면 조회조건의 상태관리 변수를 기재해주시면 됩니다
                            handleChange={handleSelectChange} // 필수 O, 화면 내부 공통으로 사용중인 조회조건 함수를 기재해주시면 됩니다
                            pName="tpbizSeCd" // 필수 O, 공통코드같은 경우는 필히 name값을 기재해주셔야합니다
                            /* width */ // 필수 X, default 100% ** 특정 width 값이 필요하신 경우 기재해주시면 됩니다
                            htmlFor={'sch-tpbizSeCd'} // 필수 X, 조회조건으로 사용시 focus를 위해 htmlFor의 값을 기재해주시면 됩니다
                            pDisabled={selectedIndex < 0}
                            addText="전체" // 필수 X, 조회조건 제일 최상단에 배치할 값
                          />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell
                          className="td-head"
                          style={style.tableHeaderStyle}
                        >
                          조사결과
                        </TableCell>
                        <TableCell colSpan={7}>
                          <CustomTextField
                            type="text"
                            id="exmnRsltCn"
                            name="exmnRsltCn"
                            value={targetInfo.exmnRsltCn}
                            onChange={handleChange}
                            disabled={selectedIndex < 0}
                            fullWidth
                          />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </BlankCard>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  )
}

const style = {
  tableHeaderStyle: { width: '120px', verticalAlign: 'middle' },
}

export default ExamResultModal

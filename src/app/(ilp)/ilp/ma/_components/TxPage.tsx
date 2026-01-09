'use client'
import {
  Box,
  Button,
  FormControlLabel,
} from '@mui/material'
import React, { useEffect, useState, useMemo } from 'react'

import PageContainer from '@/components/container/PageContainer'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomCheckbox from '@/app/components/forms/theme-elements/CustomCheckbox'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'
import TableDataGrid from '@/app/components/tables/ilp/CommDataGrid'
import { getExcelFile } from '@/utils/fsms/common/comm'
import { maTxHc, maTxKoiHc, maTxVhclHc } from '@/utils/fsms/ilp/headCells'
import { getFormatToday, getToday, getDateRange } from '@/utils/fsms/common/dateUtils'
import { CtpvSelect, LocgovSelect, CommSelect } from '@/app/components/tx/commSelect/CommSelect'
import MilegAnlsModal from '@/app/components/ilp/popup/MilegAnlsModal'

export interface Row {
  koiCd: string
  koiNm: string
  dtaRegSttsCd: string
  dtaRegSttsNm: string
  regYmd: string
  bfrInspYmd: string
  drvngDstnc: number
  useLiter: number
  mileg: number
}

type GroupBy = 'BOTH' | 'KOI' | 'VHCL'

type listSearchObj = {
  page: number
  size: number
  bgngDt: string
  endDt: string
  ctpvCd?: string
  locgovCd?: string
  koiCd?: string
  dtaRegSttsCd?: string
  srchDtGb?: GroupBy
  [key: string]: string | number | undefined
}

const DataList = () => {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(false)

  const [prdAdupYn, setPrdAdupYn] = useState(false)
  const [isDataProcessing, setIsDataProcessing] = useState(false)
  const [enableExcel, setEnableExcel] = useState(false)

  // 체크박스 상태
  const [chkAll, setChkAll] = useState(false)
  const [chkKoi, setChkKoi] = useState(true)    // 처음 로드 때만 기본 체크
  const [chkVhcl, setChkVhcl] = useState(false)
 
  const [appliedGb, setAppliedGb] = useState<GroupBy>('KOI');

  // 분석 모달 상태
 const [milegModalOpen, setMilegModalOpen] = useState(false);
 const handleOpenMilegModal = () => {
    if (!rows || rows.length === 0) {
      alert('먼저 조회를 실행한 후 분석을 진행하세요.');
      return;
    }
    setMilegModalOpen(true);
 };
 const handleCloseMilegModal = () => setMilegModalOpen(false);
 const handleMilegRowClick = (row: any) => {
   // 필요하면 선택값을 조건에 반영
   if (row?.vhclNo) {
     setParams(prev => ({ ...prev, vhclNo: row.vhclNo }));
   }
   setMilegModalOpen(false);
 };

  const excelErrorMessage = '조회 후 엑셀 다운로드를 하시기 바랍니다.'

  const [params, setParams] = useState<listSearchObj>({
    page: 1,
    size: 10,
    bgngDt: '',
    endDt: '',
    srchDtGb: 'KOI',  // 처음 로드 때만 기본값
  })

  // 초기 기간 세팅
  useEffect(() => {
    const { startDate, endDate } = getDateRange('m', 1)
    setParams(prev => ({ ...prev, bgngDt: startDate, endDt: endDate }))
  }, [])

  useEffect(() => { setEnableExcel(false) }, [params])

  const validate = () => {
    const { bgngDt, endDt } = params
    if (!bgngDt) return alert('시작기간을 입력해주세요'), false
    if (!endDt) return alert('종료기간을 입력해주세요'), false
    if (new Date(bgngDt) > new Date(endDt)) {
      alert('종료거래년월이 시작거래년월보다 작을 수 없습니다.')
      return false
    }

    // 유종별/면허업종별 둘 다 해제된 경우 경고
    if (!chkKoi && !chkVhcl) {
      alert('유종별 또는 면허업종별을 하나 이상 선택하세요.')
      return false
    }
    return true
  }

  // 연동: 자식 체크 변경 시 전체 체크 상태만 동기화하고,
  // srchDtGb는 "둘 다 true → BOTH, 하나만 true → KOI/VHCL, 둘 다 false → 이전 값 유지"
  useEffect(() => {
    setChkAll(chkKoi && chkVhcl)
    setParams(prev => {
      const nextGb: GroupBy =
        chkKoi && chkVhcl ? 'BOTH' :
        chkKoi ? 'KOI' :
        chkVhcl ? 'VHCL' :
        (prev.srchDtGb as GroupBy) || 'KOI'  // 둘 다 false면 이전값 유지(초기만 KOI)
      return prev.srchDtGb === nextGb ? prev : { ...prev, srchDtGb: nextGb }
    })
  }, [chkKoi, chkVhcl])

  // 전체 토글: 체크 시 둘 다 true, 해제 시 둘 다 false (여기서 KOI로 강제 복귀하지 않음)
  const onToggleAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked
    setChkAll(checked)
    setChkKoi(checked)
    setChkVhcl(checked)
    // srchDtGb는 위 useEffect에서 자동 반영됨 (둘 다 false면 이전값 유지)
  }

  const onToggleKoi = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChkKoi(e.target.checked)
  }
  const onToggleVhcl = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChkVhcl(e.target.checked)
  }

  // 목록 조회
  const fetchData = async () => {
    setLoading(true)
    try {
      if (!validate()) return
      const qs = new URLSearchParams()
      qs.set('page', String(params.page))
      qs.set('size', String(params.size))
      if (params.bgngDt) qs.set('bgngDt', String(params.bgngDt).replaceAll('-', ''))
      if (params.endDt) qs.set('endDt', String(params.endDt).replaceAll('-', ''))
      if (params.ctpvCd) qs.set('ctpvCd', String(params.ctpvCd))
      if (params.locgovCd) qs.set('locgovCd', String(params.locgovCd))
      if (params.koiCd) qs.set('koiCd', String(params.koiCd))
      if (params.dtaRegSttsCd) qs.set('dtaRegSttsCd', String(params.dtaRegSttsCd))
      if (params.srchDtGb) qs.set('srchDtGb', String(params.srchDtGb))

      const endpoint = `/ilp/ma/tx/getMilegAnlsTx?${qs.toString()}`
      const response = await sendHttpRequest('GET', endpoint, null, true, { cache: 'no-store' })
      const list = Array.isArray(response?.data?.content) ? response.data.content : []
      setRows(list)
      setAppliedGb((params.srchDtGb ?? 'KOI') as GroupBy)
    } catch (err) {
      console.error(err)
      setRows([])
    } finally {
      setLoading(false)
      setEnableExcel(true)
    }
  }

  const excelDownload = async () => {
    if (!validate()) return
    if (rows.length === 0 || !enableExcel) return alert(excelErrorMessage)
    setIsDataProcessing(true)
    try {
      const qs = new URLSearchParams()
      qs.set('page', String(params.page))
      qs.set('size', String(params.size))
      if (params.bgngDt) qs.set('bgngDt', String(params.bgngDt).replaceAll('-', ''))
      if (params.endDt) qs.set('endDt', String(params.endDt).replaceAll('-', ''))
      if (params.ctpvCd) qs.set('ctpvCd', String(params.ctpvCd))
      if (params.locgovCd) qs.set('locgovCd', String(params.locgovCd))
      if (params.koiCd) qs.set('koiCd', String(params.koiCd))
      if (params.dtaRegSttsCd) qs.set('dtaRegSttsCd', String(params.dtaRegSttsCd))
      if (params.srchDtGb) qs.set('srchDtGb', String(params.srchDtGb))

      const endpoint = `/ilp/ma/tx/getExcelMilegAnlsTx?${qs.toString()}`
      await getExcelFile(endpoint, `택시_연비분석_${getToday()}.xlsx`)
    } finally {
      setIsDataProcessing(false)
    }
  }

  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    setParams(prev => ({ ...prev, page: 1, [name]: value }))
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') fetchData()
  }

const headCells = useMemo(() => {
   switch (appliedGb) {
     case 'KOI':  return maTxKoiHc;
     case 'VHCL': return maTxVhclHc;
     default:     return maTxHc; // BOTH
   }
 }, [appliedGb]);

const handleAnalyzeResult = (list: Row[], usedGb: GroupBy) => {
  setRows(list);
  setAppliedGb(usedGb);   // 헤더는 조회 이후에 반영
  setMilegModalOpen(false);
};

 // 검색조건이 바뀌면 목록/엑셀상태 초기화
useEffect(() => {
  setRows([]);
  setEnableExcel(false);
}, [
  params.bgngDt,
  params.endDt,
  params.ctpvCd,
  params.locgovCd,
  params.koiCd,
  params.dtaRegSttsCd,
  params.srchDtGb,   // 유종별/차종별 체크로 바뀌는 값
]);

// 전체선택 해제(= 유종/면허업종 모두 해제) 시 목록/엑셀 상태 초기화
useEffect(() => {
  if (!chkKoi && !chkVhcl) {
    setRows([]);
    setEnableExcel(false);
  }
}, [chkKoi, chkVhcl]);

  return (
    <PageContainer title="차량관리" description="차량관리 페이지">

      {/* 검색영역 시작 */}
      <Box component="form" sx={{ mb: 2 }}>      
        <Box className="sch-filter-box">
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel className="input-label-display" required>
                기간
              </CustomFormLabel>
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-start"
              >
                거래년월 시작
              </CustomFormLabel>
              <CustomTextField
                type="month"
                id="ft-date-start"
                name="bgngDt"
                value={params.bgngDt}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                inputProps={{
                  max: getFormatToday(),
                }}
                fullWidth
              />
              ~
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-end"
              >
                거래년월 종료
              </CustomFormLabel>
              <CustomTextField
                type="month"
                id="ft-date-end"
                name="endDt"
                value={params.endDt}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                inputProps={{
                  min: params.bgngDt,
                  max: getFormatToday(),
                }}
                fullWidth
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-koi"
              >
                유종
              </CustomFormLabel>
              <CommSelect
                cdGroupNm="ILPKOIB"
                pValue={params.koiCd as any}
                handleChange={handleSearchChange}
                pName="koiCd"           
                htmlFor={'sch-koi'}
                addText="전체"
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-vhcl"
              >
                차종
              </CustomFormLabel>
              <CommSelect
                cdGroupNm="210"
                pValue={params.dtaRegSttsCd as any}
                handleChange={handleSearchChange}
                pName="dtaRegSttsCd"
                htmlFor={'sch-vhcl'}
                addText="전체"
              />
            </div>
          </div>
          <hr></hr>
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-ctpv"
              >
                <span className="required-text">*</span>시도명
              </CustomFormLabel>
              <CtpvSelect
                pValue={params.ctpvCd as any}
                handleChange={handleSearchChange}
                htmlFor={'sch-ctpv'}
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-locgov"
              >
                <span className="required-text">*</span>관할관청
              </CustomFormLabel>
              <LocgovSelect
                ctpvCd={params.ctpvCd}
                pValue={params.locgovCd as any}
                handleChange={handleSearchChange}
                htmlFor={'sch-locgov'}
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-vhclNo"
              >
                구분
              </CustomFormLabel>
              <div className="check_group">
                <label className='check_item'>
                  <input 
                    type="checkbox" 
                    checked={chkAll}
                    onChange={onToggleAll}
                  />
                  전체
                </label>
                <label className='check_item'>
                  <input 
                    type="checkbox"
                    checked={chkKoi}
                    onChange={onToggleKoi}
                  />
                  유종별
                </label>
                <label className='check_item'>
                  <input 
                    type="checkbox"
                    checked={chkVhcl}
                    onChange={onToggleVhcl}
                  />
                  차종별
                </label>
              </div>
            </div>
          </div>
        </Box>

        {/* 검색영역 끝 */}

        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <Button
              onClick={() => fetchData()}
              variant="contained"
              color="primary"
            >
              검색
            </Button>
            <Button 
              type="button" 
              onClick={handleOpenMilegModal}
              variant="contained" color="secondary">
              분석
            </Button>
            <Button 
              type="button" 
              onClick={excelDownload}
              variant="contained" color="success">
              엑셀
            </Button>
          </div>
        </Box>
        {/* 검색영역 끝 */}
      </Box>

      {/* 테이블영역 시작 */}
        <Box>
          <TableDataGrid
            headCells={headCells} // 테이블 헤더 값
            rows={rows} // 목록 데이터
            loading={loading} // 로딩여부
            paging={false}
          />
        </Box>
      {/* 테이블영역 끝 */}

      {/* <LoadingBackdrop open={loadingBackdrop} /> */}
      
      {/* 연비 분석 모달 */}
      <MilegAnlsModal
        title="연비 분석"
        open={milegModalOpen}
        onRowClick={handleMilegRowClick}
        onCloseClick={handleCloseMilegModal}   // Dialog의 onClose도 이 함수로 호출됨
        RowClickClose
        baseParams={params}       // 현재 조회조건 전달
        baseGb={appliedGb}        // 현재 KOI/VHCL/BOTH
        baseRows={rows}           // BsPage에서 조회한 리스트 그대로 전달
        config={{
          endpoint: '/ilp/ma/tx/getMilegAnlsTx',
          secondGb: 'VHCL',
          secondLabel: '차종',
          secondParamKey: 'dtaRegSttsCd',
          secondNameKey: 'dtaRegSttsNm',
          headCells: {
            BOTH: maTxHc,
            KOI: maTxKoiHc,
            SECOND: maTxVhclHc,
          },
         }}
      />
    </PageContainer>
  )
}

export default DataList

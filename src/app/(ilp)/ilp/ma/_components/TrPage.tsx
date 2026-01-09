'use client'
import {
  Box,
  Button,
} from '@mui/material'
import React, { useEffect, useState, useMemo } from 'react'

import PageContainer from '@/components/container/PageContainer'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'
import TableDataGrid from '@/app/components/tables/ilp/CommDataGrid'
import { getExcelFile } from '@/utils/fsms/common/comm'
import { getFormatToday, getToday, getDateRange } from '@/utils/fsms/common/dateUtils'
import { CtpvSelect, LocgovSelect, CommSelect } from '@/app/components/tx/commSelect/CommSelect'
import MilegAnlsModal from '@/app/components/ilp/popup/MilegAnlsModal'
import { maTrHc } from '@/utils/fsms/ilp/headCells'
import { HeadCell } from 'table'

export interface Row {
  // 유종
  koiCd?: string
  koiNm?: string
  // 차종(등록상태)
  dtaRegSttsCd?: string
  dtaRegSttsNm?: string
  // 톤수
  vhclTonCd?: string
  vhclTonNm?: string

  // 공통
  regYmd: string
  bfrInspYmd: string
  drvngDstnc: number
  useLiter: number
  mileg: number
}

type GroupBy = 'BOTH' | 'KOI' | 'VHCL' | 'TON'

type listSearchObj = {
  page: number
  size: number
  bgngDt: string
  endDt: string
  ctpvCd?: string
  locgovCd?: string
  koiCd?: string
  dtaRegSttsCd?: string
  vhclTonCd?: string
  srchDtGb?: GroupBy

  grpKoi?: boolean
  grpVhcl?: boolean
  grpTon?: boolean

  [key: string]: string | number | boolean | undefined
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
  const [chkTon, setChkTon] = useState(false)

  // 모달 기준 GB(모달은 1축만 필요하므로 우선순위: KOI > VHCL > TON)
  const pickBaseGb = (): GroupBy => (chkKoi ? 'KOI' : chkVhcl ? 'VHCL' : chkTon ? 'TON' : 'KOI')
  const [appliedGb, setAppliedGb] = useState<GroupBy>('KOI')
  // 추가: 조회 시 확정되는 체크 스냅샷
  const [appliedChecks, setAppliedChecks] = useState({ koi: true, vhcl: false, ton: false })

  const pickGbFrom = (f: {koi:boolean; vhcl:boolean; ton:boolean}): GroupBy =>
    f.koi ? 'KOI' : f.vhcl ? 'VHCL' : f.ton ? 'TON' : 'KOI'

  // 분석 모달 상태
  const [milegModalOpen, setMilegModalOpen] = useState(false)
  const handleOpenMilegModal = () => {
    if (!rows || rows.length === 0) {
      alert('먼저 조회를 실행한 후 분석을 진행하세요.')
      return
    }
    setMilegModalOpen(true)
  }
  const handleCloseMilegModal = () => setMilegModalOpen(false)
  const handleMilegRowClick = (row: any) => {
    // 필요하면 선택값을 조건에 반영
    if (row?.vhclNo) {
      setParams(prev => ({ ...prev, vhclNo: row.vhclNo }))
    }
    setMilegModalOpen(false)
  }

  const excelErrorMessage = '조회 후 엑셀 다운로드를 하시기 바랍니다.'

  const [params, setParams] = useState<listSearchObj>({
    page: 1,
    size: 10,
    bgngDt: '',
    endDt: '',
   // srchDtGb: 'KOI',  // 초기 기본값
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
    // 세 축 모두 해제된 경우 경고
    if (!chkKoi && !chkVhcl && !chkTon) {
      alert('유종/차종/톤수 중 하나 이상 선택하세요.')
      return false
    }
    return true
  }

  // 자식 체크 변경 시 전체 체크 동기화 + (레거시) srchDtGb 업데이트(KOI/VHCL/BOTH까지만)
  useEffect(() => {
    setChkAll(chkKoi && chkVhcl && chkTon)

    const nextGb: GroupBy =
      chkKoi && chkVhcl && !chkTon ? 'BOTH' :
      chkKoi && !chkVhcl && !chkTon ? 'KOI'  :
      !chkKoi && chkVhcl && !chkTon ? 'VHCL' :
      params.srchDtGb || 'KOI'

    setParams(prev => ({
      ...prev,
      srchDtGb: nextGb,         // srchDtGb는 계산 결과로
      grpKoi: chkKoi,           // 항상 최신 체크값 반영
      grpVhcl: chkVhcl,
      grpTon: chkTon,
    }))
  }, [chkKoi, chkVhcl, chkTon])  // eslint-disable-line

  // 전체 토글
  const onToggleAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked
    setChkAll(checked)
    setChkKoi(checked)
    setChkVhcl(checked)
    setChkTon(checked)
  }

  const onToggleKoi = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChkKoi(e.target.checked)
  }
  const onToggleVhcl = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChkVhcl(e.target.checked)
  }
  const onToggleTon = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChkTon(e.target.checked)
  }

  // 목록 조회
  const fetchData = async () => {
    setLoading(true)
    try {
      if (!validate()) return

      // 이번 조회에서 사용할 체크 스냅샷
      const flags = { koi: chkKoi, vhcl: chkVhcl, ton: chkTon }

      const qs = new URLSearchParams()
      qs.set('page', String(params.page))
      qs.set('size', String(params.size))
      if (params.bgngDt) qs.set('bgngDt', String(params.bgngDt).replaceAll('-', ''))
      if (params.endDt) qs.set('endDt', String(params.endDt).replaceAll('-', ''))
      if (params.ctpvCd) qs.set('ctpvCd', String(params.ctpvCd))
      if (params.locgovCd) qs.set('locgovCd', String(params.locgovCd))
      if (params.koiCd) qs.set('koiCd', String(params.koiCd))
      if (params.dtaRegSttsCd) qs.set('dtaRegSttsCd', String(params.dtaRegSttsCd))
      if (params.vhclTonCd) qs.set('vhclTonCd', String(params.vhclTonCd))

      // 레거시 호환(선택): KOI/VHCL/BOTH
      //if (params.srchDtGb) qs.set('srchDtGb', String(params.srchDtGb))

      // 신규 동적 그룹 플래그
      // qs.set('grpKoi', String(chkKoi))
      // qs.set('grpVhcl', String(chkVhcl))
      // qs.set('grpTon', String(chkTon))

      // 서버엔 이번 조회 기준의 체크값으로 전송
      qs.set('grpKoi', String(flags.koi))
      qs.set('grpVhcl', String(flags.vhcl))
      qs.set('grpTon', String(flags.ton))


      const endpoint = `/ilp/ma/tr/getMilegAnlsTr?${qs.toString()}`
      const response = await sendHttpRequest('GET', endpoint, null, true, { cache: 'no-store' })
      const list = Array.isArray(response?.data?.content) ? response.data.content : []
      setRows(list)

      // ✅ 조회가 끝났으니 이제 스냅샷 확정(헤더/모달은 이 값만 사용)
      setAppliedChecks(flags)
      setAppliedGb(pickGbFrom(flags))
      //setAppliedGb(pickBaseGb())
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
      if (params.vhclTonCd) qs.set('vhclTonCd', String(params.vhclTonCd))
      if (params.srchDtGb) qs.set('srchDtGb', String(params.srchDtGb))
      // qs.set('grpKoi', String(chkKoi))
      // qs.set('grpVhcl', String(chkVhcl))
      // qs.set('grpTon', String(chkTon))
      // 마지막 조회 시 확정된 스냅샷 사용
      qs.set('grpKoi', String(appliedChecks.koi))
      qs.set('grpVhcl', String(appliedChecks.vhcl))
      qs.set('grpTon', String(appliedChecks.ton))

      const endpoint = `/ilp/ma/tr/getExcelMilegAnlsTr?${qs.toString()}`
      await getExcelFile(endpoint, `화물_연비분석_${getToday()}.xlsx`)
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

  // 동적 헤더 빌더 (선택된 축에 따라 유종/차종/톤수 컬럼 + 공통 컬럼 구성)
  // 동적 헤더 빌더 (체크된 축: 유종 → 차종 → 톤수 순서, 그리드 맨 앞에 배치)
  // 동적 헤더 빌더 (유종 → 차종 → 톤수 순, 그리드 맨 앞. 스냅샷 기반)
  const headCells: HeadCell[] = useMemo(() => {
    const base = maTrHc.filter(
      c => !['koiNm', 'dtaRegSttsNm', 'vhclTonNm'].includes(c.id as string)
    )

    const dynamic: HeadCell[] = []
    if (appliedChecks.koi) {
      dynamic.push({ id: 'koiNm', numeric: false, disablePadding: false, label: '유종' })
    }
    if (appliedChecks.vhcl) {
      dynamic.push({ id: 'dtaRegSttsNm', numeric: false, disablePadding: false, label: '차종' })
    }
    if (appliedChecks.ton) {
      dynamic.push({ id: 'vhclTonNm', numeric: false, disablePadding: false, label: '톤수' })
    }

    return [...dynamic, ...base]
  }, [appliedChecks])

  const handleAnalyzeResult = (list: Row[], usedGb: GroupBy) => {
    setRows(list)
    setAppliedGb(usedGb)   // 헤더는 동적이므로 별도 처리 없이 유지
    setMilegModalOpen(false)
  }

  // 검색조건이 바뀌면 목록/엑셀상태 초기화
  useEffect(() => {
    setRows([])
    setEnableExcel(false)
  }, [
    params.bgngDt,
    params.endDt,
    params.ctpvCd,
    params.locgovCd,
    params.koiCd,
    params.dtaRegSttsCd,
    params.vhclTonCd,
    params.srchDtGb,
  ])

  // 세 축 모두 해제 시 목록/엑셀 상태 초기화
  useEffect(() => {
    if (!chkKoi && !chkVhcl && !chkTon) {
      setRows([])
      setEnableExcel(false)
    }
  }, [chkKoi, chkVhcl, chkTon])

  // 모달용 보조 축(둘 다 체크면 차종 우선, 차종이 없고 톤수만 체크면 톤수)
  const modalSecondGb = chkVhcl ? 'VHCL' : chkTon ? 'TON' : 'VHCL'
  const modalSecondLabel = modalSecondGb === 'TON' ? '톤수' : '차종'
  const modalSecondParamKey = modalSecondGb === 'TON' ? 'vhclTonCd' : 'dtaRegSttsCd'
  const modalSecondNameKey = modalSecondGb === 'TON' ? 'vhclTonNm' : 'dtaRegSttsNm'

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
                cdGroupNm="ILPKOI"
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
                cdGroupNm="TMV"
                pValue={params.dtaRegSttsCd as any}
                handleChange={handleSearchChange}
                pName="dtaRegSttsCd"
                htmlFor={'sch-vhcl'}
                addText="전체"
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-Ton"
              >
                톤수
              </CustomFormLabel>
              <CommSelect
                cdGroupNm="971"
                pValue={params.vhclTonCd as any}
                handleChange={handleSearchChange}
                pName="vhclTonCd"
                htmlFor={'sch-Ton'}
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
                <label className='check_item'>
                  <input 
                    type="checkbox"
                    checked={chkTon}
                    onChange={onToggleTon}
                  />
                  톤수별
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
        onCloseClick={handleCloseMilegModal}
        RowClickClose
        baseParams={{
          ...params,
          srchDtGb: undefined,
          grpKoi:  appliedChecks.koi,     // ✅ 스냅샷 전달
          grpVhcl: appliedChecks.vhcl,
          grpTon:  appliedChecks.ton,
        }}
        baseGb={appliedGb}        // KOI/VHCL/TON 중 하나 (모달 기준축)
        baseRows={rows}
        config={{
          endpoint: '/ilp/ma/tr/getMilegAnlsTr',
          secondGb: modalSecondGb as 'VHCL' | 'TON',
          secondLabel: modalSecondLabel,
          secondParamKey: modalSecondParamKey,
          secondNameKey: modalSecondNameKey,
          // 모달 내부에서 사용한다면 헤더도 넘길 수 있음(선택)
          headCells:{ BOTH: headCells, KOI: headCells, SECOND: headCells },
        }}
      />
    </PageContainer>
  )
}

export default DataList

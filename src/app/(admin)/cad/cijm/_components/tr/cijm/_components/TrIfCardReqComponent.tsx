import React, { memo, useState } from 'react'
import { Grid, Button, RadioGroup, FormControlLabel, Box } from '@mui/material'
import BlankCard from '@/components/shared/BlankCard'
import { HeadCell } from 'table'
import {
  CustomFormLabel,
  CustomRadio,
  CustomTextField,
} from '@/utils/fsms/fsm/mui-imports'
import {
  CommSelect,
  CtpvSelect,
  LocgovSelect,
} from '@/components/tx/commSelect/CommSelect'
import { DetailRow } from '@/app/(admin)/cad/cijm/page'
// Props 타입 정의
interface Props {
  data?: any[] | Record<string, any>
}

//검색조건 인터페이스
interface SearchConditionProps {
  params: Record<string, any>
  handlers: {
    handlers: (
      event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => void
    handleReset?: () => void
    handleAdvancedSearch?: () => void
    handleExcelDownload?: () => void
    openModal?: () => void
  }
}

//조회
const SrchComponent: React.FC<SearchConditionProps> = memo(
  ({ params, handlers }) => {
    return (
      <>
        <Box className="sch-filter-box">
          <div className="filter-form">
            <>
              <div className="form-group">
                <CustomFormLabel
                  className="input-label-display"
                  htmlFor="sch-ctpv"
                >
                  <span className="required-text">*</span>시도명
                </CustomFormLabel>
                <CtpvSelect
                  pValue={params.ctpvCd}
                  handleChange={handlers.handleSearchChange}
                  pName="ctpvCd"
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
                  pValue={params.locgovCd}
                  handleChange={handlers.handleSearchChange}
                  pName="locgovCd"
                  htmlFor={'sch-locgov'}
                />
              </div>
              <div className="form-group">
                <CustomFormLabel
                  className="input-label-display"
                  htmlFor="sch-cardSe"
                >
                  처리상태
                </CustomFormLabel>
                <CommSelect
                  cdGroupNm="088"
                  pValue={params.locgovAprvYn}
                  handleChange={handlers.handleSearchChange}
                  pName="cardSeCd"
                  htmlFor={'sch-cardSe'}
                  addText="전체"
                />
              </div>
            </>
          </div>
          <hr></hr>
          <div className="filter-form">
            <>
              <div className="form-group">
                <CustomFormLabel
                  className="input-label-display"
                  htmlFor="sch-dt"
                >
                  <span className="required-text">*</span>기간
                </CustomFormLabel>
                <RadioGroup
                  row
                  id="srchDtGb"
                  name="srchDtGb"
                  className="mui-custom-radio-group"
                  onChange={handlers.handleSearchChange}
                  value={params.srchDtGb || ''}
                >
                  <FormControlLabel
                    control={
                      <CustomRadio id="rdo3_1" name="srchDtGb" value="01" />
                    }
                    label="접수일자"
                  />
                  <FormControlLabel
                    control={
                      <CustomRadio id="rdo3_2" name="srchDtGb" value="02" />
                    }
                    label="처리일자"
                  />
                </RadioGroup>
                <CustomTextField
                  value={params.bgngDt}
                  onChange={handlers.handleSearchChange}
                  name="bgngDt"
                  type="date"
                  id="ft-date-start"
                  fullWidth
                />
                <CustomTextField
                  value={params.endDt}
                  name="endDt"
                  onChange={handlers.handleSearchChange}
                  type="date"
                  id="ft-date-end"
                  fullWidth
                />
              </div>
              <div className="form-group">
                <CustomFormLabel
                  className="input-label-display"
                  htmlFor="ft-fname"
                >
                  차량번호
                </CustomFormLabel>
                <CustomTextField
                  id="ft-fname"
                  placeholder=""
                  fullWidth
                  name="vhclNo"
                  text={params.vhclNo}
                  onChange={handlers.handleSearchChange}
                />
              </div>
              <div className="form-group">
                <CustomFormLabel
                  className="input-label-display"
                  htmlFor="ft-fname"
                >
                  업체명
                </CustomFormLabel>
                <CustomTextField
                  id="ft-fname"
                  placeholder=""
                  fullWidth
                  name="brno"
                  text={params.bzentyNm}
                  onChange={handlers.handleSearchChange}
                />
              </div>
            </>
          </div>
        </Box>
      </>
    )
  },
)
//CRUD 버튼
const CRUDButtons: React.FC<SearchConditionProps> = ({
  params,
  handlers,
  data,
}) => {
  return (
    <Box className="table-bottom-button-group">
      <div className="button-right-align">
        {/* 조회 */}
        <Button
          variant="contained"
          color="primary"
          onClick={handlers.handleAdvancedSearch}
        >
          검색
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handlers.openModal('TrLocgovApvDeny', data)}
        >
          탈락
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handlers.openModal('TrLocgovApvAcc', data)}
        >
          승인
        </Button>
        {/* 엑셀 */}
        <Button
          variant="contained"
          color="success"
          onClick={handlers.handleExcelDownload}
        >
          엑셀
        </Button>
      </div>
    </Box>
  )
}

//헤더
const HeaderComponent: HeadCell[] = [
  {
    id: '',
    numeric: false,
    disablePadding: false,
    label: '변경이력',
    format: 'button',
    button: {
      label: '조회',
      color: 'primary',
      //onClick: {handleOpen}
    },
  },
  {
    id: 'detailConfirmNm',
    numeric: false,
    disablePadding: false,
    label: '의사결정',
  },
  {
    id: 'rcptYmd',
    numeric: false,
    disablePadding: false,
    label: '접수일자',
  },
  {
    id: 'locgovAprvNm',
    numeric: false,
    disablePadding: false,
    label: '처리상태',
  },
  {
    id: 'vhclNo',
    numeric: false,
    disablePadding: false,
    label: '차량번호',
  },
  {
    id: 'BidPermissionNm',
    numeric: false,
    disablePadding: false,
    label: '신규허가구분',
  },
  {
    id: 'bzmnPrmsnYmd',
    numeric: false,
    disablePadding: false,
    label: '허가일',
  },
  {
    id: 'permissionLit',
    numeric: false,
    disablePadding: false,
    label: '일할계산',
  },
  {
    id: 'crtrLimLiter',
    numeric: false,
    disablePadding: false,
    label: '기준한도',
  },
  {
    id: 'vhclPsnNm',
    numeric: false,
    disablePadding: false,
    label: '소유',
  },
  {
    id: 'vonrNm',
    numeric: false,
    disablePadding: false,
    label: '성명',
  },
  {
    id: 'vonrRrnoS',
    numeric: false,
    disablePadding: false,
    label: '주민등록번호',
  },
  {
    id: 'vonrBrno',
    numeric: false,
    disablePadding: false,
    label: '사업자번호',
  },
  {
    id: 'bzentyNm',
    numeric: false,
    disablePadding: false,
    label: '업체명',
  },
  {
    id: 'telno',
    numeric: false,
    disablePadding: false,
    label: '연락처',
  },
  {
    id: 'koiNm',
    numeric: false,
    disablePadding: false,
    label: '유종',
  },
  {
    id: 'vhclTonNm',
    numeric: false,
    disablePadding: false,
    label: '톤수',
  },
  {
    id: 'crdcoNm',
    numeric: false,
    disablePadding: false,
    label: '카드사',
  },
  {
    id: 'cardSeNm',
    numeric: false,
    disablePadding: false,
    label: '카드구분',
  },
  {
    id: 'cardNoS',
    numeric: false,
    disablePadding: false,
    label: '카드번호',
  },
]

//상세조회
const DetailComponent = memo(
  ({ data }: { data?: any[] | Record<string, any> }) => {
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
                    <col style={{ width: '12%' }} />
                    <col style={{ width: '13%' }} />
                    <col style={{ width: '12%' }} />
                    <col style={{ width: '13%' }} />
                    <col style={{ width: '12%' }} />
                    <col style={{ width: '13%' }} />
                    <col style={{ width: '12%' }} />
                    <col style={{ width: '13%' }} />
                  </colgroup>
                  <tbody>
                    <tr>
                      <th className="td-head" scope="row">
                        차량번호
                      </th>
                      <td colSpan={3}>
                        {data?.vhclNo}
                        <Button
                          variant="contained"
                          color="inherit"
                          style={{ marginLeft: '8px' }}
                          //onClick={}
                        >
                          자동차망조회
                        </Button>
                        <Button
                          variant="contained"
                          color="inherit"
                          style={{ marginLeft: '8px' }}
                          //onClick={}
                        >
                          정지및휴지조회
                        </Button>
                        <Button
                          variant="contained"
                          color="inherit"
                          style={{ marginLeft: '8px' }}
                          //onClick={}
                        >
                          운전자조회
                        </Button>
                      </td>
                      <th className="td-head" scope="row">
                        수급자명
                      </th>
                      <td></td>
                      <th className="td-head" scope="row">
                        법인등록번호
                      </th>
                      <td></td>
                    </tr>
                    <tr>
                      <th className="td-head" scope="row">
                        수급자주민등록번호
                      </th>
                      <td colSpan={3}>
                        <Button
                          variant="contained"
                          color="inherit"
                          style={{ marginLeft: '8px' }}
                          //onClick={}
                        >
                          개인/지입 차량확인
                        </Button>
                        <Button
                          variant="contained"
                          color="inherit"
                          style={{ marginLeft: '8px' }}
                          //onClick={}
                        >
                          소유카드
                        </Button>
                      </td>
                      <th className="td-head" scope="row">
                        사업자번호
                      </th>
                      <td colSpan={3}>
                        <Button
                          variant="contained"
                          color="inherit"
                          style={{ marginLeft: '8px' }}
                          //onClick={}
                        >
                          사업자(지입사)변경
                        </Button>
                      </td>
                    </tr>
                    <tr>
                      <th className="td-head" scope="row">
                        지자체명
                      </th>
                      <td colSpan={3}>
                        <Button
                          variant="contained"
                          color="inherit"
                          style={{ marginLeft: '8px' }}
                          //onClick={}
                        >
                          지자체변경
                        </Button>
                      </td>
                      <th className="td-head" scope="row">
                        톤수
                      </th>
                      <td></td>
                      <th className="td-head" scope="row">
                        유종
                      </th>
                      <td></td>
                    </tr>
                    <tr>
                      <th className="td-head" scope="row">
                        업체명
                      </th>
                      <td></td>
                      <th className="td-head" scope="row">
                        대표자명
                      </th>
                      <td></td>
                      <th className="td-head" scope="row">
                        연락처
                      </th>
                      <td></td>
                      <th className="td-head" scope="row">
                        차량소유구분
                      </th>
                      <td></td>
                    </tr>
                    <tr>
                      <th className="td-head" scope="row">
                        카드사
                      </th>
                      <td></td>
                      <th className="td-head" scope="row">
                        카드구분
                      </th>
                      <td></td>
                      <th className="td-head" scope="row">
                        카드번호
                      </th>
                      <td></td>
                      <th className="td-head" scope="row">
                        기존카드말소여부
                      </th>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              {/* 테이블영역 끝 */}
            </BlankCard>
          </Grid>
        </Grid>
        <Grid container spacing={2} className="card-container">
          <Grid item xs={12} sm={12} md={12}>
            <BlankCard className="contents-card" title="자동차망 연계정보">
              {/* 테이블영역 시작 */}
              <div className="table-scrollable">
                <table className="table table-bordered">
                  <caption>자동차망 연계정보</caption>
                  <colgroup>
                    <col style={{ width: '12%' }} />
                    <col style={{ width: '13%' }} />
                    <col style={{ width: '12%' }} />
                    <col style={{ width: '13%' }} />
                    <col style={{ width: '12%' }} />
                    <col style={{ width: '13%' }} />
                    <col style={{ width: '12%' }} />
                    <col style={{ width: '13%' }} />
                  </colgroup>
                  <tbody>
                    <tr>
                      <th className="td-head" scope="row">
                        차량정보
                      </th>
                      <td></td>
                      <th className="td-head" scope="row">
                        주민등록번호
                      </th>
                      <td></td>
                      <th className="td-head" scope="row">
                        성명(업체명)
                      </th>
                      <td></td>
                      <th className="td-head" scope="row">
                        지자체명
                      </th>
                      <td></td>
                    </tr>
                    <tr>
                      <th className="td-head" scope="row">
                        유종
                      </th>
                      <td></td>
                      <th className="td-head" scope="row">
                        차량구분
                      </th>
                      <td></td>
                      <th className="td-head" scope="row">
                        폐차여부
                      </th>
                      <td></td>
                      <th className="td-head" scope="row">
                        최종변경일
                      </th>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              {/* 테이블영역 끝 */}
            </BlankCard>
          </Grid>
        </Grid>
      </>
    )
  },
)

//리턴
const TrIfCardReqComponent = {
  SrchComponent,
  CRUDButtons,
  HeaderComponent,
  DetailComponent,
}

export default TrIfCardReqComponent

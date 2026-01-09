'use client'
import {
  Box,
  Button,
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
} from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useCallback, useEffect, useState } from 'react'

import PageContainer from '@/components/container/PageContainer'
import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'

// utils
import { sendHttpFileRequest, sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { toQueryString } from '@/utils/fsms/utils'

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'
import { SelectItem } from 'select'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
//import TableDataGrid from './_components/TableDataGrid'

// types
//import FormDialog from '@/app/components/popup/FormDialog'
import FormDialog from '../hpr/_components/FormModal'
import { listParamObj } from '@/types/fsms/fsm/listParamObj'
import { HeadCell, Pageable2 } from 'table'
import ModalContent from './_components/ModalContent'
import ModalContent2 from './_components/ModalContent2'

import DetailDataGrid from './_components/DetailDataGrid'
import { openReport } from '@/utils/fsms/common/comm'
import { getCommCd, getCtpvCd, getExcelFile, getLocGovCd, getToday ,getDateRange, getCommCdContent} from '@/utils/fsms/common/comm'

// 헤더셀
import {parHprHydroPapersTrHc} from '@/utils/fsms/headCells'

// 시도코드, 관할관청 조회
import {
  CtpvSelect,
  LocgovSelect,
  CommSelect,
} from '@/app/components/tx/commSelect/CommSelect'

import { ButtonGroupActionProps } from './_components/DetailDataGrid'

import {getFormatToday} from '@/utils/fsms/common/dateUtils'
import HySubConModal from './_components/HySubConModal'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import { getCodesByGroupNm } from '@/utils/fsms/common/code/getCode'
import { report } from 'process'

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '서면신청',
  },
  {
    title: '화물서면신청',
  },
  {
    to: '/par/hpr',
    title: '서면신청(수소)',
  },
]


export interface Row {
  giveYn: any
  aplySeCd: string
  aplySeNm?: string
  aplySttsCd: string
  aplySttsNm?: string
  aplyYm?: string
  aplySn?: string
  corpNm?: string
  bzentyNm?: string
  crno?: string
  crnoS?: string
  vonrBrno?: string
  vhclNo?: string
  daddr?: string
  telno?: string
  mbtlnum?: string
  bizSeCd?: string
  bizSeNm?: string
  useLiter?: string
  asstAmtLiter?: string
  totAsstAmt?: string
  paidAmt?: string
  unpaidAmt?: string
  dpstrNm?: string
  koiCd?: string
  koiNm?: string
  vhclTonCd?: string
  vhclTonNm?: string
  bankCd?: string
  bankNm?: string
  actno?: string
  locgovCd?: string
  rgtrId?: string
  regDt?: string
  mdfrId?: string
  mdfcnDt?: string
  bankList?: Row[]
  liter?: Row[]
  checked?:boolean
  elctcSn?: string
  filePathNm?: string
  fileNm?: string
}


// 목록 조회시 필요한 조건
type listSearchObj = {
  page: number
  size: number
  searchValue: string
  searchSelect: string
  searchStDate: string
  searchEdDate: string
  locgovCd: string
  //ctpvCd: number
  //locgovCd: number
  [key: string]: string | number // 인덱스 시그니처 추가
}


type commonCodeObj = {
  cdExpln: string
  cdGroupNm: string
  cdKornNm: string
  cdNm: string
  cdSeNm: string
  cdSeq: string
  comCdYn: string
  useNm: string
  useYn: string
}

const DataList = () => {

  const router = useRouter() // 화면이동을 위한객체
  const querys = useSearchParams() // 쿼리스트링을 가져옴
  const allParams: listParamObj = Object.fromEntries(querys.entries()) // 쿼리스트링 값을 오브젝트 형식으로 담음


  const [flag, setFlag] = useState<boolean|null>(null) // 데이터 갱신을 위한 플래그 설정
  const [row, setRow] = useState<Row>()
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부
  const [aplySeCode, setAplySeCode] = useState<SelectItem[]>([])
  const [localGovCode, setLocalGovCode] = useState<SelectItem[]>([]) // 관할관청 코드
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [selectedRow, setSelectedRow] = useState<Row|null>() // 선택된 Row를 저장할 state
  const [locgovCd, setLocgovCd] = useState<string|number>();
  const [bankCdItems, setBankCdItems] = useState<SelectItem[]>([]);
  const [vhclTonCdItems, setVhclTonCdItems] = useState<SelectItem[]>([]);
  const [remoteFlag, setRemoteFlag] = useState<boolean >(true);
  const [remoteFlag1, setRemoteFlag1] = useState<boolean >(true);


  const [searchLocgovCd,  setSearchLocgovCd] = useState<String>('');

  const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 로딩상태
  const [excelFlag, setExcelFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [searchAplySeCd, setSearchAplySeCd] = useState<string>('')
  
  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: 1, // 페이지 번호는 1부터 시작
    size: 10, // 기본 페이지 사이즈 설정
    locgovCd: allParams.searchValue ?? '',
    searchValue: allParams.searchValue ?? '', // 검색어
    searchSelect: allParams.searchSelect ?? 'ttl', // 종류
    searchStDate: allParams.searchStDate ?? '', // 시작일
    searchEdDate: allParams.searchEdDate ?? '', // 종료일
  })



  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1,
  })

  const remoteClose = () => {
    setRemoteFlag(false);
  }
  useEffect(() =>{
    setRemoteFlag(true);
  },[remoteFlag])

  const remoteClose1 = () => {
    setRemoteFlag1(false);
  }
  useEffect(() =>{
    setRemoteFlag1(true);
  },[remoteFlag1])

  // // 관할관청 select item setting
  // useEffect(() => { // 시도 코드 변경시 관할관청 재조회
  //   // 관할관청
  //   // if(params.ctpvCd) {
  //   //   getLocGovCd(params.ctpvCd).then((itemArr) => {
  //   //     setLocalGovCode(itemArr);
  //   //     setParams((prev) => ({...prev, locgovCd: itemArr[0].value})); // 첫번째 아이템으로 기본값 설정
  //   //   })
  //   // }
  // }, [params.ctpvCd])


  // 1. 화면 처음 로드
  // 초기 데이터 로드
  useEffect(() => {
    let aplySeCode: SelectItem[] = [
      {
        label: '전체',
        value: '',
      },
      {
        label: '온라인',
        value: 'O',
      },
      {
        label: '오프라인',
        value: 'P',
      },
    ]
    setAplySeCode(aplySeCode)

    const dateRange = getDateRange('m', 12);
    let startDate = dateRange.startDate;
    let endDate = dateRange.endDate;

    setParams((prev) => ({ ...prev, searchStDate: startDate, searchEdDate: endDate }))

    //getCommCdContent('973', '전체').then((itemArr) => setBankCdItems(itemArr))     // 은행코드
    //getCommCdContent('971', '전체').then((itemArr) => setVhclTonCdItems(itemArr))  // 은행코드
    handleCommCd();

  }, [])


  
  // 플래그를 통한 데이터 갱신
  // 플래그의 변화를 통해 현재 정보를 기준으로 데이터를 가져오기위해 설정
  //3. 여기서 조회를 함
  useEffect(() => {
    if(flag != null) {
      fetchData()
    }    
  }, [flag])

  useEffect(() => {
    //첫행조회
    if (rows.length > 0) {
      handleRowClick(rows[0], 0)
    }
  }, [rows])

  const handleCommCd = async () => {
    let bankCdList: Array<commonCodeObj> = await getCodesByGroupNm('973')
    let vhclTonCdList : Array<commonCodeObj> = await getCodesByGroupNm('971')
    setBankCdItems(bankCdList.map((val) => { return { label: val.cdKornNm, value: val.cdNm }})) 
    setVhclTonCdItems(vhclTonCdList.map((val) => { return { label: val.cdKornNm, value: val.cdNm }}))
  }


  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    setLoading(true)
    setSelectedRow(null)
    setSelectedIndex(-1)
    setExcelFlag(true)
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/par/hpr/tr/getAllHydroPapersReqst?page=${params.page}&size=${params.size}` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` + 
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` + 
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
        `${params.aplySeCd ? '&aplySeCd=' + params.aplySeCd : ''}` +
        `${params.aplySttsCd ? '&aplySttsCd=' + params.aplySttsCd : ''}` +
        `${params.vonrRrno ? '&vonrRrno=' + params.vonrRrno : ''}` +
        `${params.searchStDate ? '&aplyStartYm=' + params.searchStDate.replaceAll('-', '') : ''}` +
        `${params.searchEdDate ? '&aplyEndYm=' + params.searchEdDate.replaceAll('-', '') : ''}`

        // `${params.searchValue ? '&' + params.searchSelect + '=' + params.searchValue : ''}` +

        setSearchAplySeCd((params.aplySeCd+''))
      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        setSelectedRow(null)
        setSelectedIndex(-1)
        setRows(response.data.content)
        setTotalRows(response.data.totalElements)
        setPageable({
          pageNumber : response.data.pageable.pageNumber+1,
          //pageNumber : number,
          pageSize: response.data.pageable.pageSize,
          totalPages: response.data.totalPages,
        })

        setSearchLocgovCd(params.locgovCd ?? '')
      } else {
        // 데이터가 없거나 실패
        setSelectedRow(null)
        setSelectedIndex(-1)
        setRows([])
        setTotalRows(0)
        setPageable({
          pageNumber: 1,
          pageSize: 10,
          totalPages: 1,
        })
      }
    } catch (error) {
      // 에러시
      console.error('Error fetching data:', error)
      setSelectedRow(null)
      setSelectedIndex(-1)
      setRows([])
      setTotalRows(0)
      setPageable({
        pageNumber: 1,
        pageSize: 10,
        totalPages: 1,
      })
    } finally {
      setLoading(false)
    }
  }

    // 엑셀 다운로드
    const excelDownload = async () => {
  
        if(rows.length==0){
          alert('엑셀파일을 다운로드할 데이터가 없습니다.')
          return;
        }
  
        if(!excelFlag){
          alert("조회조건이 변경되었습니다. 검색 후 다운로드가 가능합니다.")
          return;
        }

        try{
          setLoadingBackdrop(true)

          let endpoint: string =
          `/fsm/par/hpr/tr/getExcelHydroPapersReqst?` +
          `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` + 
          `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` + 
          `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
          `${params.aplySeCd ? '&aplySeCd=' + params.aplySeCd : ''}` +
          `${params.aplySttsCd ? '&aplySttsCd=' + params.aplySttsCd : ''}` +
          `${params.vonrRrno ? '&vonrRrno=' + params.vonrRrno : ''}` +
          `${params.searchStDate ? '&aplyStartYm=' + params.searchStDate.replaceAll('-', '') : ''}` +
          `${params.searchEdDate ? '&aplyEndYm=' + params.searchEdDate.replaceAll('-', '') : ''}`
          
          await getExcelFile(endpoint, BCrumb[BCrumb.length-1].title + '_'+getToday()+'.xlsx')
      }catch(error){
        console.error("ERROR :: ", error);
      }finally{
        setLoadingBackdrop(false)
      }
    }
  

    const DeleteData = async () => {
      try {
        if(!selectedRow){
          alert('선택된 데이터가 없습니다. 데이터를 클릭해주세요.')
          return 
        }
        if(selectedRow.aplySeCd !== 'P' || (selectedRow.aplySttsCd !== '2' && selectedRow.aplySttsCd !== '3')){
          alert('신청구분이 오프라인이고 신청상태가 정산완료, 정산요청인 경우만 삭제가 가능합니다.');
          return;
        }
        const userConfirm = confirm('해당 서면신청건을 정산취소 하시겠습니까?');
        if(userConfirm) {
          let endpoint: string = `/fsm/par/hpr/tr/deleteHydroPaper`;
          let formData = {
            vhclNo: selectedRow.vhclNo,
            aplyYm: selectedRow.aplyYm,
            aplySn: selectedRow.aplySn,
            aplySeCd: selectedRow.aplySeCd,
            aplySttsCd: selectedRow.aplySttsCd,
          }
          const response = await sendHttpRequest('DELETE', endpoint, formData, true, {
            cache: 'no-store'
          })
          if(response && response.resultType == 'success') {
            alert(response.message);
            setSelectedIndex(-1);
            setSelectedRow(null);
            setFlag(!flag)
          }
        }
      }catch(error) {
        console.error("ERROR :: ", error);
      }
    }

  // 페이지 이동 감지 시작 //

  // 검색시 검색 조건에 맞는 데이터 갱신 및 1페이지로 이동
  const handleAdvancedSearch = (event: React.FormEvent) => {
    event.preventDefault()
    setParams((prev) => ({ ...prev, page: 1, size:10 })) // 첫 페이지로 이동
    setFlag(prev => !prev)
  }


  const handlePaginationModelChange = (page: number, pageSize: number) => {
    setParams((prev) => ({
      ...prev,
      page: page, // 실제 DB에서 조회시 -1을 하므로 +1 추가해서 넘겨야함. 페이지는 1로 보이지만 DB에선 0으로 조회
      size: pageSize,
    }))
    setFlag(prev => !prev)
  }

  // 행 클릭 시 호출되는 함수

  const handleRowClick = useCallback((selectedRow: Row , rowIndex?: number, colIndex?: number) => {
    setSelectedRow(selectedRow);
    setSelectedIndex(rowIndex ?? -1);
    //setLocgovCd(params.locgovCd);
  }, []);



  
const handleSearchChange = (
  event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
  const { name, value } = event.target
  const regex = /[~`!@#$%^&*()_\-+={}[\]|\\:;"'<>,.?/]/g
  if(name === 'vhclNo'){
    setParams((prev) => ({ ...prev, page: 1, [name]: value.replaceAll(regex, '').replaceAll(' ', '') }))
  }else{
    setParams((prev) => ({ ...prev, page: 1, [name]: value }))
  }
  setExcelFlag(false)
  }

  const buttonGroupActions: ButtonGroupActionProps = {
    // 체크 박스 선택된 행 전체 승인
    onClickModify: function (row : Row): void {
    },
    onClickFileDownload: async function  (): Promise<void> {
      // 파일 다운로드 핸들러
      if(selectedRow == null){
        return
      }

      if(!selectedRow.filePathNm || !selectedRow.fileNm){
        alert('증빙자료 파일이 없습니다.');
        return
      }

        try {
            let endpoint: string =
            `/fsm/par/hpr/tr/getHydroPaperFileDownload?` + 
            `${selectedRow.filePathNm ? '&filePathNm=' + selectedRow.filePathNm  : ''}` +
            `${selectedRow.fileNm ? '&fileNm=' + selectedRow.fileNm : ''}`
            const response = await sendHttpFileRequest('GET', endpoint, null, true, {
            cache: 'no-store',
            })
            const url = window.URL.createObjectURL(new Blob([response]));
            const link = document.createElement('a');
            console.log(response);
            link.href = url;
            link.setAttribute('download', selectedRow.fileNm as string);
            document.body.appendChild(link);
            link.click();

        } catch (error) {
            // 에러시
            console.error('Error fetching data:', error)
        }
    },
  }

  const reload = () => {
    setFlag(prev => !prev);
  }


  const hydroReport = async () =>{
        if(selectedRow == null){
          alert('출력할 대상이 없습니다.')
          return;
        }
        
        if(selectedRow.aplySeCd !== 'O'){
          alert('온라인 신청건만 출력이 가능합니다.')
          return
        }
        setLoadingBackdrop(true)
        try {
          // 검색 조건에 맞는 endpoint 생성
          
    
          let endpoint: string =
            `/fsm/par/hpr/tr/getHydroPaperReport?` +
            `${selectedRow.aplyYm ? '&aplyYm=' + selectedRow.aplyYm  : ''}` +
            `${selectedRow.aplySn ? '&aplySn=' + selectedRow.aplySn : ''}` +
            `${selectedRow.vhclNo ? '&vhclNo=' + selectedRow.vhclNo : ''}`
    
          const response = await sendHttpRequest('GET', endpoint, null, true, {
            cache: 'no-store',
          })
          if (response && response.resultType === 'success' && response.data) {
            const row : any = response.data.content

            const jsonData = { hydroPaperReportTr: row }
            
            handleReport(
              'hydroPaperReportTr',
              JSON.stringify(jsonData),
            )
    
          } else {
            // 데이터가 없거나 실패
            alert('출력할 대상이 없습니다..')
          }
        } catch (error) {
          // 에러시
          console.error('Error fetching data:', error)
      
        } finally {
            setLoadingBackdrop(false)
        }
  }

  // 클립리포트 호출출
  const handleReport = (crfName?: string, crfData?: string) => {
      openReport(crfName, crfData)
  }


  return (
    <PageContainer title="수소서면신청관리" description="수소서면신청관리">
      {/* breadcrumb */}
      <Breadcrumb title="수소서면신청관리" items={BCrumb} />
      {/* end breadcrumb */}

      {/* 검색영역 시작 */}
      <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
        <Box className="sch-filter-box">
          <div className="filter-form">
            <div className="form-group">
                <CustomFormLabel
                  className="input-label-display"
                  htmlFor="sch-ctpv"
                >
                  <span className="required-text">*</span>시도명
                </CustomFormLabel>
                <CtpvSelect
                  pValue={params.ctpvCd}
                  handleChange={handleSearchChange}
                  htmlFor={'sch-ctpv'}
                />
              </div>

              <div className="form-group">
                <CustomFormLabel
                  className="input-label-display"
                  htmlFor="sch-locgovCd"
                >
                  <span className="required-text">*</span>관할관청
                </CustomFormLabel>
                <LocgovSelect
                  ctpvCd={params.ctpvCd}
                  pValue={params.locgovCd}
                  handleChange={handleSearchChange}
                  htmlFor={'sch-locgovCd'}
                />
              </div>

              <div className="form-group">
                  <CustomFormLabel
                    className="input-label-display"
                    htmlFor="sch-vhclNo"
                  >
                    차량번호
                  </CustomFormLabel>
                  <CustomTextField  name="vhclNo"
                    value={params.vhclNo ?? ''}
                    onChange={handleSearchChange}  type="text" id="sch-vhclNo" fullWidth 
                    inputProps={{
                    maxLength: 9
                    }}
                    />
              </div>
          </div>

          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel className="input-label-display" >
                신청월
              </CustomFormLabel>
              <CustomFormLabel className="input-label-none" htmlFor="sch-date-start">주유월 시작연월</CustomFormLabel>
              <CustomTextField type="month" id="sch-date-start" name="searchStDate" value={params.searchStDate} onChange={handleSearchChange} 
              inputProps={{
                max: params.searchEdDate,
              }} fullWidth />
              ~              
              <CustomFormLabel className="input-label-none" htmlFor="sch-date-end">주유월 종료연월</CustomFormLabel>
              <CustomTextField type="month" id="sch-date-end" name="searchEdDate" value={params.searchEdDate} onChange={handleSearchChange} 
              inputProps={{
                min: params.searchStDate,
                }}fullWidth />
            </div>

            <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor="sch-aplySeCd">
                <span className="required-text" ></span>신청구분
              </CustomFormLabel>
                <select
                  id="sch-aplySeCd"
                  className="custom-default-select"
                  name="aplySeCd"
                  value={params.aplySeCd ?? ''}
                  onChange={handleSearchChange}
                  style={{ width: '100%' }}
                >
                  {aplySeCode.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
            </div>

            <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor="sch-aplySttsCd">
                <span className="required-text" ></span>신청상태
              </CustomFormLabel>
              <CommSelect                
                cdGroupNm='377'                    // 필수 O, 가져올 코드 그룹명    
                pValue={params.aplySttsCd}             // 필수 O, 화면 조회조건의 상태관리 변수를 기재해주시면 됩니다
                handleChange={handleSearchChange}   // 필수 O, 화면 내부 공통으로 사용중인 조회조건 함수를 기재해주시면 됩니다
                pName='aplySttsCd'                     // 필수 O, 공통코드같은 경우는 필히 name값을 기재해주셔야합니다
                /* width */                         // 필수 X, default 100% ** 특정 width 값이 필요하신 경우 기재해주시면 됩니다
                htmlFor={'sch-aplySttsCd'}             // 필수 X, 조회조건으로 사용시 focus를 위해 htmlFor의 값을 기재해주시면 됩니다
                addText='- 전체 -'                  // 필수 X, 조회조건 제일 최상단에 배치할 값
              />
            </div>
          </div>
        </Box>
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <LoadingBackdrop open={loadingBackdrop} />
            <Button type="submit" variant="contained" color="primary">
              검색
            </Button>
            <FormDialog
              size={'lg'}
              formId='post'
              buttonLabel="등록"
              formLabel="저장"
              title="수소서면신청 등록"
              remoteFlag={remoteFlag}
              selectedIndex={0}
              locgovCd={params.locgovCd+''}
              children={<ModalContent
                bankCdItems={bankCdItems}
                locgovCd= {params.locgovCd+''}
                reload={reload}
                remoteClose={remoteClose}   
                //vhclTonCdItems={vhclTonCdItems}
              />}
            />

            <FormDialog
              size={'lg'}
              buttonLabel="수정"
              formId='put'
              title="수소서면신청 수정"
              remoteFlag={remoteFlag1}
              selectedIndex={selectedIndex}
              data={selectedRow??undefined}
              children={<ModalContent2 
                bankCdItems={bankCdItems}
                data={selectedRow??undefined}
                vhclTonCdItems={vhclTonCdItems}
                reload={() => { setFlag(!flag)}}
                remoteClose={remoteClose1}   
            />
              }
              formLabel="저장"
            />
            <Button 
            variant="contained" onClick={() => {DeleteData()}} color="error">
              삭제
            </Button>
            <Button onClick={() => excelDownload()} variant="contained" color="success">
              엑셀
            </Button>
            <Button variant="contained" onClick={hydroReport}color="success">
              출력
            </Button>
          </div>
        </Box>
      </Box>
      {/* 검색영역 시작 */}

      {/* 테이블영역 시작 */}
      <Box>
        <TableDataGrid
          headCells={parHprHydroPapersTrHc} // 테이블 헤더 값
          rows={rows} // 목록 데이터
          totalRows={totalRows} // 총 로우 수
          loading={loading} // 로딩여부
          onRowClick={handleRowClick} // 행 클릭 핸들러 추가
          //detailBtnGroupActions={buttonGroupActions}
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          pageable={pageable} // 현재 페이지 / 사이즈 정보
          paging={false}
          selectedRowIndex={selectedIndex}
        />
      </Box>
      {/* 테이블영역 끝 */}

      {
        selectedRow != null? (
        <Grid item xs={4} sm={4} md={4}>
        <DetailDataGrid 
        btnActions={buttonGroupActions} 
        data={selectedRow}
        bankCdItems={bankCdItems}
        reload={() => {setFlag(!flag);}}
        />
        </Grid>
        ) : <></>
      }
    </PageContainer>
  )
}

export default DataList

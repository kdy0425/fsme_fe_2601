  'use client'
  import {
    Box,
    Button,
    Table,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    FormControlLabel,
  } from '@mui/material'
  import { useRouter, useSearchParams } from 'next/navigation'
  import React, { useEffect, useState, useCallback } from 'react'
  import BlankCard from '@/app/components/shared/BlankCard'

  import PageContainer from '@/components/container/PageContainer'
  import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'
  import { openReport } from '@/utils/fsms/common/comm'
  // utils
  import {
    sendHttpFileRequest,
    sendHttpRequest,
  } from '@/utils/fsms/common/apiUtils'
  import { toQueryString } from '@/utils/fsms/utils'

  // components
  import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
  import CustomCheckbox from '@/app/components/forms/theme-elements/CustomCheckbox'
  import CustomTextField from '@/components/forms/theme-elements/CustomTextField'

  import TableDataGrid from '../CustomStatisticsDataGrid'

  // types
  import { listParamObj } from '@/types/fsms/fsm/listParamObj'
  import { HeadCell, Pageable2 } from 'table'
  import {
    getCtpvCd,
    getCommCd,
    getLocGovCd,
    isValidDateRange,
    sortChange,
    getExcelFile,
  } from '@/utils/fsms/common/comm'
  import { SelectItem } from 'select'
  import {
    CtpvSelect,
    LocgovSelect,
    CommSelect,
  } from '@/app/components/tx/commSelect/CommSelect'
  import {
    getFormatToday,
    getToday,
    getDateRange,
  } from '@/utils/fsms/common/dateUtils'
import { arSA } from '@mui/material/locale'

  const BCrumb = [
    {
      to: '/',
      title: 'Home',
    },
    {
      title: '통계',
    },
    {
      title: '정보',
    },
    {
      to: '/sta/vpss',
      title: '차량 지급정지 집계',
    },
  ]

  export interface data {

  }


  export interface headr {

  }



  export interface Row {

    ym: string
    minYm: string
    maxYm: string
    gbNm: string
    stts: string
    totSum: string
    data: string
    header: string

  }

  // 목록 조회시 필요한 조건
  type listSearchObj = {
    searchStDate: string
    searchEdDate: string
    [key: string]: string | number // 인덱스 시그니처 추가
  }

  const DataList = () => {
    const router = useRouter() // 화면이동을 위한객체
    const querys = useSearchParams() // 쿼리스트링을 가져옴
    const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
    const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
    const [totalRows, setTotalRows] = useState(0) // 총 수
    const [loading, setLoading] = useState(false) // 로딩여부

    const [enableData, setEnableData] = useState<boolean>(false)

    const [head, setHead] = useState<HeadCell[]>([]) // 총 수
    const [head2, setHead2] = useState<HeadCell[]>([]) // 총 수

    const [datas, setDatas] = useState<any[]>([]) // 로딩여부

    const [mergYn, setMergYn] = useState(false) // 로딩여부

    // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
    const [params, setParams] = useState<listSearchObj>({
      searchStDate: '', // 시작일
      searchEdDate: '', // 종료일
    })
    //
    const [pageable, setPageable] = useState<Pageable2>({
      pageNumber: 1, // 페이지 번호는 1부터 시작
      pageSize: 10, // 기본 페이지 사이즈 설정
      totalPages: 1,
    })

    // 초기 데이터 로드
    useEffect(() => {
      setEnableData(false)
      const dateRange = getDateRange('m', 1)
      let startDate = dateRange.startDate
      let endDate = dateRange.endDate
      setParams((prev) => ({
        ...prev,
        searchStDate: startDate,
        searchEdDate: endDate,
      }))
    }, [])

      // 데이터에서 headCells 생성
      const createHeadCells = (header: any[]): HeadCell[] => {
        return header.map((item) => ({
          id: item.mapId, // 열의 ID
          label: item.mapNm, // 열의 이름
          numeric: false, // 숫자 여부 (필요에 따라 수정)
          disablePadding: false, // 패딩 여부
        }));
      };


      const customHeader = (header: any[]): React.ReactNode => {
        // 첫 번째 소계 독립 처리
        const independentSum = header.find((item) => item.mapId === "_SUB");
      
        // 그룹화 처리: 소계부터 다음 소계까지를 한 그룹으로 묶기
        const groupedData = header
          .filter((item) => item.mapId !== "_SUB") // 독립 소계 제외
          .reduce((acc: { groups: Record<string, any[]>; currentGroup: string }, item) => {
            const isNewGroup = item.mapId.endsWith("_SUB");
            if (isNewGroup) {
              acc.currentGroup = item.mapId; // 새 그룹 시작
              acc.groups[acc.currentGroup] = [];
            }

            if (!acc.currentGroup)
            {
              acc.currentGroup = "all"; // 새 그룹 시작
              acc.groups[acc.currentGroup] = [];
            }
            acc.groups[acc.currentGroup].push(item);
            return acc;
          }, { groups: {}, currentGroup: "" }).groups;
      
        return (
          <TableHead>
            <TableRow>
              {/* 고정 헤더 */}
              <TableCell rowSpan={2} style={{ whiteSpace: "nowrap" }}>
                년월
              </TableCell>
              <TableCell rowSpan={2} style={{ whiteSpace: "nowrap" }}>
                구분
              </TableCell>
              <TableCell rowSpan={2} style={{ whiteSpace: "nowrap" }}>
                상태
              </TableCell>
              {
                header.length > 1 && (
                <TableCell rowSpan={2} style={{ whiteSpace: "nowrap" }}>
                  합계
                </TableCell>
              )}
              {/* 그룹 헤더 (서울특별시, 부산광역시 등) */}
              {/* {Object.entries(groupedData).map(([groupKey, regions]) => (
                <TableCell
                  key={groupKey}
                  colSpan={regions.length}
                  style={{ whiteSpace: "nowrap" }}
                >
                  {regions[0]?.ctpNm || "기타"}
                </TableCell>
              ))} */}
              {Object.entries(groupedData).map(([groupKey, regions]) => {
                const regionHeader = regions[0]
                const mapRowSpan = regionHeader.mapNm === regionHeader.ctpNm
                return (
                  <TableCell
                    key={groupKey}
                    colSpan={mapRowSpan ? 1 : regions.length}
                    rowSpan={mapRowSpan ? 2 : 1}
                    style={{ whiteSpace: "nowrap" }}
                  >
                    {regionHeader?.ctpNm || "기타"}
                  </TableCell>
                )
              })}
            </TableRow>
            <TableRow>
              {/* 하위 헤더 (각 구, 소계) */}
              {Object.values(groupedData).flatMap((regions) =>
                regions.map((region) => {
                  if (region.mapNm === region.ctpNm)
                  {
                    return null
                  } else {
                    return (
                      <TableCell key={region.mapId} style={{ whiteSpace: "nowrap" }}>
                        {region.mapNm}
                      </TableCell>
                    )
                  }
                })
              )}
            </TableRow>
          </TableHead>
        );
      };


      const getHeader = (header: any[]): HeadCell[] => {

        //header 요소 

      //   {
      //     "mapNm": "소계",
      //     "ctpNm": "",
      //     "mapId": "_SUB"
      // },
      // {
      //     "mapNm": "소계",
      //     "ctpNm": "서울특별시",
      //     "mapId": "11_SUB"
      // },
      // {
      //     "mapNm": "강남구",
      //     "ctpNm": "",
      //     "mapId": "11680"
      // },

        // 년월  쭉  // 구분  상태 // 합계

        const headCells: HeadCell[] = [
        {
          id: 'ym' , // 열의 ID
          numeric: false, // 숫자 여부 (필요에 따라 수정)
          disablePadding: false,
          label: '년월', // 열의 이름
          rowspan : true,
          format: 'yyyy년mm월,yyyy년mm월~yyyy년mm월'
        },
        {
          id: 'gbNm', // 열의 ID
          numeric: false, // 숫자 여부 (필요에 따라 수정)
          disablePadding: false,
          label: '구분', // 열의 이름 
          rowspan : true,
          
        },
        {
          id: 'AAA', // 열의 ID
          numeric: false, // 숫자 여부 (필요에 따라 수정)
          disablePadding: false,
          label: '상태', // 열의 이름 
        },
        ]
        if (header.length > 1)
        {
            headCells.push(
            {
              id: 'totSum', // 열의 ID
              numeric: false, // 숫자 여부 (필요에 따라 수정)
              disablePadding: false,
              label: '합계', // 열의 이름
              align: 'td-right', // 기본적으로 숫자값이니까 우측 정렬 
              format: 'number' 
            })    
        }
        header.filter((item) => item.mapId !== "totSum") .forEach((item) => headCells.push({
          id: item.mapId, // 열의 ID
          numeric: false, // 숫자 여부 (필요에 따라 수정)
          disablePadding: false,
          label: item.ctpNm, // 열의 이름
          align: 'td-right', // 기본적으로 숫자값이니까 우측 정렬 
          format: 'number' 
        }));

        return headCells 
      };

      
    
      // 데이터에서 rows 생성


      // 각각 만 가져오면 된다. 
      // {
            // year :  년월 
            // gb   :  구분
            // sum  :  합계 
            // 쭉 데이터 렌더링 ~~!~!~~!
      // }

      
      const createRows = (data: any[], header: any[]): any[] => {
        return data.map((row) => {
          const processedRow: any = {};
          header.forEach((item) => {
            processedRow[item.mapId] = row[item.mapId];
          });
          return processedRow;
        });
      };



      
    // Fetch를 통해 데이터 갱신
    const fetchData = async () => {
      setLoading(true)
      try {
        if (!params.searchStDate || !params.searchEdDate) {
          alert('기간을 입력해주세요.')
          return
        }

        // 검색 조건에 맞는 endpoint 생성
        let endpoint: string =
          `/fsm/sta/vpss/getAllVhclePymntStopSm?` +
        `${params.searchStDate ? '&bgngDt=' + params.searchStDate.replaceAll('-', '') : ''}` +
        `${params.searchEdDate ? '&endDt=' + params.searchEdDate.replaceAll('-', '') : ''}` +
        `${params.srchGb ? '&srchGb=' + params.srchGb : ''}` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${mergYn ? '&mergYn=Y': '&mergYn=N'}`



        const response = await sendHttpRequest('GET', endpoint, null, true, {
          cache: 'no-store',
        })
        if (response && response.resultType === 'success' && response.data) {
          // 데이터 조회 성공시
          let result  = response.data.header
          
          setHead(getHeader((response.data.header)))
          setHead2(response.data.header)

          customHeader(response.data.header) 

          setRows(response.data.data)



        } else {
          // 데이터가 없거나 실패
          setRows([])
          setTotalRows(0)
        }
      } catch (error) {
        // 에러시
        setRows([])
        setTotalRows(0)
      } finally {
        setLoading(false)
        setEnableData(true)
      }
    }

    const excelDownload = async () => {
      if (!params.searchStDate || !params.searchEdDate) {
        alert('기간을 입력해주세요.')
        return
      }
      let endpoint: string =
        `/fsm/sta/vpss/cm/getExcelVhclePymntStopSm?` +
        `${params.searchStDate ? '&bgngDt=' + params.searchStDate.replaceAll('-', '') : ''}` +
        `${params.searchEdDate ? '&endDt=' + params.searchEdDate.replaceAll('-', '') : ''}` +
        `${params.srchGb ? '&srchGb=' + params.srchGb : ''}` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${mergYn ? '&mergYn=Y': '&mergYn=N'}`

      await  getExcelFile(
        endpoint,
        BCrumb[BCrumb.length - 1].title + '_' + getToday() + '.xlsx',
      )
    }

    const handleReport = async () => {  
                
      if (!enableData) {
        alert('데이터 조회 후 출력하시기 바랍니다.')
        return
      }else if (rows.length == 0) {
        alert('출력할 데이터가 없습니다.')
        return
      }    
      let endpoint: string =
        `/fsm/sta/vpss/cm/getPrintVhclePymntStopSm?` +
        `${params.searchStDate ? '&bgngDt=' + params.searchStDate.replaceAll('-', '') : ''}` +
        `${params.searchEdDate ? '&endDt=' + params.searchEdDate.replaceAll('-', '') : ''}` +
        `${params.srchGb ? '&srchGb=' + params.srchGb : ''}` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${mergYn ? '&mergYn=Y': '&mergYn=N'}`
  
      try {
        const response = await sendHttpRequest('GET', endpoint, null, true, {
          cache: 'no-store',
        });

        console.log(response?.resultType)
        
        if (
          response?.resultType === 'success' &&
          Array.isArray(response.data) &&
          response.data.length > 0
        ) {
          const resultData = response.data.map((item: any) => ({
            ...item,
            excnEndYmd: getToday(),
          }));
  
          let crfName = "vhclePymntStopSm";
          const crfResultData = {
            [crfName]: resultData,
          };
          const crfData = JSON.stringify(crfResultData);
  
          openReport(crfName, crfData);
        } else {
          alert('출력할 데이터가 없습니다.');
        }
      } catch (error) {
        console.error('Error generating report:', error);
        alert('리포트 생성 중 오류가 발생했습니다.');
      }
    };

    const handleSearchChange = (
      event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
      const { name, value } = event.target
      setParams((prev) => ({ ...prev, page: 1, [name]: value }))
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        fetchData()
      }
    }


    return (
      <PageContainer
        title="차량 지급정지 집계"
        description="차량 지급정지 집계"
      >
        {/* breadcrumb */}
        <Breadcrumb title="차량 지급정지 집계" items={BCrumb} />
        {/* end breadcrumb */}

        {/* 검색영역 시작 */}
        <Box component="form" sx={{ mb: 2 }}>
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
                  htmlFor="sch-locgov"
                >
                  <span className="required-text">*</span>관할관청
                </CustomFormLabel>
                <LocgovSelect
                  ctpvCd={params.ctpvCd}
                  pValue={params.locgovCd}
                  handleChange={handleSearchChange}
                  pDisabled={params.ctpvCd === ""}
                  htmlFor={'sch-locgov'}
                />
              </div>
              <div className="form-group">
                <CustomFormLabel
                  className="input-label-display"
                  htmlFor="sch-srchGb"
                >
                  구분
                </CustomFormLabel>
                <CommSelect
                  cdGroupNm="801"
                  pValue={params.srchGb}
                  handleChange={handleSearchChange}
                  pName="srchGb"
                  htmlFor={'sch-srchGb'}
                  addText="전체"
                />
              </div>
            </div>
            <div className="filter-form">
              <div className="form-group">
                <CustomFormLabel className="input-label-display">
                  <span className="required-text">*</span>기간
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
                  name="searchStDate"
                  value={params.searchStDate}
                  onChange={handleSearchChange}
                  onKeyPress={handleKeyDown}
                  inputProps={{
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
                  name="searchEdDate"
                  value={params.searchEdDate}
                  onChange={handleSearchChange}                  
                  onKeyPress={handleKeyDown}
                  inputProps={{
                  }}
                  fullWidth
                />
              </div>
              <div className="form-group" style={{ maxWidth: '8rem' }}>
                <CustomFormLabel className="input-label-display">
                  기간합산여부
                </CustomFormLabel>
                <FormControlLabel
                  control={
                    <CustomCheckbox
                      name="mergYn"
                      value={mergYn}
                      onChange={() => setMergYn(!mergYn)}
                    />
                  }
                  label=""
                />
              </div>              
            </div>
          </Box>
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
                onClick={() => excelDownload()}
                variant="contained"
                color="success"
              >
                엑셀
              </Button>
              <Button
                onClick={() => handleReport()}
                variant="contained"
                color="success"
              >
                출력
              </Button>
            </div>
          </Box>
        </Box>
        {/* 검색영역 시작 */}

        {/* 테이블영역 시작 */}
        <>
          { head &&
        <Box>
          <TableDataGrid
            headCells={head} // 테이블 헤더 값
            rows={rows} // 목록 데이터
            totalRows={totalRows} // 총 로우 수
            loading={loading} // 로딩여부
            //pageable={pageable} // 현재 페이지 / 사이즈 정보
            paging={false}
            cursor={false}

            customHeader={() => customHeader(head2 as any[])}
            maxRowBoolean={true}
            maxRowInfo={[{name :'gbNm', maxRow:2}]}
            caption={"차량 지급정지 집계 테이블"}
          />
        </Box>

          }

        </>
        {/* 테이블영역 끝 */}
      </PageContainer>
    )
  }

  export default DataList

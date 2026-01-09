'use client'

/* React */
import React, { useCallback, useEffect, useState } from 'react'

/* 공통js */
import { toQueryParameter } from '@/utils/fsms/utils'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { getExcelFile } from '@/utils/fsms/common/comm'
import { getToday } from '@/utils/fsms/common/dateUtils'
import { getUserInfo } from '@/utils/fsms/utils'

/* 공통 type, interface */
import { Pageable2 } from 'table'
import { stnWslmSch } from '@/utils/fsms/headCells'
import { SelectItem } from 'select'

/* 공통 component */
import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'
import PageContainer from '@/components/container/PageContainer'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import { CommSelect } from '@/app/components/tx/commSelect/CommSelect'

/* mui component */
import { Box } from '@mui/material'

/* _component */
import Buttons from './_components/Buttons'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '기준관리',
  },
  {
    title: '보조금지급시행기준',
  },
  {
    to: '/stn/wslm',
    title: '전국표준한도관리',
  },
]

export interface Row {
  koiCd:string, // 유종코드
	koiNm:string, // 유종코드 명
	vhclTonCd:string, // 차량톤수코드
	vhclTonNm:string, // 차량톤수코드 명
	crtrAplcnYmd:string, // 고시기준일
	crtrAplcnYmdHyp:string, // 고시기준일(조회조건 display용도)
	crtrYear:string, // 기준년도
	limUseRt:number, // 한도비율
	crtrLimLiter:number, // 한도리터
	avgUseLiter:number, // 월지급기준량
	aplcnYn:string, // 적용여부
	aplcnNm:string, // 적용여부
}

// 목록 조회시 필요한 조건
interface listSearchObj {
  page:number,
  size:number,
  crtrAplcnYmd:string,
  vhclTonCd:string,
  koiCd:string,
  aplcnYn:string,
}

const DataList = () => {
  
  const userInfo = getUserInfo();
  const [crtrAplcnYmdCode, setCrtrAplcnYmdCode] = useState<SelectItem[]>([]); // 고시기준일
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [rowIndex, setRowIndex] = useState<number>(-1);
  const [selectedRow, setSelectedRow] = useState<Row|null>(null) 
  const [pageable, setPageable] = useState<Pageable2>({ pageNumber:1, pageSize:10, totalPages:1 }); // paging 객체
  const [loading, setLoading] = useState(false) // 로딩여부
  const [excelFlag, setExcelFlag] = useState<boolean>(false) // 조회조건 변경 시 엑셀기능 동작여부
  const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 로딩상태
  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [params, setParams] = useState<listSearchObj>({    
    page:1,
    size:10,
    crtrAplcnYmd:'',
    vhclTonCd:'',
    koiCd:'',
    aplcnYn:'',
  });

  useEffect(() => {    
    fetchCrtrAplcnYmd(); // 고시기준일 가져오기
    setExcelFlag(true);

  }, []);

  useEffect(() => {
    fetchData(); // 조회
  }, [flag]);

  // 고시기준일 조회조건 가져오기
  const fetchCrtrAplcnYmd = async () => {
    
    const crtrAplcnYmd: SelectItem[] = [{label: '전체', value: ''}];

    try {

      const endpoint:string = '/fsm/stn/wslm/cm/getAllCrtrAplcnYmd';
      const response = await sendHttpRequest('GET', endpoint, null, true, { cache: 'no-store' });

      if (response && response.resultType === 'success' && response.data) {
        
        response.data.map((item: any) => {
          crtrAplcnYmd.push({
            label:item.crtrAplcnYmdHyp,
            value:item.crtrAplcnYmd
          })
        });        
      }
    } catch (error) {
      console.log(error);
    } finally {
      setCrtrAplcnYmdCode(crtrAplcnYmd);
    }
  }

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    
    setLoading(true)
    setExcelFlag(true) // 엑셀기능 동작여부

    try {

      const searchObj = {
        ...params,
        page:params.page,
        size:params.size,
        strRcptYmd:params.crtrAplcnYmd.replaceAll('-', ''),
      };
      
      const endpoint = '/fsm/stn/wslm/cm/getAllWntyStdLmtMng' + toQueryParameter(searchObj);
      const response = await sendHttpRequest('GET', endpoint, null, true, {cache: 'no-store'});

      if (response && response.resultType === 'success' && response.data.content.length != 0) {
        setRows(response.data.content);
        setTotalRows(response.data.totalElements)
        setPageable({
          pageNumber: response.data.pageable.pageNumber + 1,
          pageSize: response.data.pageable.pageSize,
          totalPages: response.data.totalPages,
        })
        
        onRowClick(response.data.content[0], 0);

      } else {
        // 데이터가 없거나 실패
        setRows([])
        setTotalRows(0)
        setPageable({
          pageNumber: 1,
          pageSize: 10,
          totalPages: 1,
        })
        setRowIndex(-1);
        setSelectedRow(null);
      }
    } catch (error) {
      // 에러시
      setRows([])
      setTotalRows(0)
      setPageable({
        pageNumber: 1,
        pageSize: 10,
        totalPages: 1,
      })
      setRowIndex(-1);
      setSelectedRow(null);
    } finally {
      setLoading(false)
    }
  }



  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
  
    setParams((prev) => {
      // 기존 값과 새 값이 다를 경우에만 setExcelFlag(false) 호출
      if (prev[name as keyof listSearchObj] !== value) {
        setExcelFlag(false);
      }
      return { ...prev, page: 1, [name]: value };
    });
  };

  // row클릭시
  const onRowClick = useCallback((row:Row, index?:number) => {
    setSelectedRow(row);
    setRowIndex(index ?? -1);
  }, []);

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handlePaginationModelChange = useCallback((page: number, pageSize: number) => {
    setParams((prev) => ({ ...prev, page:page, size:pageSize }));
    setFlag(prev => !prev)
  }, []);

  // 조회클릭시
  const handleAdvancedSearch = () => {
    setParams((prev) => ({ ...prev, page:1, size:10 }));
    setFlag(prev => !prev);
  };

  // 저장 삭제 수정시 고시기준일 및 재조회
  const reload = (type?:'reload') => {
    
    if(type == 'reload') {
      fetchCrtrAplcnYmd();
    }

    handleAdvancedSearch();    
  };

  // 엑셀 다운르도 
  const excelDownload = async () => {

    if(rows.length == 0){
      alert('엑셀파일을 다운로드할 데이터가 없습니다.')
      return;
    }

    if(!excelFlag){
      alert('조회조건이 변경되었습니다. 검색 후 다운로드가 가능합니다.')
      return
    }

    try{
      setLoadingBackdrop(true)
      const searchObj = {
        ...params,
        crtrAplcnYmd:params.crtrAplcnYmd.replaceAll('-', ''),
      };
      
      const endpoint = '/fsm/stn/wslm/cm/getExcelWntyStdLmtMng' + toQueryParameter(searchObj);    

      await  getExcelFile(endpoint, '전국표준한도관리_' + getToday() + '.xlsx');
    }catch(error){
      console.error("ERROR :: ", error)
    }finally{
      setLoadingBackdrop(false)
    }
  }

  // 데이터 삭제 API 요청  
  const handleDelete = async () => {

    const crtrAplcnYmd = selectedRow?.crtrAplcnYmd.replaceAll('-', '');

    if (userInfo.roles[0] != 'ADMIN') {
      alert('관리자권한만 사용 가능합니다.');
      return;
    } 
    
    if (!selectedRow) {
      alert('선택된 데이터가 없습니다.');
      return;
    }

    if (selectedRow?.aplcnYn == 'Y') {
      alert('마감된 데이터는 삭제 불가능합니다');
      return;
    }

    if (Number(crtrAplcnYmd) <= Number(getToday())) {
      alert('고시기준일이 금일 이후일 경우에만 삭제 가능합니다.');
      return;
    }

    if(confirm('삭제 하시겠습니까?')) {

      setLoadingBackdrop(true);

      try {

        const body = {          
          koiCd: selectedRow?.koiCd,
          vhclTonCd: selectedRow?.vhclTonCd,
          crtrAplcnYmd: selectedRow?.crtrAplcnYmd.replaceAll('-',''),
        }
        
        const endpoint = '/fsm/stn/wslm/cm/deleteWntyStdLmtMng';        
        const response = await sendHttpRequest('DELETE', endpoint, body, true, { cache: 'no-store' })
        
        if (response && response.resultType === 'success' ) {
          alert('삭제되었습니다.');
          reload('reload');
        } else {
          alert(response.message);
          reload('reload');
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoadingBackdrop(false);
      }
    }
  }


  return (
    <PageContainer title="전국표준한도관리" description="전국표준한도관리">

      <Breadcrumb title="전국표준한도관리" items={BCrumb} />

      {/* 검색영역 시작 */}
      <Box component="form" sx={{ mb: 2 }}>
        <Box className="sch-filter-box">
          <div className="filter-form">

            <div className="form-group">
              <CustomFormLabel className="input-label-display">
              고시기준일
              </CustomFormLabel>
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-crtrAplcnYmd"
              >
                고시기준일
              </CustomFormLabel>
              <select
                  id="ft-crtrAplcnYmd"
                  className="custom-default-select"
                  name="crtrAplcnYmd"
                  value={params.crtrAplcnYmd}
                  onChange={handleSearchChange}
                  style={{ width: '100%' }}
                >
                  { crtrAplcnYmdCode.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-vhclTonCd"
              >
                톤수 
              </CustomFormLabel>
              <CommSelect
                cdGroupNm="971"
                pValue={params.vhclTonCd}
                handleChange={handleSearchChange}
                pName="vhclTonCd"
                htmlFor={'sch-vhclTonCd'}
                addText="전체"
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-koiCd"
              >
                유종
              </CustomFormLabel>
              <CommSelect
                cdGroupNm="977"
                pValue={params.koiCd}
                handleChange={handleSearchChange}
                pName="koiCd"
                htmlFor={'sch-koiCd'}
                addText="전체"
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-aplcnYn"
              >
                적용여부
              </CustomFormLabel>
              <CommSelect
                cdGroupNm="APYN"
                pValue={params.aplcnYn}
                handleChange={handleSearchChange}
                pName="aplcnYn"
                htmlFor={'sch-aplcnYn'}
                addText="전체"
              />
            </div>
          </div>
        </Box>
        <LoadingBackdrop open={loadingBackdrop} />
        <Buttons          
          reload={reload}
          excelDownload={excelDownload}
          handleDelete={handleDelete}
          rows={rows}
        />
      </Box>

      {/* 테이블영역 시작 */}
      <Box >
        <TableDataGrid
          headCells={stnWslmSch} // 테이블 헤더 값
          rows={rows} // 목록 데이터
          totalRows={totalRows} // 총 로우 수
          loading={loading} // 로딩여부
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          onRowClick={onRowClick} // 행 클릭 핸들러 추가
          pageable={pageable} // 현재 페이지 / 사이즈 정보
          selectedRowIndex={rowIndex}
          caption={"전국표준한도관리 목록 조회"}
        />
      </Box>
    </PageContainer>
  )
}

export default DataList

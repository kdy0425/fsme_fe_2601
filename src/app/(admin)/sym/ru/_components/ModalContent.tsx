import TableDataGrid from '@/app/components/tables/CommDataGrid2';
import { CtpvSelectAll, LocgovSelectAll } from '@/app/components/tx/commSelect/CommSelect';
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils';
import { CustomFormLabel, CustomTextField } from '@/utils/fsms/fsm/mui-imports';
import { Box } from '@mui/material';
import { useEffect, useState } from 'react';
import { HeadCell, Pageable2 } from 'table';



const headCells: HeadCell[] = [
  {
    id: 'check',
    numeric: false,
    disablePadding: false,
    label: '선택',
    format: 'checkbox'
  },
  {
    id: 'ctpvNm',
    numeric: false,
    disablePadding: false,
    label: '시도명',
  },
  {
    id: 'locgovNm',
    numeric: false,
    disablePadding: false,
    label: '시군구명',
  },
  {
    id: 'userNm',
    numeric: false,
    disablePadding: false,
    label: '사용자명',
  },
  {
    id: 'lgnId',
    numeric: false,
    disablePadding: false,
    label: '사용자ID',
  },
];

interface Row {
  userTsid: string;
  lgnId: string;
  userNm: string;
  mngNo: string;
  ctpvCd: string;
  ctpvNm: string;
  instCd: string;
  instNm: string;
  deptCd: string;
  deptNm: string;
  jbgdCd: string;
  jbgdNm: string;
  zip: string;
  part1Addr: string;
  part2Addr: string;
  telno: string;
  fxno: string;
  emlAddr: string;
  issuDt: string;
  userAcntSttsCd: string;
  prhibtRsnCn: string;
  ahrztKeyNo: string;
  regDt: string;
  rgtrId: string;
  mdfcnDt: string;
  mdfrId: string;
  tkcgTaskNm: string;
  lastLgnDt: string;
  subDnEncpt: string;
  pswdChgYnCd: string;
  ipAddr: string;
  aplyBgngYmd: string;
  aplyEndYmd: string;
  newYn: string;
  newPswd: string;
  lgnFailNmtm: string;
  mbtlnum: string;
  smsRcptnYn: string;
  locgovNm: string;
  userTypeCdList: string;
}

type listSearchObj = {
  sort: string
  page: number
  size: number
  searchValue: string
  searchSelect: string
  searchStDate: string
  searchEdDate: string
  [key: string]: string | number // 인덱스 시그니처 추가
}

interface ModalProperties { 
  userTypeCd: string
  typeNm: string
  reloadFn: () => void
}

const ModalContent = (props : ModalProperties) => {
  const { userTypeCd, typeNm, reloadFn } = props

  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩
  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1,
    pageSize: 10,
    totalPages: 1,
  }) // 페이지 정보
  const [params, setParams] = useState<listSearchObj>({
    page: 1,
    size: 10,
    sort: '',
    searchValue: '',
    searchSelect: '',
    searchStDate: '',
    searchEdDate: '',
  }) // 검색 조건

  const [checkedItems, setCheckedItems] = useState<Row[]>([]);

  useEffect(() => {
    fetchData();
  }, [flag])

  const fetchData = async () => {
      setLoading(true)
      try {
        // 검색 조건에 맞는 endpoint 생성
        let endpoint: string =
          `/fsm/sym/ru/cm/getAllUser?page=${params.page}&size=${params.size}` +
          `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
          `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
          `${params.userNm ? '&userNm=' + params.userNm : ''}`
  
        const response = await sendHttpRequest('GET', endpoint, null, true, {
          cache: 'no-store',
        })
        if (response && response.resultType === 'success' && response.data) {
          // 데이터 조회 성공시
          setRows(response.data.content)
          setTotalRows(response.data.totalElements)
          setPageable({
            pageNumber: response.data.pageable.pageNumber + 1,
            pageSize: response.data.pageable.pageSize,
            totalPages: response.data.totalPages,
          })
        } else {
          // 데이터가 없거나 실패
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

  const registerUser = async () => {
    try {
      if(checkedItems.length === 0) {
        alert('등록할 사용자를 선택해주세요.')
        return;
      }

      const userConfirm = confirm(`선택된 사용자를 [${typeNm}] 역할에 설정하시겠습니까?`)

      if(!userConfirm) {
        return;
      }

      let endpoint:string = `/fsm/sym/ru/cm/createRoleUser`

      let roleUserList = checkedItems.map((item) => {
        return {
          lgnId: item.lgnId,
          userTypeCd: userTypeCd
        }
      })

      let formData = {
        roleUserList: roleUserList
      }

      const response = await sendHttpRequest('POST', endpoint, formData, true, {
        cache: 'no-store'
      })

      if(response && response.resultType == 'success') {
        alert(response.message);
        reloadFn();
      }else {
        alert(response.message);
      }

    }catch(error) {
      console.error(error);
    }
  }

  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    
    setParams((prev) => ({ ...prev, [name]: value }))
  }
  
  const handlePaginationModelChange = (page: number, pageSize: number) => {
    setParams((prev) => ({
      ...prev,
      page: page, // 실제 DB에서 조회시 -1을 하므로 +1 추가해서 넘겨야함. 페이지는 1로 보이지만 DB에선 0으로 조회
      size: pageSize,
    }))
    setFlag(!flag)
  }

  const handleCheckChange = (selected:string[]) => {
    let checkedRows:Row[] = [];
        
    selected.map( (item) => {
        let index: number = Number(item.replace('tr', ''));
        checkedRows.push( 
          rows[index]
        )
      }
    )
    
    setCheckedItems(checkedRows);
  }
  
  const searchUser = async (event: React.FormEvent) => {
    event.preventDefault()
    fetchData()
  }

  const submitUser = async (event: React.FormEvent) => {
    event.preventDefault()
    registerUser()
  }


  return (
    <Box sx={{width:'700px'}}>
      <Box component='form' id='search-user' onSubmit={searchUser} className="sch-filter-box" sx={{mb:2}}>
        <div className="filter-form">
          <div className="form-group">
            <CustomFormLabel className="input-label-display" htmlFor={'sch-ctpv'} required>
              시도명
            </CustomFormLabel>
            <CtpvSelectAll
              pName='ctpvCd'
              pValue={params.ctpvCd} 
              handleChange={handleSearchChange}
              htmlFor={'sch-ctpv'}
            />
          </div>
          <div className="form-group">
            <CustomFormLabel className="input-label-display" htmlFor={'sch-locgov'} required>
              관할관청
            </CustomFormLabel>
            <LocgovSelectAll
              pName='locgovCd'
              pValue={params.locgovCd} 
              ctpvCd={params.ctpvCd}
              handleChange={handleSearchChange}
              htmlFor={'sch-locgov'}
            />
          </div>
        </div>
        <div className="filter-form">
          <div className="form-group">
            <CustomFormLabel className="input-label-display" htmlFor={'ft-userNm'} required>
              사용자명
            </CustomFormLabel>
            <CustomTextField id="ft-userNm" name='userNm' value={params.userNm} onChange={handleSearchChange} fullWidth />
          </div>
        </div>
      </Box>
      <Box component='form' id='register-user' onSubmit={submitUser} className="sch-filter-box" sx={{mb:2}}>
        <div className="filter-form">
          <div className="form-group">
            <CustomFormLabel className="input-label-display" htmlFor={'ft-typeNm'}>
              사용자유형명
            </CustomFormLabel>
            <CustomTextField id="ft-typeNm" value={typeNm} onChange={handleSearchChange} readOnly inputProps={{readOnly: true}} fullWidth />
          </div>
        </div>
      </Box>
      <Box>
        <TableDataGrid 
          headCells={headCells} 
          loading={loading}
          rows={rows}
          totalRows={totalRows}
          pageable={pageable}
          onPaginationModelChange={handlePaginationModelChange}
          onCheckChange={handleCheckChange}
        />
      </Box>
    </Box>
  );
}

export default ModalContent;
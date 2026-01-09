import {
    CustomFormLabel,
    CustomTextField,
} from '@/utils/fsms/fsm/mui-imports'
import {
    Box,
    Button,
    Dialog,
    DialogContent,
} from '@mui/material'
import React, { useEffect, useState, useCallback } from 'react'


import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'

import { listParamObj } from '@/types/fsms/fsm/listParamObj'
import { HeadCell, Pageable2 } from 'table'

import { Menu } from '../page'
import { symmenuProgramSearchModalHeadCell } from '@/utils/fsms/headCells'

interface ProgramSearchProps {
    title: string
    url: string
    open: boolean
    onRowClick: (menu :Menu) => void
    onCloseClick: () => void
}


// 목록 조회시 필요한 조건
type listSearchObj = {
    page: number
    size: number
    [key: string]: string | number // 인덱스 시그니처 추가
}

export const ProgramSearchModal = (props: ProgramSearchProps) => {
    const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정

    const [rows, setRows] = useState<Menu[]>([]) // 가져온 로우 데이터
    const [totalRows, setTotalRows] = useState(0) // 총 수
    const [loading, setLoading] = useState(false) // 로딩여부
    const [selectedIndex, setSelectedIndex] = useState<number>(-1);

    const { title, url, open, onRowClick ,onCloseClick } = props

    const [params, setParams] = useState<listSearchObj>({
        page: 1, // 페이지 번호는 1부터 시작
        size: 10, // 기본 페이지 사이즈 설정
    })
    //
    const [pageable, setPageable] = useState<Pageable2>({
        pageNumber: 1, // 페이지 번호는 1부터 시작
        pageSize: 10, // 기본 페이지 사이즈 설정
        totalPages: 1, // 정렬 기준
    })

    useEffect(() => {

    setRows([])
    setParams({
        page: 1, // 페이지 번호는 1부터 시작
        size: 10, // 기본 페이지 사이즈 설정
    })
    setPageable({
        pageNumber: 1, // 페이지 번호는 1부터 시작
        pageSize: 10, // 기본 페이지 사이즈 설정
        totalPages: 1, // 정렬 기준
    })
    }, [open])

    const handleProgramRowDoubleClick = (menu: Menu) => {
        onRowClick(menu)
        onCloseClick()
    }

    const handleProgramRowClick = (menu: Menu,index?: number) => {
        onRowClick(menu)
        setSelectedIndex(index ?? -1);
    }

    // Fetch를 통해 데이터 갱신
    const fetchData = async () => {
    setLoading(true)
    try {

        if (!params.prgrmNm) {
            alert('프로그램명을 입력해주세요.')
        return
        }

        ///fsm/sym/fmm/cm/getAllProgrm
        let endpoint: string =
        `${url}?page=${params.page}&size=${params.size}&` +
        `${params.prgrmNm ? '&prgrmNm=' + params.prgrmNm : ''}` 

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

    // 페이지 이동 감지 시작 //
    // 검색시 검색 조건에 맞는 데이터 갱신 및 1페이지로 이동
    const handleAdvancedSearch = (event: React.FormEvent) => {
        event.preventDefault()
        setParams((prev) => ({ ...prev, page: 1 })) // 첫 페이지로 이동
        setFlag(!flag)
        }
    
        // 페이지 번호와 페이지 사이즈를 params에 업데이트
        const handlePaginationModelChange = useCallback(
        (page: number, pageSize: number) => {
            setParams((prev) => ({
            ...prev,
            page: page, // 실제 DB에서 조회시 -1을 하므로 +1 추가해서 넘겨야함. 페이지는 1로 보이지만 DB에선 0으로 조회
            size: pageSize,
            }))
            setFlag((prev) => !prev)
        },
        [],
        )
    
        const handleSearchChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
        ) => {
        const { name, value } = event.target
        setParams((prev) => ({ ...prev, [name]: value }))
        }
    
        const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
            if (event.key === 'Enter') {
                fetchData()
            }
        }
    
        return (
        <Box>
            <Dialog
            fullWidth={true}
            maxWidth={'md'}
            open={open}
            onClose={onCloseClick}
            >
            <DialogContent>
                <Box className="table-bottom-button-group">
                    <CustomFormLabel className="input-label-display">
                    <h2>{title}</h2>
                    </CustomFormLabel>
                <div className=" button-right-align">
                    <Button variant="contained" color="primary" 
                    type={'submit'}
                    //onClick={fetchData}
                    >
                    검색
                    </Button>
                    <Button
                    variant="contained"
                    color="dark"
                    onClick={onCloseClick}
                    >
                    취소
                    </Button>
                </div>
                </Box>
                <Box sx={{ ml: 6}}>더블 클릭시 창이 닫히고 선택됩니다.</Box>

                {/* 검색영역 시작 */}
                <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
                <Box className="sch-filter-box">
                    <div className="filter-form">
                        <div className="form-group">
                            <CustomFormLabel className="input-label-display" htmlFor="ft-prgrmNm">
                            <span className="required-text">*</span>프로그램명
                            </CustomFormLabel>
                            <CustomTextField
                            id="ft-prgrmNm"
                            name="prgrmNm"
                            value={params.prgrmNm ?? ''}
                            onChange={handleSearchChange}
                            onKeyDown={handleKeyDown}
                            />
                        </div>
                    </div>
                </Box>
                </Box>
                {/* 검색영역 시작 */}
    
                {/* 테이블영역 시작 */}
                <Box>
                <TableDataGrid
                    headCells={symmenuProgramSearchModalHeadCell} // 테이블 헤더 값
                    rows={rows} // 목록 데이터
                    totalRows={totalRows} // 총 로우 수
                    loading={loading} // 로딩여부
                    onRowDoubleClick={handleProgramRowDoubleClick} // 더블클릭 핸들러 추가
                    selectedRowIndex={selectedIndex}
                    onRowClick={handleProgramRowClick} // 행 클릭 핸들러 추가
                    onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
                    pageable={pageable} // 현재 페이지 / 사이즈 정보
                    paging={true}
                    cursor={false}
                />
                </Box>
                {/* 테이블영역 끝 */}
            </DialogContent>
            </Dialog>
        </Box>
        )
    }

export default ProgramSearchModal

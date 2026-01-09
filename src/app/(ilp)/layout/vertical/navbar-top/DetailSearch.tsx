import moment                         from "moment";
import { isEmpty }                    from "lodash";
import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { IconX }                      from "@tabler/icons-react";
import {
    Box,
    Typography,
    Drawer,
    IconButton,
    FormControlLabel,
    FormGroup, 
    RadioGroup,
    Button
} from "@mui/material";
import CustomFormLabel from "@/components/forms/theme-elements/CustomFormLabel";
import CustomTextField from "@/components/forms/theme-elements/CustomTextField";
import CustomRadio     from "@/components/forms/theme-elements/CustomRadio";
import CustomCheckbox  from "@/components/forms/theme-elements/CustomCheckbox";
import { UnifySearch } from "@/types/unify/unify";

const DetailSearch = () => {
    const querys = useSearchParams() // 쿼리스트링을 가져옴
    const router = useRouter()
    const allParams: UnifySearch = Object.fromEntries(querys.entries()) // 쿼리스트링 값을 오브젝트 형식으로 담음

    const [showDrawer, setShowDrawer] = useState(false);

    const [params, setParams] = useState<UnifySearch>({
        searchWord: allParams.searchWord ?? '',
        preSearchWord: allParams.preSearchWord ?? '',
        searchOption: allParams.searchOption ?? 'AND',
        searchRange: allParams.searchRange ?? '',
        startDate: allParams.startDate ? moment(allParams.startDate).format("YYYY-MM-DD") ?? '' : '',
        endDate: allParams.endDate ? moment(allParams.endDate).format("YYYY-MM-DD") ?? '' : '',
        reSearchYn: allParams.reSearchYn ?? ''
    })
    const [searchRange, setSearchRange] = useState<string[]>(allParams.searchRange?.split("$|") ?? [])

    useEffect(() => {
        setParams((prev) => ({
            ...prev,
            searchWord: allParams.searchWord ?? '',
            preSearchWord: allParams.preSearchWord ?? '',
            searchSort: allParams.searchSort ?? 'DATE',
            searchOption: allParams.searchOption ?? 'AND',
            searchRange: allParams.searchRange ?? '',
            startDate: allParams.startDate ? moment(allParams.startDate).format("YYYY-MM-DD") ?? '' : '',
            endDate: allParams.endDate ? moment(allParams.endDate).format("YYYY-MM-DD") ?? '' : '',
            reSearchYn: allParams.reSearchYn ?? ''
        }))
        setSearchRange(allParams.searchRange?.split("$|") ?? [])   
    }, [querys])

    const handleDrawerClose = () => {
        setShowDrawer(false);
    };

    const handleSearchWord = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target
        setParams((prev) => ({ ...prev, [name]: value }))
    }

    const handleOnSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        handleSearch()
    }

    const handleSearch = () => {
        if(isEmpty(params.searchWord?.trim())) {
            alert("검색어를 입력하세요.")
            return
        }
        const searchParam = new URLSearchParams(params as Record<string, string>)
        if(searchRange.length > 0) {
            searchParam.set("searchRange", searchRange.join("$|"))
        } else {
            searchParam.delete("searchRange")
        }
        if(moment(params.startDate).isAfter(moment(params.endDate))) {
            alert("종료일은 시작일보다 빠를 수 없습니다.")
            return
        }
        if(params.startDate && params.endDate) {
            searchParam.set("startDate", moment(params.startDate).format('YYYYMMDD'))
            searchParam.set("endDate", moment(params.endDate).format('YYYYMMDD'))
        } else if(params.startDate || params.endDate) {
            alert('시작일, 종료일 모두 선택해주세요.')
            return
        } else {
            searchParam.delete("startDate")
            searchParam.delete("endDate")
        }

        if(params.reSearchYn !== "Y") {
            searchParam.delete("reSearchYn")
            searchParam.delete("preSearchWord")
        } else {
            if(!allParams.preSearchWord?.split("$|")?.includes(params.searchWord as string)) {
                if(isEmpty(allParams.preSearchWord)) {
                    searchParam.set("preSearchWord", allParams.searchWord + "$|" + params.searchWord)
                } else {
                    searchParam.set("preSearchWord", allParams.preSearchWord + "$|" + params.searchWord)
                }
            } else {
                searchParam.set("preSearchWord", allParams.preSearchWord) 
            }
        }
    
        router.push(`/unify/searchTotal?${searchParam.toString()}`)
        setShowDrawer(false);
    }

    const handleSearchRange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = event.target
        setSearchRange((prev) => {
            if (prev.includes(value)) {
                return prev.filter((item) => item !== value);
            } else {
                if((value === 'ALL' && checked) || prev.length == 1 && value !== 'ALL') {
                    return ['ALL'];
                } else {
                    return [...prev, value];
                }
            }
        })
    }

    const handleParam = (event: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = event.target
        setParams((prev) => ({
            ...prev,
            [name]: value
        }))
    }

    const handleChangeDate = (type: string) => {
        if(type === "week") {
            setParams((prev) => ({
                ...prev,
                startDate: moment().subtract(1, "week").format("YYYY-MM-DD"),
                endDate: moment().format("YYYY-MM-DD")
            }))
        } else if(type === "month") {
            setParams((prev) => ({
                ...prev,
                startDate: moment().subtract(1, "month").format("YYYY-MM-DD"),
                endDate: moment().format("YYYY-MM-DD")
            }))
        } else if(type === "threeMonth") {
            setParams((prev) => ({
                ...prev,
                startDate: moment().subtract(3, "month").format("YYYY-MM-DD"),
                endDate: moment().format("YYYY-MM-DD")
            }))
        }
    }

    const handleReSearchYn = (event: React.ChangeEvent<HTMLInputElement>) => {
        const {name, checked} = event.target
        setParams((prev) => ({
            ...prev,
            [name]: checked ? "Y" : ""
        }))
    }

    return (
        <div className="search-group">

        <Button variant="contained" color="dark" onClick={() => setShowDrawer(true)}>
            상세검색
        </Button>

        {/* ------------------------------------------- */}
        {/* Sidebar */}
        {/* ------------------------------------------- */}
        <Drawer
            className="custom-modal-box-wrapper"
            anchor="top"
            open={showDrawer}
            onClose={() => setShowDrawer(false)}
            PaperProps={{ sx: { maxWidth: '800px', width: '800px', top: '100px', left: '50%', marginLeft: '-400px', height: '425px' } }}
        >
            <div className="custom-modal-box-inner">

            <div className="custom-modal-box-title">
                <Typography variant="h2" fontWeight={600}>
                상세검색
                </Typography>
                <Box>
                <IconButton
                    className="custom-modal-close"
                    color="inherit"
                    sx={{
                    color: '#000',
                    }}
                    onClick={handleDrawerClose}
                >
                    <IconX size="2rem" />
                </IconButton>
                </Box>
            </div>

            {/* ------------------------------------------- */}
            {/* 컨텐츠  */}
            {/* ------------------------------------------- */}
            <form onSubmit={handleOnSubmit}>
            <div className="custom-modal-box-contents">

            <div className="detail-search-box">
              {/* 상세검색 시작 */}

                <table className="table">
                    <colgroup>
                    <col style={{ width: "20%" }}></col>
                    <col style={{ width: "auto" }}></col>
                    </colgroup>
                    <tbody>
                    <tr>
                        <td className="td-head">검색범위</td>
                        <td className="t-left">
                        <div className="form-group">
                            <CustomFormLabel htmlFor="ft-fname-checkbox-01" className="input-label-none">검색범위</CustomFormLabel>
                            <FormGroup row id="ft-fname-checkbox-01" aria-label="checkbox-group-01" className="mui-custom-checkbox-group" onChange={handleSearchRange}>
                            <FormControlLabel
                                value="ALL"
                                control={<CustomCheckbox checked={searchRange.includes('ALL')} />}
                                label="전체"
                            />
                            <FormControlLabel
                                value="TITLE"
                                control={<CustomCheckbox checked={searchRange.includes('TITLE')} disabled={searchRange.includes('ALL')}/>}
                                label="제목"
                            />
                            <FormControlLabel
                                value="CONT"
                                control={<CustomCheckbox checked={searchRange.includes('CONT')} disabled={searchRange.includes('ALL')}/>}
                                label="내용"
                            />
                            </FormGroup>
                        </div>
                        </td>
                    </tr>
                    <tr>
                        <td className="td-head">검색기간</td>
                        <td className="t-left">
                            <div className="form-group">
                                <CustomFormLabel htmlFor="ft-fname-datepicker-06" className="input-label-none">기간</CustomFormLabel>
                                <div id="ft-fname-datepicker-06" className="form-group">
                                    <CustomFormLabel className="input-label-none" htmlFor="ft-date-start">기간 시작일</CustomFormLabel>
                                    <CustomTextField type="date" id="startDate" name="startDate" fullWidth value={params.startDate} onChange={handleParam}/> ~
                                    <CustomFormLabel className="input-label-none" htmlFor="ft-date-end">기간 종료일</CustomFormLabel>
                                    <CustomTextField type="date" id="endDate" name="endDate" fullWidth value={params.endDate} onChange={handleParam}/>
                                </div>
                            </div>
                            <Button variant="contained" color="dark" onClick={() => handleChangeDate('week')}>1주일</Button>
                            <Button variant="contained" color="dark" onClick={() => handleChangeDate('month')}>1개월</Button>
                            <Button variant="contained" color="dark" onClick={() => handleChangeDate('threeMonth')}>3개월</Button>
                        </td>
                    </tr>
                    <tr>
                        <td className="td-head">검색방법</td>
                        <td className="t-left">
                        <div className="form-group">
                            <CustomFormLabel htmlFor="ft-fname-radio-01" className="input-label-none">label명</CustomFormLabel>
                            <RadioGroup row id="ft-fname-radio-01" aria-label="radio-group-01" name="searchOption" defaultValue="AND" className="mui-custom-radio-group" onChange={handleParam}>
                            <FormControlLabel 
                                value="AND" 
                                control={<CustomRadio checked={params.searchOption === 'AND'}/>} 
                                label="모두 포함된 결과(AND)" 
                            />
                            <FormControlLabel
                                value="OR"
                                control={<CustomRadio checked={params.searchOption === 'OR'}/>}
                                label="하나라도 포함된 결과(OR)"
                            />
                            </RadioGroup>
                        </div>
                        </td>
                    </tr>
                    <tr>
                        <td className="td-head">결과내 재검색</td>
                        <td className="t-left">
                        <div className="form-group">
                            <CustomCheckbox id="reSearchYn" name="reSearchYn" value="Y" checked={params.reSearchYn === "Y"} disabled={isEmpty(allParams.searchWord)} onChange={handleReSearchYn} />
                        </div>
                        </td>
                    </tr>
                    <tr>
                        <td className="td-head">검색어</td>
                        <td className="t-left">
                        <div className="form-group">
                            <CustomTextField
                                id="searchWord"
                                name="searchWord"
                                value={params.searchWord}
                                className="form-control total-search-bar"
                                placeholder="검색어를 입력하세요."
                                autoComplete="off"
                                onChange={handleSearchWord}
                            />
                        </div>
                        </td>
                    </tr>
                    </tbody>
                </table>

            </div>

            {/* 상세검색 끝 */}
            <div className="table-bottom-control t-center">
                <Button variant="contained" color="primary" onClick={handleSearch}>검색</Button>
                <Button variant="contained" color="dark" onClick={handleDrawerClose}>취소</Button>
            </div>

            </div>
            </form>
        </div>
        </Drawer>
    </div>
    );
};

export default React.memo(DetailSearch);

'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { TextField, Select, MenuItem, Checkbox, FormControlLabel,FormControl, InputLabel,RadioGroup } from '@mui/material';
import { CustomFormLabel, CustomSelect, CustomTextField,CustomRadio } from '@/utils/fsms/fsm/mui-imports';
import CustomCheckbox from '@/app/components/forms/theme-elements/CustomCheckbox';

// import { ErrorStatus } from '@/utils/fsms/common/messageUtils'
import {
  PageContainer,
} from '@/utils/fsms/fsm/mui-imports'

/** 페이지 제목 및 설명 정보 */
const pageInfo = {
  title: '회원가입',
  description: '유가보조금포털시스템 회원가입 정보입력 화면',
}

const SignupPage: React.FC = () => {
    const router = useRouter();

    const handleNextClick = () => {
        router.push('/user/pub_signup/comp');
    };

    const [params, setParams] = useState({
    });

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const {name, value} = event.target
        setParams(prev => ({ ...prev, [name]: value }));
    }
  
  return (
    <PageContainer title="회원가입 개인정보 관련 정보입력 페이지" description="가입 정보 입력">
        <h2 className="page_title">회원가입</h2>
        <div className="tap_step">
            <div className="item">
                <span className='num'>1</span>
                <span className="page">개인정보 관련 동의</span>
            </div>
            <div className="item active">
                <span className='num'>2</span>
                <span className="page">회원정보 입력</span>
            </div>
            <div className="item">
                <span className='num'>3</span>
                <span className="page">회원가입 완료</span>
            </div>
        </div>

        <div className='form_table_type1'>
            <table>
                <colgroup>
                    <col style={{ width: '200px' }} />
                    <col style={{ width: 'calc(50% - 200px)' }} />
                    <col style={{ width: '200px' }} />
                    <col style={{ width: 'calc(50% - 200px)' }} />
                </colgroup>
                <tbody>
                    <tr>
                        <th>
                            <span className="required">*</span>관리번호
                        </th>
                        <td>
                            <label className="checkbox inline" htmlFor='radio1_1'>
                                <input
                                type="radio"
                                name="radio1"
                                id="radio1_1"
                                value="1"
                                />
                                <span className='ck_icon'></span>
                                시도
                            </label>
                            <label className="checkbox inline" htmlFor='radio1_2'>
                                <input
                                type="radio"
                                name="radio1"
                                id="radio1_2"
                                value="2"
                                />
                                <span className='ck_icon'></span>
                                시군구
                            </label>
                        </td>
                        <th>
                            <span className="required">*</span>지자체
                        </th>
                        <td>
                            <div className="input_group">
                                <div className="input">
                                    <CustomSelect
                                        id="searchSelect"
                                        name=""
                                        defaultValue={"경기"}
                                        onChange={handleSearchChange}
                                        fullWidth
                                        variant="outlined"
                                        title="종류"
                                        >
                                        <MenuItem value="경기">경기</MenuItem>
                                        <MenuItem value="서울">서울</MenuItem>
                                        <MenuItem value="부산">부산</MenuItem>
                                    </CustomSelect>
                                </div>
                                <div className="input">
                                    <CustomSelect
                                        id="searchSelect"
                                        name=""
                                        defaultValue={"수원시"}
                                        onChange={handleSearchChange}
                                        fullWidth
                                        variant="outlined"
                                        title="종류"
                                        >
                                        <MenuItem value="수원시">수원시</MenuItem>
                                        <MenuItem value="화성시">화성시</MenuItem>
                                        <MenuItem value="고양시">고양시</MenuItem>
                                    </CustomSelect>
                                </div>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <th>
                            <span className="required">*</span>담당업무
                        </th>
                        <td colSpan={3} className='padding_0'>
                            <div className='form_table_type2'>
                                <table>
                                    <colgroup>
                                        <col style={{ width: '498px' }} />
                                        <col style={{ width: 'calc((100% - 498px) / 4)' }} />
                                        <col style={{ width: 'calc((100% - 498px) / 4)' }} />
                                        <col style={{ width: 'calc((100% - 498px) / 4)' }} />
                                        <col style={{ width: 'calc((100% - 498px) / 4)' }} />
                                    </colgroup>
                                    <thead>
                                        <tr>
                                            <th>업무유형</th> 
                                            <th>버스</th> 
                                            <th>택시</th> 
                                            <th>화물</th> 
                                            <th>대폐차</th> 
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className='align_left'>카드발급심사</td>
                                            <td>
                                                <label className="checkbox single" htmlFor='check1'>
                                                    <input
                                                    type="checkbox"
                                                    id="check1"
                                                    />
                                                    <span className='ck_icon'></span>
                                                </label>
                                            </td>
                                            <td>
                                                <label className="checkbox single" htmlFor='check2'>
                                                    <input
                                                    type="checkbox"
                                                    id="check2"
                                                    />
                                                    <span className='ck_icon'></span>
                                                </label>
                                            </td>
                                            <td>
                                                <label className="checkbox single" htmlFor='check3'>
                                                    <input
                                                    type="checkbox"
                                                    id="check3"
                                                    />
                                                    <span className='ck_icon'></span>
                                                </label>
                                            </td>
                                            <td rowSpan={3}>
                                                <label className="checkbox single" htmlFor='check4'>
                                                    <input
                                                    type="checkbox"
                                                    id="check4"
                                                    />
                                                    <span className='ck_icon'></span>
                                                </label>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className='align_left'>서류신청</td>
                                            <td>
                                                <label className="checkbox single" htmlFor='check5'>
                                                    <input
                                                    type="checkbox"
                                                    id="check5"
                                                    />
                                                    <span className='ck_icon'></span>
                                                </label>
                                            </td>
                                            <td>
                                                <label className="checkbox single" htmlFor='check6'>
                                                    <input
                                                    type="checkbox"
                                                    id="check6"
                                                    />
                                                    <span className='ck_icon'></span>
                                                </label>
                                            </td>
                                            <td>
                                                <label className="checkbox single" htmlFor='check7'>
                                                    <input
                                                    type="checkbox"
                                                    id="check7"
                                                    />
                                                    <span className='ck_icon'></span>
                                                </label>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className='align_left'>부정수급 조사 및 처분</td>
                                            <td>
                                                <label className="checkbox single" htmlFor='check8'>
                                                    <input
                                                    type="checkbox"
                                                    id="check8"
                                                    />
                                                    <span className='ck_icon'></span>
                                                </label>
                                            </td>
                                            <td>
                                                <label className="checkbox single" htmlFor='check9'>
                                                    <input
                                                    type="checkbox"
                                                    id="check9"
                                                    />
                                                    <span className='ck_icon'></span>
                                                </label>
                                            </td>
                                            <td>
                                                <label className="checkbox single" htmlFor='check10'>
                                                    <input
                                                    type="checkbox"
                                                    id="check10"
                                                    />
                                                    <span className='ck_icon'></span>
                                                </label>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <th>
                            <span className="required">*</span>아이디
                        </th>
                        <td colSpan={3}>
                            <div className="input_group">
                                <div className="input size_28">
                                    <TextField
                                    fullWidth
                                    placeholder="아이디 입력"
                                    />
                                </div>
                                <button type='button' className='btn_tb1'>중복확인</button>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <th>
                            <span className="required">*</span>비밀번호
                        </th>
                        <td colSpan={3}>
                            <div className="input_group">
                                <div className="input size_28">
                                    <TextField
                                    type="password"
                                    fullWidth
                                    placeholder="비밀번호 입력"
                                    />
                                </div>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <th>
                            <span className="required">*</span>비밀번호 확인
                        </th>
                        <td colSpan={3}>
                            <div className="input_group">
                                <div className="input size_28">
                                    <TextField
                                    type="password"
                                    fullWidth
                                    placeholder="비밀번호 확인"
                                    />
                                </div>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <th>
                            <span className="required">*</span>사용자명
                        </th>
                        <td>
                            <div className="input_group">
                                <div className="input size_28">
                                    <TextField
                                    fullWidth
                                    />
                                </div>
                            </div>
                        </td>
                        <th>
                            <span className="required">*</span>부서명
                        </th>
                        <td>
                            <div className="input_group">
                            <div className="input size_28">
                            <TextField
                                    fullWidth
                                    />
                                </div>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <th>
                            <span className="required">*</span>기관주소
                        </th>
                        <td colSpan={3}>
                            <div className="input_group">
                                <div className="input size_10">
                                    <TextField
                                    fullWidth
                                    InputProps={{
                                        readOnly: true,
                                    }}
                                    />
                                </div>
                                <button type='button' className='btn_tb1'>우편번호</button>
                            </div>
                            <div className="input_group">
                                <div className="input size_28">
                                    <TextField
                                    fullWidth
                                    />
                                </div>
                                <div className="input size_28">
                                    <TextField
                                    fullWidth
                                    InputProps={{
                                        readOnly: true,
                                    }}
                                    />
                                </div>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <th>
                            <span className="required">*</span>이메일
                        </th>
                        <td colSpan={3}>
                            <div className="input_group">
                                <div className="input size_28">
                                    <TextField
                                    fullWidth
                                    />
                                </div>
                                <span className="dash">@</span>
                                <div className="input size_28">
                                    <TextField
                                    fullWidth
                                    />
                                </div>
                                <div className="input size_28">
                                    <CustomSelect
                                        id="searchSelect"
                                        name=""
                                        defaultValue={"직접입력"}
                                        onChange={handleSearchChange}
                                        fullWidth
                                        variant="outlined"
                                        >
                                        <MenuItem value="직접입력">직접입력</MenuItem>
                                        <MenuItem value="naver.com">naver.com</MenuItem>
                                        <MenuItem value="daum.net">daum.net</MenuItem>
                                        <MenuItem value="gmail.com">gmail.com</MenuItem>
                                    </CustomSelect>
                                </div>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <th>
                            <span className="required">*</span>내선번호
                        </th>
                        <td>
                            <div className="input_group">
                                <div className="input">
                                    <CustomSelect
                                        id="searchSelect"
                                        name=""
                                        defaultValue={"031"}
                                        onChange={handleSearchChange}
                                        fullWidth
                                        variant="outlined"
                                        >
                                        <MenuItem value="031">031</MenuItem>
                                        <MenuItem value="02">02</MenuItem>
                                    </CustomSelect>
                                </div>
                                <span className="dash">-</span>
                                <div className="input">
                                    <TextField
                                    fullWidth
                                    />
                                </div>
                                <span className="dash">-</span>
                                <div className="input">
                                    <TextField
                                    fullWidth
                                    />
                                </div>
                            </div>
                        </td>
                        <th>
                            <span className="required">*</span>핸드폰번호
                        </th>
                        <td>
                            <div className="input_group">
                                <div className="input">
                                    <CustomSelect
                                        id="searchSelect"
                                        name=""
                                        defaultValue={"010"}
                                        onChange={handleSearchChange}
                                        fullWidth
                                        variant="outlined"
                                        >
                                        <MenuItem value="010">010</MenuItem>
                                        <MenuItem value="011">011</MenuItem>
                                    </CustomSelect>
                                </div>
                                <span className="dash">-</span>
                                <div className="input">
                                    <TextField
                                    fullWidth
                                    />
                                </div>
                                <span className="dash">-</span>
                                <div className="input">
                                    <TextField
                                    fullWidth
                                    />
                                </div>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <th>
                            <span className="required">*</span>아이디
                        </th>
                        <td colSpan={3}>
                            <div className="input_group">
                                <div className="input size_28">
                                    <TextField
                                    fullWidth
                                    placeholder="아이디 입력"
                                    />
                                </div>
                                <button type='button' className='btn_tb1'>중복확인</button>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <th>
                            <span className="required">*</span>신청기간
                        </th>
                        <td colSpan={3}>
                            <div className="input_group">
                                <div className="input size_14">
                                    <TextField
                                    type="date"
                                    fullWidth
                                    />
                                </div>
                                <span className="dash">-</span>
                                <div className="input size_14">
                                    <TextField
                                    type="date"
                                    fullWidth
                                    />
                                </div>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <th>
                            <span className="required">*</span>IP주소
                        </th>
                        <td colSpan={3}>
                            <div className="input_group">
                                <div className="input size_28">
                                    <TextField
                                    fullWidth
                                    />
                                </div>
                                <button type='button' className='btn_tb1'>내IP확인</button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div className="form_btns">
            <Link href="/user/login" className='btn'>취소</Link>
            <button
            type="button"
            className="btn btn_submit"
            onClick={handleNextClick}
            >
            다음
            </button>
        </div>
    </PageContainer>
  )
}

export default SignupPage

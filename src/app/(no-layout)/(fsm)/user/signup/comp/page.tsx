'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import {
  TextField,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormControl,
  InputLabel,
  RadioGroup,
} from '@mui/material'
import {
  CustomFormLabel,
  CustomSelect,
  CustomTextField,
  CustomRadio,
} from '@/utils/fsms/fsm/mui-imports'
import CustomCheckbox from '@/app/components/forms/theme-elements/CustomCheckbox'

// import { ErrorStatus } from '@/utils/fsms/common/messageUtils'
import { PageContainer } from '@/utils/fsms/fsm/mui-imports'

/** 페이지 제목 및 설명 정보 */
const pageInfo = {
  title: '회원가입',
  description: '유가보조금포털시스템 회원가입 정보입력 화면',
}

const SignupPage: React.FC = () => {
  return (
    <PageContainer
      title="회원가입 개인정보 관련 정보입력 페이지"
      description="가입 정보 입력"
    >
      <h2 className="page_title">회원가입</h2>
      <div className="tap_step">
        <div className="item">
          <span className="num">1</span>
          <span className="page">개인정보 관련 동의</span>
        </div>
        <div className="item">
          <span className="num">2</span>
          <span className="page">회원정보 입력</span>
        </div>
        <div className="item active">
          <span className="num">3</span>
          <span className="page">회원가입 완료</span>
        </div>
      </div>

      <div className="icon_title_center">
        <svg
          width="100"
          height="100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M17.456 12.11h49.322a8.46 8.46 0 0 1 8.456 8.456v58.978A8.46 8.46 0 0 1 66.778 88H17.456A8.46 8.46 0 0 1 9 79.544V20.566a8.46 8.46 0 0 1 8.456-8.456Z"
            fill="#97BCFF"
          />
          <path
            d="M51.686 21.515H32.555a6.29 6.29 0 0 1-6.29-6.29V9.921c0-1.06.862-1.922 1.92-1.922h27.87c1.06 0 1.922.863 1.922 1.922v5.302a6.29 6.29 0 0 1-6.29 6.291Z"
            fill="#3D79E7"
          />
          <path
            d="M42.119 49.64a8.32 8.32 0 1 0 0-16.64 8.32 8.32 0 0 0 0 16.64Z"
            fill="#fff"
          />
          <path
            d="M56.055 58.736c-1.132-3.857-3.464-7.087-6.49-9.117a1.565 1.565 0 0 0-1.755.025 10.03 10.03 0 0 1-5.691 1.76c-2.111 0-4.07-.65-5.69-1.76a1.561 1.561 0 0 0-1.756-.025c-3.026 2.032-5.358 5.26-6.49 9.117-.766 2.613.968 5.308 3.387 5.308h21.098c2.419 0 4.153-2.695 3.387-5.308Z"
            fill="#fff"
          />
          <circle cx="77" cy="78" r="18" fill="#3D79E7" />
          <path
            d="M75.38 86.445a2.418 2.418 0 0 1-1.723-.719l-5.948-5.972a2.44 2.44 0 0 1 .006-3.446 2.44 2.44 0 0 1 3.446.006l3.97 3.988 7.493-9.935a2.435 2.435 0 0 1 3.41-.475 2.436 2.436 0 0 1 .474 3.41l-9.186 12.175a2.425 2.425 0 0 1-1.778.962h-.164v.006Z"
            fill="#fff"
          />
        </svg>
        <h3>
          회원가입을 완료하였습니다.
        </h3>
      </div>

      <div className="form_btns">
        <Link href="/user/login" className="btn btn_submit">
          확인
        </Link>
      </div>
    </PageContainer>
  )
}

export default SignupPage

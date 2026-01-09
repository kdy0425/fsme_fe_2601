'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
// import { ErrorStatus } from '@/utils/fsms/common/messageUtils'
import {
  PageContainer,
} from '@/utils/fsms/fsm/mui-imports'
import { userSignup } from './actions'
import { CodeObj } from './_types/CodeObjList'

/** 페이지 제목 및 설명 정보 */
const pageInfo = {
  title: '회원가입',
  description: '유가보조금포털시스템 회원가입 약관동의 화면',
}


const SignupPage: React.FC = () => {
    const router = useRouter();

    const [isTermsChecked, setIsTermsChecked] = useState(false);
    const [isSecurityChecked, setIsSecurityChecked] = useState(false);
    const isAllChecked = isTermsChecked && isSecurityChecked;
    const handleNextClick = () => {
      if (isAllChecked) {
        router.push('/user/pub_signup/form');
      } else {
        alert('모든 항목에 동의해야 합니다.');
      }
    };
  
  return (
    <PageContainer title="회원가입 개인정보 관련 동의 페이지" description="개인정보 수집 및 이용동의, 보안 서약서">
        <h2 className="page_title">회원가입</h2>
        <div className="tap_step">
            <div className="item active">
                <span className='num'>1</span>
                <span className="page">개인정보 관련 동의</span>
            </div>
            <div className="item">
                <span className='num'>2</span>
                <span className="page">회원정보 입력</span>
            </div>
            <div className="item">
                <span className='num'>3</span>
                <span className="page">회원가입 완료</span>
            </div>
        </div>
        <div className="terms_wrap">
            <div className="terms_box">
                <h3 className="title">개인정보 수집 및 이용동의</h3>
                <div className="terms">
                    <p className='terms_arrow'>수집항목(필수) : 이용자ID, 성명, 지자체정보, 전화번호, 이메일주소, IP주소, 접속로그, 시스템이용기록</p>
                    <p className='terms_arrow'>수집항목(선택) : 핸드폰번호</p>
                    <p className='terms_arrow'>수집 및 이용 목적 : 시스템 접근권한 생성‧변경‧말소, 본인 식별‧인증, 서비스 부정이용 방지 등</p>
                    <p className='terms_arrow'>보유 및 이용 기간 : <strong className='text_underline'>신청기간 종료 및 말소요청 시까지 또는 시스템 최종 접속일로부터 90일 이내</strong></p>
                    <p className='terms_arrow'>동의 거부 시 불이익 : 접근권한 신청 및 유가보조금관리시스템 사용자 등록 불가</p>
                    <p className='terms_star'>수집한 개인정보는 개인정보보호법 제15조에서 정하는 바에 따라 이용 목적 이외에는 사용되지 않습니다.<br/>
                    본인은 상기 목적으로 본인의 개인정보를 수집‧이용하는 것에 동의합니다.</p>
                </div>
                <label className="checkbox size_lg" htmlFor='check_terms_use'>
                    <input
                    type="checkbox"
                    id="check_terms_use"
                    checked={isTermsChecked}
                    onChange={(e) => setIsTermsChecked(e.target.checked)}
                    />
                    <span className='ck_icon'></span>
                    개인정보 수집 및 이용동의에 내용을 모두 확인하였으며 이에 동의합니다.
                </label>
            </div>

            <div className="terms_box">
                <h3 className="title">보안서약서</h3>
                <div className="terms">
                본인은 국토교통부 유가보조금관리시스템 사용과 유가보조금 제반 업무를 수행함에 있어 다음 사항을 준수할 것을 엄숙히 서약합니다.<br/>
                1. 본인은 업무 수행 중 알게 될 일체의 내용이 직무상 기밀사항임을 인정한다.<br/>
                2. 본인은 기밀을 누설함이 국가안전보장 및 국가이익에 위해가 될 수 있음을 인식하여 업무수행 중 지득한 제반 기밀사항을 일체 누설하거나 공개하지 아니한다.<br/>
                3. 본인이 이 기밀을 누설하거나 관계 규정을 위반한 때에는 관련 법령에 따라 어떠한 처벌 및 불이익도 감수한다.<br/>
                4. 본인은 개인정보의 보호를 위해 개인정보처리방침 또는 개인정보보호 내부관리계획을 준수할 것이며, 적법한 절차 없이 개인정보를 무단으로 조회하거나 유출, 또는 제3자에게 제공하지 않을 것을 서약한다.<br/>
                본인은 국토교통부 유가보조금관리시스템 사용과 유가보조금 제반 업무를 수행함에 있어 다음 사항을 준수할 것을 엄숙히 서약합니다.<br/>
                1. 본인은 업무 수행 중 알게 될 일체의 내용이 직무상 기밀사항임을 인정한다.<br/>
                2. 본인은 기밀을 누설함이 국가안전보장 및 국가이익에 위해가 될 수 있음을 인식하여 업무수행 중 지득한 제반 기밀사항을 일체 누설하거나 공개하지 아니한다.<br/>
                3. 본인이 이 기밀을 누설하거나 관계 규정을 위반한 때에는 관련 법령에 따라 어떠한 처벌 및 불이익도 감수한다.<br/>
                4. 본인은 개인정보의 보호를 위해 개인정보처리방침 또는 개인정보보호 내부관리계획을 준수할 것이며, 적법한 절차 없이 개인정보를 무단으로 조회하거나 유출, 또는 제3자에게 제공하지 않을 것을 서약한다.
                </div>
                <label className="checkbox size_lg" htmlFor='check_terms_security'>
                    <input
                    type="checkbox"
                    id="check_terms_security"
                    checked={isSecurityChecked}
                    onChange={(e) => setIsSecurityChecked(e.target.checked)}
                    />
                    <span className='ck_icon'></span>
                    보안서약서의 내용을 서약합니다.
                </label>
            </div>
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

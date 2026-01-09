"use client";

import "@/app/assets/css/layoutFsm.css";
import Box from '@mui/material/Box';
import Link from 'next/link';

// components

import PageContainer from '@/components/container/PageContainer';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

import Logo from '@/app/(admin)/layout/shared/logo/Logo';
import { useMessageActions } from '@/store/MessageContext'; // 메시지 액션 훅 임포트

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setMessage, clearMessage } = useMessageActions(); // 메시지 설정 함수 사용

  const [lgnId, setLgnId] = useState('');
  const [pswd, setPswd] = useState('');

  const handleLgnIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLgnId(e.target.value);
  }

  const handlePswdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPswd(e.target.value);
  }

  return (
    <PageContainer title="로그인 페이지" description="로그인 페이지 가이드">
        <div className="bg_page flex_center">
            <Box display="flex" alignItems="center" justifyContent="center">
                <Logo />
            </Box>
            <div className="login_card">
                <div className="login_content">
                    <div className="login_box">
                        <h2 className='box_title'>
                            <svg width="40" height="40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M30.533 5.873c-3.275 0-6.257-1.173-8.601-3.105a3.397 3.397 0 0 0-4.303 0C15.284 4.7 12.302 5.873 9.027 5.873c-.177 0-.354-.004-.531-.01C6.029 5.763 4 7.798 4 10.269v7.394c0 13.126 9.87 18.376 14 19.999 1.146.45 2.418.45 3.564 0 4.13-1.617 13.997-6.85 13.997-20V10.27c0-2.47-2.03-4.506-4.496-4.406-.177.006-.354.01-.532.01Z" fill="#598DDC"/><path d="M17.906 25.894h-.045a1.915 1.915 0 0 1-1.353-.612L11.51 19.85a1.9 1.9 0 1 1 2.799-2.573l3.668 3.987 7.906-7.79a1.902 1.902 0 0 1 2.67 2.708l-9.307 9.169a1.9 1.9 0 0 1-1.334.547l-.006-.003Z" fill="#fff"/></svg>
                            <span>GPKI인증서 등록</span>
                        </h2>
                        <div className="login_form_wrap">
                            <div className="login_form">
                                <div className="input_group">
                                    <div className="input">
                                        <input type="text" placeholder='아이디를 입력하세요.' className='id' />
                                    </div>
                                </div>
                                <div className="input_group">
                                    <div className="input">
                                        <input type="password" placeholder='비밀번호를 입력하세요.' className='password' />
                                    </div>
                                </div>
                            </div>
                            <button type="button" className='login_form_submit'>인증서 등록</button>
                        </div>
                    </div>
                    <div className="login_box">
                        <h2 className='box_title'>
                            <svg width="40" height="40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M27.673 19.655a1.946 1.946 0 0 1-1.945-1.945v-7.125a5.704 5.704 0 0 0-5.699-5.698 5.702 5.702 0 0 0-5.698 5.698v7.125a1.946 1.946 0 0 1-1.945 1.945 1.946 1.946 0 0 1-1.945-1.945v-7.125C10.444 5.301 14.745 1 20.029 1c5.284 0 9.588 4.301 9.588 9.588v7.125a1.946 1.946 0 0 1-1.944 1.945v-.003Z" fill="#C6D2E7"/><path d="M24.639 13.552h-9.216A9.423 9.423 0 0 0 6 22.975v6.603A9.423 9.423 0 0 0 15.423 39h9.216a9.423 9.423 0 0 0 9.423-9.423v-6.603a9.423 9.423 0 0 0-9.423-9.423Z" fill="#5398FF"/><path d="M23.274 26.035a3.243 3.243 0 0 1-6.483 0 3.243 3.243 0 0 1 6.483 0Z" fill="#fff"/></svg>
                            <span>GPKI인증서 로그인</span>
                        </h2>
                        <p>행정전자서명 인증서(GPKI)로 로그인해 주시기 바랍니다.</p>
                        <button type="button" className='login_button'>로그인</button>
                    </div>
                </div>
                <div className="login_links">
                    <div className="item"><Link href="#">회원가입</Link></div>
                    <div className="item"><Link href="#">아이디찾기</Link></div>
                    <div className="item"><Link href="#">비밀번호변경</Link></div>
                    <div className="item"><Link href="#">IP확인</Link></div>
                    <div className="item"><Link href="#">GPKI모듈 수동설치</Link></div>
                    <div className="item"><Link href="#"><strong>개인정보처리방침</strong></Link></div>
                </div>
            </div>
        </div>
    </PageContainer>
  );
};


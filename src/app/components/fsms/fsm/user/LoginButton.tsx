'use client';

import { Button } from '@mui/material';
import { useRouter } from 'next/navigation';

/**
 * 로그아웃 버튼 컴포넌트
 * 
 * @returns 로그아웃 버튼
 */
const LogoutButton = () => {
  const router = useRouter()
  const handleLogout = async () => {
    try {

      const response = await fetch('/api/fsm/user/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response) {
        location.href = '/user/login';  // 홈페이지로 리다이렉트
        // router.push('/user/login')
        // setTimeout(() => {
        //   router.push('/'); // 홈페이지로 리다이렉트
        // }, 2000);
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('An error occurred during logout:', error);
    }
  };

  return (
    <Button
      className="top-btn btn-logout"
      onClick={()=> confirm('로그아웃 하시겠습니까?') ? handleLogout() : null}
    >
      로그아웃
    </Button>
  );
};

export default LogoutButton;
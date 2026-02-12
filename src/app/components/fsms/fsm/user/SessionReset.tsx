'use client';

/**
 * 세션연장 버튼 컴포넌트
 * 
 * @returns 세션연장 버튼
 */
const SessionReset = () => {
  return (
    <button type="button" className='session-reset-btn'>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z" stroke="#5C6A86" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/> <path d="M10 5.20117V10.5H14" stroke="#5C6A86" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/> </svg>
      <span className='time'>29:50</span>
      <span className='text'>연장</span>
    </button>
  );
};

export default SessionReset;
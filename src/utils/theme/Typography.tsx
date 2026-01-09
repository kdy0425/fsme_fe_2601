// Next.js 로컬폰트 사용법
// https://nextjs.org/docs/app/building-your-application/optimizing/fonts#local-fonts
// https://github.com/orioncactus/pretendard/tree/main?tab=readme-ov-file 에서 최신버전 다운로드
// fonts 폴더 생성 후 ./fonts/PretendardVariable.woff2
// https://github.com/orioncactus/pretendard/tree/main Next.js에서 로컬 폰트 기능을 활용

import localFont from 'next/font/local'

export const pretendard = localFont({
  src: './fonts/PretendardVariable.woff2',
  display: 'swap',
  weight: '45 920',
});

const typography: any = {
  fontFamily: pretendard.style.fontFamily,
  h1: {
    fontWeight: 600,
    fontSize: '2.25rem',
    lineHeight: '2.75rem',
  },
  h2: {
    fontWeight: 600,
    fontSize: '1.875rem',
    lineHeight: '2.25rem',
  },
  h3: {
    fontWeight: 600,
    fontSize: '1.5rem',
    lineHeight: '1.75rem',
  },
  h4: {
    fontWeight: 600,
    fontSize: '1.3125rem',
    lineHeight: '1.6rem',
  },
  h5: {
    fontWeight: 600,
    fontSize: '1.125rem',
    lineHeight: '1.6rem',
  },
  h6: {
    fontWeight: 600,
    fontSize: '1rem',
    lineHeight: '1.2rem',
  },
  button: {
    textTransform: 'capitalize',
    fontWeight: 400,
  },
  body1: {
    fontSize: '14px',
    fontWeight: 400,
    lineHeight: '1.334rem',
  },
  body2: {
    fontSize: '14px',
    letterSpacing: '0rem',
    fontWeight: 400,
    lineHeight: '1rem',
  },
  subtitle1: {
    fontSize: '14px',
    fontWeight: 400,
  },
  subtitle2: {
    fontSize: '14px',
    fontWeight: 400,
  },
};

export default typography;

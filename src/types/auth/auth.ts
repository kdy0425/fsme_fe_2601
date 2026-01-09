/** 회원가입화면 컴포넌트 타입 정의 */
export interface signUpType {
  title?: string;
  subtitle?: JSX.Element | JSX.Element[];
  subtext?: JSX.Element | JSX.Element[];
  handleUserNmChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleLgnIdChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePswdChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/** 로그인화면 컴포넌트 타입 정의 */
export interface loginType {
  title?: string;
  subtitle?: JSX.Element | JSX.Element[];
  subtext?: JSX.Element | JSX.Element[];
  handleLgnIdChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePswdChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/** 회원프로필 컴포넌트 타입 정의 */
export interface userProfileType {
  userNm?: string;
  authorities?: string[];
}

export interface signInType {
  title?: string;
}

/** 권한객체 인터페이스 */
export interface authObj {
  authSttus: object,
  isAuthenticated: boolean,
}

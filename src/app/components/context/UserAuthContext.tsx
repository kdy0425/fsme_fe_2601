import { createContext } from 'react'

export interface UserAuthInfo {
  iss: string
  userNm: string
  auths: string[]
  roles: string[]
  lgnId: string
  locgovCd: string
  iat: number
  exp: number
  rollYn: string
  authLocgovNm: string
  taskSeCd: string[]
}

interface UserAuthContextType {
  authInfo: UserAuthInfo | {}
  setUserAuthInfo: (auth: any) => void
  resetAuthInfo: () => void
  contextFavoriteList: favoriteListType[]
  setContextFavoriteList: React.Dispatch<
    React.SetStateAction<favoriteListType[]>
  >
}

export interface favoriteListType {
  menuNm: string
  urlAddr: string
  menuTsid: string
}

const UserAuthContext = createContext<UserAuthContextType>({
  authInfo: {},
  setUserAuthInfo: (auth: any) => {},
  resetAuthInfo: () => {},
  contextFavoriteList: [],
  setContextFavoriteList: () => [],
})

export default UserAuthContext

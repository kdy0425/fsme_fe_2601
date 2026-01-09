/* react */
import { useState, useEffect } from "react"

/* 공통 js */
import { getUserInfo } from "../../utils"

/**
 * 
 * @param params 검색조건객체
 * @param names 검색조건 네임명
 * @param searchCallBack 검색호출함수
 * @param optionalFields 권한에 따른 전체 허용할 검색조건 네임명
 * @returns boolean
 */
export const useInitSearchHook = (
  params: Record<string, any>,
  names: string[],
  searchCallBack: (...args: any[]) => void,
  optionalFields?: string[],
) => {

  const userInfo = getUserInfo()
  const [searchObj, setSearchObj] = useState<Record<string, any>>()
  const [isInit, setIsInit] = useState<boolean>(true)

  // 필수 검색조건 세팅
  useEffect(() => {
    if (isInit && params) {
      const temp = names.reduce((acc, name) => {
        acc[name] = params[name]
        return acc
      }, {} as Record<string, any>)
      setSearchObj(temp)
    }
  }, [params])

  // 검색조건 세팅완료 시 검색함수 호출
  useEffect(() => {
    if (isInit && searchObj) {
      const checkList = names.filter(name => {
        const empty = isEmpty(searchObj[name])
        if (optionalFields?.includes(name)) {
          return !isOptionalFieldsAllowed() && empty
        }
        return empty
      })
      if (!checkList.length) {
        searchCallBack()
        setIsInit(false)
      }
    }
  }, [searchObj])

  // 권한확인
  const isOptionalFieldsAllowed = (): boolean => {
    const role = userInfo.roles[0]
    const locgovCd = userInfo.locgovCd.substring(2, 5)
    return role === 'ADMIN' || role === 'MOLIT' || locgovCd === '000'
  }

  // 값이 있는지 판별
  const isEmpty = (v: any): boolean => {
    return v === undefined || v === null || v === ''
  }

  return { isInit }
}
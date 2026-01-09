/* React */
import React, { useEffect, useState } from 'react'

/* 공통 js */
import {
  getLocalGovCodes,
  getCityCodes,
  getCodesByGroupNm,
} from '@/utils/fsms/common/code/getCode'
import { toSelectItem, toSelectItem2 } from './_util/Utils'
import { getAuthInfo } from '@/utils/fsms/common/user/authUtils'

/* 공통 interface */
import { SelectItem } from 'select'

/* interface 선언 */
interface ctpvPropsInterface {
  pValue: string | number // selectBox value
  handleChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void // Select Box값 변경 시 호출할 함수
  pName?: string // selectbox name값 ** 한 화면내부 두곳에서 사용할경우 대비, default name은 ctpv로 세팅
  width?: string // 해당컴포넌트 너비
  htmlFor?: string // label 태그 for 값 ** 조회조건에서 사용
  pDisabled?: boolean // disable 설정
  pDisableSelectAll?: boolean // 전체 조회조건 설정
}

interface locgovPropsInterface {
  pValue: string | number // selectBox value
  handleChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void // Select Box값 변경 시 호출할 함수
  pName?: string // selectbox name값 ** 한 화면내부 두곳에서 사용할경우 대비, default name은 locgovCd로 세팅
  defaultCd?: string // 초기 코드
  width?: string // 해당컴포넌트 너비
  htmlFor?: string // label 태그 for 값
  ctpvCd?: string | number // 부모지자체코드
  pDisabled?: boolean // disable 설정
  pDisableSelectAll?: boolean // 전체 조회조건 설정
  isNotRollCheck?:boolean // 권한확인을 하지않는경우( ex) 택시 지자체 전출입관리 )
}

interface cmSelectPropsInterface {
  cdGroupNm: string | number // 코드값
  pValue: string | number // selectBox value
  handleChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void // Select Box값 변경 시 호출할 함수
  pName: string // selectbox name값 ** 공통코드는 name값 필수
  width?: string // 해당컴포넌트 너비
  htmlFor?: string // label 태그 for 값
  addText?: string // select 박스 제일 최상단에 배치할 값
  removeText?: string // select 박스 지울 값
  pDisabled?: boolean // disable 설정
  reloadFlag?: boolean // reload 여부
  defaultValue?: string | number
}

export const CtpvSelect = (props: ctpvPropsInterface) => {
  const { pValue, handleChange, pName, width, htmlFor, pDisabled, pDisableSelectAll } = props

  /* 상태관리 */
  const [authInfo, setAuthInfo] = useState<any>(null)
  const [ctpvList, setCtpvList] = useState<SelectItem[]>([]) // 시도 리스트

  /* UseEffect */
  useEffect(() => {
    getCtpvList()
  }, [])

  const getCtpvList = async () => {
    const tempAuthInfo = authInfo ? authInfo : await getAuthInfo()

    if (!authInfo) {
      setAuthInfo(tempAuthInfo)
    }

    if (tempAuthInfo) {
      getCityCodes().then((res) => {
        if (res) {
          const result: SelectItem[] = toSelectItem(
            res,
            'ctpvNm',
            'ctpvCd',
            'CTPV',
            tempAuthInfo,
            pDisableSelectAll,
          )
          setCtpvList(result)

          const locgovCd: string = tempAuthInfo?.authSttus.locgovCd
          const ctpvCd: string = locgovCd.substring(0, 2)

          const event = {
            target: { value: ctpvCd, name: 'ctpvCd' },
          } as React.ChangeEvent<HTMLSelectElement>
          handleChange(event)
        }
      })
    }
  }

  return (
    <select
      id={htmlFor}
      name={pName ? pName : 'ctpvCd'}
      className="custom-default-select"
      value={pValue}
      onChange={(event) => handleChange(event)}
      style={{ width: width ? width : '100%' }}
      disabled={pDisabled ? pDisabled : false}
    >
      {ctpvList.map((data: SelectItem, index: number) => (
        <option key={index + 1} value={data.value}>
          {data.label}
        </option>
      ))}
    </select>
  )
}

export const CtpvSelectSign = (props: ctpvPropsInterface) => {
  const { pValue, handleChange, pName, width, htmlFor, pDisabled, pDisableSelectAll } = props

  /* 상태관리 */
  const [authInfo, setAuthInfo] = useState<any>(null)
  const [ctpvList, setCtpvList] = useState<SelectItem[]>([]) // 시도 리스트

  /* UseEffect */
  useEffect(() => {
    getCtpvList()
  }, [])

  const getCtpvList = async () => {
    const tempAuthInfo = authInfo ? authInfo : await getAuthInfo()

    if (!authInfo) {
      setAuthInfo(tempAuthInfo)
    }

    if (tempAuthInfo) {
      getCityCodes().then((res) => {
        if (res) {
          const result: SelectItem[] = toSelectItem(
            res,
            'ctpvNm',
            'ctpvCd',
            'CTPV',
            tempAuthInfo,
            pDisableSelectAll,
          )
          setCtpvList(result)

          const locgovCd: string = '51000'
          const ctpvCd: string = locgovCd.substring(0, 2)

          const event = {
            target: { value: ctpvCd, name: 'ctpvCd' },
          } as React.ChangeEvent<HTMLSelectElement>
          handleChange(event)
        }
      })
    }
  }

  return (
    <select
      id={htmlFor}
      name={pName ? pName : 'ctpvCd'}
      className="custom-default-select"
      value={pValue}
      onChange={(event) => handleChange(event)}
      style={{ width: width ? width : '100%' }}
      disabled={pDisabled ? pDisabled : false}
    >
      {ctpvList.map((data: SelectItem, index: number) => (
        <option key={index + 1} value={data.value}>
          {data.label}
        </option>
      ))}
    </select>
  )
}

export const CtpvSelectAll = (props: ctpvPropsInterface) => {
  const { pValue, handleChange, pName, width, htmlFor, pDisabled } = props

  /* 상태관리 */
  const [ctpvList, setCtpvList] = useState<SelectItem[]>([]) // 시도 리스트

  /* UseEffect */
  useEffect(() => {
    getCityCodes().then((res) => {
      if (res) {
        //const event = {target:{value:res[0].ctpvCd, name:'ctpvCd'}} as React.ChangeEvent<HTMLSelectElement>;
        const event = {
          target: { value: '', name: 'ctpvCd' },
        } as React.ChangeEvent<HTMLSelectElement>
        handleChange(event)
        //setCtpvList(toSelectItem(res, 'ctpvNm', 'ctpvCd'));
        setCtpvList(toSelectItem2(res, 'ctpvNm', 'ctpvCd', true))
      }
    })
  }, [])

  return (
    <select
      id={htmlFor}
      name={pName ? pName : 'ctpvCd'}
      className="custom-default-select"
      value={pValue}
      onChange={(event) => handleChange(event)}
      style={{ width: width ? width : '100%' }}
      disabled={pDisabled ? pDisabled : false}
    >
      {ctpvList.map((data: SelectItem, index: number) => (
        <option key={index + 1} value={data.value}>
          {data.label}
        </option>
      ))}
    </select>
  )
}

export const LocgovSelect = (props: locgovPropsInterface) => {
  const {
    pValue,
    handleChange,
    pName,
    width,
    htmlFor,
    ctpvCd,
    pDisabled,
    defaultCd,
    pDisableSelectAll,
    isNotRollCheck,
  } = props

  /* 상태관리 */
  const [authInfo, setAuthInfo] = useState<any>(null)
  const [locgovList, setLocgovList] = useState<SelectItem[]>([]) // 관할관청 리스트
  
  // 최초 화면로드시 권한조건으로 시도명을 세팅하기 전 렌더링으로 인해 ''값으로 모두 관할관청값을 가져와 이를 방지하고자 플래그 추가
  const [init, setInit] = useState<boolean>(false);

  useEffect(() => {
    getLocgovList()
  }, [ctpvCd])

  useEffect(() => {
    if(init) {
      getLocgovList();
    }    
  }, [init]);

  const getLocgovList = async () => {
    
    if(ctpvCd && !init) {
      setInit(true);
      return;
    }

    if(init) {

      const tempAuthInfo = authInfo ? authInfo : await getAuthInfo()

      if (!authInfo) {
        setAuthInfo(tempAuthInfo)
      }

      if (tempAuthInfo) {
        getLocalGovCodes(ctpvCd).then((res) => {
          if (res) {
            const result: SelectItem[] = toSelectItem(
              res,
              'locgovNm',
              'locgovCd',
              'LOCGOV',
              tempAuthInfo,
              pDisableSelectAll,
              isNotRollCheck,
            )

            setLocgovList(result)
            let event = {
              target: { value: result[0].value, name: 'locgovCd' },
            } as React.ChangeEvent<HTMLSelectElement>
            if (defaultCd && defaultCd !== '') {
              event = {
                target: { value: defaultCd, name: 'locgovCd' },
              } as React.ChangeEvent<HTMLSelectElement>
            }
            handleChange(event)
          }
        })
      }
    }
  }

  return (
    <select
      id={htmlFor}
      name={pName ? pName : 'locgovCd'}
      className="custom-default-select"
      value={pValue}
      onChange={(event) => handleChange(event)}
      style={{ width: width ? width : '100%' }}
      disabled={pDisabled ? pDisabled : false}
    >
      {locgovList.map((data: SelectItem, index: number) => (
        <option key={index} value={data.value}>
          {data.label}
        </option>
      ))}
    </select>
  )
}

export const LocgovSelectAll = (props: locgovPropsInterface) => {
  const { pValue, handleChange, pName, width, htmlFor, ctpvCd, pDisabled } =
    props

  /* 상태관리 */
  const [locgovList, setLocgovList] = useState<SelectItem[]>([]) // 관할관청 리스트

  /* UseEffect */
  useEffect(() => {
    getLocalGovCodes(ctpvCd).then((res) => {
      if (res) {
        //const event = {target:{value:res[0].locgovCd, name:'locgovCd'}} as React.ChangeEvent<HTMLSelectElement>;
        const event = {
          target: { value: '', name: 'locgovCd' },
        } as React.ChangeEvent<HTMLSelectElement>
        handleChange(event)
        //setLocgovList(toSelectItem(res, 'locgovNm', 'locgovCd'));
        setLocgovList(toSelectItem2(res, 'locgovNm', 'locgovCd', true))
      }
    })
  }, [ctpvCd])

  return (
    <select
      id={htmlFor}
      name={pName ? pName : 'locgovCd'}
      className="custom-default-select"
      value={pValue}
      onChange={(event) => handleChange(event)}
      style={{ width: width ? width : '100%' }}
      disabled={pDisabled ? pDisabled : false}
    >
      {locgovList.map((data: SelectItem, index: number) => (
        <option key={index} value={data.value}>
          {data.label}
        </option>
      ))}
    </select>
  )
}

export const CommSelect = (props: cmSelectPropsInterface) => {
  const {
    cdGroupNm,
    pValue,
    handleChange,
    pName,
    width,
    htmlFor,
    addText,
    removeText,
    pDisabled,
    reloadFlag, // 비동기로 새로고침 해야할 경우 사용
    defaultValue,
  } = props

  /* 상태관리 */
  const [codeList, setCodeList] = useState<SelectItem[]>([]) // 코드 리스트

  /* UseEffect */
  useEffect(() => {
    getCodesByGroupNm(cdGroupNm.toString()).then((res) => {
      if (res) {
        if (addText) {
          res.unshift({ cdNm: '', cdKornNm: addText })
        }
        if (removeText) {
          res = res.filter((item: {cdKornNm: string}) => item.cdKornNm !== removeText)
        }
        
        const event = {
          target: {
            value: defaultValue ? defaultValue : res[0].cdNm,
            name: pName,
          },
        } as React.ChangeEvent<HTMLSelectElement>
        handleChange(event)
        setCodeList(toSelectItem(res, 'cdKornNm', 'cdNm', 'COMM'))
      }
    })
  }, [reloadFlag == null || reloadFlag == undefined ? '' : reloadFlag])

  return (
    <select
      id={htmlFor}
      name={pName}
      className="custom-default-select"
      value={pValue}
      onChange={(event) => handleChange(event)}
      style={{ width: width ? width : '100%' }}
      disabled={pDisabled ? pDisabled : false}
    >
      {codeList.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}

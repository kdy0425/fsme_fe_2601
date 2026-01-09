'use client'
import { Box, Button } from '@mui/material'
import React, { useEffect, useState } from 'react'

import PageContainer from '@/components/container/PageContainer'

// utils
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'

// types
import {
  CtpvSelect,
  LocgovSelect,
} from '@/app/components/tx/commSelect/CommSelect'
import { StatusType } from '@/types/message'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

export interface Row {
  // id:string;
  vhclNo: string
  ctpvCd: string
  ctpvNm?: string // 시도명
  locgovCd: string
  locgovNm?: string // 관할관청명
  reqLocgovCd: string
  reqLocgovNm: string
  reqCtpvCd: string
  reqCtpvNm: string
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  page: number
  size: number
  vhclNo: string
  ctpvCd: string
  locgovCd: string
  [key: string]: string | number // 인덱스 시그니처 추가
}

const DataList = () => {
  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [row, setRow] = useState<Array<Row>>()

  const [vhclLocgov, setVhclLocgov] = useState<string>('')
  const [vhclCtpv, setVhclCtpv] = useState<string>('')

  const [disableUpdate, setDisableUpdate] = useState<boolean>(true)
  const [isDataProcessing, setIsDataProcessing] = useState<boolean>(false)

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: 1, // 페이지 번호는 1부터 시작
    size: 10, // 기본 페이지 사이즈 설정
    vhclNo: '',
    ctpvCd: '',
    locgovCd: '',
  })

  // 플래그를 통한 데이터 갱신
  // 플래그의 변화를 통해 현재 정보를 기준으로 데이터를 가져오기위해 설정
  useEffect(() => {
    // fetchData()
  }, [flag])

  // 초기 데이터 로드
  useEffect(() => {
    setFlag(!flag)
  }, [])

  const setInitialState = () => {
    setVhclInfo({ ctpvNm: '', locgovNm: '' })
    setRow([])
  }

  const setVhclInfo = ({
    ctpvNm,
    locgovNm,
  }: {
    [key: string]: string
  }): void => {
    setVhclCtpv(ctpvNm)
    setVhclLocgov(locgovNm)
    if (!ctpvNm || !locgovNm) {
      setDisableUpdate(true)
    } else {
      setDisableUpdate(false)
    }
  }

  const fetchCarLocgovInfo = async () => {
    if (!params.vhclNo) {
      alert('차량번호를 입력해주세요')
      return
    }

    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/mng/cvpl/tr/getAllTnkCpctyChangeReqst?` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        let { data } = response
        setRow(data)
        if (data.length === 0) {
          setInitialState()
          alert(
            `차량 ${params.vhclNo}의 변경 가능한 '탱크용량 변경 신청 건'이 없습니다.`,
          )
          return
        }
        setVhclInfo(data[0])
      } else {
        // 데이터가 없거나 실패
        setInitialState()
      }
    } catch (error: StatusType | any) {
      console.error('Error fetching data:', error)
      alert(error.errors[0].reason)
    }
    setFlag(!flag)
  }

  const reqData = async () => {
    if (row == undefined) {
      alert('탱크용량 변경신청할 지자체가 존재하지 않습니다.')
      return
    }

    const userConfirm = confirm(
      '해당 지자체의 탱크용량 변경을 신청하시겠습니까?',
    )

    if (!userConfirm) {
      return
    } else {
      try {
        let body = {
          vhclNo: params.vhclNo,
          ctpvCd: params.ctpvCd,
          locgovCd: params.locgovCd,
        }

        setIsDataProcessing(true)
        let endpoint: string = '/fsm/mng/cvpl/tr/updateLocgovTnkCpcty'

        const response = await sendHttpRequest('PUT', endpoint, body, true, {
          cache: 'no-store',
        })

        if (response && response.resultType === 'success') {
          alert(response.message)
        } else {
          alert('실패 :: ' + response.message)
        }
      } catch (error: StatusType | any) {
        console.error('Error fetching data:', error)
        alert(error.errors[0].reason)
      }
    }
    setIsDataProcessing(false)
    setInitialState()
  }

  // 페이지 이동 감지 시작 //

  // 검색시 검색 조건에 맞는 데이터 갱신 및 1페이지로 이동
  const handleAdvancedSearch = (event: React.FormEvent) => {
    event.preventDefault()
    setParams((prev) => ({ ...prev, page: 1 })) // 첫 페이지로 이동
    setFlag(!flag)
  }
  // 페이지 이동 감지 종료 //

  // 시작일과 종료일 비교 후 일자 변경
  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    console.log(name, value)
    setParams((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <PageContainer
      title="탱크용량 변경신청 지자체 변경"
      description="탱크용량 변경신청 지자체 변경"
    >
      {/* 검색영역 시작 */}
      <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
        <Box className="sch-filter-box">
          <div className="filter-form">
            <div style={styles.textFieldStyle}>
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-vhcl-no"
              >
                <span className="required-text">*</span>차량번호
              </CustomFormLabel>
              <CustomTextField
                type="text"
                id="ft-vhcl-no"
                name="vhclNo"
                value={params.vhclNo}
                onChange={handleSearchChange}
                style={{ width: 100 }}
              />
            </div>
            <Button
              onClick={() => fetchCarLocgovInfo()}
              variant="contained"
              color="primary"
            >
              검색
            </Button>
            <div style={styles.textFieldStyle}>
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-loc-gov-nm"
              >
                <span className="required-text">*</span>소속 지자체
              </CustomFormLabel>
              <CustomTextField
                type="text"
                id="ft-loc-gov-nm"
                name="locgovNm"
                value={vhclCtpv + ' ' + vhclLocgov}
                size="small"
                disabled={true}
                style={{ width: 100 }}
              />
            </div>
            <div> </div>
            <div className="form-group">
              <CustomFormLabel className="input-label-display" required>
                탱크용량 변경신청 지자체
              </CustomFormLabel>
              <CustomFormLabel
                className="input-label-none"
                htmlFor="sch-ctpv"
              >
                시도명
              </CustomFormLabel>
              <CtpvSelect
                width="70%"
                pValue={params.ctpvCd}
                htmlFor={'sch-ctpv'}
                handleChange={handleSearchChange}
              />
              <CustomFormLabel
                className="input-label-none"
                htmlFor="sch-locgov"
              >
                관할관청
              </CustomFormLabel>
              <LocgovSelect
                width="70%"
                ctpvCd={params.ctpvCd}
                pValue={params.locgovCd}
                handleChange={handleSearchChange}
                htmlFor={'sch-locgov'}
              />
            </div>
          </div>
        </Box>
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <Button
              onClick={reqData}
              variant="contained"
              color="primary"
              disabled={disableUpdate}
            >
              변경
            </Button>
          </div>
        </Box>
      </Box>
      <LoadingBackdrop open={isDataProcessing} />
      {/* 검색영역 시작 */}
    </PageContainer>
  )
}

const styles: any = {
  textFieldStyle: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexDirection: 'row',
  },
}

export default DataList

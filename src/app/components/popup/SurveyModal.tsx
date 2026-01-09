import { useDispatch, useSelector } from '@/store/hooks'
import { closeServeyModal } from '@/store/popup/SurveySlice'
import { AppState } from '@/store/store'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  FormControl,
  IconButton,
  RadioGroup,
  TextField,
} from '@mui/material'
import {
  CustomFormLabel,
  CustomRadio,
  FormControlLabel,
} from '@/utils/fsms/fsm/mui-imports'
import React, { ChangeEvent, ReactHTML, useEffect, useRef, useState } from 'react'
import { IconX } from '@tabler/icons-react'
import { getDateTimeString } from '@/utils/fsms/common/util'
import { StatusType } from '@/types/message'
import { LoadingBackdrop } from '../loading/LoadingBackdrop'

type srvyInfoObj = {
  srvyTtl: string
  srvyBgngYmd: string
  srvyEndYmd: string
  srvyGdMsgCn: string
}

type questionsObj = {
  chcArtclScorScr: number
  chcArtclSn: number
  qstnChcArtclCn: string
  sbjctvYn: string
  srvyCycl: string
  srvyQitemSn: number
}

type answersObj = {
  chcArtclScorScr: number
  chcArtclSn: number
  qstnChcArtclCn: string
  sbjctvYn: string
  srvyCycl: number
  srvyQitemSn: number
}

type formedQuestObj = {
  qstnChcartclCn: string
  sbjctvYn: string
  srvyQitemSn: number
  ansItems: Array<answersObj>
}

type responseSurveyObj = {
  srvyQitemSn: number
  chcArtclSn: number
  sbjctvRspnsCn: string
}

const SurveyModal = () => {
  
  const queRef = useRef<HTMLDivElement[] | null[]>([]);
  const [loading, setLoading] = useState(false) // 로딩여부
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const [svInfo, setSvInfo] = useState<srvyInfoObj>({
    srvyTtl: '',
    srvyBgngYmd: '',
    srvyEndYmd: '',
    srvyGdMsgCn: '',
  })
  const [questInfo, setQuestInfo] = useState<formedQuestObj[]>([])

  const [params, setParams] = useState<responseSurveyObj[]>([])

  const dispatch = useDispatch()
  const surveyInfo = useSelector((state: AppState) => state.surveyInfo)

  useEffect(() => {
    if (surveyInfo.svModalOpen) {
      fetchData()
    }
  }, [surveyInfo.svModalOpen])

  const submitSurvey = async () => {
    
    let result = isAllCheck();

    let resTxt = result.resTxt;
    const resIndex = result.resIndex;
console.log('resIndex', resIndex)
console.log('queRef', queRef)
    if (resTxt != '') {
      resTxt += '\n상기 항목의 설문을 진행해주시기 바랍니다.'
      alert(resTxt)
      queRef.current[resIndex]?.focus();
      return
    }

    params.splice(0, 1)

    let body = {
      srvyCycl: surveyInfo['svSrvyCycl'],
      reqList: params,
    }

    try {
      let endpoint: string = `/fsm/sup/qesitm/createQesitmRes`
      setIsSubmitting(true)
      const response = await sendHttpRequest('POST', endpoint, body, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success') {
        // 성공
        alert(response.message)
      } else {
        // 실패
        alert('실패 :: ' + response.message)
      }
    } catch (error: StatusType | any) {
      alert(error.errors[0].reason)
    } finally {
      setIsSubmitting(false)
      handleClose()
    }
  }

  const handleClose = () => {
    dispatch(closeServeyModal())
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target // name : 문항번호, value : 선택항목번호
    /**
     * srvyQitemSn : 문항번호
     * chcArtclSn : 항목일련번호
     * sbjctvRspnsCn : 주관식응답내용
     */

    /**
     * //선택항목을 변경할 문항이 있는지 확인하고,
       //있으면 splice함수에서 삭제후 새로 등록하기 위해
       //deleteCnt를 0 또는 1로 설정한다.

       deleteCnt 가 0인 경우 신규 등록, 
       1인 경우 기존 객체를 제거하고, 동일한 인덱스 자리에 신규 객체(선택정보)를 저장한다.
     */

    if (name.includes('sbj')) {
      //주관식 내용을 입력한 경우
      let tmpName = name.substring(0, 1)
      let deleteCnt = params.findIndex(
        (element: responseSurveyObj) => element.srvyQitemSn === Number(tmpName),
      )
      if (deleteCnt == -1) {
        deleteCnt = 0
      } else {
        deleteCnt = 1
      }

      //삭제후 변경한 항목 값을 저장한 객체를 저장한다.
      params.splice(Number(tmpName), deleteCnt, {
        srvyQitemSn: Number(tmpName),
        chcArtclSn: 1,
        sbjctvRspnsCn: value,
      })
    } else {
      //객관식 항목을 선택한 경우
      let deleteCnt = params.findIndex(
        (element: responseSurveyObj) => element.srvyQitemSn === Number(name),
      )
      if (deleteCnt == -1) {
        deleteCnt = 0
      } else {
        deleteCnt = 1
      }

      //삭제후 변경한 항목 값을 저장한 객체를 저장한다.
      params.splice(Number(name), deleteCnt, {
        srvyQitemSn: Number(name),
        chcArtclSn: Number(value),
        sbjctvRspnsCn: '',
      })
    }

    setParams(params)
  }

  const handleSurveyData = (
    question: questionsObj[],
    answers: answersObj[],
  ) => {
    //선택한 항목을 서버로 보내기 위해 배열형태로 params를 생성
    /**
     * [
     *  {
     *    srvyQitemSn: index,
     *    chcArtclSn: 0,
     *    sbjctvRspnsCn: '',
     *  },
     *  {
     *    srvyQitemSn: index,
     *    chcArtclSn: 0,
     *    sbjctvRspnsCn: '',
     *  },
     *  {
     *    srvyQitemSn: index,
     *    chcArtclSn: 0,
     *    sbjctvRspnsCn: '',
     *  },
     *  .....
     * ]
     * 요런 형태로 만들어진다.
     */
    setParams(
      Array.from({ length: question.length + 1 }, (value, index) => ({
        srvyQitemSn: index,
        chcArtclSn: 0,
        sbjctvRspnsCn: '',
      })),
    )

    //화면에 설문조사 내용을 그리기 위한 배열 값
    const returnQue = question.map((questValue, index) => {
      const queObj: any = {}
      queObj[`qstnChcartclCn`] = questValue.qstnChcArtclCn //문항제목
      queObj[`sbjctvYn`] = questValue.sbjctvYn //주관식여부
      queObj[`srvyQitemSn`] = questValue.srvyQitemSn //문항번호
      queObj[`ansItems`] = answers.filter(
        //항목아이템들 :
        (ansValue, index) =>
          questValue[`srvyQitemSn`] === ansValue[`srvyQitemSn`],
      )
      return queObj
    })
    setQuestInfo(returnQue)
  }

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    setLoading(true)
    // setInitialState()
    try {
      // 검색 조건에 맞는 endpoint 생성

      let endpoint: string = `/fsm/sup/qesitm/previewQesitm?srvyCycl=${surveyInfo['svSrvyCycl']}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        let {
          resList1: question,
          resList2: answers,
          srvyTtl,
          srvyBgngYmd,
          srvyEndYmd,
          srvyGdMsgCn,
        } = response.data
        setSvInfo({ srvyTtl, srvyBgngYmd, srvyEndYmd, srvyGdMsgCn })
        handleSurveyData(question, answers)
      } else {
        // 데이터가 없거나 실패
      }
    } catch (error) {
      // 에러시
      alert(error)
    } finally {
      setLoading(false)
    }
  }

  const isAllCheck = () => {
    
    let resTxt = ''    
    let resIndex = 0;

    for (let index = 0; index < params.length; index++) {      
      if (index == 0) continue
      resIndex = index;
      const element = params[index]
      if (element.chcArtclSn < 1) {
        //선택하지 않은 항목인 경우
        resTxt += `${index}. ${questInfo[index - 1].qstnChcartclCn}\n`
        break;
      }
    }

    resIndex += -1

    return { resTxt, resIndex }
  }

  return (
    <Box>
      <Dialog
        fullWidth={false}
        maxWidth={false}
        sx={{
          '& .MuiDialog-paper': {
            width: '800px',
            maxWidth: '800px',
          },
        }}
        open={surveyInfo.svModalOpen}
        // open={false}
        disableEscapeKeyDown
        // onClose={() => {}}
        onClose={handleClose}
      >
        <DialogContent>
          <Box className="table-bottom-button-group">
            <h2>설문조사</h2>
            <div className="button-right-align">
              <IconButton
                color="inherit"
                sx={{
                  color: '#000',
                  padding: 0,
                }}
                onClick={handleClose}
              >
                <IconX size="2rem" />
              </IconButton>
            </div>
          </Box>
          <Box
            id="form-modal"
            component="form"
            sx={{
              display: 'flex',
              flexDirection: 'column',
              m: 'auto',
              width: 'full',
            }}
          >
            <div>
              <div>
                <div className="input-label-display">
                  <h4>
                    설문기간 :
                    {getDateTimeString(svInfo.srvyBgngYmd, 'date')?.dateString}{' '}
                    ~ {getDateTimeString(svInfo.srvyEndYmd, 'date')?.dateString}
                  </h4>
                </div>
                <p style={{ fontSize: 16, color: '#666' }}>
                  {svInfo.srvyGdMsgCn
                    .replaceAll('<br>', ' ')
                    .replaceAll('&nbsp;', '')}
                </p>
              </div>
              <div style={{ marginTop: 20 }}>
                <div
                  style={{
                    border: '1px solid #DEE0E9',
                    borderRadius: 4,
                    padding: 20,
                    height: 440,
                    overflowY: 'auto',
                  }}
                >
                  {/* 설문영역시작 */}
                  {questInfo.map((value: formedQuestObj, index) => {
                    return (
                      <div key={index} style={{ paddingBottom: 15 }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <div
                            style={{
                              marginRight: 10,
                              minHeight: 30,
                              height: 30,
                              width: 30,
                              borderRadius: 30,
                              backgroundColor: '#DBE8FF',
                              color: '#3D79E7',
                              fontSize: 14,
                              fontWeight: 700,
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}
                          >
                            {index + 1}
                          </div>
                          <div
                            style={{
                              flex: '1 1 auto',
                              width: '1%',
                              fontSize: 16,
                              fontWeight: 600,
                              color: '#2A3547',
                            }}
                            ref={(element) => {queRef.current[index] = element}}
                            tabIndex={index}
                          >
                            {value.qstnChcartclCn}
                          </div>
                        </div>
                        <div style={{ paddingLeft: 32 }}>
                          <FormControl fullWidth>
                            <RadioGroup
                              style={{ marginTop: 5, marginLeft: 10 }}
                              name={`${value.srvyQitemSn}`}
                              className="mui-custom-radio-group"
                            >
                              {value.ansItems.map((ansValue, index) => {
                                return (
                                  <React.Fragment key={`ansItem-${index}`}>
                                    <FormControlLabel
                                      key={`chcArtcl-${index}`}
                                      value={`${ansValue.chcArtclSn}`}
                                      control={
                                        <CustomRadio onChange={handleChange} />
                                      }
                                      label={`${ansValue.qstnChcArtclCn}`}
                                    />
                                    {ansValue.sbjctvYn === 'Y' ? (
                                      <FormControlLabel
                                        key={`${index}-${ansValue.chcArtclSn}-subjective`}
                                        name={`${value.srvyQitemSn}sbj`}
                                        control={
                                          <TextField
                                            variant="outlined"
                                            multiline
                                            fullWidth
                                            onChange={handleChange}
                                          />
                                        }
                                        label={''}
                                      />
                                    ) : null}
                                  </React.Fragment>
                                )
                              })}
                            </RadioGroup>
                          </FormControl>
                        </div>
                      </div>
                    )
                  })}
                  {/* 설문영역 종료 */}
                </div>
                <div
                  style={{
                    textAlign: 'center',
                    marginTop: 10,
                    height: 14,
                    marginBottom: 20,
                  }}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={submitSurvey}
                  >
                    설문응답 완료
                  </Button>
                </div>
              </div>
            </div>
          </Box>
          <LoadingBackdrop open={isSubmitting} />
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default SurveyModal

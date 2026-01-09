import { Box, Dialog, DialogContent } from '@mui/material'
import CustomFormLabel from '../../forms/theme-elements/CustomFormLabel'
import { Button } from '@mui/material'
import CustomTextField from '../../forms/theme-elements/CustomTextField'
import { useDispatch, useSelector } from '@/store/hooks'
import { AppState } from '@/store/store'
import { closeDecisionBypeModal } from '@/store/popup/DecisionBypeSlice'
import { useEffect, useState } from 'react'
import { LoadingBackdrop } from '../../loading/LoadingBackdrop'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { usePathname } from 'next/navigation'
import { setLpavSearchTrue } from '@/store/page/LpavSlice'
import { setShlSearchTrue } from '@/store/page/ShlSlice'
import { callRefetch } from '@/types/fsms/common/ilgData'

type decisionBypeObj = {
  bgngAprvYmd: string
  endAprvYmd: string
  [key: string]: string | number
}

type propsObj = {
  dwNo: string
  [key: string]: string | number
}

const DecisionBypeModal = ({ dwNo }: propsObj) => {
  const [loading, setLoading] = useState<boolean>(false)
  const pathname = usePathname()

  const dispatch = useDispatch()
  const decisionBypeInfo = useSelector(
    (state: AppState) => state.decisionBypeInfo,
  )

  const pageUrl = pathname.split('/')[2]

  const [params, setParams] = useState<decisionBypeObj>({
    bgngAprvYmd: '', // 대상시작일자
    endAprvYmd: '', // 대상종료일자
  })

  useEffect(() => {
    if (decisionBypeInfo.dbModalOpen) {
      setParams({
        bgngAprvYmd: '', // 대상시작일자
        endAprvYmd: '', // 대상종료일자
      })
    }
  }, [decisionBypeInfo.dbModalOpen])

  const handleModalClose = () => {
    dispatch(closeDecisionBypeModal())
  }

  const requestDecisionBype = async () => {
    const { bgngAprvYmd, endAprvYmd } = params
    try {
      if (!bgngAprvYmd) {
        alert('시작년월을 입력해주세요')
        return
      }

      if (!endAprvYmd) {
        alert('종료년월을 입력해주세요')
        return
      }

      if (new Date(bgngAprvYmd) > new Date(endAprvYmd)) {
        alert('시작년월은 종료년월보다 클 수 없습니다.')
        return
      }

      let body = {
        bgngAprvYmd: bgngAprvYmd.replaceAll('-', ''),
        endAprvYmd: endAprvYmd.replaceAll('-', ''),
      }
      setLoading(true)

      let endpoint: string = `/fsm${pathname}/tr/decisionBypeExamTrget`

      const response = await sendHttpRequest('PUT', endpoint, body, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        const { resultType, data, status } = response
        alert(data)
        if (String(status).split('')[0] != '2') {
          return
        }
        dispatch(closeDecisionBypeModal())
        callRefetch(pageUrl, dispatch)
      } else {
        // 데이터가 없거나 실패
        alert(response.message)
        return
      }
    } catch (error) {
      alert(error)
      return
    } finally {
      setLoading(false)
    }
  }

  /**
   * 조회조건 값 변경시 호출되는 함수
   * @param event
   */
  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    setParams((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <Box>
      <Dialog
        fullWidth={false}
        maxWidth={'md'}
        open={decisionBypeInfo.dbModalOpen}
        disableEscapeKeyDown
        onClose={(event, reason) => {
          if (reason === 'backdropClick') {
            return
          }
        }}
      >
        <DialogContent>
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              <h2>기간별 조사대상 확정</h2>
            </CustomFormLabel>
            <div className="button-right-align">
              <Button
                variant="contained"
                color="primary"
                onClick={requestDecisionBype}
              >
                저장
              </Button>
              <Button
                variant="contained"
                color="dark"
                onClick={handleModalClose}
              >
                닫기
              </Button>
            </div>
          </Box>

          <Box component="form" onSubmit={() => {}} sx={{ mb: 2 }}>
            <Box className="sch-filter-box">
              <div className="filter-form">
                {/* 지자체명 조회조건 */}
                <div className="form-group">
                  <CustomFormLabel
                    className="input-label-display"
                    required={true}
                  >
                    대상기간
                  </CustomFormLabel>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <CustomFormLabel className="input-label-none" htmlFor="ft-date-start">시작일자</CustomFormLabel>
                    <CustomTextField
                      id="ft-date-start"
                      name="bgngAprvYmd"
                      type={dwNo === '01' ? 'month' : 'date'}
                      value={params.bgngAprvYmd}
                      onChange={handleSearchChange}
                    />
                    <div style={{ margin: '0px 5px' }}>~</div>
                    <CustomFormLabel className="input-label-none" htmlFor="ft-date-end">종료일자</CustomFormLabel>
                    <CustomTextField
                      id="ft-date-end"
                      name="endAprvYmd"
                      type={dwNo === '01' ? 'month' : 'date'}
                      value={params.endAprvYmd}
                      onChange={handleSearchChange}
                    />
                  </div>
                </div>
              </div>
            </Box>
          </Box>
          <LoadingBackdrop open={loading} />
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default DecisionBypeModal

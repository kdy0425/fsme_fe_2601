/* React */
import React, { useState } from 'react'

/* mui component */
import { Box, Button, Dialog, DialogContent } from '@mui/material'
import { CustomFormLabel, CustomTextField } from '@/utils/fsms/fsm/mui-imports'

/* 공통 component */
import { CommSelect } from '@/app/components/tx/commSelect/CommSelect'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

/* 공통js */
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { rrNoFormatter } from '@/utils/fsms/common/util'

/* next js */
import { usePathname } from 'next/navigation'

export type procData = {
  rrno: string            // 복호화 되어 보여줄 값
  paramtrInfoCn: string   // rrno 컬럼 보유한 테이블의 pk컬럼을 쿼리파라미터로 넘겨야 함 ex) vhclNo=경기00자0000&brno=0000000000&crdcoCd=365&rcptSeqNo=00000
  excelDwnldYn?: 'Y'      // 엑셀다운로드 여부 default N
  dataNocs?: number       // 처리건수 default 1
  defaultValue?: string   // 조회선택사유 select box의 default값 -> 값 지정시 해당 select box는 수정불가
}

/* interface 선언 */
type propsInterface = {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  procData: procData
}

type paramsType = {
  inqRsnCd: string
  inqRsnCn: string
}

const ShowRrnoModal = (props: propsInterface) => {

  const { open, setOpen, procData } = props

  const pathname = usePathname()

  const [params, setParams] = useState<paramsType>({ inqRsnCd: '', inqRsnCn: '' })
  const [show, setShow] = useState<boolean>(false);
  const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 저장시 로딩상태

  const handleShow = async () => {

    if (!params.inqRsnCd) {
      alert('개인정보 조회사유를 선택해 주세요.')
      return
    }

    if (!params.inqRsnCn) {
      alert('개인정보 조회사유내용을 입력해 주세요.')
      return
    }

    setLoadingBackdrop(true)

    try {

      const endPoint = '/fsm/cad/cijm/cm/saveReasonViewPersonalInfo'
      const body = {
        paramtrInfoCn: procData.paramtrInfoCn,
        inqScrnInfoCn: pathname,
        inqRsnCd: params.inqRsnCd,
        inqRsnCn: params.inqRsnCn,
        excelDwnldYn: procData.excelDwnldYn ? procData.excelDwnldYn : 'N',
        dataNocs: procData.dataNocs ? procData.dataNocs : 1,
      }

      const response = await sendHttpRequest('POST', endPoint, body, true, { cache: 'no-store' })

      if (response && response.resultType === 'success') {
        alert('완료되었습니다')
        setShow(true);
      } else {
        alert('[열람실패] 관리자에게 문의부탁드립니다')
      }
    } catch (error) {
      console.log(error)
    } finally {
      setLoadingBackdrop(false)
    }
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target
    setParams((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <Box>
      <Dialog fullWidth={true} maxWidth={'sm'} open={open}>
        <DialogContent>
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              {!show ? (
                <h2>개인정보 조회사유 입력</h2>
              ) : (
                <h2>개인정보 조회 결과</h2>
              )}
            </CustomFormLabel>

            {/* 버튼 */}
            <div className=" button-right-align">

              {!show ? (
                <Button variant="contained" color="primary" onClick={handleShow}>
                  저장
                </Button>
              ) : null}

              <Button variant="contained" color="dark" onClick={() => setOpen(false)}>
                닫기
              </Button>
            </div>
          </Box>

          <div id="alert-dialog-description1">
            <div className="table-scrollable">
              <table className="table table-bordered">
                <caption>
                  {!show ? (
                    <>개인정보 조회사유 입력</>
                  ) : (
                    <>개인정보 조회 결과</>
                  )}

                </caption>
                <colgroup>
                  <col style={{ width: '25%' }}></col>
                  <col style={{ width: '75%' }}></col>
                </colgroup>
                <tbody>
                  <tr>
                    <th className="td-head" scope="row">
                      {!show ? (
                        <>조회사유선택</>
                      ) : (
                        <>조회 결과</>
                      )}
                    </th>
                    <td>
                      <div className="form-group" style={{ width: '100%' }}>
                        {!show ? (
                          <>
                            <CustomFormLabel
                              className="input-label-none"
                              htmlFor="sch-inqRsnCd"
                            >
                              조회사유선택
                            </CustomFormLabel>
                            <CommSelect
                              cdGroupNm="500"
                              pValue={params.inqRsnCd}
                              handleChange={handleSearchChange}
                              pName="inqRsnCd"
                              htmlFor={"sch-inqRsnCd"}
                              addText='선택'
                              defaultValue={procData.defaultValue}
                              pDisabled={procData.defaultValue ? true : false}
                            />
                          </>
                        ) : (
                          <>
                            {rrNoFormatter(procData.rrno)}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                  {!show ? (
                    <tr>
                      <th className="td-head" scope="row">
                        조회사유입력
                      </th>
                      <td>
                        <CustomFormLabel
                          className='input-label-none'
                          htmlFor='ft-inqRsnCn'
                        >
                          조회사유입력
                        </CustomFormLabel>
                        <CustomTextField
                          id='ft-inqRsnCn'
                          fullWidth
                          name='inqRsnCn'
                          value={params.inqRsnCn}
                          onChange={handleSearchChange}
                        />
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
            {/* 테이블영역 끝 */}
          </div>
          {/* 로딩 */}
          <LoadingBackdrop open={loadingBackdrop} />
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default ShowRrnoModal

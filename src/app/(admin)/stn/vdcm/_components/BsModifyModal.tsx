import {
  CustomFormLabel,
  CustomSelect,
  CustomTextField,
} from '@/utils/fsms/fsm/mui-imports'
import { Box } from '@mui/material'
import { Button, Dialog, DialogContent } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { Row } from './BsPage'
import { VhclSearchModal, VhclRow } from '@/components/bs/popup/VhclSearchModal'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import {
  getForamtAddDay,
  getDateFormatYMD,
  getFormatToday,
} from '@/utils/fsms/common/dateUtils'
import { brNoFormatter } from '@/utils/fsms/common/util'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import { CommSelect } from '@/app/components/tx/commSelect/CommSelect'
import { SelectItem } from 'select'
import { getCodesByGroupNm } from '@/utils/fsms/common/code/getCode'

interface BsModifyModalProps {
  open: boolean
  handleClickClose: () => void
  row: Row | null
  reload: () => void
}

type data = {
  aftchKoiCd: string
  aftrLcnsTpbizCd: string
  brno: string
  vhclNo: string
  vhclSeCd: string
  koiCd: string
}

const BsModifyModal = (props: BsModifyModalProps) => {
  const { open, handleClickClose, row, reload } = props

  const [vhclOpen, setVhclOpen] = useState(false)
  const [LcnsTpbizItem, seLcnsTpbizItem] = useState<SelectItem[]>([])
  const [loadingBackdrop, setLoadingBackdrop] = useState(false)

  const [data, setData] = useState<data>({
    aftchKoiCd: '',
    aftrLcnsTpbizCd: '',
    brno: '',
    vhclNo: '',
    vhclSeCd: '',
    koiCd: '',
  })

  useEffect(() => {
    setData({
      aftchKoiCd: '',
      aftrLcnsTpbizCd: '',
      brno: '',
      vhclNo: '',
      vhclSeCd: '',
      koiCd: '',
    })
  }, [open])

  useEffect(() => {
    getCodesByGroupNm('505').then((res) => {
      let itemArr: SelectItem[] = []
      if (res) {
        res.map((code: any) => {
          let item: SelectItem = {
            label: code['cdKornNm'],
            value: code['cdNm'],
          }

          itemArr.push(item)
        })
      }
      seLcnsTpbizItem(itemArr)
    })
  }, [])

  const handleParamChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    setData((prev) => ({ ...prev, [name]: value }))
  }

  const setVhcl = (vhclRow: VhclRow) => {
    setData((prev) => ({
      ...prev,
      brno: vhclRow.brno,
      vhclNo: vhclRow.vhclNo,
      vhclSeCd: vhclRow.vhclSeCd,
      koiCd: vhclRow.koiCd,
    }))

    setVhclOpen(false)
  }

  const saveData = async () => {
    if (!data.vhclNo) {
      alert('차량을 선택해주세요.')
      return
    }

    if (!data.aftchKoiCd) {
      alert('유종을 입력해주세요.')
      return
    }

    if (!data.aftrLcnsTpbizCd) {
      alert('면허업종 입력해주세요.')
      return
    }

    if (!confirm('차량제원변경 등록하시겠습니까?')) {
      return
    }
    let endpoint: string = `/fsm/stn/vdcm/bs/createVhcleDtaChangeMng`

    let params = {
      bfchgKoiCd: data?.koiCd,
      aftchKoiCd: data.aftchKoiCd,
      bfrLcnsTpbizCd: data?.vhclSeCd ?? '',
      aftrLcnsTpbizCd: data?.aftrLcnsTpbizCd,
      brno: data.brno,
      vhclNo: data.vhclNo,
    }

    try {
      setLoadingBackdrop(true)
      const response = await sendHttpRequest('POST', endpoint, params, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success') {
        alert(response.message)
        handleClickClose()
        reload()
      } else {
        alert(response.message)
      }
    } catch (error) {
      alert(error)
    } finally {
      setLoadingBackdrop(false)
    }
  }

  const parseLcnsTpbiz = (label: string) => {
    if (label) {
      let item = LcnsTpbizItem.find((code) => code.label === label)
      return item ? item['value'] : label
    }
  }

  return (
    <Box>
      <Dialog
        fullWidth={false}
        maxWidth={'lg'}
        open={open}
        PaperProps={{
          style: {
            width: '1100px',
          },
        }}
        >
        <DialogContent>
          <Box className="table-bottom-button-group">
              <CustomFormLabel className="input-label-display">
                <h2 >차량제원변경등록</h2>
              </CustomFormLabel>
            <div className=" button-right-align">
              <Button variant="contained" color="primary" onClick={saveData}>
                저장
              </Button>
              <Button
                variant="contained"
                color="dark"
                onClick={handleClickClose}
              >
                취소
              </Button>
            </div>
          </Box>
          {/* 모달팝업 내용 시작 */}
          <div id="alert-dialog-description1">
            {/* 테이블영역 시작 */}
            <div className="table-scrollable">
              <table className="table table-bordered">
                <caption>사업자 정보 테이블 요약</caption>
                <colgroup>
                  <col style={{ width: '16%' }}></col>
                  <col style={{ width: '17%' }}></col>
                  <col style={{ width: '16%' }}></col>
                  <col style={{ width: '17%' }}></col>
                  <col style={{ width: '16%' }}></col>
                  <col style={{ width: '17%' }}></col>
                </colgroup>
                <tbody>
                  <tr>
                    <th className="td-head" scope="row">
                      차량번호
                    </th>
                    <td>
                      <div className="form-group" style={{ width: '100%'  ,whiteSpace: 'nowrap'}}>
                        {data.vhclNo}
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                          <Button
                            onClick={() => setVhclOpen(true)}
                            style={{ float: 'right' }}
                            variant="contained"
                            color="dark"
                          >
                            선택
                          </Button>
                        </Box>
              
                      </div>
                    </td>
                    <th className="td-head" scope="row">
                      유종
                    </th>
                    <td>
                      <div className="form-group">
                        <CustomFormLabel
                          className="input-label-display"
                          htmlFor="sch-aftchKoiCd"
                        ></CustomFormLabel>
                        <CommSelect
                          cdGroupNm="504"
                          pValue={data.aftchKoiCd}
                          handleChange={handleParamChange}
                          pName="aftchKoiCd"
                          htmlFor={'sch-aftchKoiCd'}
                          addText="전체"
                        />
                      </div>
                    </td>
                    <th className="td-head" scope="row">
                      면허업종
                    </th>
                    <td>
                      <div className="form-group">
                        <CustomFormLabel
                          className="input-label-display"
                          htmlFor="sch-aftrLcnsTpbizCd"
                        ></CustomFormLabel>
                        <CommSelect
                          cdGroupNm="505"
                          pValue={data.aftrLcnsTpbizCd}
                          handleChange={handleParamChange}
                          pName="aftrLcnsTpbizCd"
                          htmlFor={'sch-aftrLcnsTpbizCd'}
                          addText="전체"
                        />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            {/* 테이블영역 끝 */}
          </div>
          {/* 모달팝업 내용 끝 */}
          <LoadingBackdrop open={loadingBackdrop} />
        </DialogContent>
      </Dialog>
      <VhclSearchModal
        onCloseClick={() => setVhclOpen(false)}
        onRowClick={setVhcl}
        title="차량번호 조회"
        url="/fsm/stn/vdcm/bs/getUserVhcle"
        open={vhclOpen}
      />
    </Box>
  )
}

export default BsModifyModal

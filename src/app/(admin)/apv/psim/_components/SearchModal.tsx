'use client'
import FormModal from '@/app/components/popup/FormDialog'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { CustomFormLabel, CustomTextField } from '@/utils/fsms/fsm/mui-imports'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog, { DialogProps } from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import React, { ReactNode, useEffect, useState } from 'react'
import { apvPsimPosFrcsTrHeadCells } from '@/utils/fsms/headCells'
import { Row } from '../page'
import RegisterModalForm from './ModalContent'

interface FormModalProps {
  buttonLabel: string
  title: string
  formId?: string
  formLabel?: string | '저장' | '검색'
  size?: DialogProps['maxWidth'] | 'lg'
  registerBtn?: ReactNode
  remoteFlag?: boolean
  printBtn?: boolean
  reloadFn?: () => void
}

export default function SearchModal(props: FormModalProps) {
  const { reloadFn } = props
  const [open, setOpen] = useState(false)
  const [params, setParams] = useState({
    frcsBrno: '',
  })
  const [frcsBrno, setFrcsBrno] = useState<string>('')
  const [rows, setRows] = useState<Row[]>([])
  const [resType, setResType] = useState<string>('')
  const [registerable, setRegisterable] = useState<boolean>(false)
  const [remoteFlag, setRemoteFlag] = useState<boolean>(false)

  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    setParams((prev) => ({ ...prev, [name]: value }))
  }

  useEffect(() => {
    //console.log("RESTYPE ::: ", resType);

    if (resType == '0') {
      alert('사업자번호로 조회하여 카드사로부터 등록된 주유소가 없습니다.')
    } else if (resType == '1') {
      alert('등록 가능합니다.')
      setFrcsBrno(params.frcsBrno.replaceAll('-', '').replaceAll(' ', '').replaceAll(/\t/g, ''))
      setRegisterable(true)
    } else if (resType == '2') {
      alert(
        '동일한 사업자등록번호로 등록된 주유소가 있습니다.\n' +
          '정보 변경일 경우 닫기버튼으로 목록으로 돌아가 해당 주유소를 조회한 후 수정을 진행하시고,\n' +
          '신규 등록일 경우 등록버튼을 눌러 진행하시기 바랍니다.',
      )
      setFrcsBrno(params.frcsBrno.replaceAll('-', '').replaceAll(' ', '').replaceAll(/\t/g, ''))
      setRegisterable(true)
    }
  }, [resType])

  const handleOpenModal = () => {
    if (resType == '' || resType == '0') {
      return alert('먼저 사업자등록번호로 조회를 해야 합니다.')
    } else if (frcsBrno && registerable) {
      setRemoteFlag(true)
    }
  }

  const handleCloseModal = () => {
    setRemoteFlag(false)
  }

  const fetchData = async () => {
    try {
      if (!params.frcsBrno.replaceAll('-', '')) {
        alert('사업자등록번호를 입력해주세요.')
        return
      }

      let endpoint: string =
        `/fsm/apv/psim/tr/getFrcsBrnoAuth?` +
        `${params.frcsBrno ? '&frcsBrno=' + params.frcsBrno.replaceAll('-', '') : ''}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        setRows(response.data.resList ?? [])
        setResType(response.data.resType)
      } else {
        // 데이터가 없거나 실패
        setRows([])
        setResType('')
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setRows([])
    }
  }

  const searchData = async (event: React.FormEvent) => {
    event.preventDefault()
    event.stopPropagation()

    setResType('')
    setRows([])
    setRegisterable(false)
    await fetchData()
  }

  const handleClickOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setResType('')
    setParams({ frcsBrno: '' })
    setRegisterable(false)
    setFrcsBrno('')
    setRows([])
    setRemoteFlag(false)
    setOpen(false)
  }

  const reload = () => {
    handleClose()
    reloadFn?.()
  }

  useEffect(() => {
    if (props.remoteFlag !== undefined && props.remoteFlag == false) {
      setOpen(false)
    }
  }, [props.remoteFlag])

  return (
    <React.Fragment>
      <Button variant="contained" onClick={handleClickOpen}>
        {props.buttonLabel}
      </Button>
      <Dialog
        fullWidth={false}
        maxWidth={props.size}
        open={open}
        onClose={handleClose}
      >
        <DialogContent>
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              <h2>{props.title}</h2>
            </CustomFormLabel>
            <div className=" button-right-align">
              <Button
                variant="contained"
                type="submit"
                form={props.formId}
                color="primary"
              >
                {props.formLabel}
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleOpenModal()}
              >
                등록
              </Button>
              <FormModal
                size="lg"
                buttonLabel={''}
                title={'POS시스템설치등록'}
                formId="send-posdata"
                formLabel="저장"
                openHandler={handleOpenModal}
                closeHandler={handleCloseModal}
                remoteFlag={remoteFlag}
                children={
                  <RegisterModalForm
                    formType="POST"
                    frcsBrno={frcsBrno}
                    resType={resType}
                    data={null}
                    reloadFn={reload}
                  />
                }
              />
              <Button onClick={handleClose} variant="contained" color="dark">
                취소
              </Button>
            </div>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              m: 'auto',
              width: 'full',
            }}
          >
            <Box
              component="form"
              id="frcs-search"
              onSubmit={searchData}
              className="sch-filter-box"
              sx={{ minWidth: 1000, mb: 2 }}
            >
              <div className="filter-form">
                <div className="form-group">
                  <CustomFormLabel
                    className="input-label-display"
                    htmlFor="ft-modal-frcsBrno"
                    required
                  >
                    사업자등록번호
                  </CustomFormLabel>
                  <CustomTextField
                    id="ft-modal-frcsBrno"
                    name="frcsBrno"
                    value={params.frcsBrno}
                    onChange={handleSearchChange}
                    fullWidth
                  />
                </div>
              </div>
            </Box>

            <Box style={{ marginBottom: 50 }}>
              <TableDataGrid
                headCells={apvPsimPosFrcsTrHeadCells}
                rows={rows}
                totalRows={-1}
                loading={false}
                onPaginationModelChange={() => {}}
                onRowClick={() => {}}
                pageable={{
                  pageNumber: 0,
                  pageSize: 0,
                  totalPages: 0,
                }}
                paging={false}
                caption={'POS시스템설치확인 목록 조회'}
              />
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  )
}

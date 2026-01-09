/* react */
import { Dispatch, SetStateAction, useState, useEffect, ReactElement } from 'react'

/* mui component */
import { Button, Dialog, DialogContent, Box } from '@mui/material'
import { CustomFormLabel } from '@/utils/fsms/fsm/mui-imports'

/* 공통 component */
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'

/* 공통 js */
import { getExcelFile, getToday } from "@/utils/fsms/common/comm";
import { sendHttpRequest, sendSingleMultipartFormDataRequest } from "@/utils/fsms/common/apiUtils";
import { getUserInfo } from '@/utils/fsms/utils';
import { brNoFormatter } from '@/utils/fsms/common/util'

/* type, interface */
import { HeadCell } from 'table'

type propsType = {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  type: '전입' | '전출'
  reload: () => void
}

type ExcelRow = {
  vhclNo?: string
  brno?: string
  brnoFm: string
  bzmnSeCd?: string
  bzmnSeNm?: string
  bfLocgovCd?: string
  bfLocgovNm?: string
  afLocgovCd?: string
  afLocgovNm?: string
  gb: 'N' | 'Y'
  gbNm: string
  gbNmTag: ReactElement
  rsnCn?: string
  rsnCnTag: ReactElement
}

export type createType = {
  brno: string
  vhclNo: string
  exsLocgovCd: string
  chgLocgovCd: string
  bzmnSeCd: string
}

const headCells: HeadCell[] = [
  {
    id: 'vhclNo',
    numeric: false,
    disablePadding: false,
    label: '차량번호',
  },
  {
    id: 'brnoFm',
    numeric: false,
    disablePadding: false,
    label: '사업자번호',
  },
  {
    id: 'bzmnSeNm',
    numeric: false,
    disablePadding: false,
    label: '개인법인구분',
  },
  {
    id: 'bfLocgovNm',
    numeric: false,
    disablePadding: false,
    label: '전출관청',
  },
  {
    id: 'afLocgovNm',
    numeric: false,
    disablePadding: false,
    label: '전입관청',
  },
  {
    id: 'gbNmTag',
    numeric: false,
    disablePadding: false,
    label: '등록상태',
  },
  {
    id: 'rsnCnTag',
    numeric: false,
    disablePadding: false,
    label: '오류사유',
  },
]

const LocalChangeModal = (props: propsType) => {

  const { open, setOpen, type, reload } = props

  const userInfo = getUserInfo()

  /* loading 상태관리 */
  const [loadingBackdrop, setLoadingBackdrop] = useState(false)

  /* file 상태관리 */
  const [uploadedFileName, setUploadedFileName] = useState<string>("") // 업로드된 파일 이름
  const [selectedFile, setSelectedFile] = useState<File | null>(null) // 업로드된 파일

  /* row 상태관리 */
  const [rows, setRows] = useState<ExcelRow[]>([]) // 업로드된 파일 -> row
  const [sucCnt, setSucCnt] = useState<number>(0)
  const [errCnt, setErrCnt] = useState<number>(0)

  useEffect(() => {
    if (selectedFile) {
      createExcelFileToRow()
    }
  }, [selectedFile])

  // 샘플파일 다운로드
  const sampleFileDownload = async (): Promise<void> => {
    setLoadingBackdrop(true)
    const endpoint = type === '전입' ? '/fsm/stn/lttm/tx/getExcelLgovTrnsfrnSample' : '/fsm/stn/ltmm/tx/getExcelLgovMvtSample'
    await getExcelFile(endpoint, `샘플파일_${getToday()}.xlsx`)
    setLoadingBackdrop(false)
  }

  // 엑셀 업로드
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {

    const file = event.target.files?.[0]
    const extension = file?.name.substring(file?.name.lastIndexOf('.'))

    if (!file) {
      alert("파일을 선택해주세요.")
    } else if (extension !== '.xls' && extension !== '.xlsx') {
      alert("엑셀파일만 업로드 가능합니다.")
    } else {
      setUploadedFileName(file.name) // 파일 이름 업데이트
      setSelectedFile(file) // 파일 객체 저장

      // 파일 선택 초기화 (같은 파일 재선택 가능하도록)
      event.target.value = ""
    }
  }

  // 업로드 파일 -> row
  const createExcelFileToRow = async (): Promise<void> => {

    const locgovCd = userInfo.locgovCd

    if (!locgovCd) {
      alert('본인 지자체 정보가 로드되지 않아 등록 불가합니다.\n관리자에게 문의 부탁드립니다')
      return
    }

    try {

      setRows([])
      setSucCnt(0)
      setErrCnt(0)
      setLoadingBackdrop(true)

      const endpoint = type === '전입' ? '/fsm/stn/lttm/tx/getInsertExcelLgovTrnsfrnRequst' : '/fsm/stn/ltmm/tx/getInsertExcelLgovMvtRequst'
      const response = await sendSingleMultipartFormDataRequest('POST', endpoint, { locgovCd: locgovCd }, selectedFile ?? undefined, true)

      if (response && response.resultType === 'success' && response.data.length !== 0) {

        const tempRows: ExcelRow[] = response.data
        const rsltRows: ExcelRow[] = []

        let sCnt = 0
        let eCnt = 0

        tempRows.map((item) => {

          let color = ''

          if (item.gb === 'N') {
            eCnt++
            color = '#f44336'
          } else {
            sCnt++
            color = '#2196f3'
          }

          const gbNmTag = <Box fontWeight={700} color={color}>{item.gbNm}</Box>
          const rsnCnTag = <Box fontWeight={700} color={color}>{item.rsnCn}</Box>

          let brnoFm = item.brno ?? ''

          if (item.brno?.length === 10 && !isNaN(Number(item.brno))) {
            brnoFm = brNoFormatter(item.brno) ?? ''
          }

          rsltRows.push({
            ...item,
            gbNmTag: gbNmTag,
            rsnCnTag: rsnCnTag,
            brnoFm: brnoFm
          })
        })

        setSucCnt(sCnt)
        setErrCnt(eCnt)
        setRows(rsltRows)
      } else {
        alert("등록할 내역이 없거나, 등록에 실패했습니다.\n다시 시도해 주세요.")
      }
    } catch (error) {
      alert("파일 업로드 중 오류가 발생했습니다.")
      setSelectedFile(null)
      setUploadedFileName("")
    } finally {
      setLoadingBackdrop(false)
    }
  }

  // 저장
  const createTrnsfrnRequAll = async (): Promise<void> => {

    if (sucCnt + errCnt === 0 || sucCnt === 0) {
      alert('등록할 내역이 없습니다.')
      return
    }

    if (confirm('업로드 ' + (sucCnt + errCnt) + '건 중, 정상 ' + sucCnt + '건만 등록됩니다.\n' + type + '일괄등록 하시겠습니까?')) {

      try {

        setLoadingBackdrop(true)

        const endpoint = type === '전입' ? '/fsm/stn/lttm/tx/createLgovTrnsfrnAllRequst' : '/fsm/stn/ltmm/tx/createLgovMvtAllRequst'

        const list: createType[] = []

        rows.map(item => {
          if (item.gb === 'Y') {
            list.push({
              brno: item.brno ?? '',
              vhclNo: item.vhclNo ?? '',
              exsLocgovCd: item.bfLocgovCd ?? '',
              chgLocgovCd: item.afLocgovCd ?? '',
              bzmnSeCd: item.bzmnSeCd ?? ''
            })
          }
        })

        const body = { list: list }

        const response = await sendHttpRequest('POST', endpoint, body, true, { cache: 'no-store' })

        if (response && response.resultType === 'success') {
          alert('등록되었습니다.')
          setOpen(false)
          reload()
        } else {
          alert(response.message)
        }
      } catch (error) {
        console.error(error)
      } finally {
        setLoadingBackdrop(false)
      }
    }
  }

  return (
    <Dialog
      fullWidth={true}
      maxWidth={'lg'}
      open={open}
    >
      <DialogContent>
        <Box className="table-bottom-button-group">
          <CustomFormLabel className="input-label-display">
            <h2>{type}일괄등록</h2>
          </CustomFormLabel>
          <div className="button-right-align">
            <Button
              variant="contained"
              type="button"
              color="success"
              onClick={sampleFileDownload}
            >
              샘플파일 다운로드
            </Button>
            <label htmlFor="file-upload">
              <input
                id="file-upload"
                type="file"
                accept=".xls, .xlsx"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
              <Button
                variant="contained"
                component="span"
                color="success"
              >
                엑셀 업로드
              </Button>
            </label>
            <Button
              variant="contained"
              type="button"
              color="primary"
              onClick={createTrnsfrnRequAll}
            >
              저장
            </Button>
            <Button
              variant="contained"
              type="button"
              color="dark"
              onClick={() => setOpen(false)}
            >
              닫기
            </Button>
          </div>
        </Box>

        <Box>
          {uploadedFileName ? (
            <Box pb={1.5}>
              <p>업로드된 파일 : <strong>{uploadedFileName}</strong></p>
            </Box>
          ) : null}
        </Box>

        <Box>
          <TableDataGrid
            headCells={headCells}
            rows={rows}
            loading={false}
            caption={type + "일괄등록 업로드 목록"}
          />
        </Box>
      </DialogContent>

      {loadingBackdrop ? (
        <LoadingBackdrop open={loadingBackdrop} />
      ) : null}

    </Dialog>
  )
}

export default LocalChangeModal
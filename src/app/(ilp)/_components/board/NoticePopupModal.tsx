'use client'

/* React */
import React, { memo, useEffect, useState } from 'react'

/* mui component */
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import { Box, Button, TableRow, FormControlLabel } from '@mui/material'
import { CustomFormLabel } from '@/utils/fsms/fsm/mui-imports'

/* 공통 components */
import CustomCheckbox from '@/app/components/forms/theme-elements/CustomCheckbox'

/* 공통 js */
import { getDateFormatYMD } from '@/utils/fsms/common/dateUtils'
import { getCookie, setCookie } from '@/utils/fsms/common/util'

/* _components */
import FilesMngCompo from './FilesMngCompo'

/* 게시판 타입 */
import { dwBoardDtl, dwBoardAtt, otherData, boardType } from './type'

/* 게시판 정보 */
import { getBoardData } from './boardInfo'

/* 공통 게시판 & 메인 팝업 공지사항 유지보수성 컴포넌트 */
import { BoardContainer, LeftCell, RightCell, CustomTextArea } from './BoardComponents'

type propsType = {
  boardType: boardType
  bbscttSn: string
  bbsSn: string
}

const NoticePopupModal = (props: propsType) => {

  const [open, setOpen] = useState<boolean>(false)

  // 프로세스용
  const [procData, setProcData] = useState<dwBoardDtl>({
    popupNtcYn: 'N',
    popupBgngYmd: '',
    ttl: '',
    leadCnCd: '',
    relateTaskSeCd: '',
    bbscttSn: '',
    bbsSn: '',
    cn: '',
    popupEndYmd: '',
  })

  // 데이터 노출용
  const [noneProcData, setNoneProcData] = useState<otherData>({
    locgovNm: '',
    rgtrId: '',
    originTtl: '',
    leadCnNm: '',
    relateTaskSeNm: '',
  })

  /* 파일 상태관리 */
  const [extFileList, setExtFileList] = useState<dwBoardAtt[]>([])  // 기존 파일

  // 화면 최초 렌더링 시
  useEffect(() => {
    init()
  }, [])

  // 조회수 올리기, 댓글 & 파일가져오기, 등록된 값 세팅
  const init = async (): Promise<void> => {

    const response = await getBoardData(props.boardType, props.bbscttSn, props.bbsSn)

    if (!response) {
      alert('관리자에게 문의 부탁드립니다.')
    } else {
      // 파일세팅
      setExtFileList(response.fileList)
      // 저장, 수정 데이터세팅
      setProcData({
        popupNtcYn: response.procData.popupNtcYn,
        popupBgngYmd: getDateFormatYMD(response.procData.popupBgngYmd),
        ttl: response.procData.originTtl ?? '',
        leadCnCd: response.procData.leadCnCd,
        relateTaskSeCd: response.procData.relateTaskSeCd,
        bbscttSn: response.procData.bbscttSn,
        bbsSn: response.procData.bbsSn,
        cn: response.procData.cn,
        popupEndYmd: getDateFormatYMD(response.procData.popupEndYmd),
      })
      // 노출용 데이터 세팅
      setNoneProcData({
        locgovNm: response.noneProcData.locgovNm,
        rgtrId: response.noneProcData.rgtrId,
        originTtl: response.noneProcData.originTtl,
        leadCnNm: response.noneProcData.leadCnNm,
        relateTaskSeNm: response.noneProcData.relateTaskSeNm,
      })
      // 모달 show
      setOpen(true)
    }
  }

  const changeCookie = (event: React.ChangeEvent<HTMLInputElement>) => {
    let { checked } = event.target
    if (checked) {
      includeModalCookie('ignoreModal', Number(props.bbscttSn ?? '0'))
    } else {
      excludeModalCookie('ignoreModal', Number(props.bbscttSn ?? '0'))
    }
  }

  const includeModalCookie = (name: string, value: number) => {
    /**
     * 1. name에 해당하는 cookie를 가져온다.
     * 1-1. 없으면 만든다.
     * 2. name cookie에 value 배열을 넣은 값을 세팅한다.
     * 3. cookie를 세팅한다. document.cookie = `......`
     */
    const cookie: Array<number> = getCookie(name)
    if (cookie == null) {
      setCookie(name, [value], 7)
    } else {
      if (cookie.includes(value)) {
        return
      }
      cookie.push(value)
      setCookie(name, cookie, 7)
    }
  }

  const excludeModalCookie = (name: string, value: number) => {
    const cookie: Array<number> = getCookie(name)
    if (cookie == null) {
      return
    } else {
      const findIdx = cookie.findIndex((cookieVal) => cookieVal === value)
      if (findIdx < 0) {
        return
      }
      cookie.splice(findIdx, 1)
      setCookie(name, cookie, 7)
    }
  }

  return (
    <Dialog
      fullWidth={true}
      maxWidth={'lg'}
      open={open}
      hideBackdrop
    >
      <DialogContent>
        <Box className="table-bottom-button-group">
          <CustomFormLabel className="input-label-display">
            <h2>공지사항</h2>
          </CustomFormLabel>
          <div className="button-right-align">
            <Button
              variant="contained"
              color="dark"
              onClick={() => setOpen(false)}>
              닫기
            </Button>
          </div>
        </Box>
        <Box>
          <BoardContainer>
            <TableRow>
              {/* 구분 */}
              <LeftCell isRequire={false} title='공지구분' />
              <RightCell>{noneProcData.leadCnNm}</RightCell>
              {/* 업무구분 */}
              <LeftCell isRequire={false} title='업무구분' />
              <RightCell>{noneProcData.relateTaskSeNm}</RightCell>
            </TableRow>

            {/* 제목 */}
            <TableRow>
              <LeftCell isRequire={false} title='제목' />
              <RightCell colSpan={3}>{noneProcData.originTtl}</RightCell>
            </TableRow>

            {/* 내용 */}
            <TableRow>
              <LeftCell isRequire={false} title='내용' />
              <RightCell colSpan={3}>
                <CustomTextArea>
                  {procData.cn}
                </CustomTextArea>
              </RightCell>
            </TableRow>

            {/* 파일 */}
            <TableRow>
              <FilesMngCompo
                extFileList={extFileList}
                setExtFileList={() => null}
                newFileList={[]}
                setNewFileList={() => null}
              />
            </TableRow>
          </BoardContainer>
        </Box>
        <FormControlLabel
          label="일주일간 보여주지 않기"
          control={<CustomCheckbox onChange={changeCookie} />}
        />
      </DialogContent>
    </Dialog>
  )
}

export default memo(NoticePopupModal)
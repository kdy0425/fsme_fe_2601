'use client'

/* React */
import React, { useEffect, useState, useContext } from 'react'

/* mui component */
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import {
  Box,
  Button,
  TableRow,
  RadioGroup,
  FormControlLabel,
} from '@mui/material'
import { CustomFormLabel, CustomRadio } from '@/utils/fsms/fsm/mui-imports'

/* 공통 js */
import {
  sendHttpRequest,
  sendMultipartFormDataRequest,
} from '@/utils/fsms/common/apiUtils'
import { getUserInfo } from '@/utils/fsms/utils'
import { getDateFormatYMD } from '@/utils/fsms/common/dateUtils'

/* 공통 component */
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import { CommSelect } from '@/app/components/tx/commSelect/CommSelect'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'

/* _components */
import FilesMngCompo from './FilesMngCompo'
import CommentsMngCompo from './CommentsMngCompo'

/* context */
import UserAuthContext from '@/app/components/context/UserAuthContext'

/* 게시판 타입 */
import { dwBoardDtl, dwBoardAtt, dwBoardReply, otherData } from './type'

/* 게시판 정보 */
import {
  enableLocgovObj,
  enablePopupObj,
  boardPathObj,
  leadCnCdObj,
  modalTitleObj,
  enableFileObj,
  enableCommentObj,
  getBoardData,
} from './boardInfo'

/* redux-toolkit */
import { useSelector, useDispatch } from '@/store/hooks'
import {
  handleIlpBoardClose,
  changeUpdateType,
} from '@/store/popup/IlpBoardSlice'

/* 공통 게시판 & 메인 팝업 공지사항 유지보수성 컴포넌트 */
import {
  BoardContainer,
  LeftCell,
  RightCell,
  CustomTextArea,
} from './BoardComponents'

// 재조회는 props로 받음
type propsType = {
  handleReload?: () => any
  isMain?: boolean
}

const BoardModal = (props: propsType) => {
  // 유저 권한
  const { authInfo } = useContext(UserAuthContext)
  const userInfo = getUserInfo()

  // redux-toolkit
  const { bbsSn, bbscttSn, boardType, ilpBoardOpen, openType } = useSelector(
    (state) => state.IlpBoard,
  )
  const dispatch = useDispatch()

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
  const [newFileList, setNewFileList] = useState<File[]>([]) // 신규파일
  const [extFileList, setExtFileList] = useState<dwBoardAtt[]>([]) // 기존 파일

  /* 댓글 상태관리 */
  const [commentList, setCommentList] = useState<dwBoardReply[]>([])

  // 로딩
  const [loadingBackdrop, setLoadingBackdrop] = useState<boolean>(false)

  // 업데이트 가능여부
  const [enableUpdate, setEnableUpdate] = useState<boolean>(false)

  // 화면 최초 렌더링 시
  useEffect(() => {
    if (ilpBoardOpen && openType === 'VIEW') {
      init()
    }
  }, [ilpBoardOpen])

  // 수정 권한 부여 (관리자, 국토부, 작성자)
  useEffect(() => {
    if ('roles' in authInfo && Array.isArray(authInfo.roles)) {
      if (
        authInfo.roles.includes('ADMIN') ||
        authInfo.roles.includes('MOLIT')
      ) {
        setEnableUpdate(true)
      }
    }
  }, [authInfo])

  // 조회수 올리기, 댓글 & 파일가져오기, 등록된 값 세팅
  const init = async (): Promise<void> => {
    const response = await getBoardData(boardType, bbscttSn, bbsSn)

    if (!response) {
      alert('관리자에게 문의 부탁드립니다.')
    } else {
      // 파일세팅
      setExtFileList(response.fileList)
      // 댓글세팅
      setCommentList(response.commentList)
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
    }
  }

  // 저장 또는 수정시 데이터검증
  const validation = (): boolean => {
    if (!procData.leadCnCd) {
      alert(leadCnCdObj[boardType] + '을 선택해 주세요.')
    } else if (procData.popupNtcYn === 'Y' && !procData.popupBgngYmd) {
      alert('팝업시작일자를 입력해 주세요.')
    } else if (procData.popupNtcYn === 'Y' && !procData.popupEndYmd) {
      alert('팝업종료일자를 입력해 주세요.')
    } else if (
      procData.popupNtcYn === 'Y' &&
      procData.popupBgngYmd > procData.popupEndYmd
    ) {
      alert('팝업시작일자기 팝업종료일자보다 큽니다.')
    } else if (!procData.relateTaskSeCd) {
      alert('업무구분을 선택해 주세요.')
    } else if (!procData.ttl.trim()) {
      alert('제목을 입력해 주세요.')
    } else if (!procData.cn.trim()) {
      alert('내용을 입력해 주세요.')
    } else {
      return true
    }
    return false
  }

  // 수정, 저장
  const handleSave = async (): Promise<void> => {
    if (validation()) {
      if (
        confirm(
          openType === 'CREATE' ? '등록 하시겠습니까?' : '수정 하시겠습니까?',
        )
      ) {
        try {
          setLoadingBackdrop(true)

          const path = boardPathObj[boardType]
          const endpoint =
            openType === 'CREATE' ? '/createBoardDtl' : '/updateBoardDtl'
          const url = path + endpoint

          const method = openType === 'CREATE' ? 'POST' : 'PUT'

          const data: dwBoardDtl = {
            ...procData,
            bbsSn: bbsSn,
            bbscttSn: openType === 'CREATE' ? '' : bbscttSn,
            popupBgngYmd:
              procData.popupNtcYn === 'Y'
                ? procData.popupBgngYmd.replaceAll('-', '')
                : '',
            popupEndYmd:
              procData.popupNtcYn === 'Y'
                ? procData.popupEndYmd.replaceAll('-', '')
                : '',
          }

          // 추가되는 파일만 전달
          const response = await sendMultipartFormDataRequest(
            method,
            url,
            data,
            newFileList,
            true,
          )

          if (response.resultType === 'success') {
            const msg = openType === 'CREATE' ? '저장' : '수정'
            alert(msg + ' 되었습니다.')
            props.handleReload?.()
            handleClose()
          } else {
            alert(response.message)
          }
        } catch (error) {
          console.error('Error during update:', error)
          alert('관리자에게 문의 부탁드립니다.')
        } finally {
          setLoadingBackdrop(false)
        }
      }
    }
  }

  // 게시글 삭제
  const handleDelete = async (): Promise<void> => {
    if (confirm('삭제 하시겠습니까?')) {
      try {
        setLoadingBackdrop(true)

        const path = boardPathObj[boardType]
        const url = path + '/deleteBoardDtl'
        const deleteObj = { bbsSn: bbsSn, bbscttSn: bbscttSn }
        const response = await sendHttpRequest('DELETE', url, deleteObj, true, {
          cache: 'no-store',
        })

        if (response.resultType === 'success') {
          alert('삭제 되었습니다.')
          props.handleReload?.()
          handleClose()
        } else {
          alert(response.message)
        }
      } catch (error) {
        console.error('Error during update:', error)
        alert('관리자에게 문의 부탁드립니다.')
      } finally {
        setLoadingBackdrop(false)
      }
    }
  }

  // 모달 종료
  const handleClose = (): void => {
    dispatch(handleIlpBoardClose())
  }

  const handleSearchChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ): void => {
    const { name, value } = event.target
    setProcData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <Dialog
      fullWidth={true}
      maxWidth={'lg'}
      open={ilpBoardOpen}
      onClose={handleClose}
    >
      <DialogContent>
        <Box className="table-bottom-button-group">
          <CustomFormLabel className="input-label-display">
            <h2>
              {modalTitleObj[boardType]}{' '}
              {openType === 'VIEW'
                ? ''
                : openType === 'CREATE'
                  ? '등록'
                  : '수정'}
            </h2>
          </CustomFormLabel>
          <div className="button-right-align">
            {/* 메인화면에서 공지사항 열람시 수정기능 차단 */}
            {!props.isMain ? (
              <>
                {/* 게시물 열람시 관리자권한 / 국토부권한 / 작성자 수정가능 */}
                {openType === 'VIEW' &&
                (enableUpdate || noneProcData.rgtrId === userInfo.lgnId) ? (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => dispatch(changeUpdateType())}
                  >
                    수정
                  </Button>
                ) : null}
              </>
            ) : null}

            {/* 수정 또는 등록화면 일경우 */}
            {openType !== 'VIEW' ? (
              <Button variant="contained" color="primary" onClick={handleSave}>
                저장
              </Button>
            ) : null}

            {/* 수정화면 일경우 */}
            {openType === 'UPDATE' && enableUpdate ? (
              <Button variant="contained" color="error" onClick={handleDelete}>
                삭제
              </Button>
            ) : null}

            <Button variant="contained" color="dark" onClick={handleClose}>
              닫기
            </Button>
          </div>
        </Box>
        <Box>
          <BoardContainer>
            <TableRow>
              {/* 구분 */}
              <LeftCell
                isRequire={openType !== 'VIEW'}
                title={leadCnCdObj[boardType].leadCnNm}
              />
              <RightCell>
                {openType !== 'VIEW' ? (
                  <CommSelect
                    cdGroupNm={leadCnCdObj[boardType].cdGroupNm}
                    pValue={procData.leadCnCd}
                    handleChange={handleSearchChange}
                    pName="leadCnCd"
                    defaultValue={
                      openType === 'UPDATE' ? procData.leadCnCd : undefined
                    }
                  />
                ) : (
                  noneProcData.leadCnNm
                )}
              </RightCell>

              {/* 업무구분 */}
              <LeftCell isRequire={openType !== 'VIEW'} title="업무구분" />
              <RightCell>
                {openType !== 'VIEW' ? (
                  <CommSelect
                    cdGroupNm="ILP117"
                    pValue={procData.relateTaskSeCd}
                    handleChange={handleSearchChange}
                    pName="relateTaskSeCd"
                    defaultValue={
                      openType === 'UPDATE'
                        ? procData.relateTaskSeCd
                        : undefined
                    }
                  />
                ) : (
                  noneProcData.relateTaskSeNm
                )}
              </RightCell>
            </TableRow>

            {/* 지자체정보 */}
            {enableLocgovObj[boardType] && openType !== 'CREATE' ? (
              <TableRow>
                {/* 지자체 */}
                <LeftCell isRequire={false} title="지자체" />
                <RightCell>{noneProcData.locgovNm}</RightCell>
                {/* 요청자 */}
                <LeftCell isRequire={false} title="요청자" />
                <RightCell>{noneProcData.rgtrId}</RightCell>
              </TableRow>
            ) : null}

            {/* 팝업여부 */}
            {enablePopupObj[boardType] && openType !== 'VIEW' ? (
              <TableRow>
                <LeftCell isRequire={true} title="팝업여부" />
                <RightCell colSpan={3}>
                  <Box display="flex" alignItems="center">
                    <RadioGroup
                      row
                      name="popupNtcYn"
                      value={procData.popupNtcYn}
                      onChange={handleSearchChange}
                      className="mui-custom-radio-group"
                      style={{ marginRight: '16px' }}
                    >
                      <FormControlLabel
                        control={
                          <CustomRadio id="chk_Y" name="popupNtcYn" value="Y" />
                        }
                        label="사용"
                      />
                      <FormControlLabel
                        control={
                          <CustomRadio id="chk_N" name="popupNtcYn" value="N" />
                        }
                        label="미사용"
                      />
                    </RadioGroup>
                    {/* 팝업 기간 */}
                    {procData.popupNtcYn === 'Y' && (
                      <Box display="flex" alignItems="center">
                        <CustomTextField
                          type="date"
                          id="ft-date-start"
                          name="popupBgngYmd"
                          value={procData.popupBgngYmd}
                          onChange={handleSearchChange}
                          style={{ marginRight: '8px' }}
                        />
                        ~
                        <CustomTextField
                          type="date"
                          id="ft-date-end"
                          name="popupEndYmd"
                          value={procData.popupEndYmd}
                          onChange={handleSearchChange}
                          style={{ marginLeft: '8px' }}
                        />
                      </Box>
                    )}
                  </Box>
                </RightCell>
              </TableRow>
            ) : null}

            {/* 제목 */}
            <TableRow>
              <LeftCell isRequire={openType !== 'VIEW'} title="제목" />
              <RightCell colSpan={3}>
                {openType !== 'VIEW' ? (
                  <CustomTextField
                    fullWidth
                    name="ttl"
                    value={procData.ttl}
                    onChange={handleSearchChange}
                  />
                ) : (
                  noneProcData.originTtl
                )}
              </RightCell>
            </TableRow>

            {/* 내용 */}
            <TableRow>
              <LeftCell isRequire={openType !== 'VIEW'} title="내용" />
              <RightCell colSpan={3}>
                {openType !== 'VIEW' ? (
                  <textarea
                    className="MuiTextArea-custom"
                    name="cn"
                    onChange={handleSearchChange}
                    value={procData.cn}
                    rows={20}
                  />
                ) : (
                  <CustomTextArea>{procData.cn}</CustomTextArea>
                )}
              </RightCell>
            </TableRow>

            {/* 파일 사용시 */}
            {enableFileObj[boardType] && (
              <TableRow>
                <FilesMngCompo
                  extFileList={extFileList}
                  setExtFileList={setExtFileList}
                  newFileList={newFileList}
                  setNewFileList={setNewFileList}
                />
              </TableRow>
            )}
          </BoardContainer>

          {/* 메인화면에서 공지사항 열람시 댓글기능 차단 */}
          {!props.isMain ? (
            <>
              {/* 댓글 사용시 */}
              {enableCommentObj[boardType] && openType === 'VIEW' ? (
                <CommentsMngCompo
                  commentList={commentList}
                  enableUpdate={enableUpdate}
                  reloadFunc={init}
                />
              ) : null}
            </>
          ) : null}
        </Box>

        {/* 로딩 */}
        {loadingBackdrop && <LoadingBackdrop open={loadingBackdrop} />}
      </DialogContent>
    </Dialog>
  )
}

export default BoardModal

/* react */
import React, { useState, memo } from 'react'

/* 공통 component */
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

/* mui component */
import { Box, Button, Table, TableBody, TableContainer, TableRow, TableCell } from '@mui/material'

/* 게시판 타입 */
import { dwBoardReply } from './type'

/* 게시판 정보 */
import { boardPathObj } from './boardInfo'

/* 공통 js */
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { getUserInfo } from '@/utils/fsms/utils'
import { getDateFormatYMD } from '@/utils/fsms/common/dateUtils'

/* redux-toolkit */
import { useSelector } from '@/store/hooks'

type propsType = {
  commentList: dwBoardReply[]
  enableUpdate: boolean
  reloadFunc: () => Promise<void>
}

const CommentsMngCompo = (props: propsType) => {

  const { commentList, enableUpdate, reloadFunc } = props

  // 유저 권한
  const userInfo = getUserInfo()

  // redux-toolkit
  const { boardType, bbscttSn } = useSelector(state => state.IlpBoard)

  // 로딩
  const [loadingBackdrop, setLoadingBackdrop] = useState<boolean>(false)

  // 댓글
  const [cn, setCn] = useState<string>('')

  // 댓글등록
  const handleCommSave = async () => {

    try {

      setLoadingBackdrop(true)

      const path = boardPathObj[boardType]
      const url = path + '/createBoardCmnt'
      const body = { bbscttSn: bbscttSn, cn: cn }
      const response = await sendHttpRequest('POST', url, body, true, { cache: 'no-store' })

      if (response.resultType === 'success') {
        // 게시판 상세데이터 재조회
        reloadFunc()
        setCn('')
      } else {
        alert(response.message)
      }
    } catch (error) {
      console.error('Error during update:', error)
    } finally {
      setLoadingBackdrop(false)
    }
  }

  // 댓글삭제
  const handleCommDelete = async (comments: dwBoardReply): Promise<void> => {

    if (confirm('삭제하시겠습니까?')) {

      try {

        setLoadingBackdrop(true)

        const path = boardPathObj[boardType]
        const url = path + '/deleteBoardCmnt'
        const deleteObj = { cmntSn: comments.cmntSn, bbscttSn: comments.bbscttSn }
        const response = await sendHttpRequest('DELETE', url, deleteObj, true, { cache: 'no-store' })

        if (response && response.resultType === 'success') {
          // 게시판 상세데이터 재조회
          reloadFunc()
        } else {
          alert(response.message)
        }
      } catch (error) {
        // 에러시
        console.error('Error fetching data:', error)
      } finally {
        setLoadingBackdrop(false)
      }
    }
  }

  // 댓글변경
  const handleParamChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = event.target
    setCn(value)
  }

  return (
    <>
      <div className="modal_section" style={{ marginTop: '30px' }}>
        <div className="arrow_title flex_align_center">
          <h3>댓글</h3>
          <div className="r">
            <div className="list_total">
              <strong>{commentList.length}</strong>개의 댓글
            </div>
          </div>
        </div>
        <div className="reply_list">
          {commentList.map(item => (
            <div className="item">
              <div className="cnt">
                <div className="info">
                  <span className="name">
                    <strong>{item.userNm}</strong>
                  </span>
                  <span className="date">
                    {getDateFormatYMD(item.regDt)}
                  </span>
                </div>
                <div className="text" style={{ whiteSpace: 'pre-wrap' }}>
                  {item.cmntCn}
                </div>
              </div>
              <div className="btns">
                {/* 관리자권한 / 국토부권한 / 작성자 댓글삭제가능 */}
                {enableUpdate || item.rgtrId === userInfo.lgnId ? (
                  <button
                    type="button"
                    className="btn_tb2"
                    onClick={() => handleCommDelete(item)}
                  >
                    삭제
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
        <TableContainer style={{ margin: '16px 0 0 0' }}>
          <Table
            className="table table-bordered"
            aria-labelledby="tableTitle"
            style={{ tableLayout: 'fixed', width: '100%' }}
          >
            <TableBody>
              <TableRow>
                <TableCell
                  className="td-head"
                  style={{ width: '150px', verticalAlign: 'middle' }}
                >
                  댓글내용
                </TableCell>
                <TableCell style={{ textAlign: 'left' }}>
                  <textarea
                    className="MuiTextArea-custom"
                    id="modal-cn"
                    name="cn"
                    onChange={handleParamChange}
                    value={cn}
                    rows={5}
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        <Box className="table-bottom-button-group" style={{ padding: '10px 0', marginTop: '0' }}>
          <div className="button-right-align">
            <Button onClick={handleCommSave}>댓글등록</Button>
          </div>
        </Box>
      </div>

      {/* 로딩 */}
      {loadingBackdrop && (
        <LoadingBackdrop open={loadingBackdrop} />
      )}
    </>
  )
}

export default memo(CommentsMngCompo)

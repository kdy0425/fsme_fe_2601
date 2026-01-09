import React, { useState } from 'react'
import { Button, Grid } from '@mui/material'
import { Row } from '../page'
import { getDateFormatYMD } from '@/utils/fsms/common/dateUtils'
import { formatPhoneNumber } from '@/utils/fsms/common/convert'
import { rrNoFormatter } from '@/utils/fsms/common/util'
import { sendHttpFileRequest } from '@/utils/fsms/common/apiUtils'
import ShowRrnoModal from '@/app/components/popup/ShowRrnoModal'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import { toQueryParameter } from '@/utils/fsms/utils'
interface DetailProps {
  data: Row
}

const BsDetailGrid: React.FC<DetailProps> = ({ data }) => {
  
  // 주민번호보기 모달
  const [rrnoModalOpen, setRrnoModalOpen] = useState<boolean>(false);
  const [isDataProcessing, setIsDataProcessing] = useState<boolean>(false)

  const fetchFilesDown = async (row: any) => {
    if (row == undefined) {
      return
    }
    try {
      let endpoint: string =
        `/fsm/stn/dm/tr/getDrverFileDownload?` +
        `physFileNm=${row.physFileNm}` +
        `&lgcFileNm=${row.lgcFileNm}`

      const response = await sendHttpFileRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      const url = window.URL.createObjectURL(new Blob([response]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', row.lgcFileNm as string)
      document.body.appendChild(link)
      link.click()
    } catch (error) {
      // 에러시
      console.error('Error fetching data:', error)
    } finally {
    }
  }

  return (
    <Grid container spacing={2} className="card-container">
      <Grid item xs={12} sm={12} md={12}>
        <>
          {/* 테이블영역 시작 */}
          <div className="table-scrollable">
            <table className="table table-bordered">
              <caption>상세 내용 시작</caption>
              <colgroup>
                <col style={{ width: '12%' }} />
                <col style={{ width: '13%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '13%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '13%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '13%' }} />
              </colgroup>
              <tbody>
                <tr>
                  <th
                    className="td-head"
                    style={{ textAlign: 'center' }}
                    scope="row"
                  >
                    차량번호
                  </th>
                  <td style={{ textAlign: 'center' }}>{data.vhclNo}</td>
                  <th
                    className="td-head"
                    style={{ textAlign: 'center' }}
                    scope="row"
                  >
                    운전자명
                  </th>
                  <td style={{ textAlign: 'center' }}>{data.flnm}</td>
                  <th
                    className="td-head"
                    style={{ textAlign: 'center' }}
                    scope="row"
                  >
                    운전자 주민등록번호
                  </th>
                  <td style={{ textAlign: 'center', cursor: 'pointer' }}>
                    <Button
                      variant="outlined"
                      style={{ marginLeft: '6px' }}
                      onClick={() => setRrnoModalOpen(true)}
                    >
                      {rrNoFormatter(data.rrnoSecure)}
                    </Button>
                  </td>
                  <th
                    className="td-head"
                    style={{ textAlign: 'center' }}
                    scope="row"
                  >
                    연락처
                  </th>
                  <td style={{ textAlign: 'center' }}>
                    {formatPhoneNumber(data.telno)}
                  </td>
                </tr>

                <tr>
                  <th
                    className="td-head"
                    style={{ textAlign: 'center' }}
                    scope="row"
                  >
                    계약시작일
                  </th>
                  <td style={{ textAlign: 'center' }}>
                    {getDateFormatYMD(data.ctrtBgngYmd)}
                  </td>
                  <th
                    className="td-head"
                    style={{ textAlign: 'center' }}
                    scope="row"
                  >
                    계약종료일
                  </th>
                  <td style={{ textAlign: 'center' }}>
                    {getDateFormatYMD(data.ctrtEndYmd)}
                  </td>
                  <th
                    className="td-head"
                    style={{ textAlign: 'center' }}
                    scope="row"
                  ></th>
                  <td style={{ textAlign: 'center' }}>{}</td>
                  <th
                    className="td-head"
                    style={{ textAlign: 'center' }}
                    scope="row"
                  ></th>
                  <td style={{ textAlign: 'center' }}>{}</td>
                </tr>

                <tr>
                  <th className="td-head" scope="row">
                    첨부파일
                  </th>
                  <td
                    style={{ textAlign: 'left', paddingLeft: '15px' }}
                    colSpan={7}
                  >
                    {data.fileList.length > 0 ? (
                      data.fileList.map((row: any, index) => {
                        return (
                          <tr
                            style={{ marginBottom: '5px', cursor: 'pointer' }}
                            onClick={() => fetchFilesDown(row)}
                          >
                            {row.lgcFileNm}
                          </tr>
                        )
                      })
                    ) : (
                      <td></td>
                    )}
                  </td>
                </tr>

                <tr>
                  <th
                    className="td-head"
                    style={{ textAlign: 'center' }}
                    scope="row"
                  >
                    등록자아이디
                  </th>
                  <td style={{ textAlign: 'center' }}>{data.rgtrId}</td>
                  <th
                    className="td-head"
                    style={{ textAlign: 'center' }}
                    scope="row"
                  >
                    등록일자
                  </th>
                  <td style={{ textAlign: 'center' }}>
                    {getDateFormatYMD(data.regDt)}
                  </td>
                  <th
                    className="td-head"
                    style={{ textAlign: 'center' }}
                    scope="row"
                  >
                    수정자아이디
                  </th>
                  <td style={{ textAlign: 'center' }}>{data.mdfrId}</td>
                  <th
                    className="td-head"
                    style={{ textAlign: 'center' }}
                    scope="row"
                  >
                    수정일자
                  </th>
                  <td style={{ textAlign: 'center' }}>
                    {getDateFormatYMD(data.mdfcnDt)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          {/* 테이블영역 끝 */}
        </>
      </Grid>
      {/* 주민번호보기 모달 */}
      {rrnoModalOpen ? (
        <ShowRrnoModal
          open={rrnoModalOpen}
          setOpen={setRrnoModalOpen}
          procData={{
            rrno: data.rrnoS,
            paramtrInfoCn: toQueryParameter({ vhclNo:data.vhclNo }).replace('?',''),
            defaultValue: '6'
          }}
        />
      ) : null}
      <LoadingBackdrop open={isDataProcessing} />
    </Grid>
  )
}

export default BsDetailGrid

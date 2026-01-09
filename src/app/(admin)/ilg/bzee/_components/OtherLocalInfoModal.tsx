/* mui component */
import { Box, Button, Dialog, DialogContent, DialogTitle } from '@mui/material'
import { CustomFormLabel, CustomTextField } from '@/utils/fsms/fsm/mui-imports'

/* interface 선언 */
interface propsInterface {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const OtherLocalInfoModal = (props: propsInterface) => {
  
  const { open, setOpen } = props

  return (
    <Box>
      <Dialog fullWidth={true} maxWidth={'sm'} open={open}>
        <DialogContent>
          <Box className='table-bottom-button-group'>
            <CustomFormLabel className='input-label-display'>
              <h2>사업구역외 충전 제외 인접지역</h2>
            </CustomFormLabel>
            <div className=' button-right-align'>
              <Button
                variant='contained'
                color='dark'
                onClick={() => setOpen(false)}
              >
                닫기
              </Button>
            </div>
          </Box>

          <div id='alert-dialog-description1'>
            <div className='table-scrollable'>
              <table className='table table-bordered'>
                <caption>카드발급요청 탈락처리</caption>
                <colgroup>
                  <col style={{ width: '15%' }}></col>
                  <col style={{ width: '85%' }}></col>
                </colgroup>
                <tbody>                  
                  <tr>
                    <th className='td-head' scope='row'>서울</th>
                    <td>경기, 인천</td>
                  </tr>
                  <tr>
                    <th className='td-head' scope='row'>경기</th>
                    <td>서울, 인천, 강원, 충북, 충남</td>
                  </tr>
                  <tr>
                    <th className='td-head' scope='row'>인천</th>
                    <td>서울, 경기</td>
                  </tr>
                  <tr>
                    <th className='td-head' scope='row'>강원</th>
                    <td>경기, 충북, 경북, 울산, 부산</td>
                  </tr>
                  <tr>
                    <th className='td-head' scope='row'>충북</th>
                    <td>충남, 경북, 경남, 강원, 경기, 전북, 대전, 세종, 울산, 대구</td>
                  </tr>
                  <tr>
                    <th className='td-head' scope='row'>충남</th>
                    <td>충북, 전북, 경기, 대전, 세종, 울산</td>
                  </tr>
                  <tr>
                    <th className='td-head' scope='row'>전북</th>
                    <td>전남, 경남, 경북, 충북, 충남, 광주</td>
                  </tr>
                  <tr>
                    <th className='td-head' scope='row'>전남</th>
                    <td>전북, 경남, 광주</td>
                  </tr>
                  <tr>
                    <th className='td-head' scope='row'>경북</th>
                    <td>경남, 강원, 충북, 충남, 전북, 울산, 부산, 대구</td>
                  </tr>
                  <tr>
                    <th className='td-head' scope='row'>경남</th>
                    <td>경북, 충북,충남, 전북, 전남, 광주, 울산, 부산, 대구</td>
                  </tr>
                  <tr>
                    <th className='td-head' scope='row'>광주</th>
                    <td>전남, 전북, 경남</td>
                  </tr>
                  <tr>
                    <th className='td-head' scope='row'>세종</th>
                    <td>대전, 충북, 충남, 전북, 경북</td>
                  </tr>
                  <tr>
                    <th className='td-head' scope='row'>대전</th>
                    <td>세종, 충북, 충남, 전북, 경북</td>
                  </tr>
                  <tr>
                    <th className='td-head' scope='row'>대구</th>
                    <td>울산, 부산, 경남, 경북</td>
                  </tr>
                  <tr>
                    <th className='td-head' scope='row'>울산</th>
                    <td>대구, 부산, 경남, 경북</td>
                  </tr>
                  <tr>
                    <th className='td-head' scope='row'>부산</th>
                    <td>울산, 대구, 경남, 경북</td>
                  </tr>
                  <tr>
                    <th className='td-head' scope='row'>제주</th>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default OtherLocalInfoModal

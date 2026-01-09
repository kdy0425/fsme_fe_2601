import { CustomFormLabel, CustomRadio, CustomSelect, CustomTextField } from '@/utils/fsms/fsm/mui-imports'
import {
  Box,
  Button,
  Dialog, DialogContent, DialogTitle, FormControlLabel,
  MenuItem, RadioGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import React, {useState, useEffect, useCallback} from 'react';
import { HeadCell } from 'table';
import { listSearchObj, Row } from '../page'
import { formBrno } from '@/utils/fsms/common/convert'
import { CommSelect } from '@/components/tx/commSelect/CommSelect'
interface ModalFormProps {
  open: boolean
  data?: Row
  onCloseClick?: () => void;
  title?: string
  reloadFunc?: () => void;
}

/**
 * 탈락 모달창
 * @param props
 * @constructor
 */
const TrLocgovApvDeny: React.FC<SearchConditionProps> = (props: ModalFormProps) => {
  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const {open, onCloseClick, title, reloadFunc,data } = props;

  // 목록 조회를 위한 객체 (초기값 설정)
  const [params, setParams] = useState<Row>({
    crdcoCd: data?.crdcoCd || '',
    rcptYmd: data?.rcptYmd || '',
    rcptSeqNo: data?.rcptSeqNo || '',
    aplySn: data?.aplySn || '',
    locgovAprvYn: data?.locgovAprvYn || '',
    flRsnCn: data?.flRsnCn || '',
    flRsnCd: data?.flRsnCd || '',
  });

  // data 변경 시 params 업데이트
  useEffect(() => {
    setParams({
      crdcoCd: data?.crdcoCd || '',
      rcptYmd: data?.rcptYmd || '',
      rcptSeqNo: data?.rcptSeqNo || '',
      aplySn: data?.aplySn || '',
      locgovAprvYn: data?.locgovAprvYn || '',
      flRsnCn: data?.flRsnCn || '',
      flRsnCd: data?.flRsnCd || '',
    });
  }, [data]);

  // 조회조건 변경시
  const handleParamChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = event.target;
      setParams((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  return(
    <Box>
      <Dialog
        fullWidth={false}
        maxWidth={'md'}
        open={open}
        onClose={onCloseClick}
        PaperProps={{
          style: {
            width: '700px',
          },
        }}
      >
        <DialogTitle id="alert-dialog-title1">
          <Box className='table-bottom-button-group'>
            <DialogTitle id="alert-dialog-title1">
              <CustomFormLabel className="input-label-display">
                <h2>탈락처리</h2>
              </CustomFormLabel>
            </DialogTitle>
            <div className=" button-right-align">
              <Button variant="contained" color="primary" onClick={() => modifiyTrBuInfo()}>저장</Button>
              <Button variant="contained" color="dark" onClick={(onCloseClick)}>취소</Button>
            </div>
          </Box>
        </DialogTitle>


        <DialogContent>
          {/* 모달팝업 내용 시작 */}
          <div id="alert-dialog-description1">
            {/* 테이블영역 시작 */}
            <div className="table-scrollable">

              <table className="table table-bordered">
                <caption>카드발급요청 탈락처리
                </caption>
                <colgroup>
                  <col style={{ width: '25%' }} />
                  <col style={{ width: '75%' }} />
                </colgroup>
                <tbody>
                <tr>
                  <td className='td-head' scope="row">
                    탈락유형
                  </td>
                  <td>
                    <div className="form-group" style={{ width: '100%' }}>
                      <CommSelect
                        cdGroupNm="088"
                        pValue={params.flRsnCd}
                        handleChange={handleParamChange}
                        pName="flRsnCd"
                        htmlFor={'sch-cardSe'}
                        addText="전체"
                      />
                    </div>
                  </td>
                </tr>
                <tr>
                  <th className="td-head" scope="row">
                    탈락사유
                  </th>
                  <td>
                    <div className="form-group" style={{ width: '100%' }}>
                      <CustomTextField
                        type="text"
                        id="modal-bzentyNm"
                        name="bzentyNm"
                        value={params?.flRsnCn}
                        onChange={handleParamChange}
                        fullWidth
                      />
                    </div>
                  </td>
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

const TrLocgovApvAcc: React.FC<SearchConditionProps> = (props: ModalFormProps) => {
  const {open, onCloseClick, title, reloadFunc,data } = props;
  const sendData = async () => {
    let endpoint: string = `/fsm/apv/npom/tr/createNewPosOltMng`
    const userConfirm = confirm('입력하신 내용으로 신규 주유소 등록을 진행하시겠습니까?')
    console.log(userConfirm);
  }


  return(
    <Box>
      <Dialog
        fullWidth={false}
        maxWidth={'md'}
        open={open}
        onClose={onCloseClick}
        PaperProps={{
          style: {
            width: '200px',
          },
        }}
      >
        <DialogTitle id="alert-dialog-title1">
          <Box className='table-bottom-button-group'>
            <DialogTitle id="alert-dialog-title1">
              <CustomFormLabel className="input-label-display">
                <h2>탈락처리</h2>
              </CustomFormLabel>
            </DialogTitle>
            <div className=" button-right-align">
              <Button variant="contained" color="primary" onClick={() => sendData()}>확인</Button>
              <Button variant="contained" color="dark" onClick={(onCloseClick)}>취소</Button>
            </div>
          </Box>
        </DialogTitle>


        <DialogContent>
          {/* 모달팝업 내용 시작 */}
          <div id="alert-dialog-description1">
            {/* 테이블영역 시작 */}
            <div className="table-scrollable">
              해당카드를 승인하시겠습니까?
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Box>
  )
}

//리턴
const TrModalContent = {
  TrLocgovApvDeny,
  TrLocgovApvAcc,
};

export default TrModalContent;
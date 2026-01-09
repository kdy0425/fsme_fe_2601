import { Button, FormControlLabel, RadioGroup } from '@mui/material'
import { styled } from '@mui/material/styles'

import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import { CustomRadio } from '@/utils/fsms/fsm/mui-imports'
import React from 'react'
import { useDispatch, useSelector } from '@/store/hooks'
import { AppState } from '@/store/store'
import { openDecisionBypeModal } from '@/store/popup/DecisionBypeSlice'

const CustomIlgButton = styled((props: any) => (
  <Button variant="outlined" color="primary" {...props}>
    {props.title}
  </Button>
))(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
}))

/** 의심거래내역 화면 버튼 묶음 */
type doubtDelngButtonGroupProps = {
  handleBypeExamTrgetEach?: () => void // 건별 조사대상 확정
  dwNo: string
}

export const DoubtDelngButtonGroup: React.FC<doubtDelngButtonGroupProps> = ({
  handleBypeExamTrgetEach,
  dwNo,
}) => {
  const dispatch = useDispatch()
  const decisionBypeInfo = useSelector(
    (state: AppState) => state.decisionBypeInfo,
  )

  return (
    <>
      <CustomIlgButton
        title={'기간별 조사대상 확정'}
        style={{ marginLeft: '30px' }}
        onClick={() => {
          dispatch(openDecisionBypeModal())
        }}
      />
      {dwNo != '01' && dwNo != '08' ? (
        <CustomIlgButton
          title={'건별 조사대상 확정'}
          style={{ marginLeft: '10px' }}
          onClick={handleBypeExamTrgetEach}
        />
      ) : null}
    </>
  )
}

/** 조사대상내역 화면 버튼 묶음 */
type examTrgetButtonGroupProps = {
  handleCreateExamResult: () => void // 조사결과 등록
  handleCreateLgovTr: () => void // 지자체이첩 등록
  handleCancelExamTrget: () => void // 의심거래내역 이동
}

export const ExamTrgetButtonGroup: React.FC<examTrgetButtonGroupProps> = ({
  handleCreateExamResult,
  handleCreateLgovTr,
  handleCancelExamTrget,
}) => {
  return (
    <>
      <CustomIlgButton
        title={'조사결과 등록'}
        style={{ marginLeft: '30px' }}
        onClick={handleCreateExamResult}
      />
      <CustomIlgButton
        title={'지자체이첩 등록'}
        style={{ marginLeft: '10px' }}
        onClick={handleCreateLgovTr}
      />
      <CustomIlgButton
        title={'의심거래내역 이동'}
        style={{ marginLeft: '10px' }}
        onClick={handleCancelExamTrget}
      />
    </>
  )
}

/** 조사결과내역 화면 버튼 묶음 */
type exmnResultButtonGroupProps = {
  handleCreateExaathr: () => void //행정처분등록
  handleCancelExamResult: () => void //조사결과등록 취소
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export const ExamResultButtonGroup: React.FC<exmnResultButtonGroupProps> = ({
  handleCreateExaathr,
  handleCancelExamResult,
  handleChange,
}) => {
  return (
    <>
      <AdmdspRadioGroup handleChange={handleChange} />
      <CustomIlgButton
        title={'행정처분 등록'}
        style={{ marginLeft: '30px' }}
        onClick={handleCreateExaathr}
      />
      <CustomIlgButton
        title={'조사결과등록 취소'}
        style={{ marginLeft: '10px' }}
        onClick={handleCancelExamResult}
      />
    </>
  )
}

/** 행정처분내역 화면 버튼 묶음 */
type exaathrButtonGroupProps = {
  handleCancelExaathr: () => void //행정처분등록 취소
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export const ExaathrButtonGroup: React.FC<exaathrButtonGroupProps> = ({
  handleCancelExaathr,
  handleChange,
}) => {
  return (
    <>
      <AdmdspRadioGroup handleChange={handleChange} />
      <CustomIlgButton
        title={'행정처분등록 취소'}
        style={{ marginLeft: '30px' }}
        onClick={handleCancelExaathr}
      />
    </>
  )
}

/** 지자체이첩승인 화면 버튼 묶음 */
type lgovTrfCfmButtonGroupProps = {
  handleLgovTrfConfirm: () => void //승인
  handleLgovTrfDeny: () => void //반려
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export const LgovTrfCfmButtonGroup: React.FC<lgovTrfCfmButtonGroupProps> = ({
  handleLgovTrfConfirm,
  handleLgovTrfDeny,
  handleChange,
}) => {
  return (
    <>
      <LgovTrfntfRadioGroup handleChange={handleChange} />
      <CustomIlgButton
        title={'승인'}
        style={{ marginLeft: '30px' }}
        onClick={handleLgovTrfConfirm}
      />
      <CustomIlgButton
        title={'반려'}
        style={{ marginLeft: '10px' }}
        onClick={handleLgovTrfDeny}
      />
    </>
  )
}

/** 지자체이첩요청 화면 버튼 묶음 */
type lgovTrfntfReqButtonGroupProps = {
  handleLgovTrfCancel: () => void //취소
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export const LgovTrfntfReqButtonGroup: React.FC<
  lgovTrfntfReqButtonGroupProps
> = ({ handleLgovTrfCancel, handleChange }) => {
  return (
    <>
      <LgovTrfntfRadioGroup includeCancel={true} handleChange={handleChange} />
      <CustomIlgButton
        title={'취소'}
        style={{ marginLeft: '30px' }}
        onClick={handleLgovTrfCancel}
      />
    </>
  )
}

type AdmdspRadioGroupProps = {
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}

const AdmdspRadioGroup: React.FC<AdmdspRadioGroupProps> = ({
  handleChange,
}) => {
  return (
    <div className="form-group" style={{ marginLeft: '30px' }}>
      <CustomFormLabel htmlFor="ft-fname-radio-02" className="input-label-none">
        등록구분
      </CustomFormLabel>
      <RadioGroup
        row
        id="status"
        name="status"
        className="mui-custom-radio-group"
        onChange={handleChange}
        defaultValue={''}
      >
        <FormControlLabel
          control={<CustomRadio id="rdo2_1" name="pbadmsPrcsYn" value="" />}
          label="전체"
        />
        <FormControlLabel
          control={<CustomRadio id="rdo2_2" name="pbadmsPrcsYn" value="N" />}
          label="등록대기"
        />
        <FormControlLabel
          control={<CustomRadio id="rdo2_3" name="pbadmsPrcsYn" value="Y" />}
          label="등록완료"
        />
      </RadioGroup>
    </div>
  )
}

type LgovTrfntfRadioGroupProps = {
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  includeCancel?: boolean
}

const LgovTrfntfRadioGroup: React.FC<LgovTrfntfRadioGroupProps> = ({
  handleChange,
  includeCancel,
}) => {
  return (
    <div className="form-group" style={{ marginLeft: '30px' }}>
      <CustomFormLabel htmlFor="ft-fname-radio-03" className="input-label-none">
        요청상태
      </CustomFormLabel>
      <RadioGroup
        row
        id="sttsCd"
        name="sttsCd"
        className="mui-custom-radio-group"
        onChange={handleChange}
        defaultValue={''}
      >
        <FormControlLabel
          control={<CustomRadio id="rdo3_1" name="sttsCd" value="" />}
          label="전체"
        />
        <FormControlLabel
          control={<CustomRadio id="rdo3_2" name="sttsCd" value="A" />}
          label="승인"
        />
        {includeCancel ? (
          <FormControlLabel
            control={<CustomRadio id="rdo3_2" name="sttsCd" value="C" />}
            label="취소"
          />
        ) : null}
        <FormControlLabel
          control={<CustomRadio id="rdo3_3" name="sttsCd" value="D" />}
          label="반려"
        />
        <FormControlLabel
          control={<CustomRadio id="rdo3_4" name="sttsCd" value="R" />}
          label="요청중"
        />
      </RadioGroup>
    </div>
  )
}

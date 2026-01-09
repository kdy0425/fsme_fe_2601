import React, { useState, useEffect, useRef } from 'react'
import { styled } from '@mui/material/styles'
import { TextField } from '@mui/material'
import MonthDatePickerField from '../../shared/MonthDatePickerField'
import CustomFormLabel from './CustomFormLabel';

function browserCheck() {
  const user = window.navigator.userAgent.toLowerCase();

  let browser = user.indexOf("edge") > -1 ? "edge" //MS 엣지
          : user.indexOf("edg/") > -1 ? "edge(chromium based)" //크롬기반 엣지
          : user.indexOf("opr") > -1 ? "opera" //오페라
          : user.indexOf("chrome") > -1 ? "chrome"	//크롬
          : user.indexOf("trident") > -1 ? "ie"	//익스플로러
          : user.indexOf("firefox") > -1 ? "firefox"	//파이어폭스
          : user.indexOf("safari") > -1 ? "safari"	//사파리
          : user.indexOf("whale") > -1 ? "whale"	//네이버웨일
          : "other browser"; // 기타
  
  return browser
}

const CustomTextField = styled((props: any) => {

   // type이 date일 때만 조건을 적용
  const isDateType = props.type === "date";
  const isMonthType = props.type === "month";
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isDateType && inputRef.current) {
      inputRef.current.setAttribute("min", "0001-01-01");
      inputRef.current.setAttribute("max", "9999-12-31");
    }
  }, [isDateType]);

  useEffect(() => {
    if (isMonthType && inputRef.current) {
      inputRef.current.setAttribute("min", "0001-01");
      inputRef.current.setAttribute("max", "9999-12");
    }
  }, [isMonthType]);

  // Firefox와 safari 브라우저는 input type month를 지원하지 않기 때문에 CustomDatePicker로 대체
  if (
    props.type === 'month' && (browserCheck() === 'firefox' || browserCheck() === 'safari')
  ) {
    return (
      <MonthDatePickerField
        type={props?.type}
        dateValue={props?.value}
        onChange={props?.onChange}
        id={props?.id}
        name={props?.name}
        fullWidth={props.fullWidth}
        inputProps={props?.inputProps}
      />
    )
  } else {
    return (
    <div>
    <CustomFormLabel className="input-label-none" htmlFor={props?.id}>{props?.name}</CustomFormLabel>
    <TextField 
      {...props}
      inputRef={inputRef}
      onChange={(e) => {
        
        let inputValue = e.target.value;

        if (isDateType || isMonthType) {
          const parts = inputValue.split("-");

          if (parts[0] && parts[0].length > 4) {
            parts[0] = parts[0].slice(0, 4);
          }
          inputValue = parts.join("-");
        }

        e = {target:{value:inputValue, name:e.target.name}} as React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>

        props.onChange?.(e);
      }}
    />
    </div>)
  }
})(({ theme }) => ({
  '& .MuiOutlinedInput-input::-webkit-input-placeholder': {
    color: theme.palette.text.secondary,
    opacity: '0.8',
  },
  '& .MuiOutlinedInput-input.Mui-disabled::-webkit-input-placeholder': {
    color: theme.palette.text.secondary,
    opacity: '1',
  },
  '& .Mui-disabled .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.grey[200],
  },
}))

export default CustomTextField

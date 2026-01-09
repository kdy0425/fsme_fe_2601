import React, { useEffect } from "react";
import { TextField } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ko } from "date-fns/locale"; // 한글 지역화 추가
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';


type InputProps = {
    max?: string;
    min?: string;
};

type Props = {
    dateValue: string; // 기본 값: YYYY-MM 형식
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    type: string;
    id: string;
    name: string;
    fullWidth: boolean;
    inputProps?: InputProps; 
};

const MonthDatePickerField = ({dateValue, onChange, type, id, name, inputProps}: Props) => {

    // defaultValue ex)  2024-12
    const [showValue, setValue] = React.useState<Date | null>(() => {
        const parsedDate = new Date(`${dateValue}-01`); // yyyy-mm-dd형식으로 바꿔줌 
        return isNaN(parsedDate.getTime()) ? null : parsedDate; // 유효한 날짜만 반환, 아니면 null
    });
    const [open, setOpen] = React.useState(false); // 캘린더 열림 상태 관리

    // 데이터 자체를 dateValue 가져오는 value 설정으로 넣어줌 // dateValue를 검증할 때 필요 
    useEffect(()=>{
        setValue(() => {
            const parsedDate = new Date(`${dateValue}-01`);
            return isNaN(parsedDate.getTime()) ? null : parsedDate; // 유효한 날짜만 반환, 아니면 null
        })
    },[dateValue])


    //handleChange onChange를 호출해서 부모의 데이터를 바꿔주고 거기서 올바른 값인지 검증도함 --> useEffect로 dateValue걸어서 날짜 교체
    const handleChange = (newValue: Date | null) => {
        const formattedValue = newValue
        ? `${newValue.getFullYear()}-${String(newValue.getMonth() + 1).padStart(2, "0")}`
        : "";

        if(inputProps?.max)
            if(inputProps?.max < formattedValue){
                console.log(inputProps?.max)
                console.log(inputProps?.min)
                console.log(formattedValue)
                alert('선택된 날짜보다 과거를 선택해주세요.')
                return 
            }

        if(inputProps?.min)
            if(inputProps?.min > formattedValue){
                console.log(inputProps?.max)
                console.log(inputProps?.min)
                console.log(formattedValue)
                alert('선택된 날짜보다 미래를 선택해주세요.')
                return 
            }


        // 가짜 이벤트 생성 
        const fakeEvent = {
            target: {
                value: formattedValue,
                type :  type,
                id :  id,
                name: name,
            },
        } as React.ChangeEvent<HTMLInputElement>;
        // onChange 호출
        onChange(fakeEvent);
    };


return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
        <DatePicker
        views={["year", "month"]} // 연도와 월만 선택 가능
        value={showValue}
        onChange={handleChange}
        open={open} // 캘린더 열림 상태
        onOpen={() => setOpen(true)} // 열림 처리
        onClose={() => setOpen(false)} // 닫힘 처리
        renderInput={(params) => <TextField {...params}  focused={open}
        InputProps={{
            ...params.InputProps,
            endAdornment: <CalendarTodayIcon sx={{ fontSize: 13, cursor: "pointer" }}  
            onClick={() => setOpen(true)} // 아이콘 클릭 시 캘린더 열기

            />, // 아이콘 바꾸기
            style: {
              fontSize: "13px", // 텍스트 크기 조정
              overflow: "hidden", // 스크롤 방지
              textOverflow: "ellipsis", // 텍스트 잘림 방지
              whiteSpace: "nowrap", // 한 줄로 표시
            },
        }}
        />}
        inputFormat="yyyy년 MM월" // 한글 형식으로 날짜 표시
    />
    </LocalizationProvider>
);
};

export default MonthDatePickerField;

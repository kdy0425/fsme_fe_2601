import React, { useEffect, useState } from 'react';
import {
    Box,
    IconButton,
    Dialog,
    DialogContent,
} from '@mui/material';
import {
    CustomFormLabel,
} from '@/utils/fsms/fsm/mui-imports';
import { IconX } from '@tabler/icons-react';
import { Row } from './TxPage';
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils';

// 신규 등록 모달창의 경우 당장에 받아야할 것들이 없음.
interface ModalFormProps {
    buttonLabel: string
    title: string
    data: Row
    url: string
    open: boolean
    onCloseClick: () => void
}

interface CalRow {
    calYear: string         // 년도  ex  2024
    calMonth: string        // 월    ex  08
    dayoffYmd: string       // 부제적용일자 ex 1
    orderYmd: string        // 정렬용 년월일 ex 1
    dayoffSeCd: string      // 부제구분코드 ex 2
    dayoffTypeCd: string    // 부제유형코드 ex  5
    dayoffNo: string        // 부제번호     ex  10000543
    indctNm: string         // 부제출력명   ex  10
}

const ModalCaldendar = (props: ModalFormProps) => {
    const { title, data, open, onCloseClick } = props;

    const [calRow, setCalRow] = useState<CalRow[]>([]);
    const [dayoffYm, setDayoffYm] = useState(() => new Date().getFullYear() + String(new Date().getMonth() + 1).padStart(2, '0'));
    const [calendar, setCalendar] = useState<(number | null)[][]>([]);

    const handleClose = () => {
        setCalRow([])
        setDayoffYm(() => new Date().getFullYear() + String(new Date().getMonth() + 1).padStart(2, '0'))
        onCloseClick();
    };

    const handleDateChange = (num: number) => {
        const currentYear = parseInt(dayoffYm.substring(0, 4), 10);
        const currentMonth = parseInt(dayoffYm.substring(4, 6), 10) - 1;

        const newDate = new Date(currentYear, currentMonth + num);
        const updatedYear = newDate.getFullYear();
        const updatedMonth = String(newDate.getMonth() + 1).padStart(2, '0');

        setDayoffYm(`${updatedYear}${updatedMonth}`);
    };

    const generateCalendar = () => {
        const year = parseInt(dayoffYm.substring(0, 4), 10);
        const month = parseInt(dayoffYm.substring(4, 6), 10) - 1;

        const firstDay = new Date(year, month, 1).getDay(); // 해당 월의 첫째 날 요일
        const daysInMonth = new Date(year, month + 1, 0).getDate(); // 해당 월의 총 일수

        const calendarRows: (number | null)[][] = [];
        let currentDay = 1;

        // 총 6주를 기준으로 달력을 생성
        for (let week = 0; week < 6; week++) {
            const weekRow: (number | null)[] = [];
            for (let day = 0; day < 7; day++) {
                if (week === 0 && day < firstDay) {
                    weekRow.push(null);
                } else if (currentDay > daysInMonth) {
                    weekRow.push(null);
                } else {
                    weekRow.push(currentDay);
                    currentDay++;
                }
            }
            calendarRows.push(weekRow);
            if (currentDay > daysInMonth) break;
        }

        setCalendar(calendarRows);
    };

    // Fetch 달력 데이터
    const fetchData = async () => {
        try {
            let endpoint: string = 
                `/fsm/stn/tdgm/tx/getAllTaxiDayoffCalList?` +
                `${dayoffYm ? '&dayoffYm=' + dayoffYm : ''}` +
                `${data.locgovCd ? '&locgovCd=' + data.locgovCd : ''}` +
                `${data.vhclNo ? '&vhclNo=' + data.vhclNo : ''}`;

            const response = await sendHttpRequest('GET', endpoint, null, true, {
                cache: 'no-store',
            });
            if (response && response.resultType === 'success' && response.data) {
                setCalRow(response.data);
            } else {
                setCalRow([]);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        generateCalendar();
        fetchData();
    }, [dayoffYm]);

    return (
        <React.Fragment>
            <Dialog
                fullWidth={false}
                maxWidth={false}
                sx={{
                    "& .MuiDialog-paper": {
                        width: "800px",
                        maxWidth: "800px",
                    },
                }}
                open={open}
            >
                <DialogContent>
                    <Box className="table-bottom-button-group">
                        <CustomFormLabel className="modal_title">
                            <h2>{title}</h2>
                        </CustomFormLabel>
                        <div className="button-right-align">
                            <IconButton
                                color="inherit"
                                sx={{
                                    color: '#000',
                                    padding: 0
                                }}
                                onClick={handleClose}
                            >
                                <IconX size="2rem" />
                            </IconButton>
                        </div>
                    </Box>
                    <Box
                        id="form-modal"
                        component="form"
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            m: 'auto',
                            width: 'full',
                        }}
                    >
                        <div className="modal_content">
                            <div className="calendar_wrap">
                                <div className="calendar_date">
                                    <button type="button" className='calendar_date_btn prev' onClick={() => handleDateChange(-1)}>이전 달</button>
                                    <div className="date">{`${dayoffYm.substring(0, 4)}년 ${dayoffYm.substring(4, 6)}월`}</div>
                                    <button type="button" className='calendar_date_btn next' onClick={() => handleDateChange(+1)}>다음 달</button>
                                </div>
                                <div className="calendar_dates">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>일</th>
                                                <th>월</th>
                                                <th>화</th>
                                                <th>수</th>
                                                <th>목</th>
                                                <th>금</th>
                                                <th>토</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {calendar.map((week, weekIndex) => (
                                                <tr key={weekIndex}>
                                                    {week.map((day, dayIndex) => {
                                                        const dayData = calRow.find(
                                                            (row) => parseInt(row.dayoffYmd, 10) === day &&
                                                            parseInt(row.calYear, 10) === parseInt(dayoffYm.substring(0, 4), 10) &&
                                                            parseInt(row.calMonth, 10) === parseInt(dayoffYm.substring(4, 6), 10)
                                                        );
                                                        return (
                                                            <td key={dayIndex} className={dayData ? 'today' : ''}>
                                                                {day ? (
                                                                    <div>
                                                                        <span className="day">{day}</span>
                                                                        {dayData && <div className="cnt">{dayData.indctNm}</div>}
                                                                    </div>
                                                                ) : null}
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </Box>
                </DialogContent>
            </Dialog>
        </React.Fragment>
    );
}

export default ModalCaldendar;

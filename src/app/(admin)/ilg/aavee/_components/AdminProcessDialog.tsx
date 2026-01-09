'use client'
import {
  Box,
  Button,
  RadioGroup,
  Typography,
  FormControlLabel,
  Table,
  TableContainer,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material'

import Dialog, { DialogProps } from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import React, { useEffect, useState } from 'react';
import { CustomFormLabel, CustomTextField } from '@/utils/fsms/fsm/mui-imports';
import { Row } from '../page';
import { SelectItem } from 'select'
import { Pageable2 } from 'table'

import { sendHttpFileRequest, sendHttpRequest, sendMultipartFormDataRequest } from '@/utils/fsms/common/apiUtils';
import { CtpvSelect, LocgovSelect, CommSelect } from '@/app/components/tx/commSelect/CommSelect';
import { getCityCodes, getCodesByGroupNm, getLocalGovCodes } from '@/utils/fsms/common/code/getCode'

import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import { getUserInfo } from '@/utils/fsms/utils';   // 로그인 유저 정보
import { getDateRange } from '@/utils/fsms/common/util' // 일자 기간 설정
import { ilgAaveeProcessTxHC } from '@/utils/fsms/headCells'  // 지자체이첩 등록 HeadCell

import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import BlankCard from '@/app/components/shared/BlankCard'
import CustomCheckbox from '@/components/forms/theme-elements/CustomCheckbox';
import CustomRadio from '@/components/forms/theme-elements/CustomRadio';

import { IconSearch } from '@tabler/icons-react'    // 검색버튼 아이콘
import { useDispatch, useSelector } from '@/store/hooks'
import { AppState } from '@/store/store';

// 주유소명 검색 모달
import TxOilStationModal from '@/app/components/tx/popup/TxOilStationModal';
import { OilStationSearchRow } from '@/app/components/tx/popup/TxOilStationModal';
import { getToday } from '@/utils/fsms/common/comm';
import { addDays, addMonths, addYears, dateToString } from '@/utils/fsms/common/dateUtils';

interface AdminProcessDialogProps {
    title: string;
    // children: React.ReactElement<ModalFormProps>; // ModalFormProps 타입의 ReactElement
    size?: DialogProps['maxWidth'] | 'lg';
    open: boolean;
    selectedRows: Row[];
    reloadFunc: () => void;
    closeAdminProcessModal: (saveFlag: boolean) => void;
}

export interface adminProcessInfo {
    chk: string // 체크여부
    exmnNo: string // 조사번호 연변
    locgovCd: string //  지자체코드
    locgovNm: string //  지자체명
    vhclNo: string // 차량번호    
    vonrNm: string // 수급자명           
    tpbizCd: string // 업종
    bzmnSeCd: string // 법인/개인 코드
    bzmnSeNm: string // 법인/개인 명칭  
    tpbizSeCd: string // 업종구분        
    droperYn: string // 직영여부
    exmnRsltCn: string // 조사결과내용
    exmnRegYn: string // 조사등록여부
    mdfrId: string // 수정자아이디
    dlngNocs: string // 거래건수
    totlAprvAmt: string // 거래금액
    totlAsstAmt: string  // 유가보조금
    rdmActnAmt: string // 환수조치액
    rdmTrgtNocs: string // 환수대상건수
    dspsDt: string // 처분조치일
    rdmYn: string // 환수여부 코드
    rdmNm: string // 환수여부 명칭
    admdspSeCd: string // 행정처분 구분 코드
    admdspSeNm: string // 행정처분 구분 명칭
    admdspRsnCn: string // 행정처분사유
    admdspBgngYmd: string // 행정처분 시작일
    admdspEndYmd: string // 행정처분 종료일
    oltPssrpPrtiYn: string // 주유소 공모,가담 여부 코드
    oltPssrpPrtiNm: string // 주유소 공모,가담 여부 명칭
    oltPssrpPrtiOltNm: string // 주유소명
    oltPssrpPrtiBrno: string // 주유소사업자번호
    dsclMthdCd: string // 적발방법 코드
    dsclMthdNm: string // 적발방법 명칭
    dsclMthdEtcMttrCn: string // 적발방법기타
    ruleVltnCluCd: string // 규정위반조항 명칭
    ruleVltnCluNm: string // 규정위반조항 코드
    ruleVltnCluEtcCn: string // 규정위반조항기타
    moliatOtspyYn: string // 국토부 미지급 여부 코드
    moliatOtspyNm: string // 국토부 미지급 여부 명칭
    ntsOtspyYn: string // 국세청 미지급 여부
    exceptYn: string // 추후 해당차량 제외
  }

export default function AdminProcessDialog(props: AdminProcessDialogProps) {
    const { title, 
        //children
        size, open, selectedRows, closeAdminProcessModal, reloadFunc } = props;

    const dispatch = useDispatch()

    const [isEditMode, setIsEditMode] = useState<boolean>(false); // 등록 수정 모드 상태 관리
    
    const [loading, setLoading] = useState(false) // 로딩여부
    const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 저장시 로딩상태
    const [rows, setRows] = useState<Row[]>(selectedRows) // 가져온 로우 데이터

    const [disabled, setDisabled] = useState<boolean>(true) // 행정처분 등록정보 활성화 처리
    const [rdmDisabled, setRdmDisabled] = useState<boolean>(true) // 환수여부에 따른 환수금액 필드 활성화 처리
    const [admdspDisabled, setAdmdspDisabled] = useState<boolean>(true) // 행정처분에 따른 입력 항목 활성화 처리
    const [dsclDisabled, setDsclDisabled] = useState<boolean>(true) // 행정처분에 따른 입력 항목 활성화 처리
    const [ruleDisabled, setRuleDisabled] = useState<boolean>(true) // 행정처분에 따른 입력 항목 활성화 처리

    const [rdmYn, setRdmYn] = useState<boolean>(true);                 // 환수여부
    const [exceptYn, setExceptYn] = useState<boolean>(false);            // 추후 해당차량 제외
    const [moliatOtspyYn, setMoliatOtspyYn] = useState<boolean>(false); // 국토부 미지급 여부
    const [ntsOtspyYn, setNtsOtspyYn] = useState<boolean>(false);       // 국세청 미지급 여부
    
    const [rdmActnAmt, setRdmActnAmt] = useState<string>("");       // 환수조치액

    const [oltPssrpPrtiYnItems, setOltPssrpPrtiYnItems] = useState<SelectItem[]>([]);   // 주유소 공모,가담 여부
    const [bzmnSeCdItems, setBzmnSeCdItems] = useState<SelectItem[]>([]);   // 사업자 구분

    const [checkArray, setCheckArray] = useState<string[]>([]);       // 체크된 아이디(인덱스) 배열
    
    const oilStationInfo = useSelector((state : AppState ) => state.oilStationInfo)

    const [frcsOpen, setFrcsOpen] = useState<boolean>(false); // 주유소검색 모달 상태관리

    const userInfo = getUserInfo();     // 로그인 유저 정보 조회
    const userLoginId = userInfo.lgnId;

    const [tapPageable, setTapPageable] = useState<Pageable2>({
        pageNumber: 1, // 페이지 번호는 1부터 시작
        pageSize: 999, // 기본 페이지 사이즈 설정
        totalPages: 1, // 정렬 기준
      })

      // 저장될 데이터를 관리하는 상태
    const [formData, setFormData] = useState<adminProcessInfo>({
        chk: '', // 체크여부
        exmnNo: '', // 조사번호 연변
        locgovCd: '', //  지자체코드
        locgovNm: '', //  지자체명
        vhclNo: '', // 차량번호    
        vonrNm: '', // 수급자명           
        tpbizCd: '', // 업종
        bzmnSeCd: '', // 법인/개인 코드
        bzmnSeNm: '', // 법인/개인 명칭        
        tpbizSeCd: '', // 업종구분        
        droperYn: '', // 직영여부
        exmnRsltCn: '', // 조사결과내용
        exmnRegYn: '', // 조사등록여부
        mdfrId: '', // 수정자아이디
        dlngNocs: '', // 거래건수
        totlAprvAmt: '', // 거래금액
        totlAsstAmt: '', // 유가보조금
        rdmActnAmt: '', // 환수조치액
        rdmTrgtNocs: '', // 환수대상건수
        dspsDt: '', // 처분조치일
        rdmYn: '', // 환수여부 코드
        rdmNm: '', // 환수여부 명칭
        admdspSeCd: '', // 행정처분 구분 코드
        admdspSeNm: '', // 행정처분 구분 명칭
        admdspRsnCn: '', // 행정처분사유
        admdspBgngYmd: '', // 행정처분 시작일
        admdspEndYmd: '', // 행정처분 종료일
        oltPssrpPrtiYn: '', // 주유소 공모,가담 여부 코드
        oltPssrpPrtiNm: '', // 주유소 공모,가담 여부 명칭
        oltPssrpPrtiOltNm: '', // 주유소명
        oltPssrpPrtiBrno: '', // 주유소사업자번호
        dsclMthdCd: '', // 적발방법 코드
        dsclMthdNm: '', // 적발방법 명칭
        dsclMthdEtcMttrCn: '', // 적발방법기타  
        ruleVltnCluCd: '', // 규정위반조항 명칭
        ruleVltnCluNm: '', // 규정위반조항 코드
        ruleVltnCluEtcCn: '', // 규정위반조항기타
        moliatOtspyYn: '', // 국토부 미지급 여부
        moliatOtspyNm: '', // 국토부 미지급 여부 명칭
        ntsOtspyYn: '', // 국세청 미지급 여부
        exceptYn: '', // 추후 해당차량 제외
        })

    // 코드 파싱을 위한 item 세팅
    useEffect(() => {
        // 개인법인구분(택시) 706
        getCodesByGroupNm('706').then((res) => {
          let itemArr:SelectItem[] = []
          if(res) {
            res.map((code: any) => {
              let item: SelectItem = {
                label: code['cdKornNm'],
                value: code['cdNm'],
              }
    
              itemArr.push(item)
            })
          }
          setBzmnSeCdItems(itemArr);
        });
        // 주유소 공모,가담 여부
        getCodesByGroupNm('157').then((res) => {
            let itemArr:SelectItem[] = []
            if(res) {
              res.map((code: any) => {
                let item: SelectItem = {
                  label: code['cdKornNm'],
                  value: code['cdNm'],
                }
      
                itemArr.push(item)
              })
            }
            setOltPssrpPrtiYnItems(itemArr);
          });
    }, [])   

    // 다이얼로그 닫기 핸들러
    const handleCloseModal = () => {
        setIsEditMode(false);   // 닫을 때 수정 모드 초기화
        closeAdminProcessModal(false);  // 닫을 때 재조회 방지
    };

    // 수정 모드 토글
    const handleEditToggle = () => {
        setIsEditMode(!isEditMode); // 수정 모드 토글
    };
    // 데이터 변경 핸들러
    const handleFormDataChange = (name: string, value: string) => {    
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // 검색 조건이 변경되면 자동으로 쿼리스트링 변경
    useEffect(() => {
        console.log("formData: ", formData)
        rowChangeMap(formData)
    }, [formData])

    // 
    useEffect(() => {
        let moliatOtspyYnStr = '';

        if (moliatOtspyYn) {
            moliatOtspyYnStr = 'Y'
        } else {
            moliatOtspyYnStr = 'N'
        }

        setFormData((prev) => ({ ...prev, moliatOtspyYn: moliatOtspyYnStr }));   
    }, [moliatOtspyYn])

    useEffect(() => {
        let exceptYnStr = '';

        if (exceptYn) {
            exceptYnStr = 'Y'
        } else {
            exceptYnStr = 'N'
        }

        setFormData((prev) => ({ ...prev, exceptYn: exceptYnStr }));   
    }, [exceptYn])

    useEffect(() => {
        if(oilStationInfo.frcsNmOSM === ''
        || oilStationInfo.frcsNmOSM === null
        || oilStationInfo.frcsNmOSM === undefined
        || oilStationInfo.frcsBrnoOSM === ''
        || oilStationInfo.frcsBrnoOSM === null
        || oilStationInfo.frcsBrnoOSM === undefined
        ) { return }

        const brno = oilStationInfo.frcsBrnoOSM.slice(0,3) + '-' + oilStationInfo.frcsBrnoOSM.slice(3,5) + '-' + oilStationInfo.frcsBrnoOSM.slice(5,10)

        setFormData((prev) => ({ ...prev, oltPssrpPrtiOltNm: oilStationInfo.frcsNmOSM, oltPssrpPrtiBrno: brno }));
      }, [!oilStationInfo.osmModalOpen])

    const handleParamChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
      ) => {
        const { name, value } = event.target
        console.log("name: ", name)
        console.log("value: ", value)
        setFormData((prev) => ({ ...prev, [name]: value }));
    }

    const handleCheckboxChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
      ) => {
        const { name, value } = event.target
        console.log("name1: ", name)
        console.log("value1: ", value)

        if (name === 'rdmYn') {
            let rdmYnStr = '';
            let rdmNmStr = '';
            let rdmActnAmtStr = '';

            setRdmYn(!rdmYn)

            if (rdmYn) {
                rdmYnStr = 'Y'
                rdmNmStr = '예'
                rdmActnAmtStr = '0'      
                setRdmDisabled(false)
            } else {
                rdmYnStr = 'N'
                rdmNmStr = '아니오'
                
                rdmActnAmtStr = '0'
                setRdmActnAmt('0')
                alert("환수안함으로 환수금액은 0원 처리합니다.")
                setRdmDisabled(true)
            }

            setFormData((prev) => ({ ...prev, rdmYn: rdmYnStr, rdmNm: rdmNmStr, rdmActnAmt: rdmActnAmtStr }));
        }
        
        if (name === 'moliatOtspyYn') {
            setMoliatOtspyYn(!moliatOtspyYn);
        }

        if (name === 'exceptYn') {
            setExceptYn(!exceptYn);
        }
    }

    // 라디오버튼 변경시 재조회
    const handleRadioChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
        const { name, value } = event.target

        if (value === 'H') {   // 6개월지급정지 선택시
            setDateRangeHalfYear()
            setAdmdspDisabled(false)
        } else if (value === 'S') {   // 1년지급정지 선택시
            setDateRangeYear()
            setAdmdspDisabled(false)
        } else {
            setAdmdspDisabled(true)
        }

        let rdmYnStr = '';
        let rdmNmStr = '';
        let rdmActnAmtStr = '';

        if (value === 'N' || value === 'W') {
            if (!rdmYn) {
                setRdmYn(true)
                rdmYnStr = 'N'
                rdmNmStr = '아니오'
                
                rdmActnAmtStr = '0'
                setRdmActnAmt('0')
                alert("환수안함으로 환수금액은 0원 처리합니다.")
                setRdmDisabled(true)
                clearFormData() // 행정처분 6개월정지, 1년지급정지의 데이터 초기화
            }
        }

        if (value === 'H' || value === 'S') {
            setRdmYn(false)
            rdmYnStr = 'Y'
            rdmNmStr = '예'
            rdmActnAmtStr = formData.rdmActnAmt??'0'    
            setRdmDisabled(false)
        }

        setFormData((prev) => ({ ...prev, rdmYn: rdmYnStr, rdmNm: rdmNmStr, rdmActnAmt: rdmActnAmtStr }));

        let admdspSeStr = '';
        if (value === 'N') {
            admdspSeStr = "혐의없음";
            setMoliatOtspyYn(false);
        } else if(value === 'W') {
            admdspSeStr = "경고";
            setMoliatOtspyYn(false);
        } else if(value === 'H') {
            admdspSeStr = "6개월지급정지";
            setMoliatOtspyYn(true);
        } else if(value === 'S') {
            admdspSeStr = "1년지급정지";
            setMoliatOtspyYn(true);
        }
        
        setFormData((prev) => ({ ...prev, admdspSeCd: value, admdspSeNm: admdspSeStr }))
    }

    const handleComboChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
      ) => {
        const { name, value } = event.target
   
        if (name === 'oltPssrpPrtiYn') {
            let oltPssrpPrtiStr = '';

            if (value === 'Y') {
                oltPssrpPrtiStr = "주유소공모,가담";
            } else if (value === 'N')  {
                oltPssrpPrtiStr = "해당없음";
                setFormData((prev) => ({ ...prev, oltPssrpPrtiOltNm: '', oltPssrpPrtiBrno: '' }));
            } else {
                oltPssrpPrtiStr = '';
            }

            setFormData((prev) => ({ ...prev, oltPssrpPrtiYn: value, oltPssrpPrtiNm: oltPssrpPrtiStr }));
        }

        if (name === 'dsclMthdCd') {
            let dsclMthdStr = '';

            if (value === 'S') {
                setDsclDisabled(false)
            } else {
                setFormData((prev) => ({ ...prev, dsclMthdEtcMttrCn: '' }));
                setDsclDisabled(true)
            }

            if        (value === 'C') {
                dsclMthdStr = "국민권익위원회";
            } else if (value === 'G') {
                dsclMthdStr = "검찰";
            } else if (value === 'I') {
                dsclMthdStr = "자체조사";
            } else if (value === 'K') {
                dsclMthdStr = "석유관리원";
            } else if (value === 'P') {
                dsclMthdStr = "경찰";
            } else if (value === 'S') {
                dsclMthdStr = "기타";
            } else {
                dsclMthdStr = '';
            }

            setFormData((prev) => ({ ...prev, dsclMthdCd: value, dsclMthdNm: dsclMthdStr }));
        }

        if (name === 'ruleVltnCluCd') {
            let ruleVltnCluStr = '';

            if (value === '99') {
                setRuleDisabled(false)
            } else {
                setFormData((prev) => ({ ...prev, ruleVltnCluEtcCn: '' }));
                setRuleDisabled(true)
            }

            if        (value === '01') {
                ruleVltnCluStr = "제23조 제2항 제1호";
            } else if (value === '02') {
                ruleVltnCluStr = "제23조 제2항 제2호";
            } else if (value === '03') {
                ruleVltnCluStr = "제23조 제2항 제3호";
            } else if (value === '04') {
                ruleVltnCluStr = "제23조 제2항 제7호";
            } else if (value === '05') {
                ruleVltnCluStr = "제23조 제2항 제8호";
            } else if (value === '06') {
                ruleVltnCluStr = "제23조 제2항 제9호";
            } else if (value === '07') {
                ruleVltnCluStr = "제23조 제2항 제12호";
            } else if (value === '99') {
                ruleVltnCluStr = "기타";
            } else {
                ruleVltnCluStr = '';
            }

            setFormData((prev) => ({ ...prev, ruleVltnCluCd: value, ruleVltnCluNm: ruleVltnCluStr }));
        }
    
    }

    // 6개월지급정지 설정 (180일)
    const setDateRangeHalfYear = () => {        
        const startDate = dateToString(addDays(new Date(), 1), true)
        const endDate = dateToString(addMonths(addDays(new Date(), 1), 6), true)
        setFormData((prev) => ({ ...prev, admdspBgngYmd: startDate, admdspEndYmd: endDate }))
    }

    // 6개월지급정지 설정 (365일)
    const setDateRangeYear = () => {
        const startDate = dateToString(addDays(new Date(), 1), true)
        const endDate = dateToString(addYears(addDays(new Date(), 1), 1), true)
        setFormData((prev) => ({ ...prev, admdspBgngYmd: startDate, admdspEndYmd: endDate }))
    }

    // 조사결과 등록 모달 열기
    const handleIconClick = async () => {
        if (formData.oltPssrpPrtiYn !== 'Y') {
        alert("주유소 공모 가담을 선택하였을 경우만 주유소 선택이 가능합니다.");
        return;
        }
        openBrnoModal()
    }

    // 주유소 조회 모달 열기
    const openBrnoModal= async () => {
        setFrcsOpen(!frcsOpen)
    }

    // 빈 값 체크 return : boolean
    function isNull(obj: any) {
        if (obj === '' || obj === null || obj === undefined) {
            return true
        } else {
            return false
        }
    }

    // 입력 폼 데이터 초기화
    const initFormData = async() =>{
        formData.chk = '' // 체크여부
        formData.exmnNo = '' // 조사번호 연변
        formData.locgovCd = '' //  지자체코드
        formData.locgovNm = '' //  지자체명
        formData.vhclNo = '' // 차량번호    
        formData.vonrNm = '' // 수급자명           
        formData.tpbizCd = '' // 업종
        formData.bzmnSeCd = '' // 법인/개인 코드
        formData.bzmnSeNm = '' // 법인/개인 명칭        
        formData.tpbizSeCd = '' // 업종구분        
        formData.droperYn = '' // 직영여부
        formData.exmnRsltCn = '' // 조사결과내용
        formData.exmnRegYn = '' // 조사등록여부
        formData.mdfrId = '' // 수정자아이디
        formData.dlngNocs = '' // 거래건수
        formData.totlAprvAmt = '' // 거래금액
        formData.totlAsstAmt = '' // 유가보조금
        formData.rdmActnAmt = '' // 환수조치액
        formData.rdmTrgtNocs = '' // 환수대상건수
        formData.dspsDt = '' // 처분조치일
        formData.rdmYn = '' // 환수여부 코드
        formData.rdmNm = '' // 환수여부 명칭
        formData.admdspSeCd = '' // 행정처분 구분 코드
        formData.admdspSeNm = '' // 행정처분 구분 명칭
        formData.admdspRsnCn = '' // 행정처분사유
        formData.admdspBgngYmd = '' // 행정처분 시작일
        formData.admdspEndYmd = '' // 행정처분 종료일
        formData.oltPssrpPrtiYn = '' // 주유소 공모,가담 여부 코드
        formData.oltPssrpPrtiNm = '' // 주유소 공모,가담 여부 명칭
        formData.oltPssrpPrtiOltNm = '' // 주유소명
        formData.oltPssrpPrtiBrno = '' // 주유소사업자번호
        formData.dsclMthdCd = '' // 적발방법 코드
        formData.dsclMthdNm = '' // 적발방법 명칭
        formData.dsclMthdEtcMttrCn = '' // 적발방법기타  
        formData.ruleVltnCluCd = '' // 규정위반조항 코드
        formData.ruleVltnCluNm = '' // 규정위반조항 명칭
        formData.ruleVltnCluEtcCn = '' // 규정위반조항기타
        formData.moliatOtspyYn = '' // 국토부 미지급 여부
        formData.moliatOtspyNm = '' // 국토부 미지급 여부 명칭
        formData.ntsOtspyYn = '' // 국세청 미지급 여부
        formData.exceptYn = '' // 추후 해당차량 제외

        setFormData((prev) => ({ ...prev}))
    }

    // 행정처분 6개월정지, 1년지급정지의 데이터 초기화
    const clearFormData = async() =>{
        formData.admdspBgngYmd = '' // 행정처분 시작일
        formData.admdspEndYmd = '' // 행정처분 종료일
        formData.oltPssrpPrtiYn = '' // 주유소 공모,가담 여부 코드
        formData.oltPssrpPrtiNm = '' // 주유소 공모,가담 여부 명칭
        formData.oltPssrpPrtiOltNm = '' // 주유소명
        formData.oltPssrpPrtiBrno = '' // 주유소사업자번호
        formData.dsclMthdCd = '' // 적발방법 코드
        formData.dsclMthdNm = '' // 적발방법 명칭
        formData.dsclMthdEtcMttrCn = '' // 적발방법기타  
        formData.ruleVltnCluCd = '' // 규정위반조항 코드
        formData.ruleVltnCluNm = '' // 규정위반조항 명칭
        formData.ruleVltnCluEtcCn = '' // 규정위반조항기타
        formData.moliatOtspyYn = '' // 국토부 미지급 여부
        formData.moliatOtspyNm = '' // 국토부 미지급 여부 명칭
        formData.ntsOtspyYn = '' // 국세청 미지급 여부
        formData.exceptYn = '' // 추후 해당차량 제외

        setFormData((prev) => ({ ...prev}))
    }

    // 입력 폼 데이터 초기화
    const bindFormData = async(selectedRow: Row) => {
        //

        // 환수조치액 설정 및 제거 처리
        setRdmActnAmt('');
        
        // 환수조치액 설정 및 제거 처리        
        if(!isNull(selectedRow.rdmActnAmt) && Number(selectedRow.rdmActnAmt.replaceAll(",", "")) > 0) {
            const removedCommaValue: number = Number(selectedRow.rdmActnAmt.replaceAll(",", ""))
            setRdmActnAmt(removedCommaValue.toLocaleString());
            selectedRow.rdmActnAmt = removedCommaValue.toString();
            selectedRow.rdmYn = 'Y'
            selectedRow.rdmNm = '예'
            setRdmYn(false)
            setRdmDisabled(false)
        } else {
            setRdmActnAmt('0')
            selectedRow.rdmActnAmt = '0'
            selectedRow.rdmYn = 'N'
            selectedRow.rdmNm = '아니오'
            setRdmYn(true)
            setRdmDisabled(true)
        }

        setFormData((prev) => ({ ...prev, rdmYn: selectedRow.rdmYn, rdmNm: selectedRow.rdmNm, rdmActnAmt: selectedRow.rdmActnAmt }))
        
        //선택된 행을 담음
        formData.chk = selectedRow.chk ?? '' // 체크여부
        formData.exmnNo = selectedRow.exmnNo ?? '' // 조사번호 연변
        formData.locgovCd = selectedRow.locgovCd ?? '' //  지자체코드
        formData.locgovNm = selectedRow.locgovNm ?? '' //  지자체명
        formData.vhclNo = selectedRow.vhclNo ?? '' // 차량번호    
        formData.vonrNm = selectedRow.vonrNm ?? '' // 수급자명           
        formData.tpbizCd = selectedRow.tpbizCd ?? '' // 업종
        formData.bzmnSeCd = selectedRow.bzmnSeCd ?? '' // 법인/개인 코드
        formData.bzmnSeNm = selectedRow.bzmnSeNm ?? '' // 법인/개인 명칭        
        formData.tpbizSeCd = selectedRow.tpbizSeCd ?? '' // 업종구분        
        formData.droperYn = selectedRow.droperYn ?? '' // 직영여부
        formData.exmnRsltCn = selectedRow.exmnRsltCn ?? '' // 조사결과내용
        formData.mdfrId = selectedRow.mdfrId ?? '' // 수정자아이디
        formData.dlngNocs = selectedRow.dlngNocs ?? '' // 거래건수
        formData.totlAprvAmt = selectedRow.totlAprvAmt ?? '' // 거래금액
        formData.totlAsstAmt = selectedRow.totlAsstAmt ?? '' // 유가보조금
        formData.rdmActnAmt = selectedRow.rdmActnAmt ?? '' // 환수조치액
        formData.rdmTrgtNocs = selectedRow.rdmTrgtNocs ?? '' // 환수대상건수
        formData.exmnRegYn = selectedRow.exmnRegYn ?? '' // 조사등록여부
        formData.dspsDt = selectedRow.dspsDt ?? '' // 처분조치일
        formData.rdmYn = selectedRow.rdmYn ?? '' // 환수여부 코드
        formData.rdmNm = selectedRow.rdmNm ?? '' // 환수여부 명칭
        formData.admdspSeCd = selectedRow.admdspSeCd ?? '' // 행정처분 구분 코드
        formData.admdspSeNm = selectedRow.admdspSeNm ?? '' // 행정처분 구분 명칭
        formData.admdspRsnCn = selectedRow.admdspRsnCn ?? '' // 행정처분사유
        formData.admdspBgngYmd = selectedRow.admdspBgngYmd ?? '' // 행정처분 시작일
        formData.admdspEndYmd = selectedRow.admdspEndYmd ?? '' // 행정처분 종료일
        formData.oltPssrpPrtiYn = selectedRow.oltPssrpPrtiYn ?? '' // 주유소 공모,가담 여부 코드
        formData.oltPssrpPrtiNm = selectedRow.oltPssrpPrtiNm ?? '' // 주유소 공모,가담 여부 명칭
        formData.oltPssrpPrtiOltNm = selectedRow.oltPssrpPrtiOltNm ?? '' // 주유소명
        formData.oltPssrpPrtiBrno = selectedRow.oltPssrpPrtiBrno ?? '' // 주유소사업자번호
        formData.dsclMthdCd = selectedRow.dsclMthdCd ?? '' // 적발방법 코드
        formData.dsclMthdNm = selectedRow.dsclMthdNm ?? '' // 적발방법 명칭
        formData.dsclMthdEtcMttrCn = selectedRow.dsclMthdEtcMttrCn ?? '' // 적발방법기타  
        formData.ruleVltnCluCd = selectedRow.ruleVltnCluCd ?? '' // 규정위반조항 명칭
        formData.ruleVltnCluNm = selectedRow.ruleVltnCluNm ?? '' // 규정위반조항 코드
        formData.ruleVltnCluEtcCn = selectedRow.ruleVltnCluEtcCn ?? '' // 규정위반조항기타
        formData.moliatOtspyYn = selectedRow.moliatOtspyYn ?? '' // 국토부 미지급 여부
        formData.moliatOtspyNm = selectedRow.moliatOtspyNm ?? '' // 국토부 미지급 여부 명칭
        formData.ntsOtspyYn = selectedRow.ntsOtspyYn ?? '' // 국세청 미지급 여부
        formData.exceptYn = selectedRow.exceptYn ?? '' // 추후 해당차량 제외

        setFormData((prev) => ({ ...prev}))
    }

     //체크 항목을 저장 rows 에 담음
     const handleCheckChange = (selected:string[]) => {
        console.log("selected: ", selected)
        if (selected.length > checkArray.length) {
            setDisabled(false)
            // initFormData()
            bindFormData(rows[Number(selected[selected.length - 1].replace('tr', ''))])
        } else {
            setDisabled(true)
            setRdmActnAmt('')
            setRdmDisabled(true)
            initFormData()
        }

        setCheckArray(selected)

        let checkRows:Row[] = [];
        
        for (var i = 0; i < rows.length; i++) {
            let isCheck = false;
            for (var j = 0; j < selected.length; j++) {
                if (Number(selected[j].replace('tr', '')) === i) {
                    isCheck = true;
                }    
            }
            
            if (isCheck && rows[i].chk === '0') {
                rows[i].chk = '1';
            }
            if (!isCheck && rows[i].chk === '1') {
                rows[i].chk = '0';
            }
            checkRows.push(rows[i]);
        }

        setRows(checkRows);
    }

    // 행 클릭 시 호출되는 함수
    const handleRowClick = (selectedRow: Row) => {
        console.log("selectedRow: ", selectedRow)
    }

    // 변경된 formData를 rows 에 반영
    const rowChangeMap = (changeRow: adminProcessInfo) => {
        console.log("changeRow: ", changeRow)
        if(rows && changeRow){
            const tempRows = rows.map(map =>
                {
                    if(map.exmnNo == changeRow.exmnNo){
                        return {
                            ...map,
                            dspsDt:changeRow.dspsDt,
                            rdmYn:changeRow.rdmYn,
                            rdmNm:changeRow.rdmNm,
                            admdspSeCd: changeRow.admdspSeCd,
                            admdspSeNm: changeRow.admdspSeNm,
                            admdspBgngYmd: changeRow.admdspBgngYmd,
                            admdspEndYmd: changeRow.admdspEndYmd,
                            oltPssrpPrtiYn: changeRow.oltPssrpPrtiYn,
                            oltPssrpPrtiNm: changeRow.oltPssrpPrtiNm,
                            oltPssrpPrtiOltNm: changeRow.oltPssrpPrtiOltNm,
                            oltPssrpPrtiBrno: changeRow.oltPssrpPrtiBrno,
                            dsclMthdCd: changeRow.dsclMthdCd,
                            dsclMthdNm: changeRow.dsclMthdNm,
                            dsclMthdEtcMttrCn: changeRow.dsclMthdEtcMttrCn,
                            ruleVltnCluCd: changeRow.ruleVltnCluCd,
                            ruleVltnCluNm: changeRow.ruleVltnCluNm,
                            ruleVltnCluEtcCn: changeRow.ruleVltnCluEtcCn,
                            moliatOtspyYn: changeRow.moliatOtspyYn,
                            bzmnSeCd:changeRow.bzmnSeCd,
                            bzmnSeNm:changeRow.bzmnSeNm,
                            rdmActnAmt:changeRow.rdmActnAmt,
                            exmnRsltCn:changeRow.exmnRsltCn,
                        }
                    }else{
                        return {...map}
                    }
                }
            )
            setRows(tempRows)
        }
    }

    // 환수조치액 설정 
    const changeRdmActnAmt = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value: string = event.target.value;
        const removedCommaValue: number = Number(value.replaceAll(",", ""))

        if (isNaN(removedCommaValue)) {
            setFormData((prev) => ({ ...prev, rdmActnAmt: ''}));
            return
        }

        setRdmActnAmt(removedCommaValue.toLocaleString());
        formData.rdmActnAmt = removedCommaValue.toString();
        setFormData((prev) => ({ ...prev, rdmActnAmt: removedCommaValue.toString() }));
    }

    function checkValidation(checkRows: Row[]) {
        let isValid = true
        for (var i = 0; i < checkRows.length; i++) {
            if (isNull(checkRows[i].dspsDt)) {
                alert("환수대상 건 중 조치일이 없는 건이 존재합니다.")
                isValid = false
                return false
            }

            if (isNull(checkRows[i].admdspSeCd)) {
                alert("환수대상 건 중 행정처분 구분이 없는 건이 존재합니다.")
                isValid = false
                return false
            }

            if (checkRows[i].admdspSeCd === 'H' || checkRows[i].admdspSeCd === 'S') {

                if (checkRows[i].admdspBgngYmd.replaceAll('-','') <= getToday()) {
                    alert("행정처분 시작일은 금일 이후로 가능합니다.")
                    isValid = false
                    return false
                }

                if (checkRows[i].admdspBgngYmd > checkRows[i].admdspEndYmd) {
                    alert("행정처분 시작일이 종료일보다 큽니다.")
                    isValid = false
                    return false
                }

                if (isNull(checkRows[i].oltPssrpPrtiYn)) {
                    alert("보조금 지급정지 건 중\n주유소 공모, 가담여부를 선택하지 않은 건이 존재합니다.")
                    isValid = false
                    return false
                } 
                
                if (checkRows[i].oltPssrpPrtiYn === 'Y') {
                    if (isNull(checkRows[i].oltPssrpPrtiOltNm) || isNull(checkRows[i].oltPssrpPrtiBrno)) {
                        alert("보조금 지급정지 건 중 주유소 공모, 가담 건은\n돋보기를 클릭하여 주유소 정보를 조회 및 입력하세요.")
                        isValid = false
                        return false
                    } 
                }

                if (isNull(checkRows[i].dsclMthdCd)) {
                    alert("보조금 지급정지 건 중\n적발방법을 선택하지 않은 건이 존재합니다.")
                    isValid = false
                    return false
                }

                if (checkRows[i].dsclMthdCd === 'S' && isNull(checkRows[i].dsclMthdEtcMttrCn)) {
                    alert("보조금 지급정지건 중\n적발방법 기타항목을 입력하지 않은 건이 존재합니다.")
                    isValid = false
                    return false
                }

                if (isNull(checkRows[i].ruleVltnCluCd)) {
                    alert("보조금 지급정지 건 중\n규정위반조항을 선택하지 않은 건이 존재합니다.")
                    isValid = false
                    return false
                }

                if (checkRows[i].ruleVltnCluCd === '99' && isNull(checkRows[i].ruleVltnCluEtcCn)) {
                    alert("보조금 지급정지 건 중\n규정위반조항 기타항목을 입력하지 않은 건이 존재합니다.")
                    isValid = false
                    return false
                } 
            }
        }
        return isValid
    }

    // 행정처분 등록 처리
    const createDoubtAdminProcess = async () => {
        const checkRows = rows.filter((row) => (row.chk && row.chk === '1'))
        if (checkRows.length < 1) {
            alert("행정처분 등록할 항목을 선택하세요.")
            return
        }
        const validFlag: boolean = checkValidation(checkRows)
        if (!validFlag) return

        const cancelConfirm: boolean = confirm("행정처분 내역을 등록하시겠습니까?")
        if (!cancelConfirm) return

        try {
            setLoadingBackdrop(true)
    
            let param: any[] = []
            checkRows.map((row) => {
            param.push({
                exmnNo              : row.exmnNo,
                locgovCd            : row.locgovCd,
                locgovNm            : row.locgovNm,
                vhclNo              : row.vhclNo,
                vonrNm              : row.vonrNm,
                dlngNocs            : row.dlngNocs,
                totlAprvAmt         : row.totlAprvAmt,
                totlAsstAmt         : row.totlAsstAmt,
                rdmActnAmt          : row.rdmActnAmt?.replaceAll(',', ''),
                rdmTrgtNocs         : row.rdmTrgtNocs,
                rdmYn               : row.rdmYn,
                dspsDt              : row.dspsDt,
                admdspSeCd          : row.admdspSeCd,
                admdspBgngYmd       : row.admdspBgngYmd?.replaceAll('-', ''),
                admdspEndYmd        : row.admdspEndYmd?.replaceAll('-', ''),
                bzmnSeCd            : row.bzmnSeCd,      
                oltPssrpPrtiYn      : row.oltPssrpPrtiYn,
                oltPssrpPrtiOltNm   : row.oltPssrpPrtiOltNm,
                oltPssrpPrtiBrno    : row.oltPssrpPrtiBrno?.replaceAll('-', ''),
                dsclMthdCd          : row.dsclMthdCd,
                dsclMthdEtcMttrCn   : row.dsclMthdEtcMttrCn,
                ruleVltnCluCd       : row.ruleVltnCluCd,
                ruleVltnCluEtcCn    : row.ruleVltnCluEtcCn,
                moliatOtspyYn       : row.moliatOtspyYn,
                mdfrId              : userLoginId,
                exceptYn            : exceptYn === true ? 'Y' : 'N'
            })
            })
            
            const body = { areaAvgVolExElctcReqstDto : param }
            const endpoint: string = `/fsm/ilg/aavee/tx/createDoubtAdminProcess`
            const response = await sendHttpRequest('POST', endpoint, body, true, {cache: 'no-store'})
    
            if (response && response.resultType === 'success') {
                alert("행정처분 등록이 완료되었습니다.")
            } else {
                alert("행정처분 등록 내역이 없습니다.")
            }
        } catch(error) {
            alert("행정처분 등록에 실패하였습니다.")
            console.error("ERROR POST DATA : ", error)
        } finally {
            setLoadingBackdrop(false)
            setIsEditMode(false)   // 닫을 때 수정 모드 초기화
            closeAdminProcessModal(true)    // 닫을 때 재조회 처리
        }
    }

    // 조사결과 등록
    const handleProcessSave = async () => {
        createDoubtAdminProcess();
    }

    // 주유소 검색 모달에서 로우클릭시
    const frcsModalRowClick = (row:OilStationSearchRow) => {
        setFormData((prev) => ({...prev, 
            oltPssrpPrtiOltNm: row.frcsNm, oltPssrpPrtiBrno: row.frcsBrno.substring(0,3) + "-" + row.frcsBrno.substring(3,5) + "-" + row.frcsBrno.substring(5,10)
        }));
    }

    return (
        <React.Fragment>
        <Dialog
            fullWidth={false}
            maxWidth={size}
            open={open}
            onClose={handleCloseModal}
        >
            <DialogContent>
            <Box className='table-bottom-button-group'>
                <CustomFormLabel className="input-label-display">
                    <h2>행정처분 등록</h2>
                </CustomFormLabel>
                <div className="button-right-align">
                    <LoadingBackdrop open={loadingBackdrop} />
                    <Button variant="contained" onClick={handleProcessSave} color="primary">등록</Button>
                    <Button variant="outlined" color="primary" onClick={handleCloseModal}>취소</Button>
                </div>
            </Box>
            <BlankCard className="contents-card" title="행정처분 등록">
                <TableContainer style={{ maxHeight:"220px" }}>
                    <TableDataGrid
                        headCells={ilgAaveeProcessTxHC} // 테이블 헤더 값
                        rows={rows} // 목록 데이터
                        loading={loading} // 로딩여부
                        onRowClick={handleRowClick} // 행 클릭 핸들러 추가
                        checkAndRowClick={true} // 행클릭 시 체크 기능 추가
                        paging={false}
                        onCheckChange={handleCheckChange}
                    />
                </TableContainer>
            </BlankCard>
            <BlankCard className="contents-card" title="행정처분 등록정보">
            <Box
                id='form-modal'
                component='form'
                onSubmit={(e) => {
                    e.preventDefault()
                    handleIconClick()
                    // setIsEditMode(false)
                }}
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    m: 'auto',
                    width: 'full',
                }}
            >
                <Box sx={{ maxWidth: 'fullWidth', margin: '0 auto' }}>
                    <TableContainer style={{ margin: '0 0 0 0' }}>
                        <Table className="table table-bordered" aria-labelledby="tableTitle" style={{ tableLayout: 'fixed', width: '100%' }}>
                            <TableBody>
                                <TableRow>
                                    <TableCell className="td-head" style={{ width: '180px', textAlign: 'left', paddingLeft: '16px' }}>
                                        <span className="required-text">*</span> 조치일
                                    </TableCell>
                                    <TableCell colSpan={7}>
                                    <CustomTextField 
                                        type="date" 
                                        id="dspsDt" 
                                        name="dspsDt" 
                                        value={formData.dspsDt} 
                                        onChange={handleParamChange}
                                        style={{ marginLeft:'10px' }}
                                        disabled={disabled}
                                         />
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="td-head" style={{ width: '160px', textAlign: 'left', paddingLeft: '16px' }}>
                                        <span className="required-text">*</span> 행정처분
                                    </TableCell>
                                    <TableCell colSpan={7}>
                                        <div className="form-list">
                                            <div className="form-inline">
                                                <div className="form-group" style={{ paddingLeft: '8px' }}>
                                                    <FormControlLabel
                                                        value="rdmNm"
                                                        control={
                                                            <CustomCheckbox
                                                                // defaultChecked
                                                                name='rdmYn'
                                                                value={rdmYn}
                                                                checked={rdmYn}
                                                                onChange={handleCheckboxChange}
                                                                disabled={disabled}
                                                            />
                                                        }
                                                        label="환수안함"
                                                    />
                                                </div>
                                                <div className="form-group" style={{ marginLeft: '-303px' }}>
                                                    <CustomFormLabel className="input-label-display" htmlFor="lbl_rdmActnAmt">환수금액</CustomFormLabel>
                                                    <CustomTextField
                                                        sx={{ '& input': { textAlign: 'right' } }}
                                                        type="text"
                                                        id="txt_rdmActnAmt"
                                                        name="txtRdmActnAmt"
                                                        disabled={rdmDisabled}
                                                        value={rdmActnAmt}
                                                        onChange={changeRdmActnAmt}
                                                        style={{ marginLeft: '5px' }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="form-inline">
                                                    <RadioGroup 
                                                        row id="rdo_admdspSeCd" 
                                                        name="admdspSeCd"
                                                        className="mui-custom-radio-group"
                                                        onChange={handleRadioChange}
                                                        value={formData.admdspSeCd}
                                                        >
                                                        <FormControlLabel 
                                                            value="N" 
                                                            control={<CustomRadio />} 
                                                            label="혐의없음" 
                                                            disabled={disabled}
                                                        />
                                                        <FormControlLabel
                                                            value="W"
                                                            control={<CustomRadio />}
                                                            label="경고"
                                                            disabled={disabled}
                                                        />
                                                        <FormControlLabel
                                                            value="H"
                                                            control={<CustomRadio />}
                                                            label="6개월지급정지"
                                                            disabled={disabled}
                                                        />
                                                        <FormControlLabel
                                                            value="S"
                                                            control={<CustomRadio />}
                                                            label="1년지급정지"
                                                            disabled={disabled}
                                                        />
                                                    </RadioGroup>
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="td-head" style={{ width: '160px', textAlign: 'left', paddingLeft: '27px' }}>
                                        행정처분사유
                                    </TableCell>
                                    <TableCell colSpan={7} style={{ width: 'calc(50% - 150px)', textAlign: 'left' }}>
                                        <CustomTextField
                                            type="text"
                                            id="txt_admdspRsnCn"
                                            name="admdspRsnCn"
                                            onChange={handleParamChange}
                                            value={formData.admdspRsnCn}
                                            style={{ marginLeft:'10px', marginRight:'0px', width: 'calc(100% - 10px)'}}
                                            disabled={disabled}
                                        />
                                    </TableCell>
                                </TableRow>
                                <TableRow style={{ height: '48px' }} >
                                    <TableCell className="td-head" style={{ width: '160px', textAlign: 'left', paddingLeft: admdspDisabled ? '27px': '16px' }}>
                                        <span className="required-text">{admdspDisabled ? '': '*'}</span> 행정처분 시작일
                                    </TableCell>
                                    <TableCell colSpan={2}>
                                        <CustomTextField 
                                            type="date" 
                                            id="cal_admdspBgngYmd" 
                                            name="admdspBgngYmd" 
                                            value={formData.admdspBgngYmd} 
                                            onChange={handleParamChange} 
                                            style={{ marginLeft:'10px' }}
                                            disabled={admdspDisabled}
                                         />
                                    </TableCell>
                                    <TableCell className="td-head" style={{ width: '180px', verticalAlign: 'middle' }}>
                                        <span className="required-text">{admdspDisabled ? '': '*'}</span> 행정처분 종료일
                                    </TableCell>
                                    <TableCell colSpan={4}>
                                        <CustomTextField 
                                            type="date" 
                                            id="cal_admdspEndYmd" 
                                            name="admdspEndYmd" 
                                            value={formData.admdspEndYmd} 
                                            onChange={handleParamChange}
                                            style={{ marginLeft:'10px' }}
                                            disabled={admdspDisabled}
                                         />
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="td-head" style={{ width: '160px', textAlign: 'left', paddingLeft: admdspDisabled ? '27px': '16px' }}>
                                        <span className="required-text">{admdspDisabled ? '': '*'}</span> 주유소 공모,가담 여부
                                    </TableCell>
                                    <TableCell colSpan={7}>
                                        <div className="form-group form-inline" style={{ marginLeft:'10px' }}>
                                            <CommSelect
                                                cdGroupNm={'157'}
                                                pValue={formData.oltPssrpPrtiYn}
                                                pName={'oltPssrpPrtiYn'}
                                                width={'60%'}
                                                handleChange={handleComboChange}
                                                addText=' '
                                                pDisabled={admdspDisabled}
                                            />
                                            <button  
                                                className="form-group" 
                                                disabled={admdspDisabled}
                                                style={{ marginLeft: '10px', width: '32px', height: '32px', borderRadius: '5px', borderColor: '#D5D5D5' }}>
                                                <IconSearch 
                                                    size={24} 
                                                    stroke={'grey'} 
                                                    strokeWidth={2}
                                                    style={{ paddingLeft:'0px' }}
                                                    />
                                            </button>
                                            <div className="form-group" style={{ marginLeft: '10px' }}>
                                                <CustomFormLabel className="input-label-display" htmlFor="lbl_oltPssrpPrtiOltNm">주유소명</CustomFormLabel>
                                                <CustomTextField 
                                                    type="text"
                                                    id="txt_oltPssrpPrtiOltNm" 
                                                    name="oltPssrpPrtiOltNm"
                                                    value={formData.oltPssrpPrtiOltNm} 
                                                    width={'120%'}
                                                    style={{ marginLeft: '0px', width: '280px' }}
                                                    disabled={true}
                                                />
                                            </div>
                                            <div className="form-group" style={{ marginLeft: '10px' }}>
                                                <CustomFormLabel className="input-label-display" htmlFor="lbl_oltPssrpPrtiBrno">사업자번호</CustomFormLabel>
                                                <CustomTextField 
                                                    type="text"
                                                    id="txt_oltPssrpPrtiBrno" 
                                                    name="oltPssrpPrtiBrno"
                                                    value={formData.oltPssrpPrtiBrno} 
                                                    style={{ marginLeft: '0px' }}
                                                    disabled={true}
                                                />
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="td-head" style={{ width: '160px', textAlign: 'left', paddingLeft: admdspDisabled ? '27px': '16px' }}>
                                        <span className="required-text">{admdspDisabled ? '': '*'}</span> 적발방법
                                    </TableCell>
                                    <TableCell colSpan={3}>
                                        <div className="form-group form-inline" style={{ marginLeft:'10px' }}>  
                                                <CommSelect
                                                    cdGroupNm={'160'}
                                                    pValue={formData.dsclMthdCd}
                                                    pName={'dsclMthdCd'}
                                                    width={'150%'}
                                                    handleChange={handleComboChange}
                                                    pDisabled={admdspDisabled}
                                                    addText={' '}
                                                />
                                            <div className="form-group" style={{ marginLeft:'0px' }}>
                                                <CustomFormLabel className="input-label-display" htmlFor="lbl_dsclMthdEtcMttrCn">기타</CustomFormLabel>
                                                <CustomTextField 
                                                    type="text"
                                                    id="txt_dsclMthdEtcMttrCn" 
                                                    name="dsclMthdEtcMttrCn"
                                                    onChange={handleParamChange}
                                                    value={formData.dsclMthdEtcMttrCn}
                                                    style={{ width:'164px', paddingRight: '10px' }} 
                                                    disabled={dsclDisabled}
                                                />
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="td-head" style={{ width: '160px', verticalAlign: 'middle' }}>
                                        <span className="required-text">{admdspDisabled ? '': '*'}</span> 규정 위반 조항
                                    </TableCell>
                                    <TableCell colSpan={3}>
                                        <div className="form-group form-inline" style={{ marginLeft:'0px' }}>    
                                                <CommSelect
                                                    cdGroupNm={'365'}
                                                    pValue={formData.ruleVltnCluCd}
                                                    pName={'ruleVltnCluCd'}
                                                    width={'100%'}
                                                    handleChange={handleComboChange}
                                                    pDisabled={admdspDisabled}
                                                    addText=' '
                                                    />
                                            <div className="form-group" style={{ marginRight:'0px'}}>
                                                <CustomFormLabel className="input-label-display" htmlFor="lbl_ruleVltnCluEtcCn">기타</CustomFormLabel>
                                                <CustomTextField
                                                    type="text"
                                                    id="txt_ruleVltnCluEtcCn" 
                                                    name="ruleVltnCluEtcCn"
                                                    onChange={handleParamChange}
                                                    value={formData.ruleVltnCluEtcCn}
                                                    style={{ width:'20px', paddingRight: '0px' }}
                                                    disabled={ruleDisabled}
                                                />
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="td-head" style={{ width: '160px', textAlign: 'left', paddingLeft: '27px' }}>
                                        추후 해당차량 제외
                                    </TableCell>
                                    <TableCell colSpan={2}>
                                        <div className="form-group" style={{ paddingLeft: '8px' }}>
                                            <FormControlLabel
                                                value="exceptNm"
                                                control={
                                                    <CustomCheckbox
                                                        id='exceptYn'
                                                        name='exceptYn'
                                                        value={exceptYn}
                                                        checked={exceptYn}
                                                        onChange={handleCheckboxChange}
                                                    />
                                                }
                                                label="제외"
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell className="td-head" style={{ width: '160px', verticalAlign: 'middle' }}>
                                        국토부 보조금
                                    </TableCell>
                                    <TableCell colSpan={4}>
                                        <div className="form-group" style={{ paddingLeft: '8px' }}>
                                            <FormControlLabel
                                                value="moliatOtspyYn"
                                                control={
                                                    <CustomCheckbox
                                                        id='moliatOtspyYn'
                                                        name='moliatOtspyYn'
                                                        value={moliatOtspyYn}
                                                        checked={moliatOtspyYn}
                                                        onChange={handleCheckboxChange}
                                                        disabled={admdspDisabled}
                                                    />
                                                }
                                                label="미지급"
                                            />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <div style={{ marginLeft: 'auto'}}>
                        <Typography 
                        variant="body1"
                        fontSize={16} 
                        fontWeight={600}
                        style={{ paddingLeft: '0px', paddingTop: '10px' }}
                        >
                            <span className="required-text">
                                ※ '추후 해당차량 제외' 를 체크하면 해당 차량은 해당 패턴의 대상이 아니게 되며, (해당 패턴에 걸리지 않음) 차주가 변경되면 다시 해당 패턴의 대상이 됩니다.
                            </span>
                        </Typography>
                    </div>
                </Box>                
            </Box>
            </BlankCard>
            {/* 사업자번호로 주유소명 검색하는 모달 */}
            {frcsOpen ? (
                <TxOilStationModal
                open={frcsOpen}
                setOpen={setFrcsOpen}
                rowClick={frcsModalRowClick}
                />
            ) : null}
            </DialogContent>
        </Dialog>
        </React.Fragment>
    );
}
/* 공통 component */
import { useEffect, useState } from "react";
import CustomFormLabel from "../../forms/theme-elements/CustomFormLabel";
import CustomTextField from "../../forms/theme-elements/CustomTextField";

interface propsInterface {
    require?:boolean, // 필수사항엽무
    type:string, // 검색종류
    handleChange:(event:React.ChangeEvent<HTMLInputElement>) => void,
    handleKeyDown?:(event:React.KeyboardEvent<HTMLInputElement>) => void,
    pValue?: any
}

export const CommTextField = (props:propsInterface) => {

    const { require, type, handleChange, handleKeyDown, pValue } = props;

    /* 상태관리 */
    const[typeCd, setTypeCd] = useState<string>();
    const[typeNm, setTypeNm] = useState<string>();

    /* UseEffect */
    useEffect(() => {

        let name = '';

        switch (type) {
            case 'brno':
                name = '사업자등록번호';
                break;
            case 'rrno' :
                name = '주민등록번호';
                break;
            case 'vonrRrno' :
                name = '주민등록번호';
                break;
            case 'vhclNo' :
                name = '차량번호';
                break;
            case 'vonrNm' :
                name = '소유자명';
                break;
            case 'locgovNm' :
                name = '지자체명';
                break;                
        }

        setTypeNm(name);
        setTypeCd(type);
    }, []);

    return (
        <div className="form-group">
            <CustomFormLabel className="input-label-display" htmlFor={'sch-' + typeCd}>
                <>
                    {require ? (
                        <span className="required-text">*</span>
                    ):null}
                    {typeNm}
                </>
            </CustomFormLabel>
            <CustomTextField
                id={'sch-' + typeCd}
                name={typeCd}
                value={pValue}
                fullWidth
                onChange={handleChange}
                onKeyDown={handleKeyDown}
            />
        </div>
    );
};
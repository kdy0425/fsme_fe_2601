/* 공통 interface */
import { SelectItem } from 'select'

// 시도 및 관할관청 코드리스트를 SelectItem 타입으로 리턴함
export const toSelectItem = (res:SelectItem[], nm:string, cd:string, type:'COMM'|'CTPV'|'LOCGOV', authInfo?:any, pDisableSelectAll?: boolean, isNotRollCheck?:boolean) => {

    const result:SelectItem[] = [];
    
    if (type == 'COMM' || !authInfo.isLoggedIn) {

        res.map((code: any) => {
            result.push({ label:code[nm], value:code[cd] });
        });

    } else {

        const role:'ADMIN'|'MOLIT'|'LOGV' = authInfo?.authSttus.roles[0];                
        
        if (role === 'ADMIN' || role === 'MOLIT' || isNotRollCheck) {

            // 관리자, 국토부 권한은 전체 지자체 및 관할관청 조회가능
            if(!pDisableSelectAll){
                result.push({ label:'전체', value:'' });    
            }

            res.map((code: any) => {
                result.push({ label:code[nm], value:code[cd] });
            });

        } else {

            const locgovCd:string = authInfo?.authSttus.locgovCd;
            const ctpvCd:string = locgovCd.substring(0,2);
            const lastDigit:string = locgovCd.substring(2,5);

            if(lastDigit === '000' || lastDigit === '001' || locgovCd === '11009') {

                if(!pDisableSelectAll){
                    result.push({ label:'전체', value:'' });    
                }

                // 앞자리 2개로 해당 시만 조회
                res.map((code: any) => {                
                    if(ctpvCd == code[cd].substring(0,2)) {
                        result.push({ label:code[nm], value:code[cd] });
                    }                
                });
            } else {

                const target = type === 'CTPV' ? ctpvCd : locgovCd;
                
                res.map((code: any) => {                
                    if(target == code[cd]) {
                        result.push({ label:code[nm], value:code[cd] });
                    }                
                });                                
            }            
        }
    }    

    return result;
};

export const toSelectItem2 = (res:SelectItem[], nm:string, cd:string, allFlag:boolean) => {  
    const result:SelectItem[] = [];
    
    if(allFlag){
        result.push({label:'전체', value:''});
    }

    res.map((code: any) => {
        if(code[nm] != '전체'){
            result.push({
                label:code[nm],
                value:code[cd]
            });
        }
    });

    return result;
};
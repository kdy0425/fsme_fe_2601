/* React */
import React, { memo } from 'react';

/* mui component */
import { FormControlLabel, RadioGroup } from '@mui/material';
import { CustomRadio } from '@/utils/fsms/fsm/mui-imports';

/* interface 선언 */
interface AdmdspSeRadioProps {
  admdspSeCd:string;
  onChange?:(event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
}

const AdmdspSeRadio = (props:AdmdspSeRadioProps) => {
  
  const { admdspSeCd, onChange } = props;

  return (    
    <RadioGroup
      row
      id='chk_admdspSeCd'
      name='admdspSeCd'
      className='mui-custom-radio-group'
      value={admdspSeCd}
      onChange={onChange}
    >
      <FormControlLabel
        control={<CustomRadio id={'N'} value={'N'} />}
        label={'혐의없음'}
      />
      <FormControlLabel
        control={<CustomRadio id={'W'} value={'W'} />}
        label={'경고'}
      />
      <FormControlLabel
        control={<CustomRadio id={'H'} value={'H'} />}
        label={'6개월지급정지'}
      />
      <FormControlLabel
        control={<CustomRadio id={'S'} value={'S'} />}
        label={'1년지급정지'}
      />
    </RadioGroup>                
  );
};

export default memo(AdmdspSeRadio);

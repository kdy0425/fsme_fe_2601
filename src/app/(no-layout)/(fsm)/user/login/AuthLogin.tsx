import CustomCheckbox from "@/components/forms/theme-elements/CustomCheckbox";
import CustomTextField from "@/components/forms/theme-elements/CustomTextField";
import { loginType } from "@/types/auth/auth";
import { InputLabel } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

const AuthLogin = ({ title, subtitle, subtext, handleLgnIdChange, handlePswdChange }: loginType) => (
  <>
    {title ? (
      <Typography fontWeight="700" variant="h3" mb={1}>
        {title}
      </Typography>
    ) : null}

    {subtext}

    <Stack sx={{ mt:2 }}>
      <Box className='filter-form'>
        <div className="form-group">
          <InputLabel htmlFor="lgnId" style={{width: '4rem'}}><b>아이디</b></InputLabel>
          {/* <CustomFormLabel className="input-label-display" htmlFor="lgnId" style={{whiteSpace: 'nowrap'}}>아이디</CustomFormLabel> */}
          <CustomTextField
            id="lgnId"
            className="mui-custom-textarea required"
            variant="outlined"
            onChange={ handleLgnIdChange }
            fullWidth
          />
        </div>
      </Box>
      <Box className='filter-form'>
        <div className="form-group">
          <InputLabel htmlFor="pswd" style={{width: '4rem'}}><b>비밀번호</b></InputLabel>
          {/* <CustomFormLabel htmlFor="pswd" style={{whiteSpace: 'nowrap'}}>비밀번호</CustomFormLabel> */}
          <CustomTextField
            id="pswd"
            className="mui-custom-textarea required"
            type="password"
            variant="outlined"
            onChange={ handlePswdChange }
            fullWidth
          />
        </div>
      </Box>
      <Stack
        justifyContent="space-between"
        direction="row"
        alignItems="center"
        my={2}
      >
        <FormGroup>
          <FormControlLabel
            control={<CustomCheckbox defaultChecked />}
            label="아이디 저장"
          />
        </FormGroup>
      </Stack>
    </Stack>
    <Box>
      <Button
        color="primary"
        variant="contained"
        size="large"
        fullWidth
        type="submit"
      >
        로그인
      </Button>
      
    </Box>
    {subtitle}
  </>
);

export default AuthLogin;

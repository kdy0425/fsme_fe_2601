// app/.../OneButtonRangeInputGELE.tsx
'use client';

import * as React from 'react';
import { alpha, Box, Button } from '@mui/material';
import CustomTextField from '@/components/forms/theme-elements/CustomTextField';

type Props = {
  unit?: string;
  op: '' | 'GE' | 'LE';
  eq: string;
  nameOp: string;
  nameEq: string;
  onChange: (e: { target: { name: string; value: string } }) => void;
  allowDecimal?: boolean;
  width?: number | string;
  disabled?: boolean;
  useOpColor?: boolean;
};

export default function OneButtonRangeInputGELE({
  unit,
  op,
  eq,
  nameOp,
  nameEq,
  onChange,
  allowDecimal = false,
  width = 220,
  disabled = false,
  useOpColor = true,
}: Props) {
  const toNumStr = (s: string) => {
    const cleaned = allowDecimal ? s.replace(/[^\d.]/g, '') : s.replace(/\D/g, '');
    return cleaned;
  };

  const toggleOp = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    const next = op === 'GE' ? 'LE' : 'GE';
    onChange({ target: { name: nameOp, value: next } });
  };

  const hasValue = (eq ?? '').trim() !== '';

  return (
    <Box display="flex" alignItems="center" gap={0.5} sx={{ width }}>
      <CustomTextField
        size="small"
        value={eq}
        onChange={(e: any) => {
          onChange({ target: { name: nameEq, value: toNumStr(e.target.value) } });
        }}
        inputMode="numeric"
        fullWidth
        disabled={disabled}
        InputProps={{
          readOnly: disabled,
          endAdornment: unit ? <span style={{ fontSize: 12, color: '#777' }}>{unit}</span> : undefined,
        }}
      />

      <Button
        variant="outlined"
         {...(useOpColor ? { color: op === 'LE' ? 'error' : 'primary' } : { color: 'inherit' })}
        size="small"
        type="button"
        tabIndex={-1}
        disableRipple
        onClick={toggleOp}
        disabled={disabled}
        sx={(theme) => ({
            minWidth: 56,
            height: 32,
            fontWeight: hasValue ? 600 : 500,  // 값 있으면 살짝 굵게
            px: 1.25,

            ...(useOpColor
            ? {}
            : {
                // 기본은 TextField 아웃라인 톤
                color: hasValue ? theme.palette.text.primary : theme.palette.text.secondary,
                borderColor: hasValue
                    ? alpha(theme.palette.text.primary, 0.54) // ← 값 있으면 더 진하게
                    : alpha(theme.palette.text.primary, 0.23),
                '&:hover': {
                    borderColor: hasValue
                    ? alpha(theme.palette.text.primary, 0.64)
                    : alpha(theme.palette.text.primary, 0.37),
                    backgroundColor: 'transparent',
                },
                '&.Mui-disabled': {
                    color: theme.palette.text.disabled,
                    borderColor: theme.palette.action.disabledBackground,
                },
                borderWidth: 1,
                }),
        })}
        >
        {op === 'GE' ? '이상' : '이하'}
      </Button>
    </Box>
  );
}

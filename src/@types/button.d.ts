import { ButtonPropsColorOverrides } from '@mui/material/Button'

export interface ButtonProps {
  label: string
  color: OverridableStringUnion<
    | 'inherit'
    | 'primary'
    | 'secondary'
    | 'success'
    | 'error'
    | 'info'
    | 'warning',
    ButtonPropsColorOverrides
  >
  onClick: () => void
}

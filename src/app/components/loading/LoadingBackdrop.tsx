'use client'
import CircularProgress from '@mui/material/CircularProgress'
import { Backdrop } from '@mui/material'

interface loadingProps {
  open: boolean
}
export const LoadingBackdrop = (props: loadingProps) => {
  const { open } = props
  return (
    <Backdrop
      open={open}
      sx={{
        color: '#fff',
        zIndex: (theme) => theme.zIndex.drawer + 10000,
      }}
    >
      <CircularProgress color="inherit" />
    </Backdrop>
  )
}

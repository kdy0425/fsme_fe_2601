import {
  Card,
  CardHeader,
  CardContent,
  Divider,
  IconButton,
} from '@mui/material'
import Button from '@mui/material/Button'
import { useTheme } from '@mui/material/styles'
import { AppState } from '@/store/store'
import { useSelector } from '@/store/hooks'

type Props = {
  className?: string
  children: JSX.Element | JSX.Element[]
  title?: string | JSX.Element
  sx?: any
  buttons?: ButtonProps[]
  rightHeader?: JSX.Element | JSX.Element[]
}

interface ButtonProps {
  label: string
  color: 'outlined' | 'success'
  onClick: () => void
  disabled?: boolean
}

const BlankCard = ({ title, children, className, sx, buttons, rightHeader }: Props) => {
  const customizer = useSelector((state: AppState) => state.customizer)

  const theme = useTheme()
  const borderColor = theme.palette.divider

  return (
    <Card
      sx={{
        p: 0,
        border: !customizer.isCardShadow ? `1px solid ${borderColor}` : 'none',
        position: 'relative',
        marginTop: 1,
        sx,
      }}
      className={className}
      elevation={customizer.isCardShadow ? 9 : 0}
      variant={!customizer.isCardShadow ? 'outlined' : undefined}
    >
      {title ? (
        <>
          <CardHeader
            title={title}
            action={
              <>
                {buttons && buttons.length > 0 ? (
                  buttons.map((button: ButtonProps, index) => {
                    return (
                      <Button
                        sx={{
                          marginLeft: 1,
                        }}
                        key={index}
                        variant={
                          button.color === 'outlined' ? 'outlined' : 'contained'
                        }
                        color={
                          button.color !== 'outlined' ? button.color : 'primary'
                        }
                        onClick={button.onClick}
                        disabled={
                          button.disabled !== undefined
                            ? button.disabled
                            : false
                        }
                      >
                        {button.label}
                      </Button>
                    )
                  })
                ) : rightHeader ? (
                  rightHeader
                ) : (
                  <></>
                )}
              </>
            }
          />
          <Divider />{' '}
        </>
      ) : (
        ''
      )}
      <CardContent>{children}</CardContent>
    </Card>
  )
}

export default BlankCard

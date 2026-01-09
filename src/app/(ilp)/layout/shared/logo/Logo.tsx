import Link from 'next/link'
import { styled } from '@mui/material/styles'
import Image from 'next/image'

const Logo = () => {
  const LinkStyled = styled(Link)(() => ({
    overflow: 'hidden',
    display: 'block',
  }))

  return (
    <>
      <LinkStyled href="/ilp" className="logo-top">
        <Image
          src="/images/logos/logo_ugaips.svg"
          alt="logo"
          height={44}
          width={136}
          priority
        />
      </LinkStyled>
      <div className="system-name-group">
        <span className="system-name" style={{ color: '#1694B1' }}>
          부정수급{' '}
        </span>
        방지시스템
      </div>
    </>
  )
}

export default Logo

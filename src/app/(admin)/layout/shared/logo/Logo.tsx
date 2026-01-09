import Link from "next/link";
import { styled } from '@mui/material/styles'
import Image from "next/image";

const Logo = () => {
  const LinkStyled = styled(Link)(() => ({
    overflow: "hidden",
    display: "block",
  }));

  return (
    <>
      <LinkStyled href="/" className="logo-top">
          <Image
            src="/images/logos/logo.svg"
            alt="logo"
            height={44}
            width={136}
            priority
          />
      </LinkStyled>
      <div className="system-name-group"><span className="system-name">유가보조금</span> 관리시스템</div>
    </>
  );
};

export default Logo;

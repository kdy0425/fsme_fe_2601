import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@mui/material'
import PrivacyPolicyDescription from '@/app/(no-layout)/(fsm)/user/login/_components/PrivacyPolicyDescription'
import { CustomFormLabel } from '@/utils/fsms/fsm/mui-imports'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { getToday } from '@/utils/fsms/common/dateUtils'

const Footer = () => {
  const [privacyPolicyOpen, setPrivacyPolicyOpen] = useState<boolean>(false)
  const pathname = usePathname()

  return (
    <footer id="footer" className="page-footer">
      <div className="page-footer-link">
        <ul className="page-footer-info">
          {pathname.indexOf('privacy') > -1 ? null : (
            <li>
              <Link
                href={`/privacy/${getToday()}`}
                // onClick={() => {
                //   setPrivacyPolicyOpen(true)
                // }}
                className="textB"
              >
                개인정보처리방침
              </Link>
            </li>
          )}
        </ul>
      </div>
      <div className="page-footer-inner">
        <div className="page-footer-logo">
          <Image
            src="/images/logos/logo_footer.png"
            alt="국토부 로고"
            height={42}
            width={144}
            priority
          />
        </div>
        <div className="page-footer-container">
          <div className="company-info">
            <span className="address">
              (우)30103 세종특별자치시 도움6로 11 국토교통부
            </span>
            <span className="tel">
              <span className="tel-title">민원대표전화</span>
              1833-8236(화물) 1833-6739(택시) 1644-8487(버스) (평일 09시~18시)
            </span>
          </div>
          <span className="copyright">
            COPYRIGHT(C) Ministry of Land. Intrastructure and Transport. ALL
            RIGHTS RESERVED.
          </span>
        </div>
      </div>
      <PrivacyPolicyDescription
        open={privacyPolicyOpen}
        handleConse={() => {
          setPrivacyPolicyOpen(false)
        }}
        size="md"
      />
    </footer>
  )
}

export default Footer

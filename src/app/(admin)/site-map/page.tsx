'use client'
import React from 'react';
import { Link } from '@mui/material';

import Breadcrumb from '../layout/shared/breadcrumb/Breadcrumb';
import PageContainer from '@/components/container/PageContainer';
import CustomDataGrid1 from '@/components/tables/CustomDataGrid1';
import PageTitle from '@/app/components/shared/PageTitle';

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    to: '/',
    title: '사이트맵',
  }
];

const BasicTable = () => {

  return (
    <PageContainer title="사이트맵" description="사이트맵">

      {/* 1뎁스 타이틀 시작 */}
      <PageTitle headClass="page-title-1depth" title='사이트맵' />
      {/* 1뎁스 타이틀 끝 */}

      {/* 사이트맵 시작 */}
      <div className="sitemap">
        <ul id="head_menu" className="topmenu">
      
          <li>
            <Link href="#">1뎁스 메뉴</Link>
            <div className="submenu">
              <ul>
                <li>
                  <Link href="#">2뎁스 메뉴</Link>
                  <div className="dep3">
                    <ul>
                      <li>
                        <Link href="#">3뎁스 메뉴</Link>
                      </li>
                      <li>
                        <Link href="#">3뎁스 메뉴</Link>
                      </li>
                      <li>
                        <Link href="#">3뎁스 메뉴</Link>
                      </li>
                    </ul>
                  </div>
                </li>
                <li>
                  <Link href="#">2뎁스 메뉴</Link>
                  <div className="dep3">
                    <ul>
                      <li>
                        <Link href="#">3뎁스 메뉴</Link>
                      </li>
                      <li>
                        <Link href="#">3뎁스 메뉴</Link>
                      </li>
                      <li>
                        <Link href="#">3뎁스 메뉴</Link>
                      </li>
                    </ul>
                  </div>
                </li>
              </ul>
            </div>
          </li>
          <li>
            <Link href="#">1뎁스 메뉴</Link>
            <div className="submenu">
              <ul>
                <li>
                  <Link href="#">2뎁스 메뉴</Link>
                </li>
                <li>
                  <Link href="#">2뎁스 메뉴</Link>
                  <div className="dep3">
                    <ul>
                      <li>
                        <Link href="#">3뎁스 메뉴</Link>
                      </li>
                      <li>
                        <Link href="#">3뎁스 메뉴</Link>
                      </li>
                      <li>
                        <Link href="#">3뎁스 메뉴</Link>
                      </li>
                    </ul>
                  </div>
                </li>
              </ul>
            </div>
          </li>
          <li>
            <Link href="#">1뎁스 메뉴</Link>
            <div className="submenu">
              <ul>
                <li>
                  <Link href="#">2뎁스 메뉴</Link>
                  <div className="dep3">
                    <ul>
                      <li>
                        <Link href="#">3뎁스 메뉴</Link>
                      </li>
                      <li>
                        <Link href="#">3뎁스 메뉴</Link>
                      </li>
                      <li>
                        <Link href="#">3뎁스 메뉴</Link>
                      </li>
                    </ul>
                  </div>
                </li>
                <li>
                  <Link href="#">2뎁스 메뉴</Link>
                  <div className="dep3">
                    <ul>
                      <li>
                        <Link href="#">3뎁스 메뉴</Link>
                      </li>
                      <li>
                        <Link href="#">3뎁스 메뉴</Link>
                      </li>
                      <li>
                        <Link href="#">3뎁스 메뉴</Link>
                      </li>
                    </ul>
                  </div>
                </li>
              </ul>
            </div>
          </li>
          <li>
            <Link href="#">1뎁스 메뉴</Link>
            <div className="submenu">
              <ul>
                <li>
                  <Link href="#">2뎁스 메뉴</Link>
                  <div className="dep3">
                    <ul>
                      <li>
                        <Link href="#">3뎁스 메뉴</Link>
                      </li>
                      <li>
                        <Link href="#">3뎁스 메뉴</Link>
                      </li>
                      <li>
                        <Link href="#">3뎁스 메뉴</Link>
                      </li>
                    </ul>
                  </div>
                </li>
                <li>
                  <Link href="#">2뎁스 메뉴</Link>
                  <div className="dep3">
                    <ul>
                      <li>
                        <Link href="#">3뎁스 메뉴</Link>
                      </li>
                      <li>
                        <Link href="#">3뎁스 메뉴</Link>
                      </li>
                      <li>
                        <Link href="#">3뎁스 메뉴</Link>
                      </li>
                    </ul>
                  </div>
                </li>
              </ul>
            </div>
          </li>
          <li>
            <Link href="#">1뎁스 메뉴</Link>
            <div className="submenu">
              <ul>
                <li>
                  <Link href="#">2뎁스 메뉴</Link>
                  <div className="dep3">
                    <ul>
                      <li>
                        <Link href="#">3뎁스 메뉴</Link>
                      </li>
                      <li>
                        <Link href="#">3뎁스 메뉴</Link>
                      </li>
                      <li>
                        <Link href="#">3뎁스 메뉴</Link>
                      </li>
                    </ul>
                  </div>
                </li>
                <li>
                  <Link href="#">2뎁스 메뉴</Link>
                  <div className="dep3">
                    <ul>
                      <li>
                        <Link href="#">3뎁스 메뉴</Link>
                      </li>
                      <li>
                        <Link href="#">3뎁스 메뉴</Link>
                      </li>
                      <li>
                        <Link href="#">3뎁스 메뉴</Link>
                      </li>
                    </ul>
                  </div>
                </li>
              </ul>
            </div>
          </li>
          <li>
            <Link href="#">1뎁스 메뉴</Link>
            <div className="submenu">
              <ul>
                <li>
                  <Link href="#">2뎁스 메뉴</Link>
                  <div className="dep3">
                    <ul>
                      <li>
                        <Link href="#">3뎁스 메뉴</Link>
                      </li>
                      <li>
                        <Link href="#">3뎁스 메뉴</Link>
                      </li>
                      <li>
                        <Link href="#">3뎁스 메뉴</Link>
                      </li>
                    </ul>
                  </div>
                </li>
                <li>
                  <Link href="#">2뎁스 메뉴</Link>
                  <div className="dep3">
                    <ul>
                      <li>
                        <Link href="#">3뎁스 메뉴</Link>
                      </li>
                      <li>
                        <Link href="#">3뎁스 메뉴</Link>
                      </li>
                      <li>
                        <Link href="#">3뎁스 메뉴</Link>
                      </li>
                    </ul>
                  </div>
                </li>
              </ul>
            </div>
          </li>
      
        </ul>
      </div>
      {/* 사이트맵 시작 */}

    </PageContainer>
  );


};

export default BasicTable;

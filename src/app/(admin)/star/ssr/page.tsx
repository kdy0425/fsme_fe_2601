'use client'

import React, { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  Typography,
} from '@mui/material'

import PageContainer from '@/components/container/PageContainer'
import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'

// utils
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'

import SearchModal from './_components/SearchModal'
import Link from 'next/link'

const BCrumb = [
  { to: '/', title: 'Home' },
  { title: '통계보고서' },
  { title: '통계보고서' },
  { to: '/star/ssr', title: '정형통계보고서' },
]

const FuelIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="32"
    height="32"
    fill="none"
    viewBox="0 0 32 32"
  >
    {' '}
    <mask
      id="mask0_349_3758"
      width="32"
      height="32"
      x="0"
      y="0"
      maskUnits="userSpaceOnUse"
      style={{ maskType: 'luminance' }}
    >
      {' '}
      <path fill="#fff" d="M32 0H0v32h32z"></path>{' '}
    </mask>{' '}
    <g mask="url(#mask0_349_3758)">
      {' '}
      <circle cx="16" cy="16" r="14" fill="#97BCFF"></circle>{' '}
      <path
        fill="#fff"
        d="M22.616 14.156h-.874l.576-1.668c.232-.677-.106-1.421-.758-1.662-.651-.24-1.369.11-1.6.787l-1.648 4.78-1.103-4.452a1.26 1.26 0 0 0-1.212-.975c-.57 0-1.071.403-1.212.975l-1.103 4.452-1.648-4.78c-.232-.677-.952-1.028-1.6-.787-.652.24-.99.985-.758 1.662l.576 1.668h-.874c-.692 0-1.253.582-1.253 1.3 0 .72.56 1.302 1.253 1.302h1.77l1.55 4.504c.185.536.68.888 1.238.862a1.265 1.265 0 0 0 1.156-.976L16 17.483l.908 3.665c.138.553.608.95 1.156.976h.057c.526 0 .999-.345 1.18-.862l1.551-4.504h1.77c.692 0 1.253-.582 1.253-1.301s-.56-1.301-1.253-1.301z"
      ></path>{' '}
    </g>{' '}
  </svg>
)
const VhclIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="32"
    height="32"
    fill="none"
    viewBox="0 0 32 32"
  >
    {' '}
    <mask
      id="mask0_359_3338"
      width="32"
      height="32"
      x="0"
      y="0"
      maskUnits="userSpaceOnUse"
      style={{ maskType: 'luminance' }}
    >
      {' '}
      <path fill="#fff" d="M32 0H0v32h32z"></path>{' '}
    </mask>{' '}
    <g mask="url(#mask0_359_3338)">
      {' '}
      <circle cx="16" cy="16" r="14" fill="#97BCFF"></circle>{' '}
      <path
        fill="#fff"
        d="M22.616 14.156h-.874l.576-1.668c.232-.677-.106-1.421-.758-1.662-.651-.24-1.369.11-1.6.787l-1.648 4.78-1.103-4.452a1.26 1.26 0 0 0-1.212-.975c-.57 0-1.071.403-1.212.975l-1.103 4.452-1.648-4.78c-.232-.677-.952-1.028-1.6-.787-.652.24-.99.985-.758 1.662l.576 1.668h-.874c-.692 0-1.253.582-1.253 1.3 0 .72.56 1.302 1.253 1.302h1.77l1.55 4.504c.185.536.68.888 1.238.862a1.265 1.265 0 0 0 1.156-.976L16 17.483l.908 3.665c.138.553.608.95 1.156.976h.057c.526 0 .999-.345 1.18-.862l1.551-4.504h1.77c.692 0 1.253-.582 1.253-1.301s-.56-1.301-1.253-1.301z"
      ></path>{' '}
      <circle cx="16" cy="16" r="14" fill="#97BCFF"></circle>{' '}
      <path
        stroke="#fff"
        strokeLinecap="round"
        strokeWidth="3"
        d="M11.188 15.996h9.625M16.004 11.188v9.625"
      ></path>{' '}
    </g>{' '}
  </svg>
)
const CardIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="32"
    height="32"
    fill="none"
    viewBox="0 0 32 32"
  >
    {' '}
    <mask
      id="mask0_359_4104"
      width="32"
      height="32"
      x="0"
      y="0"
      maskUnits="userSpaceOnUse"
      style={{ maskType: 'luminance' }}
    >
      {' '}
      <path fill="#fff" d="M32 0H0v32h32z"></path>{' '}
    </mask>{' '}
    <g mask="url(#mask0_359_4104)">
      {' '}
      <rect
        width="28"
        height="20"
        x="2"
        y="6"
        fill="#97BCFF"
        rx="2"
      ></rect>{' '}
      <path fill="#fff" d="M2 11h28v4H2z"></path>{' '}
    </g>{' '}
  </svg>
)
const DoneIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="32"
    height="32"
    fill="none"
    viewBox="0 0 32 32"
  >
    {' '}
    <mask
      id="mask0_359_4063"
      width="32"
      height="32"
      x="0"
      y="0"
      maskUnits="userSpaceOnUse"
      style={{ maskType: 'luminance' }}
    >
      {' '}
      <path fill="#fff" d="M32 0H0v32h32z"></path>{' '}
    </mask>{' '}
    <g mask="url(#mask0_359_4063)">
      {' '}
      <circle cx="16" cy="16" r="14" fill="#97BCFF"></circle>{' '}
      <path
        fill="#fff"
        d="M14.618 21.066c-.401 0-.783-.173-1.05-.476l-3.34-3.788a1.423 1.423 0 0 1 .119-1.998 1.395 1.395 0 0 1 1.981.119l2.206 2.501 4.608-6.114a1.397 1.397 0 0 1 1.967-.272c.618.473.738 1.361.27 1.983l-5.641 7.487c-.253.337-.646.54-1.064.558h-.056"
      ></path>{' '}
    </g>{' '}
  </svg>
)
const ArrowIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    fill="none"
    viewBox="0 0 24 24"
  >
    {' '}
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="m12 16.8 4.8-4.8L12 7.2M7.2 12h9.6"
    ></path>{' '}
  </svg>
)

export interface Row {
  sn: string // 순번
  rptpSn: string // 보고서일련번호
  rptpNm: string // 보고서명
  rptpSeCd: string // 보고서구분코드
  taskSeCd: string // 업무구분코드
  groupSeCd: string // 그룹구분코드
}

type listSearchObj = {
  page: number
  size: number
  searchStDate: string
  searchEdDate: string
  [key: string]: string | number
}

const DataList = () => {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(false)
  const [flag, setFlag] = useState<boolean>(false)

  const [selectedRow, setSelectedRow] = useState<Row | undefined>(undefined)
  const [open, setOpen] = useState<boolean>(false)

  const [params, setParams] = useState<listSearchObj>({
    page: 1,
    size: 9999, // 페이징 없이 한 번에 조회
    searchStDate: '',
    searchEdDate: '',
  })

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flag])

  const fetchData = async () => {
    setSelectedRow(undefined)
    setLoading(true)
    try {
      const page = params.page || 1
      const size = params.size || 9999

      let endpoint: string =
        `/fsm/star/ssr/cm/getAllStrctStatsRptpList?page=${page}&size=${size}` +
        `${(params as any).rptpNm ? '&rptpNm=' + (params as any).rptpNm : ''}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success' && response.data) {
        setRows(response.data.content ?? [])
      } else {
        setRows([])
      }
    } catch (e) {
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    setParams((prev) => ({ ...prev, [name]: value }))
  }

  const handleAdvancedSearch = (event: React.FormEvent) => {
    event.preventDefault()
    setFlag((prev) => !prev)
  }

  const handleActionClick = (row: Row) => {
    setSelectedRow(row)
    setOpen(true)
  }

  return (
    <PageContainer title="정형통계보고서" description="정형통계보고서">
      <Breadcrumb title="정형통계보고서" items={BCrumb} />

      {/* 검색영역 */}
      <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
        <Box className="sch-filter-box">
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-rptpNm"
              >
                보고서명
              </CustomFormLabel>
              <CustomTextField
                id="sch-rptpNm"
                name="rptpNm"
                value={(params as any).rptpNm || ''}
                onChange={handleSearchChange}
                fullWidth
              />
            </div>
          </div>
        </Box>
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <Button type="submit" variant="contained" color="primary">
              검색
            </Button>
          </div>
        </Box>
      </Box>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr 1fr',
          gap: '10px',
        }}
      >
        {rows.map((row) => (
          <div className="menu-link" key={row.rptpNm}>
            <Link href="javascript:;" onClick={() => handleActionClick(row)}>
              <div>
                {row.rptpSeCd === 'OPSAMT' ? (
                  <FuelIcon />
                ) : row.rptpSeCd === 'VHCL' ? (
                  <VhclIcon />
                ) : row.rptpSeCd === 'CARD' ? (
                  <CardIcon />
                ) : (
                  <DoneIcon />
                )}
              </div>
              <div className="menu-link-text">{row.rptpNm}</div>
              <div style={{ marginLeft: 'auto' }}>
                <ArrowIcon />
              </div>
            </Link>
          </div>
        ))}
      </div>

      <SearchModal
        open={open}
        handleClickClose={() => {
          setOpen(false)
        }}
        row={selectedRow}
      />

      <style jsx>{`
        .menu-link {
          font-weight: 600;
          text-decoration: none;
          transition: all 0.15s ease;
        }
        .menu-link :global(a) {
          border: 1px solid #c6d2e7;
          color: #232647;
          border-radius: 10px;
          height: 100%;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 20px;
        }
        .menu-link :global(a):hover {
          border: 2px solid #3d79e7;
          padding: 19px;
          background-color: #f8fcff;
          color: #3d79e7;
          text-decoration: none;
        }
        .menu-link :global(svg) {
          display: block;
        }
        .menu-link-text {
          color: #232647;
        }
      `}</style>
    </PageContainer>
  )
}

export default DataList

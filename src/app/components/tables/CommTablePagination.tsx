import * as React from 'react'
import { Grid, Box, Divider } from '@mui/material'

import { Pagination } from '@mui/material'
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import { number } from '@amcharts/amcharts4/core'

export type Tab = {
  value: string,
  label: string,
  active: boolean
}

interface PaginationProps {
  count: number
  page: number
  rowsPerPage: number
  onPageChange: (event: unknown, newPage: number) => void
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}

interface TableBottomToolbarProps {
  count: number
  select: number
  handleChangeSelect: (event: any) => void
}

function TableBottomToolbar(props: TableBottomToolbarProps) {
  // const { count, page, onPageChange, onRowsPerPageChange } = props;
  const selectData = [
    {
      value: 5,
      label: '5',
    },
    {
      value: 10,
      label: '10',
    },
    {
      value: 25,
      label: '25',
    },
  ];

  

  return (
    <div className="data-grid-bottom-toolbar">
      <div className="data-grid-select-count">총 {props.count}개</div>
      <CustomFormLabel className="input-label-none" htmlFor="data-grid-row-count-select">테이블 데이터 갯수</CustomFormLabel>
      <select
        id="data-grid-row-count-select"
        className="custom-default-select"
        value={props.select}
        onChange={props.handleChangeSelect}
      >
        {selectData.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="data-grid-row-count-select">줄씩보기</div>
    </div>
  );
}

const CommTablePagination = (props: PaginationProps) => {
  const { count, page, rowsPerPage, onPageChange, onRowsPerPageChange } = props;
  console.info('props : ',props)

  // Select
  const [select, setSelect] = React.useState(10);
  const handleChangeSelect = (event: any) => {
    setSelect(event.target.value);
  };

  return (
    <div>
      <div className="pagination-wrapper">
        <Pagination 
          count={Math.round(count/select)+1}
          variant="outlined"
          showFirstButton 
          showLastButton 
          page={page}
          onChange={onPageChange}
        />
      </div>

      <TableBottomToolbar 
        count={count}
        select={select}
        handleChangeSelect={handleChangeSelect}
      />
    </div>

  )
}

export default CommTablePagination;
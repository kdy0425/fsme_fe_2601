import React from 'react';

import { Box } from '@mui/system';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import NoData from '@/components/shared/NoData';

const columns: GridColDef<(typeof rows)[number]>[] = [
  { field: 'id', headerName: 'ID', width: 90 },
  {
    field: 'title',
    headerName: '제목',
    width: 500,
    editable: false,
  },
  {
    field: 'user',
    headerName: '작성자',
    width: 80,
    editable: false,
  },
  {
    field: 'count',
    headerName: '조회수',
    type: 'number',
    width: 80,
    editable: false,
  },
  {
    field: 'date',
    headerName: '게시날짜',
    type: 'number',
    width: 120,
    editable: false,
  },
];

function CustomNoRowsOverlay() {
  return (
    <NoData title="불러온 데이터가 없습니다."></NoData>
  );
}

const rows = [
  {
    id: 1,
    title: '제목제목제목제목제목제목제목제목제목제목제목제목1',
    user: '홍길동',
    count: '4,300',
    date: '2024-07-26',
  },
  {
    id: 2,
    title: '제목제목제목제목제목제목제목제목제목제목제목제목2',
    user: '홍길동',
    count: '4,300',
    date: '2024-07-26',
  },
  {
    id: 3,
    title: '제목제목제목제목제목제목제목제목제목제목제목제목3',
    user: '홍길동',
    count: '4,300',
    date: '2024-07-26',
  },
  {
    id: 4,
    title: '제목제목제목제목제목제목제목제목제목제목제목제목4',
    user: '홍길동',
    count: '4,300',
    date: '2024-07-26',
  },
  {
    id: 5,
    title: '제목제목제목제목제목제목제목제목제목제목제목제목5',
    user: '홍길동',
    count: '4,300',
    date: '2024-07-26',
  },
  {
    id: 6,
    title: '제목제목제목제목제목제목제목제목제목제목제목제목6',
    user: '홍길동',
    count: '4,300',
    date: '2024-07-26',
  },
  {
    id: 7,
    title: '제목제목제목제목제목제목제목제목제목제목제목제목7',
    user: '홍길동',
    count: '4,300',
    date: '2024-07-26',
  },
];

const DataGrid1 = () => {
  return (
    <Box sx={{ height: 374, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 5,
            },
          },
        }}
        pageSizeOptions={[5]}
        checkboxSelection
        disableRowSelectionOnClick
        slotProps={{ 
          pagination: { 
            labelRowsPerPage: '페이지당 행 수' ,
          } 
        }}
        slots={{ noRowsOverlay: CustomNoRowsOverlay }}
      />
    </Box>
  );
};

export default DataGrid1;
import React from 'react';

import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Typography,
  Avatar,
  AvatarGroup,
  Badge,
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import CustomCheckbox from '@/app/components/forms/theme-elements/CustomCheckbox';
import { Stack } from '@mui/system';
import { EnhancedTableData, EnTableType } from '@/app/components/tables/tableData';


// MUI 그리드 한글화 import
import { createTheme, ThemeProvider, useTheme } from '@mui/material/styles';
import * as locales from '@mui/material/locale';
type SupportedLocales = keyof typeof locales;


function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }

  return 0;
}
const rows: EnTableType[] = EnhancedTableData;

type Order = 'asc' | 'desc';

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key,
): (a: { [key in Key]: number | string }, b: { [key in Key]: number | string }) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort<T>(array: any[], comparator: (a: T, b: T) => number) {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }

    return a[1] - b[1];
  });

  return stabilizedThis.map((el) => el[0]);
}

interface HeadCell {
  disablePadding: boolean;
  id: any;
  label: string;
  numeric: boolean;
}

const headCells: HeadCell[] = [
  {
    id: 'name',
    numeric: false,
    disablePadding: false,
    label: '팀 리더',
  },
  {
    id: 'pname',
    numeric: false,
    disablePadding: false,
    label: '프로젝트 이름',
  },
  {
    id: 'team',
    numeric: false,
    disablePadding: false,
    label: '팀',
  },
  {
    id: 'status',
    numeric: false,
    disablePadding: false,
    label: '상태',
  },
  {
    id: 'weeks',
    numeric: false,
    disablePadding: false,
    label: '주',
  },
  {
    id: 'budget',
    numeric: false,
    disablePadding: false,
    label: '예산',
  },
];

interface EnhancedTableProps {
  numSelected: number;
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof []) => void;
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
  order: Order;
  orderBy: string;
  rowCount: number;
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } = props;
  const createSortHandler = (property: keyof []) => (event: React.MouseEvent<unknown>) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <CustomCheckbox
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            tabIndex={-1}
            inputProps={{
              'aria-labelledby': 'select all desserts',
            }}
          />
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              <div className="table-head-text">
                {headCell.label}
              </div>
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

function TableTopToolbar() {
  return (
    <div className="data-grid-top-toolbar">
      <div className="data-grid-search-count">
        검색 결과 <span className="search-count">24</span>건
      </div>
      <ul className="data-grid-sort-count">
        <li>
          <strong className="data-grid-sort-label">정렬기준</strong>
          <div className="data-grid-sort-btn">
            <button type="button" className="active">관련도순</button>
            <button type="button">최신순</button>
            <button type="button">인기순</button>
          </div>
        </li>
      </ul>
    </div>
  );
}

interface TableBottomToolbarProps {
  numSelected: number;
}

function TableBottomToolbar(props: TableBottomToolbarProps) {
  const { numSelected } = props;

  return (
    <div className="data-grid-bottom-toolbar">
      {numSelected > 0 ? (
        <div className="data-grid-select-count action">
          총 {numSelected}건 선택
        </div>
      ) : (
        <div className="data-grid-select-count">
          총 0건 선택
        </div>
      )}
    </div>
  );
}

const CustomDataGrid1 = () => {
  const [order, setOrder] = React.useState<Order>('asc');
  const [orderBy, setOrderBy] = React.useState<any>('calories');
  const [selected, setSelected] = React.useState<readonly string[]>([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  const handleRequestSort = (event: React.MouseEvent<unknown>, property: keyof []) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelecteds = rows.map((n) => n.name);
      setSelected(newSelecteds);

      return;
    }
    setSelected([]);
  };

  const handleClick = (event: React.MouseEvent<unknown>, name: string) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected: readonly string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    setSelected(newSelected);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const isSelected = (name: string) => selected.indexOf(name) !== -1;

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  // MUI 그리드 한글화
  const [locale, setLocale] = React.useState<SupportedLocales>('koKR');
  const theme = useTheme();
  const themeWithLocale = React.useMemo(
    () => createTheme(theme, locales[locale]),
    [locale, theme],
  );

  return (
    // MUI 한글화 "ThemeProvider"
    <ThemeProvider theme={themeWithLocale}> 
      <div className="data-grid-wrapper">

        <TableTopToolbar />
        
        <TableContainer>
          <Table
            sx={{ minWidth: 750 }}
            aria-labelledby="tableTitle"
            size={'small'}
          >
            <EnhancedTableHead
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={rows.length}
            />
            <TableBody>
              {stableSort(rows, getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row: any, index) => {
                  const isItemSelected = isSelected(row.name);
                  const labelId = `enhanced-table-checkbox-${index}`;

                  return (
                    <TableRow
                      hover
                      onClick={(event) => handleClick(event, row.name)}
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={row.id}
                      selected={isItemSelected}
                    >
                      <TableCell padding="checkbox">
                        <CustomCheckbox
                          checked={isItemSelected}
                          inputProps={{
                            'aria-labelledby': labelId,
                          }}
                        />
                      </TableCell>
                      <TableCell className="td-left">
                        <Stack spacing={2} direction="row">
                          <Avatar
                            alt="text"
                            src={row.imgsrc}
                            sx={{
                              width: '35px',
                              height: '35px',
                            }}
                          />
                          <Box>
                            <Typography variant="h6" fontWeight="600">
                              {row.name}
                            </Typography>
                            <Typography color="textSecondary" variant="subtitle2">
                              {row.email}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography color="textSecondary" variant="subtitle2" fontWeight="400">
                          {row.pname}
                        </Typography>
                      </TableCell>
                      <TableCell className="td-left">
                        <Stack direction="row">
                          <AvatarGroup>
                            {row.teams.map((team: any) => (
                              <Avatar
                                key={team.id}
                                sx={{
                                  width: '35px',
                                  height: '35px',
                                  bgcolor: team.color,
                                }}
                              >
                                {team.text}
                              </Avatar>
                            ))}
                          </AvatarGroup>
                        </Stack>
                      </TableCell>
                      <TableCell className="td-left">
                        <Stack spacing={1} direction="row" alignItems="center">
                          <Badge
                            color={
                              row.status === 'Active'
                                ? 'success'
                                : row.status === 'Pending'
                                ? 'warning'
                                : row.status === 'Completed'
                                ? 'primary'
                                : row.status === 'Cancel'
                                ? 'error'
                                : 'secondary'
                            }
                            variant="dot"
                          ></Badge>
                          <Typography color="textSecondary" variant="body1">
                            {row.status}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography color="textSecondary" variant="body1">
                          {row.weeks}
                        </Typography>
                      </TableCell>
                      <TableCell className="td-left">
                        <Typography variant="h6">${row.budget}k</Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />

        <TableBottomToolbar numSelected={selected.length} />

      </div>
    </ThemeProvider>
  );
};

export default CustomDataGrid1;

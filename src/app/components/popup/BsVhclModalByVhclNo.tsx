import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, Button, Box, CircularProgress, IconButton } from '@mui/material';
import { IconX } from '@tabler/icons-react';
import { CustomFormLabel } from '@/utils/fsms/fsm/mui-imports';
import TableDataGrid from '@/app/components/tables/CommDataGrid2';
import { brNoFormatter, getCommaNumber } from '@/utils/fsms/common/util';


interface BsVhclModalByVhclNoProps {
  open: boolean;
  onClose: () => void;
  onApprove: (selectedVhclNoList: string[], totalTransCnt: number, selectedTransCnt: number) => void;
  vehicleList: { vhclNo: string; [key: string]: any }[];
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number, pageSize: number) => void;
  loading?: boolean;
  allVehicleList?: string[]; // 전체 차량 목록 prop 추가
  allVehicleData?: any[]; // 전체 차량 데이터 prop 추가
}

const BsVhclModalByVhclNo: React.FC<BsVhclModalByVhclNoProps> = ({
  open,
  onClose,
  onApprove,
  vehicleList,
  page,
  pageSize,
  total,
  onPageChange,
  loading = false,
  allVehicleList = [], // 기본값 설정
  allVehicleData = [], // 기본값 설정
}) => {
  const [selectedVhclNos, setSelectedVhclNos] = useState<string[]>([]); // 선택된 차량 목록
  const [localPage, setLocalPage] = useState(page); // 로컬 페이지 상태 (즉시 반영용)
  const [localPageSize, setLocalPageSize] = useState(pageSize); // 로컬 페이지 크기 상태
  
  // 부모의 페이지 상태가 변경되면 로컬 상태도 동기화
  useEffect(() => {
    setLocalPage(page);
    setLocalPageSize(pageSize);
  }, [page, pageSize]);
  
  // 모달이 열릴 때 전체 차량을 기본적으로 선택된 상태로 설정
  useEffect(() => {
    if (open && allVehicleList.length > 0) {
      setSelectedVhclNos(allVehicleList);
    }
  }, [open, allVehicleList]);

  // 모달이 닫힐 때 상태 초기화
  useEffect(() => {
    if (!open) {
      setSelectedVhclNos([]);
      setLocalPage(1);
      setLocalPageSize(10);
    }
  }, [open]);

  const handleApprove = () => {
    
    if (selectedVhclNos.length === 0) {
      alert('선택된 차량이 없습니다.');
      return;
    }
    
    // 전체 거래건수 계산 (전체 데이터 기준)
    const totalTransCnt = allVehicleData.reduce((sum, vehicle) => {
      return sum + (parseInt(vehicle.transCnt) || 0);
    }, 0);
    
    // 선택된 차량의 거래건수 계산 (전체 데이터에서 선택된 차량들만 필터링)
    const selectedTransCnt = allVehicleData
      .filter(vehicle => selectedVhclNos.includes(vehicle.vhclNo))
      .reduce((sum, vehicle) => {
        return sum + (parseInt(vehicle.transCnt) || 0);
      }, 0);
    
    const confirmMessage = `전체 ${allVehicleList.length}개 차량(거래건수 ${totalTransCnt}건) 중\n${selectedVhclNos.length}개 차량(거래건수 ${selectedTransCnt}건)을 확정하시겠습니까?`;
      
    if (confirm(confirmMessage)) {
      onApprove(selectedVhclNos, totalTransCnt, selectedTransCnt);
    }
  };

  // row index -> vhclNo 매핑 (현재 vehicleList 기준)
  const getVhclNoByTrId = (trId: string) => {
    const idx = parseInt(trId.replace('tr', ''), 10);
    return vehicleList[idx]?.vhclNo;
  };
  // 체크박스 컬럼을 detail table과 동일하게 추가
  const headCells = [
    { id: 'checkbox', numeric: false, disablePadding: false, label: 'checkbox', format: 'checkbox' },
    { id: 'bzentyNm', numeric: false, disablePadding: false, label: '업체명' },
    { id: 'vhclNo', numeric: false, disablePadding: false, label: '차량번호' },
    { id: 'transCnt', numeric: true, disablePadding: false, label: '거래건수' },
    { id: 'sumFuelQty', numeric: true, disablePadding: false, label: '연료량합계' },
    { id: 'sumAsstAmt', numeric: true, disablePadding: false, label: '보조금합계' },
    { id: 'vhclSeNm', numeric: false, disablePadding: false, label: '면허업종' },
    { id: 'locgovNm', numeric: false, disablePadding: false, label: '관할관청' },
    { id: 'brno', numeric: false, disablePadding: false, label: '사업자번호' },
    { id: 'carmdlTypeNm', numeric: false, disablePadding: false, label: '차종' },
    { id: 'koiNm', numeric: false, disablePadding: false, label: '유종' },
    { id: 'dlngYm', numeric: false, disablePadding: false, label: '거래년월' },
  ];
  // 현재 페이지 데이터에 체크 상태 반영
  const pagedRows = vehicleList.map((row) => ({ 
    ...row, 
    chk: selectedVhclNos.includes(row.vhclNo) ? '1' : '0',
    sumFuelQty: getCommaNumber(row.sumFuelQty) || row.sumFuelQty, 
    sumAsstAmt: getCommaNumber(row.sumAsstAmt) || row.sumAsstAmt,
    brno: brNoFormatter(row.brno) ?? row.brno 
  }));

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
    >
      <DialogContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <CustomFormLabel className="input-label-display">
            <h2>차량별 일괄확정</h2>
          </CustomFormLabel>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Button variant="contained" color="primary" onClick={handleApprove}>
              확정
            </Button>
            <Button variant="contained" color="dark" onClick={onClose}>
              취소
            </Button>
          </Box>
          <IconButton 
            onClick={onClose}
            sx={{ 
              position: 'absolute', 
              right: 8, 
              top: 8,
              color: 'grey.500'
            }}
          >
            <IconX />
          </IconButton>
        </Box>
        
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress />
          </Box>
        ) : (
          <TableDataGrid
            headCells={headCells}
            rows={pagedRows}
            totalRows={total}
            loading={loading}
            onPaginationModelChange={(newPage, newPageSize) => {
              // 로컬 상태 즉시 업데이트하여 즉각적인 피드백 제공
              setLocalPage(newPage);
              setLocalPageSize(newPageSize);
              // 실제 데이터 로드 요청
              onPageChange(newPage, newPageSize);
            }}
            pageable={{ pageNumber: localPage, pageSize: localPageSize, totalPages: Math.ceil(total / localPageSize) }}
            paging={true} // 페이징 항상 활성화
            onCheckChange={(ids) => {
              const currentPageVhclNos = vehicleList.map(v => v.vhclNo);
              const checkedVhclNos = ids.map(getVhclNoByTrId).filter((v): v is string => !!v);
              
              console.log('체크박스 변경:', {
                currentPageVhclNos,
                checkedVhclNos,
                ids
              })
              
              // 전체 선택된 차량 목록에서 현재 페이지 차량들은 제거하고, 새로 체크된 차량들만 추가
              setSelectedVhclNos(prev => {
                // 다른 페이지의 선택된 차량들은 유지 (현재 페이지 차량들은 제외)
                const otherPageSelected = prev.filter(vhclNo => !currentPageVhclNos.includes(vhclNo));
                
                // 현재 페이지에서 체크된 차량들 추가
                const newSelected = [...otherPageSelected, ...checkedVhclNos];
                
                return newSelected
              });
            }}
            caption={'차량별 일괄확정 목록'}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BsVhclModalByVhclNo;
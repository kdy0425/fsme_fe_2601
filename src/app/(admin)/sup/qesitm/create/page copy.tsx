'use client'
import PageContainer from '@/app/components/container/PageContainer'
import { CommSelect } from '@/app/components/tx/commSelect/CommSelect'
import { useSelector } from '@/store/hooks'
import { AppState } from '@/store/store'
import { Breadcrumb, CustomFormLabel, CustomTextField } from '@/utils/fsms/fsm/mui-imports'
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material'
import { uniqueId } from 'lodash'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Row } from '../page'

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '업무지원',
  },
  {
    title: '설문조사',
  },
  {
    to: '/sup/qesitm',
    title: '문항관리 신규등록',
  },
]

interface SrvyItemType {
  srvyCycl: number; // 차수
  srvyQitemSn: number; // 설문문항일련번호
  qstnChcArtclCn: string; // 질문선택항목내용
  chcArtclSn: number; // 선택항목일련번호
  chcArtclScorScr: number; // 선택항목배점점수
  sbjctvYn: string; // 주관식여부
}

const SrvyCreatePage_Temp = () => {
  const router = useRouter() // 화면이동을 위한객체
  const querys = useSearchParams() // 쿼리스트링

  const cycle:number = useSelector( // 다음 차수
    (state: AppState) => state.surveyInfo['nextSrvyCycl'],
  )

  const [qParams, setQParams] = useState<SrvyItemType>({
    srvyCycl: cycle, // 차수
    srvyQitemSn: 0, // 설문문항일련번호
    qstnChcArtclCn: '', // 질문선택항목내용
    chcArtclSn: 0, // 선택항목일련번호
    chcArtclScorScr: 0, // 선택항목배점점수
    sbjctvYn: 'N'
  })

  const [itemParams, setItemParams] = useState<SrvyItemType>({
    srvyCycl: cycle, // 차수
    srvyQitemSn: 0, // 설문문항일련번호
    qstnChcArtclCn: '', // 질문선택항목내용
    chcArtclSn: 0, // 선택항목일련번호
    chcArtclScorScr: 0, // 선택항목배점점수
    sbjctvYn: 'N'
  })

  // const [formData, setFormData] = useState<Row>({
    
  // })

  const [QList, setQList] = useState<SrvyItemType[]>([]); // 문항항목
  const [itemList, setItemList] = useState<SrvyItemType[]>([]); // 선택항목
  const [selectedQ, setSelectedQ] = useState<number>(-1);
  const [selectedItem, setSelectedItem] = useState<number>(-1);

  const [childrenItems, setChildrenItems] = useState<SrvyItemType[]>([]);

  useEffect(() => {
    console.log('QParam :: ', qParams);
    console.log('itemParams :: ', itemParams);
    console.log('QList :: ', QList);
    console.log('itemList :: ', itemList);
    console.log('CYCLE :: ', cycle);
  },[qParams, itemParams, QList, itemList, cycle])

  const handleQParamChange = (
    event:React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const {name, value} = event.target;

    setQParams((prev) => ({ ...prev, [name]: value }));
  }

  const handleItemParamChange = (
    event:React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const {name, value} = event.target;

    setItemParams((prev) => ({ ...prev, [name]: value }));
  }

  // 문항 추가
  const handleQListAdd = () => {
    if(!qParams.qstnChcArtclCn) {
      alert('문항내용을 입력해주세요.')
      return;
    }

    let newArr = [...QList];

    newArr.push(qParams);

    // 항목 일련번호 할당
    newArr.map((item, index) => {
      item.srvyQitemSn = index + 1
    })

    setQList(newArr);
    setQParams({
      srvyCycl: cycle, // 차수
      srvyQitemSn: 0, // 설문문항일련번호
      qstnChcArtclCn: '', // 질문선택항목내용
      chcArtclSn: 0, // 선택항목일련번호
      chcArtclScorScr: 0, // 선택항목배점점수
      sbjctvYn: 'N'
    })
  }

  // 문항 제거
  const handleQlistRemove = () => {
    if(selectedQ > -1) {
      let newArr = [...QList];
      let itemArr = [...itemList];
  
      // 하위 선택항목도 삭제
      itemArr = itemArr.filter(item => item.srvyQitemSn !== QList[selectedQ].srvyQitemSn)

      newArr = newArr.filter((item, index) => index !== selectedQ);
      
      // 항목 일련번호 재할당
      newArr.map((item, index) => {
        item.srvyQitemSn = index + 1
      })
  
      setSelectedQ(-1);
      setQList(newArr);
      setQParams({
        srvyCycl: cycle, // 차수
        srvyQitemSn: 0, // 설문문항일련번호
        qstnChcArtclCn: '', // 질문선택항목내용
        chcArtclSn: 0, // 선택항목일련번호
        chcArtclScorScr: 0, // 선택항목배점점수
        sbjctvYn: 'N'
      })
      setItemList(itemArr);
    }
  }

  // 선택항목 추가
  const handleItemAdd = () => {
    if(selectedQ > -1 && QList[selectedQ].srvyQitemSn) {
      let newArr = [...itemList];

      newArr.push(itemParams);

      newArr.map((item, index) => {
        item.chcArtclSn = index + 1
      })
  
      setItemList(newArr);

      setItemParams({
        srvyCycl: cycle, // 차수
        srvyQitemSn: QList[selectedQ].srvyQitemSn, // 설문문항일련번호
        qstnChcArtclCn: '', // 질문선택항목내용
        chcArtclSn: 0, // 선택항목일련번호
        chcArtclScorScr: 0, // 선택항목배점점수
        sbjctvYn: ''
      })
    }
  }

  // 선택항목 제거
  const handleItemRemove = () => {
    if(selectedItem > -1) {
      let newArr = [...itemList];
  
      newArr = newArr.filter((item) => 
        item.srvyQitemSn !== QList[selectedQ].srvyQitemSn && 
        item.chcArtclSn !== itemList[selectedItem].chcArtclSn
      );
      
      // // 선택항목 일련번호 재할당
      // newArr.map((item, index) => {
      //   item.chcArtclSn = index + 1
      // })
  
      setSelectedItem(-1);
      setItemList(newArr);
    }
  }

  const handleQClick = (index: number) => {
    setSelectedQ(index);
    setQParams(QList[index]);
  }

  const handleItemClick = (index:number) => {
    setSelectedItem(index);
    setItemParams(itemList[index]);
  }

  useEffect(() => {
    if(selectedQ > -1) {  
      let tempArr = itemList.filter(item => item.srvyQitemSn == selectedQ + 1)

      setItemParams((prev) => ({
        ...prev,
        srvyQitemSn: QList[selectedQ].srvyQitemSn,
      }))

      setChildrenItems(tempArr);
    }
  }, [itemList, selectedQ])

  // useEffect(() => {
  //   setItemParams((prev) => ({
  //     ...prev,
  //     chcArtclSn: childrenItems.length + 1,
  //   }))
  // }, [childrenItems])

  return (
    <PageContainer title="문항관리 신규등록" description="문항관리 신규등록">
      <Breadcrumb title="문항관리" items={BCrumb} />

      <Box component="form" onSubmit={() => {}} >
        <TableContainer sx={{ mb: 4 }}>
          <Table className="table table-bordered">
            <colgroup>
              <col style={{ width: '200px' }} />
              <col style={{ width: 'auto' }} />
              <col style={{ width: '200px' }} />
              <col style={{ width: '200px' }} />
              <col style={{ width: '200px' }} />
              <col style={{ width: '200px' }} />
            </colgroup>
            <TableBody>
              <TableRow>
                <th className="td-head td-left" scope="row">
                  설문제목
                </th>
                <TableCell>
                  <CustomTextField fullWidth/>
                </TableCell>
                <th className="td-head td-left" scope="row">
                  설문조사
                </th>
                <TableCell>
                  <CustomTextField type='date' fullWidth/>
                </TableCell>
                <th className="td-head td-left" scope="row">
                  개인법인
                </th>
                <TableCell>
                  <CustomTextField type='date' fullWidth/>
                </TableCell>
              </TableRow>
              <TableRow>
                <th className="td-head td-left" scope="row">
                  설문안내메시지
                </th>
                <TableCell colSpan={5}>
                  <CustomTextField  multiline rows={5} fullWidth/>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

        </TableContainer>

        <TableContainer sx={{ mb: '100px' }}>
          <CustomFormLabel className="input-label-display" style={{width:'50% !important', margin:'10px 0 0 0'}}>
            <h3>설문 문항</h3>
          </CustomFormLabel>
          <Table className="table table-bordered">
            <TableHead>
              <TableCell className="table-head-text" sx={{width:'10%'}}>
                번호
              </TableCell>
              <TableCell className="table-head-text">
                문항 내용
              </TableCell>
              <TableCell className="table-head-text" sx={{width:'10%'}}>
                주관식
              </TableCell>
              <TableCell className="table-head-text" sx={{width:'10%'}}>
                배점
              </TableCell>
            </TableHead>
            <TableBody>
              {
                QList.map((item, index) => (
                  <TableRow onClick={() => handleQClick(index)} selected={index == selectedQ} hover style={{cursor:'pointer'}}>
                    {/* <TableCell className='td-center'>{item.srvyQitemSn}</TableCell> */}
                    <TableCell className='td-center'>{index + 1}</TableCell>
                    <TableCell style={{whiteSpace:'pre-wrap'}}>{item.qstnChcArtclCn}</TableCell>
                    <TableCell className='td-center'>{item.sbjctvYn == 'N' ? '미포함' : '포함'}</TableCell>
                    <TableCell className='td-center'>{item.chcArtclScorScr}</TableCell>
                  </TableRow>
                ))
              }
            </TableBody>
          </Table>
        </TableContainer>

        <TableContainer sx={{ mb: '100px' }}>
          <CustomFormLabel className="input-label-display" style={{width:'50% !important', margin:'10px 0 0 0'}}>
            <h3>문항별 선택항목 정보</h3>
          </CustomFormLabel>
          <Table className="table table-bordered">
            <TableHead>
              <TableCell className="table-head-text" sx={{width:'10%'}}>
                번호
              </TableCell>
              <TableCell className="table-head-text">
                선택항목 내용
              </TableCell>
              <TableCell className="table-head-text" sx={{width:'10%'}}>
                배점
              </TableCell>
            </TableHead>
            <TableBody>
              {
                selectedQ > -1 && itemList.filter((item) => item.srvyQitemSn === QList[selectedQ].srvyQitemSn)
                .map((item, index) => (
                  <TableRow onClick={() => handleItemClick(index)} selected={index == selectedItem} hover style={{cursor:'pointer'}}>
                    {/* <TableCell className='td-center'>{item.chcArtclSn}</TableCell> */}
                    <TableCell className='td-center'>{index + 1}</TableCell>
                    <TableCell style={{whiteSpace:'pre-wrap'}}>{item.qstnChcArtclCn}</TableCell>
                    <TableCell className='td-center'>{item.chcArtclScorScr}</TableCell>
                  </TableRow>
                ))

                // childrenItems.map((item, index) => (
                //   <TableRow onClick={() => handleItemClick(index)} selected={index == selectedItem} hover style={{cursor:'pointer'}}>
                //     {/* <TableCell className='td-center'>{item.chcArtclSn}</TableCell> */}
                //     <TableCell className='td-center'>{index + 1}</TableCell>
                //     <TableCell style={{whiteSpace:'pre-wrap'}}>{item.qstnChcArtclCn}</TableCell>
                //     <TableCell className='td-center'>{item.chcArtclScorScr}</TableCell>
                //   </TableRow>
                // ))
              }
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display:'flex', justifyContent:'space-between', mb: 2}}>
          <TableContainer sx={{mr: 2 }}>
            <Box className='table-bottom-button-group'>
              <CustomFormLabel className="input-label-display" style={{width:'50% !important'}}>
                <h3>문항 처리</h3>
              </CustomFormLabel>
              <Box className=" button-right-align">
                <Button onClick={handleQListAdd}>문항추가</Button>
                <Button onClick={handleQlistRemove}>문항삭제</Button>
                <Button>문항저장</Button>
              </Box>
            </Box>
            <Table className="table table-bordered" sx={{minHeight: '100px'}}>
              <TableBody>
                <TableRow>
                  <th>문항내용</th>
                  <TableCell colSpan={3}>
                    <CustomTextField name='qstnChcArtclCn' value={qParams.qstnChcArtclCn} onChange={handleQParamChange} multiline rows={3} fullWidth/>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <th>배점</th>
                  <TableCell>
                    <CustomTextField name='chcArtclScorScr' value={qParams.chcArtclScorScr} onChange={handleQParamChange} fullWidth />
                  </TableCell>
                  <th>주관식</th>
                  <TableCell>
                    <CommSelect 
                      cdGroupNm={'786'} 
                      pValue={qParams.sbjctvYn} 
                      handleChange={handleQParamChange} 
                      pName={'sbjctvYn'}
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <TableContainer sx={{ml:2}}>
            <Box className='table-bottom-button-group'>
              <CustomFormLabel className="input-label-display" style={{width:'50% !important'}}>
                <h3>선택항목 처리</h3>
              </CustomFormLabel>
              <Box className=" button-right-align">
                <Button onClick={handleItemAdd}>항목추가</Button>
                <Button onClick={handleItemRemove}>항목삭제</Button>
                <Button>항목저장</Button>
              </Box>
            </Box>
            <Table className='table table-bordered' sx={{minHeight: '100px'}}>
              <TableBody>
                <TableRow>
                  <th>선택문항 내용</th>
                  <TableCell>
                    <CustomTextField name='qstnChcArtclCn' value={itemParams.qstnChcArtclCn} onChange={handleItemParamChange} multiline rows={3} fullWidth/>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <th>배점</th>
                  <TableCell>
                    <CustomTextField name='chcArtclScorScr' value={itemParams.chcArtclScorScr} onChange={handleItemParamChange} fullWidth/>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
        <Box className='table-bottom-button-group' style={{marginTop: '50px'}}>
          <Box className=" button-right-align">
              <Button>저장</Button>
              <Button>취소</Button>
          </Box>
        </Box>
      </Box>
    </PageContainer>
  )
}

export default SrvyCreatePage_Temp
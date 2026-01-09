'use client'
import PageContainer from '@/app/components/container/PageContainer'
import { CommSelect } from '@/app/components/tx/commSelect/CommSelect'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { getDateTimeString } from '@/utils/fsms/common/util'
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
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getFormatToday, isNumber } from '@/utils/fsms/common/comm'
import { trim } from 'lodash'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

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
    title: '문항관리 수정',
  },
]

interface SrvyInfoType {
  srvyCycl: number
  srvyTtl: string;
  srvyGdMsgCn: string;
  srvyBgngYmd: string;
  srvyEndYmd: string;
}

interface SrvyItemType {
  srvyCycl: number; // 차수
  srvyQitemSn: number; // 설문문항일련번호
  qstnChcArtclCn: string; // 질문선택항목내용
  chcArtclSn: number; // 선택항목일련번호
  chcArtclScorScr: number; // 선택항목배점점수
  sbjctvYn: string; // 주관식여부
  itemArr: SrvyItemType[];
}

const SrvyUpdatePage = () => {
  const router = useRouter() // 화면이동을 위한객체
  const pathName = usePathname()

  const [cycle, setCycle] = useState<number>(0);

  const [srvyInfo, setSrvyInfo] = useState<SrvyInfoType>({
    srvyCycl: cycle,
    srvyTtl: '',
    srvyGdMsgCn: '',
    srvyBgngYmd: '',
    srvyEndYmd: ''
  })

  const [qParams, setQParams] = useState<SrvyItemType>({
    srvyCycl: cycle, // 차수
    srvyQitemSn: 1, // 설문문항일련번호
    qstnChcArtclCn: '', // 질문선택항목내용
    chcArtclSn: 0, // 선택항목일련번호
    chcArtclScorScr: 0, // 선택항목배점점수
    sbjctvYn: 'N',
    itemArr: []
  })

  const [itemParams, setItemParams] = useState<SrvyItemType>({
    srvyCycl: cycle, // 차수
    srvyQitemSn: 0, // 설문문항일련번호
    qstnChcArtclCn: '', // 질문선택항목내용
    chcArtclSn: 0, // 선택항목일련번호
    chcArtclScorScr: 0, // 선택항목배점점수
    sbjctvYn: 'N',
    itemArr:[]
  })

  const [QList, setQList] = useState<SrvyItemType[]>([]); // 문항항목
  const [selectedQ, setSelectedQ] = useState<number>(-1);
  const [selectedItem, setSelectedItem] = useState<number>(-1);

  const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 저장시 로딩상태

  useEffect(() => {
    const pathArr:string[] = pathName.split('/');

    setCycle(Number(pathArr[pathArr.length-1]))
  }, [])

  useEffect(() => {
    if(cycle > 0) {
      fetchData()
      getQList()
    }
  }, [cycle])


  const handleSrvyInfoChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target
    if (name === 'srvyBgngYmd' || name === 'srvyEndYmd') {
      const otherDateField =
        name === 'srvyBgngYmd' ? 'srvyEndYmd' : 'srvyBgngYmd'
      const otherDate = srvyInfo[otherDateField]

      const today = new Date();
      
      if(value < today.toISOString().split('T')[0]){
        alert('시작,종료일자는 오늘 이전 날짜는 선택할 수 없습니다.')
        return;
      }

      if (isValidDateRange(name, value, otherDate)) {
        setSrvyInfo((prev) => ({ ...prev, [name]: value }))
      } else {
        alert('종료일은 시작일보다 빠를 수 없습니다.')
      }
    } else {
      
      if(name === 'chcArtclScorScr') {
        if(!isNaN(Number(value))){
          return;
        }
      }

      setSrvyInfo((prev) => ({ ...prev, [name]: value }))
    }
  }

  // 시작일과 종료일 비교
  const isValidDateRange = (
    changedField: string,
    changedValue: string,
    otherValue: string | undefined,
  ): boolean => {
    if (!otherValue) return true

    const changedDate = new Date(changedValue)
    const otherDate = new Date(otherValue)

    if (changedField === 'srvyBgngYmd') {
      return changedDate <= otherDate
    } else {
      return changedDate >= otherDate
    }
  }



  const handleQParamChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const {name, value} = event.target;

    if (name === 'chcArtclScorScr') {
      if (isNumber(value)) {
        setQParams((prev) => ({ ...prev, [name]: Number(value) }));
      }      
    } else {
      setQParams((prev) => ({ ...prev, [name]: value }));
    }
  }

  const handleItemParamChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const {name, value} = event.target;

    if (name === 'chcArtclScorScr') {
      if (isNumber(value)) {
        setItemParams((prev) => ({ ...prev, [name]: Number(value) }));  
      }
    } else {
      setItemParams((prev) => ({ ...prev, [name]: value }));
    } 
  }

  // 문항 추가
  const handleQListAdd = () => {
    if(!trim(qParams.qstnChcArtclCn)) {
      alert('문항내용을 입력해주세요.')
      return;
    }

    let newArr = [...QList];

    const newQ = {
      srvyCycl: cycle, // 차수
      srvyQitemSn: QList.length > 0 ? QList[QList?.length - 1]?.srvyQitemSn + 1 : 1, // 설문문항일련번호
      qstnChcArtclCn: qParams.qstnChcArtclCn, // 질문선택항목내용
      chcArtclSn: qParams.chcArtclSn, // 선택항목일련번호
      chcArtclScorScr: qParams.chcArtclScorScr, // 선택항목배점점수
      sbjctvYn: qParams.sbjctvYn,
      itemArr: []
    }


    newArr.push(newQ);

    setQList(newArr);
    setQParams({
      srvyCycl: cycle, // 차수
      srvyQitemSn: 0, // 설문문항일련번호
      qstnChcArtclCn: '', // 질문선택항목내용
      chcArtclSn: 0, // 선택항목일련번호
      chcArtclScorScr: 0, // 선택항목배점점수
      sbjctvYn: 'N',
      itemArr: []
    })
  }

  // 문항 제거
  const handleQlistRemove = () => {
    if(selectedQ > -1) {
      let newArr = [...QList];
  
      newArr = newArr.filter((item, index) => index !== selectedQ);
      
      // 항목 일련번호 재할당
      newArr.map((item, index) => {
        item.srvyQitemSn = index + 1
        item.itemArr?.map((itemAr) => {
          itemAr.srvyQitemSn = index + 1
        })
      })
  
      setSelectedQ(-1);
      setSelectedItem(-1);
      setQList(newArr);
      setQParams({
        srvyCycl: cycle, // 차수
        srvyQitemSn: 1, // 설문문항일련번호
        qstnChcArtclCn: '', // 질문선택항목내용
        chcArtclSn: 0, // 선택항목일련번호
        chcArtclScorScr: 0, // 선택항목배점점수
        sbjctvYn: 'N',
        itemArr: []
      })
    }
  }

  // 선택항목 추가
  const handleItemAdd = () => {
    if (selectedQ > -1 && QList[selectedQ].srvyQitemSn) {

      if (!trim(itemParams.qstnChcArtclCn)) {
        alert('선택문항 내용을 입력해주세요.')
        return;
      }

      let itemArr = QList[selectedQ].itemArr

      let newArr = [...itemArr]; // 선택문항 Array

      const newItems = {
        srvyCycl: cycle, // 차수
        srvyQitemSn: QList[selectedQ].srvyQitemSn, // 설문문항일련번호
        qstnChcArtclCn: itemParams.qstnChcArtclCn, // 질문선택항목내용
        chcArtclSn: itemArr.length > 0 ? itemArr[itemArr?.length - 1]?.chcArtclSn + 1 : 1, // 선택항목일련번호
        chcArtclScorScr: itemParams.chcArtclScorScr, // 선택항목배점점수
        sbjctvYn: itemParams.sbjctvYn,
        itemArr: []
      }

      newArr.push(newItems);

      setQList((prev) =>
        prev.map((obj) => {
          if (obj.srvyQitemSn === QList[selectedQ].srvyQitemSn) {
            const hasY = newArr.some(item => item.sbjctvYn === 'Y');
      
            return {
              ...obj,
              sbjctvYn: hasY ? 'Y' : 'N', 
              itemArr: newArr, 
            };
          }
          return obj; 
        }) )

      setItemParams({
        srvyCycl: cycle, // 차수
        srvyQitemSn: 0, // 설문문항일련번호
        qstnChcArtclCn: '', // 질문선택항목내용
        chcArtclSn: 0, // 선택항목일련번호
        chcArtclScorScr: 0, // 선택항목배점점수
        sbjctvYn: 'N',
        itemArr: []
      })
      setSelectedItem(-1);
    }
  }

  // 선택항목 제거
  const handleItemRemove = () => {
    if(selectedItem > -1 && QList[selectedQ].srvyQitemSn) {
      let itemArr = QList[selectedQ].itemArr

      let newArr = [...itemArr];
  
      newArr = newArr.filter((item) => 
        item.chcArtclSn !== itemArr[selectedItem].chcArtclSn
      );
  
      newArr.map((item, index) => {
        item.chcArtclSn = index + 1
      })


      setQList((prev) =>
        prev.map((obj) => {
          if (obj.srvyQitemSn === QList[selectedQ].srvyQitemSn) {
            const hasY = newArr.some(item => item.sbjctvYn === 'Y');
      
            return {
              ...obj,
              sbjctvYn: hasY ? 'Y' : 'N', 
              itemArr: newArr, 
            };
          }
          return obj; 
        }) )

      setSelectedItem(-1);
      setItemParams({
        srvyCycl: cycle, // 차수
        srvyQitemSn: 0, // 설문문항일련번호
        qstnChcArtclCn: '', // 질문선택항목내용
        chcArtclSn: 0, // 선택항목일련번호
        chcArtclScorScr: 0, // 선택항목배점점수
        sbjctvYn: '',
        itemArr: []
      })
    }
  }

  const handleQClick = (index: number) => {
    setSelectedQ(index);
    setQParams(QList[index]);
  }

  const handleItemClick = (index:number) => {
    setSelectedItem(index);
    setItemParams(QList[selectedQ].itemArr[index]);
  }

  // 설문 정보 조회
  const fetchData = async () => {
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string = `/fsm/sup/qesitm/getOneQesitm?srvyCycl=${cycle}`
        
      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        console.log(response);

        setSrvyInfo({
          srvyCycl: cycle,
          srvyTtl: response.data.srvyTtl,
          srvyBgngYmd: getDateTimeString(response.data.srvyBgngYmd, 'date')?.dateString ?? '',
          srvyEndYmd: getDateTimeString(response.data.srvyEndYmd, 'date')?.dateString ?? '',
          srvyGdMsgCn: response.data.srvyGdMsgCn,
        })
      } else {
        // 데이터가 없거나 실패
        console.log(response.message);
      }
    } catch (error) {
      // 에러시
      console.error('Error fetching data:', error)
      
    }
  }


  // 설문문항 조회
  const getQList = async () => {
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string = `/fsm/sup/qesitm/getAllQesitm/${cycle}`
        
      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        let list: SrvyItemType[] = response.data;

        // 설문문항 마다 선택항목 세팅
        list?.map(async (obj) => {
          let itemList = await getItemList(obj.srvyQitemSn);
          if(itemList.length > 0) {
            obj.itemArr = itemList;
          }else {
            obj.itemArr = [];
          }
        })

        setQList(list);
      } else {
        // 데이터가 없거나 실패
        console.log(response.message);
      }
    } catch (error) {
      // 에러시
      console.error('Error fetching data:', error)
    }
  }

  // 문항 별 선택항목 조회
  const getItemList = async (srvyQitemSn: number) => {
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string = `/fsm/sup/qesitm/getAllQesitm/${cycle}/${srvyQitemSn}`
        
      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        
        return response.data;
      } else {
        // 데이터가 없거나 실패
        console.log(response.message);
      }
    } catch (error) {
      // 에러시
      console.error('Error fetching data:', error)
    }
  }

  // 설문 기본정보 저장
  const saveSrvyInfo = async () => {    
    if(!QList || QList.length == 0) {
      alert('저장할 설문 문항이 없습니다.');
      return;
    }

    if(!srvyInfo.srvyTtl) {
      alert('설문 제목을 입력해주세요.');
      return;
    }

    if(!srvyInfo.srvyBgngYmd) {
      alert('설문 시작일을 입력해주세요.');
      return;
    }

    if(!srvyInfo.srvyEndYmd) {
      alert('설문 종료일을 입력해주세요.')
      return;
    }

    if(!srvyInfo.srvyGdMsgCn) {
      alert('설문안내메시지를 입력해주세요.')
      return;
    }

    if (confirm('설문조사에 응답한 사용자가 있을경우\n설문정보만 변경가능하며\n설문문항 및 문항별 선택항목정보는 수정 불가능 합니다.\n\n 수정하시겠습니까?')) {

      try {
        setLoadingBackdrop(true);

        let endpoint: string = `/fsm/sup/qesitm/updateQesitm`;

        let body: SrvyInfoType = {
          ...srvyInfo,
          srvyBgngYmd: srvyInfo.srvyBgngYmd.replaceAll('-', ''),
          srvyEndYmd: srvyInfo.srvyEndYmd.replaceAll('-', '')
        }
    
        const response = await sendHttpRequest('PUT', endpoint, body, true, {
          cache: 'no-store'
        })
    
        if(response && response.resultType == 'success') {
          alert('[설문정보] ' + response.message);
          await saveQList()
          await saveItemList();        
          router.push('/sup/qesitm');
        }else {
          alert(response.message)
        }
      } catch(error) {
        console.error(error);
      } finally {
        setLoadingBackdrop(false);
      }
    }
  }

  // useEffect(() => {
  //   console.log('QLIST ::: ', QList);
  // },[QList])

  // 설문 항목 저장
  const saveQList = async () => {
    try {
      setLoadingBackdrop(true);
      let endpoint: string = `/fsm/sup/qesitm/updateQitem`;
      let reqList: { 
        srvyQitemSn: number; 
        qstnChcArtclCn: string; 
        chcArtclSn: number; 
        chcArtclScorScr: number; 
        sbjctvYn: string }[] = [];

        let requestData = [...QList];

        if (selectedQ > -1) {
          requestData[selectedQ].qstnChcArtclCn = qParams.qstnChcArtclCn
          requestData[selectedQ].chcArtclScorScr = qParams.chcArtclScorScr
        }
  
        requestData.map((item) => {
          reqList.push({
            srvyQitemSn: item.srvyQitemSn,
            qstnChcArtclCn: item.qstnChcArtclCn,
            chcArtclSn: item.chcArtclSn,
            chcArtclScorScr: item.chcArtclScorScr,
            sbjctvYn: item.sbjctvYn
          })
        })

      let srvyCycl:number = cycle;

      if(srvyCycl && srvyCycl > 0) {
        let body = {
          srvyCycl: srvyCycl,
          reqList: reqList
        }
  
        const response = await sendHttpRequest('PUT', endpoint, body, true, {
          cache: 'no-store'
        })
    
        if(response && response.resultType == 'success') {
          setQList(requestData)
          alert('[설문문항] ' + response.message);
        }else {
          alert('[설문문항] ' + response.message);
        }
      }
    }catch(error) {
      console.error(error);
    } finally { 
      setLoadingBackdrop(false);
    }
  }

  // 선택 항목 저장
  const saveItemList = async () => {
    try {
      setLoadingBackdrop(true);
      let endpoint: string = `/fsm/sup/qesitm/updateArtcl`;
      let reqList: { 
        srvyQitemSn: number; 
        qstnChcArtclCn: string; 
        chcArtclSn: number; 
        chcArtclScorScr: number; 
        sbjctvYn: string }[] = [];

        let itemData = QList[selectedQ].itemArr

        let requestItemData = [...itemData];
  
        if (selectedItem > -1) {
          requestItemData[selectedItem].qstnChcArtclCn = itemParams.qstnChcArtclCn
          requestItemData[selectedItem].sbjctvYn = itemParams.sbjctvYn
          requestItemData[selectedItem].chcArtclScorScr = itemParams.chcArtclScorScr
  
        }
  
        requestItemData.map((item) => {
          reqList.push({
            srvyQitemSn: item.srvyQitemSn,
            qstnChcArtclCn: item.qstnChcArtclCn,
            chcArtclSn: item.chcArtclSn,
            chcArtclScorScr: item.chcArtclScorScr,
            sbjctvYn: item.sbjctvYn
          })
        })

      let srvyCycl:number = cycle;

      if(srvyCycl && srvyCycl > 0) {
        let body = {
          srvyCycl: srvyCycl,
          reqList: reqList
        }
  
        const response = await sendHttpRequest('PUT', endpoint, body, true, {
          cache: 'no-store'
        })
    
        if(response && response.resultType == 'success') {
          setQList((prev) =>
            prev.map((obj) => {
              if (obj.srvyQitemSn === QList[selectedQ].srvyQitemSn) {
                const hasY = requestItemData.some(item => item.sbjctvYn === 'Y');
          
                return {
                  ...obj,
                  sbjctvYn: hasY ? 'Y' : 'N', 
                  itemArr: requestItemData, 
                };
              }
              return obj; 
            })
          );
          alert('[문항별 선택항목 정보] ' + response.message);
        }else {
          alert('[문항별 선택항목 정보] ' + response.message);
        }
      }
    }catch(error) {
      console.error(error);
    } finally {
      setLoadingBackdrop(false);
    }
  }

  return (
    <PageContainer title="문항관리 수정" description="문항관리 수정">
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
                  <CustomTextField name='srvyTtl' value={srvyInfo.srvyTtl} onChange={handleSrvyInfoChange} fullWidth/>
                </TableCell>
                <th className="td-head td-left" scope="row">
                  시작일자
                </th>
                <TableCell>
                  <CustomTextField name='srvyBgngYmd' value={srvyInfo.srvyBgngYmd} onChange={handleSrvyInfoChange} type='date' fullWidth/>
                </TableCell>
                <th className="td-head td-left" scope="row">
                  종료일자
                </th>
                <TableCell>
                  <CustomTextField name='srvyEndYmd' value={srvyInfo.srvyEndYmd} onChange={handleSrvyInfoChange} type='date' fullWidth/>
                </TableCell>
              </TableRow>
              <TableRow>
                <th className="td-head td-left" scope="row">
                  설문안내메시지
                </th>
                <TableCell colSpan={5}>
                  <CustomFormLabel className="input-label-none" htmlFor="modal-srvyGdMsgCn">내용</CustomFormLabel>
                  <textarea className="MuiTextArea-custom"
                    id="modal-srvyGdMsgCn"
                    name='srvyGdMsgCn' 
                    value={srvyInfo.srvyGdMsgCn} 
                    onChange={handleSrvyInfoChange} 
                    // multiline 
                    rows={5} 
                    // fullWidth
                  />
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
              <TableRow>
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
              </TableRow>
            </TableHead>
            <TableBody>
              {
                QList?.map((item, index) => (
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
              <TableRow>
                <TableCell className="table-head-text" sx={{width:'10%'}}>
                  번호
                </TableCell>
                <TableCell className="table-head-text">
                  선택항목 내용
                </TableCell>
                <TableCell className="table-head-text" sx={{width:'10%'}}>
                  배점
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {
                selectedQ > -1 && QList[selectedQ].itemArr?.map((item, index) => (
                  <TableRow onClick={() => handleItemClick(index)} selected={index == selectedItem} hover style={{cursor:'pointer'}}>
                    {/* <TableCell className='td-center'>{item.chcArtclSn}</TableCell> */}
                    <TableCell className='td-center'>{index + 1}</TableCell>
                    <TableCell style={{whiteSpace:'pre-wrap'}}>{item.qstnChcArtclCn}</TableCell>
                    <TableCell className='td-center'>{item.chcArtclScorScr}</TableCell>
                  </TableRow>
                ))
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
                <Button variant='outlined' color='primary' onClick={handleQListAdd}>문항추가</Button>
                <Button variant='contained' color='error' disabled={selectedQ < 0} onClick={handleQlistRemove}>문항삭제</Button>
                <Button variant='contained' color='primary' disabled={!(Array.isArray(QList) && QList.length != 0)} onClick={() => saveQList()}>문항저장</Button>
              </Box>
            </Box>
            <Table className="table table-bordered" sx={{minHeight: '100px'}}>
              <TableBody>
                <TableRow>
                  <th>문항내용</th>
                  <TableCell>
                    <CustomFormLabel className="input-label-none" htmlFor="modal-qstnChcArtclCn">문항내용</CustomFormLabel>
                    <textarea className="MuiTextArea-custom"
                      id="modal-qstnChcArtclCn"
                      name='qstnChcArtclCn' 
                      value={qParams.qstnChcArtclCn} 
                      onChange={handleQParamChange} 
                      // multiline 
                      rows={3} 
                      // fullWidth
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <th>배점</th>
                  <TableCell>
                    <CustomTextField type='text' name='chcArtclScorScr' value={qParams.chcArtclScorScr} onChange={handleQParamChange} fullWidth />
                  </TableCell>
                  {/* <th>주관식</th>
                  <TableCell>
                    <CommSelect 
                      cdGroupNm={'786'} 
                      pValue={qParams.sbjctvYn} 
                      handleChange={handleQParamChange} 
                      pName={'sbjctvYn'}
                    />
                  </TableCell> */}
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
                <Button variant='outlined' color='primary' disabled={selectedQ < 0} onClick={handleItemAdd}>항목추가</Button>
                <Button variant='contained' color='error' disabled={selectedQ < 0 || selectedItem < 0} onClick={handleItemRemove}>항목삭제</Button>
                <Button variant='contained' color='primary' disabled={selectedQ < 0 || QList[selectedQ].itemArr?.length == 0} onClick={() => saveItemList()}>항목저장</Button>
              </Box>
            </Box>
            <Table className='table table-bordered' sx={{minHeight: '100px'}}>
              <TableBody>
                <TableRow>
                  <th>선택문항 내용</th>
                  <TableCell colSpan={3}>
                    <CustomFormLabel className="input-label-none" htmlFor="modal-qstnChcArtclCn">선택문항 내용</CustomFormLabel>
                    <textarea className="MuiTextArea-custom"
                      id="modal-qstnChcArtclCn"
                      name='qstnChcArtclCn' 
                      value={itemParams.qstnChcArtclCn} 
                      onChange={handleItemParamChange} 
                      // multiline 
                      rows={3} 
                      // fullWidth
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <th>배점</th>
                  <TableCell>
                    <CustomTextField type='text' name='chcArtclScorScr' value={itemParams.chcArtclScorScr} onChange={handleItemParamChange} fullWidth/>
                  </TableCell>
                  <th>주관식</th>
                  <TableCell>
                    <CommSelect 
                      cdGroupNm={'786'} 
                      pValue={itemParams.sbjctvYn} 
                      handleChange={handleItemParamChange} 
                      pName={'sbjctvYn'}
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
        <Box className='table-bottom-button-group' style={{marginTop: '50px'}}>
          <Box className=" button-right-align">
              <Button variant='contained' color='primary' onClick={() => saveSrvyInfo()}>저장</Button>
              <Button variant='contained' color='dark' onClick={() => {router.push('/sup/qesitm')}}>취소</Button>
          </Box>
        </Box>
      </Box>

      {/* 로딩 */}
      <LoadingBackdrop open={loadingBackdrop} />
    </PageContainer>
  )
}

export default SrvyUpdatePage
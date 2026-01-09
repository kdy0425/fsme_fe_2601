import { uniqueId } from 'lodash'

export interface MenuitemsType {
  [x: string]: any;
  id?: string;               // 유니크 ID - 각 메뉴 항목을 식별하는 고유 ID
  navlabel?: boolean;        // 네비게이션 여부 - true일 경우, 메뉴 항목 대신 네비게이션 레이블로 표시
  subheader?: string;        // 서브헤더 - 네비게이션 레이블에 표시될 섹션 제목
  title?: string;            // 제목 - 메뉴 항목의 제목 또는 이름
  elementTitle?: string;     // 요소 제목 - 보통 target="_blank"와 같은 새 창 열기 링크의 제목
  icon?: any;                // 아이콘 - 메뉴 항목에 표시할 아이콘
  href?: string;             // 링크 - 메뉴 항목을 클릭했을 때 이동할 URL 경로
  children?: MenuitemsType[]; // 하위 메뉴 - 중첩된 하위 메뉴 목록 (서브 메뉴)
  chip?: string;             // 보조 태그 - 메뉴 항목 옆에 표시될 짧은 텍스트 (예: 알림 카운트)
  chipColor?: string;        // 보조 태그 색상 - chip의 배경 색상
  variant?: string;          // 변형 - 메뉴 항목의 변형 스타일 (예: HTTP 요청 메서드)
  external?: boolean;        // 외부 링크 여부 - true일 경우 새 창에서 열리는 외부 링크로 설정
}

const Menuitems: MenuitemsType[] = [
  /********************************************************
   *  #################기준관리 START #################
   *********************************************************/
  {
    navlabel: true,
    subheader: '기준관리',
  },
  {
    id: uniqueId(),
    title: '자격관리',
    // href: "/stn",
    children: [
      {
        id: uniqueId(),
        title: '차량휴지관리',
        href: '/stn/vpm',
      },
      {
        id: uniqueId(),
        title: '차량관리',
        href: '/stn/vm',
      },
      {
        id: uniqueId(),
        title: '차량말소관리',
        href: '/stn/vem',
      },
      {
        id: uniqueId(),
        title: '차량제원변경관리',
        href: '/stn/vdcm',
      },
      {
        id: uniqueId(),
        title: '지자체이관전입관리',
        href: '/stn/lttm',
      },
      {
        id: uniqueId(),
        title: '지자체이관전출관리',
        href: '/stn/ltmm',
      },
      {
        id: uniqueId(),
        title: '자동차망비교',
        href: '/stn/cnc',
      },
      {
        id: uniqueId(),
        title: '사업자관리',
        href: '/stn/bm',
      },
      {
        id: uniqueId(),
        title: '화물 대폐차신고조회',
        href: '/stn/rs',
      },
      {
        id: uniqueId(),
        title: '화물 등록번호판영치 정보',
        href: '/stn/rnci',
      },
      {
        id: uniqueId(),
        title: '화물 운행정지 정보',
        href: '/stn/osi',
      },
      {
        id: uniqueId(),
        title: '화물 탱크용량변경관리',
        href: '/stn/tcc',
      },
    ],
  },
  {
    id: uniqueId(),
    title: '보조금지급시행기준',
    // href: "/stn",
    children: [
      {
        id: uniqueId(),
        title: '전국표준한도관리',
        href: '/stn/wslm',
      },
      {
        id: uniqueId(),
        title: '유종별 보조금단가관리',
        href: '/stn/ksu',
      },
      {
        id: uniqueId(),
        title: '지역별 고시유가관리',
        href: '/stn/bno',
      },
      {
        id: uniqueId(),
        title: '화물 의무보험가입정보',
        href: '/stn/disi',
      },
      {
        id: uniqueId(),
        title: '화물 운행정지 정보',
        href: '/stn/dqi',
      },
      {
        id: uniqueId(),
        title: '화물 운전면허정보',
        href: '/stn/di',
      },
      {
        id: uniqueId(),
        title: '화물 사업자정보 조회',
        href: '/stn/bi',
      },
    ],
  },
  {
    navlabel: true,
    subheader: '거래정보',
  },
  {
    id: uniqueId(),
    title: '통합주유정보',
    // href: '/apv',
    children: [
      {
        id: uniqueId(),
        title: '월별거래내역',
        href: '/apv/mdd',
      },
      {
        id: uniqueId(),
        title: '일별거래내역',
        href: '/apv/ddd',
      },
      {
        id: uniqueId(),
        title: '주유내역',
        href: '/apv/ld',
      },
    ],
  },
  {
    id: uniqueId(),
    title: '화물주유정보',
    // href: '/apv',
    children: [
      {
        id: uniqueId(),
        title: '화물거래내역',
        href: '/apv/fdd',
      },
      {
        id: uniqueId(),
        title: '가맹점별 거래내역조회',
        href: '/apv/bddtls', // 경로 duplicated
      },
    ],
  },
  {
    id: uniqueId(),
    title: '버스주유정보',
    // href: '/apv',
    children: [
      {
        id: uniqueId(),
        title: '차량월별거래내역',
        href: '/apv/vmdd',
      },
      {
        id: uniqueId(),
        title: '차량일별거래내역',
        href: '/apv/vddd',
      },
      {
        id: uniqueId(),
        title: '준공영제거래내역',
        href: '/apv/sdd',
      },
      {
        id: uniqueId(),
        title: '버스월별거래내역',
        href: '/apv/bmdd',
      },
      {
        id: uniqueId(),
        title: '업체별거래현황',
        href: '/apv/bds',
      },
      {
        id: uniqueId(),
        title: '버스일별거래내역',
        href: '/apv/bddd',
      },
      {
        id: uniqueId(),
        title: '버스거래내역',
        href: '/apv/bdd', // 경로 duplicated
      },
    ],
  },
  {
    id: uniqueId(),
    title: '택시주유정보',
    // href: '/apv',
    children: [
      {
        id: uniqueId(),
        title: '미할인거래내역 조회',
        href: '/apv/uddd',
      },
      {
        id: uniqueId(),
        title: '택시월별거래내역',
        href: '/apv/tmdd',
      },
      {
        id: uniqueId(),
        title: '택시거래내역',
        href: '/apv/tdd',
      },
    ],
  },
  {
    id: uniqueId(),
    title: '주유(충전)소 관리',
    // href: '/apv',
    children: [
      {
        id: uniqueId(),
        title: '특별관리주유소 이용자조회',
        href: '/apv/smou',
      },
      {
        id: uniqueId(),
        title: 'POS시스템설치 관리',
        href: '/apv/psim',
      },
      {
        id: uniqueId(),
        title: 'POS 자동비교 결과조회',
        href: '/apv/pacr',
      },
      {
        id: uniqueId(),
        title: '주유(충전)소 기준정보조회',
        href: '/apv/osi',
      },
      {
        id: uniqueId(),
        title: '신규 POS 주유소 관리',
        href: '/apv/npom',
      },
      {
        id: uniqueId(),
        title: '특별관리주유소 지정관리',
        href: '/apv/coam',
      },
      {
        id: uniqueId(),
        title: '주유량확인시스템 거래내역조회',
        href: '/apv/aisdd',
      },
      {
        id: uniqueId(),
        title: '주유량확인시스템 설치관리',
        href: '/apv/acsim',
      },
    ],
  },
  {
    id: uniqueId(),
    title: '수소충전소 관리',
    // href: '/apv',
    children: [
      {
        id: uniqueId(),
        title: '수소 가맹점 관리',
        href: '/apv/hmm',
      },
    ],
  },
  /********************************************************
   *  #################기준관리 END #################
   *********************************************************/

  /********************************************************
   *  #################운영관리 START #################
   *********************************************************/
  {
    navlabel: true,
    subheader: '운영관리',
  },
  {
    id: uniqueId(),
    title: '운영관리',
    href: '/mng',
    children: [
      {
        id: uniqueId(),
        title: '탱크용량심사변경관리',
        href: '/mng/tcjc',
      },
      {
        id: uniqueId(),
        title: '보조금지급정지 변경관리',
        href: '/mng/sspc',
      },
      {
        id: uniqueId(),
        title: '청구 지급확정 취소',
        href: '/mng/rpdc',
      },
      {
        id: uniqueId(),
        title: '서면신청(일반) 변경관리',
        href: '/mng/gprc',
      },
      {
        id: uniqueId(),
        title: '의심거래대상 내역관리',
        href: '/mng/dddm',
      },
      {
        id: uniqueId(),
        title: '민원관리',
        href: '/mng/cvpl',
      },
      {
        id: uniqueId(),
        title: '카드발급심사 변경관리',
        href: '/mng/cijc',
      },
      {
        id: uniqueId(),
        title: '카드발급심사 자동탈락내역',
        href: '/mng/cijaf',
      },
    ],
  },
  /********************************************************
   *  #################운영관리 END #################
   *********************************************************/

  /********************************************************
   *  #################업무지원 START #################
   *********************************************************/
  {
    navlabel: true,
    subheader: '업무지원',
  },
  {
    id: uniqueId(),
    title: '예산관리',
    // href: '/sup',
    children: [
      {
        id: uniqueId(),
        title: '세입액관리',
        href: '/sup/tm',
      },
      {
        id: uniqueId(),
        title: '안분관리',
        href: '/sup/pm', // dup
      },
      {
        id: uniqueId(),
        title: '지급실적관리',
        href: '/sup/pm', // dup
      },
      {
        id: uniqueId(),
        title: '유가보조금통합조회',
        href: '/sup/fus',
      },
      {
        id: uniqueId(),
        title: '예산관리',
        href: '/sup/bm',
      },
      {
        id: uniqueId(),
        title: '집행정보조회',
        href: '/sup/prdv',
      }
    ],
  },
  {
    id: uniqueId(),
    title: '업무일반',
    // href: '/sup',
    children: [
      {
        id: uniqueId(),
        title: '소급요청',
        href: '/sup/rr',
      },
      {
        id: uniqueId(),
        title: '업무요청',
        href: '/sup/jr',
      },
    ],
  },
  {
    id: uniqueId(),
    title: '커뮤니티',
    // href: '/sup',
    children: [
      {
        id: uniqueId(),
        title: '자료실',
        href: '/sup/recroom',
      },
      {
        id: uniqueId(),
        title: 'QnA',
        href: '/sup/qna',
      },
      {
        id: uniqueId(),
        title: '공지사항',
        href: '/sup/notice',
      },
      {
        id: uniqueId(),
        title: '소송/심판 사례',
        href: '/sup/lrc',
      },
      {
        id: uniqueId(),
        title: 'FAQ',
        href: '/sup/faq',
      },
      {
        id: uniqueId(),
        title: '민원처리 사례',
        href: '/sup/cc',
      },
    ],
  },
  {
    id: uniqueId(),
    title: '설문조사',
    // href: '/sup',
    children: [
      {
        id: uniqueId(),
        title: '문항관리',
        href: '/sup/qesitm',
      },
    ],
  },
  /********************************************************
   *  #################업무지원 END #################
   *********************************************************/

  /********************************************************
   *  #################유류구매카드관리 START #################
   *********************************************************/
  {
    navlabel: true,
    subheader: '유류구매카드관리',
  },
  {
    id: uniqueId(),
    title: 'RFID태그관리',
    // href: '/cad',
    children: [
      {
        id: uniqueId(),
        title: 'RFID태그요청관리',
        href: '/cad/rtrm',
      },
      {
        id: uniqueId(),
        title: 'RFID태그심사관리',
        href: '/cad/rtjm',
      },
    ],
  },
  {
    id: uniqueId(),
    title: '보조금카드관리',
    // href: '/cad',
    children: [
      {
        id: uniqueId(),
        title: '카드정보관리',
        href: '/cad/cim',
      },
      {
        id: uniqueId(),
        title: '카드발급 심사 관리',
        href: '/cad/cijm',
      },
    ],
  },
  /********************************************************
   *  #################유류구매카드관리 END #################
   *********************************************************/

  /********************************************************
   *  #################통계 START #################
   *********************************************************/
  {
    navlabel: true,
    subheader: '통계',
  },
  {
    id: uniqueId(),
    title: '보조금',
    // href: '/sta',
    children: [
      {
        id: uniqueId(),
        title: '년도별 유가보조금 지급현황',
        href: '/sta/yfps',
      },
      {
        id: uniqueId(),
        title: '톤수별 유가보조금 지급현황',
        href: '/sta/tfps',
      },
      {
        id: uniqueId(),
        title: '자가주유유가보조금 지급현황',
        href: '/sta/slfps',
      },
      {
        id: uniqueId(),
        title: '월별 유가보조금 지급현황',
        href: '/sta/mfps',
      },
      {
        id: uniqueId(),
        title: '유가보조금 사전차단 현황',
        href: '/sta/fpis',
      },
      {
        id: uniqueId(),
        title: '카드사용유가보조금 지급현황',
        href: '/sta/cufps',
      },
      {
        id: uniqueId(),
        title: '주유충전소별 유가보조금 지급현황',
        href: '/sta/bofps',
      },
      {
        id: uniqueId(),
        title: '지자체별 유가보조금 지급현황',
        href: '/sta/blfps',
      },
      {
        id: uniqueId(),
        title: '유종별 유가보조금 지급현황',
        href: '/sta/bfps', // dup
      },
      {
        id: uniqueId(),
        title: '차량별 유가보조금 지급현황',
        href: '/sta/bfps', // dup
      },
      {
        id: uniqueId(),
        title: '면허업종별 유가보조금 지급현황',
        href: '/sta/bfps', // dup
      },
    ],
  },
  {
    id: uniqueId(),
    title: '정보',
    // href: '/sta',
    children: [
      {
        id: uniqueId(),
        title: '차량 지급정지 집계',
        href: '/sta/vpss',
      },
      {
        id: uniqueId(),
        title: '차량 휴지내역 집계',
        href: '/sta/vpds',
      },
      {
        id: uniqueId(),
        title: '지자체 전출입현황 집계',
        href: '/sta/lmss',
      },
    ],
  },
  {
    id: uniqueId(),
    title: '카드발급',
    // href: '/sta',
    children: [
      {
        id: uniqueId(),
        title: 'RFID발급실적',
        href: '/sta/ri',
      },
      {
        id: uniqueId(),
        title: '카드발급실적',
        href: '/sta/ci',
      },
    ],
  },
  {
    id: uniqueId(),
    title: '행정처분',
    // href: '/sta',
    children: [
      {
        id: uniqueId(),
        title: '부정수급적발 현황',
        href: '/sta/isds',
      },
    ],
  },
  /********************************************************
   *  #################통계 END #################
   *********************************************************/

  /********************************************************
   *  #################시스템관리 START #################
   *********************************************************/
  {
    navlabel: true,
    subheader: '시스템관리',
  },
  {
    id: uniqueId(),
    title: '권한관리',
    // href: '/sym',
    children: [
      {
        id: uniqueId(),
        title: '사용자관리',
        href: '/sym/user',
      },
      {
        id: uniqueId(),
        title: '장기미접속자삭제이력',
        href: '/sym/ucdh',
      },
      {
        id: uniqueId(),
        title: '역할별 사용자설정',
        href: '/sym/ru',
      },
      {
        id: uniqueId(),
        title: '역할(Role) 관리',
        href: '/sym/role',
      },
      {
        id: uniqueId(),
        title: '역할별 권한관리',
        href: '/sym/ra',
      },
      {
        id: uniqueId(),
        title: '접근권한관리',
        href: '/sym/aa',
      },
    ],
  },
  {
    id: uniqueId(),
    title: '메뉴관리',
    // href: '/sym',
    children: [
      {
        id: uniqueId(),
        title: '프로그램관리',
        href: '/sym/progrm',
      },
      {
        id: uniqueId(),
        title: '메뉴관리',
        href: '/sym/menu',
      },
    ],
  },
  {
    id: uniqueId(),
    title: '시스템일반',
    // href: '/sym',
    children: [
      {
        id: uniqueId(),
        title: '보조금입금계좌관리',
        href: '/sym/sra',
      },
      {
        id: uniqueId(),
        title: '지자체코드관리',
        href: '/sym/lc',
      },
      {
        id: uniqueId(),
        title: '공통코드관리',
        href: '/sym/cc',
      },
    ],
  },
  {
    id: uniqueId(),
    title: '연계정보관리',
    // href: '/sym/',
    children: [
      {
        id: uniqueId(),
        title: '화물 카드협약사 연계관리',
        href: '/sym/trcc', //dup
      },
      {
        id: uniqueId(),
        title: '택시 카드협약사 연계관리',
        href: '/sym/txcc', // dup
      },
      {
        id: uniqueId(),
        title: '경찰청 연계 송수신정보',
        href: '/sym/pci',
      },
      {
        id: uniqueId(),
        title: '국세청 연계 송수신정보',
        href: '/sym/nci',
      },
      {
        id: uniqueId(),
        title: '행정안전부 연계 송수신정보',
        href: '/sym/mci',
      },
      {
        id: uniqueId(),
        title: '한국교통안전공단 연계 송수신정보',
        href: '/sym/kotci', //dup
      },
      {
        id: uniqueId(),
        title: '보험개발원 연계 송수신정보',
        href: '/sym/kidci', //dup
      },
      {
        id: uniqueId(),
        title: '한국석유관리원 연계 송수신정보',
        href: '/sym/kpeci', //dup
      },
      {
        id: uniqueId(),
        title: '버스 카드협약사 연계관리',
        href: '/sym/bcc',
      },
      {
        id: uniqueId(),
        title: '대외기관 연계 송수신정보',
        href: '/sym/extci',
      },
      {
        id: uniqueId(),
        title: '포털시스템 연계 송수신정보',
        href: '/sym/ptci',
      },
    ],
  },
  /********************************************************
   *  #################시스템관리 END #################
   *********************************************************/

  /********************************************************
   *  #################서면신청 START #################
   *********************************************************/
  {
    navlabel: true,
    subheader: '서면신청',
  },
  {
    id: uniqueId(),
    title: '화물서면신청',
    // href: '/par/',
    children: [
      {
        id: uniqueId(),
        title: '서면신청관리',
        href: '/par/pr', // dup
      },
      {
        id: uniqueId(),
        title: '수소서면신청관리',
        href: '/par/hpr',
      },
      {
        id: uniqueId(),
        title: '서면신청(일반)',
        href: '/par/gpr',
      },
    ],
  },
  {
    id: uniqueId(),
    title: '버스서면신청',
    // href: '/par/',
    children: [
      {
        id: uniqueId(),
        title: '서면신청관리',
        href: '/par/pr', //dup
      },
    ],
  },
  {
    id: uniqueId(),
    title: '택시서면신청',
    // href: '/par/',
    children: [
      {
        id: uniqueId(),
        title: '지자체서면신청관리',
        href: '/par/lpr',
      },
      {
        id: uniqueId(),
        title: '카드사서면신청관리',
        href: '/par/cpr',
      },
    ],
  },
  /********************************************************
   *  ################# 서면신청 END #################
   *********************************************************/

  /********************************************************
   *  ################# 부정수급관리 START #################
   *********************************************************/
  {
    navlabel: true,
    subheader: '부정수급관리',
  },
  // {
  //   id: uniqueId(),
  //   title: '지자체이첩관리',
  //   // href: '/ilg/',
  //   children: [
  //     {
  //       id: uniqueId(),
  //       title: '1일4회이상주유',
  //       href: '/ilg/dmal',
  //     },
  //     {
  //       id: uniqueId(),
  //       title: '거리 대비 주유시간 이상주유',
  //       href: '/ilg/dvhal',
  //     },
  //     {
  //       id: uniqueId(),
  //       title: '단시간반복주유',
  //       href: '/ilg/shl',
  //     },
  //     {
  //       id: uniqueId(),
  //       title: '유효하지 않은 사업자의 의심주유',
  //       href: '/ilg/nbl',
  //     },
  //     {
  //       id: uniqueId(),
  //       title: '주행거리 기반 주유량 의심주유',
  //       href: '/ilg/ddal',
  //     },
  //     {
  //       id: uniqueId(),
  //       title: '탱크용량초과주유',
  //       href: '/ilg/tcel',
  //     },
  //     {
  //       id: uniqueId(),
  //       title: '톤급별평균대비초과주유',
  //       href: '/ilg/taavel',
  //     },
  //     {
  //       id: uniqueId(),
  //       title: '주유패턴이상차량',
  //       href: '/ilg/lpav',
  //     },
  //   ],
  // },
  {
    id: uniqueId(),
    title: '체납환수금관리',
    // href: '/ilg/',
    children: [
      {
        id: uniqueId(),
        title: '체납환수금관리',
        href: '/ilg/nr',
      },
    ],
  },
  {
    id: uniqueId(),
    title: '택시의심거래상시점검',
    // href: '/ilg/',
    children: [
      {
        id: uniqueId(),
        title: '월 누적 사용량',
        href: '/ilg/mau',
      },
      {
        id: uniqueId(),
        title: '지역평균거래량 2배초과충전',
        href: '/ilg/aavee',
      },
      {
        id: uniqueId(),
        title: '1일4회 월4회이상반복충전',
        href: '/ilg/dmmmare',
      },
      {
        id: uniqueId(),
        title: '2시간이내 & 80리터초과충전',
        href: '/ilg/thwlee',
      },
      {
        id: uniqueId(),
        title: '1일4회이상초과충전',
        href: '/ilg/dmaee',
      },
      {
        id: uniqueId(),
        title: '1시간이내재충전',
        href: '/ilg/hwre',
      },
      {
        id: uniqueId(),
        title: '1일4회이내 180리터초과충전',
        href: '/ilg/hmwlee',
      },
      {
        id: uniqueId(),
        title: '1회 72리터초과충전',
        href: '/ilg/mlee',
      },
      {
        id: uniqueId(),
        title: '1일 120리터초과충전',
        href: '/ilg/dlee',
      },
      {
        id: uniqueId(),
        title: '사업구역외충전',
        href: '/ilg/bzee',
      },
    ],
  },
  {
    id: uniqueId(),
    title: '행정처분',
    // href: '/ilg/',
    children: [
      {
        id: uniqueId(),
        title: '보조금지급정지',
        href: '/ilg/ssp',
      },
      {
        id: uniqueId(),
        title: '보조금지급거절',
        href: '/ilg/srp',
      },
      {
        id: uniqueId(),
        title: '부정수급행정처리',
        href: '/ilg/isd',
      },
      {
        id: uniqueId(),
        title: '행정처분승계이력관리',
        href: '/ilg/esh',
      },
    ],
  },
  {
    id: uniqueId(),
    title: '화물의심거래상시점검',
    // href: '/ilg/',
    children: [
      {
        id: uniqueId(),
        title: '의심거래 통계',
        href: '/ilg/dds',
      },
      {
        id: uniqueId(),
        title: '부정수급 조치관리 모니터링',
        href: '/ilg/ismmm',
      },
      {
        id: uniqueId(),
        title: '1일4회이상주유',
        href: '/ilg/dmal',
      },
      {
        id: uniqueId(),
        title: '거리 대비 주유시간 이상주유',
        href: '/ilg/dvhal',
      },
      {
        id: uniqueId(),
        title: '단시간반복주유',
        href: '/ilg/shl',
      },
      {
        id: uniqueId(),
        title: '유효하지 않은 사업자의 의심주유',
        href: '/ilg/nbl',
      },
      {
        id: uniqueId(),
        title: '주행거리 기반 주유량 의심주유',
        href: '/ilg/ddal',
      },
      {
        id: uniqueId(),
        title: '탱크용량초과주유',
        href: '/ilg/tcel',
      },
      {
        id: uniqueId(),
        title: '톤급별평균대비초과주유',
        href: '/ilg/taavel',
      },
      {
        id: uniqueId(),
        title: '주유패턴이상차량',
        href: '/ilg/lpav',
      },
      {
        id: uniqueId(),
        title: '조사결과 조회 및 행정처분 조회',
        href: '/ilg/ere',
      },
      {
        id: uniqueId(),
        title: '의심거래미처리내역',
        href: '/ilg/ddupd',
      },
    ],
  },
  /********************************************************
   *  ################# 부정수급관리 END #################
   *********************************************************/

  /********************************************************
   *  ################# 보조금청구 START #################
   *********************************************************/
  {
    navlabel: true,
    subheader: '보조금청구',
  },
  {
    id: uniqueId(),
    title: '화물청구',
    // href: '/cal/',
    children: [
      {
        id: uniqueId(),
        title: '보조금 청구내역',
        href: '/cal/sr',
      },
      {
        id: uniqueId(),
        title: '지자체별 청구내역 집계현황',
        href: '/cal/lsr',
      },
      {
        id: uniqueId(),
        title: '시도별 보조금 청구내역관리',
        href: '/cal/csr',
      },
    ],
  },
  {
    id: uniqueId(),
    title: '택시청구',
    // href: '/cal/',
    children: [
      {
        id: uniqueId(),
        title: '청구서 출력',
        href: '/cal/sr', // 화물쪽이랑 dup (청구내역)
      },
      {
        id: uniqueId(),
        title: '지급확정관리',
        href: '/cal/pd',
      },
      {
        id: uniqueId(),
        title: '지자체별 청구내역 집계현황',
        href: '/cal/lsr',
      },
      {
        id: uniqueId(),
        title: '건별청구내역관리',
        href: '/cal/csr',
      },
      {
        id: uniqueId(),
        title: '건별청구내역관리', // ? dup
        href: '/cal/csr',
      },
      {
        id: uniqueId(),
        title: '카드사별청구내역조회',
        href: '/cal/csr',
      },
      {
        id: uniqueId(),
        title: '차량별 청구내역 집계현황',
        href: '/cal/bsr',
      },
      {
        id: uniqueId(),
        title: '차량별 청구내역 집계현황', // ? dup
        href: '/cal/bsr',
      },
    ],
  },
  {
    id: uniqueId(),
    title: '버스청구',
    // href: '/cal/',
    children: [
      {
        id: uniqueId(),
        title: '결제내역조회',
        href: '/cal/sd',
      },
      {
        id: uniqueId(),
        title: '지자체별지급확정관리',
        href: '/cal/lpd',
      },
      {
        id: uniqueId(),
        title: '업종별청구현황',
        href: '/cal/isr',
      },
      {
        id: uniqueId(),
        title: '차량별청구내역조회',
        href: '/cal/bsr',
      },
      {
        id: uniqueId(),
        title: '차량별청구현황',
        href: '/cal/bsr',
      },
      {
        id: uniqueId(),
        title: '사엽자별청구내역조회',
        href: '/cal/bsr',
      },
      {
        id: uniqueId(),
        title: '사업자별청구현황',
        href: '/cal/bsr',
      },
    ],
  },
  /********************************************************
   *  ################# 보조금청구 END #################
   *********************************************************/

  {
    navlabel: true,
    subheader: '페이지 가이드',
  },
  {
    id: uniqueId(),
    title: '메인페이지',
    href: '/',
  },
  {
    id: uniqueId(),
    title: 'POST 게시판',
    href: '/sample/post/list',
  },

  {
    navlabel: true,
    subheader: 'Ui Components 가이드',
  },
  {
    id: uniqueId(),
    title: 'Menu Level',
    href: '/menulevel/',
    children: [
      {
        id: uniqueId(),
        title: 'Level 1',
        href: '/l1',
      },
      {
        id: uniqueId(),
        title: 'Level 1.1',
        href: '/l1.1',
        children: [
          {
            id: uniqueId(),
            title: 'Level 2',
            href: '/l2',
          },
          {
            id: uniqueId(),
            title: 'Level 2.1',
            href: '/l2.1',
            children: [
              {
                id: uniqueId(),
                title: 'Level 3',
                href: '/l3',
              },
              {
                id: uniqueId(),
                title: 'Level 3.1',
                href: '/l3.1',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: uniqueId(),
    title: '새창열기 가이드',
    external: true,
    href: 'https://google.com',
    target: '_blank',
    elementTitle: '새창 띄우기',
  },
]

export default Menuitems

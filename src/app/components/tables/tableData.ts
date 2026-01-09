export interface TableType {
  id?: any;
  title?: string;
  name?: string;
  count?: string;
  date?: string;
}

export interface EnTableType {
  id: string;
  imgsrc: string;
  name: string;
  email: string;
  pname: string;
  teams: {
    id: string;
    color: string;
    text: string;
  }[];
  status: string;
  weeks: string;
  budget: string;
}

const basicsTableData: TableType[] = [
  {
    id: '1',
    title: '제목제목제목제목제목제목제목제목제목제목제목제목1',
    name: '홍길동',
    count: '4,300',
    date: '2024-07-26',
  },
  {
    id: '2',
    title: '제목제목제목제목제목제목제목제목제목제목제목제목2',
    name: '홍길동',
    count: '4,300',
    date: '2024-07-26',
  },
  {
    id: '3',
    title: '제목제목제목제목제목제목제목제목제목제목제목제목3',
    name: '홍길동',
    count: '4,300',
    date: '2024-07-26',
  },
  {
    id: '4',
    title: '제목제목제목제목제목제목제목제목제목제목제목제목4',
    name: '홍길동',
    count: '4,300',
    date: '2024-07-26',
  },
  {
    id: '5',
    title: '제목제목제목제목제목제목제목제목제목제목제목제목5',
    name: '홍길동',
    count: '4,300',
    date: '2024-07-26',
  },
  {
    id: '6',
    title: '제목제목제목제목제목제목제목제목제목제목제목제목6',
    name: '홍길동',
    count: '4,300',
    date: '2024-07-26',
  },
  {
    id: '7',
    title: '제목제목제목제목제목제목제목제목제목제목제목제목7',
    name: '홍길동',
    count: '4,300',
    date: '2024-07-26',
  },
];

const EnhancedTableData: EnTableType[] = [
  {
    id: '1',
    imgsrc: "/images/profile/user-1.jpg",
    name: 'Sunil Joshi',
    email: 'sunil@gmail.com',
    pname: 'Elite Admin',
    teams: [
      {
        id: '1.1',
        color: 'secondary.main',
        text: 'S',
      },
      {
        id: '1.2',
        color: 'error.main',
        text: 'D',
      },
    ],
    status: 'Active',
    weeks: '11',
    budget: '3.9',
  },
  {
    id: '2',
    imgsrc: "/images/profile/user-1.jpg",
    name: 'Andrew McDownland',
    email: 'andrew@gmail.com',
    pname: 'Real Homes WP Theme',
    teams: [
      {
        id: '2.1',
        color: 'primary.main',
        text: 'A',
      },
      {
        id: '2.2',
        color: 'warning.main',
        text: 'X',
      },
      {
        id: '2.3',
        color: 'secondary.main',
        text: 'N',
      },
    ],
    status: 'Pending',
    weeks: '19',
    budget: '24.5',
  },
  {
    id: '3',
    imgsrc: "/images/profile/user-1.jpg",
    name: 'Christopher Jamil',
    email: 'jamil@gmail.com',
    pname: 'MedicalPro WP Theme',
    teams: [
      {
        id: '3.1',
        color: 'error.main',
        text: 'X',
      },
    ],
    status: 'Completed',
    weeks: '30',
    budget: '12.8',
  },
  {
    id: '4',
    imgsrc: "/images/profile/user-1.jpg",
    name: 'Nirav Joshi',
    email: 'nirav@gmail.com',
    pname: 'Hosting Press HTML',
    teams: [
      {
        id: '4.1',
        color: 'primary.main',
        text: 'Y',
      },
      {
        id: '4.2',
        color: 'error.main',
        text: 'X',
      },
    ],
    status: 'Active',
    weeks: '40',
    budget: '2.4',
  },
  {
    id: '5',
    imgsrc: "/images/profile/user-1.jpg",
    name: 'Micheal Doe',
    email: 'micheal@gmail.com',
    pname: 'Helping Hands WP Theme',
    teams: [
      {
        id: '5.1',
        color: 'secondary.main',
        text: 'S',
      },
    ],
    status: 'Cancel',
    weeks: '1',
    budget: '9.3',
  },
  {
    id: '6',
    imgsrc: "/images/profile/user-1.jpg",
    name: 'Nirav Joshi',
    email: 'nirav@gmail.com',
    pname: 'Hosting Press HTML',
    teams: [
      {
        id: '6.1',
        color: 'primary.main',
        text: 'Y',
      },
      {
        id: '6.2',
        color: 'error.main',
        text: 'X',
      },
    ],
    status: 'Active',
    weeks: '16',
    budget: '2.4',
  },
  {
    id: '7',
    imgsrc: "/images/profile/user-1.jpg",
    name: 'Sunil Joshi',
    email: 'sunil@gmail.com',
    pname: 'Elite Admin',
    teams: [
      {
        id: '7.1',
        color: 'secondary.main',
        text: 'S',
      },
      {
        id: '7.2',
        color: 'error.main',
        text: 'D',
      },
    ],
    status: 'Active',
    weeks: '12',
    budget: '3.9',
  },
  {
    id: '8',
    imgsrc: "/images/profile/user-1.jpg",
    name: 'Andrew McDownland',
    email: 'andrew@gmail.com',
    pname: 'Real Homes WP Theme',
    teams: [
      {
        id: '8.1',
        color: 'primary.main',
        text: 'A',
      },
      {
        id: '8.2',
        color: 'warning.main',
        text: 'X',
      },
      {
        id: '8.3',
        color: 'secondary.main',
        text: 'N',
      },
    ],
    status: 'Pending',
    weeks: '14',
    budget: '24.5',
  },
  {
    id: '9',
    imgsrc: "/images/profile/user-1.jpg",
    name: 'Christopher Jamil',
    email: 'jamil@gmail.com',
    pname: 'MedicalPro WP Theme',
    teams: [
      {
        id: '9.1',
        color: 'error.main',
        text: 'X',
      },
    ],
    status: 'Completed',
    weeks: '12',
    budget: '12.8',
  },

  {
    id: '10',
    imgsrc: "/images/profile/user-1.jpg",
    name: 'Micheal Doe',
    email: 'micheal@gmail.com',
    pname: 'Helping Hands WP Theme',
    teams: [
      {
        id: '10.1',
        color: 'secondary.main',
        text: 'S',
      },
    ],
    status: 'Cancel',
    weeks: '9',
    budget: '9.3',
  },
];
export { basicsTableData, EnhancedTableData };

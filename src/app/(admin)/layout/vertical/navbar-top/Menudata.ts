import { uniqueId } from 'lodash';

export type MenuItem = {
  id?: string;
  title?: string;
  href?: string;
  target?: string;
  elementTitle?: string;
  children?: MenuItem[]; // 재귀적으로 하위 메뉴를 포함할 수 있음
};

const Menuitems: MenuItem[] = [

  {
    id: uniqueId(),
    title: '1뎁스 메뉴',
    href: '/',
    children: [
      {
        id: uniqueId(),
        title: '2뎁스 메뉴 2뎁스 메뉴 2뎁스 메뉴 2뎁스 메뉴 2뎁스 메뉴',
        href: '#',
        target: "_blank",
        elementTitle: "새창 띄우기",
      },
      {
        id: uniqueId(),
        title: '2뎁스 메뉴 2뎁스 메뉴 2뎁스 메뉴 2뎁스 메뉴 2뎁스 메뉴',
        href: '#',
        children: [
          {
            id: uniqueId(),
            title: '3뎁스 메뉴 3뎁스 메뉴 3뎁스 메뉴 3뎁스 메뉴 3뎁스 메뉴',
            href: '#',
            target: "_blank",
            elementTitle: "새창 띄우기",
          },
          {
            id: uniqueId(),
            title: '3뎁스 메뉴',
            href: '/',
          },
          {
            id: uniqueId(),
            title: '3뎁스 메뉴',
            href: '#',
          },
          {
            id: uniqueId(),
            title: '3뎁스 메뉴',
            href: '#',
          },
          {
            id: uniqueId(),
            title: '3뎁스 메뉴',
            href: '#',
          },
        ],
      },
      {
        id: uniqueId(),
        title: '2뎁스 메뉴',
        href: '#',
        children: [
          {
            id: uniqueId(),
            title: '3뎁스 메뉴',
            href: '#',
          },
          {
            id: uniqueId(),
            title: '3뎁스 메뉴',
            href: '#',
          },
          {
            id: uniqueId(),
            title: '3뎁스 메뉴',
            href: '#',
          },
        ],
      },
    ],
  },
  {
    id: uniqueId(),
    title: '1뎁스 메뉴',
    href: '#',
  },
  {
    id: uniqueId(),
    title: '1뎁스 메뉴',
    href: '#',
    children: [
      {
        id: uniqueId(),
        title: '2뎁스 메뉴',
        href: '#',
      },
      {
        id: uniqueId(),
        title: '2뎁스 메뉴',
        href: '#',
        children: [
          {
            id: uniqueId(),
            title: '3뎁스 메뉴',
            href: '#',
          },
          {
            id: uniqueId(),
            title: '3뎁스 메뉴',
            href: '#',
          },
          {
            id: uniqueId(),
            title: '3뎁스 메뉴',
            href: '#',
          },
        ],
      },
      {
        id: uniqueId(),
        title: '2뎁스 메뉴',
        href: '#',
        children: [
          {
            id: uniqueId(),
            title: '3뎁스 메뉴',
            href: '#',
          },
          {
            id: uniqueId(),
            title: '3뎁스 메뉴',
            href: '#',
          },
          {
            id: uniqueId(),
            title: '3뎁스 메뉴',
            href: '#',
          },
        ],
      },
    ],
  },
  {
    id: uniqueId(),
    title: '1뎁스 메뉴',
    href: '#',
    children: [
      {
        id: uniqueId(),
        title: '2뎁스 메뉴',
        href: '#',
      },
      {
        id: uniqueId(),
        title: '2뎁스 메뉴',
        href: '#',
        children: [
          {
            id: uniqueId(),
            title: '3뎁스 메뉴',
            href: '#',
          },
          {
            id: uniqueId(),
            title: '3뎁스 메뉴',
            href: '#',
          },
          {
            id: uniqueId(),
            title: '3뎁스 메뉴',
            href: '#',
          },
        ],
      },
      {
        id: uniqueId(),
        title: '2뎁스 메뉴',
        href: '#',
        children: [
          {
            id: uniqueId(),
            title: '3뎁스 메뉴',
            href: '#',
          },
          {
            id: uniqueId(),
            title: '3뎁스 메뉴',
            href: '#',
          },
          {
            id: uniqueId(),
            title: '3뎁스 메뉴',
            href: '#',
          },
        ],
      },
    ],
  },
  {
    id: uniqueId(),
    title: '1뎁스 메뉴',
    href: '#',
    children: [
      {
        id: uniqueId(),
        title: '2뎁스 메뉴',
        href: '#',
      },
      {
        id: uniqueId(),
        title: '2뎁스 메뉴',
        href: '#',
        children: [
          {
            id: uniqueId(),
            title: '3뎁스 메뉴',
            href: '#',
          },
          {
            id: uniqueId(),
            title: '3뎁스 메뉴',
            href: '#',
          },
          {
            id: uniqueId(),
            title: '3뎁스 메뉴',
            href: '#',
          },
        ],
      },
      {
        id: uniqueId(),
        title: '2뎁스 메뉴',
        href: '#',
        children: [
          {
            id: uniqueId(),
            title: '3뎁스 메뉴',
            href: '#',
          },
          {
            id: uniqueId(),
            title: '3뎁스 메뉴',
            href: '#',
          },
          {
            id: uniqueId(),
            title: '3뎁스 메뉴',
            href: '#',
          },
        ],
      },
    ],
  },
];
export default Menuitems;

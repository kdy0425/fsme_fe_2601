import React from "react";
import Link from "next/link";

// mui imports
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { styled, useTheme } from '@mui/material/styles';
import { useSelector } from "@/store/hooks";
import { useTranslation } from "react-i18next";
import { AppState } from "@/store/store";

type NavGroup = {
  [x: string]: any;
  id?: string;
  navlabel?: boolean;
  subheader?: string;
  title?: string;
  href?: any;
  elementTitle?: string;
  children?: NavGroup[];
  chip?: string;
  chipColor?: any;
  variant?: string | any;
  external?: boolean;
  level?: number;
  onClick?: React.MouseEvent<HTMLButtonElement, MouseEvent>;
};

interface ItemType {
  item: NavGroup;
  onClick: (event: React.MouseEvent<HTMLElement>) => void;
  hideMenu?: any;
  level?: number | any;
  pathDirect: string;
}

export default function NavItem({
  item,
  level,
  pathDirect,
  hideMenu,
  onClick,
}: ItemType) {
  const lgDown = useMediaQuery((theme: Theme) => theme.breakpoints.down("lg"));
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();
  const { t } = useTranslation();

  const ListItemStyled = styled(ListItemButton)(() => ({
    whiteSpace: 'nowrap',
    padding: '5px 10px',
    gap: '10px',
    borderRadius: `${customizer.borderRadius}px`,
    marginBottom: level > 1 ? '3px' : '0px',
    backgroundColor: level > 1 ? "transparent !important" : "inherit",
    color:
      level > 1 && pathDirect === item?.href
        ? `${theme.palette.primary.main}!important`
        : theme.palette.text.secondary,
    "&:hover": {
      color: "white",
      backgroundColor: theme.palette.primary.main,
    },
    "&.Mui-selected": {
      color: "white",
      backgroundColor: theme.palette.primary.main,
      "&:hover": {
        color: "white",
        backgroundColor: theme.palette.primary.main,
      },
    },
  }));

  return (
    <List component="li" disablePadding key={item?.id && item.title} className="top-nav-no-children-li">
      <Link href={item.href} target={item.target} title={item.elementTitle} className="top-nav-item">
        <ListItemStyled
          disabled={item?.disabled}
          selected={pathDirect === item?.href}
          onClick={lgDown ? onClick : undefined}
          tabIndex={-1}
        >
          <span className="top-nav-item-text" style={{    whiteSpace: 'nowrap'
}}>
            {hideMenu ? "" : <>{t(`${item?.title}`)}</>}
          </span>

        </ListItemStyled>
      </Link>
    </List>
  );
}

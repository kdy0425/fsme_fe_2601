import { useState } from "react";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Menu from '@mui/material/Menu';
import Link from "next/link";
import { IconChevronDown } from "@tabler/icons-react";
import TopMenus from "./TopMenus";

const AppDD = () => {
  const [anchorEl2, setAnchorEl2] = useState(null);

  const handleClick2 = (event: any) => {
    setAnchorEl2(event.currentTarget);
  };

  const handleClose2 = () => {
    setAnchorEl2(null);
  };

  return (
    <>
      <Box>
        <Button
          aria-label="show 11 new notifications"
          color="inherit"
          variant="text"
          aria-controls="msgs-menu"
          aria-haspopup="true"
          onClick={handleClick2}
          endIcon={
            <IconChevronDown
              size="15"
              style={{ marginLeft: "-5px", marginTop: "2px" }}
            />
          }
        >
          1뎁스 메뉴 1 - 하위메뉴 있는 것
        </Button>
        {/* ------------------------------------------- */}
        {/* Message Dropdown */}
        {/* ------------------------------------------- */}
        <Menu
          id="msgs-menu"
          anchorEl={anchorEl2}
          keepMounted
          open={Boolean(anchorEl2)}
          onClose={handleClose2}
          anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
          transformOrigin={{ horizontal: "left", vertical: "top" }}
          sx={{
            "& .MuiMenu-paper": {
              width: "850px",
            },
            "& .MuiMenu-paper ul": {
              p: 0,
            },
          }}
        >
          <Grid container>
            <Grid item sm={4}>
              <Box p={4}>
                <TopMenus />
              </Box>
            </Grid>
          </Grid>
        </Menu>
      </Box>
      <Button
        color="inherit"
        sx={{ color: (theme) => theme.palette.text.secondary }}
        variant="text"
        href="/"
        component={Link}
      >
        1뎁스 메뉴 2
      </Button>
      <Button
        color="inherit"
        sx={{ color: (theme) => theme.palette.text.secondary }}
        variant="text"
        href="/"
        component={Link}
      >
        1뎁스 메뉴 3
      </Button>
      <Button
        color="inherit"
        sx={{ color: (theme) => theme.palette.text.secondary }}
        variant="text"
        href="/"
        component={Link}
      >
        1뎁스 메뉴 4
      </Button>
      <Button
        color="inherit"
        sx={{ color: (theme) => theme.palette.text.secondary }}
        variant="text"
        href="/sample/post/list"
        component={Link}
      >
        POST 게시판
      </Button>
    </>
  );
};

export default AppDD;

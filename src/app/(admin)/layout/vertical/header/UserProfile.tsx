import React, { useState } from 'react';
import Link from 'next/link';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import Typography from '@mui/material/Typography';

import { Stack } from '@mui/system';

import { userProfileType } from "@/types/auth/auth";
import LogoutButton from '@/app/components/fsms/fsm/user/LoginButton';


const UserProfile = ({ userNm, authorities }: userProfileType) => {
  const [anchorEl2, setAnchorEl2] = useState(null);
  const handleClick2 = (event: any) => {
    setAnchorEl2(event.currentTarget);
  };
  const handleClose2 = () => {
    setAnchorEl2(null);
  };

  return (
    <Box>
      <IconButton
        size="large"
        aria-label="show 11 new notifications"
        color="inherit"
        aria-controls="msgs-menu"
        aria-haspopup="true"
        sx={{
          ...(typeof anchorEl2 === 'object' && {
            color: 'primary.main',
          }),
        }}
        onClick={handleClick2}
      >
        <Avatar
          src={"/images/profile/user-1.jpg"}
          alt={'ProfileImg'}
          sx={{
            width: 35,
            height: 35,
          }}
        />
      </IconButton>
      {/* ------------------------------------------- */}
      {/* Message Dropdown */}
      {/* ------------------------------------------- */}
      <Menu
        id="msgs-menu"
        anchorEl={anchorEl2}
        keepMounted
        open={Boolean(anchorEl2)}
        onClose={handleClose2}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        sx={{
          '& .MuiMenu-paper': {
            width: '160px',
            p: 4,
          },
        }}
      >
        {/* 회원프로필 및 로그아웃 버튼 */}
        <Typography variant="h5">{ userNm }</Typography>
        <Stack direction="row" py={3} spacing={2} alignItems="center">
          <Box>
            <Typography variant="subtitle2" color="textSecondary">
              {/* authorities */}
            </Typography>
          </Box>
        </Stack>
        <Divider />
        <Box mt={2}>
          <LogoutButton />
        </Box>
      </Menu>
    </Box>
  );
};

export default UserProfile;

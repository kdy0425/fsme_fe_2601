import React from 'react';
import { Button, Stack } from '@mui/material';

const ColorButtons = () => (
  <Stack spacing={1} direction={{ xs: 'column', sm: 'row' }} justifyContent="left">
    <Button variant="contained" color="primary">
      Primary
    </Button>
    <Button variant="contained" color="secondary">
      Secondary
    </Button>
    <Button variant="contained" color="error">
      Error
    </Button>
    <Button variant="contained" color="warning">
      Warning
    </Button>
    <Button variant="contained" color="success">
      Success
    </Button>
    <Button variant="contained" color="dark">
      Default
    </Button>
  </Stack>
);

export default ColorButtons;

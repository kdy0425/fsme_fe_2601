import * as React from 'react';
import { Grid, Box, Divider } from '@mui/material';
import { Tab } from '@mui/material';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';

interface SearchHeaderTabProps {
  value: string;
  onChange: (newValue: string) => void;
}

const COMMON_TAB = [
  { value: '1', label: '화물', disabled: false },
  { value: '2', label: '택시', disabled: false },
];

const SearchHeaderTab: React.FC<SearchHeaderTabProps> = ({ value, onChange }) => {
  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    onChange(newValue);
  };

  return (
    <Grid item xs={12} sm={6} display="flex" alignItems="stretch">
      {/* 탭 시작 */}
      <TabContext value={value}>
        <Box>
          <TabList onChange={handleChange} aria-label="lab API tabs example">
            {COMMON_TAB.map((tab) => (
              <Tab
                key={tab.value}
                label={tab.label}
                value={tab.value}
                disabled={tab.disabled}
              />
            ))}
          </TabList>
        </Box>
        <Divider />
      </TabContext>
      {/* 탭 끝 */}
    </Grid>
  );
};

export default SearchHeaderTab;

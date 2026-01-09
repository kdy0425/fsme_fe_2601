import * as React from 'react'
import { Grid, Box, Divider } from '@mui/material'

import { Tab } from '@mui/material'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'

const COMMON_TAB = [
  { value: '1', label: '화물', disabled: false },
  { value: '2', label: '택시', disabled: false },
  { value: '3', label: '버스', disabled: true },
]

const SearchHeaderTab = () => {
  const [value, setValue] = React.useState('1')

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue)
  }
  return (
    <Grid item xs={12} sm={6} display="flex" alignItems="stretch">
      {/* 탭 시작 */}
      <TabContext value={value}>
        <Box>
          <TabList onChange={handleChange} aria-label="lab API tabs example">
            {COMMON_TAB.map((tab, index) => (
              <Tab
                key={tab.value}
                label={tab.label}
                value={String(index + 1)}
              />
            ))}
          </TabList>
        </Box>
        <Divider />
      </TabContext>
      {/* 탭 끝 */}
    </Grid>
  )
}

export default SearchHeaderTab

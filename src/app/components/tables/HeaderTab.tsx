import * as React from 'react'
import { Grid, Box, Divider } from '@mui/material'

import { Tab, Tabs } from '@mui/material'
import TabContext from '@mui/lab/TabContext'

export type Tab = {
  value: string
  label: string
  active: boolean
}

interface TabProps {
  tabs: Tab[]
  selectedTab: string | number
  onTabChange: (event: React.SyntheticEvent, tabValue: string) => any
}

const HeaderTab = (props: TabProps) => {
  const { tabs, selectedTab, onTabChange } = props

  return (
    <Grid item xs={12} sm={6} display="flex" alignItems="stretch">
      {/* 탭 시작 */}
      <TabContext value={selectedTab}>
        <Box>
          <Tabs
            value={selectedTab}
            onChange={onTabChange}
            indicatorColor="primary"
            aria-label="lab API tabs example"
          >
            {tabs.map((tab, index) => (
              <Tab
                key={tab.value}
                label={tab.label}
                value={String(index + 1)}
              />
            ))}
          </Tabs>
        </Box>
        <Divider />
      </TabContext>
      {/* 탭 끝 */}
    </Grid>
  )
}

export default React.memo(HeaderTab)

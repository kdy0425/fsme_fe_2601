import * as React from 'react'
import { Grid, Box, Divider } from '@mui/material'

import { Tab } from '@mui/material'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import { SelectItem } from 'select'
import { useSearchParams } from 'next/navigation'

interface TabProps {
  tabs: SelectItem[]
  onChange: React.Dispatch<React.SetStateAction<string>>
}

const HeaderTab: React.FC<TabProps> = ({ tabs, onChange }) => {
  
  const querys = useSearchParams() // 쿼리스트링을 가져옴
  const allParams = Object.fromEntries(querys.entries()) // 쿼리스트링 값을 오브젝트 형식으로 담음
  
  React.useEffect(() => {
    
    const tabIndex = allParams.tabIndex;

    if (tabIndex) {
      setValue(tabIndex)
    } else {
      setValue(tabs[0].value)
    }    
  }, [tabs])

  const [value, setValue] = React.useState(tabs[0].value)

  const handleChange = (value: string) => {
    onChange(value)
    setValue(value)
  }

  return (
    <Grid item xs={12} sm={6} display="flex" alignItems="stretch">
      {/* 탭 시작 */}
      <TabContext value={value}>
        <Box>
          <TabList
            onChange={(event, value) => handleChange(value)}
            aria-label="lab API tabs example"
          >
            {tabs.map((tab, index) => (
              <Tab
                style={{ fontSize: '1rem', fontWeight: '600' }}
                label={tab.label}
                value={tab.value}
                key={index + 1}
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

export default HeaderTab

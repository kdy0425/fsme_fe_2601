import * as React from 'react'
import { Grid, Box, Divider } from '@mui/material'

import { Tab } from '@mui/material'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'

/* interface 선언 */
interface FCinterface {
  tabList:Array<string>,
  tabIndex:string,
  setTabIndex:(nTabNum:string) => void,
}

interface tabInterface {
  label:string,
}

const TxSearchHeaderTab = (props:FCinterface) => {
  
  const { tabList, tabIndex, setTabIndex } = props;

  const[list, setList] = React.useState<tabInterface[]>([]);

  React.useEffect(() => {

    const result:tabInterface[] = [];

    tabList.map((item, index) => {
      result.push({'label':item});
    });

    setList(result);
    setTabIndex('0');
    
  }, []);

  const handleChange = (event:React.SyntheticEvent, newValue:string) => setTabIndex(newValue);

  return (
    <Grid item xs={12} sm={6} display="flex" alignItems="stretch">
      <TabContext value={tabIndex}>
        <Box>
          <TabList onChange={handleChange} aria-label="lab API tabs example">
            {list.map((tab, index) => (
              <Tab
                style={{fontSize:'1rem', fontWeight:'600'}}
                key={index}
                label={tab.label}
                value={index.toString()}
              />
            ))}
          </TabList>
        </Box>
        <Divider />
      </TabContext>
    </Grid>
  )
}

export default React.memo(TxSearchHeaderTab);
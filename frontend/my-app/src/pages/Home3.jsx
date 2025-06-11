import * as React from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import { testItems } from '../data/testItems';
import AuctionItem from '../components/AuctionItem';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`,
  };
}

export function Home3() {
    const theme = useTheme();
    const [value, setValue] = React.useState(0);
    const [hasItems, setHasItems] = React.useState(true);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const renderContent = () => {
        if (!hasItems) {
            return (
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '300px', gap: 2 }}>
                    <img src="/non_fish.svg" style={{ width: '300px', height: 'auto' }} />
                    <Typography variant="body1" color="text.secondary">
                        참여한 경매가 없어요! 경매에 참여해보세요.
                    </Typography>
                </Box>
            );
        }

        return (
            <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                {testItems.map((item, index) => (
                    <React.Fragment key={item.id}>
                        <AuctionItem item={item} />
                        {index < testItems.length - 1 && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                ))}
            </List>
        );
    };

    return (
        <Box sx={{ bgcolor: 'background.paper', width: "100%" }}>
            <AppBar position="static">
                <Tabs
                    value={value}
                    onChange={handleChange}
                    indicatorColor="secondary"
                    textColor="inherit"
                    variant="fullWidth"
                    centered
                >
                    <Tab label="내가 참여한 경매" {...a11yProps(0)} />
                    <Tab label="내가 개설한 경매" {...a11yProps(1)} />
                </Tabs>
            </AppBar>
            <TabPanel value={value} index={0} dir={theme.direction}>
                {renderContent()}
            </TabPanel>
            <TabPanel value={value} index={1} dir={theme.direction}>
                내가 개설한 경매
            </TabPanel>
        </Box>
    )
}
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
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';
import { testItems } from '../data/testItems';
import AuctionItem from '../components/AuctionItem';
import FormDialog from '../components/FormDialog';

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
    const navigate = useNavigate();
    const [value, setValue] = React.useState(0);
    const [hasItems, setHasItems] = React.useState(true);
    const [isSeller, setIsSeller] = React.useState(false);
    const [openSellerForm, setOpenSellerForm] = React.useState(false);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const handleSellerSubmit = (formData) => {
        console.log('판매자 정보:', formData);
        setIsSeller(true);
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
                        <AuctionItem item={item} isSupplier={false} />
                        {index < testItems.length - 1 && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                ))}
            </List>
        );
    };

    const renderSellerContent = () => {
        if (!isSeller) {
            return (
                <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'flex-start', 
                    alignItems: 'center', 
                    height: '300px',
                    pt: 8,
                    gap: 4
                }}>
                    <img src="/Person.svg" style={{ width: '250px', height: 'auto' }} />
                    <Typography variant="h6" color="text.secondary" sx={{ mb: -3 }}>
                        판매자 등록 후 매물 등록이 가능합니다.
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        onClick={() => setOpenSellerForm(true)}
                        sx={{
                            width: '200px',
                            fontSize: '1.2rem',
                            py: 2,
                        }}
                    >
                        판매자 등록하기
                    </Button>
                    <FormDialog
                        open={openSellerForm}
                        onClose={() => setOpenSellerForm(false)}
                        onSubmit={handleSellerSubmit}
                        title="판매자 등록"
                        hasClose={true}
                        submitText="등록하기"
                        fields={[
                            {
                                name: 'businessName',
                                label: '사업자명',
                                required: true,
                                variant: 'outlined'
                            },
                            {
                                name: 'businessLicense',
                                label: '사업자 등록증',
                                type: 'file',
                                required: true,
                                variant: 'outlined'
                            }
                        ]}
                        disableBackdropClose={true}
                        buttonProps={{
                            sx: {
                                minWidth: '120px',
                                height: '40px',
                                fontSize: '1.1rem'
                            }
                        }}
                    />
                </Box>
            );
        }

        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                    {testItems.map((item, index) => (
                        <React.Fragment key={item.id}>
                            <AuctionItem item={item} isSupplier={true} />
                            {index < testItems.length - 1 && <Divider variant="inset" component="li" />}
                        </React.Fragment>
                    ))}
                </List>
                <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={() => navigate('/post/:id')}
                    sx={{
                        width: '200px',
                        fontSize: '1.2rem',
                        py: 2,
                        mt: 2
                    }}
                >
                    매물 추가하기
                </Button>
            </Box>
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
                {renderSellerContent()}
            </TabPanel>
        </Box>
    )
}
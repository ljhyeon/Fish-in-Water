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
import Alert from '@mui/material/Alert';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useUserAuctions } from '../hooks/useAuction';
import { uploadSellerDocument } from '../services/userService';
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
          {children}
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
    const { user, userInfo, isAuthenticated } = useAuth();
    
    // 사용자 경매 데이터 조회 - 인덱스 오류 방지를 위해 임시로 비활성화
    const { auctions: participatedAuctions, loading: participatedLoading, error: participatedError } = useUserAuctions('bidder');
    const { auctions: createdAuctions, loading: createdLoading, error: createdError } = useUserAuctions('seller');
    
    const [value, setValue] = React.useState(0);
    const [openSellerForm, setOpenSellerForm] = React.useState(false);
    const [submittingDocs, setSubmittingDocs] = React.useState(false);
    const [submitError, setSubmitError] = React.useState('');

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const handleSellerSubmit = async (formData) => {
        if (!user || !userInfo) {
            setSubmitError('로그인이 필요합니다.');
            return;
        }

        if (userInfo.user_type !== 'seller') {
            setSubmitError('판매자 계정만 서류를 제출할 수 있습니다.');
            return;
        }

        try {
            setSubmittingDocs(true);
            setSubmitError('');

            const businessNumber = formData.businessNumber;
            const businessLicense = formData.businessLicense;

            if (!businessNumber || !businessLicense) {
                throw new Error('사업자 등록번호와 사업자 등록증을 모두 입력해주세요.');
            }

            await uploadSellerDocument(user.uid, businessLicense, businessNumber);
            
            setOpenSellerForm(false);
            alert('서류가 제출되었습니다. 관리자 검토 후 인증이 완료됩니다.');
        } catch (error) {
            console.error('판매자 서류 제출 실패:', error);
            setSubmitError(error.message);
        } finally {
            setSubmittingDocs(false);
        }
    };

    // Firebase 경매 데이터를 기존 testItems 형식으로 변환
    const convertAuctionToItem = (auction) => {
        let consumerStatus, supplierStatus;
        
        switch (auction.status) {
            case 'PENDING':
                consumerStatus = supplierStatus = '시작 예정';
                break;
            case 'ACTIVE':
                consumerStatus = supplierStatus = '진행중';
                break;
            case 'FINISHED':
                if (auction.final_price && auction.winner_id) {
                    consumerStatus = auction.winner_id === user?.uid ? '낙찰/결제대기중' : '유찰';
                    supplierStatus = '정산대기중';
                } else {
                    consumerStatus = supplierStatus = '유찰';
                }
                break;
            default:
                consumerStatus = supplierStatus = '알 수 없음';
        }

        return {
            id: auction.id,
            name: auction.name,
            image: auction.image_url || '/fish1.jpg',
            origin: auction.location,
            description: auction.description,
            startPrice: auction.starting_price,
            currentPrice: auction.final_price,
            finalPrice: auction.final_price,
            status: {
                consumer: consumerStatus,
                supplier: supplierStatus
            }
        };
    };

    const renderContent = () => {
        if (!isAuthenticated) {
            return (
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '300px', gap: 2 }}>
                    <img src="/non_fish.svg" style={{ width: '300px', height: 'auto' }} />
                    <Typography variant="body1" color="text.secondary">
                        로그인 후 참여한 경매를 확인하실 수 있습니다.
                    </Typography>
                </Box>
            );
        }

        // Firestore 인덱스 오류 처리
        if (participatedError) {
            const isIndexError = participatedError.message && participatedError.message.includes('index');
            
            if (isIndexError) {
                return (
                    <Box sx={{ p: 2 }}>
                        <Alert severity="warning" sx={{ mb: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                데이터베이스 인덱스 생성 중
                            </Typography>
                            <Typography variant="body2">
                                Firebase Firestore 인덱스가 생성 중입니다. 잠시 후 다시 시도해주세요.
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1 }}>
                                일반적으로 몇 분 내에 완료됩니다.
                            </Typography>
                        </Alert>
                        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '200px', gap: 2 }}>
                            <img src="/non_fish.svg" style={{ width: '200px', height: 'auto' }} />
                            <Typography variant="body2" color="text.secondary">
                                인덱스 생성이 완료되면 경매 목록이 표시됩니다.
                            </Typography>
                        </Box>
                    </Box>
                );
            } else {
                return (
                    <Box sx={{ p: 2 }}>
                        <Alert severity="error" sx={{ mb: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                데이터 로드 오류
                            </Typography>
                            <Typography variant="body2">
                                {participatedError.message}
                            </Typography>
                        </Alert>
                    </Box>
                );
            }
        }

        if (participatedLoading) {
            return (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <Typography>경매 정보를 불러오는 중...</Typography>
                </Box>
            );
        }

        if (!participatedAuctions || participatedAuctions.length === 0) {
            return (
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '300px', gap: 2 }}>
                    <img src="/non_fish.svg" style={{ width: '300px', height: 'auto' }} />
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                        참여한 경매가 없어요! 경매에 참여해보세요.
                    </Typography>
                    <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => navigate('/test-data')}
                        sx={{ mt: 1 }}
                    >
                        테스트 데이터 생성하기
                    </Button>
                </Box>
            );
        }

        return (
            <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                {testItems.map((item, index) => (
                    <React.Fragment key={item.id}>
                        <AuctionItem 
                            item={item} 
                            isSupplier={false} 
                            onClick={() => navigate(`/info2/${item.id}`)}
                        />
                        {index < testItems.length - 1 && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                ))}
            </List>
        );
    };

    const renderSellerContent = () => {
        if (!isAuthenticated) {
            return (
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '300px', gap: 2 }}>
                    <img src="/Person.svg" style={{ width: '250px', height: 'auto' }} />
                    <Typography variant="body1" color="text.secondary">
                        로그인 후 판매자 기능을 이용하실 수 있습니다.
                    </Typography>
                </Box>
            );
        }

        if (userInfo?.user_type !== 'seller') {
            return (
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '300px', gap: 2 }}>
                    <img src="/Person.svg" style={{ width: '250px', height: 'auto' }} />
                    <Typography variant="body1" color="text.secondary">
                        판매자 계정이 아닙니다. 판매자로 재가입해주세요.
                    </Typography>
                </Box>
            );
        }

        // 판매자 인증이 완료되지 않은 경우
        if (!userInfo?.seller_info?.is_verified) {
            const hasSubmittedDocs = userInfo?.seller_info?.document_url;
            
            return (
                <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'flex-start', 
                    alignItems: 'center', 
                    height: '400px',
                    pt: 6,
                    gap: 3
                }}>
                    <img src="/Person.svg" style={{ width: '250px', height: 'auto' }} />
                    
                    {hasSubmittedDocs ? (
                        <>
                            <Typography variant="h6" color="text.secondary">
                                서류 검토 중입니다
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                                제출하신 사업자 등록증을 검토 중입니다.<br/>
                                승인까지 1-2일 정도 소요될 수 있습니다.
                            </Typography>
                            <Alert severity="info" sx={{ maxWidth: '400px' }}>
                                서류 검토가 완료되면 경매를 개설하실 수 있습니다.
                            </Alert>
                        </>
                    ) : (
                        <>
                            <Typography variant="h6" color="text.secondary" sx={{ mb: -1 }}>
                                판매자 인증이 필요합니다
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 1 }}>
                                경매 개설을 위해 사업자 등록증을 제출해주세요.
                            </Typography>
                            
                            {submitError && (
                                <Alert severity="error" sx={{ maxWidth: '400px', mb: 2 }}>
                                    {submitError}
                                </Alert>
                            )}
                            
                            <Button
                                variant="contained"
                                color="primary"
                                size="large"
                                onClick={() => setOpenSellerForm(true)}
                                disabled={submittingDocs}
                                sx={{
                                    width: '200px',
                                    fontSize: '1.2rem',
                                    py: 2,
                                }}
                            >
                                {submittingDocs ? '제출 중...' : '서류 제출하기'}
                            </Button>
                        </>
                    )}
                    
                    <FormDialog
                        open={openSellerForm}
                        onClose={() => setOpenSellerForm(false)}
                        onSubmit={handleSellerSubmit}
                        title="판매자 인증 서류 제출"
                        hasClose={true}
                        submitText={submittingDocs ? "제출 중..." : "제출하기"}
                        fields={[
                            {
                                name: 'businessNumber',
                                label: '사업자 등록번호',
                                placeholder: '000-00-00000',
                                required: true,
                                variant: 'outlined'
                            },
                            {
                                name: 'businessLicense',
                                label: '사업자 등록증',
                                type: 'file',
                                accept: 'image/*,.pdf',
                                required: true,
                                variant: 'outlined',
                                helperText: '이미지 파일 또는 PDF 파일을 업로드해주세요'
                            }
                        ]}
                        disableBackdropClose={true}
                        buttonProps={{
                            disabled: submittingDocs,
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

        // Firestore 인덱스 오류 처리
        if (createdError) {
            const isIndexError = createdError.message && createdError.message.includes('index');
            
            if (isIndexError) {
                return (
                    <Box sx={{ p: 2 }}>
                        <Alert severity="warning" sx={{ mb: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                데이터베이스 인덱스 생성 중
                            </Typography>
                            <Typography variant="body2">
                                Firebase Firestore 인덱스가 생성 중입니다. 잠시 후 다시 시도해주세요.
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1 }}>
                                일반적으로 몇 분 내에 완료됩니다.
                            </Typography>
                        </Alert>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                            <Button
                                variant="contained"
                                color="primary"
                                size="large"
                                onClick={() => navigate('/info2')}
                                sx={{
                                    width: '200px',
                                    fontSize: '1.2rem',
                                    py: 2,
                                    mt: 2
                                }}
                            >
                                매물 추가하기
                            </Button>
                            <Button
                                variant="outlined"
                                color="secondary"
                                onClick={() => navigate('/test-data')}
                                sx={{ mt: 1 }}
                            >
                                테스트 데이터 생성하기
                            </Button>
                        </Box>
                    </Box>
                );
            } else {
                return (
                    <Box sx={{ p: 2 }}>
                        <Alert severity="error" sx={{ mb: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                데이터 로드 오류
                            </Typography>
                            <Typography variant="body2">
                                {createdError.message}
                            </Typography>
                        </Alert>
                    </Box>
                );
            }
        }

        // 인증된 판매자의 경매 목록
        if (createdLoading) {
            return (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <Typography>경매 정보를 불러오는 중...</Typography>
                </Box>
            );
        }

        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                    {testItems.map((item, index) => (
                        <React.Fragment key={item.id}>
                            <AuctionItem 
                                item={item} 
                                isSupplier={true} 
                                onClick={() => navigate(`/info2/${item.id}`)}
                            />
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
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
import { uploadSellerDocument, convertToSeller } from '../services/userService';
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
      style={{ height: '100%' }}
      {...other}
    >
      {value === index && (
        <Box sx={{ height: '100%' }}>
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
    const { user, userInfo, isAuthenticated, setUserInfo } = useAuth();
    
    // 사용자 경매 데이터 조회 - 인덱스 오류 방지를 위해 임시로 비활성화
    const { auctions: participatedAuctions, loading: participatedLoading, error: participatedError } = useUserAuctions('bidder');
    const { auctions: createdAuctions, loading: createdLoading, error: createdError } = useUserAuctions('seller');
    
    const [value, setValue] = React.useState(0);
    const [openSellerForm, setOpenSellerForm] = React.useState(false);
    const [openConvertForm, setOpenConvertForm] = React.useState(false);
    const [submittingDocs, setSubmittingDocs] = React.useState(false);
    const [convertingToSeller, setConvertingToSeller] = React.useState(false);
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

    const handleConvertToSeller = async (formData) => {
        if (!user || !userInfo) {
            setSubmitError('로그인이 필요합니다.');
            return;
        }

        try {
            setConvertingToSeller(true);
            setSubmitError('');

            const businessName = formData.businessName;
            const businessNumber = formData.businessNumber;
            const businessLicense = formData.businessLicense;

            if (!businessName || !businessNumber) {
                throw new Error('사업자명과 사업자 등록번호를 입력해주세요.');
            }

            const updatedUserInfo = await convertToSeller(user.uid, businessName, businessNumber, businessLicense);
            setUserInfo(updatedUserInfo);
            
            setOpenConvertForm(false);
            setSubmitError('');
            alert('판매자 등록이 완료되었습니다!');
        } catch (error) {
            console.error('판매자 전환 실패:', error);
            setSubmitError(error.message);
        } finally {
            setConvertingToSeller(false);
        }
    };

    // Firebase 경매 데이터를 기존 testItems 형식으로 변환
    const convertAuctionToItem = (auction) => {
        // displayStatus가 이미 있으면 사용, 없으면 기본 상태 로직 적용
        let displayStatus = auction.displayStatus;
        
        if (!displayStatus) {
            switch (auction.status) {
                case 'PENDING':
                    displayStatus = '시작 예정';
                    break;
                case 'ACTIVE':
                    displayStatus = '진행중';
                    break;
                case 'FINISHED':
                    if (auction.finalPrice && auction.winner_id) {
                        displayStatus = auction.winner_id === user?.uid ? '낙찰/결제대기중' : '낙찰완료';
                    } else {
                        displayStatus = '유찰';
                    }
                    break;
                case 'NO_BID':
                    displayStatus = '유찰';
                    break;
                default:
                    displayStatus = '알 수 없음';
            }
        }

        // Firestore Timestamp를 문자열로 변환
        const formatFirestoreDate = (timestamp) => {
            if (!timestamp) return '';
            // Firestore Timestamp 객체인 경우
            if (timestamp.toDate) {
                return timestamp.toDate().toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm 형식
            }
            // 이미 문자열인 경우
            if (typeof timestamp === 'string') {
                return timestamp;
            }
            return '';
        };

        return {
            id: auction.id,
            name: auction.name,
            image: auction.image || '/fish1.jpg',
            origin: auction.origin,
            description: auction.description,
            startPrice: auction.startPrice,
            currentPrice: auction.currentPrice || auction.startPrice,
            finalPrice: auction.finalPrice,
            recommend: auction.recommend,
            auction_start_time: formatFirestoreDate(auction.auction_start_time),
            auction_end_time: formatFirestoreDate(auction.auction_end_time),
            seller: auction.seller,
            displayStatus: displayStatus // 문자열로 설정
        };
    };

    const renderContent = () => {
        if (!isAuthenticated) {
            return (
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', gap: 2 }}>
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
                    <Box sx={{ p: 2, height: '100%' }}>
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
                    <Box sx={{ p: 2, height: '100%' }}>
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
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4, height: '100%' }}>
                    <Typography>경매 정보를 불러오는 중...</Typography>
                </Box>
            );
        }

        if (!participatedAuctions || participatedAuctions.length === 0) {
            return (
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', gap: 2 }}>
                    <img src="/non_fish.svg" style={{ width: '300px', height: 'auto' }} />
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                        참여한 경매가 없어요! 경매에 참여해보세요.
                    </Typography>
                </Box>
            );
        }

        return (
            <List sx={{ width: '100%', bgcolor: 'background.paper', height: '100%', overflow: 'auto' }}>
                {participatedAuctions.map((item, index) => (
                    <React.Fragment key={item.id}>
                        <AuctionItem 
                            item={item} 
                            isSupplier={false} 
                            onClick={() => navigate(`/info2/${item.id}`)}
                        />
                        {index < participatedAuctions.length - 1 && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                ))}
            </List>
        );
    };

    const renderSellerContent = () => {
        if (!isAuthenticated) {
            return (
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', gap: 2 }}>
                    <img src="/Person.svg" style={{ width: '250px', height: 'auto' }} />
                    <Typography variant="body1" color="text.secondary">
                        로그인 후 판매자 기능을 이용하실 수 있습니다.
                    </Typography>
                </Box>
            );
        }

        // 소비자인 경우 판매자 등록 화면 표시
        if (userInfo?.user_type === 'consumer') {
            return (
                <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'flex-start', 
                    alignItems: 'center', 
                    height: '100%',
                    pt: 6,
                    gap: 3
                }}>
                    <img src="/Person.svg" style={{ width: '250px', height: 'auto' }} />
                    
                    <Typography variant="h6" color="text.secondary" sx={{ mb: -1 }}>
                        판매자 등록 후 이용 가능한 기능입니다
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 1 }}>
                        판매자 등록을 통해 경매를 개설하실 수 있습니다.
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
                        onClick={() => {
                            setSubmitError('');
                            setOpenConvertForm(true);
                        }}
                        disabled={convertingToSeller}
                        sx={{
                            width: '200px',
                            fontSize: '1.2rem',
                            py: 2,
                        }}
                    >
                        {convertingToSeller ? '등록 중...' : '판매자 등록하기'}
                    </Button>
                    
                    <FormDialog
                        open={openConvertForm}
                        onClose={() => setOpenConvertForm(false)}
                        onSubmit={handleConvertToSeller}
                        title="판매자 등록"
                        hasClose={true}
                        submitText={convertingToSeller ? "등록 중..." : "접수"}
                        fields={[
                            {
                                name: 'businessName',
                                label: '사업자명',
                                placeholder: '회사명 또는 상호명을 입력하세요',
                                required: true,
                                variant: 'outlined'
                            },
                            {
                                name: 'businessNumber',
                                label: '사업자 등록번호',
                                placeholder: '123-45-67890',
                                required: true,
                                variant: 'outlined',
                                helperText: '하이픈(-)을 포함해서 입력해주세요'
                            },
                            {
                                name: 'businessLicense',
                                label: '사업자 등록증',
                                type: 'file',
                                accept: 'image/*,.pdf',
                                required: false,
                                variant: 'outlined',
                                helperText: '(임시) 파일 업로드는 선택사항입니다'
                            }
                        ]}
                        disableBackdropClose={true}
                        buttonProps={{
                            disabled: convertingToSeller,
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

        if (userInfo?.user_type !== 'seller') {
            return (
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', gap: 2 }}>
                    <img src="/Person.svg" style={{ width: '250px', height: 'auto' }} />
                    <Typography variant="body1" color="text.secondary">
                        알 수 없는 계정 유형입니다.
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
                    height: '100%',
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
                                onClick={() => navigate('/post')}
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
            <List sx={{ 
                width: '100%', 
                bgcolor: 'background.paper', 
                height: '100%',
                overflow: 'auto',
                p: 0
            }}>
                {/* 기존 경매 목록 */}
                {createdAuctions && createdAuctions.length > 0 && 
                    createdAuctions.map((auction, index) => {
                        const item = convertAuctionToItem(auction);
                        return (
                            <React.Fragment key={item.id}>
                                <AuctionItem 
                                    item={item} 
                                    isSupplier={true} 
                                    onClick={() => navigate(`/info2/${item.id}`)}
                                />
                                <Divider variant="inset" component="li" />
                            </React.Fragment>
                        );
                    })
                }
                
                {/* 매물 추가 버튼 (리스트 아이템 형태) */}
                <Box
                    onClick={() => navigate('/post')}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '80px',
                        cursor: 'pointer',
                        bgcolor: 'background.paper',
                        borderRadius: 2,
                        mx: 2,
                        my: 1,
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                            bgcolor: 'action.hover',
                            borderColor: 'primary.main',
                            transform: 'scale(1.02)'
                        }
                    }}
                >
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 1,
                        color: 'text.secondary'
                    }}>
                        <Box sx={{
                            width: 50,
                            height: 50,
                            borderRadius: '50%',
                            bgcolor: 'grey.500',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '2rem',
                            fontWeight: 'bold'
                        }}>
                            <Typography sx={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '10px' }}>+</Typography>
                        </Box>
                    </Box>
                </Box>
            </List>
        );
    };

    return (
        <Box sx={{ 
            bgcolor: 'background.paper', 
            width: "100%", 
            height: "100%",
            display: 'flex',
            flexDirection: 'column'
        }}>
            <AppBar position="static" sx={{ flexShrink: 0 }}>
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
            <Box sx={{ flex: 1, overflow: 'hidden' }}>
                <TabPanel value={value} index={0} dir={theme.direction}>
                    {renderContent()}
                </TabPanel>
                <TabPanel value={value} index={1} dir={theme.direction}>
                    {renderSellerContent()}
                </TabPanel>
            </Box>
        </Box>
    )
}
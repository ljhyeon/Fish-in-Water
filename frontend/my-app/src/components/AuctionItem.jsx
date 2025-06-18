import { ListItem, ListItemText, ListItemAvatar, Avatar, Typography, Box } from '@mui/material';
import ColoredChip from './ColoredChip';

export default function AuctionItem({ item, isSupplier = false, onClick, pageType = 'home3', seller=false, }) {
    const getStatusColor = (status) => {
        switch (status) {
            case '진행중':
            case 'ACTIVE':
                return { color: 'primary', variant: 'dark' };
            case '낙찰/결제대기중':
            case '정산대기중':
            case 'FINISHED':
                return { color: 'secondary', variant: 'main' };
            case '낙찰/결제완료':
            case '완료':
                return { color: 'secondary', variant: 'light' };
            case '유찰':
            case 'NO_BID':
                return { color: 'primary', variant: 'main' };
            default:
                return { color: 'default', variant: 'main' };
        }
    };

    const getStatus = (status, paid, settled, seller) => {
        switch (status) {
            case 'ACTIVE':
                return '진행중';
            case 'PENDING':
                return '진행 예정';
            case 'FINISHED':
                if (seller) {
                    if (settled) return '완료';
                    else return '정산 대기중';
                }
                if (paid) return '낙찰 / 결제 완료';
                else return '낙찰 / 결제 대기중';
            case 'NO_BID':
                return '유찰';
            default:
                return status;
        }
    }

    // Firebase 데이터 구조에 맞게 상태 처리
    const status = item.displayStatus || item.status || (isSupplier ? item.status?.supplier : item.status?.consumer);
    const paid = item.is_payment_completed;
    const settled = item.is_settlement_completed;
    const statusColor = getStatusColor(status, paid, settled);
    const statusLabel = getStatus(status, paid, settled, seller);

    const renderContent = () => {
        switch (pageType) {
            case 'home1':
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, ml: 3 }}>
                        <Typography variant="h6">{item.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                            {item.recommend}
                        </Typography>
                    </Box>
                );
            case 'home2':
                return (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, ml: 3 }}>
                        <Typography variant="h6">{item.name}</Typography>
                    </Box>
                );
            case 'home3':
            default:
                return (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, ml: 3 }}>
                        <Typography variant="h6">{item.name}</Typography>
                        <ColoredChip 
                            // label={status} 
                            label={statusLabel}
                            color={statusColor.color}
                            colorVariant={statusColor.variant}
                            size="small"
                        />
                    </Box>
                );
        }
    };

    return (
        <ListItem 
            alignItems="flex-start" 
            sx={{ 
                px: 2,
                cursor: 'pointer',
                '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)'
                }
            }}
            onClick={onClick}
        >
            <ListItemAvatar>
                <Avatar alt={item.name} src={item.image} sx={{ width: 80, height: 80, objectFit: 'contain' }} />
            </ListItemAvatar>
            <ListItemText
                primary={renderContent()}
                secondary={
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 3 }}>
                        {item.origin}
                    </Typography>
                }
            />
        </ListItem>
    );
}
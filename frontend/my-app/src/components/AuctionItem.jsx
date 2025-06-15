import { ListItem, ListItemText, ListItemAvatar, Avatar, Typography, Box } from '@mui/material';
import ColoredChip from './ColoredChip';

export default function AuctionItem({ item, isSupplier = false, onClick }) {
    const getStatusColor = (status) => {
        switch (status) {
            case '진행중':
                return { color: 'primary', variant: 'dark' };
            case '낙찰/결제대기중':
            case '정산대기중':
                return { color: 'secondary', variant: 'main' };
            case '낙찰/결제완료':
            case '완료':
                return { color: 'secondary', variant: 'light' };
            case '유찰':
                return { color: 'primary', variant: 'main' };
            default:
                return { color: 'default', variant: 'main' };
        }
    };

    const status = isSupplier ? item.status.supplier : item.status.consumer;
    const statusColor = getStatusColor(status);

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
                <Avatar alt={item.name} src={item.image} sx={{ width: 80, height: 80 }} />
            </ListItemAvatar>
            <ListItemText
                primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, ml: 3 }}>
                        <Typography variant="h6">{item.name}</Typography>
                        <ColoredChip 
                            label={status} 
                            color={statusColor.color}
                            colorVariant={statusColor.variant}
                            size="small"
                        />
                    </Box>
                }
                secondary={
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 3 }}>
                        {item.origin}
                    </Typography>
                }
            />
        </ListItem>
    );
}
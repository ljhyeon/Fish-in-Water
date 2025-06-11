import React from 'react';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import ColoredChip from './ColoredChip';

const getStatusColor = (status) => {
    switch (status) {
        case '낙찰/결제 대기중':
            return { color: 'secondary', variant: 'main' };
        case '낙찰/결제 완료':
            return { color: 'secondary', variant: 'light' };
        case '유찰':
            return { color: 'primary', variant: 'main' };
        case '진행중':
            return { color: 'primary', variant: 'dark' };
        default:
            return { color: 'default', variant: 'main' };
    }
};

const AuctionItem = ({ item }) => {
    return (
        <ListItem alignItems="flex-start">
            <ListItemAvatar>
                <Avatar 
                    alt={item.name} 
                    src={item.image}
                    sx={{ width: 80, height: 80 }}
                />
            </ListItemAvatar>
            <ListItemText
                primary={
                    <Typography variant="h6" component="div" sx={{ mb: 0.5, ml: 3 }}>
                        {item.name}
                    </Typography>
                }
                secondary={
                    <React.Fragment>
                        <Typography
                            component="span"
                            variant="body2"
                            sx={{ color: 'text.primary', display: 'block', mb: 1, ml: 3 }}
                        >
                            {item.origin}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: -5 }}>
                            <ColoredChip 
                                label={item.status}
                                color={getStatusColor(item.status).color}
                                colorVariant={getStatusColor(item.status).variant}
                                size="small"
                            />
                        </Box>
                    </React.Fragment>
                }
            />
        </ListItem>
    );
};

export default AuctionItem; 
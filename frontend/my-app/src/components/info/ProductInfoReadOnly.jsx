import { Box, Typography } from "@mui/material"
import RoomOutlinedIcon from '@mui/icons-material/RoomOutlined';
import AccessAlarmOutlinedIcon from '@mui/icons-material/AccessAlarmOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';

function formatAuctionTime(start, end) {
    const startDate = new Date(start);
    const endDate = new Date(end);

    const pad = (num) => num.toString().padStart(2, '0');

    const formatDate = (date) => 
        `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    const formatTime = (date) =>
        `${pad(date.getHours())}:${pad(date.getMinutes())}`;

    const sameDate =
        startDate.getFullYear() === endDate.getFullYear() &&
        startDate.getMonth() === endDate.getMonth() &&
        startDate.getDate() === endDate.getDate();

    if (sameDate) {
        return `${formatDate(startDate)} ${formatTime(startDate)} ~ ${formatTime(endDate)}`;
    } else {
        return `${formatDate(startDate)} ${formatTime(startDate)} ~ ${formatDate(endDate)} ${formatTime(endDate)}`;
    }
}

export function ProductInfoReadOnly({ 
    dummyData
}) {
    return (
        <Box sx={{ p: '20px' }}>
            <Box sx={{ display: 'flex', mb: 2, alignItems: 'baseline', gap: 1 }}>
                <Typography 
                    variant="h5" 
                    sx={{ fontWeight: '800',  mb: 0.5 }}
                >
                    {dummyData.product_name}
                </Typography>
                <Typography 
                    variant="overline" 
                    sx={{ color: 'grey.700' }}
                >
                    {dummyData.recommend}
                </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2, }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <RoomOutlinedIcon sx={{ color: 'secondary.main' }} />
                    <Typography variant="body2" sx={{ color: 'grey.700' }}>
                        {dummyData.origin}
                    </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccessAlarmOutlinedIcon sx={{ color: 'secondary.main' }} />
                    <Typography variant="body2" sx={{ color: 'grey.700' }}>
                        {formatAuctionTime(dummyData.auction_start_time, dummyData.auction_end_time)}
                    </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PaymentsOutlinedIcon sx={{ color: 'secondary.main' }} />
                    <Typography variant="body2" sx={{ color: 'grey.700' }}>
                        {dummyData.expected_price.toLocaleString('ko-KR')} 원
                    </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonOutlineOutlinedIcon sx={{ color: 'secondary.main' }} />
                    <Typography variant="body2" sx={{ color: 'grey.700' }}>
                        {dummyData.seller}
                    </Typography>
                </Box>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2, }}>
                <Typography variant="Body2" sx={{fontWeight: 800}}>매물 소개</Typography>
                <Typography variant="overlined">{dummyData.additional_notes}</Typography>
            </Box>
        </Box>
    );
}
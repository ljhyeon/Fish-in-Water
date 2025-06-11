import { Box, Typography } from "@mui/material"
import RoomOutlinedIcon from '@mui/icons-material/RoomOutlined';
import AccessAlarmOutlinedIcon from '@mui/icons-material/AccessAlarmOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';

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
                    {dummyData.name}
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
                        {dummyData.location}
                    </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccessAlarmOutlinedIcon sx={{ color: 'secondary.main' }} />
                    <Typography variant="body2" sx={{ color: 'grey.700' }}>
                        {dummyData.time}
                    </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PaymentsOutlinedIcon sx={{ color: 'secondary.main' }} />
                    <Typography variant="body2" sx={{ color: 'grey.700' }}>
                        {dummyData.min_price.toLocaleString('ko-KR')} 원
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
                <Typography variant="overlined">{dummyData.description}</Typography>
            </Box>
        </Box>
    );
}
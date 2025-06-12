import { Box, Typography, TextField, InputAdornment, Button } from "@mui/material"
import RoomOutlinedIcon from '@mui/icons-material/RoomOutlined';
import AccessAlarmOutlinedIcon from '@mui/icons-material/AccessAlarmOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';

export function ProductInfoForm({ 
    formData,
    onFormChange,
    seller,
    errors = {}
}) {
    const handleChange = (field) => (event) => {
        const value = field === 'min_price' 
            ? parseInt(event.target.value.replace(/,/g, ''), 10) || 0
            : event.target.value;
        
        onFormChange({
            ...formData,
            [field]: value
        });
    };

    const formatPrice = (value) => {
        return value ? value.toLocaleString('ko-KR') : '';
    };

    return (
        <Box sx={{ p: '20px' }}>
            {/* 상품명 */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                <TextField
                    label="상품명"
                    value={formData.name || ''}
                    onChange={handleChange('name')}
                    error={!!errors.name}
                    helperText={errors.name}
                    variant="outlined"
                    fullWidth
                    sx={{ '& .MuiInputBase-input': { fontWeight: '600', fontSize: '1.25rem' } }}
                />
            </Box>
            
            {/* 상세 정보 입력 */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                <TextField
                    label="위치"
                    value={formData.location || ''}
                    onChange={handleChange('location')}
                    error={!!errors.location}
                    helperText={errors.location}
                    variant="outlined"
                    fullWidth
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <RoomOutlinedIcon sx={{ color: 'secondary.main' }} />
                            </InputAdornment>
                        ),
                    }}
                    placeholder="예: 제주시"
                />
                
                <TextField
                    label="시간"
                    value={formData.time || ''}
                    onChange={handleChange('time')}
                    error={!!errors.time}
                    helperText={errors.time}
                    variant="outlined"
                    fullWidth
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <AccessAlarmOutlinedIcon sx={{ color: 'secondary.main' }} />
                            </InputAdornment>
                        ),
                    }}
                    placeholder="예: 2100.12.34 05:00 ~ 07:00"
                />
                
                <TextField
                    label="최소 가격"
                    value={formatPrice(formData.min_price)}
                    onChange={handleChange('min_price')}
                    error={!!errors.min_price}
                    helperText={errors.min_price}
                    variant="outlined"
                    fullWidth
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <PaymentsOutlinedIcon sx={{ color: 'secondary.main' }} />
                            </InputAdornment>
                        ),
                        endAdornment: <InputAdornment position="end">원</InputAdornment>,
                    }}
                    placeholder="예: 10,000"
                />
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonOutlineOutlinedIcon sx={{ color: 'secondary.main' }} />
                    <Typography variant="body2" sx={{ color: 'grey.700' }}>
                        {seller}
                    </Typography>
                </Box>
            </Box>

            {/* 매물 소개 */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="body1" sx={{ fontWeight: 800 }}>
                    매물 소개
                </Typography>
                <TextField
                    value={formData.description || ''}
                    onChange={handleChange('description')}
                    error={!!errors.description}
                    helperText={errors.description}
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={4}
                    placeholder="상품에 대한 자세한 설명을 입력해주세요..."
                />
            </Box>
        </Box>
    );
}
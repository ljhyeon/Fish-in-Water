import { Dialog, DialogContent, DialogActions, Button, Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

/**
 * 로그아웃 확인 다이얼로그 컴포넌트
 * @param {{
 *   open: boolean;
 *   onClose: () => void;
 *   onConfirm: () => void;
 * }} props
 */
export default function LogoutConfirmDialog({
    open,
    onClose,
    onConfirm,
}) {
    const theme = useTheme();

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xs"
            fullWidth
        >
            <DialogContent sx={{ pt: 3, pb: 2 }}>
                <Box sx={{ 
                    textAlign: 'center',
                    color: theme.palette.grey[900] 
                }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                        로그아웃
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                        정말로 로그아웃 하시겠습니까?
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        모든 데이터가 삭제됩니다.
                    </Typography>
                </Box>
            </DialogContent>
            <DialogActions sx={{ 
                justifyContent: 'center', 
                gap: 1, 
                pb: 3, 
                px: 3 
            }}>
                <Button 
                    variant="outlined" 
                    onClick={onClose}
                    sx={{ minWidth: '80px' }}
                >
                    취소
                </Button>
                <Button 
                    variant="contained" 
                    color="error"
                    onClick={onConfirm}
                    sx={{ minWidth: '80px' }}
                >
                    로그아웃
                </Button>
            </DialogActions>
        </Dialog>
    );
} 
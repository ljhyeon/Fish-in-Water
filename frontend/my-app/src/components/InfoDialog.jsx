import { Dialog, DialogContent, DialogActions, Button, Box } from '@mui/material';

import { useTheme } from '@mui/material/styles';

/**
 * @param {{
 *   open: boolean;
 *   onClose: () => void;
 *   message: string;
 *   confirmText?: string;
 * }} props
 */
export default function InfoDialog({
    open,
    onClose,
    children,
    confirmText = '확인',
}) {
    const theme = useTheme();

  return (
        <Dialog
            open={open}
            onClose={onClose}
        >
        <DialogContent>
            <Box sx={{ color: theme.palette.grey[900] }}>
                {children}
            </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center' }}>
            <Button variant="contained" onClick={onClose}>
            {confirmText}
            </Button>
        </DialogActions>
        </Dialog>
    );
}

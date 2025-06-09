import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, } from '@mui/material';

/**
 * @typedef {{
 *   name: string;
 *   label: string;
 *   type?: string;
 *   required?: boolean;
 *   variant?: 'standard' | 'filled' | 'outlined';
 * }} FormField
 *
 * @param {{
 *   open: boolean;
 *   onClose: () => void; // 닫히기 위해서는 꼭 필요함
 *   onSubmit: (formData: Record<string, string>) => void; // 폼 제출
 *   hasClose?: boolean;  // ture: 취소 버튼 있음, false: 취소 버튼 없음
 *   submitText?: string;  // 제출 버튼 텍스트 변경하고 싶으면 작성할 것 (기본: 확인)
 *   title?: string;
 *   fields: FormField[];
 *   disableBackdropClose: boolean; // 바깥 눌렀을 때 닫힘 (false: 허용, true: 금지)
 * }} props
 */

export default function FormDialog({
    open,
    onClose,
    onSubmit,
    hasClose=false,
    submitText = "확인",
    title,
    fields = [],
    disableBackdropClose = false,
}) {
    const handleSubmit = (event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const formJson = Object.fromEntries(formData.entries());
        onSubmit?.(formJson);
        onClose();
    };

    // onClose 래퍼
    const handleClose = (event, reason) => {
        if (disableBackdropClose && reason === 'backdropClick') {
        return;
        }
        onClose();
    };

    return (
        <Dialog
        open={open}
        onClose={handleClose}
        slotProps={{
            paper: {
            component: 'form',
            onSubmit: handleSubmit,
            },
        }}
        >
        { title && <DialogTitle sx={{ justifyContent: 'center', }}>{title}</DialogTitle> }
        <DialogContent>
            {fields.map((field) => (
            <TextField
                key={field.name}
                autoFocus={fields[0].name === field.name}
                margin="dense"
                id={field.name}
                name={field.name}
                label={field.label}
                type={field.type || 'text'}
                required={field.required || false}
                fullWidth
                variant={field.variant || 'standard'}
            />
            ))}
        </DialogContent>
        <DialogActions
            sx={{
                justifyContent: 'center',
                gap: '70px',
            }}
        >
            { hasClose && <Button  variant="outlined" onClick={onClose}>취소</Button> }
            <Button variant="contained" type="submit">{submitText}</Button>
        </DialogActions>
        </Dialog>
    );
}

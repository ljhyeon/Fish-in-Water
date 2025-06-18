import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box, Typography } from '@mui/material';
import { useState } from 'react';

/**
 * @typedef {{
 *   name: string;
 *   label: string;
 *   type?: string;
 *   required?: boolean;
 *   variant?: 'standard' | 'filled' | 'outlined';
 *   placeholder?: string;
 *   helperText?: string;
 *   accept?: string;
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
 *   buttonProps?: object; // 버튼 추가 props
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
    buttonProps = {}
}) {
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});

    // 사업자 등록번호 유효성 검증
    const validateBusinessNumber = (value) => {
        const businessNumberRegex = /^\d{3}-\d{2}-\d{5}$/;
        return businessNumberRegex.test(value);
    };

    // 사업자 등록번호 자동 포맷팅
    const formatBusinessNumber = (value) => {
        // 숫자만 추출
        const numbers = value.replace(/[^\d]/g, '');
        
        // 10자리 숫자를 3-2-5 형식으로 포맷팅
        if (numbers.length <= 3) {
            return numbers;
        } else if (numbers.length <= 5) {
            return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
        } else if (numbers.length <= 10) {
            return `${numbers.slice(0, 3)}-${numbers.slice(3, 5)}-${numbers.slice(5, 10)}`;
        } else {
            return `${numbers.slice(0, 3)}-${numbers.slice(3, 5)}-${numbers.slice(5, 10)}`;
        }
    };

    // 필드 값 변경 핸들러
    const handleFieldChange = (fieldName, value, fieldType) => {
        let processedValue = value;
        
        // 사업자 등록번호 자동 포맷팅
        if (fieldName === 'businessNumber' && fieldType !== 'file') {
            processedValue = formatBusinessNumber(value);
        }
        
        setFormData(prev => ({
            ...prev,
            [fieldName]: fieldType === 'file' ? value : processedValue
        }));

        // 실시간 유효성 검증
        if (fieldName === 'businessNumber' && processedValue) {
            if (!validateBusinessNumber(processedValue)) {
                setErrors(prev => ({
                    ...prev,
                    businessNumber: '올바른 사업자 등록번호 형식이 아닙니다 (예: 123-45-67890)'
                }));
            } else {
                setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.businessNumber;
                    return newErrors;
                });
            }
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const formDataObj = new FormData(event.currentTarget);
        const formJson = {};
        
        // 일반 필드와 파일 필드 구분해서 처리
        for (const field of fields) {
            if (field.type === 'file') {
                const fileInput = event.currentTarget.querySelector(`input[name="${field.name}"]`);
                formJson[field.name] = fileInput.files[0] || null;
            } else {
                formJson[field.name] = formDataObj.get(field.name);
            }
        }

        // 유효성 검증
        const newErrors = {};
        for (const field of fields) {
            if (field.required && (!formJson[field.name] || formJson[field.name] === '')) {
                newErrors[field.name] = `${field.label}을(를) 입력해주세요.`;
            }
            
            // 사업자 등록번호 특별 검증
            if (field.name === 'businessNumber' && formJson[field.name] && !validateBusinessNumber(formJson[field.name])) {
                newErrors[field.name] = '올바른 사업자 등록번호 형식이 아닙니다 (예: 123-45-67890)';
            }
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        onSubmit?.(formJson);
    };

    // onClose 래퍼
    const handleClose = (event, reason) => {
        if (disableBackdropClose && reason === 'backdropClick') {
            return;
        }
        setFormData({});
        setErrors({});
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            slotProps={{
                paper: {
                    component: 'form',
                    onSubmit: handleSubmit,
                },
            }}
        >
            {title && <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>{title}</DialogTitle>}
            <DialogContent sx={{ pt: 2 }}>
                {fields.map((field, index) => (
                    <Box key={field.name} sx={{ mb: 2 }}>
                        {field.type === 'file' ? (
                            <Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    {field.label} {field.required && <span style={{ color: 'red' }}>*</span>}
                                </Typography>
                                <TextField
                                    type="file"
                                    name={field.name}
                                    inputProps={{ accept: field.accept }}
                                    fullWidth
                                    variant="outlined"
                                    onChange={(e) => handleFieldChange(field.name, e.target.files[0], 'file')}
                                    error={!!errors[field.name]}
                                    helperText={errors[field.name] || field.helperText}
                                />
                            </Box>
                        ) : (
                            <TextField
                                autoFocus={index === 0}
                                margin="dense"
                                id={field.name}
                                name={field.name}
                                label={field.label}
                                type={field.type || 'text'}
                                placeholder={field.placeholder}
                                required={field.required || false}
                                fullWidth
                                variant={field.variant || 'outlined'}
                                value={formData[field.name] || ''}
                                onChange={(e) => handleFieldChange(field.name, e.target.value, field.type)}
                                error={!!errors[field.name]}
                                helperText={errors[field.name] || field.helperText}
                            />
                        )}
                    </Box>
                ))}
            </DialogContent>
            <DialogActions
                sx={{
                    justifyContent: 'center',
                    gap: 2,
                    pb: 3,
                    px: 3
                }}
            >
                {hasClose && (
                    <Button 
                        variant="outlined" 
                        onClick={handleClose}
                        sx={{ minWidth: '100px' }}
                    >
                        취소
                    </Button>
                )}
                <Button 
                    variant="contained" 
                    type="submit"
                    sx={{ minWidth: '100px' }}
                    {...buttonProps}
                >
                    {submitText}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

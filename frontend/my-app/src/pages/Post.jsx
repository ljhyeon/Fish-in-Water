import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Typography } from "@mui/material";

import { ImageInputWithBackButton } from "../components/post/ImageInputWithBackButton"
import { ProductInfoForm } from "../components/post/ProductInfoForm";
import InfoDialog from '../components/InfoDialog';

import { validateProductForm, isFormValid, removeFieldErrors } from "../utils/validations";

export function Post() {
    const navigate = useNavigate();
    
    // 상태 관리
    const [selectedImage, setSelectedImage] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [formData, setFormData] = useState({
        seller_id: 1, // TODO: 현재 등록하는 회원의 id로 지정
        product_name: '',
        origin: '',
        auction_start_time: '',
        auction_end_time: '',
        expected_price: 0,
        additional_notes: ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Dialog
    const [open, setOpen] = useState(false); // 성공
    const [errorOpen, setErrorOpen] = useState(false); // 실패

    const handleImageSelect = (file, dataUrl) => {
        console.log('선택된 파일:', file);
        console.log('이미지 데이터 URL:', dataUrl);
        setImageFile(file);
        setSelectedImage(dataUrl);
        
        // 이미지 선택 시 이미지 관련 에러 제거
        if (errors.image) {
            setErrors(prev => removeFieldErrors(prev, 'image'));
        }
    };

    const handleFormChange = (newFormData) => {
        setFormData(newFormData);
        
        // 폼 데이터 변경 시 해당 필드의 에러 제거
        const fieldsToRemove = Object.keys(newFormData).filter(
            key => newFormData[key] && errors[key]
        );
        
        if (fieldsToRemove.length > 0) {
            setErrors(prev => removeFieldErrors(prev, fieldsToRemove));
        }
    };

    const handleSubmit = async () => {
        if (isSubmitting) return;

        // 유효성 검사 (분리된 함수 사용)
        const validationErrors = validateProductForm(formData, imageFile);
        
        if (!isFormValid(validationErrors)) {
            console.log('정보 부족');
            setErrors(validationErrors);
            setErrorOpen(true);
            return;
        }

        setIsSubmitting(true);

        try {
            // 모든 정보가 완성된 경우
            const submitData = {
                image: imageFile,
                image_urls: selectedImage,
                productInfo: formData
            };

            console.log('성공');
            console.log('제출 데이터:', submitData);

            // 여기에 실제 API 호출 로직 추가
            // await uploadProduct(submitData);
            
            // 성공 시 성공 메시지 표시
            setOpen(true);

        } catch (error) {
            console.error('업로드 실패:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <ImageInputWithBackButton
                onBackClick={() => navigate(-1)}
                onImageSelect={handleImageSelect}
                placeholder="상품 이미지를 선택하세요"
                initialImage={selectedImage}
            />
            
            {/* 이미지 에러 표시 */}
            {errors.image && (
                <Box sx={{ px: '20px', pt: 1 }}>
                    <span style={{ color: '#d32f2f', fontSize: '0.75rem' }}>
                        {errors.image}
                    </span>
                </Box>
            )}

            <ProductInfoForm
                formData={formData}
                onFormChange={handleFormChange}
                errors={errors}
                seller='돌덩수산'  // TODO: 유저 이름으로 변경
            />

            {/* 하단 등록 버튼 */}
            <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center', 
                alignItems: 'center',
                p: '20px',
                pb: '40px'
            }}>
                <Button 
                    variant="contained" 
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    sx={{ 
                        minWidth: '200px', 
                        py: 1.5,
                        fontSize: '1.1rem',
                        fontWeight: 'bold'
                    }}
                >
                    {isSubmitting ? '등록 중...' : '경매 등록'}
                </Button>
            </Box>
            <InfoDialog
                open={open}
                onClose={() => setOpen(false)}
                confirmText="확인"
            >
                <Typography variant="overline">
                    경매가 성공적으로 등록되었습니다.
                </Typography>
            </InfoDialog>
            <InfoDialog
                open={errorOpen}
                onClose={() => setErrorOpen(false)}
                confirmText="확인"
            >
                <Typography variant="overline">
                    필요한 모든 정보가 입력되지 않았습니다.
                </Typography>
            </InfoDialog>
        </>
    );
}
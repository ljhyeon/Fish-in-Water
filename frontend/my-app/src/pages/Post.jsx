import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Typography } from "@mui/material";

import { ImageInputWithBackButton } from "../components/post/ImageInputWithBackButton"
import { ProductInfoForm } from "../components/post/ProductInfoForm";
import InfoDialog from '../components/InfoDialog';

export function Post() {
    const navigate = useNavigate();
    
    // 상태 관리
    const [selectedImage, setSelectedImage] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        recommend: '',
        location: '',
        time: '',
        min_price: 0,
        description: ''
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
            setErrors(prev => ({ ...prev, image: undefined }));
        }
    };

    const handleFormChange = (newFormData) => {
        setFormData(newFormData);
        
        // 폼 데이터 변경 시 해당 필드의 에러 제거
        const updatedErrors = { ...errors };
        Object.keys(newFormData).forEach(key => {
            if (newFormData[key] && updatedErrors[key]) {
                delete updatedErrors[key];
            }
        });
        setErrors(updatedErrors);
    };

    // 유효성 검사 함수
    const validateForm = () => {
        const newErrors = {};

        // 이미지 검사
        if (!imageFile) {
            newErrors.image = '상품 이미지를 선택해주세요.';
        }

        // 필수 필드 검사
        if (!formData.name?.trim()) {
            newErrors.name = '상품명을 입력해주세요.';
        }

        if (!formData.location?.trim()) {
            newErrors.location = '위치를 입력해주세요.';
        }

        if (!formData.time?.trim()) {
            newErrors.time = '시간을 입력해주세요.';
        }

        if (!formData.min_price || formData.min_price <= 0) {
            newErrors.min_price = '최소 가격을 입력해주세요.';
        }

        if (!formData.description?.trim()) {
            newErrors.description = '상품 설명을 입력해주세요.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (isSubmitting) return;

        // 유효성 검사
        if (!validateForm()) {
            console.log('정보 부족');
            setErrorOpen(true);
            return;
        }

        setIsSubmitting(true);

        try {
            // 모든 정보가 완성된 경우
            const submitData = {
                image: imageFile,
                imageUrl: selectedImage,
                productInfo: formData
            };

            console.log('성공');
            console.log('제출 데이터:', submitData);
            setOpen(true);

            // 여기에 실제 API 호출 로직 추가
            // await uploadProduct(submitData);
            
            // 성공 시 다른 페이지로 이동하거나 성공 메시지 표시
            // navigate('/success');

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
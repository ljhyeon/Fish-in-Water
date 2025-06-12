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
        product_name: '',
        recommend: '',
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

    // 시간 유효성 검사 함수
    const validateTimes = (startTime, endTime) => {
        const now = new Date();
        const start = new Date(startTime);
        const end = new Date(endTime);
        
        // 시작 시간이 현재 시간보다 이전인지 확인
        if (start <= now) {
            return '경매 시작 시간은 현재 시간보다 미래여야 합니다.';
        }
        
        // 종료 시간이 시작 시간보다 이전인지 확인
        if (end <= start) {
            return '경매 시작 시간은 종료 시간보다 이전이어야 합니다.';
        }
        
        // // 경매 기간이 너무 짧은지 확인 (최소 30분)
        // const timeDifference = end.getTime() - start.getTime();
        // const minDuration = 30 * 60 * 1000; // 30분을 밀리초로 변환
        
        // if (timeDifference < minDuration) {
        //     return '경매 진행 시간은 최소 30분 이상이어야 합니다.';
        // }
        
        // // 경매 기간이 너무 긴지 확인 (최대 30일)
        // const maxDuration = 30 * 24 * 60 * 60 * 1000; // 30일을 밀리초로 변환
        
        // if (timeDifference > maxDuration) {
        //     return '경매 진행 시간은 최대 30일을 초과할 수 없습니다.';
        // }
        
        return null; // 유효한 경우
    };

    // 유효성 검사 함수
    const validateForm = () => {
        const newErrors = {};

        // 필수 필드 검사
        if (!formData.product_name?.trim()) {
            newErrors.product_name = '상품명을 입력해주세요.';
        }

        if (!formData.origin?.trim()) {
            newErrors.origin = '위치를 입력해주세요.';
        }

        if (!formData.auction_start_time?.trim()) {
            newErrors.auction_start_time = '경매 시작 시간을 선택해주세요.';
        } else if (!formData.auction_end_time?.trim()) {
            newErrors.auction_end_time = '경매 종료 시간을 선택해주세요.';
        } else {
            // 시간 유효성 검사
            const timeValidationError = validateTimes(formData.auction_start_time, formData.auction_end_time);
            if (timeValidationError) {
                newErrors.auction_start_time = timeValidationError;
                newErrors.auction_end_time = timeValidationError;
            }
        }

        if (!formData.expected_price || formData.expected_price <= 0) {
            newErrors.expected_price = '최소 가격을 입력해주세요.';
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
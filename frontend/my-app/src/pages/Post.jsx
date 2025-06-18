import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Typography } from "@mui/material";

import { ImageInputWithBackButton } from "../components/post/ImageInputWithBackButton"
import { ProductInfoForm } from "../components/post/ProductInfoForm";
import InfoDialog from '../components/InfoDialog';

import { validateProductForm, isFormValid, removeFieldErrors } from "../utils/validations";
import { validateImageFile, optimizeImageForUpload } from "../utils/imageUtils";
import { createAuction } from "../services/auctionService";
import { useAuth } from "../hooks/useAuth";

export function Post() {
    const navigate = useNavigate();
    const { user, userInfo, isAuthenticated } = useAuth();
    
    // 상태 관리
    const [selectedImage, setSelectedImage] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        origin: '',
        auction_start_time: '',
        auction_end_time: '',
        startPrice: 0,
        description: ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');

    // Dialog
    const [open, setOpen] = useState(false); // 성공
    const [errorOpen, setErrorOpen] = useState(false); // 실패

    const handleImageSelect = async (file, dataUrl) => {
        console.log('선택된 파일:', file);
        console.log('이미지 데이터 URL:', dataUrl);
        
        // 이미지 파일 유효성 검사
        const validation = validateImageFile(file);
        if (!validation.isValid) {
            setErrors(prev => ({ ...prev, image: validation.error }));
            return;
        }
        
        try {
            // 이미지 최적화 (파일 크기에 따른 동적 압축)
            console.log('원본 파일 크기:', (file.size / 1024 / 1024).toFixed(2) + 'MB');
            const optimizedFile = await optimizeImageForUpload(file);
            console.log('최적화된 파일 크기:', (optimizedFile.size / 1024 / 1024).toFixed(2) + 'MB');
            
            setImageFile(optimizedFile);
            setSelectedImage(dataUrl); // 미리보기는 원본 사용
            
            // 이미지 선택 시 이미지 관련 에러 제거
            if (errors.image) {
                setErrors(prev => removeFieldErrors(prev, 'image'));
            }
        } catch (error) {
            console.error('이미지 최적화 실패:', error);
            // 최적화 실패 시 원본 파일 사용
            setImageFile(file);
            setSelectedImage(dataUrl);
            
            if (errors.image) {
                setErrors(prev => removeFieldErrors(prev, 'image'));
            }
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

        // 인증 확인
        if (!isAuthenticated || !user || !userInfo) {
            setSubmitError('로그인이 필요합니다.');
            setErrorOpen(true);
            return;
        }

        // 판매자 인증 확인
        if (userInfo.user_type !== 'seller' || !userInfo.seller_info?.is_verified) {
            setSubmitError('판매자 인증이 필요합니다.');
            setErrorOpen(true);
            return;
        }

        // 유효성 검사 (분리된 함수 사용)
        const validationErrors = validateProductForm(formData, imageFile);
        
        if (!isFormValid(validationErrors)) {
            console.log('정보 부족');
            setErrors(validationErrors);
            setErrorOpen(true);
            return;
        }

        setIsSubmitting(true);
        setSubmitError('');

        try {
            // 경매 데이터 구성
            const auctionData = {
                name: formData.name,
                description: formData.description,
                origin: formData.origin,
                auction_start_time: formData.auction_start_time,
                auction_end_time: formData.auction_end_time,
                startPrice: formData.startPrice,
                currentPrice: formData.startPrice,
                seller_name: userInfo.seller_info?.business_name || userInfo.displayName,
                business_license: userInfo.seller_info?.business_registration_number,
                recommend: `${formData.name} - 신선한 해산물입니다!`,
                status: 'PENDING'
            };

            console.log('경매 생성 시작:', auctionData);
            console.log('이미지 파일:', imageFile ? `${imageFile.name} (${(imageFile.size / 1024 / 1024).toFixed(2)}MB)` : '없음');
            
            // 실제 API 호출
            const auctionId = await createAuction(auctionData, imageFile, user.uid);
            
            console.log('경매 생성 성공:', auctionId);
            
            // 성공 시 성공 메시지 표시
            setOpen(true);

        } catch (error) {
            console.error('경매 생성 실패:', error);
            
            // 이미지 업로드 관련 에러인지 확인
            if (error.message.includes('이미지') || error.message.includes('파일')) {
                setSubmitError(`이미지 업로드 오류: ${error.message}`);
            } else {
                setSubmitError(error.message || '경매 등록에 실패했습니다.');
            }
            setErrorOpen(true);
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
                seller={userInfo?.seller_info?.business_name || userInfo?.displayName || '판매자'}
            />

            {/* 하단 등록 버튼 */}
            <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center', 
                alignItems: 'center',
                p: '20px',
                pb: '80px'
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
                onClose={() => {
                    setOpen(false);
                    navigate(-1); // 성공 시 이전 페이지로 이동
                }}
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
                    {submitError || '필요한 모든 정보가 입력되지 않았습니다.'}
                </Typography>
            </InfoDialog>
        </>
    );
}
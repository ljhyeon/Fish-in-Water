// 상품 등록 폼 유효성 검증 유틸리티

/**
 * 시간 유효성 검사 함수
 * @param {string} startTime - 시작 시간 (ISO 문자열)
 * @param {string} endTime - 종료 시간 (ISO 문자열)
 * @returns {string|null} - 에러 메시지 또는 null (유효한 경우)
 */
export const validateTimes = (startTime, endTime) => {
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
    
    // 선택적 검증 규칙들 (주석 처리됨)
    // const timeDifference = end.getTime() - start.getTime();
    // const minDuration = 30 * 60 * 1000; // 30분
    // const maxDuration = 30 * 24 * 60 * 60 * 1000; // 30일
    
    // if (timeDifference < minDuration) {
    //     return '경매 진행 시간은 최소 30분 이상이어야 합니다.';
    // }
    
    // if (timeDifference > maxDuration) {
    //     return '경매 진행 시간은 최대 30일을 초과할 수 없습니다.';
    // }
    
    return null;
};

/**
 * 개별 필드 검증 함수들
 */
export const validators = {
    productName: (value) => {
        if (!value?.trim()) {
            return '상품명을 입력해주세요.';
        }
        return null;
    },

    origin: (value) => {
        if (!value?.trim()) {
            return '위치를 입력해주세요.';
        }
        return null;
    },

    auctionStartTime: (value) => {
        if (!value?.trim()) {
            return '경매 시작 시간을 선택해주세요.';
        }
        return null;
    },

    auctionEndTime: (value) => {
        if (!value?.trim()) {
            return '경매 종료 시간을 선택해주세요.';
        }
        return null;
    },

    expectedPrice: (value) => {
        if (!value || value <= 0) {
            return '최소 가격을 입력해주세요.';
        }
        return null;
    },

    image: (value) => {
        if (!value) {
            return '상품 이미지를 선택해주세요.';
        }
        return null;
    }
};

/**
 * 전체 폼 유효성 검증 함수
 * @param {Object} formData - 검증할 폼 데이터
 * @param {File|null} imageFile - 이미지 파일 (선택적)
 * @returns {Object} - 에러 객체 (필드명: 에러메시지)
 */
export const validateProductForm = (formData, imageFile = null) => {
    const errors = {};

    // 개별 필드 검증
    const productNameError = validators.productName(formData.product_name);
    if (productNameError) errors.product_name = productNameError;

    const originError = validators.origin(formData.origin);
    if (originError) errors.origin = originError;

    const startTimeError = validators.auctionStartTime(formData.auction_start_time);
    if (startTimeError) errors.auction_start_time = startTimeError;

    const endTimeError = validators.auctionEndTime(formData.auction_end_time);
    if (endTimeError) errors.auction_end_time = endTimeError;

    const priceError = validators.expectedPrice(formData.expected_price);
    if (priceError) errors.expected_price = priceError;

    // 이미지 검증 (선택적)
    if (imageFile !== null) {
        const imageError = validators.image(imageFile);
        if (imageError) errors.image = imageError;
    }

    // 시간 교차 검증 (개별 시간 필드가 유효한 경우에만)
    if (formData.auction_start_time && formData.auction_end_time && 
        !errors.auction_start_time && !errors.auction_end_time) {
        
        const timeValidationError = validateTimes(
            formData.auction_start_time, 
            formData.auction_end_time
        );
        
        if (timeValidationError) {
            errors.auction_start_time = timeValidationError;
            errors.auction_end_time = timeValidationError;
        }
    }

    return errors;
};

/**
 * 폼이 유효한지 확인하는 헬퍼 함수
 * @param {Object} errors - validateProductForm에서 반환된 에러 객체
 * @returns {boolean} - 유효하면 true, 에러가 있으면 false
 */
export const isFormValid = (errors) => {
    return Object.keys(errors).length === 0;
};

/**
 * 특정 필드의 에러를 제거하는 헬퍼 함수
 * @param {Object} errors - 현재 에러 객체
 * @param {string|string[]} fields - 제거할 필드명 (단일 또는 배열)
 * @returns {Object} - 업데이트된 에러 객체
 */
export const removeFieldErrors = (errors, fields) => {
    const updatedErrors = { ...errors };
    const fieldsArray = Array.isArray(fields) ? fields : [fields];
    
    fieldsArray.forEach(field => {
        delete updatedErrors[field];
    });
    
    return updatedErrors;
};
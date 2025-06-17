/**
 * 이미지 로딩 오류를 처리하는 유틸리티 함수들
 */

/**
 * 이미지 로딩 오류 시 fallback 이미지로 교체
 * @param {Event} event - 이미지 로딩 실패 이벤트
 * @param {string} fallbackSrc - 대체할 이미지 경로
 */
export const handleImageError = (event, fallbackSrc = '/fish1.jpg') => {
  const img = event.target;
  
  // 이미 fallback 이미지를 로딩 중이면 무한 루프 방지
  if (img.src.includes(fallbackSrc)) {
    console.error('Fallback 이미지도 로딩 실패:', fallbackSrc);
    return;
  }
  
  console.warn('이미지 로딩 실패, fallback 이미지로 교체:', img.src, '->', fallbackSrc);
  img.src = fallbackSrc;
};

/**
 * 이미지 URL 유효성 검사
 * @param {string} url - 검사할 이미지 URL
 * @returns {Promise<boolean>} 이미지 로딩 가능 여부
 */
export const validateImageUrl = (url) => {
  return new Promise((resolve) => {
    if (!url) {
      resolve(false);
      return;
    }
    
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
    
    // 타임아웃 설정 (10초)
    setTimeout(() => resolve(false), 10000);
  });
};

/**
 * 이미지 파일 크기 조정
 * @param {File} file - 원본 이미지 파일
 * @param {number} maxWidth - 최대 너비
 * @param {number} maxHeight - 최대 높이
 * @param {number} quality - 압축 품질 (0-1)
 * @returns {Promise<File>} 리사이즈된 이미지 파일
 */
export const resizeImage = (file, maxWidth = 800, maxHeight = 600, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // 원본 크기 계산
      let { width, height } = img;
      
      // 비율 유지하면서 리사이즈
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }
      
      // 캔버스 크기 설정
      canvas.width = width;
      canvas.height = height;
      
      // 이미지 그리기
      ctx.drawImage(img, 0, 0, width, height);
      
      // Blob으로 변환
      canvas.toBlob((blob) => {
        if (blob) {
          // File 객체로 변환
          const resizedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now()
          });
          resolve(resizedFile);
        } else {
          reject(new Error('이미지 리사이즈 실패'));
        }
      }, file.type, quality);
    };
    
    img.onerror = () => reject(new Error('이미지 로드 실패'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * 이미지 파일 유효성 검사
 * @param {File} file - 검사할 파일
 * @returns {Object} 검사 결과 { isValid: boolean, error: string }
 */
export const validateImageFile = (file) => {
  const result = { isValid: true, error: '' };
  
  if (!file) {
    result.isValid = false;
    result.error = '파일이 선택되지 않았습니다.';
    return result;
  }
  
  // 파일 타입 확인
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    result.isValid = false;
    result.error = '지원하지 않는 파일 형식입니다. (JPEG, PNG, WebP만 지원)';
    return result;
  }
  
  // 파일 크기 확인 (5MB)
  if (file.size > 5 * 1024 * 1024) {
    result.isValid = false;
    result.error = '파일 크기가 5MB를 초과합니다.';
    return result;
  }
  
  return result;
}; 
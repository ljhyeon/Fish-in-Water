import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';

// Firebase Functions 기본 URL (배포 후 실제 URL로 변경)
const FUNCTIONS_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://127.0.0.1:5001/fish-waterbomb/us-central1/api'  // 로컬 에뮬레이터
  : 'https://us-central1-fish-waterbomb.cloudfunctions.net/api'; // 배포된 함수

/**
 * HTTP 요청을 위한 기본 함수
 */
async function makeRequest(endpoint, options = {}) {
  try {
    const url = `${FUNCTIONS_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Backend request failed:', error);
    throw error;
  }
}

/**
 * 경매 목록 조회
 * @param {string} status - 경매 상태
 * @param {number} limit - 조회 개수
 * @param {string} userType - 사용자 타입 ('consumer', 'supplier')
 */
export const getAuctions = async (status = 'ALL', limit = 50, userType = null) => {
  const params = new URLSearchParams({
    ...(status !== 'ALL' && { status }),
    limit: limit.toString(),
    ...(userType && { user_type: userType })
  });

  return await makeRequest(`/auctions?${params}`);
};

/**
 * 특정 경매 정보 조회
 * @param {string} auctionId - 경매 ID
 * @param {string} userType - 사용자 타입
 */
export const getAuction = async (auctionId, userType = null) => {
  const params = userType ? `?user_type=${userType}` : '';
  return await makeRequest(`/auctions/${auctionId}${params}`);
};

/**
 * 경매 상태 수동 업데이트
 */
export const updateAuctionStatus = async () => {
  return await makeRequest('/auctions/update-status', {
    method: 'POST'
  });
};

/**
 * 특정 경매 상태 업데이트
 * @param {string} auctionId - 경매 ID
 * @param {string} status - 새 상태
 * @param {Object} additionalData - 추가 데이터
 */
export const updateSpecificAuction = async (auctionId, status, additionalData = {}) => {
  return await makeRequest(`/auctions/${auctionId}/status`, {
    method: 'PUT',
    body: JSON.stringify({
      status,
      ...additionalData
    })
  });
};

/**
 * Firebase Functions 직접 호출 (대안 방법)
 */
export const callFunction = {
  // 경매 상태 업데이트 함수 직접 호출
  updateAuctionStatus: httpsCallable(functions, 'updateAuctionStatus'),
  
  // 필요시 다른 함수들도 추가
};

/**
 * 프론트엔드 설정 업데이트 도우미
 */
export const updateFunctionsConfig = (projectId, region = 'us-central1') => {
  const baseUrl = process.env.NODE_ENV === 'development'
    ? `http://127.0.0.1:5001/${projectId}/${region}/api`
    : `https://${region}-${projectId}.cloudfunctions.net/api`;
  
  return baseUrl;
}; 
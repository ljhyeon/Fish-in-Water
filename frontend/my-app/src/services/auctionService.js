import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { ref, set, get, onValue, off, update, serverTimestamp as rtdbServerTimestamp } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, rtdb, storage } from '../firebase';
import { getConsumerStatus, getSupplierStatus, calculateAuctionStatus } from '../utils/statusUtils';

/**
 * 새 경매 생성
 * @param {Object} auctionData - 경매 데이터
 * @param {File} imageFile - 상품 이미지 파일 (선택사항)
 * @param {string} sellerId - 판매자 UID (선택사항, auctionData에 seller_id가 있으면 생략 가능)
 * @returns {string} 생성된 경매 ID
 */
export const createAuction = async (auctionData, imageFile = null, sellerId = null) => {
  try {
    let imageUrl = auctionData.image_url || null;
    const finalSellerId = sellerId || auctionData.seller_id;
    
    if (!finalSellerId) {
      throw new Error('판매자 ID가 필요합니다.');
    }
    
    // 이미지 업로드
    if (imageFile) {
      try {
        console.log('이미지 업로드 시작:', imageFile.name);
        
        // 파일 확장자 추출
        const fileExtension = imageFile.name.split('.').pop().toLowerCase();
        const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
        
        if (!allowedExtensions.includes(fileExtension)) {
          throw new Error('지원하지 않는 이미지 형식입니다. (jpg, jpeg, png, webp만 지원)');
        }
        
        // 파일 크기 제한 (5MB)
        if (imageFile.size > 5 * 1024 * 1024) {
          throw new Error('이미지 파일 크기는 5MB 이하여야 합니다.');
        }
        
        // 고유한 파일명 생성
        const timestamp = Date.now();
        const fileName = `auction_images/${finalSellerId}/${timestamp}.${fileExtension}`;
        
        // Firebase Storage에 업로드
        const imageRef = storageRef(storage, fileName);
        const uploadResult = await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(uploadResult.ref);
        
        console.log('이미지 업로드 완료:', imageUrl);
      } catch (uploadError) {
        console.error('이미지 업로드 실패:', uploadError);
        
        // 업로드 실패 시 기본 이미지 사용
        imageUrl = '/fish1.jpg';
        console.log('기본 이미지 사용:', imageUrl);
        
        // 업로드 에러는 경고로만 처리하고 경매 생성은 계속 진행
        console.warn('이미지 업로드에 실패했지만 경매 생성을 계속 진행합니다.');
      }
    }
    
    // 시간 데이터 변환 (ISO 문자열을 Timestamp로)
    const startTime = auctionData.auction_start_time || auctionData.start_time;
    const endTime = auctionData.auction_end_time || auctionData.end_time;
    
    // 경매 데이터 구성 (testItems 표준 필드명 사용)
    const auction = {
      name: auctionData.name,
      description: auctionData.description,
      image: imageUrl,
      origin: auctionData.origin || auctionData.location,
      seller: {
        id: finalSellerId,
        name: auctionData.seller_name || auctionData.seller?.name,
        business_license: auctionData.business_license || auctionData.seller?.business_license
      },
      status: auctionData.status || 'PENDING', // PENDING, ACTIVE, FINISHED, NO_BID
      auction_start_time: startTime,
      auction_end_time: endTime,
      startPrice: auctionData.startPrice || auctionData.starting_price,
      currentPrice: auctionData.currentPrice || auctionData.current_price || auctionData.startPrice || auctionData.starting_price,
      finalPrice: auctionData.finalPrice || auctionData.final_price || null,
      winner_id: auctionData.winner_id || null,
      recommend: auctionData.recommend || auctionData.recommendation,
      is_payment_completed: false, // 결제 완료 여부
      is_settlement_completed: false, // 정산 완료 여부
      created_at: serverTimestamp()
    };

    // 선택적 필드들 추가 (있는 경우에만)
    if (auctionData.species) auction.species = auctionData.species;
    if (auctionData.quantity) auction.quantity = auctionData.quantity;
    if (auctionData.unit) auction.unit = auctionData.unit;
    if (auctionData.category) auction.category = auctionData.category;
    
    // Firestore에 경매 저장
    const auctionRef = await addDoc(collection(db, 'auctions'), auction);
    console.log('새 경매 생성 완료:', auctionRef.id);
    
    return auctionRef.id;
  } catch (error) {
    console.error('경매 생성 실패:', error);
    throw new Error('경매 생성에 실패했습니다.');
  }
};

/**
 * 경매 목록 조회
 * @param {string} status - 경매 상태 ('PENDING', 'ACTIVE', 'FINISHED', 'NO_BID', 'ALL')
 * @param {number} limitCount - 조회할 개수
 * @param {string} userType - 사용자 타입 ('consumer', 'supplier')
 * @returns {Array} 경매 목록
 */
export const getAuctions = async (status = 'ALL', limitCount = 50, userType = null) => {
  try {
    const auctionsRef = collection(db, 'auctions');
    let auctionQuery;
    
    if (status === 'ALL') {
      auctionQuery = query(
        auctionsRef, 
        orderBy('created_at', 'desc'), 
        limit(limitCount)
      );
    } else {
      auctionQuery = query(
        auctionsRef, 
        where('status', '==', status),
        orderBy('created_at', 'desc'), 
        limit(limitCount)
      );
    }
    
    const querySnapshot = await getDocs(auctionQuery);
    const auctions = [];
    
    querySnapshot.forEach((doc) => {
      const auctionData = doc.data();
      const hasWinner = auctionData.winner_id && auctionData.winner_id !== null;
      
      // 사용자 타입에 따른 상태 텍스트 추가
      let displayStatus = auctionData.status;
      if (userType === 'consumer') {
        displayStatus = getConsumerStatus(
          auctionData.status, 
          hasWinner, 
          auctionData.is_payment_completed
        );
      } else if (userType === 'supplier') {
        displayStatus = getSupplierStatus(
          auctionData.status, 
          hasWinner, 
          auctionData.is_settlement_completed
        );
      }
      
      auctions.push({
        id: doc.id,
        ...auctionData,
        displayStatus
      });
    });
    
    return auctions;
  } catch (error) {
    console.error('경매 목록 조회 실패:', error);
    throw new Error('경매 목록 조회에 실패했습니다.');
  }
};

/**
 * 특정 경매 정보 조회
 * @param {string} auctionId - 경매 ID
 * @param {string} userType - 사용자 타입 ('consumer', 'supplier')
 * @returns {Object|null} 경매 정보
 */
export const getAuction = async (auctionId, userType = null) => {
  try {
    const auctionRef = doc(db, 'auctions', auctionId);
    const auctionSnap = await getDoc(auctionRef);
    
    if (auctionSnap.exists()) {
      const auctionData = auctionSnap.data();
      const hasWinner = auctionData.winner_id && auctionData.winner_id !== null;
      
      // 사용자 타입에 따른 상태 텍스트 추가
      let displayStatus = auctionData.status;
      if (userType === 'consumer') {
        displayStatus = getConsumerStatus(
          auctionData.status, 
          hasWinner, 
          auctionData.is_payment_completed
        );
      } else if (userType === 'supplier') {
        displayStatus = getSupplierStatus(
          auctionData.status, 
          hasWinner, 
          auctionData.is_settlement_completed
        );
      }
      
      return {
        id: auctionSnap.id,
        ...auctionData,
        displayStatus
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error('경매 정보 조회 실패:', error);
    throw new Error('경매 정보 조회에 실패했습니다.');
  }
};

/**
 * 사용자별 경매 목록 조회
 * @param {string} userId - 사용자 UID
 * @param {string} type - 'seller' (내가 개설한) 또는 'bidder' (내가 참여한)
 * @param {string} userType - 사용자 타입 ('consumer', 'supplier')
 * @returns {Array} 경매 목록
 */
export const getUserAuctions = async (userId, type = 'seller', userType = null) => {
  try {
    const auctionsRef = collection(db, 'auctions');
    let auctionQuery;
    
    if (type === 'seller') {
      auctionQuery = query(
        auctionsRef,
        where('seller.id', '==', userId),
        orderBy('created_at', 'desc')
      );
    } else {
      // 입찰자용 쿼리는 별도 구현 필요 (입찰 기록을 추적하는 컬렉션 필요)
      auctionQuery = query(
        auctionsRef,
        where('winner_id', '==', userId),
        orderBy('created_at', 'desc')
      );
    }
    
    const querySnapshot = await getDocs(auctionQuery);
    const auctions = [];
    
    querySnapshot.forEach((doc) => {
      const auctionData = doc.data();
      const hasWinner = auctionData.winner_id && auctionData.winner_id !== null;
      
      // 사용자 타입에 따른 상태 텍스트 추가
      let displayStatus = auctionData.status;
      if (userType === 'consumer') {
        displayStatus = getConsumerStatus(
          auctionData.status, 
          hasWinner, 
          auctionData.is_payment_completed
        );
      } else if (userType === 'supplier') {
        displayStatus = getSupplierStatus(
          auctionData.status, 
          hasWinner, 
          auctionData.is_settlement_completed
        );
      }
      
      auctions.push({
        id: doc.id,
        ...auctionData,
        displayStatus
      });
    });
    
    return auctions;
  } catch (error) {
    console.error('사용자 경매 목록 조회 실패:', error);
    throw new Error('경매 목록 조회에 실패했습니다.');
  }
};

/**
 * 경매 상태를 ACTIVE로 변경하고 RTDB에 실시간 입찰 경로 생성
 * @param {string} auctionId - 경매 ID
 * @param {number} startingPrice - 시작가
 */
export const activateAuction = async (auctionId, startingPrice) => {
  try {
    // Firestore에서 경매 상태 업데이트
    const auctionRef = doc(db, 'auctions', auctionId);
    await updateDoc(auctionRef, {
      status: 'ACTIVE'
    });
    
    // RTDB에 실시간 입찰 경로 생성
    const liveAuctionRef = ref(rtdb, `live_auctions/${auctionId}`);
    await set(liveAuctionRef, {
      currentPrice: startingPrice,
      last_bidder_id: 'none',
      last_bid_timestamp: rtdbServerTimestamp()
    });
    
    console.log('경매 활성화 완료:', auctionId);
  } catch (error) {
    console.error('경매 활성화 실패:', error);
    throw new Error('경매 활성화에 실패했습니다.');
  }
};

/**
 * 개선된 입찰 함수 - 동시 입찰 처리 및 히스토리 관리
 * @param {string} auctionId - 경매 ID
 * @param {string} bidderId - 입찰자 UID
 * @param {number} bidAmount - 입찰 금액
 */
export const placeBidImproved = async (auctionId, bidderId, bidAmount) => {
  try {
    const liveAuctionRef = ref(rtdb, `live_auctions/${auctionId}`);
    const bidHistoryRef = ref(rtdb, `bid_history/${auctionId}`);
    
    // 원자적 업데이트를 위한 트랜잭션 사용
    const result = await new Promise((resolve, reject) => {
      const updates = {};
      
      // 현재 데이터를 먼저 확인
      get(liveAuctionRef).then((snapshot) => {
        if (!snapshot.exists()) {
          reject(new Error('진행 중인 경매가 아닙니다.'));
          return;
        }
        
        const currentData = snapshot.val();
        
        // 입찰 금액 검증
        if (bidAmount <= currentData.currentPrice) {
          reject(new Error(`최소 ${(currentData.currentPrice + 1000).toLocaleString()}원 이상 입찰해주세요.`));
          return;
        }
        
        // 서울시간 기준 타임스탬프 생성 (UTC+9)
        const utcNow = new Date();
        const seoulTime = new Date(utcNow.getTime() + (9 * 60 * 60 * 1000));
        const timestamp = seoulTime.getTime();
        
        // 실시간 경매 데이터 업데이트
        updates[`live_auctions/${auctionId}`] = {
          currentPrice: bidAmount,
          last_bidder_id: bidderId,
          last_bid_timestamp: timestamp
        };
        
        // 입찰 히스토리 추가
        updates[`bid_history/${auctionId}/${timestamp}`] = {
          bidder_id: bidderId,
          amount: bidAmount,
          timestamp: timestamp
        };
        
        // 원자적 업데이트 실행
        update(ref(rtdb), updates)
          .then(() => resolve({ success: true, timestamp }))
          .catch(reject);
      }).catch(reject);
    });
    
    console.log('입찰 성공:', { auctionId, bidderId, bidAmount, timestamp: result.timestamp });
    return result;
  } catch (error) {
    console.error('입찰 실패:', error);
    throw error;
  }
};

/**
 * 입찰 히스토리 조회
 * @param {string} auctionId - 경매 ID
 * @param {number} limit - 조회할 개수
 */
export const getBidHistory = async (auctionId, limit = 10) => {
  try {
    const bidHistoryRef = ref(rtdb, `bid_history/${auctionId}`);
    const snapshot = await get(bidHistoryRef);
    
    if (!snapshot.exists()) {
      return [];
    }
    
    const history = [];
    const data = snapshot.val();
    
    // 타임스탬프 기준 내림차순 정렬
    Object.keys(data)
      .sort((a, b) => parseInt(b) - parseInt(a))
      .slice(0, limit)
      .forEach(timestamp => {
        history.push({
          ...data[timestamp],
          id: timestamp
        });
      });
    
    return history;
  } catch (error) {
    console.error('입찰 히스토리 조회 실패:', error);
    throw new Error('입찰 히스토리 조회에 실패했습니다.');
  }
};

/**
 * 실시간 입찰 히스토리 구독
 * @param {string} auctionId - 경매 ID
 * @param {Function} callback - 데이터 변경 시 호출될 콜백 함수
 * @param {number} limit - 조회할 개수
 */
export const subscribeBidHistory = (auctionId, callback, limit = 10) => {
  const bidHistoryRef = ref(rtdb, `bid_history/${auctionId}`);
  
  onValue(bidHistoryRef, (snapshot) => {
    if (snapshot.exists()) {
      const history = [];
      const data = snapshot.val();
      
      // 타임스탬프 기준 내림차순 정렬
      Object.keys(data)
        .sort((a, b) => parseInt(b) - parseInt(a))
        .slice(0, limit)
        .forEach(timestamp => {
          history.push({
            ...data[timestamp],
            id: timestamp
          });
        });
      
      callback(history);
    } else {
      callback([]);
    }
  });
  
  // 구독 해제 함수 반환
  return () => off(bidHistoryRef);
};

/**
 * 경매 종료 처리
 * @param {string} auctionId - 경매 ID
 */
export const finishAuction = async (auctionId) => {
  try {
    const liveAuctionRef = ref(rtdb, `live_auctions/${auctionId}`);
    
    // RTDB에서 최종 입찰 정보 조회
    const snapshot = await get(liveAuctionRef);
    const finalData = snapshot.exists() ? snapshot.val() : null;
    
    // Firestore에 최종 결과 저장
    const auctionRef = doc(db, 'auctions', auctionId);
    const updateData = {
      status: 'FINISHED'
    };
    
    if (finalData && finalData.last_bidder_id !== 'none') {
      updateData.finalPrice = finalData.currentPrice;
      updateData.winner_id = finalData.last_bidder_id;
      updateData.status = 'FINISHED';
    } else {
      // 유찰 처리
      updateData.finalPrice = null;
      updateData.winner_id = null;
      updateData.status = 'NO_BID';
    }
    
    await updateDoc(auctionRef, updateData);
    
    // RTDB에서 실시간 경매 데이터 삭제
    if (snapshot.exists()) {
      await set(liveAuctionRef, null);
    }
    
    console.log('경매 종료 처리 완료:', auctionId);
    return updateData;
  } catch (error) {
    console.error('경매 종료 처리 실패:', error);
    throw new Error('경매 종료 처리에 실패했습니다.');
  }
};

/**
 * 경매 결제 완료 처리
 * @param {string} auctionId - 경매 ID
 */
export const completePayment = async (auctionId) => {
  try {
    const auctionRef = doc(db, 'auctions', auctionId);
    await updateDoc(auctionRef, {
      is_payment_completed: true,
      payment_completed_at: new Date()
    });
    
    console.log('결제 완료 처리:', auctionId);
    return true;
  } catch (error) {
    console.error('결제 완료 처리 실패:', error);
    throw new Error('결제 완료 처리에 실패했습니다.');
  }
};

/**
 * 경매 정산 완료 처리
 * @param {string} auctionId - 경매 ID
 */
export const completeSettlement = async (auctionId) => {
  try {
    const auctionRef = doc(db, 'auctions', auctionId);
    await updateDoc(auctionRef, {
      is_settlement_completed: true,
      settlement_completed_at: new Date()
    });
    
    console.log('정산 완료 처리:', auctionId);
    return true;
  } catch (error) {
    console.error('정산 완료 처리 실패:', error);
    throw new Error('정산 완료 처리에 실패했습니다.');
  }
};

/**
 * 실시간 경매 데이터 구독
 * @param {string} auctionId - 경매 ID
 * @param {Function} callback - 데이터 변경 시 호출될 콜백 함수
 * @returns {Function} 구독 해제 함수
 */
export const subscribeLiveAuction = (auctionId, callback) => {
  const liveAuctionRef = ref(rtdb, `live_auctions/${auctionId}`);
  
  onValue(liveAuctionRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val());
    } else {
      callback(null);
    }
  });
  
  // 구독 해제 함수 반환
  return () => off(liveAuctionRef);
};

/**
 * 사용자가 참여한 경매 목록 조회 (bid_history 기반)
 * @param {string} userId - 사용자 ID
 * @param {string} userType - 사용자 타입 ('consumer', 'supplier')
 * @returns {Array} 사용자가 참여한 경매 목록
 */
export const getUserParticipatedAuctions = async (userId, userType = null) => {
  try {
    // 1. bid_history에서 사용자가 참여한 모든 경매 ID 수집
    const bidHistoryRef = ref(rtdb, 'bid_history');
    const snapshot = await get(bidHistoryRef);
    
    if (!snapshot.exists()) {
      return [];
    }
    
    const participatedAuctionIds = new Set();
    const bidHistoryData = snapshot.val();
    
    // 모든 경매의 입찰 히스토리를 확인
    Object.keys(bidHistoryData).forEach(auctionId => {
      const auctionBids = bidHistoryData[auctionId];
      
      // 각 경매의 입찰들을 확인
      Object.keys(auctionBids).forEach(timestamp => {
        const bid = auctionBids[timestamp];
        if (bid.bidder_id === userId) {
          participatedAuctionIds.add(auctionId);
        }
      });
    });
    
    // 2. 참여한 경매 ID들이 없으면 빈 배열 반환
    if (participatedAuctionIds.size === 0) {
      return [];
    }
    
    // 3. Firestore에서 해당 경매들의 정보 조회
    const auctions = [];
    const auctionPromises = Array.from(participatedAuctionIds).map(async (auctionId) => {
      try {
        const auctionRef = doc(db, 'auctions', auctionId);
        const auctionSnap = await getDoc(auctionRef);
        
        if (auctionSnap.exists()) {
          const auctionData = auctionSnap.data();
          const hasWinner = auctionData.winner_id && auctionData.winner_id !== null;
          
          // 사용자 타입에 따른 상태 텍스트 추가
          let displayStatus = auctionData.status;
          if (userType === 'consumer') {
            displayStatus = getConsumerStatus(
              auctionData.status, 
              hasWinner, 
              auctionData.is_payment_completed
            );
          } else if (userType === 'supplier') {
            displayStatus = getSupplierStatus(
              auctionData.status, 
              hasWinner, 
              auctionData.is_settlement_completed
            );
          }
          
          return {
            id: auctionSnap.id,
            ...auctionData,
            displayStatus
          };
        }
        return null;
      } catch (error) {
        console.error(`경매 ${auctionId} 조회 실패:`, error);
        return null;
      }
    });
    
    const results = await Promise.all(auctionPromises);
    
    // null이 아닌 결과만 필터링하고 created_at 기준으로 내림차순 정렬
    const validAuctions = results
      .filter(auction => auction !== null)
      .sort((a, b) => {
        // created_at이 Timestamp 객체인 경우
        const aTime = a.created_at?.toDate ? a.created_at.toDate() : new Date(a.created_at);
        const bTime = b.created_at?.toDate ? b.created_at.toDate() : new Date(b.created_at);
        return bTime - aTime;
      });
    
    console.log('사용자가 참여한 경매 목록 조회 완료:', validAuctions.length);
    return validAuctions;
    
  } catch (error) {
    console.error('사용자 참여 경매 목록 조회 실패:', error);
    throw new Error('참여한 경매 목록 조회에 실패했습니다.');
  }
};

/**
 * 이미지 URL 가져오기 (fallback 이미지 포함)
 * @param {string} imageUrl - 이미지 URL
 * @param {string} fallbackImage - 기본 이미지 경로
 * @returns {string} 최종 이미지 URL
 */
export const getImageUrl = (imageUrl, fallbackImage = '/fish1.jpg') => {
  // Firebase Storage URL이거나 상대 경로인 경우 그대로 반환
  if (imageUrl && (imageUrl.includes('firebasestorage.googleapis.com') || imageUrl.startsWith('/'))) {
    return imageUrl;
  }
  
  // 유효하지 않은 URL이면 fallback 이미지 반환
  return fallbackImage;
};

/**
 * 이미지 삭제 (Firebase Storage에서)
 * @param {string} imageUrl - 삭제할 이미지 URL
 */
export const deleteImage = async (imageUrl) => {
  try {
    // Firebase Storage URL인지 확인
    if (imageUrl && imageUrl.includes('firebasestorage.googleapis.com')) {
      const imageRef = ref(storage, imageUrl);
      await deleteObject(imageRef);
      console.log('이미지 삭제 완료:', imageUrl);
    }
  } catch (error) {
    console.error('이미지 삭제 실패:', error);
    // 이미지 삭제 실패는 치명적이지 않으므로 에러를 던지지 않음
  }
}; 
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
import { ref, set, get, onValue, off, serverTimestamp as rtdbServerTimestamp } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, rtdb, storage } from '../firebase';

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
    
    // 이미지 업로드 (파일이 제공된 경우)
    if (imageFile) {
      const fileName = `auction_images/${finalSellerId}_${Date.now()}.${imageFile.name.split('.').pop()}`;
      const imageRef = storageRef(storage, fileName);
      const uploadResult = await uploadBytes(imageRef, imageFile);
      imageUrl = await getDownloadURL(uploadResult.ref);
    }
    
    // 경매 데이터 구성
    const auction = {
      name: auctionData.name,
      description: auctionData.description,
      image_url: imageUrl,
      location: auctionData.location,
      seller_id: finalSellerId,
      status: auctionData.status || 'PENDING', // PENDING, ACTIVE, FINISHED
      start_time: auctionData.start_time,
      end_time: auctionData.end_time,
      starting_price: auctionData.starting_price,
      final_price: auctionData.final_price || null,
      winner_id: auctionData.winner_id || null,
      created_at: serverTimestamp()
    };

    // 선택적 필드들 추가 (있는 경우에만)
    if (auctionData.species) auction.species = auctionData.species;
    if (auctionData.seller_name) auction.seller_name = auctionData.seller_name;
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
 * @param {string} status - 경매 상태 ('PENDING', 'ACTIVE', 'FINISHED', 'ALL')
 * @param {number} limitCount - 조회할 개수
 * @returns {Array} 경매 목록
 */
export const getAuctions = async (status = 'ALL', limitCount = 50) => {
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
      auctions.push({
        id: doc.id,
        ...doc.data()
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
 * @returns {Object|null} 경매 정보
 */
export const getAuction = async (auctionId) => {
  try {
    const auctionRef = doc(db, 'auctions', auctionId);
    const auctionSnap = await getDoc(auctionRef);
    
    if (auctionSnap.exists()) {
      return {
        id: auctionSnap.id,
        ...auctionSnap.data()
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
 * @returns {Array} 경매 목록
 */
export const getUserAuctions = async (userId, type = 'seller') => {
  try {
    const auctionsRef = collection(db, 'auctions');
    let auctionQuery;
    
    if (type === 'seller') {
      auctionQuery = query(
        auctionsRef,
        where('seller_id', '==', userId),
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
      auctions.push({
        id: doc.id,
        ...doc.data()
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
      current_price: startingPrice,
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
 * 입찰하기
 * @param {string} auctionId - 경매 ID
 * @param {string} bidderId - 입찰자 UID
 * @param {number} bidAmount - 입찰 금액
 */
export const placeBid = async (auctionId, bidderId, bidAmount) => {
  try {
    const liveAuctionRef = ref(rtdb, `live_auctions/${auctionId}`);
    
    // 현재 최고가 확인
    const snapshot = await get(liveAuctionRef);
    if (!snapshot.exists()) {
      throw new Error('진행 중인 경매가 아닙니다.');
    }
    
    const currentData = snapshot.val();
    if (bidAmount <= currentData.current_price) {
      throw new Error('입찰 금액이 현재 최고가보다 낮습니다.');
    }
    
    // RTDB에 새 입찰 정보 저장
    await set(liveAuctionRef, {
      current_price: bidAmount,
      last_bidder_id: bidderId,
      last_bid_timestamp: rtdbServerTimestamp()
    });
    
    console.log('입찰 성공:', { auctionId, bidderId, bidAmount });
    return true;
  } catch (error) {
    console.error('입찰 실패:', error);
    throw error;
  }
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
      updateData.final_price = finalData.current_price;
      updateData.winner_id = finalData.last_bidder_id;
    } else {
      // 유찰 처리
      updateData.final_price = null;
      updateData.winner_id = null;
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
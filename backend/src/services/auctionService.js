const { db, rtdb } = require('../config/firebase');
const { AUCTION_STATUS } = require('../constants/auctionStatus');

class AuctionService {
  /**
   * 서울 시간대 기준 현재 시간 반환
   */
  getSeoulTime() {
    // 현재 UTC 시간
    const utcNow = new Date();
    // 한국 시간대(UTC+9) 오프셋 적용
    const seoulTime = new Date(utcNow.getTime() + (9 * 60 * 60 * 1000));
    return seoulTime;
  }

  /**
   * 서울 시간대 기준 시간 문자열을 Date 객체로 변환
   */
  parseSeoulTime(timeString) {
    if (!timeString) return null;
    
    // 이미 시간대 정보가 있는 경우
    if (timeString.includes('+') || timeString.includes('Z')) {
      return new Date(timeString);
    }
    
    // 시간대 정보가 없는 경우, 한국 시간으로 저장된 것으로 간주하고 UTC로 변환
    // 예: "2025-06-18T09:19" -> 한국 시간 09:19 -> UTC 00:19
    const date = new Date(timeString);
    // 9시간(한국 시간대 오프셋)을 빼서 UTC 시간으로 변환
    return new Date(date.getTime() - (9 * 60 * 60 * 1000));
  }
  /**
   * 시작 시간이 된 경매들을 ACTIVE 상태로 변경하고 Realtime DB에 실시간 경매 데이터 생성
   */
  async activatePendingAuctions() {
    try {
      const now = this.getSeoulTime();
      const seoulTimeStr = now.toLocaleString("ko-KR", {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      console.log(`현재 서울 시간: ${seoulTimeStr} (UTC+9 기준: ${now.toISOString()})`);
      
      // PENDING 상태이면서 시작 시간이 현재 시간보다 이전인 경매들 조회
      const auctionsRef = db.collection('auctions');
      const pendingAuctions = await auctionsRef
        .where('status', '==', AUCTION_STATUS.PENDING)
        .get();

      const activationPromises = [];
      const rtdbPromises = [];
      const activatedAuctions = [];

      pendingAuctions.forEach((doc) => {
        const auction = doc.data();
        
        // 서울 시간대 기준으로 시작 시간 파싱
        const auctionStartTime = this.parseSeoulTime(auction.auction_start_time);
        
        const startTimeStr = auctionStartTime.toLocaleString("ko-KR", {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        });
        console.log(`경매 ${doc.id}: 시작시간=${startTimeStr}, 현재시간=${seoulTimeStr}`);
        console.log(`시간 비교: 시작(${auctionStartTime.getTime()}) <= 현재(${now.getTime()}) = ${auctionStartTime <= now ? '활성화 대상' : '아직 시간 안됨'}`);
        
        // 시작 시간이 현재 서울 시간보다 이전이면 활성화
        if (auctionStartTime <= now) {
          console.log(`경매 활성화 예정: ${doc.id} - ${auction.name}`);
          
          // Firestore 상태 업데이트 (서울 시간 기준)
          const updatePromise = auctionsRef.doc(doc.id).update({
            status: AUCTION_STATUS.ACTIVE,
            activated_at: now
          });
          
          // Realtime DB에 실시간 경매 데이터 생성
          const rtdbPromise = rtdb.ref(`live_auctions/${doc.id}`).set({
            currentPrice: auction.startPrice || auction.currentPrice,
            last_bidder_id: 'none',
            last_bid_timestamp: now.getTime(),
            auction_id: doc.id,
            auction_name: auction.name,
            started_at: now.getTime()
          });
          
          activationPromises.push(updatePromise);
          rtdbPromises.push(rtdbPromise);
          activatedAuctions.push({
            id: doc.id,
            name: auction.name,
            startTime: auctionStartTime,
            startPrice: auction.startPrice || auction.currentPrice
          });
        }
      });

      // 모든 업데이트 실행 (Firestore와 Realtime DB 동시 실행)
      if (activationPromises.length > 0) {
        await Promise.all([...activationPromises, ...rtdbPromises]);
        console.log(`${activationPromises.length}개의 경매가 활성화되었습니다:`, activatedAuctions);
        
        // 활성화된 각 경매에 대해 상세 로그
        activatedAuctions.forEach(auction => {
          console.log(`✅ 실시간 경매 시작: ${auction.name} (ID: ${auction.id}) - 시작가: ₩${auction.startPrice.toLocaleString()}`);
        });
      } else {
        console.log('활성화할 경매가 없습니다.');
      }

      return activatedAuctions;
    } catch (error) {
      console.error('경매 활성화 중 오류 발생:', error);
      throw error;
    }
  }

  /**
   * 종료 시간이 된 경매들을 FINISHED 상태로 변경하고 Realtime DB 데이터 정리
   */
  async finishActiveAuctions() {
    try {
      const now = this.getSeoulTime();
      const seoulTimeStr = now.toLocaleString("ko-KR", {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      console.log(`현재 서울 시간: ${seoulTimeStr} (UTC+9 기준: ${now.toISOString()})`);
      
      // ACTIVE 상태이면서 종료 시간이 현재 시간보다 이전인 경매들 조회
      const auctionsRef = db.collection('auctions');
      const activeAuctions = await auctionsRef
        .where('status', '==', AUCTION_STATUS.ACTIVE)
        .get();

      const finishPromises = [];
      const rtdbPromises = [];
      const finishedAuctions = [];

      for (const doc of activeAuctions.docs) {
        const auction = doc.data();
        
        // 서울 시간대 기준으로 종료 시간 파싱
        const auctionEndTime = this.parseSeoulTime(auction.auction_end_time);
        
        const endTimeStr = auctionEndTime.toLocaleString("ko-KR", {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        });
        console.log(`경매 ${doc.id}: 종료시간=${endTimeStr}, 현재시간=${seoulTimeStr}`);
        console.log(`시간 비교: 종료(${auctionEndTime.getTime()}) <= 현재(${now.getTime()}) = ${auctionEndTime <= now ? '종료 대상' : '아직 시간 안됨'}`);
        
        // 종료 시간이 현재 서울 시간보다 이전이면 종료
        if (auctionEndTime <= now) {
          console.log(`경매 종료 예정: ${doc.id} - ${auction.name}`);
          
          // Realtime DB에서 입찰 히스토리 조회
          const bidHistorySnapshot = await rtdb.ref(`bid_history/${doc.id}`).once('value');
          const bidHistory = bidHistorySnapshot.val();
          
          let finalPrice = auction.startPrice;
          let winnerId = null;
          let finalStatus = AUCTION_STATUS.NO_BID;
          
          // 입찰 히스토리가 있으면 최고가 입찰자 찾기
          if (bidHistory) {
            let highestBid = null;
            let highestBidder = null;
            
            // 모든 입찰을 확인하여 최고가 입찰 찾기
            Object.keys(bidHistory).forEach(timestamp => {
              const bid = bidHistory[timestamp];
              if (!highestBid || bid.amount > highestBid) {
                highestBid = bid.amount;
                highestBidder = bid.bidder_id;
              }
            });
            
            if (highestBid && highestBidder) {
              finalPrice = highestBid;
              winnerId = highestBidder;
              finalStatus = AUCTION_STATUS.FINISHED;
              console.log(`최고가 입찰 발견: ${highestBid}원 (입찰자: ${highestBidder})`);
            }
          }
          
          // Realtime DB에서 실시간 경매 데이터도 확인
          const liveAuctionSnapshot = await rtdb.ref(`live_auctions/${doc.id}`).once('value');
          const liveData = liveAuctionSnapshot.val();
          
          if (liveData && liveData.last_bidder_id !== 'none') {
            // 실시간 데이터가 더 높은 가격이면 업데이트
            if (liveData.currentPrice > finalPrice) {
              finalPrice = liveData.currentPrice;
              winnerId = liveData.last_bidder_id;
              finalStatus = AUCTION_STATUS.FINISHED;
              console.log(`실시간 데이터에서 더 높은 입찰 발견: ${liveData.currentPrice}원 (입찰자: ${liveData.last_bidder_id})`);
            }
          }
          
          // Firestore 최종 결과 업데이트 (서울 시간 기준)
          const updatePromise = auctionsRef.doc(doc.id).update({
            status: finalStatus,
            finalPrice: finalPrice,
            winner_id: winnerId,
            finished_at: now
          });
          
          // Realtime DB에서 실시간 경매 데이터 삭제 (입찰 히스토리는 보존)
          const rtdbPromise = rtdb.ref(`live_auctions/${doc.id}`).remove();
          
          finishPromises.push(updatePromise);
          rtdbPromises.push(rtdbPromise);
          finishedAuctions.push({
            id: doc.id,
            name: auction.name,
            endTime: auctionEndTime,
            finalPrice: finalPrice,
            winnerId: winnerId,
            finalStatus: finalStatus
          });
        }
      }

      // 모든 업데이트 실행
      if (finishPromises.length > 0) {
        await Promise.all([...finishPromises, ...rtdbPromises]);
        console.log(`${finishPromises.length}개의 경매가 종료되었습니다:`, finishedAuctions);
        
        // 종료된 각 경매에 대해 상세 로그
        finishedAuctions.forEach(auction => {
          if (auction.finalStatus === AUCTION_STATUS.FINISHED) {
            console.log(`🎉 경매 낙찰: ${auction.name} - 낙찰가: ₩${auction.finalPrice.toLocaleString()} (낙찰자: ${auction.winnerId})`);
          } else {
            console.log(`❌ 경매 유찰: ${auction.name} - 입찰자 없음`);
          }
        });
      } else {
        console.log('종료할 경매가 없습니다.');
      }

      return finishedAuctions;
    } catch (error) {
      console.error('경매 종료 중 오류 발생:', error);
      throw error;
    }
  }

  /**
   * 특정 경매의 상세 정보 조회
   */
  async getAuctionById(auctionId) {
    try {
      const auctionDoc = await db.collection('auctions').doc(auctionId).get();
      
      if (!auctionDoc.exists) {
        return null;
      }
      
      return {
        id: auctionDoc.id,
        ...auctionDoc.data()
      };
    } catch (error) {
      console.error('경매 정보 조회 중 오류 발생:', error);
      throw error;
    }
  }

  /**
   * 경매 목록 조회 (상태별 필터링 가능)
   */
  async getAuctions(status = null, limit = 50) {
    try {
      const auctionsRef = db.collection('auctions');
      let query = auctionsRef.orderBy('created_at', 'desc').limit(limit);
      
      if (status) {
        query = auctionsRef
          .where('status', '==', status)
          .orderBy('created_at', 'desc')
          .limit(limit);
      }
      
      const snapshot = await query.get();
      const auctions = [];
      
      snapshot.forEach((doc) => {
        auctions.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return auctions;
    } catch (error) {
      console.error('경매 목록 조회 중 오류 발생:', error);
      throw error;
    }
  }

  /**
   * 경매 상태 업데이트
   */
  async updateAuctionStatus(auctionId, status, additionalData = {}) {
    try {
      const updateData = {
        status: status,
        updated_at: new Date(),
        ...additionalData
      };
      
      await db.collection('auctions').doc(auctionId).update(updateData);
      console.log(`경매 상태 업데이트 완료: ${auctionId} -> ${status}`);
      
      return true;
    } catch (error) {
      console.error('경매 상태 업데이트 중 오류 발생:', error);
      throw error;
    }
  }

  /**
   * 특정 경매를 수동으로 활성화 (테스트용)
   * @param {string} auctionId - 경매 ID
   */
  async activateAuctionManually(auctionId) {
    try {
      const auctionRef = db.collection('auctions').doc(auctionId);
      const auctionDoc = await auctionRef.get();
      
      if (!auctionDoc.exists) {
        throw new Error('경매를 찾을 수 없습니다.');
      }
      
      const auction = auctionDoc.data();
      
      if (auction.status !== AUCTION_STATUS.PENDING) {
        throw new Error(`경매 상태가 PENDING이 아닙니다. 현재 상태: ${auction.status}`);
      }
      
      const now = this.getSeoulTime();
      
      // Firestore 상태 업데이트
      await auctionRef.update({
        status: AUCTION_STATUS.ACTIVE,
        activated_at: now
      });
      
      // Realtime DB에 실시간 경매 데이터 생성
      await rtdb.ref(`live_auctions/${auctionId}`).set({
        currentPrice: auction.startPrice || auction.currentPrice,
        last_bidder_id: 'none',
        last_bid_timestamp: now.getTime(),
        auction_id: auctionId,
        auction_name: auction.name,
        started_at: now.getTime()
      });
      
      console.log(`✅ 경매 수동 활성화 완료: ${auction.name} (ID: ${auctionId})`);
      
      return {
        id: auctionId,
        name: auction.name,
        startPrice: auction.startPrice || auction.currentPrice,
        activatedAt: now
      };
    } catch (error) {
      console.error('경매 수동 활성화 실패:', error);
      throw error;
    }
  }

  /**
   * 특정 경매를 수동으로 종료 (테스트용)
   * @param {string} auctionId - 경매 ID
   */
  async finishAuctionManually(auctionId) {
    try {
      const auctionRef = db.collection('auctions').doc(auctionId);
      const auctionDoc = await auctionRef.get();
      
      if (!auctionDoc.exists) {
        throw new Error('경매를 찾을 수 없습니다.');
      }
      
      const auction = auctionDoc.data();
      
      if (auction.status !== AUCTION_STATUS.ACTIVE) {
        throw new Error(`경매 상태가 ACTIVE가 아닙니다. 현재 상태: ${auction.status}`);
      }
      
      // Realtime DB에서 최종 입찰 정보 조회
      const liveAuctionSnapshot = await rtdb.ref(`live_auctions/${auctionId}`).once('value');
      const liveData = liveAuctionSnapshot.val();
      
      let finalPrice = auction.currentPrice;
      let winnerId = null;
      let finalStatus = AUCTION_STATUS.NO_BID;
      
      if (liveData && liveData.last_bidder_id !== 'none') {
        finalPrice = liveData.currentPrice;
        winnerId = liveData.last_bidder_id;
        finalStatus = AUCTION_STATUS.FINISHED;
      }
      
      const now = this.getSeoulTime();
      
      // Firestore 최종 결과 업데이트
      await auctionRef.update({
        status: finalStatus,
        finalPrice: finalPrice,
        winner_id: winnerId,
        finished_at: now
      });
      
      // Realtime DB에서 실시간 경매 데이터 삭제
      await rtdb.ref(`live_auctions/${auctionId}`).remove();
      
      console.log(`✅ 경매 수동 종료 완료: ${auction.name} (ID: ${auctionId}) - 상태: ${finalStatus}`);
      
      return {
        id: auctionId,
        name: auction.name,
        finalPrice: finalPrice,
        winnerId: winnerId,
        finalStatus: finalStatus,
        finishedAt: now
      };
    } catch (error) {
      console.error('경매 수동 종료 실패:', error);
      throw error;
    }
  }
}

module.exports = new AuctionService(); 
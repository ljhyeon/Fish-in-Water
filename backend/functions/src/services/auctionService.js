const { db, rtdb } = require('../config/firebase');
const { AUCTION_STATUS } = require('../constants/auctionStatus');

class AuctionService {
  /**
   * 현재 시간(UTC)을 반환
   */
  getSeoulTime() {
    // Date 객체는 항상 UTC를 기준으로 시간을 나타냅니다.
    // 시간대 변환은 포맷팅 시에만 적용하는 것이 올바른 방법입니다.
    return new Date();
  }

  /**
   * 서울 시간대 기준 시간 문자열을 서울 시간 Date 객체로 변환
   * 입력: "2025-06-18T09:19" (서울 시간)
   * 출력: Date 객체 (서울 시간 기준)
   */
  parseSeoulTime(timeString) {
    if (!timeString) return null;
    
    // 이미 시간대 정보가 있는 경우 그대로 사용
    if (timeString.includes('+') || timeString.includes('Z')) {
      return new Date(timeString);
    }
    
    // 시간대 정보가 없는 경우, 서울 시간으로 저장된 것으로 간주
    // "2025-06-18T09:19" -> 서울 시간 09:19로 해석
    // 서울 시간대 정보를 명시적으로 추가
    return new Date(timeString + '+09:00');
  }

  /**
   * 시작 시간이 된 경매들을 ACTIVE 상태로 변경
   */
  async activatePendingAuctions() {
    try {
      // 서울 시간 기준으로 현재 시간 계산
      const now = this.getSeoulTime();
      const seoulTimeStr = now.toLocaleString("ko-KR", {
        timeZone: 'Asia/Seoul',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hourCycle: 'h23'
      });
      console.log(`현재 서울 시간: ${seoulTimeStr} (UTC 기준: ${now.toISOString()})`);
      
      // PENDING 상태이면서 시작 시간이 현재 시간보다 이전인 경매들 조회
      console.log(`PENDING 상태 경매 조회 시작...`);
      const auctionsRef = db.collection('auctions');
      const pendingAuctions = await auctionsRef
        .where('status', '==', AUCTION_STATUS.PENDING)
        .get();
      
      console.log(`PENDING 상태 경매 ${pendingAuctions.size}개 발견`);

      const activationPromises = [];
      const activatedAuctions = [];

      pendingAuctions.forEach((doc) => {
        const auction = doc.data();
        console.log(`경매 ID: ${doc.id}, 이름: ${auction.name}, 상태: ${auction.status}`);
        console.log(`원본 시작시간: ${auction.auction_start_time}`);
        
        // 서울 시간대 기준으로 시작 시간 파싱
        const auctionStartTime = this.parseSeoulTime(auction.auction_start_time);
        
        const startTimeStr = auctionStartTime.toLocaleString("ko-KR", {
          timeZone: 'Asia/Seoul',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hourCycle: 'h23'
        });
        console.log(`경매 ${doc.id}: 시작시간=${startTimeStr}, 현재시간=${seoulTimeStr}`);
        console.log(`시간 비교: 시작(${auctionStartTime.getTime()}) <= 현재(${now.getTime()}) = ${auctionStartTime <= now ? '활성화 대상' : '아직 시간 안됨'}`);
        
        // 시작 시간이 현재 서울 시간보다 이전이면 활성화
        if (auctionStartTime <= now) {
          console.log(`경매 활성화 예정: ${doc.id} - ${auction.name}`);
          
          const updatePromise = this.updateAuctionInBothDatabases(doc.id, {
            status: AUCTION_STATUS.ACTIVE,
            activated_at: now
          });
          
          activationPromises.push(updatePromise);
          activatedAuctions.push({
            id: doc.id,
            name: auction.name,
            startTime: auctionStartTime
          });
        }
      });

      // 모든 업데이트 실행
      if (activationPromises.length > 0) {
        await Promise.all(activationPromises);
        console.log(`${activationPromises.length}개의 경매가 활성화되었습니다:`, activatedAuctions);
      } else {
        console.log('활성화할 경매가 없습니다.');
      }

      return activatedAuctions;
    } catch (error) {
      console.error('경매 활성화 중 오류 발생:', error);
      console.error('오류 상세:', error.message);
      console.error('스택 트레이스:', error.stack);
      throw error;
    }
  }

  /**
   * 종료 시간이 된 경매들을 FINISHED 상태로 변경
   */
  async finishActiveAuctions() {
    try {
      // 서울 시간대 기준으로 현재 시간 계산
      const now = this.getSeoulTime();
      const seoulTimeStr = now.toLocaleString("ko-KR", {
        timeZone: 'Asia/Seoul',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hourCycle: 'h23'
      });
      console.log(`현재 서울 시간: ${seoulTimeStr} (UTC 기준: ${now.toISOString()})`);
      
      // ACTIVE 상태이면서 종료 시간이 현재 시간보다 이전인 경매들 조회
      console.log(`ACTIVE 상태 경매 조회 시작...`);
      const auctionsRef = db.collection('auctions');
      const activeAuctions = await auctionsRef
        .where('status', '==', AUCTION_STATUS.ACTIVE)
        .get();
      
      console.log(`ACTIVE 상태 경매 ${activeAuctions.size}개 발견`);

      const finishPromises = [];
      const finishedAuctions = [];

      for (const doc of activeAuctions.docs) {
        const auction = doc.data();
        
        // 서울 시간대 기준으로 종료 시간 파싱
        const auctionEndTime = this.parseSeoulTime(auction.auction_end_time);
        
        const endTimeStr = auctionEndTime.toLocaleString("ko-KR", {
          timeZone: 'Asia/Seoul',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hourCycle: 'h23'
        });
        console.log(`경매 ${doc.id}: 종료시간=${endTimeStr}, 현재시간=${seoulTimeStr}`);
        console.log(`시간 비교: 종료(${auctionEndTime.getTime()}) <= 현재(${now.getTime()}) = ${auctionEndTime <= now ? '종료 대상' : '아직 시간 안됨'}`);
        
        // 종료 시간이 현재 서울 시간보다 이전이면 종료
        if (auctionEndTime <= now) {
          console.log(`경매 종료 예정: ${doc.id} - ${auction.name}`);
          
          // Realtime DB에서 입찰 히스토리 조회
          const bidHistorySnapshot = await rtdb.ref(`bid_history/${doc.id}`).once('value');
          const bidHistory = bidHistorySnapshot.val();
          
          let finalPrice = auction.startPrice || auction.currentPrice;
          let winnerId = null;
          let finalStatus = AUCTION_STATUS.NO_BID;
          
          // 입찰 히스토리가 있으면 최고가 입찰자 찾기
          if (bidHistory) {
            let highestBid = null;
            let highestBidder = null;
            
            console.log(`입찰 히스토리 확인 중... 총 ${Object.keys(bidHistory).length}개의 입찰`);
            
            // 모든 입찰을 확인하여 최고가 입찰 찾기
            Object.keys(bidHistory).forEach(timestamp => {
              const bid = bidHistory[timestamp];
              console.log(`입찰: ${bid.amount}원 (입찰자: ${bid.bidder_id})`);
              
              if (!highestBid || bid.amount > highestBid) {
                highestBid = bid.amount;
                highestBidder = bid.bidder_id;
              }
            });
            
            if (highestBid && highestBidder) {
              finalPrice = highestBid;
              winnerId = highestBidder;
              finalStatus = AUCTION_STATUS.FINISHED;
              console.log(`✅ 최고가 입찰 발견: ${highestBid}원 (입찰자: ${highestBidder})`);
            } else {
              console.log(`❌ 유효한 입찰이 없음`);
            }
          } else {
            console.log(`❌ 입찰 히스토리가 없음`);
          }
          
          const updatePromise = this.updateAuctionInBothDatabases(doc.id, {
            status: finalStatus,
            finalPrice: finalPrice,
            winner_id: winnerId,
            finished_at: now
          });
          
          finishPromises.push(updatePromise);
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
        await Promise.all(finishPromises);
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
      // 서울 시간대 기준으로 업데이트 시간 설정 (다른 메서드들과 일관성 유지)
      const seoulTime = this.getSeoulTime();
      
      const updateData = {
        status: status,
        updated_at: seoulTime,
        ...additionalData
      };
      
      await this.updateAuctionInBothDatabases(auctionId, updateData);
      console.log(`경매 상태 업데이트 완료: ${auctionId} -> ${status}`);
      
      return true;
    } catch (error) {
      console.error('경매 상태 업데이트 중 오류 발생:', error);
      throw error;
    }
  }

  /**
   * Firestore와 Realtime Database를 동시에 업데이트하는 헬퍼 함수
   */
  async updateAuctionInBothDatabases(auctionId, updateData) {
    try {
      // Firestore 업데이트
      await db.collection('auctions').doc(auctionId).update(updateData);
      
      // 경매가 ACTIVE 상태로 변경되는 경우 live_auctions에 데이터 생성
      if (updateData.status === 'ACTIVE') {
        // Firestore에서 전체 경매 데이터 조회
        const auctionDoc = await db.collection('auctions').doc(auctionId).get();
        if (auctionDoc.exists) {
          const auctionData = auctionDoc.data();
          
          // live_auctions에 실시간 경매 데이터 생성
          const liveAuctionData = {
            auctionId: auctionId,
            currentPrice: auctionData.currentPrice || auctionData.startPrice,
            last_bidder_id: 'none',
            last_bid_timestamp: this.getSeoulTime().getTime(),
            status: 'ACTIVE',
            created_at: this.getSeoulTime().getTime()
          };
          
          await rtdb.ref(`live_auctions/${auctionId}`).set(liveAuctionData);
          console.log(`live_auctions에 경매 데이터 생성: ${auctionId}`);
        }
      }
      
      // 경매가 종료되는 경우 live_auctions에서 데이터 삭제
      if (updateData.status === 'FINISHED' || updateData.status === 'NO_BID') {
        await rtdb.ref(`live_auctions/${auctionId}`).remove();
        console.log(`live_auctions에서 경매 데이터 삭제: ${auctionId}`);
      }
      
      console.log(`경매 ${auctionId} Firestore 업데이트 및 live_auctions 동기화 완료`);
      return true;
    } catch (error) {
      console.error(`경매 ${auctionId} 데이터베이스 업데이트 실패:`, error);
      throw error;
    }
  }
}

module.exports = new AuctionService();
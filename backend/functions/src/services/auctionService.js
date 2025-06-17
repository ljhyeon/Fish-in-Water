const { db, rtdb } = require('../config/firebase');
const { AUCTION_STATUS } = require('../constants/auctionStatus');

class AuctionService {
  /**
   * 시작 시간이 된 경매들을 ACTIVE 상태로 변경
   */
  async activatePendingAuctions() {
    try {
      // 서울 시간대 기준으로 현재 시간 계산
      const now = new Date();
      const seoulTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Seoul"}));
      console.log(`현재 UTC 시간: ${now.toISOString()}`);
      console.log(`현재 서울 시간: ${seoulTime.toISOString()}`);
      
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
          
          // 시간 문자열을 서울 시간대로 명시적으로 해석
          const auctionStartTime = new Date(auction.auction_start_time + '+09:00');
          
          console.log(`경매 ${doc.id}: 시작시간=${auctionStartTime.toISOString()}, 현재서울시간=${seoulTime.toISOString()}`);
          console.log(`비교 결과: ${auctionStartTime <= seoulTime ? '활성화 대상' : '아직 시간 안됨'}`);
          
          // 시작 시간이 서울 시간 기준 현재 시간보다 이전이면 활성화
          if (auctionStartTime <= seoulTime) {
          console.log(`경매 활성화 예정: ${doc.id} - ${auction.name}`);
          
          const updatePromise = this.updateAuctionInBothDatabases(doc.id, {
            status: AUCTION_STATUS.ACTIVE,
            activated_at: seoulTime
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
      const now = new Date();
      const seoulTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Seoul"}));
      
      // ACTIVE 상태이면서 종료 시간이 현재 시간보다 이전인 경매들 조회
      console.log(`ACTIVE 상태 경매 조회 시작...`);
      const auctionsRef = db.collection('auctions');
      const activeAuctions = await auctionsRef
        .where('status', '==', AUCTION_STATUS.ACTIVE)
        .get();
      
      console.log(`ACTIVE 상태 경매 ${activeAuctions.size}개 발견`);

      const finishPromises = [];
      const finishedAuctions = [];

      activeAuctions.forEach((doc) => {
        const auction = doc.data();
        // 시간 문자열을 서울 시간대로 명시적으로 해석
        const auctionEndTime = new Date(auction.auction_end_time + '+09:00');
        
        console.log(`경매 ${doc.id}: 종료시간=${auctionEndTime.toISOString()}, 현재서울시간=${seoulTime.toISOString()}`);
        
        // 종료 시간이 서울 시간 기준 현재 시간보다 이전이면 종료
        if (auctionEndTime <= seoulTime) {
          console.log(`경매 종료 예정: ${doc.id} - ${auction.name}`);
          
          const hasWinner = auction.winner_id && auction.winner_id !== null;
          const finalStatus = hasWinner ? AUCTION_STATUS.FINISHED : AUCTION_STATUS.NO_BID;
          
          const updatePromise = this.updateAuctionInBothDatabases(doc.id, {
            status: finalStatus,
            finished_at: seoulTime
          });
          
          finishPromises.push(updatePromise);
          finishedAuctions.push({
            id: doc.id,
            name: auction.name,
            endTime: auctionEndTime,
            hasWinner: hasWinner,
            finalStatus: finalStatus
          });
        }
      });

      // 모든 업데이트 실행
      if (finishPromises.length > 0) {
        await Promise.all(finishPromises);
        console.log(`${finishPromises.length}개의 경매가 종료되었습니다:`, finishedAuctions);
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
      // 서울 시간대 기준으로 업데이트 시간 설정
      const now = new Date();
      const seoulTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Seoul"}));
      
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
        if (auctionDoc.exists()) {
          const auctionData = auctionDoc.data();
          
          // live_auctions에 실시간 경매 데이터 생성
          const liveAuctionData = {
            auctionId: auctionId,
            currentPrice: auctionData.currentPrice || auctionData.startPrice,
            last_bidder_id: 'none',
            last_bid_timestamp: Date.now(),
            status: 'ACTIVE',
            created_at: Date.now()
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
const { db } = require('../config/firebase');
const { AUCTION_STATUS } = require('../constants/auctionStatus');

class AuctionService {
  /**
   * 시작 시간이 된 경매들을 ACTIVE 상태로 변경
   */
  async activatePendingAuctions() {
    try {
      const now = new Date();
      
      // PENDING 상태이면서 시작 시간이 현재 시간보다 이전인 경매들 조회
      const auctionsRef = db.collection('auctions');
      const pendingAuctions = await auctionsRef
        .where('status', '==', AUCTION_STATUS.PENDING)
        .get();

      const activationPromises = [];
      const activatedAuctions = [];

      pendingAuctions.forEach((doc) => {
        const auction = doc.data();
        const auctionStartTime = new Date(auction.auction_start_time);
        
        // 시작 시간이 현재 시간보다 이전이면 활성화
        if (auctionStartTime <= now) {
          console.log(`경매 활성화 예정: ${doc.id} - ${auction.name}`);
          
          const updatePromise = auctionsRef.doc(doc.id).update({
            status: AUCTION_STATUS.ACTIVE,
            activated_at: new Date()
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
      throw error;
    }
  }

  /**
   * 종료 시간이 된 경매들을 FINISHED 상태로 변경
   */
  async finishActiveAuctions() {
    try {
      const now = new Date();
      
      // ACTIVE 상태이면서 종료 시간이 현재 시간보다 이전인 경매들 조회
      const auctionsRef = db.collection('auctions');
      const activeAuctions = await auctionsRef
        .where('status', '==', AUCTION_STATUS.ACTIVE)
        .get();

      const finishPromises = [];
      const finishedAuctions = [];

      activeAuctions.forEach((doc) => {
        const auction = doc.data();
        const auctionEndTime = new Date(auction.auction_end_time);
        
        // 종료 시간이 현재 시간보다 이전이면 종료
        if (auctionEndTime <= now) {
          console.log(`경매 종료 예정: ${doc.id} - ${auction.name}`);
          
          const hasWinner = auction.winner_id && auction.winner_id !== null;
          const finalStatus = hasWinner ? AUCTION_STATUS.FINISHED : AUCTION_STATUS.NO_BID;
          
          const updatePromise = auctionsRef.doc(doc.id).update({
            status: finalStatus,
            finished_at: new Date()
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
}

module.exports = new AuctionService(); 
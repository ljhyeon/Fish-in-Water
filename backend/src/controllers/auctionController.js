const auctionService = require('../services/auctionService');
const auctionScheduler = require('../services/auctionScheduler');
const { getConsumerStatus, getSupplierStatus } = require('../constants/auctionStatus');

class AuctionController {
  /**
   * 경매 목록 조회
   */
  async getAuctions(req, res) {
    try {
      const { status, limit, user_type } = req.query;
      const auctions = await auctionService.getAuctions(status, parseInt(limit) || 50);
      
      // 사용자 타입에 따라 상태 텍스트 변환
      const auctionsWithStatus = auctions.map(auction => {
        const hasWinner = auction.winner_id && auction.winner_id !== null;
        
        let displayStatus = auction.status;
        if (user_type === 'consumer') {
          displayStatus = getConsumerStatus(auction.status, hasWinner, auction.is_payment_completed);
        } else if (user_type === 'supplier') {
          displayStatus = getSupplierStatus(auction.status, hasWinner, auction.is_settlement_completed);
        }
        
        return {
          ...auction,
          displayStatus
        };
      });
      
      res.json({
        success: true,
        data: auctionsWithStatus,
        total: auctionsWithStatus.length
      });
    } catch (error) {
      console.error('경매 목록 조회 실패:', error);
      res.status(500).json({
        success: false,
        message: '경매 목록 조회에 실패했습니다.',
        error: error.message
      });
    }
  }

  /**
   * 특정 경매 정보 조회
   */
  async getAuction(req, res) {
    try {
      const { auctionId } = req.params;
      const { user_type } = req.query;
      
      const auction = await auctionService.getAuctionById(auctionId);
      
      if (!auction) {
        return res.status(404).json({
          success: false,
          message: '경매를 찾을 수 없습니다.'
        });
      }
      
      // 사용자 타입에 따라 상태 텍스트 변환
      const hasWinner = auction.winner_id && auction.winner_id !== null;
      let displayStatus = auction.status;
      
      if (user_type === 'consumer') {
        displayStatus = getConsumerStatus(auction.status, hasWinner, auction.is_payment_completed);
      } else if (user_type === 'supplier') {
        displayStatus = getSupplierStatus(auction.status, hasWinner, auction.is_settlement_completed);
      }
      
      res.json({
        success: true,
        data: {
          ...auction,
          displayStatus
        }
      });
    } catch (error) {
      console.error('경매 정보 조회 실패:', error);
      res.status(500).json({
        success: false,
        message: '경매 정보 조회에 실패했습니다.',
        error: error.message
      });
    }
  }

  /**
   * 경매 상태 수동 업데이트
   */
  async updateAuctionStatus(req, res) {
    try {
      const result = await auctionScheduler.runManual();
      
      res.json({
        success: true,
        message: '경매 상태 업데이트가 완료되었습니다.',
        data: result
      });
    } catch (error) {
      console.error('경매 상태 업데이트 실패:', error);
      res.status(500).json({
        success: false,
        message: '경매 상태 업데이트에 실패했습니다.',
        error: error.message
      });
    }
  }

  /**
   * 스케줄러 상태 조회
   */
  async getSchedulerStatus(req, res) {
    try {
      const status = auctionScheduler.getStatus();
      
      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      console.error('스케줄러 상태 조회 실패:', error);
      res.status(500).json({
        success: false,
        message: '스케줄러 상태 조회에 실패했습니다.',
        error: error.message
      });
    }
  }

  /**
   * 특정 경매 상태 업데이트
   */
  async updateSpecificAuction(req, res) {
    try {
      const { auctionId } = req.params;
      const { status, ...additionalData } = req.body;
      
      await auctionService.updateAuctionStatus(auctionId, status, additionalData);
      
      res.json({
        success: true,
        message: '경매 상태가 업데이트되었습니다.'
      });
    } catch (error) {
      console.error('경매 상태 업데이트 실패:', error);
      res.status(500).json({
        success: false,
        message: '경매 상태 업데이트에 실패했습니다.',
        error: error.message
      });
    }
  }

  /**
   * 특정 경매 수동 활성화 (테스트용)
   */
  async activateAuction(req, res) {
    try {
      const { auctionId } = req.params;
      
      const result = await auctionService.activateAuctionManually(auctionId);
      
      res.json({
        success: true,
        message: '경매가 수동으로 활성화되었습니다.',
        data: result
      });
    } catch (error) {
      console.error('경매 수동 활성화 실패:', error);
      res.status(500).json({
        success: false,
        message: error.message || '경매 활성화에 실패했습니다.',
        error: error.message
      });
    }
  }

  /**
   * 특정 경매 수동 종료 (테스트용)
   */
  async finishAuction(req, res) {
    try {
      const { auctionId } = req.params;
      
      const result = await auctionService.finishAuctionManually(auctionId);
      
      res.json({
        success: true,
        message: '경매가 수동으로 종료되었습니다.',
        data: result
      });
    } catch (error) {
      console.error('경매 수동 종료 실패:', error);
      res.status(500).json({
        success: false,
        message: error.message || '경매 종료에 실패했습니다.',
        error: error.message
      });
    }
  }

  /**
   * 실시간 경매 데이터 조회 (테스트용)
   */
  async getLiveAuctionData(req, res) {
    try {
      const { auctionId } = req.params;
      const { rtdb } = require('../config/firebase');
      
      const snapshot = await rtdb.ref(`live_auctions/${auctionId}`).once('value');
      const liveData = snapshot.val();
      
      if (!liveData) {
        return res.status(404).json({
          success: false,
          message: '실시간 경매 데이터를 찾을 수 없습니다. 경매가 활성 상태가 아닐 수 있습니다.'
        });
      }
      
      res.json({
        success: true,
        data: liveData
      });
    } catch (error) {
      console.error('실시간 경매 데이터 조회 실패:', error);
      res.status(500).json({
        success: false,
        message: '실시간 경매 데이터 조회에 실패했습니다.',
        error: error.message
      });
    }
  }
}

module.exports = new AuctionController(); 
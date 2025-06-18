const express = require('express');
const router = express.Router();
const auctionController = require('../controllers/auctionController');

// 경매 목록 조회
router.get('/', auctionController.getAuctions);

// 스케줄러 상태 조회 (특정 경매 조회보다 먼저 처리)
router.get('/scheduler/status', auctionController.getSchedulerStatus);

// 특정 경매 정보 조회
router.get('/:auctionId', auctionController.getAuction);

// 실시간 경매 데이터 조회 (테스트용)
router.get('/:auctionId/live', auctionController.getLiveAuctionData);

// 경매 상태 수동 업데이트 (전체)
router.post('/update-status', auctionController.updateAuctionStatus);

// 특정 경매 수동 활성화 (테스트용)
router.post('/:auctionId/activate', auctionController.activateAuction);

// 특정 경매 수동 종료 (테스트용)  
router.post('/:auctionId/finish', auctionController.finishAuction);

// 특정 경매 상태 업데이트
router.put('/:auctionId/status', auctionController.updateSpecificAuction);

module.exports = router; 
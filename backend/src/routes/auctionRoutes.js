const express = require('express');
const router = express.Router();
const auctionController = require('../controllers/auctionController');

// 경매 목록 조회
router.get('/', auctionController.getAuctions);

// 특정 경매 정보 조회
router.get('/:auctionId', auctionController.getAuction);

// 경매 상태 수동 업데이트
router.post('/update-status', auctionController.updateAuctionStatus);

// 스케줄러 상태 조회
router.get('/scheduler/status', auctionController.getSchedulerStatus);

// 특정 경매 상태 업데이트
router.put('/:auctionId/status', auctionController.updateSpecificAuction);

module.exports = router; 
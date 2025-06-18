const { onRequest } = require('firebase-functions/v2/https');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { onDocumentCreated, onDocumentUpdated } = require('firebase-functions/v2/firestore');
const express = require('express');
const cors = require('cors');

// 서비스 import
const auctionService = require('./src/services/auctionService');
const { getConsumerStatus, getSupplierStatus } = require('./src/constants/auctionStatus');

// Express 앱 설정
const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// 기본 라우트
app.get('/', (req, res) => {
  res.json({
    message: '경매 시스템 Firebase Functions',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// 경매 목록 조회
app.get('/auctions', async (req, res) => {
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
});

// 특정 경매 정보 조회
app.get('/auctions/:auctionId', async (req, res) => {
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
});

// 경매 상태 수동 업데이트
app.post('/auctions/update-status', async (req, res) => {
  try {
    const activatedAuctions = await auctionService.activatePendingAuctions();
    const finishedAuctions = await auctionService.finishActiveAuctions();
    
    res.json({
      success: true,
      message: '경매 상태 업데이트가 완료되었습니다.',
      data: {
        activated: activatedAuctions,
        finished: finishedAuctions
      }
    });
  } catch (error) {
    console.error('경매 상태 업데이트 실패:', error);
    res.status(500).json({
      success: false,
      message: '경매 상태 업데이트에 실패했습니다.',
      error: error.message
    });
  }
});

// 특정 경매 상태 업데이트
app.put('/auctions/:auctionId/status', async (req, res) => {
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
});

// HTTP 함수로 Express 앱 내보내기
exports.api = onRequest({
  cors: true,
  region: 'us-central1'
}, app);

// 1분마다 실행되는 스케줄 함수
exports.updateAuctionStatus = onSchedule({
  schedule: 'every 1 minutes',
  timeZone: 'Asia/Seoul',
  region: 'us-central1'
}, async (event) => {
  try {
    // 서울시간 기준 타임스탬프 생성
    const now = new Date();
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
    
    console.log(`경매 상태 자동 업데이트 시작... (서울시간: ${seoulTimeStr}, UTC: ${now.toISOString()})`);
    
    const activatedAuctions = await auctionService.activatePendingAuctions();
    const finishedAuctions = await auctionService.finishActiveAuctions();
    
    console.log(`업데이트 완료 - 활성화: ${activatedAuctions.length}개, 종료: ${finishedAuctions.length}개`);
    
    return {
      success: true,
      activated: activatedAuctions.length,
      finished: finishedAuctions.length
    };
  } catch (error) {
    console.error('스케줄 함수 실행 중 오류:', error);
    throw error;
  }
});

// Firestore 트리거 함수 (경매 생성 시)
exports.onAuctionCreated = onDocumentCreated({
  document: 'auctions/{auctionId}',
  region: 'us-central1'
}, async (event) => {
  try {
    const auctionData = event.data.data();
    const auctionId = event.params.auctionId;
    
    console.log(`새 경매 생성됨: ${auctionId} - ${auctionData.name}`);
    
    // 필요시 추가 로직 (알림 발송 등)
    
    return { success: true };
  } catch (error) {
    console.error('경매 생성 트리거 오류:', error);
    throw error;
  }
});

// Firestore 트리거 함수 (경매 상태 변경 시)
exports.onAuctionStatusChanged = onDocumentUpdated({
  document: 'auctions/{auctionId}',
  region: 'us-central1'
}, async (event) => {
  try {
    const beforeData = event.data.before.data();
    const afterData = event.data.after.data();
    const auctionId = event.params.auctionId;
    
    // 상태가 변경된 경우에만 처리
    if (beforeData.status !== afterData.status) {
      console.log(`경매 상태 변경: ${auctionId} - ${beforeData.status} -> ${afterData.status}`);
      
      // live_auctions 동기화 로직은 auctionService.updateAuctionInBothDatabases로 중앙화되었으므로
      // 이 트리거에서의 중복 로직은 제거합니다.
      // auctionService의 메서드가 호출되면서 필요한 live_auctions 업데이트가 처리됩니다.
    }
    
    return { success: true };
  } catch (error) {
    console.error('경매 상태 변경 트리거 오류:', error);
    throw error;
  }
}); 
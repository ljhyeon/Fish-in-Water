/**
 * 경매 스케줄러 테스트 스크립트
 * 이 스크립트는 스케줄러 기능을 테스트하기 위한 용도입니다.
 */

require('dotenv').config();
const auctionScheduler = require('./src/services/auctionScheduler');

async function testScheduler() {
  console.log('=== 경매 스케줄러 테스트 시작 ===');
  
  try {
    // 수동으로 경매 상태 업데이트 실행
    console.log('\n1. 수동 업데이트 테스트...');
    const result = await auctionScheduler.runManual();
    
    console.log('업데이트 결과:', {
      activated: result.activated.length,
      finished: result.finished.length
    });
    
    if (result.activated.length > 0) {
      console.log('활성화된 경매들:', result.activated);
    }
    
    if (result.finished.length > 0) {
      console.log('종료된 경매들:', result.finished);
    }
    
    // 스케줄러 상태 확인
    console.log('\n2. 스케줄러 상태 확인...');
    const status = auctionScheduler.getStatus();
    console.log('스케줄러 상태:', status);
    
    // 짧은 시간 스케줄러 실행 (5초간)
    console.log('\n3. 5초간 스케줄러 실행 테스트...');
    auctionScheduler.start();
    
    setTimeout(() => {
      console.log('\n스케줄러 중지...');
      auctionScheduler.stop();
      console.log('=== 테스트 완료 ===');
      process.exit(0);
    }, 5000);
    
  } catch (error) {
    console.error('테스트 중 오류 발생:', error);
    process.exit(1);
  }
}

// 스크립트 실행
testScheduler(); 
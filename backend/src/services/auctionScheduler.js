const cron = require('node-cron');
const auctionService = require('./auctionService');

class AuctionScheduler {
  constructor() {
    this.isRunning = false;
  }

  /**
   * 스케줄러 시작
   */
  start() {
    if (this.isRunning) {
      console.log('경매 스케줄러가 이미 실행 중입니다.');
      return;
    }

    console.log('경매 상태 업데이트 스케줄러를 시작합니다...');
    
    // 매분 0초에 실행 (서울 시간대 기준)
    this.job = cron.schedule('0 * * * * *', async () => {
      try {
        // 서울 시간 기준으로 로그
        const seoulTime = new Date().toLocaleString("ko-KR", {
          timeZone: "Asia/Seoul",
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
        console.log(`[서울시간: ${seoulTime}] 경매 상태 확인 중...`);
        
        // 시작 시간이 된 경매들 활성화
        const activatedAuctions = await auctionService.activatePendingAuctions();
        
        // 종료 시간이 된 경매들 종료
        const finishedAuctions = await auctionService.finishActiveAuctions();
        
        // 결과 로그
        if (activatedAuctions.length > 0 || finishedAuctions.length > 0) {
          console.log(`[서울시간: ${seoulTime}] 업데이트 완료 - 활성화: ${activatedAuctions.length}개, 종료: ${finishedAuctions.length}개`);
        }
        
      } catch (error) {
        console.error('경매 상태 업데이트 중 오류 발생:', error);
      }
    }, {
      scheduled: true,
      timezone: 'Asia/Seoul' // 한국 시간대
    });

    this.isRunning = true;
    console.log('경매 스케줄러가 시작되었습니다. (1분마다 실행, 서울 시간대 기준)');
  }

  /**
   * 스케줄러 중지
   */
  stop() {
    if (this.job) {
      this.job.destroy();
      this.isRunning = false;
      console.log('경매 스케줄러가 중지되었습니다.');
    }
  }

  /**
   * 수동으로 경매 상태 업데이트 실행
   */
  async runManual() {
    try {
      console.log('수동 경매 상태 업데이트 실행...');
      
      const activatedAuctions = await auctionService.activatePendingAuctions();
      const finishedAuctions = await auctionService.finishActiveAuctions();
      
      console.log('수동 업데이트 완료:', {
        activated: activatedAuctions.length,
        finished: finishedAuctions.length
      });
      
      return {
        activated: activatedAuctions,
        finished: finishedAuctions
      };
    } catch (error) {
      console.error('수동 업데이트 중 오류 발생:', error);
      throw error;
    }
  }

  /**
   * 스케줄러 상태 조회
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      nextRun: this.job ? this.job.nextDate() : null
    };
  }
}

// 스케줄러 인스턴스 생성 및 내보내기
const auctionScheduler = new AuctionScheduler();

// 모듈이 직접 실행될 때 스케줄러 시작
if (require.main === module) {
  console.log('경매 스케줄러 독립 실행 모드');
  
  // 먼저 한 번 수동 실행
  auctionScheduler.runManual()
    .then(() => {
      // 그 후 스케줄러 시작
      auctionScheduler.start();
    })
    .catch((error) => {
      console.error('스케줄러 시작 실패:', error);
      process.exit(1);
    });

  // 프로세스 종료 시 스케줄러 정리
  process.on('SIGINT', () => {
    console.log('\n경매 스케줄러 종료 중...');
    auctionScheduler.stop();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n경매 스케줄러 종료 중...');
    auctionScheduler.stop();
    process.exit(0);
  });
}

module.exports = auctionScheduler; 
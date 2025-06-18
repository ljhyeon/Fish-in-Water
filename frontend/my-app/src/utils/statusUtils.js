// 경매 기본 상태 (데이터베이스 저장용)
export const AUCTION_STATUS = {
  PENDING: 'PENDING',       // 진행 예정
  ACTIVE: 'ACTIVE',         // 진행중
  FINISHED: 'FINISHED',     // 완료
  NO_BID: 'NO_BID'         // 유찰
};

// 구매자(Consumer) 상태 표시용
export const CONSUMER_STATUS = {
  PENDING: '진행 예정',
  ACTIVE: '진행중',
  PAYMENT_WAITING: '낙찰/결제 대기중',
  PAYMENT_COMPLETED: '낙찰/결제완료',
  NO_BID: '유찰'
};

// 판매자(Supplier) 상태 표시용
export const SUPPLIER_STATUS = {
  PENDING: '진행 예정',
  ACTIVE: '진행중',
  SETTLEMENT_WAITING: '정산 대기중',
  COMPLETED: '완료'
};

/**
 * 구매자용 상태 표시 텍스트 반환
 * @param {string} auctionStatus - 경매 기본 상태
 * @param {boolean} hasWinner - 낙찰자 존재 여부
 * @param {boolean} isPaymentCompleted - 결제 완료 여부
 * @returns {string} 표시할 상태 텍스트
 */
export function getConsumerStatus(auctionStatus, hasWinner = false, isPaymentCompleted = false) {
  switch (auctionStatus) {
    case AUCTION_STATUS.PENDING:
      return CONSUMER_STATUS.PENDING;
    case AUCTION_STATUS.ACTIVE:
      return CONSUMER_STATUS.ACTIVE;
    case AUCTION_STATUS.FINISHED:
      if (!hasWinner) {
        return CONSUMER_STATUS.NO_BID;
      }
      return isPaymentCompleted ? CONSUMER_STATUS.PAYMENT_COMPLETED : CONSUMER_STATUS.PAYMENT_WAITING;
    case AUCTION_STATUS.NO_BID:
      return CONSUMER_STATUS.NO_BID;
    default:
      return CONSUMER_STATUS.PENDING;
  }
}

/**
 * 판매자용 상태 표시 텍스트 반환
 * @param {string} auctionStatus - 경매 기본 상태
 * @param {boolean} hasWinner - 낙찰자 존재 여부
 * @param {boolean} isSettlementCompleted - 정산 완료 여부
 * @returns {string} 표시할 상태 텍스트
 */
export function getSupplierStatus(auctionStatus, hasWinner = false, isSettlementCompleted = false) {
  switch (auctionStatus) {
    case AUCTION_STATUS.PENDING:
      return SUPPLIER_STATUS.PENDING;
    case AUCTION_STATUS.ACTIVE:
      return SUPPLIER_STATUS.ACTIVE;
    case AUCTION_STATUS.FINISHED:
      if (!hasWinner) {
        return SUPPLIER_STATUS.COMPLETED; // 유찰도 판매자 입장에서는 완료
      }
      return isSettlementCompleted ? SUPPLIER_STATUS.COMPLETED : SUPPLIER_STATUS.SETTLEMENT_WAITING;
    case AUCTION_STATUS.NO_BID:
      return SUPPLIER_STATUS.COMPLETED;
    default:
      return SUPPLIER_STATUS.PENDING;
  }
}

/**
 * 경매 상태에 따른 색상 반환
 * @param {string} status - 표시 상태
 * @returns {string} 색상 코드
 */
export function getStatusColor(status) {
  switch (status) {
    case CONSUMER_STATUS.PENDING:
    case SUPPLIER_STATUS.PENDING:
      return '#f39c12'; // 주황색 (대기)
    case CONSUMER_STATUS.ACTIVE:
    case SUPPLIER_STATUS.ACTIVE:
      return '#27ae60'; // 초록색 (진행중)
    case CONSUMER_STATUS.PAYMENT_WAITING:
    case SUPPLIER_STATUS.SETTLEMENT_WAITING:
      return '#3498db'; // 파란색 (대기중)
    case CONSUMER_STATUS.PAYMENT_COMPLETED:
    case SUPPLIER_STATUS.COMPLETED:
      return '#2c3e50'; // 어두운 회색 (완료)
    case CONSUMER_STATUS.NO_BID:
      return '#e74c3c'; // 빨간색 (유찰)
    default:
      return '#95a5a6'; // 회색 (기본)
  }
}

/**
 * 시간 문자열을 Date 객체로 변환
 * @param {string} timeString - 시간 문자열
 * @returns {Date} Date 객체
 */
export function parseAuctionTime(timeString) {
  return new Date(timeString);
}

/**
 * 경매가 현재 활성 상태인지 확인
 * @param {string} startTime - 시작 시간
 * @param {string} endTime - 종료 시간
 * @returns {boolean} 활성 상태 여부
 */
export function isAuctionActive(startTime, endTime) {
  const now = new Date();
  const start = parseAuctionTime(startTime);
  const end = parseAuctionTime(endTime);
  
  return now >= start && now <= end;
}

/**
 * 경매 상태 자동 계산 (클라이언트 사이드)
 * @param {Object} auction - 경매 객체
 * @returns {string} 계산된 상태
 */
export function calculateAuctionStatus(auction) {
  const now = new Date();
  const startTime = parseAuctionTime(auction.auction_start_time);
  const endTime = parseAuctionTime(auction.auction_end_time);
  
  if (now < startTime) {
    return AUCTION_STATUS.PENDING;
  } else if (now >= startTime && now <= endTime) {
    return AUCTION_STATUS.ACTIVE;
  } else {
    // 종료된 경매
    const hasWinner = auction.winner_id && auction.winner_id !== null;
    return hasWinner ? AUCTION_STATUS.FINISHED : AUCTION_STATUS.NO_BID;
  }
} 
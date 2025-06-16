// 경매 기본 상태 (데이터베이스 저장용)
const AUCTION_STATUS = {
  PENDING: 'PENDING',       // 진행 예정
  ACTIVE: 'ACTIVE',         // 진행중
  FINISHED: 'FINISHED',     // 완료
  NO_BID: 'NO_BID'         // 유찰
};

// 구매자(Consumer) 상태 표시용
const CONSUMER_STATUS = {
  PENDING: '진행 예정',
  ACTIVE: '진행중',
  PAYMENT_WAITING: '낙찰/결제 대기중',
  PAYMENT_COMPLETED: '낙찰/결제완료',
  NO_BID: '유찰'
};

// 판매자(Supplier) 상태 표시용
const SUPPLIER_STATUS = {
  PENDING: '진행 예정',
  ACTIVE: '진행중',
  SETTLEMENT_WAITING: '정산 대기중',
  COMPLETED: '완료'
};

// 상태 매핑 함수
function getConsumerStatus(auctionStatus, hasWinner, isPaymentCompleted = false) {
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

function getSupplierStatus(auctionStatus, hasWinner, isSettlementCompleted = false) {
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

module.exports = {
  AUCTION_STATUS,
  CONSUMER_STATUS,
  SUPPLIER_STATUS,
  getConsumerStatus,
  getSupplierStatus
}; 
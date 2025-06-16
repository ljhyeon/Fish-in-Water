import { useState, useEffect } from 'react';
import { 
  getAuctions, 
  getAuction, 
  getUserAuctions, 
  createAuction,
  placeBid,
  subscribeLiveAuction 
} from '../services/auctionService';
import { useAuth } from './useAuth';

/**
 * 경매 목록 관리 훅
 * @param {string} status - 조회할 경매 상태
 * @param {number} limit - 조회할 개수
 */
export const useAuctions = (status = 'ALL', limit = 50) => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAuctions = async () => {
    try {
      setLoading(true);
      setError(null);
      const auctionList = await getAuctions(status, limit);
      setAuctions(auctionList);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuctions();
  }, [status, limit]);

  return {
    auctions,
    loading,
    error,
    refetch: fetchAuctions
  };
};

/**
 * 사용자별 경매 목록 관리 훅
 * @param {string} type - 'seller' 또는 'bidder'
 */
export const useUserAuctions = (type = 'seller') => {
  const { user } = useAuth();
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUserAuctions = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      const auctionList = await getUserAuctions(user.uid, type);
      setAuctions(auctionList);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserAuctions();
    } else {
      setAuctions([]);
    }
  }, [user, type]);

  return {
    auctions,
    loading,
    error,
    refetch: fetchUserAuctions
  };
};

/**
 * 단일 경매 정보 관리 훅
 * @param {string} auctionId - 경매 ID
 */
export const useAuction = (auctionId) => {
  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAuction = async () => {
    if (!auctionId) return;
    
    try {
      setLoading(true);
      setError(null);
      const auctionData = await getAuction(auctionId);
      setAuction(auctionData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuction();
  }, [auctionId]);

  return {
    auction,
    loading,
    error,
    refetch: fetchAuction
  };
};

/**
 * 실시간 경매 입찰 관리 훅
 * @param {string} auctionId - 경매 ID
 */
export const useLiveAuction = (auctionId) => {
  const { user } = useAuth();
  const [liveData, setLiveData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bidding, setBidding] = useState(false);

  // 실시간 데이터 구독
  useEffect(() => {
    if (!auctionId) return;

    const unsubscribe = subscribeLiveAuction(auctionId, (data) => {
      setLiveData(data);
      setLoading(false);
    });

    setLoading(true);
    return unsubscribe;
  }, [auctionId]);

  // 입찰하기
  const bid = async (amount) => {
    if (!user) {
      throw new Error('로그인이 필요합니다.');
    }

    if (!liveData) {
      throw new Error('경매 정보를 불러올 수 없습니다.');
    }

    if (amount <= liveData.current_price) {
      throw new Error('입찰 금액이 현재 최고가보다 낮습니다.');
    }

    try {
      setBidding(true);
      setError(null);
      await placeBid(auctionId, user.uid, amount);
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setBidding(false);
    }
  };

  return {
    liveData,
    loading,
    error,
    bidding,
    bid,
    isActive: !!liveData,
    currentPrice: liveData?.current_price || 0,
    lastBidderId: liveData?.last_bidder_id || null,
    isMyBid: liveData?.last_bidder_id === user?.uid
  };
};

/**
 * 경매 생성 훅
 */
export const useCreateAuction = () => {
  const { user, userInfo } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const create = async (auctionData, imageFile) => {
    if (!user || !userInfo) {
      throw new Error('로그인이 필요합니다.');
    }

    if (userInfo.user_type !== 'seller') {
      throw new Error('판매자만 경매를 생성할 수 있습니다.');
    }

    if (!userInfo.seller_info?.is_verified) {
      throw new Error('인증된 판매자만 경매를 생성할 수 있습니다.');
    }

    try {
      setLoading(true);
      setError(null);
      
      const auctionDataWithSeller = {
        ...auctionData,
        seller_name: userInfo.displayName || user.displayName
      };
      
      const auctionId = await createAuction(auctionDataWithSeller, imageFile, user.uid);
      return auctionId;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    create,
    loading,
    error,
    canCreate: user && userInfo?.user_type === 'seller' && userInfo?.seller_info?.is_verified
  };
}; 
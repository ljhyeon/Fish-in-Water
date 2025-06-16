import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { createAuction } from '../services/auctionService';
import { saveUserToFirestore } from '../services/userService';

/**
 * 데모 경매 데이터 생성
 * 개발 환경에서 테스트용으로 사용
 */
export const createDemoAuctions = async () => {
  const demoAuctions = [
    {
      name: "제주도 특산 황돔",
      description: "제주도 특산 황돔입니다. 신선도가 뛰어나며, 크기는 1kg 내외입니다.",
      image_url: "/fish1.jpg",
      location: "제주도 서귀포시",
      species: "황돔",
      seller_id: "demo_seller_1",
      seller_name: "김판매",
      status: "ACTIVE",
      start_time: new Date(Date.now() - 1000 * 60 * 30), // 30분 전 시작
      end_time: new Date(Date.now() + 1000 * 60 * 30), // 30분 후 종료
      starting_price: 100000,
      final_price: null,
      winner_id: null,
      created_at: serverTimestamp()
    },
    {
      name: "부산 앞바다 참돔",
      description: "부산 앞바다에서 잡은 참돔입니다. 크기는 2kg 내외입니다.",
      image_url: "/fish2.jpg",
      location: "부산 해운대구",
      species: "참돔",
      seller_id: "demo_seller_2",
      seller_name: "이판매",
      status: "FINISHED",
      start_time: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2시간 전 시작
      end_time: new Date(Date.now() - 1000 * 60 * 30), // 30분 전 종료
      starting_price: 200000,
      final_price: 250000,
      winner_id: "demo_buyer_1",
      created_at: serverTimestamp()
    },
    {
      name: "강원도 동해 명태",
      description: "동해에서 잡은 명태입니다. 크기는 500g 내외입니다.",
      image_url: "/fish3.jpg",
      location: "강원도 동해시",
      species: "명태",
      seller_id: "demo_seller_1",
      seller_name: "김판매",
      status: "PENDING",
      start_time: new Date(Date.now() + 1000 * 60 * 60), // 1시간 후 시작
      end_time: new Date(Date.now() + 1000 * 60 * 60 * 2), // 2시간 후 종료
      starting_price: 50000,
      final_price: null,
      winner_id: null,
      created_at: serverTimestamp()
    },
    {
      name: "울산 고래고기",
      description: "울산 앞바다에서 잡은 고래고기입니다. 크기는 5kg 내외입니다.",
      image_url: "/fish4.jpg",
      location: "울산 남구",
      species: "고래고기",
      seller_id: "demo_seller_3",
      seller_name: "박판매",
      status: "FINISHED",
      start_time: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3시간 전 시작
      end_time: new Date(Date.now() - 1000 * 60 * 60), // 1시간 전 종료
      starting_price: 500000,
      final_price: null, // 유찰
      winner_id: null,
      created_at: serverTimestamp()
    },
    {
      name: "인천 새우",
      description: "인천 앞바다에서 잡은 새우입니다. 크기는 1kg 내외입니다.",
      image_url: "/fish5.jpg",
      location: "인천 중구",
      species: "새우",
      seller_id: "demo_seller_2",
      seller_name: "이판매",
      status: "ACTIVE",
      start_time: new Date(Date.now() - 1000 * 60 * 15), // 15분 전 시작
      end_time: new Date(Date.now() + 1000 * 60 * 45), // 45분 후 종료
      starting_price: 80000,
      final_price: null,
      winner_id: null,
      created_at: serverTimestamp()
    }
  ];

  try {
    const auctionsRef = collection(db, 'auctions');
    const createdAuctions = [];

    for (const auction of demoAuctions) {
      const docRef = await addDoc(auctionsRef, auction);
      createdAuctions.push({ id: docRef.id, ...auction });
      console.log('데모 경매 생성됨:', docRef.id, auction.name);
    }

    console.log(`총 ${createdAuctions.length}개의 데모 경매가 생성되었습니다.`);
    return createdAuctions;
  } catch (error) {
    console.error('데모 경매 생성 실패:', error);
    throw error;
  }
};

/**
 * 데모 사용자 데이터 생성
 */
export const createDemoUsers = async () => {
  const demoUsers = [
    {
      uid: "demo_seller_1",
      email: "seller1@demo.com",
      displayName: "김판매",
      photoURL: null,
      user_type: "seller",
      created_at: serverTimestamp(),
      terms_agreed: {
        privacy_policy: true,
        terms_of_service: true
      },
      seller_info: {
        is_verified: true,
        business_registration_number: "123-45-67890",
        document_url: "https://example.com/demo_doc1.pdf",
        verified_at: serverTimestamp()
      }
    },
    {
      uid: "demo_seller_2",
      email: "seller2@demo.com",
      displayName: "이판매",
      photoURL: null,
      user_type: "seller",
      created_at: serverTimestamp(),
      terms_agreed: {
        privacy_policy: true,
        terms_of_service: true
      },
      seller_info: {
        is_verified: true,
        business_registration_number: "234-56-78901",
        document_url: "https://example.com/demo_doc2.pdf",
        verified_at: serverTimestamp()
      }
    },
    {
      uid: "demo_seller_3",
      email: "seller3@demo.com",
      displayName: "박판매",
      photoURL: null,
      user_type: "seller",
      created_at: serverTimestamp(),
      terms_agreed: {
        privacy_policy: true,
        terms_of_service: true
      },
      seller_info: {
        is_verified: false,
        business_registration_number: "345-67-89012",
        document_url: "https://example.com/demo_doc3.pdf",
        verified_at: null
      }
    },
    {
      uid: "demo_buyer_1",
      email: "buyer1@demo.com",
      displayName: "김구매",
      photoURL: null,
      user_type: "consumer",
      created_at: serverTimestamp(),
      terms_agreed: {
        privacy_policy: true,
        terms_of_service: true
      }
    }
  ];

  try {
    const usersRef = collection(db, 'users');
    const createdUsers = [];

    for (const user of demoUsers) {
      const docRef = await addDoc(usersRef, user);
      createdUsers.push({ id: docRef.id, ...user });
      console.log('데모 사용자 생성됨:', docRef.id, user.displayName);
    }

    console.log(`총 ${createdUsers.length}개의 데모 사용자가 생성되었습니다.`);
    return createdUsers;
  } catch (error) {
    console.error('데모 사용자 생성 실패:', error);
    throw error;
  }
};

/**
 * 모든 데모 데이터 생성
 */
export const createAllDemoData = async () => {
  try {
    console.log('데모 데이터 생성 시작...');
    
    const users = await createDemoUsers();
    const auctions = await createDemoAuctions();

    console.log('데모 데이터 생성 완료!');
    console.log('- 사용자:', users.length, '명');
    console.log('- 경매:', auctions.length, '개');

    return { users, auctions };
  } catch (error) {
    console.error('데모 데이터 생성 중 오류 발생:', error);
    throw error;
  }
};

/**
 * 개발자 도구에서 사용할 수 있도록 window 객체에 등록
 */
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.createDemoData = createAllDemoData;
  window.createDemoAuctions = createDemoAuctions;
  window.createDemoUsers = createDemoUsers;
}

// 테스트용 수산물 데이터
const fishTypes = [
  {
    name: '광어',
    description: '신선한 자연산 광어입니다. 회로 드시기에 최적입니다.',
    location: '부산 기장',
    image_url: '/fish1.jpg'
  },
  {
    name: '우럭',
    description: '활어 상태의 싱싱한 우럭입니다. 매운탕용으로 좋습니다.',
    location: '통영',
    image_url: '/fish2.jpg'
  },
  {
    name: '농어',
    description: '자연산 농어로 육질이 단단하고 맛이 좋습니다.',
    location: '여수',
    image_url: '/fish3.jpg'
  },
  {
    name: '도미',
    description: '붉은 도미로 축하 요리에 많이 사용됩니다.',
    location: '제주',
    image_url: '/fish1.jpg'
  },
  {
    name: '갈치',
    description: '은빛 갈치로 구이나 조림용으로 인기가 높습니다.',
    location: '목포',
    image_url: '/fish2.jpg'
  },
  {
    name: '고등어',
    description: '기름기가 풍부한 고등어입니다. 구이용으로 최적입니다.',
    location: '포항',
    image_url: '/fish3.jpg'
  }
];

// 테스트용 사용자 데이터 생성
export const createTestUsers = async () => {
  const testUsers = [
    {
      uid: 'test-seller-1',
      email: 'seller1@test.com',
      displayName: '판매자1',
      user_type: 'seller',
      seller_info: {
        is_verified: true,
        business_number: '123-45-67890',
        verification_date: new Date()
      }
    },
    {
      uid: 'test-seller-2', 
      email: 'seller2@test.com',
      displayName: '판매자2',
      user_type: 'seller',
      seller_info: {
        is_verified: true,
        business_number: '098-76-54321',
        verification_date: new Date()
      }
    },
    {
      uid: 'test-consumer-1',
      email: 'consumer1@test.com', 
      displayName: '구매자1',
      user_type: 'consumer'
    },
    {
      uid: 'test-consumer-2',
      email: 'consumer2@test.com',
      displayName: '구매자2', 
      user_type: 'consumer'
    }
  ];

  const results = [];
  for (const user of testUsers) {
    try {
      await saveUserToFirestore(user);
      results.push({ success: true, user: user.displayName });
    } catch (error) {
      results.push({ success: false, user: user.displayName, error: error.message });
    }
  }
  
  return results;
};

// 테스트용 경매 데이터 생성
export const createTestAuctions = async () => {
  const sellers = ['rG8ud4hCG0NsKi0wbsFCIV8imoK2'];
  const results = [];

  for (let i = 0; i < fishTypes.length; i++) {
    const fish = fishTypes[i];
    const sellerId = sellers[i % sellers.length];
    
    // 다양한 상태의 경매 생성
    const statuses = ['PENDING', 'ACTIVE', 'FINISHED'];
    const status = statuses[i % statuses.length];
    
    const auctionData = {
      name: fish.name,
      description: fish.description,
      location: fish.location,
      image_url: fish.image_url,
      species: fish.name,
      starting_price: Math.floor(Math.random() * 50000) + 10000, // 10,000 ~ 60,000
      quantity: Math.floor(Math.random() * 10) + 1, // 1 ~ 10kg
      unit: 'kg',
      category: '활어',
      seller_id: sellerId,
      seller_name: '테스트 판매자',
      status: status,
      start_time: new Date(Date.now() + Math.random() * 86400000), // 24시간 내 랜덤
      end_time: new Date(Date.now() + 86400000 + Math.random() * 86400000) // 1-2일 후
    };

    // FINISHED 상태인 경우 낙찰 정보 추가
    if (status === 'FINISHED') {
      auctionData.final_price = auctionData.starting_price + Math.floor(Math.random() * 20000);
      auctionData.winner_id = Math.random() > 0.3 ? 'test-consumer-1' : null; // 70% 확률로 낙찰
    }

    try {
      const auctionId = await createAuction(auctionData);
      results.push({ 
        success: true, 
        auction: fish.name, 
        id: auctionId,
        status: status,
        seller: sellerId 
      });
    } catch (error) {
      results.push({ 
        success: false, 
        auction: fish.name, 
        error: error.message 
      });
    }
  }

  return results;
};

// 모든 테스트 데이터 생성
export const createAllTestData = async () => {
  console.log('테스트 사용자 생성 중...');
  const userResults = await createTestUsers();
  
  console.log('테스트 경매 생성 중...');
  const auctionResults = await createTestAuctions();
  
  return {
    users: userResults,
    auctions: auctionResults
  };
};

// 단일 데모 경매 생성 (기존 호환성 유지)
export const createDemoAuction = async (sellerId) => {
  const randomFish = fishTypes[Math.floor(Math.random() * fishTypes.length)];
  
  const auctionData = {
    name: randomFish.name,
    description: randomFish.description,
    location: randomFish.location,
    image_url: randomFish.image_url,
    species: randomFish.name,
    starting_price: Math.floor(Math.random() * 50000) + 10000,
    quantity: Math.floor(Math.random() * 10) + 1,
    unit: 'kg',
    category: '활어',
    seller_id: sellerId,
    seller_name: '데모 판매자',
    status: 'PENDING',
    start_time: new Date(Date.now() + 3600000), // 1시간 후
    end_time: new Date(Date.now() + 86400000) // 24시간 후
  };

  return await createAuction(auctionData);
};

// 단일 데모 사용자 생성 (기존 호환성 유지)
export const createDemoUser = async (uid, userType = 'consumer') => {
  const userData = {
    uid,
    email: `${uid}@demo.com`,
    displayName: `데모 ${userType === 'seller' ? '판매자' : '구매자'}`,
    user_type: userType
  };

  if (userType === 'seller') {
    userData.seller_info = {
      is_verified: true,
      business_number: '123-45-67890',
      verification_date: new Date()
    };
  }

  return await saveUserToFirestore(userData);
}; 
export const testItems = [
    {
        id: 1,
        name: "제주도 특산 황돔",
        image: "/fish1.jpg",
        origin: "제주도 서귀포시",
        description: "제주도 특산 황돔입니다. 신선도가 뛰어나며, 크기는 1kg 내외입니다.",
        startPrice: 100000,
        currentPrice: 150000,
        finalPrice: null,
        status: {
            consumer: "진행중",
            supplier: "진행중"
        }
    },
    {
        id: 2,
        name: "부산 앞바다 참돔",
        image: "/fish2.jpg",
        origin: "부산 해운대구",
        description: "부산 앞바다에서 잡은 참돔입니다. 크기는 2kg 내외입니다.",
        startPrice: 200000,
        currentPrice: null,
        finalPrice: 250000,
        status: {
            consumer: "낙찰/결제대기중",
            supplier: "정산대기중"
        }
    },
    {
        id: 3,
        name: "강원도 동해 명태",
        image: "/fish3.jpg",
        origin: "강원도 동해시",
        description: "동해에서 잡은 명태입니다. 크기는 500g 내외입니다.",
        startPrice: 50000,
        currentPrice: null,
        finalPrice: 75000,
        status: {
            consumer: "낙찰/결제완료",
            supplier: "완료"
        }
    },
    {
        id: 4,
        name: "울산 고래고기",
        image: "/fish4.jpg",
        origin: "울산 남구",
        description: "울산 앞바다에서 잡은 고래고기입니다. 크기는 5kg 내외입니다.",
        startPrice: 500000,
        currentPrice: null,
        finalPrice: null,
        status: {
            consumer: "유찰",
            supplier: "완료"
        }
    },
    {
        id: 5,
        name: "인천 새우",
        image: "/fish5.jpg",
        origin: "인천 중구",
        description: "인천 앞바다에서 잡은 새우입니다. 크기는 1kg 내외입니다.",
        startPrice: 80000,
        currentPrice: 100000,
        finalPrice: null,
        status: {
            consumer: "진행중",
            supplier: "진행중"
        }
    }
];
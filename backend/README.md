# Fish-in-Water Firebase Functions

경매 시스템을 위한 Firebase Functions 백엔드입니다.

## 🏗️ 구조

```
backend/
├── functions/
│   ├── src/
│   │   ├── config/
│   │   │   └── firebase.js          # Firebase Admin SDK 설정
│   │   ├── constants/
│   │   │   └── auctionStatus.js     # 상태 상수 및 매핑 함수
│   │   └── services/
│   │       └── auctionService.js    # 경매 비즈니스 로직
│   ├── index.js                     # Functions 진입점
│   └── package.json
├── firebase.json                    # Firebase 프로젝트 설정
├── .firebaserc                      # Firebase 프로젝트 ID
└── README.md
```

## 🚀 배포 방법

### 1. Firebase CLI 설치 및 설정

```bash
# Firebase CLI 전역 설치
npm install -g firebase-tools

# Firebase 로그인
firebase login

# 프로젝트 초기화 (기존 프로젝트가 있다면 생략)
firebase init
```

### 2. 프로젝트 설정

```bash
# 프로젝트 ID 설정
firebase use your-firebase-project-id

# 또는 .firebaserc 파일에서 직접 수정
```

### 3. Functions 의존성 설치

```bash
cd functions
npm install
```

### 4. 로컬 테스트 (선택사항)

```bash
# 로컬 에뮬레이터 실행
firebase emulators:start --only functions

# 특정 포트로 실행
firebase emulators:start --only functions --port 5001
```

### 5. 배포

```bash
# Functions만 배포
firebase deploy --only functions

# 전체 프로젝트 배포 (hosting 포함)
firebase deploy

# 특정 함수만 배포
firebase deploy --only functions:api
firebase deploy --only functions:updateAuctionStatus
```

## 📋 배포된 Functions

### HTTP Functions
- **api**: REST API 엔드포인트
  - URL: `https://us-central1-{project-id}.cloudfunctions.net/api`
  - Routes:
    - `GET /auctions` - 경매 목록 조회
    - `GET /auctions/:id` - 특정 경매 조회
    - `POST /auctions/update-status` - 수동 상태 업데이트
    - `PUT /auctions/:id/status` - 특정 경매 상태 업데이트

### Scheduled Functions
- **updateAuctionStatus**: 1분마다 자동 실행
  - 경매 시작/종료 상태 자동 업데이트
  - 크론 표현식: `every 1 minutes`
  - 시간대: `Asia/Seoul`

### Trigger Functions
- **onAuctionCreated**: 새 경매 생성 시 트리거
- **onAuctionStatusChanged**: 경매 상태 변경 시 트리거

## 🛠️ 프론트엔드 연동

### 1. backendService.js 설정

```javascript
// 프로젝트 ID 업데이트
const FUNCTIONS_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://127.0.0.1:5001/your-actual-project-id/us-central1/api'
  : 'https://us-central1-your-actual-project-id.cloudfunctions.net/api';
```

### 2. Firebase 설정 업데이트

`frontend/my-app/src/firebase.js`에서 Functions 설정 추가:

```javascript
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

export const functions = getFunctions(app);

// 개발 환경에서 에뮬레이터 연결
if (process.env.NODE_ENV === 'development') {
  connectFunctionsEmulator(functions, 'localhost', 5001);
}
```

## 🔧 환경 변수 설정

Firebase Functions는 자동으로 Firebase Admin SDK를 초기화하므로 별도의 환경 변수 설정이 불필요합니다.

필요시 Firebase Functions 환경 변수 설정:

```bash
# 환경 변수 설정
firebase functions:config:set someservice.key="THE API KEY"

# 환경 변수 확인
firebase functions:config:get
```

## 📊 모니터링 및 로그

```bash
# 실시간 로그 확인
firebase functions:log

# 특정 함수 로그만 확인
firebase functions:log --only updateAuctionStatus

# Firebase Console에서 모니터링
# https://console.firebase.google.com → Functions 섹션
```

## 🔄 상태 관리 시스템

### 기본 상태
- `PENDING`: 진행 예정
- `ACTIVE`: 진행중
- `FINISHED`: 낙찰 완료
- `NO_BID`: 유찰

### Consumer/Supplier 상태 매핑
- **Consumer**: 진행 예정 → 진행중 → 낙찰/결제 대기중 → 낙찰/결제완료
- **Supplier**: 진행 예정 → 진행중 → 정산 대기중 → 완료

### 자동 스케줄러
- **매분 실행**: `updateAuctionStatus` 함수
- **기능**: 
  - `auction_start_time` 도달 시 `PENDING` → `ACTIVE`
  - `auction_end_time` 도달 시 `ACTIVE` → `FINISHED`/`NO_BID`

## 🚨 주의사항

1. **비용 관리**: Functions 호출 횟수에 따라 비용 발생
2. **시간대**: 스케줄러는 `Asia/Seoul` 시간대로 설정됨
3. **권한**: Firestore 보안 규칙 확인 필요
4. **로그**: 프로덕션에서는 과도한 로깅 자제

## 🔍 트러블슈팅

### 배포 실패 시
```bash
# Node.js 버전 확인 (18 권장)
node --version

# Firebase CLI 업데이트
npm install -g firebase-tools@latest

# 캐시 정리
firebase logout && firebase login
```

### Functions 호출 실패 시
```bash
# CORS 에러: Firebase Hosting 사용 권장
# 직접 Functions URL 호출 시 CORS 설정 필요

# 권한 에러: IAM 권한 확인
# Firebase Console → IAM 및 관리자
```

## 📝 업데이트 방법

1. 코드 수정
2. `firebase deploy --only functions` 실행
3. 배포 확인: Firebase Console → Functions
4. 프론트엔드에서 새 API 엔드포인트 테스트

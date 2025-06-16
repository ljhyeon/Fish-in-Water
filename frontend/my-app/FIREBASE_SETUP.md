# 🔥 Firebase 설정 가이드

이 문서는 Fish-in-Water 프로젝트의 Firebase 설정 방법을 안내합니다.

## 📋 필수 Firebase 서비스

- **Firebase Authentication** (Google SSO)
- **Cloud Firestore** (사용자 정보, 경매 데이터)
- **Realtime Database** (실시간 입찰)
- **Firebase Storage** (이미지, 파일 업로드)

## 🚀 설정 단계

### 1. Firebase 프로젝트 생성

1. [Firebase Console](https://console.firebase.google.com/)에 접속
2. "프로젝트 추가" 클릭
3. 프로젝트 이름 입력 (예: `fish-in-water`)
4. Google Analytics 설정 (선택사항)

### 2. 웹 앱 등록

1. Firebase 프로젝트 페이지에서 "웹" 아이콘 클릭
2. 앱 닉네임 입력 (예: `fish-in-water-web`)
3. Firebase Hosting 설정 체크 (PWA 배포를 위해 권장)
4. 설정 정보 복사해두기

### 3. Authentication 설정

1. 좌측 메뉴 > Authentication > 시작하기
2. Sign-in method 탭 > Google 활성화
3. 프로젝트 공개용 이름과 이메일 설정
4. 승인된 도메인에 로컬호스트 및 배포 도메인 추가

### 4. Firestore Database 설정

1. 좌측 메뉴 > Firestore Database > 데이터베이스 만들기
2. 보안 규칙: 테스트 모드로 시작 (나중에 프로덕션 규칙으로 변경)
3. 위치: `asia-northeast1` (서울) 또는 `asia-southeast1` (싱가포르) 권장

### 5. Realtime Database 설정

1. 좌측 메뉴 > Realtime Database > 데이터베이스 만들기
2. 위치: Firestore와 같은 지역 선택
3. 보안 규칙: 테스트 모드로 시작

### 6. Storage 설정

1. 좌측 메뉴 > Storage > 시작하기
2. 보안 규칙: 테스트 모드로 시작
3. 위치: 다른 서비스와 같은 지역 선택

### 7. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 Firebase 설정 정보를 입력하세요:

```env
# Firebase 설정 - Firebase Console > 프로젝트 설정 > 일반에서 확인
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Realtime Database URL - Firebase Console > Realtime Database에서 확인
VITE_FIREBASE_DATABASE_URL=https://your_project_id-default-rtdb.asia-southeast1.firebasedatabase.app/
```

## 🗄️ 데이터베이스 구조

### Firestore 컬렉션

#### `users` 컬렉션
```javascript
{
  uid: "user_uid", // 문서 ID와 동일
  email: "user@example.com",
  displayName: "사용자명",
  photoURL: "profile_image_url",
  user_type: "consumer" | "seller",
  created_at: timestamp,
  terms_agreed: {
    privacy_policy: true,
    terms_of_service: true
  },
  // 판매자인 경우에만 존재
  seller_info: {
    is_verified: false,
    business_registration_number: "123-45-67890",
    document_url: "storage_path",
    verified_at: timestamp | null
  }
}
```

#### `auctions` 컬렉션
```javascript
{
  name: "상품명",
  description: "상품 설명",
  image_url: "storage_path",
  location: "지역",
  species: "어종",
  seller_id: "user_uid",
  seller_name: "판매자명",
  status: "PENDING" | "ACTIVE" | "FINISHED",
  start_time: timestamp,
  end_time: timestamp,
  starting_price: number,
  final_price: number | null,
  winner_id: "user_uid" | null,
  created_at: timestamp
}
```

### Realtime Database 구조

#### `/live_auctions/{auction_id}`
```javascript
{
  current_price: number,
  last_bidder_id: "user_uid" | "none",
  last_bid_timestamp: timestamp
}
```

## 🧪 데모 데이터 생성

개발 환경에서 테스트용 데이터를 생성하려면:

1. 개발 서버 실행: `npm run dev`
2. 브라우저 개발자 도구 콘솔에서 실행:
   ```javascript
   // 모든 데모 데이터 생성
   await window.createDemoData();
   
   // 또는 개별 생성
   await window.createDemoUsers();
   await window.createDemoAuctions();
   ```

## 🔒 보안 규칙 설정

### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users 컬렉션: 본인 데이터만 읽기/쓰기 가능
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Auctions 컬렉션: 모든 사용자 읽기 가능, 판매자만 생성 가능
    match /auctions/{auctionId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.user_type == 'seller';
      allow update: if request.auth != null && 
        resource.data.seller_id == request.auth.uid;
    }
  }
}
```

### Realtime Database Rules
```json
{
  "rules": {
    "live_auctions": {
      "$auctionId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    }
  }
}
```

### Storage Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // 사용자별 프로필 이미지
    match /profile_images/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // 경매 상품 이미지
    match /auction_images/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // 판매자 서류
    match /seller_docs/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 🔧 문제 해결

### 일반적인 오류

1. **FIREBASE_CONFIG 오류**
   - `.env` 파일이 올바른 위치에 있는지 확인
   - 환경 변수 이름이 `VITE_`로 시작하는지 확인

2. **Realtime Database 연결 오류**
   - `databaseURL`이 올바른지 확인
   - 지역별 URL 형식 확인

3. **인증 오류**
   - Google OAuth 설정 확인
   - 승인된 도메인에 현재 도메인이 포함되어 있는지 확인

### 개발 환경 설정

```bash
# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env
# .env 파일 편집

# 개발 서버 실행
npm run dev
```

## 📱 PWA 배포

```bash
# 빌드
npm run build

# Firebase Hosting에 배포
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

## 📞 지원

설정 중 문제가 발생하면 다음을 확인해주세요:

1. Firebase Console에서 서비스가 활성화되어 있는지
2. 보안 규칙이 올바르게 설정되어 있는지
3. 환경 변수가 올바르게 설정되어 있는지

추가 도움이 필요하면 개발팀에 문의해주세요. 
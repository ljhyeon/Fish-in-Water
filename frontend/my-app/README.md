
# [Frontend] Fish in Water 
## ▶️ 실행 방법
```bash
# pnpm 설치 (최초 1회)
npm install -g pnpm

# 프로젝트 디렉토리 이동
cd frontend/my-app

# 패키지 설치
pnpm install

# 개발 서버 실행
pnpm dev

# 프로젝트 빌드
pnpm build
```

## 📦 기술 스택
- **React** (with Vite) – 빠른 프론트엔드 빌드 도구
- **JavaScript** – 주요 개발 언어
- **MUI** – UI 구성요소 라이브러리 (Material UI)
- **Zustand** – 전역 상태 관리 라이브러리
- **PNPM** – 빠르고 효율적인 패키지 매니저

## 📁 디렉토리 구조
```bash
frontend/my-app/
├── api/            # 백엔드 API와의 통신 모듈
├── components/     # 재사용 가능한 UI 및 레이아웃 컴포넌트
├── pages/          # 라우팅되는 페이지 컴포넌트
├── store/          # Zustand 상태 관리 모듈
├── App.jsx         # 애플리케이션 루트
├── main.jsx        # 진입점
└── ...
```


---------

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR, PWA capabilities, and Firebase integration.

## 🚀 기능

- ⚡ **Vite**: 빠른 개발 서버와 빌드
- ⚛️ **React 19**: 최신 React 기능
- 📱 **PWA**: Progressive Web App 지원
- 🔥 **Firebase**: 백엔드 서비스 통합
- 🔔 **FCM**: Firebase Cloud Messaging 푸시 알림
- 🎨 **Material-UI**: 모던한 UI 컴포넌트
- 🗂️ **Zustand**: 상태 관리

## 📦 설치 및 실행

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm run dev

# 프로덕션 빌드
pnpm run build

# 프로덕션 프리뷰
pnpm run preview
```

## ⚙️ Firebase 설정

1. [Firebase Console](https://console.firebase.google.com/)에서 새 프로젝트 생성
2. 웹 앱 추가 및 설정 정보 복사
3. `env.example` 파일을 `.env`로 복사하고 Firebase 설정 정보 입력:

```bash
cp env.example .env
```

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
VITE_FIREBASE_VAPID_KEY=your-vapid-key
```

4. Firebase Console에서 Authentication 설정:
   - Authentication > Sign-in method 탭으로 이동
   - Google 제공업체를 선택하고 **활성화**
   - 프로젝트 지원 이메일 설정 후 저장

5. Firebase Console에서 Cloud Messaging 설정:
   - 프로젝트 설정 > Cloud Messaging
   - 웹 푸시 인증서 키(VAPID) 생성
   - 생성된 키를 `VITE_FIREBASE_VAPID_KEY`에 입력

## 📱 PWA 기능

- **앱 설치**: 브라우저에서 홈 화면에 앱 추가 가능
- **오프라인 지원**: Service Worker를 통한 캐싱
- **푸시 알림**: Firebase Cloud Messaging 연동
- **반응형 디자인**: 모바일 최적화

### PWA 아이콘 추가

다음 아이콘들을 `public/` 폴더에 추가해야 합니다:
- `pwa-192x192.png` (192x192px)
- `pwa-512x512.png` (512x512px)
- `favicon.ico`
- `apple-touch-icon.png` (선택사항)

## 🔧 사용법

### PWA 훅 사용

```jsx
import { usePWA } from './hooks/usePWA';

function MyComponent() {
  const { isInstallable, installPWA, fcmToken } = usePWA();
  
  return (
    <div>
      {isInstallable && (
        <button onClick={installPWA}>
          앱 설치하기
        </button>
      )}
    </div>
  );
}
```

### Firebase 서비스 사용

```jsx
import { auth, db, storage } from './firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';

// 인증
await signInWithEmailAndPassword(auth, email, password);

// Firestore
await addDoc(collection(db, 'users'), userData);
```

### 구글 로그인 사용

```jsx
import { useAuth } from './hooks/useAuth';

function LoginComponent() {
  const { signInWithGoogle, signOut, user, isAuthenticated } = useAuth();
  
  const handleLogin = async () => {
    const result = await signInWithGoogle();
    if (result.success) {
      console.log('로그인 성공!', result.user);
    }
  };
  
  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>환영합니다, {user.displayName}님!</p>
          <button onClick={signOut}>로그아웃</button>
        </div>
      ) : (
        <button onClick={handleLogin}>Google로 로그인</button>
      )}
    </div>
  );
}
```

## 📋 개발 플러그인

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## 🛠️ 추가 설정

### ESLint 확장

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

### PWA 매니페스트 커스터마이징

`vite.config.js`에서 PWA 설정을 수정할 수 있습니다:

```js
VitePWA({
  manifest: {
    name: '앱 이름',
    short_name: '짧은 이름',
    theme_color: '#000000',
    // ... 기타 설정
  }
})
```

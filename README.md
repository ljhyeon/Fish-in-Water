# Fish-in-Water

## Frontend

### ▶️ 실행 방법
```bash
# pnpm 설치 (최초 1회)
npm install -g pnpm

# 프로젝트 디렉토리 이동 (주의 ‼️)
cd frontend/my-app

# 패키지 설치
pnpm install

# 개발 서버 실행
pnpm dev

# 프로젝트 빌드
pnpm build
```

### 📦 기술 스택
- **React** (with Vite) – 빠른 프론트엔드 빌드 도구
- **JavaScript** – 주요 개발 언어
- **MUI** – UI 구성요소 라이브러리 (Material UI)
- **Zustand** – 전역 상태 관리 라이브러리
- **PNPM** – 빠르고 효율적인 패키지 매니저

### 📁 디렉토리 구조
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
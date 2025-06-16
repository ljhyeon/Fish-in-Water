#!/bin/bash

# Fish-in-Water Firebase Functions 배포 스크립트

echo "🚀 Firebase Functions 배포를 시작합니다..."

# 현재 디렉토리 확인
if [[ ! -f "firebase.json" ]]; then
    echo "❌ firebase.json 파일을 찾을 수 없습니다. backend 폴더에서 실행해주세요."
    exit 1
fi

# Firebase CLI 설치 확인
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI가 설치되지 않았습니다."
    echo "다음 명령어로 설치해주세요: npm install -g firebase-tools"
    exit 1
fi

# Firebase 로그인 확인
if ! firebase projects:list &> /dev/null; then
    echo "❌ Firebase에 로그인되지 않았습니다."
    echo "다음 명령어로 로그인해주세요: firebase login"
    exit 1
fi

# Functions 의존성 설치
echo "📦 Functions 의존성을 설치합니다..."
cd functions
npm install
cd ..

# 프로젝트 확인
echo "📋 현재 Firebase 프로젝트:"
firebase use

read -p "이 프로젝트로 배포하시겠습니까? (y/N): " confirm
if [[ ! $confirm =~ ^[Yy]$ ]]; then
    echo "❌ 배포가 취소되었습니다."
    exit 1
fi

# 배포 옵션 선택
echo ""
echo "배포 옵션을 선택하세요:"
echo "1) Functions만 배포"
echo "2) Functions + Firestore 규칙"
echo "3) 전체 배포 (Functions + Firestore + Hosting)"

read -p "선택 (1-3): " option

case $option in
    1)
        echo "📤 Functions만 배포합니다..."
        firebase deploy --only functions
        ;;
    2)
        echo "📤 Functions와 Firestore 규칙을 배포합니다..."
        firebase deploy --only functions,firestore
        ;;
    3)
        echo "📤 전체를 배포합니다..."
        firebase deploy
        ;;
    *)
        echo "❌ 잘못된 선택입니다."
        exit 1
        ;;
esac

# 배포 결과 확인
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 배포가 완료되었습니다!"
    echo ""
    echo "📋 배포된 Functions:"
    echo "- API: https://us-central1-$(firebase use | grep -o 'your-project-id').cloudfunctions.net/api"
    echo "- 스케줄러: updateAuctionStatus (매분 자동 실행)"
    echo ""
    echo "🔗 Firebase Console에서 확인:"
    echo "https://console.firebase.google.com/project/$(firebase use)/functions"
    echo ""
    echo "📊 로그 확인 명령어:"
    echo "firebase functions:log"
else
    echo ""
    echo "❌ 배포 중 오류가 발생했습니다."
    echo "로그를 확인하여 문제를 해결해주세요."
    exit 1
fi 
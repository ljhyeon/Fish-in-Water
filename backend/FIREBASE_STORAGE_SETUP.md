# Firebase Storage 설정 가이드

## 1. Firebase Console에서 Storage 활성화

1. [Firebase Console](https://console.firebase.google.com/)에 접속
2. 프로젝트 선택
3. 왼쪽 메뉴에서 "Storage" 클릭
4. "시작하기" 버튼 클릭
5. 보안 규칙 설정 (프로덕션 모드 선택 권장)
6. Cloud Storage 위치 선택 (asia-northeast3 - 서울 권장)

## 2. 보안 규칙 설정

Firebase Console의 Storage > Rules 탭에서 다음 규칙을 설정:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // 경매 이미지 업로드 규칙
    match /auction_images/{sellerId}/{filename} {
      // 인증된 사용자만 읽기 가능
      allow read: if request.auth != null;
      
      // 본인의 폴더에만 업로드 가능
      allow write: if request.auth != null 
                   && request.auth.uid == sellerId
                   && resource == null  // 새 파일만 업로드 가능
                   && request.resource.size < 5 * 1024 * 1024  // 5MB 제한
                   && request.resource.contentType.matches('image/.*');  // 이미지 파일만
    }
    
    // 파일 삭제 규칙
    match /auction_images/{sellerId}/{filename} {
      allow delete: if request.auth != null 
                    && request.auth.uid == sellerId;
    }
    
    // 공개 이미지 (기본 이미지 등)
    match /public/{filename} {
      allow read: if true;  // 모든 사용자가 읽기 가능
      allow write: if false;  // 업로드 불가
    }
  }
}
```

## 3. 이미지 업로드 기능

### 지원하는 이미지 형식
- JPEG (.jpg, .jpeg)
- PNG (.png)
- WebP (.webp)

### 제한사항
- 최대 파일 크기: 5MB
- 인증된 사용자만 업로드 가능
- 판매자는 본인 폴더에만 업로드 가능

### 업로드 경로 구조
```
auction_images/
  ├── {seller_id_1}/
  │   ├── {timestamp_1}.jpg
  │   └── {timestamp_2}.png
  └── {seller_id_2}/
      └── {timestamp_3}.webp
``` 
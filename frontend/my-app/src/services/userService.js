import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';

/**
 * 사용자 정보를 Firestore에 저장/업데이트
 * @param {Object} user - Firebase Auth 사용자 객체
 * @param {string} userType - 'consumer' 또는 'seller'
 * @param {boolean} isNewUser - 신규 사용자 여부
 */
export const saveUserToFirestore = async (user, userType, isNewUser = false) => {
  try {
    const userRef = doc(db, 'users', user.uid);
    
    if (isNewUser) {
      // 신규 사용자 생성
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || '익명 사용자',
        photoURL: user.photoURL || null,
        user_type: userType,
        created_at: serverTimestamp(),
        terms_agreed: {
          privacy_policy: true,
          terms_of_service: true
        }
      };

      // 판매자일 경우 seller_info 객체 추가
      if (userType === 'seller') {
        userData.seller_info = {
          is_verified: false,
          business_registration_number: null,
          document_url: null,
          verified_at: null
        };
      }

      await setDoc(userRef, userData);
      console.log('신규 사용자 정보 저장 완료:', userData);
      return userData;
    } else {
      // 기존 사용자 정보 업데이트
      await updateDoc(userRef, {
        displayName: user.displayName || '익명 사용자',
        photoURL: user.photoURL || null,
        last_login_at: serverTimestamp()
      });
      
      const userDoc = await getDoc(userRef);
      return userDoc.data();
    }
  } catch (error) {
    console.error('사용자 정보 저장 실패:', error);
    throw new Error('사용자 정보 저장에 실패했습니다.');
  }
};

/**
 * Firestore에서 사용자 정보 조회
 * @param {string} uid - 사용자 UID
 * @returns {Object|null} 사용자 정보 또는 null
 */
export const getUserFromFirestore = async (uid) => {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data();
    } else {
      return null;
    }
  } catch (error) {
    console.error('사용자 정보 조회 실패:', error);
    throw new Error('사용자 정보 조회에 실패했습니다.');
  }
};

/**
 * 판매자 인증 서류 업로드
 * @param {string} uid - 사용자 UID
 * @param {File} file - 업로드할 파일
 * @param {string} businessNumber - 사업자 등록번호
 */
export const uploadSellerDocument = async (uid, file, businessNumber) => {
  try {
    // Firebase Storage에 파일 업로드
    const fileName = `seller_docs/${uid}_${Date.now()}.${file.name.split('.').pop()}`;
    const storageRef = ref(storage, fileName);
    
    const uploadResult = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(uploadResult.ref);
    
    // Firestore에 업로드 정보 저장
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      'seller_info.business_registration_number': businessNumber,
      'seller_info.document_url': downloadURL,
      'seller_info.submitted_at': serverTimestamp()
    });
    
    console.log('판매자 서류 업로드 완료:', downloadURL);
    return downloadURL;
  } catch (error) {
    console.error('판매자 서류 업로드 실패:', error);
    throw new Error('서류 업로드에 실패했습니다.');
  }
};

/**
 * 판매자 인증 상태 업데이트 (관리자용)
 * @param {string} uid - 사용자 UID
 * @param {boolean} isVerified - 인증 여부
 */
export const updateSellerVerification = async (uid, isVerified) => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      'seller_info.is_verified': isVerified,
      'seller_info.verified_at': isVerified ? serverTimestamp() : null
    });
    
    console.log('판매자 인증 상태 업데이트 완료:', { uid, isVerified });
  } catch (error) {
    console.error('판매자 인증 상태 업데이트 실패:', error);
    throw new Error('인증 상태 업데이트에 실패했습니다.');
  }
}; 
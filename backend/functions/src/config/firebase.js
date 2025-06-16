const admin = require('firebase-admin');

// Firebase Functions 환경에서는 자동으로 초기화됨
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const rtdb = admin.database();

module.exports = {
  admin,
  db,
  rtdb
}; 
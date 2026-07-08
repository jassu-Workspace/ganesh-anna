// config/firebase.js
// Verifies Firebase Auth ID tokens issued by the React frontend.

const fs = require('fs');
const admin = require('firebase-admin');

if (!admin.apps.length) {
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './config/firebase-service-account.json';

  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } else {
    console.warn('Firebase Admin not initialized: service account file not found.');
  }
}

module.exports = admin.apps.length ? admin : null;

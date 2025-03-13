import admin from "firebase-admin";

const serviceAccount = JSON.parse(
  process.env.NEXT_PUBLIC_FIREBASE_ADMIN_SDK_KEY as string
);

console.log("🔥 serviceAccount:", serviceAccount);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const adminAuth = admin.auth();
export const adminDB = admin.firestore();

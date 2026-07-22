// export const firebaseConfig = {
//     apiKey: "AIzaSyBOTGtmbbhAA4rpHKgyvmppDdsW-pe8uxs",
//     authDomain: "t1classes.firebaseapp.com",
//     projectId: "t1classes",
//     storageBucket: "t1classes.firebasestorage.app",
//     messagingSenderId: "705526678146",
//     appId: "1:705526678146:web:9637a8a27a8f6ca7c0aa9b",
// };
export const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_APP_ID,
};

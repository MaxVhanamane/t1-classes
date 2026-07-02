import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, isSupported } from "firebase/messaging";
import { firebaseConfig } from "./firebase-config";


export const app =
    getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export async function getFirebaseMessaging() {
    if (!(await isSupported())) {
        return null;
    }

    return getMessaging(app);
}

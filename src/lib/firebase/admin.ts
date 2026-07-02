import "server-only"
import {
    App,
    cert,
    getApp,
    getApps,
    initializeApp,
} from "firebase-admin/app";

import { getMessaging } from "firebase-admin/messaging";

let app: App;

if (getApps().length) {
    app = getApp();
} else {
    app = initializeApp({
        credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID!,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
            privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(
                /\\n/g,
                "\n"
            ),
        }),
    });
}

export const firebaseAdminApp = app;

export const firebaseMessaging = getMessaging(app);

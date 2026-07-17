import "server-only";
import { RtcTokenBuilder, RtcRole } from 'agora-token';

export function generateAgoraToken(channelName: string, uid: string | number, isModerator: boolean) {
    const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID!;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE!;

    // 1 hour buffer = 3600 seconds (calculated from "now" as per documentation)
    const expirationTimeInSeconds = 3600;

    const role = isModerator ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;

    const token = RtcTokenBuilder.buildTokenWithUid(
        appId,
        appCertificate,
        channelName,
        uid,
        role,
        expirationTimeInSeconds, // tokenExpire: seconds elapsed since now
        expirationTimeInSeconds  // privilegeExpire: seconds elapsed since now
    );

    return token;
}

import "server-only"
import jwt from "jsonwebtoken";

export function generateVideoSdkToken() {
    const apiKey =
        process.env
            .VIDEOSDK_API_KEY!;

    const secretKey =
        process.env
            .VIDEOSDK_SECRET_KEY!;

    const payload = {
        apikey: apiKey,

        permissions: [
            "allow_join",
            "allow_mod",
        ],

        version: 2,
    };

    return jwt.sign(
        payload,
        secretKey,
        {
            algorithm: "HS256",

            expiresIn: "4h",
        },
    );
}

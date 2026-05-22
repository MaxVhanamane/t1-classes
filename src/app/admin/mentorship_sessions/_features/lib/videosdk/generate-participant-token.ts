import jwt from "jsonwebtoken";

interface GenerateParticipantTokenParams {
    isModerator: boolean;
}

export function generateParticipantToken({
    isModerator,
}: GenerateParticipantTokenParams) {
    const apiKey =
        process.env
            .VIDEOSDK_API_KEY!;

    const secretKey =
        process.env
            .VIDEOSDK_SECRET_KEY!;

    const permissions =
        isModerator
            ? [
                "allow_join",
                "allow_mod",
            ]
            : ["allow_join"];

    return jwt.sign(
        {
            apikey: apiKey,

            permissions,

            version: 2,
        },
        secretKey,
        {
            algorithm: "HS256",

            expiresIn: "4h",
        },
    );
}

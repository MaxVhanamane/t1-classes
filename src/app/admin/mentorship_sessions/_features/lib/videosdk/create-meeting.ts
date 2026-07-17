import "server-only";
import { generateVideoSdkToken } from "./generate-videosdk-token";

interface CreateMeetingResponse {
    roomId: string;
}

export async function createVideoSdkMeeting() {
    const response = await fetch(
        "https://api.videosdk.live/v2/rooms",
        {
            method: "POST",

            headers: {
                Authorization:
                    generateVideoSdkToken(),

                "Content-Type": "application/json",
            },
        },
    );

    if (!response.ok) {
        let errorBody: unknown = null;

        try {
            errorBody =
                await response.json();
        } catch {
            errorBody =
                await response.text();
        }

        console.error(
            "[VIDEOSDK_CREATE_MEETING_ERROR]",
            {
                status: response.status,
                statusText:
                    response.statusText,
                error: errorBody,
            },
        );

        throw new Error(
            "Failed to create VideoSDK meeting",
        );
    }

    const data =
        (await response.json()) as CreateMeetingResponse;

    return data.roomId;
}

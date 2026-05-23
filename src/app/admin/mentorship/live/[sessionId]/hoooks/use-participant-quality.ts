"use client";

import {
    useEffect,
    useMemo,
    useState,
} from "react";

import { useParticipant } from "@videosdk.live/react-sdk";

export type ConnectionQuality =
    | "good"
    | "weak"
    | "poor"
    | "reconnecting";

export interface ParticipantQualityState {
    quality: ConnectionQuality;

    packetLoss: number;

    rtt: number;

    jitter: number;

    bitrate: number;

    fps: number;

    width: number;

    height: number;

    codec: string;

    network: string;
}

const INITIAL_STATE: ParticipantQualityState =
{
    quality: "good",

    packetLoss: 0,

    rtt: 0,

    jitter: 0,

    bitrate: 0,

    fps: 0,

    width: 0,

    height: 0,

    codec: "",

    network: "",
};

export function useParticipantQuality(
    participantId: string,
) {
    const [stats, setStats] =
        useState<ParticipantQualityState>(
            INITIAL_STATE,
        );

    const { getVideoStats } =
        useParticipant(participantId);

    useEffect(() => {
        if (
            !participantId ||
            !getVideoStats
        ) {
            return;
        }

        let mounted = true;

        let isFetching = false;

        const stopPolling = () => {
            mounted = false;

            window.clearInterval(
                intervalId,
            );
        };

        const pollStats =
            async () => {
                /*
                  Prevent:
                  - overlapping requests
                  - stale polling
                  - transport spam
                */
                if (
                    !mounted ||
                    isFetching
                ) {
                    return;
                }

                /*
                  Skip polling while
                  tab is hidden.
            
                  Reduces:
                  - CPU
                  - RTC load
                  - hidden-tab spam
                */
                if (
                    document.visibilityState ===
                    "hidden"
                ) {
                    return;
                }

                isFetching = true;

                try {
                    const statsArray =
                        await getVideoStats();

                    if (!mounted) {
                        return;
                    }

                    /*
                      Empty stats usually means:
                      - reconnecting
                      - transport restarting
                      - stream unavailable
                    */
                    if (
                        !statsArray ||
                        !Array.isArray(
                            statsArray,
                        ) ||
                        statsArray.length === 0
                    ) {
                        setStats((prev) => ({
                            ...prev,
                            quality:
                                "reconnecting",
                        }));

                        return;
                    }

                    /*
                      First stream is enough
                      for overall quality.
                    */
                    const stat =
                        statsArray[0];

                    const packetsLost =
                        Number(
                            stat?.packetsLost ??
                            0,
                        );

                    const totalPackets =
                        Number(
                            stat?.totalPackets ??
                            0,
                        );

                    /*
                      Packet loss %
                    */
                    const packetLossPercent =
                        totalPackets > 0
                            ? (packetsLost /
                                totalPackets) *
                            100
                            : 0;

                    const rtt = Number(
                        stat?.rtt ?? 0,
                    );

                    const jitter = Number(
                        stat?.jitter ?? 0,
                    );

                    const bitrate = Number(
                        stat?.bitrate ?? 0,
                    );

                    const fps = Number(
                        stat?.size
                            ?.framerate ?? 0,
                    );

                    const width = Number(
                        stat?.size?.width ??
                        0,
                    );

                    const height = Number(
                        stat?.size?.height ??
                        0,
                    );

                    const codec = String(
                        stat?.codec ?? "",
                    );

                    const network = String(
                        stat?.network ?? "",
                    );

                    /*
                      Weighted scoring based on:
                      - VideoSDK thresholds
                      - real RTC UX
                    */
                    let score = 0;

                    /*
                      Packet loss
                      MOST IMPORTANT
                    */
                    if (
                        packetLossPercent > 5
                    ) {
                        score += 3;
                    } else if (
                        packetLossPercent >=
                        2
                    ) {
                        score += 1;
                    }

                    /*
                      RTT
                    */
                    if (rtt > 300) {
                        score += 2;
                    } else if (
                        rtt >= 150
                    ) {
                        score += 1;
                    }

                    /*
                      Jitter
                    */
                    if (jitter > 30) {
                        score += 2;
                    } else if (
                        jitter >= 15
                    ) {
                        score += 1;
                    }

                    /*
                      FPS collapse often indicates:
                      - congestion
                      - decoder issues
                      - thermal throttling
                    */
                    if (
                        fps > 0 &&
                        fps < 10
                    ) {
                        score += 2;
                    }

                    /*
                      Final quality state
                    */
                    let quality: ConnectionQuality =
                        "good";

                    if (score >= 6) {
                        quality = "poor";
                    } else if (
                        score >= 3
                    ) {
                        quality = "weak";
                    }

                    if (!mounted) {
                        return;
                    }

                    setStats({
                        quality,

                        packetLoss:
                            packetLossPercent,

                        rtt,

                        jitter,

                        bitrate,

                        fps,

                        width,

                        height,

                        codec,

                        network,
                    });
                } catch (error) {
                    /*
                      VideoSDK throws:
                      InvalidStateError: closed
              
                      during disconnect /
                      reconnect teardown.
              
                      This is expected.
                    */
                    if (
                        error instanceof
                        Error &&
                        error.message
                            .toLowerCase()
                            .includes(
                                "closed",
                            )
                    ) {
                        stopPolling();

                        return;
                    }

                    /*
                      Ignore updates after cleanup
                    */
                    if (!mounted) {
                        return;
                    }

                    /*
                      Temporary RTC failure
                    */
                    setStats((prev) => ({
                        ...prev,
                        quality:
                            "reconnecting",
                    }));

                    console.error(
                        "[PARTICIPANT_QUALITY_ERROR]",
                        error,
                    );
                } finally {
                    isFetching = false;
                }
            };

        /*
          Initial fetch
        */
        void pollStats();

        /*
          3s polling gives:
          - responsive UI
          - low RTC overhead
          - smoother diagnostics
        */
        const intervalId =
            window.setInterval(
                pollStats,
                3000,
            );

        return () => {
            stopPolling();
        };
    }, [
        participantId,
        getVideoStats,
    ]);

    return useMemo(
        () => stats,
        [stats],
    );
}

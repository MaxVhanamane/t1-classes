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

export function useParticipantQuality(
    participantId: string,
) {
    const [stats, setStats] =
        useState<ParticipantQualityState>({
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
        });

    const {
        getVideoStats,
    } = useParticipant(
        participantId,
    );

    useEffect(() => {
        if (
            !participantId ||
            !getVideoStats
        ) {
            return;
        }

        let mounted = true;

        const stopPolling = () => {
            mounted = false;

            window.clearInterval(
                intervalId,
            );
        };

        const pollStats =
            async () => {
                if (!mounted) {
                    return;
                }

                try {
                    const statsArray =
                        await getVideoStats();

                    if (
                        !mounted ||
                        !statsArray ||
                        !Array.isArray(
                            statsArray,
                        ) ||
                        statsArray.length === 0
                    ) {
                        return;
                    }

                    /*
                      Usually first stream
                      is enough for quality.
                    */

                    const stat =
                        statsArray[0];

                    const packetsLost =
                        Number(
                            stat?.packetsLost ?? 0,
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

                    const jitter =
                        Number(
                            stat?.jitter ?? 0,
                        );

                    const bitrate =
                        Number(
                            stat?.bitrate ?? 0,
                        );

                    const fps = Number(
                        stat?.size
                            ?.framerate ?? 0,
                    );

                    const width = Number(
                        stat?.size
                            ?.width ?? 0,
                    );

                    const height =
                        Number(
                            stat?.size
                                ?.height ?? 0,
                        );

                    const codec = String(
                        stat?.codec ?? "",
                    );

                    const network =
                        String(
                            stat?.network ??
                            "",
                        );

                    /*
                      Combined quality scoring.

                      Based on:
                      - VideoSDK docs
                      - RTC industry norms
                    */

                    const metricScores = {
                        packetLoss:
                            packetLossPercent > 8
                                ? 2
                                : packetLossPercent >
                                    3
                                    ? 1
                                    : 0,

                        rtt:
                            rtt > 300
                                ? 2
                                : rtt > 150
                                    ? 1
                                    : 0,

                        jitter:
                            jitter > 30
                                ? 2
                                : jitter > 15
                                    ? 1
                                    : 0,
                    };

                    const totalScore =
                        metricScores.packetLoss +
                        metricScores.rtt +
                        metricScores.jitter;

                    let quality: ConnectionQuality =
                        "good";

                    if (totalScore >= 4) {
                        quality = "poor";
                    } else if (
                        totalScore >= 2
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

                      when transport is destroyed
                      during leave/disconnect.
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

                    console.error(
                        "[PARTICIPANT_QUALITY_ERROR]",
                        error,
                    );
                }
            };

        /*
          Initial fetch
        */

        void pollStats();

        /*
          Poll every 5 seconds.

          Good balance between:
          responsiveness
          and CPU/network usage.
        */

        const intervalId =
            window.setInterval(
                pollStats,
                5000,
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

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useRouter } from "next/navigation";

import {
  Camera,
  CameraOff,
  Check,
  Loader2,
  Mic,
  MicOff,
  RefreshCcw,
  VideoOff,
} from "lucide-react";

import { toast } from "sonner";

import { Card } from "@/src/components/ui/card";

import { Button } from "@/src/components/ui/button";

import { Label } from "@/src/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";

import { Switch } from "@/src/components/ui/switch";

interface MentorshipPrecallSetupProps {
  joinHref: string;
}

interface MeetingPreferences {
  micEnabled: boolean;

  webcamEnabled: boolean;

  micId: string;

  webcamId: string;

  speakerId: string;
}

export function MentorshipPrecallSetup({
  joinHref,
}: MentorshipPrecallSetupProps) {
  const router = useRouter();

  const videoRef = useRef<HTMLVideoElement | null>(null);

  const streamRef = useRef<MediaStream | null>(null);

  const [loading, setLoading] = useState(true);

  const [devicesLoading, setDevicesLoading] = useState(false);

  const [cameraPermissionDenied, setCameraPermissionDenied] = useState(false);

  const [micPermissionDenied, setMicPermissionDenied] = useState(false);

  const [audioInputs, setAudioInputs] = useState<MediaDeviceInfo[]>([]);

  const [videoInputs, setVideoInputs] = useState<MediaDeviceInfo[]>([]);

  const [audioOutputs, setAudioOutputs] = useState<MediaDeviceInfo[]>([]);

  const [micEnabled, setMicEnabled] = useState(true);

  const [webcamEnabled, setWebcamEnabled] = useState(true);

  const [selectedMic, setSelectedMic] = useState("");

  const [selectedCamera, setSelectedCamera] = useState("");

  const [selectedSpeaker, setSelectedSpeaker] = useState("");

  const stopTracks = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());

    streamRef.current = null;
  }, []);

  const initializeDevices = useCallback(async () => {
    try {
      setDevicesLoading(true);

      stopTracks();

      /*
      If both mic and webcam are disabled,
      we do not need a media stream.
    */
      if (!micEnabled && !webcamEnabled) {
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }

        setCameraPermissionDenied(false);

        setMicPermissionDenied(false);

        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: micEnabled
          ? selectedMic
            ? {
                deviceId: {
                  exact: selectedMic,
                },
              }
            : true
          : false,

        video: webcamEnabled
          ? selectedCamera
            ? {
                deviceId: {
                  exact: selectedCamera,
                },
              }
            : true
          : false,
      });

      streamRef.current = stream;

      if (videoRef.current && stream.getVideoTracks().length > 0) {
        videoRef.current.srcObject = stream;
      }

      const devices = await navigator.mediaDevices.enumerateDevices();

      const audioInputDevices = devices.filter(
        (device) => device.kind === "audioinput",
      );

      const videoInputDevices = devices.filter(
        (device) => device.kind === "videoinput",
      );

      const audioOutputDevices = devices.filter(
        (device) => device.kind === "audiooutput",
      );

      setAudioInputs(audioInputDevices);

      setVideoInputs(videoInputDevices);

      setAudioOutputs(audioOutputDevices);

      if (!selectedMic && audioInputDevices[0]) {
        setSelectedMic(audioInputDevices[0].deviceId);
      }

      if (!selectedCamera && videoInputDevices[0]) {
        setSelectedCamera(videoInputDevices[0].deviceId);
      }

      setCameraPermissionDenied(false);

      setMicPermissionDenied(false);
    } catch (error) {
      console.error("[PRECALL_DEVICE_SETUP_ERROR]", error);

      if (error instanceof DOMException) {
        /*
        Only show permission errors
        for actual permission denial.
      */
        if (error.name === "NotAllowedError") {
          if (error.message.toLowerCase().includes("audio")) {
            setMicPermissionDenied(true);
          }

          if (error.message.toLowerCase().includes("video")) {
            setCameraPermissionDenied(true);
          }

          if (
            !error.message.toLowerCase().includes("audio") &&
            !error.message.toLowerCase().includes("video")
          ) {
            setMicPermissionDenied(true);

            setCameraPermissionDenied(true);
          }

          toast.error("Camera or microphone access denied");
        }
      }
    } finally {
      setDevicesLoading(false);

      setLoading(false);
    }
  }, [micEnabled, webcamEnabled, selectedCamera, selectedMic, stopTracks]);

  useEffect(() => {
    void initializeDevices();

    return () => {
      stopTracks();
    };
  }, [initializeDevices, stopTracks]);

  useEffect(() => {
    if (!selectedSpeaker && audioOutputs[0]) {
      setSelectedSpeaker(audioOutputs[0].deviceId);
    }
  }, [audioOutputs, selectedSpeaker]);

  const previewLabel = useMemo(() => {
    if (!webcamEnabled) {
      return "Camera Off";
    }

    return "Camera Preview";
  }, [webcamEnabled]);

  const handleJoin = useCallback(() => {
    const preferences: MeetingPreferences = {
      micEnabled,

      webcamEnabled,

      micId: selectedMic,

      webcamId: selectedCamera,

      speakerId: selectedSpeaker,
    };

    sessionStorage.setItem(
      "mentorship-meeting-preferences",
      JSON.stringify(preferences),
    );

    router.push(joinHref);
  }, [
    joinHref,
    micEnabled,
    router,
    selectedCamera,
    selectedMic,
    selectedSpeaker,
    webcamEnabled,
  ]);

  return (
    <div className="min-h-screen bg-muted-soft p-3 sm:p-4 lg:p-6">
      <div className="mx-auto max-w-7xl">
        <Card className="overflow-hidden rounded-[2rem] border bg-background p-0 shadow-sm">
          <div className="grid min-h-[85dvh] lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,1fr)_420px]">
            {/* Preview */}
            <div className="relative flex min-w-0 items-center justify-center bg-background p-3 sm:p-4 lg:p-6">
              <div className="relative aspect-video w-full overflow-hidden rounded-[1.75rem] border border-white/10 bg-zinc-950 shadow-2xl">
                {loading ? (
                  <div className="flex h-full items-center justify-center">
                    <Loader2 className="size-10 animate-spin text-white/70" />
                  </div>
                ) : webcamEnabled ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-white">
                    <div className="flex size-20 items-center justify-center rounded-full bg-white/10">
                      <VideoOff className="size-10" />
                    </div>

                    <div>
                      <p className="text-base font-medium">Camera Disabled</p>

                      <p className="mt-1 text-sm text-white/70">
                        Your camera preview is currently turned off.
                      </p>
                    </div>
                  </div>
                )}

                <div className="absolute left-3 top-3 rounded-full border border-white/10 bg-black/50 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                  {previewLabel}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex min-w-0 flex-col border-t bg-background lg:border-l lg:border-t-0">
              {/* Header */}
              <div className="border-b px-4 py-4 sm:px-6">
                <p className="text-sm font-medium text-primary">
                  Mentorship Session
                </p>

                <h1 className="mt-2 text-xl font-semibold tracking-tight">
                  Setup Your Devices
                </h1>

                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Configure your microphone and camera before joining the live
                  mentorship session.
                </p>
              </div>

              {/* Scroll Area */}
              <div className="flex-1 space-y-5 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
                {/* Toggles */}
                <div className="space-y-4">
                  {/* Mic */}
                  <div className="flex flex-col gap-4 rounded-2xl border bg-muted-soft p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-background shadow-sm">
                        {micEnabled ? (
                          <Mic className="size-5" />
                        ) : (
                          <MicOff className="size-5" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-medium">Microphone</p>

                        <p className="text-sm text-muted-foreground">
                          Enable microphone before joining
                        </p>
                      </div>
                    </div>

                    <Switch
                      checked={micEnabled}
                      onCheckedChange={setMicEnabled}
                    />
                  </div>

                  {/* Camera */}
                  <div className="flex flex-col gap-4 rounded-2xl border bg-muted-soft p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-background shadow-sm">
                        {webcamEnabled ? (
                          <Camera className="size-5" />
                        ) : (
                          <CameraOff className="size-5" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-medium">Camera</p>

                        <p className="text-sm text-muted-foreground">
                          Enable camera before joining
                        </p>
                      </div>
                    </div>

                    <Switch
                      checked={webcamEnabled}
                      onCheckedChange={setWebcamEnabled}
                    />
                  </div>
                </div>

                {/* Device Selectors */}
                <div className="space-y-4">
                  {/* Microphone */}
                  <div className="min-w-0 space-y-2">
                    <Label>Microphone</Label>

                    <Select value={selectedMic} onValueChange={setSelectedMic}>
                      <SelectTrigger className="h-12 w-full min-w-0 rounded-2xl">
                        <SelectValue placeholder="Select microphone" />
                      </SelectTrigger>

                      <SelectContent className="max-w-[calc(100vw-2rem)]">
                        {audioInputs.map((device) => (
                          <SelectItem
                            key={device.deviceId}
                            value={device.deviceId}
                            className="max-w-full"
                          >
                            <span className="block truncate">
                              {device.label || "Microphone"}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Camera */}
                  <div className="min-w-0 space-y-2">
                    <Label>Camera</Label>

                    <Select
                      value={selectedCamera}
                      onValueChange={setSelectedCamera}
                    >
                      <SelectTrigger className="h-12 w-full min-w-0 rounded-2xl">
                        <SelectValue placeholder="Select camera" />
                      </SelectTrigger>

                      <SelectContent className="max-w-[calc(100vw-2rem)]">
                        {videoInputs.map((device) => (
                          <SelectItem
                            key={device.deviceId}
                            value={device.deviceId}
                            className="max-w-full"
                          >
                            <span className="block truncate">
                              {device.label || "Camera"}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Speaker */}
                  <div className="min-w-0 space-y-2">
                    <Label>Speaker</Label>

                    <Select
                      value={selectedSpeaker}
                      onValueChange={setSelectedSpeaker}
                    >
                      <SelectTrigger className="h-12 w-full min-w-0 rounded-2xl">
                        <SelectValue placeholder="Select speaker" />
                      </SelectTrigger>

                      <SelectContent className="max-w-[calc(100vw-2rem)]">
                        {audioOutputs.map((device) => (
                          <SelectItem
                            key={device.deviceId}
                            value={device.deviceId}
                            className="max-w-full"
                          >
                            <span className="block truncate">
                              {device.label || "Speaker"}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Permission Warning */}
                {(cameraPermissionDenied || micPermissionDenied) && (
                  <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4">
                    <p className="text-sm font-medium text-destructive">
                      Permissions Required
                    </p>

                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      Please allow camera and microphone access in your browser
                      settings before joining the session.
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t px-4 py-4 sm:px-6">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    variant="outline"
                    className="h-12 w-full flex-1 rounded-2xl"
                    onClick={() => {
                      void initializeDevices();
                    }}
                    disabled={devicesLoading}
                  >
                    {devicesLoading ? (
                      <Loader2 className="mr-2 size-4 animate-spin" />
                    ) : (
                      <RefreshCcw className="mr-2 size-4" />
                    )}
                    Refresh Devices
                  </Button>

                  <Button
                    className="h-12 w-full flex-1 rounded-2xl"
                    onClick={handleJoin}
                  >
                    <Check className="mr-2 size-4" />
                    Join Session
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

"use client";

import { LoadingSVG } from "@/components/button/LoadingSVG";
import { ChatMessageType } from "@/components/chat/ChatTile";
import { ColorPicker } from "@/components/colorPicker/ColorPicker";
import { AudioInputTile } from "@/components/config/AudioInputTile";
import { ConfigurationPanelItem } from "@/components/config/ConfigurationPanelItem";
import { NameValueRow } from "@/components/config/NameValueRow";
import { PlaygroundHeader } from "@/components/playground/PlaygroundHeader";
import {
  PlaygroundTab,
  PlaygroundTabbedTile,
  PlaygroundTile,
} from "@/components/playground/PlaygroundTile";
import { useConfig } from "@/hooks/useConfig";
import { TranscriptionTile } from "@/transcriptions/TranscriptionTile";
import {
  BarVisualizer,
  VideoTrack,
  useConnectionState,
  useDataChannel,
  useLocalParticipant,
  useRoomInfo,
  useTracks,
  useVoiceAssistant,
  useRoomContext,
} from "@livekit/components-react";
import { ConnectionState, LocalParticipant, Track } from "livekit-client";
import { QRCodeSVG } from "qrcode.react";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import tailwindTheme from "../../lib/tailwindTheme.preval";
import { EditableNameValueRow } from "@/components/config/NameValueRow";

export interface PlaygroundMeta {
  name: string;
  value: string;
}

export interface PlaygroundProps {
  logoUrl?: string;  // Changed from logo to logoUrl
  themeColors: string[];
  onConnect: (connect: boolean, opts?: { token: string; url: string }) => void;
}

const headerHeight = 64;

export default function Playground({
  logoUrl,  // Changed from logo
  themeColors,
  onConnect,
}: PlaygroundProps) {
  const { config, setUserSettings } = useConfig();
  const { name } = useRoomInfo();
  const [transcripts, setTranscripts] = useState<ChatMessageType[]>([]);
  const { localParticipant } = useLocalParticipant();

  const voiceAssistant = useVoiceAssistant();

  const roomState = useConnectionState();
  const tracks = useTracks();
  const room = useRoomContext();

  const [rpcMethod, setRpcMethod] = useState("");
  const [rpcPayload, setRpcPayload] = useState("");

  useEffect(() => {
    if (roomState === ConnectionState.Connected) {
      localParticipant.setCameraEnabled(config.settings.inputs.camera);
      localParticipant.setMicrophoneEnabled(config.settings.inputs.mic);
    }
  }, [config, localParticipant, roomState]);

  useEffect(() => {
    if (!themeColors.includes(config.settings.theme_color)) {
      const newSettings = { ...config.settings };
      newSettings.theme_color = themeColors[0];
      setUserSettings(newSettings);
    }
  }, []);

  const agentVideoTrack = tracks.find(
    (trackRef) =>
      trackRef.publication.kind === Track.Kind.Video &&
      trackRef.participant.isAgent
  );

  const localTracks = tracks.filter(
    ({ participant }) => participant instanceof LocalParticipant
  );
  const localVideoTrack = localTracks.find(
    ({ source }) => source === Track.Source.Camera
  );
  const localMicTrack = localTracks.find(
    ({ source }) => source === Track.Source.Microphone
  );

  const onDataReceived = useCallback(
    (msg: any) => {
      if (msg.topic === "transcription") {
        const decoded = JSON.parse(
          new TextDecoder("utf-8").decode(msg.payload)
        );
        let timestamp = new Date().getTime();
        if ("timestamp" in decoded && decoded.timestamp > 0) {
          timestamp = decoded.timestamp;
        }
        setTranscripts([
          ...transcripts,
          {
            name: "You",
            message: decoded.text,
            timestamp: timestamp,
            isSelf: true,
          },
        ]);
      }
    },
    [transcripts]
  );

  useDataChannel(onDataReceived);

  const videoTileContent = useMemo(() => {
    const videoFitClassName = `object-${config.video_fit || "cover"}`;
  
    const disconnectedContent = (
      <div className="flex items-center justify-center text-gray-600 text-center w-full h-full bg-white rounded-xl">
        <div className="flex flex-col items-center p-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-teal-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <p className="font-medium text-gray-800">Connect to start your virtual session</p>
        </div>
      </div>
    );
  
    const loadingContent = (
      <div className="flex flex-col items-center justify-center gap-3 text-gray-600 text-center h-full w-full bg-white rounded-xl">
        <LoadingSVG />
        <p className="font-medium text-gray-800">Connecting...</p>
      </div>
    );
  
    const videoContent = (
      <div className="relative w-full h-full bg-white rounded-xl shadow-sm">
        {/* Show local video track in main window */}
        {localVideoTrack && (
          <VideoTrack
            trackRef={localVideoTrack}
            className={`absolute top-1/2 -translate-y-1/2 ${videoFitClassName} object-position-center w-full h-full rounded-lg`}
          />
        )}
        <div className="absolute top-4 right-4 bg-white/95 px-3 py-1.5 rounded-full text-xs font-medium text-teal-700 shadow-sm border border-gray-100 flex items-center">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
          Secure Connection
        </div>
      </div>
    );
  
    let content = null;
    if (roomState === ConnectionState.Disconnected) {
      content = disconnectedContent;
    } else if (roomState === ConnectionState.Connected) {
      content = videoContent;
    } else {
      content = loadingContent;
    }
  
    return (
      <div className="flex flex-col w-full grow text-gray-900 bg-white rounded-xl border border-gray-100 shadow-sm relative overflow-y-auto">
        {content}
      </div>
    );
  }, [localVideoTrack, config, roomState]);

  useEffect(() => {
    document.body.style.setProperty(
      "--lk-theme-color",
      // @ts-ignore
      tailwindTheme.colors[config.settings.theme_color]["600"]
    );
    document.body.style.setProperty(
      "--lk-drop-shadow",
      `var(--lk-theme-color) 0px 0px 12px`
    );
  }, [config.settings.theme_color]);

  const audioTileContent = useMemo(() => {
    const disconnectedContent = (
      <div className="flex flex-col items-center justify-center gap-3 text-gray-600 text-center w-full bg-white rounded-xl p-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-teal-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
        <p className="font-medium text-gray-800">Connect to start audio</p>
      </div>
    );

    const waitingContent = (
      <div className="flex flex-col items-center gap-3 text-gray-600 text-center w-full bg-white rounded-xl p-6">
        <LoadingSVG />
        <p className="font-medium text-gray-800">Connecting audio...</p>
      </div>
    );

    const visualizerContent = (
      <div
        className={`flex flex-col items-center justify-center w-full h-48 [--lk-va-bar-width:30px] [--lk-va-bar-gap:20px] [--lk-fg:var(--lk-theme-color)] bg-white rounded-xl p-4`}
      >
        <p className="text-sm text-gray-600 mb-4">Voice Activity</p>
        <BarVisualizer
          state={voiceAssistant.state}
          trackRef={voiceAssistant.audioTrack}
          barCount={5}
          options={{ minHeight: 20 }}
        />
      </div>
    );

    if (roomState === ConnectionState.Disconnected) {
      return disconnectedContent;
    }

    if (!voiceAssistant.audioTrack) {
      return waitingContent;
    }

    return visualizerContent;
  }, [voiceAssistant.audioTrack, config.settings.theme_color, roomState, voiceAssistant.state]);

  const chatTileContent = useMemo(() => {
    if (voiceAssistant.audioTrack) {
      return (
        <div className="flex flex-col h-full overflow-y-auto bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="bg-teal-50 px-4 py-3 rounded-t-lg border-b border-teal-100">
            <h3 className="text-teal-800 font-semibold">Chat Session</h3>
          </div>
          <TranscriptionTile
            agentAudioTrack={voiceAssistant.audioTrack}
            accentColor={config.settings.theme_color}
          />
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center h-full bg-white rounded-xl p-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-teal-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        <p className="font-medium text-gray-800">Connect to start messaging</p>
      </div>
    );
  }, [config.settings.theme_color, voiceAssistant.audioTrack]);

  const handleRpcCall = useCallback(async () => {
    if (!voiceAssistant.agent || !room) return;

    try {
      const response = await room.localParticipant.performRpc({
        destinationIdentity: voiceAssistant.agent.identity,
        method: rpcMethod,
        payload: rpcPayload,
      });
      console.log('RPC response:', response);
    } catch (e) {
      console.error('RPC call failed:', e);
    }
  }, [room, rpcMethod, rpcPayload, voiceAssistant.agent]);

  const settingsTileContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-4 h-full w-full items-start overflow-y-auto p-4 bg-white">
        {config.description && (
          <ConfigurationPanelItem title="Session Information">
            <div className="bg-teal-50 p-4 rounded-lg text-sm text-teal-800 border border-teal-100">
              {config.description}
            </div>
          </ConfigurationPanelItem>
        )}

        <ConfigurationPanelItem title="Status">
          <div className="flex flex-col gap-2 w-full">
            <NameValueRow
              name="Room connected"
              value={
                roomState === ConnectionState.Connecting ? (
                  <LoadingSVG diameter={16} strokeWidth={2} />
                ) : (
                  roomState.toUpperCase()
                )
              }
              valueColor={
                roomState === ConnectionState.Connected
                  ? `${config.settings.theme_color}-600`
                  : "gray-600"
              }
            />
            <NameValueRow
              name="Agent connected"
              value={
                voiceAssistant.agent ? (
                  "TRUE"
                ) : roomState === ConnectionState.Connected ? (
                  <LoadingSVG diameter={12} strokeWidth={2} />
                ) : (
                  "FALSE"
                )
              }
              valueColor={
                voiceAssistant.agent
                  ? `${config.settings.theme_color}-600`
                  : "gray-600"
              }
            />
          </div>
        </ConfigurationPanelItem>
        {localVideoTrack && (
          <ConfigurationPanelItem
            title="Camera"
            deviceSelectorKind="videoinput"
          >
            <div className="relative">
              <VideoTrack
                className="rounded-md border border-gray-200 opacity-70 w-full"
                trackRef={localVideoTrack}
              />
            </div>
          </ConfigurationPanelItem>
        )}
        {localMicTrack && (
          <ConfigurationPanelItem
            title="Microphone"
            deviceSelectorKind="audioinput"
          >
            <AudioInputTile trackRef={localMicTrack} />
          </ConfigurationPanelItem>
        )}
        <div className="w-full">
          <ConfigurationPanelItem title="Color">
            <ColorPicker
              colors={themeColors}
              selectedColor={config.settings.theme_color}
              onSelect={(color) => {
                const userSettings = { ...config.settings };
                userSettings.theme_color = color;
                setUserSettings(userSettings);
              }}
            />
          </ConfigurationPanelItem>
        </div>
        {config.show_qr && (
          <div className="w-full">
            <ConfigurationPanelItem title="QR Code">
              <QRCodeSVG value={window.location.href} width="128" />
            </ConfigurationPanelItem>
          </div>
        )}
      </div>
    );
  }, [
    config.description,
    config.settings,
    config.show_qr,
    localParticipant,
    name,
    roomState,
    localVideoTrack,
    localMicTrack,
    themeColors,
    setUserSettings,
    voiceAssistant.agent,
  ]);

  let mobileTabs: PlaygroundTab[] = [];
  if (config.settings.outputs.video) {
    mobileTabs.push({
      title: "Video",
      content: (
        <PlaygroundTile
          className="w-full h-full grow overflow-y-auto"
          childrenClassName="justify-center"
          backgroundColor="white"
        >
          {videoTileContent}
        </PlaygroundTile>
      ),
    });
  }

  if (config.settings.outputs.audio) {
    mobileTabs.push({
      title: "Audio",
      content: (
        <PlaygroundTile
          className="w-full h-full grow overflow-y-auto"
          childrenClassName="justify-center"
          backgroundColor="white"
        >
          {audioTileContent}
        </PlaygroundTile>
      ),
    });
  }

  if (config.settings.chat) {
    mobileTabs.push({
      title: "Chat",
      content: chatTileContent,
    });
  }

  mobileTabs.push({
    title: "Settings",
    content: (
      <PlaygroundTile
        padding={false}
        backgroundColor="white"
        className="h-full w-full basis-1/4 items-start overflow-y-auto flex shadow-sm"
        childrenClassName="h-full grow items-start"
      >
        {settingsTileContent}
      </PlaygroundTile>
    ),
  });

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <PlaygroundHeader
        title={config.title}
        logoUrl={logoUrl}  // Changed to use logoUrl
        githubLink={config.github_link}
        height={headerHeight}
        accentColor={config.settings.theme_color}
        connectionState={roomState}
        onConnectClicked={() =>
          onConnect(roomState === ConnectionState.Disconnected)
        }
      />
      <div
        className={`flex gap-6 py-6 grow w-full overflow-y-auto px-4`}
        style={{ height: `calc(100vh - ${headerHeight}px)` }}
      >
        <div className="flex flex-col grow basis-1/2 gap-6 h-full lg:hidden">
          <PlaygroundTabbedTile
            className="h-full"
            tabs={mobileTabs}
            initialTab={mobileTabs.length - 1}
          />
        </div>
        <div
          className={`flex-col grow basis-1/2 gap-6 h-full hidden lg:${
            !config.settings.outputs.audio && !config.settings.outputs.video
              ? "hidden"
              : "flex"
          }`}
        >
          {config.settings.outputs.video && (
            <PlaygroundTile
              title="Video"
              className="w-full h-full grow overflow-y-auto"
              childrenClassName="justify-center"
              backgroundColor="white"
            >
              {videoTileContent}
            </PlaygroundTile>
          )}
          {config.settings.outputs.audio && (
            <PlaygroundTile
              title="Audio"
              className="w-full h-full grow overflow-y-auto"
              childrenClassName="justify-center"
              backgroundColor="white"
            >
              {audioTileContent}
            </PlaygroundTile>
          )}
        </div>

        {config.settings.chat && (
          <PlaygroundTile
            title="Chat"
            className="h-full grow basis-1/4 hidden lg:flex overflow-y-auto"
            backgroundColor="white"
          >
            {chatTileContent}
          </PlaygroundTile>
        )}
        <PlaygroundTile
          padding={false}
          backgroundColor="white"
          className="h-full w-full basis-1/4 items-start overflow-y-auto hidden max-w-[480px] lg:flex shadow-sm"
          childrenClassName="h-full grow items-start"
        >
          {settingsTileContent}
        </PlaygroundTile>
      </div>
    </div>
  );
}
"use client";
import React, { useEffect, useState } from "react";
import Button from "../common/button/button";
import { useRemote } from "@/hooks/peer-hooks"; // Updated hook
import VolumePanel from "../tools/volume-panel";

interface SuperJoinConnectProps {
  hostId: string;
}

const SuperJoinConnect: React.FC<SuperJoinConnectProps> = ({ hostId }) => {
  const { superUserPeer, connectToPeer, sendSuperUserMessage, messages } =
    useRemote();
  const [audioGain, setAudioGain] = useState<IAudioGain[]>([]);
  const [instrument, setInstrument] = useState<number[]>([]);

  const handleConnect = () => {
    if (hostId) {
      connectToPeer(hostId, true);
    }
  };

  const changeVol = (value: ISetChannelGain) => {
    if (sendSuperUserMessage) {
      sendSuperUserMessage(value, "SET_CHANNEL");
    }
  };

  useEffect(() => {
    handleConnect();
  }, [superUserPeer]);

  useEffect(() => {
    const type = messages?.content.type;
    const data = messages?.content.data;
    if (type === "GIND_NODE") {
      setAudioGain(data);
    }
  }, [messages?.content]);

  if (!superUserPeer.id) {
    return (
      <div className="min-h-dvh flex items-center justify-center text-lg">
        กำลังเชื่อมต่อ...
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <VolumePanel
        audioGain={audioGain}
        instrument={instrument}
        onVolumeChange={(c, v) => changeVol({ channel: c, value: v })}
      ></VolumePanel>
    </div>
  );
};

export default SuperJoinConnect;

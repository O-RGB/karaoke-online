import React, { useEffect, useState } from "react";
import Button from "../common/button/button";
import { useRemote } from "@/app/hooks/peer-hooks"; // Updated hook
import VolumePanel from "../tools/volume-panel";

interface SuperJoinConnectProps {
  hostId: string;
}

const SuperJoinConnect: React.FC<SuperJoinConnectProps> = ({ hostId }) => {
  const { superUserPeer, connectToPeer, sendSuperUserMessage, messages } =
    useRemote();
  const [message, setMessage] = useState("");
  const [gainNode, setGainNode] = useState<number[]>([]);

  const handleConnect = () => {
    if (hostId) {
      connectToPeer(hostId, true);
    }
  };

  const handleSendMessage = () => {
    if (sendSuperUserMessage && message) {
      sendSuperUserMessage(message, "GIND_NODE");
      setMessage("");
    }
  };

  const changeVol = (value: ISetChannelGain) => {
    console.log(value);
    if (sendSuperUserMessage) {
      sendSuperUserMessage(value, "SET_CHANNEL");
    }
  };

  useEffect(() => {
    handleConnect();
  }, [superUserPeer]);

  useEffect(() => {
    if (messages?.content.type === "GIND_NODE") {
      setGainNode(messages?.content.data);
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
        gainNode={gainNode}
        onVolumeChange={(c, v) => changeVol({ channel: c, value: v })}
      ></VolumePanel>
    </div>
  );
};

export default SuperJoinConnect;

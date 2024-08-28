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

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Messages</h2>
        <div className="bg-white p-4 rounded shadow">
          <div className="max-h-60 overflow-y-auto">
            {messages?.content.data}
            {/* {messages.map((msg, index) => (
              <div key={index} className="mb-2 p-2 bg-gray-200 rounded">
                <p>{JSON.stringify(msg.content)}</p>
              </div>
            ))} */}
          </div>
        </div>
      </div>

      <VolumePanel
        gainNode={gainNode}
        onVolumeChange={(c, v) => changeVol({ channel: c, value: v })}
      ></VolumePanel>

      <div className="fixed bottom-0 left-0 p-4 bg-gray-100 w-full border-t">
        <textarea
          className="w-full p-2 border rounded"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message here..."
        />
        <Button onClick={handleSendMessage} className="mt-2">
          Send
        </Button>
      </div>
    </div>
  );
};

export default SuperJoinConnect;

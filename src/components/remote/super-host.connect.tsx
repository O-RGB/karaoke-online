import React, { useEffect, useState } from "react";
import Button from "../common/button/button";
import { useQRCode } from "next-qrcode";
import { useRemote } from "@/app/hooks/peer-hooks"; // Updated hook for super user

interface SuperHostRemoteProps {
  myKey?: string[];
  onSaveKey?: (key: string) => void;
  send?: (value: string) => void;
}

const SuperHostRemote: React.FC<SuperHostRemoteProps> = ({
  onSaveKey,
  myKey,
  send,
}) => {
  const {
    superUserPeer,
    generateQRCode,
    sendMessage,
    superUserConnections,
    messages,
  } = useRemote();

  const [hostId, setHostId] = useState<string>();
  const { Canvas } = useQRCode();

  useEffect(() => {
    setHostId(superUserPeer?.id);
  }, [superUserPeer]);

  return (
    <div className="p-4 bg-gray-100 flex gap-2">
      <div className="mb-4">
        <a
          href={`http://localhost:3000/remote/super/${hostId}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open Link
        </a>
        {hostId && (
          <Canvas
            text={`http://localhost:3000/remote/super/${hostId}`}
            options={{
              errorCorrectionLevel: "M",
              margin: 3,
              scale: 4,
              width: 200,
              color: {
                dark: "#010599FF",
                light: "#FFBF60FF",
              },
            }}
          />
        )}
        <h2 className="text-xl p-1 font-semibold mb-2">Messages</h2>
        <div className="rounded shadow">
          <div className="">
            {/* Display messages if needed */}
            {/* {messages.map((msg, index) => (
              <div key={index} className="mb-2 p-2 bg-gray-200 rounded">
                <p>{msg.content}</p>
              </div>
            ))} */}
          </div>
        </div>
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Connections</h2>
        <div className="bg-white p-4 rounded shadow">
          <ul>
            {superUserConnections.map((conn, index) => (
              <li key={index} className="mb-2 p-2 bg-gray-200 rounded">
                {conn.connectionId}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SuperHostRemote;

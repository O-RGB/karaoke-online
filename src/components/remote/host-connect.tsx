import React, { useEffect, useState } from "react";
import Button from "../common/button/button";

import { useQRCode } from "next-qrcode";
import { useRemote } from "@/app/hooks/peer-hooks";

interface HostRemoteProps {}

const HostRemote: React.FC<HostRemoteProps> = ({}) => {
  const { normalPeer, connections } = useRemote();

  const [hostId, setHostId] = useState<string>();
  const { Canvas } = useQRCode();

  useEffect(() => {
    setHostId(normalPeer?.id);
  }, [normalPeer]);

  return (
    <div className="p-4 bg-gray-100 flex gap-2">
      <div className="mb-4">
        <a
          href={`https://my-test-project-seven.vercel.app/remote/${hostId}`}
          target="_blank"
        >
          open link
        </a>
        {hostId && (
          <Canvas
            text={`https://my-test-project-seven.vercel.app/remote/${hostId}`}
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
            {connections.map((conn, index) => (
              <li key={index} className="mb-2 p-2 bg-gray-200 rounded">
                {conn.connectionId}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* <div className="fixed bottom-0 left-0 p-4 bg-gray-100 w-full border-t">
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
      </div> */}
    </div>
  );
};

export default HostRemote;

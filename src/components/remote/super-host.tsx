import React, { useEffect, useState } from "react";
import { useQRCode } from "next-qrcode";
import { useRemote } from "@/hooks/peer-hooks"; // Updated hook for super user

interface SuperHostRemoteProps {}

const SuperHostRemote: React.FC<SuperHostRemoteProps> = ({}) => {
  const { superUserPeer, superUserConnections } = useRemote();

  const [hostId, setHostId] = useState<string>();
  const { Canvas } = useQRCode();

  useEffect(() => {
    setHostId(superUserPeer?.id);
  }, [superUserPeer]);

  return (
    <div className="">
      <div className="text-center text-white">สแกนเพื่อควบคุม</div>
      <a
        className="flex items-center justify-center"
        href={`https://my-test-project-seven.vercel.app/remote/super/${hostId}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        {hostId && (
          <Canvas
            text={`https://my-test-project-seven.vercel.app/remote/super/${hostId}`}
            options={{
              errorCorrectionLevel: "M",
              margin: 3,
              scale: 4,
              width: 300,
              color: {
                light: "#76dfff",
              },
            }}
          />
        )}{" "}
      </a>
      {/* <div className="mb-4">
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
      </div> */}
    </div>
  );
};

export default SuperHostRemote;

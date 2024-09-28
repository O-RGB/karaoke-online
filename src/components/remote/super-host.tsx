import React, { useEffect, useState } from "react";
import { useQRCode } from "next-qrcode";
import { useRemote } from "@/hooks/peer-hook"; // Updated hook for super user
import Input from "../common/input-data/input";

interface SuperHostRemoteProps {}

const SuperHostRemote: React.FC<SuperHostRemoteProps> = ({}) => {
  const { superUserPeer, superUserConnections } = useRemote();

  const [hostUrl, setHostUrl] = useState<string>();
  const [hostId, setHostId] = useState<string>();
  const { Canvas } = useQRCode();

  useEffect(() => {
    setHostId(superUserPeer?.id);
    if (typeof window !== "undefined") {
      setHostUrl(window.location.origin);
    }
  }, [superUserPeer]);

  if (!hostUrl && !hostId) {
    return;
  }

  return (
    <div className="flex flex-col lg:flex-row justify-center items-center gap-6 h-full">
      <a
        className="block lg:hidden"
        href={`${hostUrl}/remote/super/${hostId}`}
        target="_blank"
      >
        {hostId && (
          <Canvas
            text={`${hostUrl}/remote/super/${hostId}`}
            options={{
              errorCorrectionLevel: "M",
              margin: 3,
              scale: 4,
              width: 150,
              color: {
                light: "#76dfff",
              },
            }}
          />
        )}
      </a>

      <a
        className="hidden lg:block"
        href={`${hostUrl}/remote/super/${hostId}`}
        target="_blank"
      >
        {hostId && (
          <Canvas
            text={`${hostUrl}/remote/super/${hostId}`}
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
        )}
      </a>
      <div className="flex flex-col justify-between">
        <div>
          <span className="text-3xl">ควบคุมผ่านมือถือ</span>
        </div>
        <div className="flex flex-col  gap-1 h-full divide-x">
          {superUserConnections.map((data, index) => {
            return (
              <div key={`connecttion-key-${index}`} className="p-1">
                {data.connectionId}
              </div>
            );
          })}
        </div>
        <div className="flex flex-col">
          <span>Remote URL:</span>
          <Input
            defaultValue={`${hostUrl}/remote/super/${hostId}`}
            className="!text-black"
          ></Input>
        </div>
      </div>
    </div>
  );
};

export default SuperHostRemote;

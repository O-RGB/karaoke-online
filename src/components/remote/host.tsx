import React, { useEffect, useState } from "react";

import { useQRCode } from "next-qrcode";
import Input from "../common/input-data/input";
import { usePeerStore } from "@/stores/peer-store";

interface HostRemoteProps {}

const HostRemote: React.FC<HostRemoteProps> = ({}) => {
  const { normalPeer, connections } = usePeerStore();

  const [hostUrl, setHostUrl] = useState<string>();
  const [hostId, setHostId] = useState<string>();
  const { Canvas } = useQRCode();

  useEffect(() => {
    setHostId(normalPeer?.id);
    if (typeof window !== "undefined") {
      setHostUrl(window.location.origin);
    }
  }, [normalPeer]);

  if (!hostUrl && !hostId) {
    return;
  }

  return (
    <div className="flex flex-col lg:flex-row justify-center items-center gap-6 h-full">
      <a
        className="block lg:hidden"
        href={`${hostUrl}/remote/${hostId}`}
        target="_blank"
      >
        {hostId && (
          <Canvas
            text={`${hostUrl}/remote/${hostId}`}
            options={{
              errorCorrectionLevel: "M",
              margin: 3,
              scale: 4,
              width: 150,
              color: {
                dark: "#010599FF",
                light: "#FFBF60FF",
              },
            }}
          />
        )}
      </a>

      <a
        className="hidden lg:block"
        href={`${hostUrl}/remote/${hostId}`}
        target="_blank"
      >
        {hostId && (
          <Canvas
            text={`${hostUrl}/remote/${hostId}`}
            options={{
              errorCorrectionLevel: "M",
              margin: 3,
              scale: 4,
              width: 300,
              color: {
                dark: "#010599FF",
                light: "#FFBF60FF",
              },
            }}
          />
        )}
      </a>

      <div className="flex flex-col justify-between">
        <div>
          <span className="text-3xl">ขอเพลงผ่านมือถือ</span>
        </div>
        <div className="flex flex-col  gap-1 h-full divide-x">
          {connections.map((data, index) => {
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
            defaultValue={`${hostUrl}/remote/${hostId}`}
            className="!text-black"
          ></Input>
        </div>
      </div>
    </div>
  );
};

export default HostRemote;

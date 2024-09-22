import React, { useEffect, useState } from "react";

import { useQRCode } from "next-qrcode";
import { useRemote } from "@/hooks/peer-hook";
import Input from "../common/input-data/input";

interface HostRemoteProps {}

const HostRemote: React.FC<HostRemoteProps> = ({}) => {
  const { normalPeer } = useRemote();

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
    <div className="flex  justify-center gap-5">
      <a href={`${hostUrl}/remote/${hostId}`} target="_blank">
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

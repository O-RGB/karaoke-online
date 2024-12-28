import React, { useEffect, useState } from "react";

import { useQRCode } from "next-qrcode";
import Input from "../common/input-data/input";

import Button from "../common/button/button";
import Label from "../common/display/label";
import { RiRemoteControlFill } from "react-icons/ri";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { usePeerStore } from "@/stores/remote/modules/peer-js-store";

interface HostRemoteProps {}

const HostRemote: React.FC<HostRemoteProps> = ({}) => {
  const { initializePeers, normalPeer, connections } = usePeerStore();

  const [hostUrl, setHostUrl] = useState<string>();
  const [hostId, setHostId] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);
  const { Canvas } = useQRCode();

  const initHost = () => {
    setLoading(true);
    initializePeers(false);
  };

  useEffect(() => {
    setHostId(normalPeer?.id);
    if (typeof window !== "undefined") {
      setHostUrl(window.location.origin);
      setLoading(false);
    }
  }, [normalPeer]);

  if (!hostUrl && !hostId) {
    return;
  }

  if (!normalPeer) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="flex flex-col items-center justify-center gap-2">
          <Button
            disabled={loading}
            iconPosition="left"
            icon={
              loading ? (
                <AiOutlineLoading3Quarters className="animate-spin"></AiOutlineLoading3Quarters>
              ) : (
                <RiRemoteControlFill></RiRemoteControlFill>
              )
            }
            onClick={initHost}
            blur={false}
            color="blue"
            className="text-white"
          >
            {loading ? "กำลังโหลด" : "เปิดใช้งาน"}
          </Button>
          <Label className="">มีการใช้งาน CPU เพิ่มขึ้น</Label>
        </div>
      </div>
    );
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
          {hostId && hostUrl && (
            <Input
              defaultValue={`${hostUrl}/remote/${hostId}`}
              className="!text-black"
            ></Input>
          )}
        </div>
      </div>
    </div>
  );
};

export default HostRemote;

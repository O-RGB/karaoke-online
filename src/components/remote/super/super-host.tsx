import React, { useEffect, useState } from "react";
import { useQRCode } from "next-qrcode";
import Input from "../../common/input-data/input";

import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { RiRemoteControlFill } from "react-icons/ri";
import Button from "../../common/button/button";
import Label from "../../common/display/label";
import { usePeerStore } from "@/stores/remote/modules/peer-js-store";

interface SuperHostRemoteProps {}

const SuperHostRemote: React.FC<SuperHostRemoteProps> = ({}) => {
  const { initializePeers, superUserPeer, superUserConnections } =
    usePeerStore();

  const [hostUrl, setHostUrl] = useState<string>();
  const [hostId, setHostId] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);
  const { Canvas } = useQRCode();

  const initHost = () => {
    setLoading(true);
    initializePeers(true);
  };

  useEffect(() => {
    setHostId(superUserPeer?.id);
    if (typeof window !== "undefined") {
      setHostUrl("https://karaoke-online-remote.vercel.app");
      setLoading(false);
    }
  }, [superUserPeer]);

  if (!hostUrl && !hostId) {
    return;
  }

  if (!superUserPeer) {
    return (
      <div className="flex items-center justify-center h-full">
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
    <div className="flex-1 flex items-center justify-center h-full w-full p-2">
      <div className="flex flex-col lg:flex-row justify-center items-center gap-6 h-full">
        <a
          className="block lg:hidden"
          href={`${hostUrl}/super/${hostId}`}
          target="_blank"
        >
          {hostId && (
            <Canvas
              text={`${hostUrl}/super/${hostId}`}
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
          href={`${hostUrl}/super/${hostId}`}
          target="_blank"
        >
          {hostId && (
            <Canvas
              text={`${hostUrl}/super/${hostId}`}
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
            {hostUrl && hostId && (
              <Input
                defaultValue={`${hostUrl}/remote/super/${hostId}`}
                className="!text-black"
              ></Input>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperHostRemote;

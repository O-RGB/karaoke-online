import React, { useEffect, useState } from "react";
import { useQRCode } from "next-qrcode";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { RiRemoteControlFill } from "react-icons/ri";
import { usePeerHostStore } from "@/features/remote/store/peer-js-store";
import { remoteHost } from "@/config/value";
import Button from "../../common/button/button";
import Label from "../../common/display/label";
import Input from "../../common/input-data/input";
import { remoteRoutes } from "@/features/remote/routes";

interface ClientHostRemoteProps {}

const ClientHostRemote: React.FC<ClientHostRemoteProps> = ({}) => {
  const { initializePeer, peers, connections } = usePeerHostStore();

  const [hostUrl, setHostUrl] = useState<string>();
  const [hostId, setHostId] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);
  const { Canvas } = useQRCode();

  const initHost = async () => {
    setLoading(true);
    await initializePeer("NORMAL");
    remoteRoutes();
  };

  useEffect(() => {
    setHostId(peers.NORMAL?.id);
    if (typeof window !== "undefined") {
      setHostUrl(remoteHost);
      setLoading(false);
    }
  }, [peers.NORMAL]);

  if (!hostUrl && !hostId) {
    return;
  }

  if (!peers.NORMAL) {
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

  // const allClients = Object.values(connections).flat();

  return (
    <div className="flex-1 flex items-center justify-center h-full w-full p-2">
      <div className="flex flex-col lg:flex-row justify-center items-center gap-6 h-full">
        <a
          className="block lg:hidden"
          href={`${hostUrl}/client/${hostId}`}
          target="_blank"
        >
          {hostId && (
            <Canvas
              text={`${hostUrl}/client/${hostId}`}
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
          href={`${hostUrl}/client/${hostId}`}
          target="_blank"
        >
          {hostId && (
            <Canvas
              text={`${hostUrl}/client/${hostId}`}
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
            {connections.NORMAL.map((data, index) => {
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
                defaultValue={`${hostUrl}/client/${hostId}`}
                className="!text-black"
              ></Input>
            )}
          </div>
          {/* <div>
            <div className="client-list">
              <h2>Connected Clients ({allClients.length})</h2>
              {allClients.map((conn) => (
                <div key={conn.peer}>
                  Client ID: {conn.peer}
                  <button onClick={() => toggleClientVisibility(conn.peer)}>
                    {visibleClientIds.includes(conn.peer) ? "Hide" : "Show"}{" "}
                    Stream
                  </button>
                  <button onClick={() => endCall(conn.peer)}>
                    Disconnect Client
                  </button>
                </div>
              ))}
            </div>

            <div className="live-view">
              <h2>On Air</h2>
              <div className="video-grid">
                {visibleClientIds.map((peerId) => {
                  const stream = remoteStreams[peerId];
                  if (!stream)
                    return (
                      <div key={peerId}>Loading stream for {peerId}...</div>
                    );

                  return (
                    <video
                      key={peerId}
                      ref={(video) => {
                        if (video) video.srcObject = stream;
                      }}
                      autoPlay
                      playsInline
                      muted // Mute to avoid feedback if you have audio output
                    />
                  );
                })}
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default ClientHostRemote;

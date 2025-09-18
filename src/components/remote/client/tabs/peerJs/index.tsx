import { IAlertCommon } from "@/components/common/alert/types/alert.type";
import React, { useEffect, useState } from "react";
import Button from "@/components/common/button/button";
import Label from "@/components/common/display/label";
import { remoteHost } from "@/config/value";
import { remoteRoutes } from "@/features/remote/routes";
import { usePeerHostStore } from "@/features/remote/store/peer-js-store";
import { useQRCode } from "next-qrcode";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FaUserCircle } from "react-icons/fa";
import { FiCheck, FiCopy } from "react-icons/fi";
import { RiRemoteControlFill } from "react-icons/ri";

interface PeerJsClientStartupProps extends IAlertCommon {
  title?: string;
  themeColor?: string;
  qrCodeSize?: number;
  qrCodeColor?: string;
  qrCodeBackgroundColor?: string;
  showCpuWarning?: boolean;
  className?: string;
}

const PeerJsClientStartup: React.FC<PeerJsClientStartupProps> = ({
  title = "ควบคุมผ่านอุปกรณ์อื่น",
  themeColor = "#3b82f6",
  qrCodeSize = 220,
  qrCodeColor = "#000000",
  qrCodeBackgroundColor = "#FFFFFF",
  showCpuWarning = true,
  className = "",
  setAlert,
}) => {
  const { initializePeer, peers, connections, clientNicknames } =
    usePeerHostStore();

  const [hostUrl, setHostUrl] = useState<string>();
  const [hostId, setHostId] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const { Canvas } = useQRCode();

  const fullRemoteUrl = hostUrl && hostId ? `${hostUrl}/client/${hostId}` : "";

  const initHost = async () => {
    setLoading(true);
    try {
      await initializePeer("NORMAL");
      remoteRoutes();
    } catch (error) {
      console.error("Failed to initialize host:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setHostId(peers.NORMAL?.id);
    if (typeof window !== "undefined") {
      setHostUrl(remoteHost);
    }
  }, [peers.NORMAL]);

  const handleCopyUrl = () => {
    if (fullRemoteUrl) {
      navigator.clipboard.writeText(fullRemoteUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  if (!peers.NORMAL) {
    return (
      <div
        className={`flex items-center justify-center h-full w-full ${className}`}
      >
        <div className="flex flex-col items-center justify-center gap-4 text-center p-8">
          <RiRemoteControlFill
            className="text-5xl"
            style={{ color: themeColor }}
          />
          <h2 className="text-2xl font-bold text-gray-800">
            เปิดใช้งานรีโมทคอนโทรล
          </h2>
          <Button
            disabled={loading}
            iconPosition="left"
            icon={
              loading ? (
                <AiOutlineLoading3Quarters className="animate-spin" />
              ) : (
                <RiRemoteControlFill />
              )
            }
            onClick={initHost}
            style={{ backgroundColor: themeColor }}
            className="text-white font-semibold px-6 py-2"
          >
            {loading ? "กำลังเริ่มต้น..." : "เปิดใช้งาน"}
          </Button>
          {showCpuWarning && (
            <Label className="text-gray-500 text-sm mt-2">
              อาจมีการใช้งาน CPU เพิ่มขึ้นเล็กน้อย
            </Label>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`flex flex-col lg:flex-row h-full gap-8 ${className}`}>
        {/* QR Code Section */}
        <section className="flex flex-col items-center justify-center w-full lg:w-1/2 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
          <header className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-gray-800">
              เชื่อมต่ออุปกรณ์ใหม่
            </h2>
            <p className="text-gray-600 mt-2">
              ใช้กล้องมือถือสแกน QR Code หรือคัดลอกลิงก์เพื่อควบคุม
            </p>
          </header>

          {/* <Button
            onClick={() => {
              setAlert?.({
                title: "PeerJs คืออะไร",
                description: `เป็นไลบรารี่ที่ช่วยให้การเชื่อมต่อระหว่างอุปกรณ์ (Peer-to-Peer) ทำได้ง่ายขึ้นโดยไม่ต้องมีเซิร์ฟเวอร์กลาง แต่ละอุปกรณ์จะมี ID เป็นของตัวเอง, ใช้ WebRTC สำหรับการเชื่อมต่อแบบ Real-time, ข้อมูลถูกส่งตรงระหว่างอุปกรณ์โดยไม่ผ่านเซิร์ฟเวอร์, รองรับทั้งการส่งข้อมูลและสตรีมมิ่ง, ในระบบนี้ เราสร้าง QR Code ที่มี ID ของคุณ เพื่อให้อุปกรณ์อื่นสามารถเชื่อมต่อมาได้โดยตรง`,
              });
            }}
            icon={<BsTools></BsTools>}
          >
            PeerJS ทำงานอย่างไร?
          </Button> */}

          <div className="flex flex-col items-center w-full max-w-md">
            <a
              href={fullRemoteUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="เชื่อมต่ออุปกรณ์ผ่าน QR Code"
              className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
            >
              {fullRemoteUrl && (
                <Canvas
                  text={fullRemoteUrl}
                  options={{
                    errorCorrectionLevel: "M",
                    margin: 3,
                    scale: 4,
                    width: qrCodeSize,
                    color: {
                      dark: qrCodeColor,
                      light: qrCodeBackgroundColor,
                    },
                  }}
                  aria-hidden="true"
                />
              )}
            </a>

            <div className="w-full mt-6">
              <label htmlFor="connection-url" className="sr-only">
                URL สำหรับเชื่อมต่ออุปกรณ์
              </label>
              <div className="flex shadow-sm">
                <input
                  id="connection-url"
                  readOnly
                  value={fullRemoteUrl}
                  className="flex-1 min-w-0 px-4 py-2 text-sm text-gray-700 bg-gray-50 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  aria-label="URL สำหรับเชื่อมต่ออุปกรณ์"
                />
                <button
                  onClick={handleCopyUrl}
                  style={{ backgroundColor: themeColor }}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-lg text-white hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  aria-label={isCopied ? "คัดลอกเรียบร้อย" : "คัดลอก URL"}
                >
                  {isCopied ? (
                    <FiCheck size={20} className="text-white" />
                  ) : (
                    <FiCopy size={20} className="text-white" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Connected Devices Section */}
        <section className="flex flex-col w-full lg:w-1/2 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
          <header className="mb-6 text-center">
            <h3 className="text-xl font-semibold text-gray-800">
              อุปกรณ์ที่เชื่อมต่อ{" "}
              <span className="text-blue-600">
                ({connections.NORMAL.length})
              </span>
            </h3>
          </header>

          <div className="flex-1">
            {connections.NORMAL.length > 0 ? (
              <ul className="space-y-3 pr-2 max-h-64 overflow-y-auto">
                {connections.NORMAL.map((conn) => (
                  <li
                    key={conn.connectionId}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FaUserCircle
                        className="text-3xl text-gray-400"
                        aria-hidden="true"
                      />
                      <div>
                        <span className="block font-medium text-gray-800">
                          {clientNicknames[conn.peer] || "อุปกรณ์ไม่มีชื่อ"}
                        </span>
                        <span className="inline-flex items-center mt-1 text-xs font-medium text-green-700">
                          <span
                            className="flex w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"
                            aria-hidden="true"
                          ></span>
                          เชื่อมต่อแล้ว
                        </span>
                      </div>
                    </div>
                    <span className="sr-only">สถานะ: เชื่อมต่อแล้ว</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 py-8">
                <RiRemoteControlFill
                  className="text-5xl mb-4 text-gray-300"
                  aria-hidden="true"
                />
                <h4 className="font-medium text-gray-600 mb-1">
                  กำลังรอการเชื่อมต่อ...
                </h4>
                <p className="text-sm">อุปกรณ์ที่เชื่อมต่อจะปรากฏที่นี่</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
};

export default PeerJsClientStartup;

import useConfigStore from "@/features/config/config-store";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { WallpaperDisplayManager } from "@/utils/indexedDB/db/display/table";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { WALLPAPER } from "@/config/value";
import { usePeerHostStore } from "@/features/remote/store/peer-js-store";
import Button from "@/components/common/button/button";
import { BsRecordCircle } from "react-icons/bs";
import { MdOutlineCameraswitch } from "react-icons/md";

const getRandomColor = () => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

interface WallpaperRenderProps {
  wallpaperLoadingTitle?: string;
}

const WallpaperRender: React.FC<WallpaperRenderProps> = ({
  wallpaperLoadingTitle,
}) => {
  const { visibleClientIds, remoteStreams } = usePeerHostStore();

  const wallpaperDisplayManager = new WallpaperDisplayManager();
  const wId = useConfigStore((state) => state.config.themes?.wallpaperId);
  const enableCamera = useConfigStore(
    (state) => state.config.themes?.wallpaperCamera
  );

  const videoRef = useRef<HTMLVideoElement>(null);
  const cameraVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null); // Ref สำหรับวิดีโอจาก Peer
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [isVideo, setIsVideo] = useState<boolean>(false);
  const [fileUrl, setFileUrl] = useState<string>();
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);

  const [selectLive, setSelectLive] = useState<number>();
  const [selectClientId, setSelectClientId] = useState<string>();

  const fileIdVideo = (file: File) => file.type.startsWith("video/");

  const renderLogo = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "blue";
        ctx.font = "30px Arial";
        ctx.fillText("Hello Canvas in Next.js!", 50, 100);
      }
    }
  };

  const loadWallpaper = async () => {
    if (!wId) return setFileUrl(undefined);
    const wallaper = await wallpaperDisplayManager.get(wId);
    if (!wallaper) return setFileUrl(undefined);
    const file = wallaper.file;
    if (fileIdVideo(file)) {
      setIsVideo(true);
    } else {
      setIsVideo(false);
    }

    const url = URL.createObjectURL(file);
    setFileUrl(url);
  };

  const startCamera = async () => {
    try {
      setCameraError(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          facingMode: "environment",
        },
        audio: false,
      });

      setCameraStream(stream);
      setIsCameraActive(true);
    } catch (error) {
      console.error("Error accessing camera:", error);
      setCameraError(
        "ไม่สามารถเข้าถึงกล้องได้ โปรดอนุญาตสิทธิ์กล้องหรือตรวจสอบอุปกรณ์"
      );
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
      setIsCameraActive(false);
    }
  };

  const switchCamera = async () => {
    if (cameraStream) {
      stopCamera();

      setTimeout(async () => {
        try {
          const currentConstraints = cameraStream
            .getVideoTracks()[0]
            .getSettings();
          const newFacingMode =
            currentConstraints.facingMode === "environment"
              ? "user"
              : "environment";

          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 1920 },
              height: { ideal: 1080 },
              facingMode: newFacingMode,
            },
            audio: false,
          });

          setCameraStream(stream);
          setIsCameraActive(true);

          if (cameraVideoRef.current) {
            cameraVideoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error("Error switching camera:", error);
          setCameraError("ไม่สามารถเปลี่ยนกล้องได้");
        }
      }, 100);
    }
  };

  useEffect(() => {
    renderLogo();
    if (!enableCamera) {
      loadWallpaper();
    }

    const metaThemeColor = document.querySelector("meta[name='theme-color']");
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", getRandomColor());
    }
  }, [wId, enableCamera]);

  useEffect(() => {
    if (enableCamera && !isCameraActive) {
      startCamera();
    } else if (!enableCamera && isCameraActive) {
      stopCamera();
    }

    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [enableCamera]);

  useLayoutEffect(() => {
    if (cameraVideoRef.current && cameraStream && isCameraActive) {
      cameraVideoRef.current.srcObject = cameraStream;
      cameraVideoRef.current
        .play()
        .catch((error) => console.error("Camera video play failed:", error));
    }
  }, [cameraStream, isCameraActive]);

  useEffect(() => {
    if (visibleClientIds.length === 0) {
      setSelectClientId(undefined);
      setSelectLive(undefined);
    }
  }, [visibleClientIds]);

  // ✨ FIX: ใช้ useEffect จัดการการเปลี่ยนแปลงของ remote stream
  useEffect(() => {
    if (
      remoteVideoRef.current &&
      selectClientId &&
      remoteStreams[selectClientId]
    ) {
      remoteVideoRef.current.srcObject = remoteStreams[selectClientId];
    }
  }, [selectClientId, remoteStreams]);

  return (
    <>
      <div
        style={{
          position: "fixed",
          bottom: 50,
          right: 10,
          zIndex: -10,
          opacity: 0.7,
        }}
        className="hidden lg:block w-fit h-fit text-white font-bold text-2xl drop-shadow-md"
      >
        NEXT KARAOKE v.1.0.29
      </div>
      <div
        style={{
          position: "fixed",
          bottom: 65,
          right: 10,
          zIndex: -10,
          opacity: 0.7,
        }}
        className="block lg:hidden w-fit h-fit text-white font-bold text-lg drop-shadow-md"
      >
        NEXT KARAOKE v.1.0.29
      </div>

      {isCameraActive && (
        <div className="fixed z-50 bottom-24 right-2 space-y-2">
          <Button
            onClick={switchCamera}
            blur={true}
            icon={
              <MdOutlineCameraswitch className="text-white"></MdOutlineCameraswitch>
            }
          ></Button>
        </div>
      )}

      {visibleClientIds.length > 0 && (
        <div className="fixed z-50 bottom-20 left-2 space-y-2">
          {visibleClientIds.map((data, i) => {
            return (
              <React.Fragment key={`button-sw-camera-${i}`}>
                <Button
                  onClick={() => {
                    if (i === selectLive) {
                      setSelectLive(undefined);
                      setSelectClientId(undefined);
                    } else {
                      setSelectLive(i);
                      setSelectClientId(data);
                    }
                  }}
                  blur={i === selectLive ? false : true}
                  color={i === selectLive ? "blue" : undefined}
                  className={`h-7 w-10`}
                >
                  <div className="flex gap-1 text-white !text-xs">
                    <span
                      className={`${
                        i === selectLive ? "" : "animate-ping text-red-500"
                      } `}
                    >
                      <BsRecordCircle className="mt-0.5" />
                    </span>
                    <span>{i + 1}</span>
                  </div>
                </Button>
              </React.Fragment>
            );
          })}
        </div>
      )}

      {selectClientId ? (
        <video
          ref={remoteVideoRef}
          key={`peer-live-${selectClientId}`}
          autoPlay
          playsInline
          muted
          style={{
            position: "fixed",
            width: "100%",
            height: "100%",
            top: 0,
            left: 0,
            objectFit: "cover",
            zIndex: -20,
            opacity: 0.8,
            transform: "scaleX(-1)",
          }}
        />
      ) : enableCamera && isCameraActive ? (
        <>
          <video
            ref={cameraVideoRef}
            autoPlay
            playsInline
            muted
            style={{
              position: "fixed",
              width: "100%",
              height: "100%",
              top: 0,
              left: 0,
              objectFit: "cover",
              zIndex: -20,
              opacity: 0.8,
              transform: "scaleX(-1)",
            }}
          />
          <div
            style={{
              position: "fixed",
              width: "100%",
              height: "100%",
              top: 0,
              left: 0,
              zIndex: -30,
              backgroundColor: "black",
            }}
          />
        </>
      ) : enableCamera && !isCameraActive ? (
        <div
          style={{
            position: "fixed",
            width: "100%",
            height: "100%",
            top: 0,
            left: 0,
            backgroundColor: "black",
            zIndex: -20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div className="text-white text-center p-4">
            <AiOutlineLoading3Quarters className="animate-spin mx-auto mb-2 text-2xl" />
            <p>กำลังเปิดกล้อง...</p>
            {cameraError && (
              <p className="text-red-400 mt-2 text-sm">{cameraError}</p>
            )}
          </div>
        </div>
      ) : isVideo ? (
        <>
          <video
            ref={videoRef}
            src={fileUrl}
            autoPlay
            loop
            muted
            playsInline
            style={{
              position: "fixed",
              width: "100%",
              height: "100%",
              top: 0,
              left: 0,
              objectFit: "cover",
              zIndex: -20,
              opacity: 0.7,
            }}
          />
          <div
            style={{
              position: "fixed",
              width: "100%",
              height: "100%",
              top: 0,
              left: 0,
              zIndex: -30,
              backgroundColor: "black",
            }}
          />
        </>
      ) : (
        <div
          style={{
            backgroundImage: `url(${fileUrl ? fileUrl : WALLPAPER})`,
            position: "fixed",
            width: "100%",
            height: "100%",
            top: 0,
            left: 0,
            backgroundSize: "cover",
            backgroundPosition: "center",
            zIndex: -20,
          }}
        />
      )}

      {wallpaperLoadingTitle && (
        <div className="fixed flex w-full h-full items-center justify-center">
          <div className="p-3 bg-white rounded-md flex items-center justify-center gap-2">
            <span>
              <AiOutlineLoading3Quarters className="animate-spin" />
            </span>
            {wallpaperLoadingTitle}
          </div>
        </div>
      )}
    </>
  );
};

export default WallpaperRender;

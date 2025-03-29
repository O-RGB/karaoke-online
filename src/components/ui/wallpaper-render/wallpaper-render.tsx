import { useWallpaperStore } from "@/features/wallpaper-store";
import React, { useEffect, useLayoutEffect, useRef } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

// ฟังก์ชันสำหรับสุ่มสีในรูปแบบ HEX
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
  const { wallpaper, isVideo, loadWallpaper } = useWallpaperStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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

  useEffect(() => {
    renderLogo();
    loadWallpaper();
    const metaThemeColor = document.querySelector("meta[name='theme-color']");

    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", getRandomColor());
    }
  }, [loadWallpaper]);

  useLayoutEffect(() => {
    if (videoRef.current && isVideo) {
      videoRef.current
        .play()
        .catch((error) => console.error("Video autoplay failed:", error));
    }
  }, [wallpaper, isVideo]);

  useEffect(() => {}, [wallpaperLoadingTitle]);
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
        NEXT KARAOKE v.1.0.28
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
        NEXT KARAOKE v.1.0.28
      </div>
      {isVideo ? (
        <>
          <video
            ref={videoRef}
            src={wallpaper}
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
          ></div>
        </>
      ) : (
        <div
          style={{
            backgroundImage: `url(${wallpaper})`,
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
              <AiOutlineLoading3Quarters className="animate-spin"></AiOutlineLoading3Quarters>
            </span>
            {wallpaperLoadingTitle}
          </div>
        </div>
      )}
    </>
  );
};

export default WallpaperRender;

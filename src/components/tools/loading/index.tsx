import useQueuePlayer from "@/features/player/player/modules/queue-player";
import React, { useEffect, useState } from "react";

interface LoadingProps {
  isLoad?: boolean;
}

const Loading: React.FC<LoadingProps> = ({ isLoad }) => {
  const songLoading = useQueuePlayer((state) => state.loading);
  const isLoading = isLoad || songLoading;

  const [shouldRender, setShouldRender] = useState(false);
  const [load, setLoad] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (isLoading) {
      setShouldRender(true);
      timeoutId = setTimeout(() => setLoad(true), 10);
    } else {
      setLoad(false);
      timeoutId = setTimeout(() => setShouldRender(false), 300);
    }

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isLoading]);

  if (!shouldRender) return null;

  return (
    <>
      <style>
        {`
          @keyframes pulse-dot {
            0%, 100% {
              opacity: 0.2;
            }
            50% {
              opacity: 1;
            }
          }
        `}
      </style>

      <div
        className="fixed inset-0 z-10 flex flex-col gap-2 items-center justify-center bg-black bg-opacity-25 backdrop-blur-sm transition-opacity duration-300 ease-in-out"
        style={{
          opacity: load ? 1 : 0,
        }}
      >
        <div className="flex items-center justify-center space-x-2">
          <div
            className="h-3 w-3 rounded-full bg-white"
            style={{
              animation: "pulse-dot 1.4s infinite ease-in-out",
              animationDelay: "0s",
            }}
          ></div>
          <div
            className="h-3 w-3 rounded-full bg-white"
            style={{
              animation: "pulse-dot 1.4s infinite ease-in-out",
              animationDelay: "0.2s",
            }}
          ></div>
          <div
            className="h-3 w-3 rounded-full bg-white"
            style={{
              animation: "pulse-dot 1.4s infinite ease-in-out",
              animationDelay: "0.4s",
            }}
          ></div>
        </div>
        <span className="text-white">กำลังโหลด</span>
      </div>
    </>
  );
};

export default Loading;

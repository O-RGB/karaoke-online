import useQueuePlayer from "@/features/player/player/modules/queue-player";
import React from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

interface NotificationAlertProps {}

const NotificationAlert: React.FC<NotificationAlertProps> = () => {
  const show = useQueuePlayer((state) => state.driveLoading);

  if (!show) {
    return <></>;
  }
  return (
    <div className="fixed z-30 left-0 top-1/2 w-full flex items-center justify-center bg-opacity-50 py-2">
      <div className="blur-overlay blur-border border rounded-md p-4 shadow-lg flex items-center gap-3 text-white">
        <AiOutlineLoading3Quarters className="animate-spin w-6 h-6" />
        <span className="font-medium text-lg">กำลังโหลดเพลงจาก</span>
        <img
          src="/icon/gd.ico"
          alt="Google Drive Icon"
          className="w-8 h-8 rounded-full"
        />
      </div>
    </div>
  );
};

export default NotificationAlert;

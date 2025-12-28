import React, { useEffect, useState } from "react";
import useNotificationStore, {
  INotificationState,
} from "@/features/notification-store";
import { FaCheckCircle, FaInfoCircle } from "react-icons/fa";
import { MdError, MdClose } from "react-icons/md";
import { IoWarning } from "react-icons/io5";

const variantConfig = {
  success: {
    Icon: FaCheckCircle,
    iconClass: "text-green-400",
    bgBorder: "border-green-500/50",
    bgColor: "bg-green-900/40",
  },
  error: {
    Icon: MdError,
    iconClass: "text-red-400",
    bgBorder: "border-red-500/50",
    bgColor: "bg-red-900/40",
  },
  warning: {
    Icon: IoWarning,
    iconClass: "text-yellow-400",
    bgBorder: "border-yellow-500/50",
    bgColor: "bg-yellow-900/40",
  },
  info: {
    Icon: FaInfoCircle,
    iconClass: "text-white",
    bgBorder: "blur-border",
    bgColor: "",
  },
};

const ToastItem = ({
  data,
  onClose,
}: {
  data: INotificationState;
  onClose: (id: string) => void;
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const { id, title, description, variant = "info", duration = 3000 } = data;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsClosing(true);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleAnimationEnd = () => {
    if (isClosing) {
      onClose(id); // 🔥 remove จริง
    }
  };

  const config = variantConfig[variant] || variantConfig.info;
  const { Icon, iconClass, bgBorder, bgColor } = config;

  return (
    <div
      onAnimationEnd={handleAnimationEnd}
      className={`
        relative flex items-start gap-2 p-2 pr-7 rounded border shadow-sm backdrop-blur-md pointer-events-auto
        w-auto max-w-[260px] min-w-[180px] mb-1.5
        ${bgBorder} ${bgColor}
        ${isClosing ? "toast-exit" : "toast-enter"}
      `}
    >
      <div className={`flex-shrink-0 ${iconClass} mt-0.5`}>
        <Icon className="text-base" />
      </div>

      <div className="flex flex-col flex-1 min-w-0">
        {title && (
          <span className="font-semibold text-white text-xs truncate leading-tight">
            {title}
          </span>
        )}
        {description && (
          <span className="text-gray-200 text-[10px] break-words line-clamp-2 leading-tight mt-0.5 opacity-90">
            {description}
          </span>
        )}
      </div>

      <button
        onClick={() => setIsClosing(true)}
        className="absolute top-1.5 right-1.5 text-white/40 hover:text-white transition-colors"
      >
        <MdClose className="text-sm" />
      </button>
    </div>
  );
};

const GlobalToast = () => {
  const notifications = useNotificationStore((state) => state.notifications);
  const removeNotification = useNotificationStore(
    (state) => state.removeNotification
  );

  return (
    <>
      <style jsx global>{`
        @keyframes slideInMini {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes fadeOutMini {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(10px);
            opacity: 0;
          }
        }

        .toast-enter {
          animation: slideInMini 0.3s cubic-bezier(0.21, 1.02, 0.73, 1) forwards;
        }

        .toast-exit {
          animation: fadeOutMini 0.2s ease-out forwards;
        }
      `}</style>

      <div className="fixed top-36 md:top-14 right-4 z-[9999] flex flex-col items-end pointer-events-none gap-1">
        {notifications.map((note) => (
          <ToastItem key={note.id} data={note} onClose={removeNotification} />
        ))}
      </div>
    </>
  );
};

export default GlobalToast;

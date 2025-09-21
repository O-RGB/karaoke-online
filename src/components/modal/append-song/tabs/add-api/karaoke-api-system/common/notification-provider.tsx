"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { FaInfoCircle, FaTimesCircle } from "react-icons/fa";
import { FaCircleCheck } from "react-icons/fa6";
import { MdOutlineError } from "react-icons/md";

export type NotificationType = "success" | "warning" | "error" | "info";

export interface NotificationItem {
  id: number;
  type?: NotificationType;
  text: string;
  duration?: number;
}

interface NotificationContextProps {
  notify: (item: Omit<NotificationItem, "id">) => void;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(
  undefined
);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context)
    throw new Error("useNotification must be used within NotificationProvider");
  return context;
};

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const notify = (item: Omit<NotificationItem, "id">) => {
    const id = Date.now() + Math.random();
    const newItem = { ...item, id };
    setNotifications((prev) => [newItem, ...prev]);

    if (item.duration !== 0) {
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, item.duration ?? 3000);
    }
  };

  const remove = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const iconColor = (type?: NotificationType) => {
    switch (type) {
      case "success":
        return "bg-green-500";
      case "warning":
        return "bg-yellow-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-blue-500";
    }
  };

  const iconSymbol = (type?: NotificationType) => {
    switch (type) {
      case "success":
        return <FaCircleCheck className="text-green-500" />;
      case "warning":
        return <MdOutlineError className="text-yellow-500"></MdOutlineError>;
      case "error":
        return <FaTimesCircle className="text-red-500"></FaTimesCircle>;
      default:
        return <FaInfoCircle className="text-blue-500"></FaInfoCircle>;
    }
  };

  return (
    <NotificationContext.Provider value={{ notify }}>
      <div className="relative w-full h-full">
        {children}

        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className="flex items-center gap-0.5 rounded-lg bg-white shadow-lg border border-gray-200 px-3 py-2 min-w-[280px]
                         transition duration-300 ease-out"
              style={{ animation: "slideDown 0.3s ease-out forwards" }}
            >
              <div
                className={`flex items-center justify-center w-6 h-6 rounded-full text-white text-sm font-bold`}
              >
                {iconSymbol(n.type)}
              </div>

              <span className="text-gray-800 text-sm flex-1">{n.text}</span>

              <button
                onClick={() => remove(n.id)}
                className="ml-2 text-gray-400 hover:text-gray-600 text-lg leading-none"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <style jsx>{`
          @keyframes slideDown {
            0% {
              opacity: 0;
              transform: translateY(-20px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    </NotificationContext.Provider>
  );
};

import React, { useEffect, useState } from "react";
import { IoMdNotifications } from "react-icons/io";

interface StatusPanelProps {
  notification?: INotificationValue;
}

const StatusPanel: React.FC<StatusPanelProps> = ({ notification }) => {
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    if (notification?.text !== "") {
      setShowNotification(true);

      const timer = setTimeout(() => {
        setShowNotification(false);
      }, notification?.delay ?? 2000);

      return () => clearTimeout(timer);
    }
  }, [notification]);

  return (
    <div className="fixed top-36 right-5 z-50">
      <div
        className={`blur-overlay  border text-white px-6 py-2 rounded shadow-lg duration-300 ${
          showNotification && notification?.text !== ""
            ? "opacity-100"
            : "opacity-0"
        }`}
      >
        <span className="flex gap-2 items-center justify-center">
          {notification?.icon ? (
            notification?.icon
          ) : (
            <IoMdNotifications></IoMdNotifications>
          )}{" "}
          {notification?.text}
        </span>
      </div>
    </div>
  );
};

export default StatusPanel;

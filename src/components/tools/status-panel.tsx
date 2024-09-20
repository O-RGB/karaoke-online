import React, { useEffect, useState } from "react";
import { IoMdNotifications } from "react-icons/io";

interface StatusPanelProps {
  text?: string;
}

const StatusPanel: React.FC<StatusPanelProps> = ({ text }) => {
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    if (text !== "") {
      setShowNotification(true);

      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [text]);

  return (
    <div className="fixed top-36 right-5 z-50">
      <div
        className={`blur-overlay  border text-white px-6 py-2 rounded shadow-lg duration-300 ${
          showNotification && text !== "" ? "opacity-100" : "opacity-0"
        }`}
      >
        <span className="flex gap-2 items-center justify-center">
          <IoMdNotifications></IoMdNotifications> {text}
        </span>
      </div>
    </div>
  );
};

export default StatusPanel;

import React, { useEffect, useState } from "react";
import useConfigStore from "../../features/config/config-store";

interface ClockPanelProps {}

const ClockPanel: React.FC<ClockPanelProps> = ({}) => {
  const { config } = useConfigStore();
  const widgetConfig = config.widgets;
  const isShow = widgetConfig?.clock?.show;

  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  if (isShow === false) {
    return null;
  }

  return (
    <div className="blur-overlay blur-border border rounded-md px-4 h-[35px] w-fit">
      <div className="text-white text-lg tracking-widest text-center flex items-center justify-center h-fit font-light">
        {formatTime(time)}
      </div>
    </div>
  );
};

export default ClockPanel;

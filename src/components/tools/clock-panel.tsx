import React, { useEffect, useState } from "react";
import useConfigStore from "../stores/config-store";

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
    return <></>;
  }

  return (
    <div className="fixed z-30 right-52 lg:top-6 blur-overlay blur-border border rounded-md p-4 w-44 hidden lg:block">
      <span className="text-white text-3xl tracking-widest text-center">
        {formatTime(time)}
      </span>
    </div>
  );
};

export default ClockPanel;

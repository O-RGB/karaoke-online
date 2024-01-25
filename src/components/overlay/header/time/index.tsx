import React, { useEffect, useState } from "react";

interface TimeHeaderProps {}

const TimeHeader: React.FC<TimeHeaderProps> = ({}) => {
  const [clock, setClock] = useState<Date>(new Date());

  const tick = () => {
    setClock(new Date());
  };

  useEffect(() => {
    setInterval(() => tick(), 1000);
  }, []);

  return (
    <>
      <div className="w-32 md:w-64 h-12 md:h-20 backdrop-blur-sm bg-white/25 border flex justify-center items-center text-xl md:text-4xl ">
        {clock.toLocaleTimeString()}
      </div>
    </>
  );
};

export default TimeHeader;

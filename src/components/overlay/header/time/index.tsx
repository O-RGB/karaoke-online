import React, { useEffect, useState } from "react";

interface TimeHeaderProps {
  rounded?: string;
  bgOverLay?: string;
  blur?: string;
}

const TimeHeader: React.FC<TimeHeaderProps> = ({
  rounded,
  bgOverLay,
  blur,
}) => {
  const [clock, setClock] = useState<Date>(new Date());

  const tick = () => {
    setClock(new Date());
  };

  useEffect(() => {
    setInterval(() => tick(), 1000);
  }, []);

  return (
    <>
      <div
        className={`${rounded} ${bgOverLay} ${blur} w-32 md:w-64 h-12 md:h-20   border flex justify-center items-center text-xl md:text-4xl duration-300 `}
      >
        {clock.toLocaleTimeString()}
      </div>
    </>
  );
};

export default TimeHeader;

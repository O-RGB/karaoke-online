import React, { useEffect, useState } from "react";

interface VolumeMeterVProps {
  level: number;
  max: number;
  className: string;
}

const VolumeMeterV: React.FC<VolumeMeterVProps> = ({
  level,
  className,
  max = 100,
}) => {
  const [filledBars, setFilledBars] = useState<number>(0);

  useEffect(() => {
    setFilledBars(Math.round((level / 150) * max));
  }, [level]);

  return (
    <div className={className}>
      <div className="flex flex-col w-full h-full opacity-30">
        <div className="bg-white/90 w-full h-full"></div>
        <div className="bg-white/60 w-full h-full"></div>
        <div className="bg-white/30 w-full h-full"></div>
      </div>

      <div
        className={`bg-white/30 absolute bottom-0 w-full`}
        style={{
          height: `${(filledBars / max) * 100}%`,
        }}
      ></div>
    </div>
  );
};

export default VolumeMeterV;

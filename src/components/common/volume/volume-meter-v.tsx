import React from "react";

interface VolumeMeterVProps {
  level: number;
  height: string;
  className: string;
}

const VolumeMeterV: React.FC<VolumeMeterVProps> = ({
  level,
  className,
  height,
}) => {
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
          height: level,
        }}
      ></div>
    </div>
  );
};

export default VolumeMeterV;

import React, { useEffect } from "react";

interface VolumeHorizontalProps {
  value: number;
  hide: boolean;
}

const VolumeHorizontal: React.FC<VolumeHorizontalProps> = ({ value, hide }) => {
  useEffect(() => {}, [hide]);
  return (
    <>
      <div
        className="absolute top-0 left-0 h-full bg-white/40  transition-all"
        style={{
          width: `${value}%`,
          opacity: !hide ? 0 : 1,
        }}
      ></div>
    </>
  );
};

export default VolumeHorizontal;

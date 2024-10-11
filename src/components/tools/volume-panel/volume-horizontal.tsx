import useGainStore from "@/components/stores/gain.store";
import React, { useEffect } from "react";

interface VolumeHorizontalProps {
  // value: number;
  hide: boolean;
}

const VolumeHorizontal: React.FC<VolumeHorizontalProps> = ({ hide }) => {
  const gain = useGainStore((state) => state.gainMain);

  useEffect(() => {}, [hide, gain]);
  return (
    <>
      <div
        className="absolute top-0 left-0 h-full bg-white/40  transition-all"
        style={{
          width: `${gain}%`,
          opacity: !hide ? 0 : 1,
        }}
      ></div>
    </>
  );
};

export default VolumeHorizontal;

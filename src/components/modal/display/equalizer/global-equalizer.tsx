import Tabs from "@/components/common/tabs";
import GlobalEqualizer from "@/components/tools/volume-panel/modules/equalizer-mixer/global-equalizer";
import React from "react";

interface GlobalEqualizerModalProps {
  height?: number;
}

const GlobalEqualizerModal: React.FC<GlobalEqualizerModalProps> = ({
  height,
}) => {
  return (
    <Tabs
      height={height}
      tabs={[
        { content: <GlobalEqualizer></GlobalEqualizer>, label: "", icon: "" },
      ]}
    ></Tabs>
  );
};

export default GlobalEqualizerModal;

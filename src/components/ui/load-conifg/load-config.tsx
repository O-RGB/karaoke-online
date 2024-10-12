import useConfigStore from "@/components/stores/config-store";
import { useLyrics } from "@/hooks/lyrics-hook";
import { setupLocalConfig } from "@/lib/local-storege/config";
import React, { useEffect } from "react";

interface LoadConfigProps {}

const LoadConfig: React.FC<LoadConfigProps> = ({}) => {
  const { setConfigLyrics } = useLyrics();
  const setConifg = useConfigStore((state) => state.setConfig);
  const load = async () => {
    const config = await setupLocalConfig();
    setConifg(config);

    if (config.lyrics) {
      setConfigLyrics(config.lyrics);
    }
  };
  useEffect(() => {
    load();
  }, []);
  return null;
};

export default LoadConfig;

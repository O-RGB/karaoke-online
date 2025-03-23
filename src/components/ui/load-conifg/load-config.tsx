import useConfigStore from "@/features/config/config-store";
import { setupLocalConfig } from "@/lib/local-storege/config";
import React, { useEffect } from "react";

interface LoadConfigProps {}

const LoadConfig: React.FC<LoadConfigProps> = ({}) => {
  const setConifg = useConfigStore((state) => state.setConfig);
  const load = async () => {
    const config = await setupLocalConfig();
    setConifg(config);
  };
  useEffect(() => {
    load();
  }, []);
  return null;
};

export default LoadConfig;

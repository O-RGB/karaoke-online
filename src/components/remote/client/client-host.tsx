import React from "react";
import Tabs from "@/components/common/tabs";
import PeerJsClientStartup from "./tabs/peerJs";

interface ClientHostRemoteProps {
  height?: number;
}

const ClientHostRemote: React.FC<ClientHostRemoteProps> = ({ height }) => {
  return (
    <Tabs
      height={height}
      tabs={[
        {
          content: <PeerJsClientStartup />,
          label: "ควบคุม",
        },
      ]}
    ></Tabs>
  );
};

export default ClientHostRemote;

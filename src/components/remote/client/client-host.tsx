import React, { useEffect, useState } from "react";
import { useQRCode } from "next-qrcode";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { RiRemoteControlFill } from "react-icons/ri";
import { FaUserCircle } from "react-icons/fa";
import { FiCopy, FiCheck } from "react-icons/fi";
import { usePeerHostStore } from "@/features/remote/store/peer-js-store";
import { remoteHost } from "@/config/value";
import { remoteRoutes } from "@/features/remote/routes";
import Button from "../../common/button/button";
import Label from "../../common/display/label";
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

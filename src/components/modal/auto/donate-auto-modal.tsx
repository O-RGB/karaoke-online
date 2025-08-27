import Tabs from "@/components/common/tabs";
import React from "react";
import DonateModal from "../donate-modal";

interface DonateAutoModalProps {
  height?: number;
}

const DonateAutoModal: React.FC<DonateAutoModalProps> = ({ height }) => {
  return (
    <Tabs
      height={height}
      tabs={[
        {
          content: <DonateModal></DonateModal>,
          label: "ผู้สนับสนุนใจดี",
        },
      ]}
    ></Tabs>
  );
};

export default DonateAutoModal;

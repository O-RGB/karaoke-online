import Tabs from "@/components/common/tabs";
import React from "react";
import { MdTextFields } from "react-icons/md";
import LyricsModal from "../lyrics-modal";
import EfficiencyDisplay from "./tabs/efficiency-display";
import { LuCpu } from "react-icons/lu";

interface DisplaySettingModalProps {}

const DisplaySettingModal: React.FC<DisplaySettingModalProps> = ({}) => {
  console.log("DisplaySettingModal render...");
  return (
    <>
      <Tabs
        tabs={[
          {
            content: <LyricsModal></LyricsModal>,
            label: "เนื้อเพลง",
            icon: <MdTextFields></MdTextFields>,
          },
          {
            content: <EfficiencyDisplay></EfficiencyDisplay>,
            label: "ประสิทธิภาพ",
            icon: <LuCpu></LuCpu>,
          },
        ]}
      ></Tabs>
    </>
  );
};

export default DisplaySettingModal;

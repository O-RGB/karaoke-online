import Tabs from "@/components/common/tabs";
import React from "react";
import { MdOutlineWidgets, MdTextFields } from "react-icons/md";
import LyricsModal from "../lyrics-modal";
import EfficiencyDisplay from "./tabs/efficiency-display";
import { LuCpu } from "react-icons/lu";
import WidgetsDisplay from "./tabs/widgets-display";

interface DisplaySettingModalProps {}

const DisplaySettingModal: React.FC<DisplaySettingModalProps> = ({}) => {
  return (
    <Tabs
      tabs={[
        {
          content: <LyricsModal></LyricsModal>,
          label: "เนื้อเพลง",
          icon: <MdTextFields></MdTextFields>,
        },
        {
          content: <WidgetsDisplay></WidgetsDisplay>,
          label: "วิดเจ็ต",
          icon: <MdOutlineWidgets></MdOutlineWidgets>,
        },
        // {
        //   content: <EfficiencyDisplay></EfficiencyDisplay>,
        //   label: "ประสิทธิภาพ",
        //   icon: <LuCpu></LuCpu>,
        // },
      ]}
    ></Tabs>
  );
};

export default DisplaySettingModal;

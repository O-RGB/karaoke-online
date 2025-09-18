import Tabs from "@/components/common/tabs";
import React from "react";
import AddDBFSong from "./tabs/add-dbf";
import AddUserSong from "./tabs/add-user-song";
import AddExtremeAndManage from "./tabs/add-extreme";
import AddApiSong from "./tabs/add-api";
import { PiMusicNotesPlusDuotone } from "react-icons/pi";
import { GoFileZip } from "react-icons/go";
import { FaComputer } from "react-icons/fa6";
import { FaServer } from "react-icons/fa";

interface AppendSongModalProps {
  height?: number;
}

const AppendSongModal: React.FC<AppendSongModalProps> = ({ height }) => {
  return (
    <Tabs
      height={height}
      onTabChange={() => {}}
      tabs={[
        {
          icon: <PiMusicNotesPlusDuotone></PiMusicNotesPlusDuotone>,
          label: "เพิ่มเพลง",
          content: <AddUserSong />,
        },
        {
          icon: <FaServer></FaServer>,
          label: "เพลง API",
          content: <AddApiSong></AddApiSong>,
        },
        {
          icon: <FaComputer></FaComputer>,
          label: "เล่นจากเครื่องคุณ",
          content: <AddDBFSong></AddDBFSong>,
        },
        {
          icon: <GoFileZip></GoFileZip>,
          label: "เพิ่มจาก Extreme",
          content: <AddExtremeAndManage></AddExtremeAndManage>,
        },
      ]}
    ></Tabs>
  );
};

export default AppendSongModal;

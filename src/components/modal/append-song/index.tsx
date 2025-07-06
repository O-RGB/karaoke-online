import Tabs from "@/components/common/tabs";
import React from "react";
import { TbMicrophone2 } from "react-icons/tb";
import AddDBFSong from "./tabs/add-dbf";
import AddUserSong from "./tabs/add-user-song";
import AlertWapper from "@/components/common/alert/alert-wapper";
import AddExtreme from "./tabs/add-extreme";
import ManagePythonIndexData from "./tabs/add-extreme";
import AddExtremeAndManage from "./tabs/add-extreme";

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
          icon: <TbMicrophone2></TbMicrophone2>,
          label: "เพิ่มเพลง",
          content: <AddUserSong />,
        },
        {
          icon: <TbMicrophone2></TbMicrophone2>,
          label: "เล่นจากเครื่องคุณ",
          content: <AddDBFSong></AddDBFSong>,
        },
        {
          icon: <TbMicrophone2></TbMicrophone2>,
          label: "เพิ่มจาก Extreme",
          content: <AddExtremeAndManage></AddExtremeAndManage>,
        },
      ]}
    ></Tabs>
  );
};

export default AppendSongModal;

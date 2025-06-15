import Tabs from "@/components/common/tabs";
import React from "react";
import { TbMicrophone2 } from "react-icons/tb";
import AddDBFSong from "./tabs/add-dbf";
import AddUserSong from "./tabs/add-user-song";

interface AppendSongModalProps {}

const AppendSongModal: React.FC<AppendSongModalProps> = ({}) => {
  return (
    <>
      <Tabs
        onTabChange={() => {}}
        tabs={[
          {
            icon: <TbMicrophone2></TbMicrophone2>,
            label: "เพิ่มเพลง",
            content: <AddUserSong />,
          },
          {
            icon: <TbMicrophone2></TbMicrophone2>,
            label: "เพิ่มจาก DBF",
            content: <AddDBFSong />,
          },
        ]}
      ></Tabs>
    </>
  );
};

export default AppendSongModal;

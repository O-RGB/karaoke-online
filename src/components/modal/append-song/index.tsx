import Tabs from "@/components/common/tabs";
import React from "react";
import { TbMicrophone2 } from "react-icons/tb";
import AddDBFSong from "./tabs/add-dbf";

interface AppendSongModalProps {}

const AppendSongModal: React.FC<AppendSongModalProps> = ({}) => {
  return (
    <>
      <Tabs
        onTabChange={() => {}}
        tabs={[
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

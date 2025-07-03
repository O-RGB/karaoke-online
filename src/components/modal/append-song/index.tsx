import Tabs from "@/components/common/tabs";
import React from "react";
import { TbMicrophone2 } from "react-icons/tb";
import AddDBFSong from "./tabs/add-dbf";
import AddUserSong from "./tabs/add-user-song";
import AlertWapper from "@/components/common/alert/alert-wapper";
import AddExtreme from "./tabs/add-extreme/we";
import ManagePythonIndexData from "./tabs/add-extreme/we";
import AddExtremeAndManage from "./tabs/add-extreme/we";

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
            label: "เล่นจากเครื่องคุณ",
            content: (
              <AlertWapper>
                <AddDBFSong></AddDBFSong>
              </AlertWapper>
            ),
          },
          {
            icon: <TbMicrophone2></TbMicrophone2>,
            label: "เพิ่มจาก Extreme",
            content: (
              <AlertWapper>
                <AddExtremeAndManage></AddExtremeAndManage>
              </AlertWapper>
            ),
          },
        ]}
      ></Tabs>
    </>
  );
};

export default AppendSongModal;

import Tabs from "@/components/common/tabs";
import React from "react";
import { TbMicrophone2 } from "react-icons/tb";
import { FaDatabase, FaGoogleDrive, FaUser } from "react-icons/fa";
import { LuDatabase, LuDelete } from "react-icons/lu";
import UserDatabase from "./tabs/user-database";
import ResetDatabase from "./tabs/reset-database";
import { GrPowerReset } from "react-icons/gr";

interface DataStoresModalProps {
  height?: number;
}

const DataStoresModal: React.FC<DataStoresModalProps> = ({ height }) => {
  return (
    <Tabs
      height={height}
      tabs={[
        {
          content: <UserDatabase></UserDatabase>,
          label: "ฐานข้อมูลผู้ใช้",
          icon: <LuDatabase></LuDatabase>,
        },
        {
          content: <ResetDatabase></ResetDatabase>,
          label: "รีเซ็ตระบบ",
          icon: <GrPowerReset></GrPowerReset>,
        },
      ]}
    ></Tabs>
  );
};

export default DataStoresModal;

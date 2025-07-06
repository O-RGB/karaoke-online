import Tabs from "@/components/common/tabs";
import React from "react";
import { TbMicrophone2 } from "react-icons/tb";
import { FaGoogleDrive, FaUser } from "react-icons/fa";
import { LuDelete } from "react-icons/lu";
import UserDatabase from "./tabs/user-database";
import ResetDatabase from "./tabs/reset-database";

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
          icon: <FaUser></FaUser>,
        },
        {
          content: <ResetDatabase></ResetDatabase>,
          label: "จัดการฐานข้อมูล",
          icon: <FaUser></FaUser>,
        },
      ]}
    ></Tabs>
  );
};

export default DataStoresModal;

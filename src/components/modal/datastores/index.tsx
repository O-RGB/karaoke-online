import Tabs from "@/components/common/tabs";
import React from "react";
import ExtremeDataStore from "./tabs/extreme-datastore";
import { TbMicrophone2 } from "react-icons/tb";
import UserSongDataStore from "./tabs/user-song-datastore";
import { FaUser } from "react-icons/fa";
import { LuDelete } from "react-icons/lu";
import ResetDatastore from "./tabs/reset-datastore";

interface DataStoresModalProps {}

const DataStoresModal: React.FC<DataStoresModalProps> = ({}) => {
  return (
    <>
      <Tabs
        tabs={[
          {
            content: <UserSongDataStore></UserSongDataStore>,
            label: "ฐานข้อมูลผู้ใช้",
            icon: <FaUser></FaUser>,
          },
          {
            content: <ExtremeDataStore></ExtremeDataStore>,
            label: "ฐานข้อมูล Extreme",
            icon: <TbMicrophone2></TbMicrophone2>,
          },
          {
            content: <ResetDatastore></ResetDatastore>,
            label: "รีเช็ตฐานข้อมูล",
            icon: <LuDelete></LuDelete>,
          },
        ]}
      ></Tabs>
    </>
  );
};

export default DataStoresModal;

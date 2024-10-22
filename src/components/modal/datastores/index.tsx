import Tabs from "@/components/common/tabs";
import React from "react";
import { TbMicrophone2 } from "react-icons/tb";
import { FaGoogleDrive, FaUser } from "react-icons/fa";
import { LuDelete } from "react-icons/lu";
import ResetDatastore from "./tabs/reset-datastore";
import DatabaseList from "./common-datastores";
import {
  getAllKeysSong,
  getAllKeysUserSong,
  getSongByKey,
} from "@/lib/storage/song";
import { getAllKeysDrive, getSongDrive } from "@/lib/storage/drive";

interface DataStoresModalProps {}

const DataStoresModal: React.FC<DataStoresModalProps> = ({}) => {
  return (
    <>
      <Tabs
        tabs={[
          {
            content: (
              <DatabaseList
                getKeysDatabase={getAllKeysUserSong}
                getFileByKey={(key) => getSongByKey(key, true)}
                tracklistStores={["CUSTOM"]}
                label="โฟลเดอร์"
                selectedLabel="ไฟล์เพลง"
              ></DatabaseList>
            ),
            label: "ฐานข้อมูลผู้ใช้",
            icon: <FaUser></FaUser>,
          },
          {
            content: (
              <DatabaseList
                getKeysDatabase={getAllKeysDrive}
                getFileByKey={(key) => getSongDrive(key)}
                tracklistStores={["DRIVE"]}
                label="โฟลเดอร์ชั่วคราว"
                selectedLabel="ไฟล์เพลง"
              ></DatabaseList>
            ),
            label: "ฐานข้อมูล Drive",
            icon: <FaGoogleDrive></FaGoogleDrive>,
          },
          {
            content: (
              <DatabaseList
                label="โฟลเดอร์"
                getKeysDatabase={getAllKeysSong}
                getFileByKey={(key) => getSongByKey(key, false)}
                tracklistStores={["EXTHEME"]}
                selectedLabel="ไฟล์เพลง"
              ></DatabaseList>
            ),
            label: "ฐานข้อมูล Extreme",
            icon: <TbMicrophone2></TbMicrophone2>,
          },
          {
            content: <ResetDatastore></ResetDatastore>,
            label: "รีเช็ต Next Karaoke",
            icon: <LuDelete></LuDelete>,
          },
        ]}
      ></Tabs>
    </>
  );
};

export default DataStoresModal;

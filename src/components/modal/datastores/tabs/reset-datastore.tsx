import Button from "@/components/common/button/button";
import { destryoAllCredential } from "@/lib/local-storege/local-storage";
import { deleteAllStores, deleteDatabase, initDatabase } from "@/utils/database/db";
import React from "react";
import { CiSettings } from "react-icons/ci";

interface ResetDatastoreProps {}

const ResetDatastore: React.FC<ResetDatastoreProps> = ({}) => {
  return (
    <>
      ยังไม่ว่างทำ UI
      <span className="text-red-500">
        ถ้ากดปุ่มนี้ระบบจะ Reset ทุกอย่างในแอป (หายทั้งหมด)
      </span>
      <Button
        onClick={async () => {
          const check = await deleteDatabase();
          if (check) {
            await initDatabase()
            destryoAllCredential();
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          }
        }}
        blur=""
        color="red"
        icon={<CiSettings className="text-white"></CiSettings>}
        iconPosition="left"
        className="text-white"
      >
        DELETE ALL DATA
      </Button>
    </>
  );
};

export default ResetDatastore;

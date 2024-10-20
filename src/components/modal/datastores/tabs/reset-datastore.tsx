import Button from "@/components/common/button/button";
import { destryoAllCredential } from "@/lib/local-storege/local-storage";
import {
  deleteAllStores,
  deleteDatabase,
  initDatabase,
} from "@/utils/database/db";
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
          try {
            // Close any open connections (you need to implement this in your code if not already done)
            // closeDatabaseConnections();

            const check = await deleteDatabase(); // Try to delete the database
            if (check) {
              console.log("Database deleted successfully.");

              // If the deletion succeeds, initialize the database and destroy credentials
              await initDatabase();
              destryoAllCredential();

              // Reload the page after a delay
              setTimeout(() => {
                window.location.reload();
              }, 1000);
            }
          } catch (error) {
            console.error("Error deleting database:", error);

            // Handle database deletion being blocked
            alert("เกิดข้อผิดพลาด คุณอาจต้องกลับมา Reset ฐานข้อมูลอีกครั้ง!");
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

import Button from "@/components/common/button/button";
import Modal from "@/components/common/modal";
import { destryoAllCredential } from "@/lib/local-storege/local-storage";
import { closeDatabaseConnections, deleteDatabase } from "@/utils/database/db";
import React, { ReactNode, useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { CiSettings } from "react-icons/ci";
import { FaCheck } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { IoReload } from "react-icons/io5";

interface ResetDatastoreProps {}

const ResetDatastore: React.FC<ResetDatastoreProps> = ({}) => {
  const [message, setMessage] = useState<ReactNode | undefined>(undefined);
  const [error, setError] = useState<boolean | undefined>(undefined);
  return (
    <>
      <Modal
        isOpen={message !== undefined}
        width="300px"
        height={"100px"}
        title={
          error === undefined
            ? "กำลังรอ"
            : error === true
            ? "ไม่สำเร็จ"
            : "สำเร็จ"
        }
        closable={false}
      >
        <div className="w-full flex flex-col gap-2">
          {message}
          <div className="flex flex-col h-full w-full justify-end items-end">
            {error !== undefined && (
              <Button
                onClick={() => {
                  window.location.reload();
                }}
                padding="p-2"
                blur={false}
                icon={<IoReload></IoReload>}
                color={error === undefined || error === false ? "blue" : "red"}
                className="text-white  h-8 w-32"
                iconPosition="left"
              >
                รีโหลดหน้าจอ
              </Button>
            )}
          </div>
        </div>
      </Modal>

      <div className="h-[400px] flex flex-col gap-2 items-center justify-center ">
        <span className="text-red-500 w-full lg:w-1/2">
          เมื่อเกิดข้อผิดพลาดจนไม่สามารถแก้ไขได้
          ให้ปุ่มนี้เป็นปุ่มสุดท้ายที่ต้องกด ระบบจะถูกรีเช็ตทั้งหมด
          <br /> - การตั้งค่า
          <br />
          - เพลง
          <br />- รูปพื้นหลัง
        </span>
        <Button
          onClick={async () => {
            const closeDatabase = await closeDatabaseConnections(); // ปิดการเชื่อมต่อฐานข้อมูลทั้งหมด
            setMessage(
              <span className="flex gap-2 items-center">
                <AiOutlineLoading3Quarters className="animate-spin text-xs"></AiOutlineLoading3Quarters>
                <span>กำลังปิดฐานข้อมูล...</span>
              </span>
            );

            if (!closeDatabase) {
              setMessage(
                <span className="flex gap-2 items-center">
                  <IoMdClose className="text-xs"></IoMdClose>
                  <span>ปิดฐานข้อมูลไม่สำเร็จ</span>
                </span>
              );
            } else {
              setTimeout(async () => {
                setMessage(
                  <span className="flex gap-2 items-center">
                    <AiOutlineLoading3Quarters className="animate-spin text-xs"></AiOutlineLoading3Quarters>
                    <span>เริ่มการลบฐานข้อมูล</span>
                  </span>
                );
                const request = deleteDatabase();

                request.onsuccess = () => {
                  destryoAllCredential();
                  setMessage(
                    <span className="flex gap-2 items-center">
                      <FaCheck className="text-xs"></FaCheck>
                      <span>ลบฐานข้อมูลสำเร็จ</span>
                    </span>
                  );
                  setError(false);
                };
                request.onerror = (event) => {
                  setMessage(
                    <span className="flex gap-2 items-center">
                      <IoMdClose className="text-xs"></IoMdClose>
                      <span>
                        ไม่สามารถลบฐานข้อมูลได้
                        กรุณารีโหลดหน้าจอแล้วลองใหม่อีกครั้ง{" "}
                        {JSON.stringify(event)}
                      </span>
                    </span>
                  );

                  setError(true);
                };
              }, 1000);
            }
          }}
          blur=""
          color="red"
          icon={<CiSettings className="text-white"></CiSettings>}
          iconPosition="left"
          className="text-white"
        >
          รีเช็ต Next Karaoke
        </Button>
      </div>
    </>
  );
};

export default ResetDatastore;

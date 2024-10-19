import Button from "@/components/common/button/button";
import Modal from "@/components/common/modal";
import React from "react";

interface IgnoreDupFileProps extends Omit<ModalProps, "children"> {
  onIgnore?: () => void;
}

const IgnoreDupFile: React.FC<IgnoreDupFileProps> = ({
  onIgnore,
  ...props
}) => {
  return (
    <>
      <Modal title="ตรวจพบเพลงซ้ำ" {...props}>
        <div className="w-full flex flex-col gap-2">
          เพิ่มโดยไม่สนใจไฟล์เพลงซ้ำ
          <div className="flex gap-2 items-end justify-end">
            <Button
              onClick={onIgnore}
              className="h-6 text-white"
              padding="px-4 py-4"
              blur={false}
              color="gray"
            >
              เพิ่มทั้งหมด
            </Button>
            <Button
              onClick={props.onClose}
              className="h-6 text-white"
              padding="px-4 py-4"
              blur={false}
              color="blue"
            >
              ปิด
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default IgnoreDupFile;

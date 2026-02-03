import Button from "@/components/common/button/button";
import { useSynthesizerEngine } from "@/features/engine/synth-store";
import { Menu, MenuButton, MenuItem } from "@szhsin/react-menu";
import React, { useState } from "react";
import { BsMicFill } from "react-icons/bs";
import { FaMicrophone, FaMusic, FaFolder } from "react-icons/fa";
import { MdRadioButtonChecked } from "react-icons/md";
import Modal from "@/components/common/modal";
import RecordingsModal from "@/components/modal/recordings-modal";
import "@szhsin/react-menu/dist/index.css";
import "@szhsin/react-menu/dist/transitions/zoom.css";

interface RecordStatusProps {}

const RecordStatus: React.FC<RecordStatusProps> = ({}) => {
  const engine = useSynthesizerEngine((state) => state.engine);
  const [isRecording, setIsRecording] = useState(false);
  const [openRecordlist, setRacordlist] = useState<boolean>(false);

  const handleStartRecording = async (includeMicrophone: boolean) => {
    if (!engine) return;
    try {
      await engine.startRecording?.({ includeMicrophone });
      setIsRecording(true);
    } catch (error) {
      console.error("ไม่สามารถเริ่มการบันทึกได้:", error);
      alert(
        `ไม่สามารถเริ่มการบันทึกได้: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  };

  const handleStopRecording = async () => {
    if (!engine) return;
    try {
      await engine.stopRecording?.();
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการหยุดบันทึก:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      alert(`การบันทึกเสียงล้มเหลว: ${errorMessage}`);
    } finally {
      setIsRecording(false);
    }
  };

  const handleRecordButtonClick = () => {
    if (isRecording) {
      handleStopRecording();
    }
  };

  const buttonStyle: any = {
    className: "!rounded-none aspect-square",
    size: "xs",
    color: "white",
    variant: "ghost",
  };

  return (
    <>
      <Modal
        isOpen={openRecordlist}
        onClose={() => setRacordlist(false)}
        title="บันทึก"
      >
        <RecordingsModal></RecordingsModal>
      </Modal>

      {isRecording ? (
        <Button
          {...buttonStyle}
          onClick={handleRecordButtonClick}
          icon={<MdRadioButtonChecked className="text-red-400 animate-pulse" />}
        >
          <div className="absolute inset-0 bg-red-500/20 animate-ping rounded-full"></div>
        </Button>
      ) : (
        <Menu
          transition
          className={"h-full"}
          boundingBoxPadding="10 10 10 10"
          menuButton={
            <Button {...buttonStyle} icon={<BsMicFill className="" />} />
          }
        >
          <MenuItem
            className={"text-sm"}
            onClick={() => handleStartRecording(true)}
          >
            <FaMicrophone className="mr-2" /> บันทึกเสียงร้อง + ดนตรี
          </MenuItem>
          <MenuItem
            className={"text-sm"}
            onClick={() => handleStartRecording(false)}
          >
            <FaMusic className="mr-2" /> บันทึกเฉพาะดนตรี
          </MenuItem>
          <MenuItem className={"text-sm"} onClick={() => setRacordlist(true)}>
            <FaFolder className="mr-2" /> บันทึกแล้ว
          </MenuItem>
        </Menu>
      )}
    </>
  );
};

export default RecordStatus;

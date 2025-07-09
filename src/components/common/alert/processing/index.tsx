import React from "react";
import Modal from "@/components/common/modal";
import Button from "@/components/common/button/button";
import ProgressBar from "@/components/common/progress-bar";
import { AiOutlineLoading } from "react-icons/ai";
import { FaCheckCircle } from "react-icons/fa";
import { MdError, MdClose } from "react-icons/md";
import { BiExit } from "react-icons/bi";

export type ProcessingVariant = "processing" | "success" | "error";

export interface ProcessingStatus {
  text?: string;
  working?: string;
  progress?: number;
}

export interface ProcessingDialogProps {
  isOpen?: boolean;
  variant?: ProcessingVariant;
  title?: string;
  status?: ProcessingStatus;
  onClose?: () => void;
  onCancel?: () => void;
}

const variantConfig = {
  processing: {
    Icon: AiOutlineLoading,
    iconClass: "text-gray-500 animate-spin",
    color: "default",
  },
  success: {
    Icon: FaCheckCircle,
    iconClass: "text-green-500",
    color: "green",
  },
  error: { Icon: MdError, iconClass: "text-red-500", color: "red" },
};

const ProcessingDialog: React.FC<ProcessingDialogProps> = ({
  isOpen = false,
  variant = "processing",
  title,
  status,
  onClose,
  onCancel,
}) => {
  const { Icon, iconClass, color } = variantConfig[variant];

  const renderStatusContent = () => {
    return (
      <div className="w-full space-y-1">
        <span className="">
          <span className="inline-block align-middle pr-1.5 -mt-0.5">
            <Icon className={`${iconClass}`} />
          </span>
          {status?.text}
        </span>
        <ProgressBar progress={status?.progress ?? 0} color={color as any} />
        <span className=" block text-xs text-gray-500">{status?.working}</span>
      </div>
    );
  };

  return (
    <Modal
      width={400}
      height={180}
      isOpen={isOpen}
      onClose={onClose}
      closable={false}
      noResize
      noFull
      noMax
      noMove
      noMin
      title={title ?? "กำลังประมวลผล"}
      fitHeight
      index={999}
    >
      <div className="p-4 flex flex-col gap-2 h-full">
        <div className="flex-1 text-sm">{renderStatusContent()}</div>

        <div className="flex gap-2 justify-end items-end">
          {variant === "processing" && onCancel && (
            <Button
              color="gray"
              className="h-9"
              iconPosition="left"
              icon={<MdClose />}
              onClick={onCancel}
            >
              ยกเลิก
            </Button>
          )}

          <Button
            className="h-9"
            color={variant === "success" ? "blue" : "gray"}
            onClick={onClose}
            disabled={variant === "processing"}
            icon={<BiExit />}
            iconPosition="left"
          >
            ปิด
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ProcessingDialog;

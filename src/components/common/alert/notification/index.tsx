import React, { cloneElement } from "react";
import Modal from "../../modal";
import Button from "../../button/button";
import { BiCheck } from "react-icons/bi";
import { MdClose, MdError } from "react-icons/md";
import { IoWarning } from "react-icons/io5";
import { FaCheckCircle, FaInfoCircle } from "react-icons/fa";

export type AlertVariant = "success" | "error" | "warning" | "info";

export interface AlertDialogProps {
  open?: boolean;
  onOk?: () => void;
  okLabel?: string;
  onCancel?: () => void;
  canelLabel?: string;
  title?: string;
  description?: React.ReactNode;
  variant?: AlertVariant;
}

const variantConfig = {
  success: {
    Icon: FaCheckCircle,
    iconClass: "text-green-500",
    buttonColor: "green",
  },
  error: {
    Icon: MdError,
    iconClass: "text-red-500",
    buttonColor: "red",
  },
  warning: {
    Icon: IoWarning,
    iconClass: "text-yellow-500",
    buttonColor: "blue",
  },
  info: {
    Icon: FaInfoCircle,
    iconClass: "text-blue-500",
    buttonColor: "blue",
  },
};

const AlertDialog: React.FC<AlertDialogProps> = ({
  onCancel,
  onOk,
  okLabel,
  canelLabel,
  open = false,
  title,
  description,
  variant = "warning",
}) => {
  const { Icon, iconClass, buttonColor } = variantConfig[variant];

  return (
    <Modal
      maxWidth={400}
      height={180}
      isOpen={open}
      onClose={onCancel}
      noResize={false}
      closable={false}
      noFull={true}
      noMax={true}
      noMove={true}
      noMin={true}
      title={title}
      fitHeight
      index={99}
    >
      <div className="p-4 flex flex-col gap-2 h-full">
        <div className="flex gap-3  h-full">
          {/* 6. แสดงผล Icon และ Style แบบ Dynamic */}
          <div className="w-10">
            <Icon className={`${iconClass} text-4xl`} />
          </div>

          <div className="flex-1">{description}</div>
        </div>

        <div className="flex gap-2 justify-end items-end">
          <Button
            color="gray"
            className="h-9"
            iconPosition="left"
            icon={<MdClose className="text-lg" />}
            onClick={onCancel}
          >
            {canelLabel ? canelLabel : "ยกเลิก"}
          </Button>
          <Button
            className="h-9"
            color={buttonColor as ColorType}
            iconPosition="left"
            icon={<BiCheck className="text-lg" />}
            onClick={onOk}
          >
            {okLabel ? okLabel : "ตกลง"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AlertDialog;

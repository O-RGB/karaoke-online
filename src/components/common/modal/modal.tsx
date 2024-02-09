import { Modal } from "antd";
import React from "react";
import ButtonCommon from "../button";

interface ModalCommonProps {
  onOk?: (value?: string) => void;
  onCancel?: () => void;
  title?: string;
  open?: boolean;
  value?: string;
  children?: React.ReactNode;
}

const ModalCommon: React.FC<ModalCommonProps> = ({
  onOk,
  onCancel,
  title,
  open,
  children,
  value,
}) => {
  const rounded = "rounded-xl";
  const bgOverLay = "bg-black/30";
  const blur = "backdrop-blur-md";
  const textColor = "text-white";
  const borderColor = "border-white/30 ";
  return (
    <Modal open={open} onCancel={onCancel} footer={<></>}>
      <div
        className={`${rounded} ${bgOverLay} ${blur} ${textColor} ${borderColor} p-3`}
      >
        <div className="flex items-center text-lg">{title}</div>
        <div className="p-3">{children}</div>
        <div className="flex w-full justify-end items-end">
          <div className="flex gap-2">
            <ButtonCommon onClick={() => onOk?.(value)}>OK</ButtonCommon>
            <ButtonCommon onClick={onCancel}>Close</ButtonCommon>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ModalCommon;

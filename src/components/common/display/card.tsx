import React from "react";

interface CardCommonProps {
  /** เนื้อหาภายใน card */
  children: React.ReactNode;
  /** class เพิ่มเติม เช่น margin/padding */
  className?: string;
}

const CardCommon: React.FC<CardCommonProps> = ({ children, className }) => {
  return (
    <div
      className={`w-full rounded-lg bg-white p-8 shadow-md ${className ?? ""}`}
    >
      {children}
    </div>
  );
};

export default CardCommon;

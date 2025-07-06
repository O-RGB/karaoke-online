import Tags from "@/components/common/display/tags";
import React from "react";
import { FaUser } from "react-icons/fa";

// กำหนด Type ของ props ให้ชัดเจนขึ้น
// เพิ่ม size เข้าไป โดยเป็น optional
export interface SourceTagProps {
  from?: TracklistFrom;
  size?: "lg" | "sm";
}

export function SourceTag({ from, size }: SourceTagProps) {
  // Object สำหรับเก็บ class ของแต่ละขนาด
  const sizeStyles = {
    sm: "w-[25px] h-[25px]",
    lg: "w-[35px] h-[35px]",
  };

  // Class ที่เป็นค่าเริ่มต้น (auto responsive)
  const defaultAutoSize = "w-[25px] lg:w-[35px] h-[25px] lg:h-[35px]";

  // เลือก class ที่จะใช้: ถ้ามี prop 'size' ให้ใช้ค่าจาก object, ถ้าไม่มีให้ใช้ค่า default
  const containerSizeClass = size ? sizeStyles[size] : defaultAutoSize;

  // Refactor โค้ดเพื่อลดความซ้ำซ้อน
  // สร้างตัวแปรเก็บ content ที่จะแสดงผล
  let tagContent: React.ReactNode = null;

  if (from === "EXTHEME") {
    tagContent = (
      <img src="/icon/ke.ico" alt="EXTHEME" className="w-full h-full" />
    );
  } else if (from === "DRIVE") {
    tagContent = (
      <>
        <span className="absolute -bottom-1 -left-1 p-0.5 bg-white rounded-full flex items-center justify-center">
          <FaUser className="text-xs text-green-500" />
        </span>
        <img src="/icon/gd.ico" alt="DRIVE" className="w-full h-full" />
      </>
    );
  } else if (from === "DRIVE_EXTHEME") {
    tagContent = (
      <img src="/icon/gd.ico" alt="DRIVE_EXTHEME" className="w-full h-full" />
    );
  } else if (from === "CUSTOM") {
    tagContent = <FaUser className="text-green-500 w-full h-full" />;
  }

  // ถ้าไม่มี content ที่ตรงเงื่อนไข ก็ไม่ต้อง render อะไรเลย
  if (!tagContent) {
    return null; // หรือ <></>
  }

  // Render JSX โดยใช้โครงสร้างร่วมกัน และเปลี่ยนแค่ content ด้านใน
  return (
    <div className={`flex ${containerSizeClass}`}>
      <Tags
        color="white"
        className="!border-none flex items-center justify-center relative"
      >
        {tagContent}
      </Tags>
    </div>
  );
}

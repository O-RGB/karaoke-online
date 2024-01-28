import React, { useEffect } from "react";
import InputCommon from "../../common/input";
import useDesktop from "../../../hooks/useDesktop";

interface MobileInputProps {
  search?: string;
  bgOverLay: string;
  blur: string;
  rounded: string;
  textColor: string;
  borderColor: string;
}

const MobileInput: React.FC<MobileInputProps> = ({
  search,
  bgOverLay,
  blur,
  rounded,
  textColor,
  borderColor,
}) => {
  const desktop = useDesktop();

  useEffect(() => {}, [search]);

  return (
    <>
      <div className="flex gap-2">
        <InputCommon
          className={`${blur} ${rounded} ${textColor} !bg-black/25 ${borderColor}`}
          style={{
            background: "transparent",
          }}
          onPressEnter={() => {
            console.log("input enter");
            desktop.setSearchInput(false);
          }}
          value={search}
          placeholder="ค้นหา"
        ></InputCommon>
        <div
          className={`px-4 flex justify-center items-center bg-white/10 ${borderColor} ${blur} ${textColor} ${rounded}`}
        >
          ตกลง
        </div>
        <div
          onClick={() => {
            desktop.setSearchInput(false);
          }}
          className={`px-4 flex justify-center items-center bg-white/10 ${borderColor} ${blur} ${textColor}  ${rounded}`}
        >
          ยกเลิก
        </div>
      </div>
    </>
  );
};

export default MobileInput;

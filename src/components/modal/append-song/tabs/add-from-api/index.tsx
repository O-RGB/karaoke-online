import Label from "@/components/common/display/label";
import SwitchRadio from "@/components/common/input-data/switch/switch-radio";
import useConfigStore from "@/features/config/config-store";
import React, { useState } from "react";

interface AddFromApiProps {}

const AddFromApi: React.FC<AddFromApiProps> = ({}) => {
  const setConfig = useConfigStore((state) => state.setConfig);
  const config = useConfigStore((state) => state.config);
  //   const [isApiEnabled, setIsApiEnabled] = useState<string>("on");

  const onChange = (value: string) => {
    // setIsApiEnabled(value);
    setConfig({ system: { api: value === "on" } });
  };

  if (!config) return <></>;
  const apiEnabled = config.system?.api;
  return (
    <>
      <Label>โหลดเพลงจาก API</Label>
      <SwitchRadio
        value={apiEnabled ? "on" : "off"}
        onChange={onChange}
        options={[
          {
            children: "เปิดใช้งาน",
            value: "on",
          },
          {
            children: "ปิดใช้งาน",
            value: "off",
          },
        ]}
      ></SwitchRadio>
    </>
  );
};

export default AddFromApi;

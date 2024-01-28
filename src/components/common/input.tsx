import { Input, InputProps } from "antd";
import React from "react";

interface InputCommonProps extends InputProps {}

const InputCommon: React.FC<InputCommonProps> = ({ ...props }) => {
  return (
    <>
      <Input {...props}></Input>
    </>
  );
};

export default InputCommon;

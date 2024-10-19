import React, { InputHTMLAttributes } from "react";

interface InputNumberProps extends InputHTMLAttributes<HTMLInputElement> {}

const InputNumber: React.FC<InputNumberProps> = ({ ...props }) => {
  return (
    <>
      <input
        {...props}
        type="number"
        className="w-full bg-transparent border rounded-md focus:outline-none p-1 border-blue-500 disabled:border-gray-300 disabled:text-gray-300 duration-300"
      />
    </>
  );
};

export default InputNumber;

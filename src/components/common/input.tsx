import React from "react";

interface InputCommonProps extends InputProps {}

const Input: React.FC<InputCommonProps> = ({ border = "border", ...props }) => {
  var inputStyle = `${border} text-white p-2`;
  var removeFocus = "focus-visible:outline-none";
  var shape = "rounded-md";
  return (
    <>
      <input
        {...props}
        className={[inputStyle, removeFocus, shape, ""].join(" ")}
        type="text"
      />
    </>
  );
};

export default Input;

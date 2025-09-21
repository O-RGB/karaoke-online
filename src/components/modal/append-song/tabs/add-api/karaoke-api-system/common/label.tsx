import React, { LabelHTMLAttributes } from "react";

interface LabelCommonProps extends LabelHTMLAttributes<HTMLLabelElement> {}

const LabelCommon: React.FC<LabelCommonProps> = ({ ...props }) => {
  return (
    <label
      className="block text-xs font-light mb-1 text-gray-500"
      {...props}
    ></label>
  );
};

export default LabelCommon;

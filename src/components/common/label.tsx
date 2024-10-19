import React from "react";

interface LabelProps {
  children: React.ReactNode;
  className?: string;
  headClass?: string;
}

const Label: React.FC<LabelProps> = ({ children, className, headClass }) => {
  return (
    <span className={` text-xs text-gray-400 flex gap-1.5 items-center`}>
      {headClass && (
        <span
          className={`inline-block w-[7px] h-[7px] rounded-full ${headClass} `}
        ></span>
      )}
      <span className={`${className}`}>{children}</span>
    </span>
  );
};

export default Label;

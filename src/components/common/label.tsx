import React from "react";

interface LabelProps {
  children: React.ReactNode;
  className?: string;
}

const Label: React.FC<LabelProps> = ({ children, className }) => {
  return (
    <span className={`${className} text-xs text-gray-400`}>{children}</span>
  );
};

export default Label;

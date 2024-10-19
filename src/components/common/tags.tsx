import React, { ReactNode } from "react";

interface TagsProps {
  children: ReactNode;
  className?: string;
  color?: ColorType;
}

const Tags: React.FC<TagsProps> = ({ children, className, color }) => {
  let colorStyle = "bg-blue-500 border-blue-500";
  if (color === "amber") {
    colorStyle = "bg-amber-500 border-amber-500";
  } else if (color === "blue") {
    colorStyle = "bg-blue-500 border-blue-500";
  } else if (color === "green") {
    colorStyle = "bg-green-500 border-green-500";
  } else if (color === "red") {
    colorStyle = "bg-red-500 border-red-500";
  } else if (color === "white") {
    colorStyle = "bg-white border-gray-500";
  } else if (color === "yellow") {
    colorStyle = "bg-yellow-500 border-yellow-500";
  } else if (color === "gray") {
    colorStyle = "bg-gray-500 border-gray-500";
  }

  return (
    <span
      className={`p-1 text-xs rounded-md text-nowrap w-fit border text-white ${colorStyle} ${className}`}
    >
      {children}
    </span>
  );
};

export default Tags;

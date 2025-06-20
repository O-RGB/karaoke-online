import React from "react";

type ProgressBarProps = {
  progress: number;
  title?: string;
};

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, title }) => {
  const normalizedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className="pt-1 relative">
      <div className="w-full bg-gray-200 rounded-md h-5 ">
        <div
          className="bg-blue-600 h-5 rounded-md transition-all duration-300"
          style={{ width: `${normalizedProgress}%` }}
        ></div>
      </div>
      <div className="absolute flex justify-between text-xs">
        <span>{title}</span>
        {/* <span>{normalizedProgress}%</span> */}
      </div>
    </div>
  );
};

export default ProgressBar;

import React from "react";

type ProgressBarProps = {
  progress: number;
  title?: string;
  color?: ColorType;
};

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  title,
  color,
}) => {
  const normalizedProgress = Math.min(Math.max(progress, 0), 100);

  let bgColor: string = "bg-blue-600";

  switch (color) {
    case "amber":
      bgColor = "bg-amber-600";
      break;
    case "blue":
      bgColor = "bg-blue-600";
      break;
    case "gray":
      bgColor = "bg-gray-600";
      break;
    case "green":
      bgColor = "bg-green-600";
      break;
    case "red":
      bgColor = "bg-red-600";
      break;
    case "white":
      bgColor = "bg-white-600";
      break;
    case "yellow":
      bgColor = "bg-yellow-600";
      break;

    default:
      break;
  }

  return (
    <div className="pt-1 relative">
      <div className="w-full bg-gray-200 rounded-md h-5 ">
        <div
          className={`${bgColor} h-5 rounded-md transition-all duration-300`}
          style={{ width: `${normalizedProgress}%` }}
        ></div>
      </div>
      <div className="absolute flex justify-between text-xs">
        <span>{title}</span>
      </div>
    </div>
  );
};

export default ProgressBar;

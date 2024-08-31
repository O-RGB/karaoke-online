import React from "react";

interface ButtonCommonProps extends ButtonProps {}

const Button: React.FC<ButtonCommonProps> = ({
  icon,
  color = "default",
  shape = true,
  iconPosition = "default",
  padding = "p-3",
  shadow = "shadow-md",
  border = "border",
  ...props
}) => {
  var butStyle = `${padding} ${shadow} ${border} flex items-center justify-center gap-2`;
  var colorStyle = ""; //bg-blue-500 hover:bg-blue-500/90 active:bg-blue-500/80
  var animation = "duration-300 transition-all";
  var shapeStyle = "blur-overlay";
  var position = "";

  if (shape) {
    shapeStyle = "rounded-md";
  }

  switch (color) {
    case "white":
      colorStyle =
        "bg-white hover:bg-gray-200/50 active:bg-white/90 disabled:bg-white";
      break;
    case "blue":
      colorStyle =
        "bg-blue-600 hover:bg-blue-500/80 active:bg-blue-500 disabled:bg-gray-200";
      break;

    default:
      break;
  }

  switch (iconPosition) {
    case "top":
      position = "flex-col";
      break;
    case "left":
      position = "flex-row";
      break;
    case "right":
      position = "flex-row-reverse";
      break;
    case "bottom":
      position = "flex-col-reverse";
      break;

    default:
      position = "flex-col";
      break;
  }

  return (
    <>
      <button
        {...props}
        className={[
          butStyle,
          colorStyle,
          animation,
          shapeStyle,
          props.className,
          position,
          "",
        ].join(" ")}
      >
        {icon && <span>{icon}</span>}
        {props.children}
      </button>
    </>
  );
};

export default Button;

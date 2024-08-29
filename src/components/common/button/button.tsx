import React, { ButtonHTMLAttributes } from "react";

type buttonProps = ButtonHTMLAttributes<HTMLButtonElement>;

interface ButtonProps extends buttonProps {
  icon?: React.ReactNode;
  color?: string;
  shape?: boolean;
  padding?: string;
}

const Button: React.FC<ButtonProps> = ({
  icon,
  color = "blur-overlay",
  shape = true,
  padding = "p-3",
  ...props
}) => {
  var butStyle = `${padding}`;
  var colorStyle = ""; //bg-blue-500 hover:bg-blue-500/90 active:bg-blue-500/80
  var animation = "duration-300 transition-all";
  var shapeStyle = "";
  if (shape) {
    shapeStyle = "rounded-md";
  }
  if (color) {
    colorStyle = color;
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
          "",
        ].join(" ")}
      >
        <span>{icon}</span>
        {props.children}
      </button>
    </>
  );
};

export default Button;

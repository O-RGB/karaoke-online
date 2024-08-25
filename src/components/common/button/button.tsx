import React, { ButtonHTMLAttributes } from "react";

type buttonProps = ButtonHTMLAttributes<HTMLButtonElement>;

interface ButtonProps extends buttonProps {
  icon?: React.ReactNode;
  color?: string;
  shape?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  icon,
  color,
  shape = true,
  ...props
}) => {
  const butStyle = "p-2";
  const colorStyle = "bg-blue-500 hover:bg-blue-500/90 active:bg-blue-500/80";
  const animation = "duration-300 transition-all";
  var shapeStyle = "";
  if (shape) {
    shapeStyle = "rounded-md";
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

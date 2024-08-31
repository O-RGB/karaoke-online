type ButtonProps = Partial<React.ButtonHTMLAttributes<HTMLButtonElement>> &
  CommonStyle &
  IconsProps;

type ColorType = "default" | "white" | "blue";
type IconPosition = "default" | "top" | "right" | "left" | "bottom";

interface CommonStyle {
  color?: ColorType;
  shape?: boolean;
  padding?: string;
  shadow?: string;
  border?: string;
}

interface IconsProps {
  icon?: React.ReactNode;
  iconPosition?: IconPosition;
}

interface IProgressBar {
  progress?: number;
  processing?: string;
  error?: string;
}

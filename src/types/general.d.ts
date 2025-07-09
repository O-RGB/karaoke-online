type ButtonProps = Partial<React.ButtonHTMLAttributes<HTMLButtonElement>> &
  CommonStyle &
  IconsProps;

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & CommonStyle;

type ColorType =
  | "default"
  | "white"
  | "blue"
  | "green"
  | "yellow"
  | "amber"
  | "red"
  | "gray";
type IconPosition = "default" | "top" | "right" | "left" | "bottom";

type ModalType =
  | "SOUNDFONT_MODEL"
  | "JOIN"
  | "SUPER_JOIN"
  | "MUSIC_STORE"
  | "ADD_MUSIC"
  | "WALLPAPER"
  | "LYRICS"
  | "SOUND_SETTING"
  | "SONG_LIST"
  | "DRIVE_SETTING"
  | "DISPLAY"
  | "DONATE"
  | "MIXER";

type InputBarLayout = "vertical" | "horizontal";
type SystemMode = "SYSTEM" | "DRIVE";
type TracklistFrom = "DRIVE" | "DRIVE_EXTHEME" | "EXTHEME" | "CUSTOM";

type ModalComponents = {
  [key in ModalType]?: React.ReactNode;
};

type ModalProps = {
  isOpen: boolean;
  onClose?: () => void;
  onOk?: () => void;
  okButtonProps?: ButtonProps;
  cancelProps?: ButtonProps;
  children?: React.ReactNode;
  title?: string;
  icons?: React.ReactNode;
  width?: number;
  maxWidth?: number;
  height?: number;
  footer?: React.ReactNode;
  cancelText?: string;
  okText?: string;
  closable?: boolean;
  removeFooter?: boolean;
  overFlow?: "overflow-hidden" | "overflow-auto";
  containerId?: string;
  modalClassName?: string;
  fitHeight?: boolean;
  index?: number;

  noMin?: boolean;
  noMove?: boolean;
  noResize?: boolean;
  noFull?: boolean;
  noMax?: boolean;

  onFocus?: boolean;
};

interface CommonStyle {
  color?: ColorType;
  shape?: boolean | string;
  padding?: boolean | string;
  shadow?: boolean | string;
  border?: boolean | string;
}

interface ListItem<TValue> {
  value: TValue;
  label?: string;
  key?: string;
  className?: string;
  render?: () => React.ReactNode;
}

interface IconsProps {
  icon?: React.ReactNode;
  iconPosition?: IconPosition;
}

interface IOptions<T = any> {
  label: string | React.ReactNode;
  value: string;
  render?: React.ReactNode;
  option?: T;
}

interface IProgressBar {
  title?: string;
  discription?: string;
  progress?: number;
  processing?: string;
  error?: string;
  show?: boolean;
  loading?: boolean;
  cancel?: boolean;
}

interface MapContextMenu {
  render: React.ReactNode;
  modalProps?: ModalProps;
  contextProps?: IContextMenuItem;
}

interface IContextMenuGroup<T = any> {
  contextMenus: IContextMenuItem<T>[];
  name?: string;
  icon?: React.ReactNode;
}
interface IContextMenuItem<T = any> {
  onClick?: (type: T, title: string) => void;
  type: T;
  text: string;
  icon?: React.ReactNode;
  submanu?: IContextMenuItem[];
}

interface ContextMenuProps<T = any> {
  children?: React.ReactNode;
  items?: IContextMenuItem<T>[];
}

interface INotification {
  id: number;
  text: string;
}

interface RangeBarProps extends InputProps {
  layout?: InputBarLayout;

  min?: number;
  max?: number;
  defaultValue?: number;
  value?: number;
  onChange?: (value: number) => void;
  // inputProps?: InputProps;

  onMouseUp?: () => void;
  onTouchEnd?: () => void;
}

interface IndexedDbInput {
  id: string;
  value: any;
}
interface IndexedDbReslut<T> {
  value: T;
}

interface INotificationValue {
  text: string;
  icon?: React.ReactNode;
  delay?: number;
}

interface TabProps {
  icon?: React.ReactNode;
  label: string;
  content: React.ReactNode;
}

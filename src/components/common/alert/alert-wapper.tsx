import React, { cloneElement, useState } from "react";
import AlertDialog, { AlertDialogProps } from ".";

interface AlertWapperProps {
  children?: React.ReactNode;
}

const AlertWapper: React.FC<AlertWapperProps> = ({ children }) => {
  const [props, setProps] = useState<AlertDialogProps>();

  const setAlert = (props: AlertDialogProps) =>
    setProps({ ...props, open: props.open === undefined ? true : props.open });

  const closeAlert = () => {
    setProps({ open: false });
  };

  const clone = React.isValidElement(children)
    ? cloneElement(
        children as React.ReactElement<{
          setAlert?: (props: AlertDialogProps) => void;
          closeAlert?: () => void;
        }>,
        { setAlert, closeAlert }
      )
    : children;

  return (
    <div>
      <AlertDialog {...props} />
      {clone}
    </div>
  );
};

export default AlertWapper;

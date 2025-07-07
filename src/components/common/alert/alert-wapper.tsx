import React, { cloneElement, useState } from "react";
import AlertDialog, { AlertDialogProps } from "./notification";
import ProcessingDialog, { ProcessingDialogProps } from "./processing";
import { IAlertCommon } from "./types/alert.type";

interface AlertWapperProps {
  children?: React.ReactNode;
}

const AlertWapper: React.FC<AlertWapperProps> = ({ children }) => {
  const [alertProps, setAlertProps] = useState<AlertDialogProps>();
  const [processingProps, setProcessingProps] =
    useState<ProcessingDialogProps>();

  const setAlert = (props: AlertDialogProps) =>
    setAlertProps({
      ...props,
      open: props.open !== undefined ? props.open : true,
      onCancel: closeAlert,
      onOk: props.onOk ? props.onOk : closeAlert,
    });

  const closeAlert = () => {
    setAlertProps({ open: false });
  };

  const setProcessing = (props: ProcessingDialogProps) => {
    setProcessingProps({
      ...props,
      isOpen: props.isOpen !== undefined ? props.isOpen : true,
      onClose: props.onClose ? props.onClose : closeProcessing,
      onCancel: props.onClose ? props.onClose : props.onCancel,
    });
  };

  const closeProcessing = () => {
    setProcessingProps({ isOpen: false });
  };

  const cloned = React.isValidElement(children)
    ? cloneElement(children as React.ReactElement<IAlertCommon>, {
        setAlert,
        closeAlert,
        setProcessing,
        closeProcessing,
      })
    : children;

  return (
    <div className="w-full h-full">
      {cloned}
      <AlertDialog {...alertProps} />
      <ProcessingDialog {...processingProps} />
    </div>
  );
};

export default AlertWapper;

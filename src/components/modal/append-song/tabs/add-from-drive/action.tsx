import Button from "@/components/common/button/button";
import Input from "@/components/common/input-data/input";
import Label from "@/components/common/label";

import React, { useEffect, useState } from "react";
import { FaCheck } from "react-icons/fa";

interface DriveActionProps {
  title?: string;
  onSaveButton?: string;
  onSavedButton?: string;
  buttonProps?: ButtonProps;
  inputProps?: InputProps;
  onSave?: (value: string) => Promise<boolean>;
  ok?: boolean;
}

const DriveAction: React.FC<DriveActionProps> = ({
  title,
  onSave,
  onSaveButton = "บันทึก",
  onSavedButton = "บันทึกแล้ว",
  buttonProps,
  inputProps,
  ok = false,
}) => {
  const [value, setValue] = useState<string>("");
  const [isOk, setIsOk] = useState<boolean>(false);

  const handleOnSave = async () => {
    if (value) {
      const res = await onSave?.(value);
      setIsOk(res ?? false);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setValue(value);
    setIsOk(false);
  };
  useEffect(() => {
    if (inputProps?.value) {
      setValue(`${inputProps?.value}`);
    }
  }, [inputProps?.value]);

  useEffect(() => {
    setIsOk(ok);
  }, [ok]);

  return (
    <div>
      <Label>{title}</Label>
      <div className="flex justify-end gap-2 w-full py-1">
        <Input
          {...inputProps}
          value={value}
          className="w-full !text-black border border-blue-500 text-sm p-2"
          onChange={handleChange}
        ></Input>

        <Button
          {...buttonProps}
          icon={
            isOk ? (
              <FaCheck className="text-white"></FaCheck>
            ) : (
              buttonProps?.icon
            )
          }
          blur={false}
          disabled={value ? value.length === 0 : true}
          color={isOk ? "green" : "blue"}
          padding={"p-1 px-3"}
          iconPosition="left"
          className="text-white text-nowrap w-40"
          onClick={handleOnSave}
        >
          {onSavedButton ? (isOk ? onSavedButton : onSaveButton) : onSaveButton}
        </Button>
      </div>
    </div>
  );
};

export default DriveAction;

import React, { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

interface UpdateFileProps {
  onSelectFile?: (file: File) => void;
  accept?: string;
  label?: string;
  className?: string;
  inputProps?: InputProps;
}

const UpdateFile: React.FC<UpdateFileProps> = ({
  onSelectFile,
  accept,
  label,
  className,
  inputProps,
}) => {
  const selectFileHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    const target = event.target;
    if (target.files && target.files[0]) {
      onSelectFile?.(target.files[0]);
    }
  };

  return (
    <div className={className}>
      <label>{label}</label>
      <div>
        <input
          {...inputProps}
          onChange={selectFileHandler}
          type="file"
          id="midi_input"
          accept={accept}
        />
      </div>
    </div>
  );
};

export default UpdateFile;

import React from "react";

interface ColorPickerProps {
  value?: string;
  onChange?: (color: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ value, onChange }) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedColor = event.target.value;
    onChange?.(selectedColor);
  };

  return (
    <div>
      <input
        className="cursor-pointer"
        type="color"
        id="favcolor"
        value={value}
        onChange={handleChange}
        style={{
          margin: 0,
          padding: 0,
        }}
      />
    </div>
  );
};

export default ColorPicker;

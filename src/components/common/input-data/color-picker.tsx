import React from "react";

interface ColorPickerProps {
  value?: string; // ค่าสีที่เลือก
  onChange?: (color: string) => void; // ฟังก์ชันที่จะเรียกเมื่อมีการเปลี่ยนแปลงสี
}

const ColorPicker: React.FC<ColorPickerProps> = ({ value, onChange }) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedColor = event.target.value; // ดึงค่าสีที่เลือก
    onChange?.(selectedColor); // เรียกฟังก์ชัน onChange
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

import React from "react";

interface DonateModalProps {}

const DonateModal: React.FC<DonateModalProps> = ({}) => {
  return (
    <>
      <div className="text-center mb-6">
        <h2 className="text-lg lg:text-2xl font-bold text-gray-800">
          ช่วยสนับสนุนเรา
        </h2>
        <p className="text-base lg:text-lg text-gray-600">
          ทุกการสนับสนุนของคุณช่วยให้นักพัฒนามีกำลังใจและพัฒนาโปรเจกต์ให้ดียิ่งขึ้น
        </p>
      </div>
      <div className="w-full flex items-center justify-center mb-4">
        <img
          src="/IMG_0405.JPG"
          className="max-h-[300px] lg:max-h-[400px] border-2 border-gray-200 rounded-lg shadow-lg"
          alt="Donate QR Code"
        />
      </div>
      <p className="text-center text-gray-500">
        สแกน QR Code เพื่อบริจาค ขอบคุณสำหรับการสนับสนุนของคุณ!
      </p>
    </>
  );
};

export default DonateModal;

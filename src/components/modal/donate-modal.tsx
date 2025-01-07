import React from "react";
import { BiHeart } from "react-icons/bi";

interface DonateModalProps {}

const DonateModal: React.FC<DonateModalProps> = () => {
  const donors = [
    {
      name: "Chawalit Srisont",
      amount: 200,
    },
    {
      name: "วินัย บุญเรืองสนิท",
      amount: 100,
    },
    {
      name: "Sri Modify",
      amount: 100,
    },
    {
      name: "Pook Kittipan Khanteemok",
      amount: 100,
    },
    {
      name: "ไม่ระบุชื่อ",
      amount: 100,
    },
    {
      name: "ไม่ระบุชื่อ",
      amount: 99,
    },
  ];

  return (
    <div className="">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          ช่วยสนับสนุนเรา
        </h2>
        <p className="text-lg text-gray-600">
          ทุกการสนับสนุนของคุณช่วยให้นักพัฒนามีกำลังใจและพัฒนาโปรเจกต์ให้ดียิ่งขึ้น
        </p>
      </div>

      <div className="flex flex-col-reverse md:flex-row  items-center justify-center gap-6">
        <div className="bg-white rounded-lg shadow-lg p-4 w-fit">
          <img
            src="/IMG_0405.JPG"
            className="max-h-[350px] rounded-lg"
            alt="Donate QR Code"
          />
        </div>

        <div className="bg-white rounded-lg shadow-lg p-2 px-3">
          <div className="flex flex-col justify-center items-center mb-2">
            <div className="flex items-center justify-center gap-2">
              <BiHeart className="w-5 h-5 text-red-500" />
              <h3 className="text-lg font-bold text-gray-800">ผู้สนับสนุน</h3>
            </div>
            <div className="text-xs text-gray-400">มกราคม 2568</div>
          </div>
          <div className="space-y-3">
            {donors.map((donor, index) => (
              <div
                key={index}
                className="flex flex-row justify-between bg-gray-50 rounded-lg transition-all duration-200 hover:bg-gray-100 p-1.5"
              >
                <div className="flex items-center  gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="font-semibold text-gray-800">
                    {donor.name}
                  </span>
                </div>
                <div className="ml-4 text-green-600 font-semibold">
                  {donor.amount.toLocaleString()} บาท
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="text-center text-gray-500 mt-6">
        สแกน QR Code เพื่อบริจาค ขอบคุณสำหรับการสนับสนุนของคุณ!
      </p>
    </div>
  );
};

export default DonateModal;

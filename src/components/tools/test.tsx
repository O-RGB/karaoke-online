import { useEffect, useState } from 'react';

const useOrientation = () => {
  const [orientation, setOrientation] = useState<"landscape" | "portrait" | null>(null); // ประกาศชนิดให้ชัดเจน
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // ฟังก์ชันในการตรวจสอบว่าเป็นอุปกรณ์มือถือหรือไม่
    const checkIsMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const mobileDevices = /iphone|ipad|ipod|android|blackberry|iemobile|opera mini|mobile/;
      setIsMobile(mobileDevices.test(userAgent));
    };

    const handleResize = () => {
      if (isMobile) {
        setOrientation(window.innerWidth > window.innerHeight ? 'landscape' : 'portrait');
      } else {
        setOrientation(null); // ถ้าไม่ใช่มือถือให้รีเซ็ตสถานะ
      }
    };

    checkIsMobile(); // ตรวจสอบว่าเป็นมือถือเมื่อโหลด
    handleResize(); // เรียกใช้งานครั้งแรก

    window.addEventListener('resize', handleResize);

    // Clean up event listener on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isMobile]);

  return orientation;
};

export default useOrientation;

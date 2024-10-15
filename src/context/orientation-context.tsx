"use client";
import { useAppControl } from "@/hooks/app-control-hook";
import useMixerStore from "@/stores/mixer-store";
import { createContext, FC, useEffect, useState } from "react";
type Orientation = "landscape" | "portrait" | null;

type OrientationContextType = {
  orientation: Orientation | null;
};

type OrientationProviderProps = {
  children: React.ReactNode;
};

export const OrientationContext = createContext<OrientationContextType>({
  orientation: null,
});

export const OrientationProvider: FC<OrientationProviderProps> = ({
  children,
}) => {
  const setHideMixer = useMixerStore((state) => state.setHideMixer);
  const [orientation, setOrientation] = useState<Orientation>(null);
  const [isMobile, setIsMobile] = useState(false);

  const onLandScape = () => {
    setHideMixer(true);
  };
  const onPortrait = () => {};

  useEffect(() => {
    const checkIsMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const mobileDevices =
        /iphone|ipad|ipod|android|blackberry|iemobile|opera mini|mobile/;
      setIsMobile(mobileDevices.test(userAgent));
    };

    const handleResize = () => {
      if (isMobile) {
        const init =
          window.innerWidth > window.innerHeight ? "landscape" : "portrait";
        if (init === "landscape") {
          onLandScape();
        } else {
          onPortrait();
        }
        setOrientation(init);
      } else {
        setOrientation(null); // ถ้าไม่ใช่มือถือให้รีเซ็ตสถานะ
      }
    };

    checkIsMobile(); // ตรวจสอบว่าเป็นมือถือเมื่อโหลด
    handleResize(); // เรียกใช้งานครั้งแรก

    window.addEventListener("resize", handleResize);

    // Clean up event listener on unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isMobile]);

  return (
    <OrientationContext.Provider value={{ orientation }}>
      {children}
    </OrientationContext.Provider>
  );
};

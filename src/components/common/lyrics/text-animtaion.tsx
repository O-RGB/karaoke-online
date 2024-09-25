// components/TextAnimation.tsx

import { useEffect, useRef } from "react";
import anime from "animejs";

interface TextAnimationProps {
  show: boolean;
  text: string;
}

const TextAnimation: React.FC<TextAnimationProps> = ({ show, text }) => {
  const textRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (show) {
      // ถ้า show เป็น true ให้แสดงข้อความ
      if (textRef.current) {
        // textRef.current.style.opacity = "0"; // ตั้งค่า opacity เป็น 0 ก่อน
        // textRef.current.style.display = "block"; // แสดงข้อความ
        anime
          .timeline()
          .add({
            targets: textRef.current.children,
            scale: [4, 1],
            opacity: [0, 1],
            translateZ: 0,
            easing: "easeOutExpo",
            duration: 950,
            delay: (el, i) => 70 * i,
          })
          .add({
            targets: textRef.current.children,
            opacity: 0,
            duration: 1000,
            easing: "easeOutExpo",
            delay: 1000,
          });
      }
    } else {
      // ถ้า show เป็น false ให้ซ่อนข้อความ
      if (textRef.current) {
        anime({
          targets: textRef.current,
          opacity: 0,
          duration: 1000,
          easing: "easeInOutQuad",
          complete: () => {
            if (textRef.current) {
              textRef.current.style.display = "none"; // ซ่อนข้อความหลังจากอนิเมชัน
            }
          },
        });
      }
    }
  }, [show]);

  return (
    <div className="text-4xl font-bold text-white" ref={textRef}>
      {text.split("").map((char, index) => (
        <span key={index} className="inline-block">
          {char}
        </span>
      ))}
    </div>
  );
};

export default TextAnimation;

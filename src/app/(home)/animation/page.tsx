"use client";
import Button from "@/components/common/button/button";
import TextAnimation from "@/components/common/lyrics/text-animtaion";

import React, { useState } from "react";

interface AnimationProps {}

const Animation: React.FC<AnimationProps> = ({}) => {
  const [show, setShow] = useState<boolean>();
  const [color, setColor] = useState<string>("#dc3444");

  return (
    <>
      <Button onClick={() => setShow((value) => !value)}>Show</Button>
      <Button
        onClick={() =>
          setColor(
            "#" +
              (((1 << 24) * Math.random()) | 0).toString(16).padStart(6, "0")
          )
        }
      >
        color
      </Button>
      <div className="flex justify-center items-center h-screen bg-blue-300">
        <div className="relative">
          <div
            className={`absolute bg-red-300 h-20 w-full ${
              show ? "translate-x-8" : "translate-x-0"
            } duration-300 transition-all`}
          ></div>
          <div className="text-5xl relative">
            <div
              className="absolute bg-blue-300 w-full h-full"
              style={{ clipPath: "inset(0 0 0 0)" }}
            ></div>
            <span className="relative z-10">ฐ</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Animation;

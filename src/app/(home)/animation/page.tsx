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
      <div className="flex justify-center items-center h-screen">
        <br />
        <TextAnimation
          color={color}
          show={show}
          text="เอิ้นอ้ายแหน่เด้อยามเธอมีแฮง"
        ></TextAnimation>
      </div>
    </>
  );
};

export default Animation;

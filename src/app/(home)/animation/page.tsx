"use client";
import Button from "@/components/common/button/button";
import TextAnimation from "@/components/common/lyrics/text-animtaion";

import React, { useEffect, useState } from "react";

interface AnimationProps {}

const Animation: React.FC<AnimationProps> = ({}) => {
  const [show, setShow] = useState<boolean>(false);

  //   useEffect(() => {
  //     setTimeout(() => {
  //       setShow(true);
  //     }, 1000);
  //   }, []);
  return (
    <div className="flex justify-center items-center h-screen">
      <Button onClick={() => setShow((value) => !value)}>Show</Button>
      <TextAnimation
        show={show}
        text="test iwejgoawiegj oawiehgoawieghow"
      ></TextAnimation>
    </div>
  );
};

export default Animation;

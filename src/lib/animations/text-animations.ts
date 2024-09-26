// animations.ts
import anime from "animejs";

type TextElement = React.RefObject<HTMLDivElement>;

const SPEED_IN = 500;
const SPEED_OUT = 500;
const OF_LETTER = 40;

// TEXT

// ANIMATION IN
export const animateCharactersIn = (
  textRef: TextElement,
  speed: number = SPEED_IN
) => {
  if (textRef.current) {
    anime({
      targets: textRef.current.children,
      opacity: [0, 1],
      scale: [0.8, 1],
      // delay: anime.stagger(OF_LETTER),
      easing: "easeOutExpo",
      duration: speed,
    });
  }
};

export const animateScaleIn = (
  textRef: React.RefObject<HTMLDivElement>,
  speed: number = SPEED_IN
) => {
  if (textRef.current) {
    anime.timeline().add({
      targets: textRef.current.children,
      scale: [4, 1],
      opacity: [0, 1],
      translateZ: 0,
      easing: "easeOutExpo",
      duration: speed,
      // delay: (el, i) => OF_LETTER * i,
    });
  }
};

export const animateWaveIn = (
  textRef: TextElement,
  speed: number = SPEED_IN
) => {
  if (textRef.current) {
    anime({
      targets: textRef.current.children,
      opacity: [0, 1],
      translateY: [1, 0],
      translateX: [0.8, 0],
      translateZ: 0,
      rotateZ: [180, 0],
      duration: speed,
      easing: "easeOutExpo",
      // delay: (el, i) => OF_LETTER * i,
    });
  }
};

export const animateRotateIn = (
  textRef: TextElement,
  speed: number = SPEED_IN
) => {
  if (textRef.current) {
    anime({
      opacity: [0, 1],
      targets: textRef.current.children,
      rotateY: [-90, 0],
      duration: speed,
      easing: "easeOutExpo",
      // delay: (el, i) => OF_LETTER * i,
    });
  }
};

export const animateBounceIn = (
  textRef: TextElement,
  speed: number = SPEED_IN
) => {
  if (textRef.current) {
    anime({
      opacity: [0, 1],
      targets: textRef.current.children,
      translateY: ["-1em", 0],
      duration: speed,
      easing: "spring(1, 80, 10, 0)",
      // delay: (el, i) => OF_LETTER * i,
    });
  }
};

export const animateTypewriter = (
  textRef: TextElement,
  speed: number = SPEED_IN
) => {
  if (textRef.current) {
    anime({
      targets: textRef.current.children,
      opacity: [0, 1],
      duration: speed,
      easing: "easeInOutQuad",
      // delay: (el, i) => OF_LETTER * (i + 1),
    });
  }
};

export const animateRainbowIn = (
  textRef: TextElement,
  speed: number = SPEED_IN
) => {
  if (textRef.current) {
    anime({
      targets: textRef.current.children,
      rotateZ: [75, 0],
      translateY: [40, 0],
      opacity: [0, 1],
      easing: "easeOutExpo",
      duration: speed,
      // delay: (el, i) => OF_LETTER * i,
    });
  }
};

export const animateFadeFromBottom = (
  textRef: TextElement,
  speed: number = SPEED_IN
) => {
  if (textRef.current) {
    anime({
      targets: textRef.current.children,
      translateY: [100, 0],
      opacity: [0, 1],
      easing: "easeOutExpo",
      duration: speed,
      // delay: (el, i) => OF_LETTER * i,
    });
  }
};

// ANIMATION OUT
export const animateCharactersOut = (
  textRef: TextElement,
  speed: number = SPEED_OUT
) => {
  if (textRef.current) {
    anime({
      targets: textRef.current.children,
      opacity: [1, 0],
      easing: "easeInExpo",
      duration: speed,
    });
  }
};

export const animateScaleOut = (
  textRef: TextElement,
  speed: number = SPEED_OUT
) => {
  if (textRef.current) {
    anime({
      targets: textRef.current.children,
      scale: [1, 0],
      opacity: [1, 0],
      easing: "easeInExpo",
      duration: speed,
      delay: (el, i) => OF_LETTER * i,
    });
  }
};

//CAMERA
export const zoomIn = (textRef: TextElement, speed: number = 10000) => {
  if (textRef.current) {
    anime({
      targets: textRef.current,
      scale: [0.8, 1],
      easing: "easeOutExpo",
      duration: speed,
    });
  }
};

export const panRight = (textRef: TextElement, speed: number = 10000) => {
  if (textRef.current) {
    anime({
      targets: textRef.current,
      translateX: ["-5%", "5%"],
      easing: "easeOutExpo",
      duration: speed,
    });
  }
};

export const panLeft = (textRef: TextElement, speed: number = 10000) => {
  if (textRef.current) {
    anime({
      targets: textRef.current,
      translateX: ["5%", "-5%"],
      easing: "easeOutExpo",
      duration: speed,
    });
  }
};

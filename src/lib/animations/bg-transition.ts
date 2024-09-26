import anime from "animejs";

export const circleTransition = (
  svgRef: SVGSVGElement,
  targetColor: string,
  onComplete: () => void
) => {
  const svgNS = "http://www.w3.org/2000/svg";
  const circle = document.createElementNS(svgNS, "circle");
  const width = window.innerWidth;
  const height = window.innerHeight;
  const centerX = width / 2;
  const centerY = height / 2;
  const maxRadius = Math.sqrt(width * width + height * height) / 2;

  circle.setAttribute("cx", centerX.toString());
  circle.setAttribute("cy", centerY.toString());
  circle.setAttribute("r", "0");
  circle.setAttribute("fill", targetColor);

  svgRef.appendChild(circle);

  anime({
    targets: circle,
    r: [0, maxRadius],
    easing: "easeInOutQuad",
    duration: 700,
    complete: () => {
      onComplete();
    },
  });
};

export const topToBottomTransition = (
  overlayRef: HTMLDivElement,
  targetColor: string,
  onComplete: () => void
) => {
  overlayRef.style.position = "absolute";
  overlayRef.style.top = "0";
  overlayRef.style.left = "0";
  overlayRef.style.width = "100%";
  overlayRef.style.height = "0";
  overlayRef.style.backgroundColor = targetColor;

  anime({
    targets: overlayRef,
    height: "100%",
    duration: 700,
    easing: "easeInOutQuad",
    complete: () => {
      overlayRef.style.height = "100%";
      onComplete();
    },
  });
};

export const leftToRightTransition = (
  overlayRef: HTMLDivElement,
  targetColor: string,
  onComplete: () => void
) => {
  overlayRef.style.position = "absolute";
  overlayRef.style.top = "0";
  overlayRef.style.left = "0";
  overlayRef.style.width = "0";
  overlayRef.style.height = "100%";
  overlayRef.style.backgroundColor = targetColor;

  anime({
    targets: overlayRef,
    width: "100%",
    duration: 700,
    easing: "easeInOutQuad",
    complete: () => {
      overlayRef.style.width = "100%";
      onComplete();
    },
  });
};

export const diagonalTransition = (
  overlayRef: HTMLDivElement,
  targetColor: string,
  onComplete: () => void
) => {
  overlayRef.style.position = "absolute";
  overlayRef.style.top = "0";
  overlayRef.style.left = "0";
  overlayRef.style.width = "0";
  overlayRef.style.height = "0";
  overlayRef.style.backgroundColor = targetColor;

  anime({
    targets: overlayRef,
    width: ["0%", "100%"],
    height: ["0%", "100%"],
    easing: "easeInOutQuad",
    duration: 700,
    complete: () => {
      overlayRef.style.width = "100%";
      overlayRef.style.height = "100%";
      onComplete();
    },
  });
};

export const radialExpansionTransition = (
  overlayRef: HTMLDivElement,
  targetColor: string,
  onComplete: () => void
) => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const maxRadius = Math.sqrt(width * width + height * height) / 2;

  overlayRef.style.position = "absolute";
  overlayRef.style.top = "50%";
  overlayRef.style.left = "50%";
  overlayRef.style.width = "0";
  overlayRef.style.height = "0";
  overlayRef.style.borderRadius = "50%";
  overlayRef.style.backgroundColor = targetColor;
  overlayRef.style.transform = "translate(-50%, -50%)";

  anime({
    targets: overlayRef,
    width: [0, maxRadius * 2],
    height: [0, maxRadius * 2],
    easing: "easeInOutQuad",
    duration: 700,
    complete: () => {
      onComplete();
    },
  });
};

export const fadeOutRotateTransition = (
  overlayRef: HTMLDivElement,
  targetColor: string,
  onComplete: () => void
) => {
  overlayRef.style.position = "absolute";
  overlayRef.style.top = "0";
  overlayRef.style.left = "0";
  overlayRef.style.width = "100%";
  overlayRef.style.height = "100%";
  overlayRef.style.backgroundColor = targetColor;
  overlayRef.style.transform = "rotate(0deg)";

  anime({
    targets: overlayRef,
    opacity: [1, 0],
    rotate: "360deg",
    easing: "easeInOutQuad",
    duration: 700,
    complete: () => {
      overlayRef.style.opacity = "0";
      overlayRef.style.transform = "none";
      onComplete();
    },
  });
};

export const waveTransition = (
  overlayRef: HTMLDivElement,
  targetColor: string,
  onComplete: () => void
) => {
  const width = window.innerWidth;
  const height = window.innerHeight;

  overlayRef.style.position = "absolute";
  overlayRef.style.top = "0";
  overlayRef.style.left = "0";
  overlayRef.style.width = `${width}px`;
  overlayRef.style.height = `${height}px`;
  overlayRef.style.backgroundColor = "transparent";

  const numberOfWaves = 5;
  const waveElements: HTMLDivElement[] = [];

  for (let i = 0; i < numberOfWaves; i++) {
    const wave = document.createElement("div");
    wave.style.position = "absolute";
    wave.style.bottom = "0";
    wave.style.left = "0";
    wave.style.width = "100%";
    wave.style.height = "0";
    wave.style.backgroundColor = targetColor;
    overlayRef.appendChild(wave);
    waveElements.push(wave);
  }

  anime({
    targets: waveElements,
    height: height,
    delay: anime.stagger(100),
    duration: 800,
    easing: "easeInOutSine",
    complete: () => {
      onComplete();
    },
  });
};

export const spiralTransition = (
  overlayRef: HTMLDivElement,
  targetColor: string,
  onComplete: () => void
) => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const centerX = width / 2;
  const centerY = height / 2;

  overlayRef.style.position = "absolute";
  overlayRef.style.top = "0";
  overlayRef.style.left = "0";
  overlayRef.style.width = `${width}px`;
  overlayRef.style.height = `${height}px`;
  overlayRef.style.backgroundColor = "transparent";

  const numberOfSpirals = 4;
  const spiralElements: HTMLDivElement[] = [];

  for (let i = 0; i < numberOfSpirals; i++) {
    const spiral = document.createElement("div");
    spiral.style.position = "absolute";
    spiral.style.top = `${centerY}px`;
    spiral.style.left = `${centerX}px`;
    spiral.style.width = "0";
    spiral.style.height = "0";
    spiral.style.backgroundColor = targetColor;
    spiral.style.borderRadius = "50%";
    spiral.style.transform = `rotate(${i * 90}deg)`;
    overlayRef.appendChild(spiral);
    spiralElements.push(spiral);
  }

  anime({
    targets: spiralElements,
    width: Math.max(width, height) * 2,
    height: Math.max(width, height) * 2,
    top: anime.stagger(centerY - Math.max(width, height), { start: centerY }),
    left: anime.stagger(centerX - Math.max(width, height), { start: centerX }),
    duration: 1000,
    easing: "easeInOutQuad",
    complete: () => {
      onComplete();
    },
  });
};
